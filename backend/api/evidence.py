from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from services.acquisition import (
    UPLOAD_DIR,
    acquire_evidence,
    calculate_hashes,
    verify_evidence_integrity,
)

from services.correlator import correlate_evidence

from services.extractor import analyze_text_evidence

from services.risk_engine import analyze_intelligence

from services.timeline import build_timeline

from services.investigation import build_investigation

from services.report import build_report

from services.evidence_registry import (
    get_all_evidence,
    get_evidence,
    register_evidence,
    rebuild_registry_from_vault,
)


router = APIRouter(
    prefix="/api/evidence",
    tags=["Evidence Acquisition"],
)


# =========================================================
# CONFIGURATION
# =========================================================

MAX_FILE_SIZE = 100 * 1024 * 1024


TEXT_EXTENSIONS = {
    ".txt",
    ".log",
    ".csv",
    ".json",
    ".xml",
}


SUPPORTED_EXTENSIONS = {
    ".txt",
    ".log",
    ".csv",
    ".json",
    ".xml",
    ".pcap",
    ".pcapng",
    ".evtx",
    ".zip",
    ".tar",
    ".gz",
    ".7z",
    ".rar",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".pdf",
    ".doc",
    ".docx",
    ".xlsx",
    ".db",
    ".sqlite",
    ".sqlite3",
    ".raw",
    ".dd",
    ".img",
    ".dmp",
}


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def clean_filename(filename: str) -> str:
    """
    Safely normalize an uploaded filename.
    """

    cleaned = Path(filename).name.strip()

    cleaned = cleaned.replace(
        "\x00",
        "_",
    )

    return cleaned or "unnamed_evidence"


def find_evidence_file(
    evidence_id: str,
) -> Path:
    """
    Locate an evidence artifact inside
    the local forensic vault.
    """

    files = list(
        UPLOAD_DIR.glob(
            f"{evidence_id}.*"
        )
    )

    if not files:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Evidence artifact not found: "
                f"{evidence_id}"
            ),
        )

    return files[0]


def validate_text_evidence(
    evidence_file: Path,
    evidence_id: str,
    operation: str,
) -> None:
    """
    Ensure the evidence format is currently
    supported by the text analysis engine.
    """

    extension = evidence_file.suffix.lower()

    if extension not in TEXT_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Evidence {evidence_id} is not "
                f"currently supported for {operation}. "
                "Supported formats: .txt, .log, "
                ".csv, .json and .xml."
            ),
        )


def process_evidence_ids(
    evidence_ids: list[str],
) -> list[dict]:
    """
    Locate and analyze multiple evidence artifacts.
    """

    if not evidence_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one evidence ID is required.",
        )

    results: list[dict] = []

    for evidence_id in evidence_ids:

        evidence_file = find_evidence_file(
            evidence_id
        )

        validate_text_evidence(
            evidence_file,
            evidence_id,
            "analysis",
        )

        try:
            result = analyze_text_evidence(
                file_path=evidence_file,
                evidence_id=evidence_id,
            )

            results.append(result)

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Evidence analysis failed for "
                    f"{evidence_id}: {error}"
                ),
            ) from error

    return results


