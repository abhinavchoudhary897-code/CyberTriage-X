from __future__ import annotations

import re
from collections import Counter
from pathlib import Path


IP_PATTERN = re.compile(
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
)

URL_PATTERN = re.compile(
    r"https?://[^\s<>'\"]+",
    re.IGNORECASE
)

EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

DOMAIN_PATTERN = re.compile(
    r"\b(?:[a-zA-Z0-9-]+\.)+"
    r"(?:com|net|org|in|io|dev|xyz|info|biz|co|me)\b",
    re.IGNORECASE
)

HASH_PATTERN = re.compile(
    r"\b[a-fA-F0-9]{32}\b"
    r"|\b[a-fA-F0-9]{40}\b"
    r"|\b[a-fA-F0-9]{64}\b"
)

TIMESTAMP_PATTERN = re.compile(
    r"\b\d{4}[-/]\d{2}[-/]\d{2}"
    r"(?:[ T]\d{2}:\d{2}(?::\d{2})?)?\b"
)


def _unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


def validate_ip(ip: str) -> bool:
    parts = ip.split(".")

    if len(parts) != 4:
        return False

    try:
        return all(
            0 <= int(part) <= 255
            for part in parts
        )
    except ValueError:
        return False


def extract_indicators(text: str) -> dict:

    ips = [
        ip
        for ip in _unique(
            IP_PATTERN.findall(text)
        )
        if validate_ip(ip)
    ]

    urls = _unique(
        URL_PATTERN.findall(text)
    )

    emails = _unique(
        EMAIL_PATTERN.findall(text)
    )

    domains = _unique(
        DOMAIN_PATTERN.findall(text)
    )

    hashes = _unique(
        HASH_PATTERN.findall(text)
    )

    timestamps = _unique(
        TIMESTAMP_PATTERN.findall(text)
    )

    return {
        "ip_addresses": ips,
        "urls": urls,
        "domains": domains,
        "email_addresses": emails,
        "file_hashes": hashes,
        "timestamps": timestamps,
        "counts": {
            "ip_addresses": len(ips),
            "urls": len(urls),
            "domains": len(domains),
            "email_addresses": len(emails),
            "file_hashes": len(hashes),
            "timestamps": len(timestamps),
        },
    }


def detect_suspicious_indicators(
    indicators: dict
) -> list[dict]:

    findings: list[dict] = []

    for ip in indicators["ip_addresses"]:

        is_private = (
            ip.startswith("10.")
            or ip.startswith("192.168.")
            or (
                ip.startswith("172.")
                and 16 <= int(
                    ip.split(".")[1]
                ) <= 31
            )
        )

        if not is_private:
            findings.append({
                "type": "EXTERNAL_IP",
                "value": ip,
                "severity": "MEDIUM",
                "reason": (
                    "IP address is outside common "
                    "private network ranges."
                )
            })

    for url in indicators["urls"]:

        findings.append({
            "type": "URL",
            "value": url,
            "severity": "INFO",
            "reason": (
                "URL discovered in evidence."
            )
        })

    for domain in indicators["domains"]:

        findings.append({
            "type": "DOMAIN",
            "value": domain,
            "severity": "INFO",
            "reason": (
                "Domain discovered in evidence."
            )
        })

    for file_hash in indicators["file_hashes"]:

        findings.append({
            "type": "FILE_HASH",
            "value": file_hash,
            "severity": "INFO",
            "reason": (
                "Cryptographic hash discovered "
                "in evidence."
            )
        })

    return findings


def analyze_text_evidence(
    file_path: Path,
    evidence_id: str
) -> dict:

    if not file_path.exists():
        raise FileNotFoundError(
            f"Evidence file not found: {file_path}"
        )

    try:

        text = file_path.read_text(
            encoding="utf-8",
            errors="replace"
        )

    except Exception as error:

        raise RuntimeError(
            f"Unable to read evidence: {error}"
        )

    indicators = extract_indicators(text)

    suspicious = detect_suspicious_indicators(
        indicators
    )

    severity_counts = Counter(
        finding["severity"]
        for finding in suspicious
    )

    return {
        "success": True,
        "stage": "EXTRACT",
        "evidence_id": evidence_id,
        "source_file": file_path.name,

        # Used by the forensic timeline classifier.
        "source_text": text,

        "bytes_analyzed": file_path.stat().st_size,
        "text_length": len(text),

        "indicators": indicators,

        "findings": suspicious,

        "summary": {
            "total_indicators": sum(
                indicators["counts"].values()
            ),
            "total_findings": len(
                suspicious
            ),
            "medium": severity_counts.get(
                "MEDIUM",
                0
            ),
            "high": severity_counts.get(
                "HIGH",
                0
            ),
            "critical": severity_counts.get(
                "CRITICAL",
                0
            ),
        },

        "analysis_note": (
            "Findings are deterministic triage "
            "indicators and require investigator "
            "validation."
        ),
    }