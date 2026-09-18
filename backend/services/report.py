from __future__ import annotations

from datetime import datetime, timezone


ENGINE_NAME = "CyberTriage X Forensic Report Engine"
ENGINE_VERSION = "1.0.0"


def build_report(
    investigation_result: dict,
) -> dict:
    """
    Generate a structured forensic investigation report
    from the completed investigation result.
    """

    case = investigation_result.get(
        "case",
        {},
    )

    risk = investigation_result.get(
        "risk",
        {},
    )

    evidence = investigation_result.get(
        "evidence",
        [],
    )

    findings = investigation_result.get(
        "findings",
        [],
    )

    timeline = investigation_result.get(
        "timeline",
        [],
    )

    temporal_links = investigation_result.get(
        "temporal_links",
        [],
    )

    priorities = investigation_result.get(
        "priorities",
        [],
    )

    summary = investigation_result.get(
        "summary",
        [],
    )

    generated_at = datetime.now(
        timezone.utc
    ).isoformat()

    severity_counts = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
        "INFO": 0,
    }

    for finding in findings:

        severity = finding.get(
            "severity",
            "INFO",
        )

        if severity in severity_counts:
            severity_counts[severity] += 1

    report_findings = []

    for index, finding in enumerate(
        findings,
        start=1,
    ):

        report_findings.append({

            "finding_id":
                f"F-{index:03d}",

            "category":
                finding.get(
                    "category",
                    "UNKNOWN",
                ),

            "type":
                finding.get(
                    "type",
                    "UNKNOWN",
                ),

            "value":
                finding.get(
                    "value",
                    "UNKNOWN",
                ),

            "severity":
                finding.get(
                    "severity",
                    "INFO",
                ),

            "confidence":
                finding.get(
                    "confidence",
                    "MEDIUM",
                ),

            "description":
                finding.get(
                    "description",
                    "Forensic observation.",
                ),
        })

    timeline_summary = []

    for index, event in enumerate(
        timeline,
        start=1,
    ):

        timeline_summary.append({

            "event_id":
                f"T-{index:03d}",

            "timestamp":
                event.get(
                    "timestamp_display",
                    event.get(
                        "timestamp",
                        "UNKNOWN",
                    ),
                ),

            "category":
                event.get(
                    "category",
                    "GENERAL",
                ),

            "evidence_id":
                event.get(
                    "evidence_id",
                    "UNKNOWN",
                ),

            "description":
                event.get(
                    "description",
                    "Forensic event.",
                ),
        })

    return {

        "success": True,

        "stage":
            "REPORT",

        "report": {

            "report_id":
                f"CTR-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",

            "generated_at":
                generated_at,

            "title":
                "CyberTriage X Digital Forensic Investigation Report",

            "classification":
                "FORENSIC TRIAGE REPORT",

            "status":
                "GENERATED",
        },

        "case": {

            "status":
                case.get(
                    "status",
                    "INVESTIGATION READY",
                ),

            "evidence_sources":
                len(evidence),

            "timeline_events":
                len(timeline),

            "findings":
                len(findings),

            "temporal_relationships":
                len(temporal_links),
        },

        "risk_assessment": {

            "score":
                risk.get(
                    "score",
                    0,
                ),

            "level":
                risk.get(
                    "level",
                    "INFO",
                ),

            "basis":
                risk.get(
                    "basis",
                    "DETERMINISTIC FORENSIC TRIAGE",
                ),
        },

        "evidence": evidence,

        "findings":
            report_findings,

        "timeline":
            timeline_summary,

        "temporal_relationships":
            temporal_links,

        "priorities":
            priorities,

        "summary":
            summary,

        "severity_summary":
            severity_counts,

        "conclusion": (
            "The report summarizes observable forensic "
            "evidence, extracted indicators, detected "
            "relationships and investigation priorities. "
            "The generated findings require investigator "
            "validation and should not independently be "
            "treated as proof of malicious activity."
        ),

        "pipeline": {

            "completed_stage":
                "REPORT",

            "previous_stage":
                "INVESTIGATE",

            "next_stage":
                "CASE COMPLETE",
        },
    }


def report_engine_info() -> dict:

    return {

        "engine":
            ENGINE_NAME,

        "version":
            ENGINE_VERSION,

        "status":
            "OPERATIONAL",

        "capabilities": [

            "Investigation Report Generation",

            "Finding Identification",

            "Timeline Summarization",

            "Risk Assessment Reporting",

            "Evidence Summary",

            "Investigation Priority Reporting",

            "Forensic Case Documentation",
        ],
    }