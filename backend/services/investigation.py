from __future__ import annotations

from collections import Counter


ENGINE_NAME = (
    "CyberTriage X Investigation Reconstruction Engine"
)

ENGINE_VERSION = "1.0.0"


def build_investigation(
    evidence_items: list[dict],
    intelligence_result: dict | None = None,
    timeline_result: dict | None = None,
) -> dict:
    """
    Build a structured forensic investigation view
    from previously processed evidence.

    This engine connects observable evidence,
    indicators, correlations, risk information,
    and timeline events.

    It does not independently determine maliciousness
    or establish that an incident occurred.
    """

    evidence_summary = []

    indicator_inventory = Counter()

    total_findings = 0

    for evidence in evidence_items:

        evidence_id = evidence.get(
            "evidence_id",
            "UNKNOWN-EVIDENCE",
        )

        source_file = evidence.get(
            "source_file",
            "unknown",
        )

        indicators = evidence.get(
            "indicators",
            {},
        )

        counts = indicators.get(
            "counts",
            {},
        )

        for indicator_type, count in counts.items():

            indicator_inventory[
                indicator_type
            ] += count

        findings = evidence.get(
            "findings",
            [],
        )

        total_findings += len(findings)

        evidence_summary.append({

            "evidence_id":
                evidence_id,

            "source_file":
                source_file,

            "indicator_count":
                sum(counts.values()),

            "finding_count":
                len(findings),

            "status":
                "ANALYZED",
        })

    correlations = []

    if intelligence_result:

        correlations = (
            intelligence_result
            .get("findings", [])
        )

    timeline_events = []

    temporal_links = []

    if timeline_result:

        timeline_events = (
            timeline_result
            .get("timeline", [])
        )

        temporal_links = (
            timeline_result
            .get("temporal_links", [])
        )

    risk = {

        "score": 0,

        "level": "INFO",

        "basis":
            "NO INTELLIGENCE RESULT AVAILABLE",
    }

    if intelligence_result:

        risk = intelligence_result.get(
            "risk",
            risk,
        )

    investigation_findings = []

    # -----------------------------------------------------
    # Evidence findings
    # -----------------------------------------------------

    for evidence in evidence_items:

        evidence_id = evidence.get(
            "evidence_id",
            "UNKNOWN-EVIDENCE",
        )

        for finding in evidence.get(
            "findings",
            [],
        ):

            investigation_findings.append({

                "category":
                    "EVIDENCE INDICATOR",

                "evidence_id":
                    evidence_id,

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
                    "MEDIUM",

                "description":
                    finding.get(
                        "reason",
                        "Indicator observed in evidence.",
                    ),
            })

    # -----------------------------------------------------
    # Cross-evidence findings
    # -----------------------------------------------------

    for finding in correlations:

        if finding.get("type") != (
            "CROSS_EVIDENCE_MATCH"
        ):
            continue

        investigation_findings.append({

            "category":
                "CROSS-EVIDENCE RELATIONSHIP",

            "evidence_id":
                finding.get(
                    "evidence_id",
                    "UNKNOWN",
                ),

            "type":
                finding.get(
                    "type",
                    "CROSS_EVIDENCE_MATCH",
                ),

            "value":
                finding.get(
                    "value",
                    "UNKNOWN",
                ),

            "severity":
                finding.get(
                    "severity",
                    "LOW",
                ),

            "confidence":
                finding.get(
                    "confidence",
                    "HIGH",
                ),

            "description":
                finding.get(
                    "reason",
                    "Shared indicator detected.",
                ),
        })

    # -----------------------------------------------------
    # Timeline findings
    # -----------------------------------------------------

    for link in temporal_links:

        investigation_findings.append({

            "category":
                "TEMPORAL RELATIONSHIP",

            "evidence_id":
                (
                    f"{link.get('from_evidence', 'UNKNOWN')}"
                    " → "
                    f"{link.get('to_evidence', 'UNKNOWN')}"
                ),

            "type":
                "TEMPORAL_LINK",

            "value":
                (
                    f"{link.get('difference_seconds', 0)} "
                    "seconds"
                ),

            "severity":
                "INFO",

            "confidence":
                link.get(
                    "confidence",
                    "MEDIUM",
                ),

            "description":
                link.get(
                    "reason",
                    "Temporal relationship detected.",
                ),
        })

    # -----------------------------------------------------
    # Investigation summary
    # -----------------------------------------------------

    summary_points = []

    if evidence_items:

        summary_points.append(
            f"{len(evidence_items)} evidence source(s) "
            "were processed."
        )

    if indicator_inventory:

        summary_points.append(
            f"{sum(indicator_inventory.values())} "
            "forensic indicator(s) were extracted."
        )

    if correlations:

        shared_matches = sum(
            finding.get("type")
            == "CROSS_EVIDENCE_MATCH"
            for finding in correlations
        )

        if shared_matches:

            summary_points.append(
                f"{shared_matches} cross-evidence "
                "indicator relationship(s) were identified."
            )

    if temporal_links:

        summary_points.append(
            f"{len(temporal_links)} temporal "
            "relationship(s) were identified."
        )

    if timeline_events:

        summary_points.append(
            f"{len(timeline_events)} timeline "
            "event(s) were reconstructed."
        )

    if not summary_points:

        summary_points.append(
            "No significant forensic relationships "
            "were identified."
        )

    # -----------------------------------------------------
    # Investigation priorities
    # -----------------------------------------------------

    priorities = []

    high_severity = sum(
        finding.get("severity")
        in {"HIGH", "CRITICAL"}
        for finding in investigation_findings
    )

    if high_severity:

        priorities.append({

            "priority":
                "HIGH",

            "reason":
                (
                    f"{high_severity} high-severity "
                    "finding(s) require investigator "
                    "review."
                ),
        })

    if correlations:

        priorities.append({

            "priority":
                "MEDIUM",

            "reason":
                (
                    "Cross-evidence relationships "
                    "should be reviewed to determine "
                    "whether the observed indicators "
                    "are related."
                ),
        })

    if temporal_links:

        priorities.append({

            "priority":
                "MEDIUM",

            "reason":
                (
                    "Temporally related events should "
                    "be reviewed in their surrounding "
                    "context."
                ),
        })

    if not priorities:

        priorities.append({

            "priority":
                "ROUTINE",

            "reason":
                (
                    "No elevated investigation "
                    "priority was generated from "
                    "the supplied evidence."
                ),
        })

    return {

        "success": True,

        "stage":
            "INVESTIGATE",

        "engine": {

            "name":
                ENGINE_NAME,

            "version":
                ENGINE_VERSION,

            "status":
                "OPERATIONAL",
        },

        "case": {

            "status":
                "INVESTIGATION READY",

            "evidence_sources":
                len(evidence_items),

            "timeline_events":
                len(timeline_events),

            "investigation_findings":
                len(investigation_findings),
        },

        "risk":
            risk,

        "evidence":
            evidence_summary,

        "indicator_inventory":
            dict(indicator_inventory),

        "timeline":
            timeline_events,

        "temporal_links":
            temporal_links,

        "findings":
            investigation_findings,

        "priorities":
            priorities,

        "summary":
            summary_points,

        "investigator_note":
            (
                "This investigation view is generated "
                "from observable forensic evidence, "
                "deterministic analysis and detected "
                "relationships. It does not independently "
                "establish malicious activity or the cause "
                "of an incident. Investigator validation "
                "is required."
            ),

        "pipeline": {

            "completed_stage":
                "INVESTIGATE",

            "previous_stage":
                "INTELLIGENCE",

            "next_stage":
                "REPORT",
        },
    }


def investigation_engine_info() -> dict:

    return {

        "engine":
            ENGINE_NAME,

        "version":
            ENGINE_VERSION,

        "status":
            "OPERATIONAL",

        "capabilities": [

            "Evidence Consolidation",

            "Indicator Inventory",

            "Cross-Evidence Findings",

            "Timeline Integration",

            "Risk Integration",

            "Investigation Prioritization",

            "Case Summary Generation",

            "Investigator Context Generation",
        ],
    }