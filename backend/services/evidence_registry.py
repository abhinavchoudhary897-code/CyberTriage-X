from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from services.acquisition import UPLOAD_DIR, calculate_hashes


REGISTRY_FILE = UPLOAD_DIR / "evidence_registry.json"


def _load_registry() -> list[dict[str, Any]]:
    if not REGISTRY_FILE.exists():
        return []

    try:
        data = json.loads(
            REGISTRY_FILE.read_text(
                encoding="utf-8"
            )
        )

        if isinstance(data, list):
            return data

        return []
    except Exception:
        return []


def _save_registry(
    records: list[dict[str, Any]]
) -> None:
    REGISTRY_FILE.write_text(
        json.dumps(
            records,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )


def register_evidence(
    evidence: dict[str, Any]
) -> dict[str, Any]:
    records = _load_registry()

    evidence_id = evidence.get(
        "evidence_id"
    )

    if not evidence_id:
        return evidence

    existing_index = next(
        (
            index
            for index, record in enumerate(records)
            if record.get("evidence_id")
            == evidence_id
        ),
        None,
    )

    if existing_index is None:
        records.append(evidence)
    else:
        records[existing_index] = {
            **records[existing_index],
            **evidence,
        }

    _save_registry(records)

    return evidence


def get_all_evidence() -> list[dict[str, Any]]:
    return _load_registry()


def get_evidence(
    evidence_id: str,
) -> dict[str, Any] | None:
    records = _load_registry()

    for record in records:
        if record.get("evidence_id") == evidence_id:
            return record

    return None


def remove_evidence(
    evidence_id: str,
) -> bool:
    records = _load_registry()

    updated_records = [
        record
        for record in records
        if record.get("evidence_id")
        != evidence_id
    ]

    if len(updated_records) == len(records):
        return False

    _save_registry(updated_records)

    return True


def rebuild_registry_from_vault() -> list[dict[str, Any]]:
    records = []

    for evidence_file in sorted(
        UPLOAD_DIR.iterdir()
    ):
        if not evidence_file.is_file():
            continue

        if evidence_file.name == REGISTRY_FILE.name:
            continue

        if not evidence_file.name.startswith(
            "EVD-"
        ):
            continue

        evidence_id = evidence_file.stem

        try:
            md5, sha256 = calculate_hashes(
                evidence_file
            )

            stat = evidence_file.stat()

            record = {
                "evidence_id": evidence_id,
                "stored_filename": evidence_file.name,
                "original_filename": evidence_file.name,
                "size_bytes": stat.st_size,
                "extension": (
                    evidence_file.suffix.lower()
                    or "NONE"
                ),
                "md5": md5,
                "sha256": sha256,
                "storage": "LOCAL FORENSIC VAULT",
                "processing_status": "ACQUIRED",
                "integrity_status": "VERIFIED",
            }

            records.append(record)

        except Exception:
            continue

    _save_registry(records)

    return records