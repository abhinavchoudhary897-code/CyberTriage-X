from __future__ import annotations

from datetime import datetime


ENGINE_NAME = (
    "CyberTriage X Forensic Timeline Engine"
)

ENGINE_VERSION = "1.1.0"


TIMESTAMP_FORMATS = [
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d %H:%M",
    "%Y/%m/%d %H:%M:%S",
    "%Y/%m/%d %H:%M",
    "%Y-%m-%d",
    "%Y/%m/%d",
]


def parse_timestamp(
    value: str
) -> datetime | None:

    if not value:
        return None

    value = value.strip()

    for timestamp_format in TIMESTAMP_FORMATS:

        try:
            return datetime.strptime(
                value,
                timestamp_format
            )

        except ValueError:
            continue

    return None


def classify_event(text: str) -> str:
    """
    Classify an event using observable keywords.
    """

    text_lower = text.lower()

    event_keywords = {

        "AUTHENTICATION": [
            "login",
            "logon",
            "authentication",
            "authenticated",
            "successful authentication",
            "sign in",
            "signin",
        ],

        "NETWORK": [
            "network connection",
            "network",
            "connection",
            "connected",
            "socket",
            "traffic",
            "source ip",
            "destination ip",
        ],

        "PROCESS": [
            "process started",
            "process created",
            "process",
            "pid",
        ],

        "FILE ACTIVITY": [
            "file created",
            "created file",
            "file modified",
            "modified file",
            "file deleted",
            "deleted file",
            "file accessed",
            "accessed file",
        ],

        "DOWNLOAD": [
            "download",
            "downloaded",
        ],

        "UPLOAD": [
            "upload",
            "uploaded",
        ],

        "COMMAND": [
            "command line",
            "command",
            "cmd.exe",
            "powershell",
            "terminal",
        ],
    }

    # More specific authentication phrases
    # are checked before general network terms.
    for category in [
        "AUTHENTICATION",
        "NETWORK",
        "PROCESS",
        "FILE ACTIVITY",
        "DOWNLOAD",
        "UPLOAD",
        "COMMAND",
    ]:

        for keyword in event_keywords[
            category
        ]:

            if keyword in text_lower:
                return category

    return "GENERAL"


def build_event_description(
    timestamp: str,
    evidence_id: str,
    source_file: str,
    category: str,
) -> str:

    return (
        f"{category.title()} event observed at "
        f"{timestamp} in {source_file} "
        f"associated with evidence "
        f"{evidence_id}."
    )


def build_timeline(
    extraction_results: list[dict],
    timestamp_window_seconds: int = 300,
) -> dict:

    timeline_events: list[dict] = []

    for extraction in extraction_results:

        evidence_id = extraction.get(
            "evidence_id",
            "UNKNOWN-EVIDENCE",
        )

        source_file = extraction.get(
            "source_file",
            "unknown",
        )

        source_text = extraction.get(
            "source_text",
            "",
        )

        timestamps = (
            extraction
            .get("indicators", {})
            .get("timestamps", [])
        )

        category = classify_event(
            source_text
        )

        for timestamp_value in timestamps:

            parsed_timestamp = parse_timestamp(
                timestamp_value
            )

            if parsed_timestamp is None:
                continue

            timeline_events.append({

                "timestamp":
                    parsed_timestamp.isoformat(),

                "timestamp_display":
                    parsed_timestamp.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),

                "evidence_id":
                    evidence_id,

                "source_file":
                    source_file,

                "event_type":
                    "FORENSIC EVENT",

                "category":
                    category,

                "confidence":
                    "MEDIUM",

                "description":
                    build_event_description(
                        timestamp=timestamp_value,
                        evidence_id=evidence_id,
                        source_file=source_file,
                        category=category,
                    ),
            })

    timeline_events.sort(
        key=lambda event:
        event["timestamp"]
    )

    temporal_links: list[dict] = []

    for index in range(
        1,
        len(timeline_events),
    ):

        previous_event = (
            timeline_events[index - 1]
        )

        current_event = (
            timeline_events[index]
        )

        previous_time = (
            datetime.fromisoformat(
                previous_event["timestamp"]
            )
        )

        current_time = (
            datetime.fromisoformat(
                current_event["timestamp"]
            )
        )

        difference_seconds = (
            current_time - previous_time
        ).total_seconds()

        if (
            0 <= difference_seconds
            <= timestamp_window_seconds
        ):

            temporal_links.append({

                "from_evidence":
                    previous_event[
                        "evidence_id"
                    ],

                "to_evidence":
                    current_event[
                        "evidence_id"
                    ],

                "from_timestamp":
                    previous_event[
                        "timestamp"
                    ],

                "to_timestamp":
                    current_event[
                        "timestamp"
                    ],

                "difference_seconds":
                    difference_seconds,

                "relationship":
                    "TEMPORALLY RELATED",

                "confidence":
                    "MEDIUM",

                "reason":
                    (
                        "Events occurred within "
                        "the configured forensic "
                        "timeline correlation "
                        "window."
                    ),
            })

    category_counts: dict[str, int] = {}

    for event in timeline_events:

        category = event["category"]

        category_counts[category] = (
            category_counts.get(
                category,
                0
            ) + 1
        )

    evidence_sources = sorted(
        {
            event["evidence_id"]
            for event in timeline_events
        }
    )

    return {

        "success": True,

        "stage": "INVESTIGATE",

        "engine": {
            "name": ENGINE_NAME,
            "version": ENGINE_VERSION,
            "status": "OPERATIONAL",
        },

        "timeline":
            timeline_events,

        "temporal_links":
            temporal_links,

        "summary": {

            "total_events":
                len(timeline_events),

            "temporal_relationships":
                len(temporal_links),

            "evidence_sources":
                len(evidence_sources),

            "categories":
                category_counts,
        },

        "configuration": {

            "timestamp_window_seconds":
                timestamp_window_seconds,
        },

        "analysis_note": (
            "Timeline events are reconstructed "
            "from timestamps present in supplied "
            "evidence. Event categories are "
            "assigned using observable text "
            "patterns. Temporal relationships "
            "represent observed proximity in "
            "time and require investigator "
            "validation."
        ),
    }


def timeline_engine_info() -> dict:

    return {

        "engine":
            ENGINE_NAME,

        "version":
            ENGINE_VERSION,

        "status":
            "OPERATIONAL",

        "capabilities": [

            "Timestamp Extraction",

            "Chronological Event Ordering",

            "Temporal Relationship Detection",

            "Evidence Source Tracking",

            "Event Categorization",

            "Investigation Timeline Reconstruction",
        ],

        "default_timestamp_window_seconds":
            300,
    }