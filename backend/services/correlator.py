from __future__ import annotations

from datetime import datetime
from itertools import combinations


def _parse_timestamp(value: str) -> datetime | None:
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d %H:%M",
        "%Y-%m-%d",
        "%Y/%m/%d",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue

    return None


def _normalize(value: str) -> str:
    return value.strip().lower()


def _extract_indicator_sets(evidence: dict) -> dict:
    indicators = evidence.get("indicators", {})

    return {
        "ip_addresses": {
            _normalize(value)
            for value in indicators.get(
                "ip_addresses", []
            )
        },
        "urls": {
            _normalize(value)
            for value in indicators.get(
                "urls", []
            )
        },
        "domains": {
            _normalize(value)
            for value in indicators.get(
                "domains", []
            )
        },
        "email_addresses": {
            _normalize(value)
            for value in indicators.get(
                "email_addresses", []
            )
        },
        "file_hashes": {
            _normalize(value)
            for value in indicators.get(
                "file_hashes", []
            )
        },
    }


def _timestamp_values(evidence: dict) -> list[datetime]:
    timestamps = (
        evidence
        .get("indicators", {})
        .get("timestamps", [])
    )

    parsed = []

    for timestamp in timestamps:
        value = _parse_timestamp(timestamp)

        if value:
            parsed.append(value)

    return parsed


def correlate_evidence(
    evidence_items: list[dict],
    timestamp_window_seconds: int = 300,
) -> dict:
    """
    Correlate indicators across multiple evidence sources.

    Correlation rules:
    1. Same IP across evidence.
    2. Same URL across evidence.
    3. Same domain across evidence.
    4. Same email across evidence.
    5. Same file hash across evidence.
    6. Events occurring within a configurable time window.

    The engine identifies relationships for investigation.
    It does not claim maliciousness by itself.
    """

    correlations: list[dict] = []

    normalized_items = []

    for index, evidence in enumerate(evidence_items):

        normalized_items.append({
            "index": index,
            "evidence_id": evidence.get(
                "evidence_id",
                f"EVIDENCE-{index + 1}",
            ),
            "source_file": evidence.get(
                "source_file",
                "unknown",
            ),
            "indicators": _extract_indicator_sets(
                evidence
            ),
            "timestamps": _timestamp_values(
                evidence
            ),
        })

    for first, second in combinations(
        normalized_items,
        2,
    ):

        first_id = first["evidence_id"]
        second_id = second["evidence_id"]

        indicator_types = [
            "ip_addresses",
            "urls",
            "domains",
            "email_addresses",
            "file_hashes",
        ]

        # -----------------------------------------
        # SHARED INDICATOR CORRELATION
        # -----------------------------------------

        for indicator_type in indicator_types:

            shared_values = (
                first["indicators"][indicator_type]
                & second["indicators"][indicator_type]
            )

            for value in sorted(shared_values):

                correlations.append({
                    "type": "SHARED_INDICATOR",

                    "indicator_type": indicator_type,

                    "value": value,

                    "evidence": [
                        first_id,
                        second_id,
                    ],

                    "confidence": "HIGH",

                    "reason": (
                        f"The same "
                        f"{indicator_type.replace('_', ' ')} "
                        "appears in multiple evidence sources."
                    ),
                })

        # -----------------------------------------
        # TEMPORAL CORRELATION
        # -----------------------------------------

        for first_time in first["timestamps"]:

            for second_time in second["timestamps"]:

                difference = abs(
                    (
                        first_time - second_time
                    ).total_seconds()
                )

                if difference <= timestamp_window_seconds:

                    correlations.append({
                        "type": "TEMPORAL_CORRELATION",

                        "evidence": [
                            first_id,
                            second_id,
                        ],

                        "timestamp_a": (
                            first_time.isoformat()
                        ),

                        "timestamp_b": (
                            second_time.isoformat()
                        ),

                        "difference_seconds": difference,

                        "confidence": "MEDIUM",

                        "reason": (
                            "Events occur within the "
                            "configured forensic "
                            "correlation time window."
                        ),
                    })

    # ---------------------------------------------
    # SUMMARY
    # ---------------------------------------------

    return {
        "success": True,

        "stage": "CORRELATE",

        "evidence_count": len(
            evidence_items
        ),

        "timestamp_window_seconds": (
            timestamp_window_seconds
        ),

        "correlations": correlations,

        "summary": {
            "total_correlations": len(
                correlations
            ),

            "shared_indicators": sum(
                item["type"] == "SHARED_INDICATOR"
                for item in correlations
            ),

            "temporal_correlations": sum(
                item["type"] == "TEMPORAL_CORRELATION"
                for item in correlations
            ),

            "high_confidence": sum(
                item["confidence"] == "HIGH"
                for item in correlations
            ),

            "medium_confidence": sum(
                item["confidence"] == "MEDIUM"
                for item in correlations
            ),
        },

        "analysis_note": (
            "Correlations represent relationships "
            "detected between evidence sources and "
            "require investigator validation."
        ),
    }