# =========================================================
# UPLOAD / ACQUIRE
# =========================================================

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="Acquire digital evidence",
)
async def upload_evidence(
    file: UploadFile = File(...),
):
    """
    Upload and acquire digital evidence.

    The acquired evidence is stored in the local
    forensic vault and its metadata is persisted
    in the evidence registry.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Evidence filename is required.",
        )

    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded evidence file is empty.",
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=(
                    "Evidence file exceeds "
                    "the 100 MB limit."
                ),
            )

        evidence = acquire_evidence(
            original_filename=clean_filename(
                file.filename
            ),
            file_content=content,
        )

        # Persist evidence metadata.
        register_evidence(evidence)

        return {
            "success": True,
            "message": "Evidence acquired successfully.",
            "pipeline": {
                "current_stage": "ACQUIRE",
                "next_stage": "CLASSIFY",
            },
            "evidence": evidence,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Evidence acquisition failed: "
                f"{error}"
            ),
        ) from error

    finally:
        await file.close()


# =========================================================
# EVIDENCE REGISTRY
# =========================================================

@router.get(
    "/registry",
    summary="List registered evidence",
)
def list_registered_evidence():
    """
    Return all evidence registered in the
    persistent forensic registry.
    """

    records = get_all_evidence()

    return {
        "success": True,
        "stage": "EVIDENCE",
        "registry": {
            "total": len(records),
            "storage": "LOCAL FORENSIC VAULT",
        },
        "evidence": records,
    }


@router.get(
    "/registry/{evidence_id}",
    summary="Get registered evidence metadata",
)
def get_registered_evidence(
    evidence_id: str,
):
    """
    Return metadata for one registered evidence item.
    """

    record = get_evidence(
        evidence_id
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Evidence is not registered: "
                f"{evidence_id}"
            ),
        )

    return {
        "success": True,
        "stage": "EVIDENCE",
        "evidence": record,
    }


@router.post(
    "/registry/rebuild",
    summary="Rebuild evidence registry from forensic vault",
)
def rebuild_evidence_registry():
    """
    Rebuild the registry by scanning all existing
    evidence artifacts in the forensic vault.
    """

    records = rebuild_registry_from_vault()

    return {
        "success": True,
        "message": (
            "Evidence registry rebuilt from "
            "the local forensic vault."
        ),
        "stage": "EVIDENCE",
        "registry": {
            "total": len(records),
            "storage": "LOCAL FORENSIC VAULT",
        },
        "evidence": records,
    }


# =========================================================
# SERVICE STATUS
# =========================================================

@router.get(
    "/status",
    summary="Evidence acquisition service status",
)
def evidence_service_status():
    """
    Return evidence acquisition service information.
    """

    records = get_all_evidence()

    return {
        "success": True,
        "service": "Forensic Evidence Acquisition",
        "status": "OPERATIONAL",
        "maximum_file_size": "100 MB",
        "integrity_algorithm": "SHA-256",
        "secondary_hash": "MD5",
        "acquisition_mode": "LOCAL FORENSIC VAULT",
        "storage_path": str(UPLOAD_DIR),
        "registered_evidence": len(records),
        "supported_extensions": sorted(
            SUPPORTED_EXTENSIONS
        ),
    }


# =========================================================
# VERIFY INTEGRITY
# =========================================================

@router.get(
    "/verify/{evidence_id}",
    summary="Verify evidence integrity",
)
def verify_evidence(
    evidence_id: str,
):
    """
    Verify the current artifact against the
    SHA-256 hash stored in the evidence registry.
    """

    evidence_file = find_evidence_file(
        evidence_id
    )

    try:
        # Retrieve the original registered metadata.
        registered_record = get_evidence(
            evidence_id
        )

        if registered_record is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Evidence is not registered: "
                    f"{evidence_id}"
                ),
            )

        expected_sha256 = registered_record.get(
            "sha256"
        )

        if not expected_sha256:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Registered evidence does not "
                    "contain a SHA-256 hash."
                ),
            )

        # Calculate the hash of the current artifact.
        _, current_sha256 = calculate_hashes(
            evidence_file
        )

        # Compare current artifact against
        # the originally registered hash.
        verification = verify_evidence_integrity(
            evidence_file,
            expected_sha256,
        )

        integrity_match = (
            current_sha256.lower()
            == expected_sha256.lower()
        )

        verification["expected_sha256"] = (
            expected_sha256
        )

        verification["current_sha256"] = (
            current_sha256
        )

        verification["hash_match"] = (
            integrity_match
        )

        verification["status"] = (
            "VERIFIED"
            if integrity_match
            else "COMPROMISED"
        )

        return {
            "success": True,
            "stage": "VERIFY",
            "evidence_id": evidence_id,
            "verification": verification,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Integrity verification failed: "
                f"{error}"
            ),
        ) from error


# =========================================================
# ARTIFACT INSPECTOR
# =========================================================

@router.get(
    "/artifact/{evidence_id}",
    summary="Inspect acquired evidence metadata",
)
def get_evidence_artifact(
    evidence_id: str,
):
    """
    Return physical artifact information from
    the local forensic vault.
    """

    evidence_file = find_evidence_file(
        evidence_id
    )

    stat = evidence_file.stat()

    registered_record = get_evidence(
        evidence_id
    )

    artifact = {
        "stored_filename": evidence_file.name,
        "size_bytes": stat.st_size,
        "extension": (
            evidence_file.suffix.lower()
            or "NONE"
        ),
        "storage": "LOCAL FORENSIC VAULT",
    }

    if registered_record:
        artifact["original_filename"] = (
            registered_record.get(
                "original_filename"
            )
        )

        artifact["sha256"] = (
            registered_record.get(
                "sha256"
            )
        )

        artifact["md5"] = (
            registered_record.get(
                "md5"
            )
        )

        artifact["processing_status"] = (
            registered_record.get(
                "processing_status"
            )
        )

        artifact["integrity_status"] = (
            registered_record.get(
                "integrity_status"
            )
        )

    return {
        "success": True,
        "evidence_id": evidence_id,
        "artifact": artifact,
    }


# =========================================================
# EXTRACT
# =========================================================

@router.get(
    "/extract/{evidence_id}",
    summary="Extract forensic indicators",
)
def extract_evidence(
    evidence_id: str,
):
    """
    Extract forensic indicators from one evidence item.
    """

    results = process_evidence_ids(
        [evidence_id]
    )

    result = results[0]

    result["pipeline"] = {
        "completed_stage": "EXTRACT",
        "previous_stage": "ACQUIRE",
        "next_stage": "CORRELATE",
    }

    return result


# =========================================================
# CORRELATE
# =========================================================

@router.post(
    "/correlate",
    summary="Correlate multiple evidence sources",
)
def correlate_evidence_sources(
    evidence_ids: list[str],
):
    """
    Correlate indicators across multiple evidence items.
    """

    if len(evidence_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "At least two evidence IDs are "
                "required for correlation."
            ),
        )

    extracted = process_evidence_ids(
        evidence_ids
    )

    result = correlate_evidence(
        evidence_items=extracted
    )

    result["pipeline"] = {
        "completed_stage": "CORRELATE",
        "previous_stage": "EXTRACT",
        "next_stage": "INTELLIGENCE",
    }

    return result


# =========================================================
# INTELLIGENCE / RISK
# =========================================================

@router.post(
    "/intelligence",
    summary="Analyze forensic intelligence and risk",
)
def analyze_forensic_intelligence(
    evidence_ids: list[str],
):
    """
    Analyze extracted forensic intelligence
    and calculate investigation risk.
    """

    extracted = process_evidence_ids(
        evidence_ids
    )

    correlation = None

    if len(extracted) >= 2:
        correlation = correlate_evidence(
            evidence_items=extracted
        )

    result = analyze_intelligence(
        extraction_results=extracted,
        correlation_result=correlation,
    )

    result["pipeline"] = {
        "completed_stage": "INTELLIGENCE",
        "previous_stage": "CORRELATE",
        "next_stage": "INVESTIGATE",
    }

    return result


# =========================================================
# TIMELINE
# =========================================================

@router.post(
    "/timeline",
    summary="Build forensic investigation timeline",
)
def build_forensic_timeline(
    evidence_ids: list[str],
):
    """
    Build a chronological timeline from
    extracted evidence events.
    """

    extracted = process_evidence_ids(
        evidence_ids
    )

    result = build_timeline(
        extraction_results=extracted,
        timestamp_window_seconds=300,
    )

    result["pipeline"] = {
        "completed_stage": "INVESTIGATE",
        "previous_stage": "INTELLIGENCE",
        "next_stage": "REPORT",
    }

    return result


# =========================================================
# INVESTIGATION
# =========================================================

@router.post(
    "/investigate",
    summary="Build forensic investigation view",
)
def investigate_evidence(
    evidence_ids: list[str],
):
    """
    Build a complete investigation view containing:

    Evidence
    Indicators
    Correlations
    Risk intelligence
    Timeline
    """

    extracted = process_evidence_ids(
        evidence_ids
    )

    correlation = None

    if len(extracted) >= 2:
        correlation = correlate_evidence(
            evidence_items=extracted
        )

    intelligence = analyze_intelligence(
        extraction_results=extracted,
        correlation_result=correlation,
    )

    timeline = build_timeline(
        extraction_results=extracted,
        timestamp_window_seconds=300,
    )

    return build_investigation(
        evidence_items=extracted,
        intelligence_result=intelligence,
        timeline_result=timeline,
    )


# =========================================================
# FORENSIC REPORT
# =========================================================

@router.post(
    "/report",
    summary="Generate forensic investigation report",
)
def generate_forensic_report(
    evidence_ids: list[str],
):
    """
    Generate a complete forensic investigation report.
    """

    extracted = process_evidence_ids(
        evidence_ids
    )

    correlation = None

    if len(extracted) >= 2:
        correlation = correlate_evidence(
            evidence_items=extracted
        )

    intelligence = analyze_intelligence(
        extraction_results=extracted,
        correlation_result=correlation,
    )

    timeline = build_timeline(
        extraction_results=extracted,
        timestamp_window_seconds=300,
    )

    investigation = build_investigation(
        evidence_items=extracted,
        intelligence_result=intelligence,
        timeline_result=timeline,
    )

    result = build_report(
        investigation_result=investigation
    )

    return result