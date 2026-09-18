from __future__ import annotations

from collections import Counter

ENGINE_NAME = "CyberTriage X Intelligence & Risk Engine"
ENGINE_VERSION = "1.1.0"

SEVERITY_SCORES = {
    "INFO": 0,
    "LOW": 5,
    "MEDIUM": 15,
    "HIGH": 30,
    "CRITICAL": 50,
}


def _clamp_score(score: int) -> int:
    return max(0, min(score, 100))


def _risk_level(score: int) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    if score > 0:
        return "LOW"
    return "INFO"


def analyze_intelligence(
    extraction_results: list[dict],
    correlation_result: dict | None = None,
) -> dict:

    findings = []
    indicator_counter = Counter()
    total_indicators = 0

    # Process extracted evidence
    for extraction in extraction_results:

        evidence_id = extraction.get(
            "evidence_id",
            "UNKNOWN-EVIDENCE",
        )

        indicators = extraction.get(
            "indicators",
            {},
        )

        counts = indicators.get(
            "counts",
            {},
        )

        for indicator_type, count in counts.items():

            if count > 0:
                indicator_counter[indicator_type] += count
                total_indicators += count

        for finding in extraction.get(
            "findings",
            [],
        ):

            findings.append({
                "evidence_id": evidence_id,
                "type": finding.get(
                    "type",
                    "UNKNOWN",
                ),
                "value": finding.get(
                    "value",
                    "UNKNOWN",
                ),
                "severity": finding.get(
                    "severity",
                    "INFO",
                ),
                "reason": finding.get(
                    "reason",
                    "Indicator discovered in evidence.",
                ),
            })

    # Process correlations
    correlations = []

    if correlation_result:

        correlations = correlation_result.get(
            "correlations",
            [],
        )

        for correlation in correlations:

            correlation_type = correlation.get(
                "type",
                "UNKNOWN",
            )

            confidence = correlation.get(
                "confidence",
                "MEDIUM",
            )

            if correlation_type == "SHARED_INDICATOR":

                findings.append({
                    "evidence_id": ", ".join(
                        correlation.get(
                            "evidence",
                            [],
                        )
                    ),
                    "type": "CROSS_EVIDENCE_MATCH",
                    "value": correlation.get(
                        "value",
                        "UNKNOWN",
                    ),
                    "severity": "LOW",
                    "reason": (
                        "The same indicator was observed "
                        "across multiple evidence sources."
                    ),
                    "confidence": confidence,
                })

            elif correlation_type == "TEMPORAL_CORRELATION":

                findings.append({
                    "evidence_id": ", ".join(
                        correlation.get(
                            "evidence",
                            [],
                        )
                    ),
                    "type": "TEMPORAL_LINK",
                    "value": (
                        f"{correlation.get(
                            'difference_seconds',
                            0
                        )} seconds"
                    ),
                    "severity": "INFO",
                    "reason": (
                        "Events from separate evidence "
                        "sources occurred within the "
                        "configured correlation window."
                    ),
                    "confidence": confidence,
                })

    # Calculate score
    score = 0

    for finding in findings:

        severity = finding.get(
            "severity",
            "INFO",
        )

        score += SEVERITY_SCORES.get(
            severity,
            0,
        )

    shared_indicator_count = sum(
        correlation.get("type")
        == "SHARED_INDICATOR"
        for correlation in correlations
    )

    temporal_correlation_count = sum(
        correlation.get("type")
        == "TEMPORAL_CORRELATION"
        for correlation in correlations
    )

    score += shared_indicator_count * 5
    score += temporal_correlation_count * 2

    indicator_types_present = sum(
        count > 0
        for count in indicator_counter.values()
    )

    if indicator_types_present >= 3:
        score += 5

    if indicator_types_present >= 5:
        score += 5

    score = _clamp_score(score)

    level = _risk_level(score)

    # Explanation
    reasons = []

    if total_indicators > 0:
        reasons.append(
            f"{total_indicators} forensic indicator(s) "
            "were extracted from the supplied evidence."
        )

    if shared_indicator_count > 0:
        reasons.append(
            f"{shared_indicator_count} shared indicator "
            "relationship(s) were identified across "
            "evidence sources."
        )

    if temporal_correlation_count > 0:
        reasons.append(
            f"{temporal_correlation_count} temporal "
            "relationship(s) were identified."
        )

    if indicator_types_present >= 3:
        reasons.append(
            "Multiple indicator categories were observed, "
            "increasing investigation breadth."
        )

    if not reasons:
        reasons.append(
            "No significant triage indicators were "
            "identified in the supplied evidence."
        )

    severity_summary = Counter(
        finding.get(
            "severity",
            "INFO",
        )
        for finding in findings
    )

    return {
        "success": True,
        "stage": "INTELLIGENCE",

        "engine": {
            "name": ENGINE_NAME,
            "version": ENGINE_VERSION,
            "status": "OPERATIONAL",
        },

        "risk": {
            "score": score,
            "level": level,
            "basis": "DETERMINISTIC FORENSIC TRIAGE",
        },

        "summary": {
            "evidence_sources": len(
                extraction_results
            ),
            "total_indicators": total_indicators,
            "total_findings": len(findings),
            "shared_indicator_matches":
                shared_indicator_count,
            "temporal_correlations":
                temporal_correlation_count,
            "indicator_categories":
                indicator_types_present,

            "severity": {
                "critical": severity_summary.get(
                    "CRITICAL",
                    0,
                ),
                "high": severity_summary.get(
                    "HIGH",
                    0,
                ),
                "medium": severity_summary.get(
                    "MEDIUM",
                    0,
                ),
                "low": severity_summary.get(
                    "LOW",
                    0,
                ),
                "info": severity_summary.get(
                    "INFO",
                    0,
                ),
            },
        },

        "indicator_inventory": dict(
            indicator_counter
        ),

        "findings": findings,

        "explanation": reasons,

        "analysis_note": (
            "Risk level represents investigation priority "
            "based on observable forensic indicators and "
            "relationships. It does not independently "
            "establish malicious activity."
        ),

        "pipeline": {
            "completed_stage": "INTELLIGENCE",
            "previous_stage": "CORRELATE",
            "next_stage": "INVESTIGATE",
        },
    }


def risk_engine_info() -> dict:

    return {
        "engine": ENGINE_NAME,
        "version": ENGINE_VERSION,
        "status": "OPERATIONAL",
        "method": (
            "Deterministic evidence-based triage scoring"
        ),
        "capabilities": [
            "Indicator Prioritization",
            "Severity Aggregation",
            "Cross-Evidence Risk Assessment",
            "Temporal Relationship Analysis",
            "Indicator Diversity Analysis",
            "Explainable Risk Scoring",
            "Investigation Priority Generation",
        ],
        "severity_scores": SEVERITY_SCORES,
    }