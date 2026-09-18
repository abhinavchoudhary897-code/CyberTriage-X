from __future__ import annotations

import hashlib
import mimetypes
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter


# ============================================================
# CYBERTRIAGE X
# FORENSIC EVIDENCE ACQUISITION ENGINE
# ============================================================

ENGINE_NAME = "CyberTriage X Evidence Acquisition Engine"
ENGINE_VERSION = "2.0.0"

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

# Create forensic vault automatically
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# EVIDENCE RECORD
# ============================================================

@dataclass
class EvidenceRecord:
    evidence_id: str

    original_filename: str
    stored_filename: str

    file_size: int
    file_size_human: str

    mime_type: str
    file_extension: str

    md5: str
    sha256: str

    acquired_at: str
    acquisition_duration_ms: float

    evidence_category: str
    processing_status: str
    integrity_status: str

    acquisition_method: str
    acquisition_engine: str
    acquisition_engine_version: str


# ============================================================
# FILE SIZE FORMATTER
# ============================================================

def format_file_size(size: int) -> str:
    """
    Convert bytes into a human-readable size.
    """

    units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB",
        "PB",
    ]

    value = float(size)

    for unit in units:

        if value < 1024:
            return f"{value:.2f} {unit}"

        value /= 1024

    return f"{value:.2f} EB"


# ============================================================
# CRYPTOGRAPHIC HASHING
# ============================================================

def calculate_hashes(
    file_path: Path,
) -> tuple[str, str]:
    """
    Calculate MD5 and SHA-256 fingerprints.

    The file is processed in chunks instead of loading the
    complete artifact into memory.
    """

    md5_hash = hashlib.md5(
        usedforsecurity=False
    )

    sha256_hash = hashlib.sha256()

    with file_path.open("rb") as evidence_file:

        while True:

            chunk = evidence_file.read(
                1024 * 1024
            )

            if not chunk:
                break

            md5_hash.update(chunk)
            sha256_hash.update(chunk)

    return (
        md5_hash.hexdigest(),
        sha256_hash.hexdigest(),
    )


# ============================================================
# EVIDENCE CLASSIFICATION
# ============================================================

def classify_evidence(
    filename: str,
    mime_type: str,
) -> str:
    """
    Automatically classify evidence based on extension
    and MIME information.
    """

    extension = Path(
        filename
    ).suffix.lower()

    categories = {

        # Logs
        ".log": "SYSTEM / APPLICATION LOG",

        ".txt": "TEXT ARTIFACT",

        ".csv": "STRUCTURED LOG / CSV",

        ".json": "STRUCTURED EVENT DATA",

        ".xml": "STRUCTURED EVENT DATA",

        # Network
        ".pcap": "NETWORK CAPTURE",

        ".pcapng": "NETWORK CAPTURE",

        # Windows
        ".evtx": "WINDOWS EVENT LOG",

        # Archives
        ".zip": "ARCHIVE",

        ".tar": "ARCHIVE",

        ".gz": "COMPRESSED EVIDENCE",

        ".7z": "ARCHIVE",

        ".rar": "ARCHIVE",

        # Images
        ".jpg": "IMAGE ARTIFACT",

        ".jpeg": "IMAGE ARTIFACT",

        ".png": "IMAGE ARTIFACT",

        ".gif": "IMAGE ARTIFACT",

        ".bmp": "IMAGE ARTIFACT",

        # Documents
        ".pdf": "DOCUMENT ARTIFACT",

        ".doc": "DOCUMENT ARTIFACT",

        ".docx": "DOCUMENT ARTIFACT",

        ".xlsx": "DOCUMENT ARTIFACT",

        # Databases
        ".db": "DATABASE ARTIFACT",

        ".sqlite": "DATABASE ARTIFACT",

        ".sqlite3": "DATABASE ARTIFACT",

        # Memory / forensic images
        ".raw": "FORENSIC DISK IMAGE",

        ".dd": "FORENSIC DISK IMAGE",

        ".img": "FORENSIC DISK IMAGE",

        ".dmp": "MEMORY / DUMP ARTIFACT",

    }

    if extension in categories:

        return categories[extension]

    if mime_type.startswith("text/"):

        return "TEXT ARTIFACT"

    if mime_type.startswith("image/"):

        return "IMAGE ARTIFACT"

    if mime_type.startswith("application/json"):

        return "STRUCTURED EVENT DATA"

    return "UNKNOWN / UNCLASSIFIED"


# ============================================================
# SAFE FILENAME NORMALIZATION
# ============================================================

def sanitize_filename(
    filename: str,
) -> str:
    """
    Remove path components and unsafe null characters.

    The original directory structure supplied by a client is
    never trusted.
    """

    clean_name = Path(
        filename
    ).name.strip()

    clean_name = clean_name.replace(
        "\x00",
        "_",
    )

    return (
        clean_name
        if clean_name
        else "unnamed_evidence"
    )


# ============================================================
# EVIDENCE ID GENERATOR
# ============================================================

def generate_evidence_id() -> str:
    """
    Generate a unique forensic evidence identifier.
    """

    timestamp = datetime.now(
        timezone.utc
    ).strftime("%Y%m%d")

    unique_token = uuid.uuid4().hex[
        :12
    ].upper()

    return (
        f"EVD-{timestamp}-{unique_token}"
    )


# ============================================================
# EVIDENCE ACQUISITION
# ============================================================

def acquire_evidence(
    original_filename: str,
    file_content: bytes,
) -> dict:
    """
    Acquire and register a digital evidence artifact.

    Processing pipeline:

        RECEIVE
           ↓
        VALIDATE
           ↓
        IDENTIFY
           ↓
        PRESERVE
           ↓
        HASH
           ↓
        CLASSIFY
           ↓
        REGISTER
    """

    acquisition_start = perf_counter()

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not original_filename:

        raise ValueError(
            "Evidence filename is required."
        )

    # --------------------------------------------------------
    # Validate content
    # --------------------------------------------------------

    if not file_content:

        raise ValueError(
            "Evidence file is empty."
        )

    # --------------------------------------------------------
    # Generate evidence identifier
    # --------------------------------------------------------

    evidence_id = (
        generate_evidence_id()
    )

    # --------------------------------------------------------
    # Normalize filename
    # --------------------------------------------------------

    safe_filename = sanitize_filename(
        original_filename
    )

    extension = Path(
        safe_filename
    ).suffix.lower()

    # --------------------------------------------------------
    # Generate controlled storage name
    # --------------------------------------------------------

    stored_filename = (
        f"{evidence_id}"
        f"{extension if extension else '.bin'}"
    )

    file_path = (
        UPLOAD_DIR
        / stored_filename
    )

    # --------------------------------------------------------
    # Preserve artifact
    # --------------------------------------------------------

    with file_path.open(
        "wb"
    ) as evidence_file:

        evidence_file.write(
            file_content
        )

    # --------------------------------------------------------
    # Verify physical write
    # --------------------------------------------------------

    if not file_path.exists():

        raise RuntimeError(
            "Evidence preservation failed."
        )

    file_size = file_path.stat().st_size

    if file_size != len(file_content):

        raise RuntimeError(
            "Evidence write verification failed."
        )

    # --------------------------------------------------------
    # Determine MIME type
    # --------------------------------------------------------

    mime_type, _ = (
        mimetypes.guess_type(
            safe_filename
        )
    )

    mime_type = (
        mime_type
        or "application/octet-stream"
    )

    # --------------------------------------------------------
    # Generate fingerprints
    # --------------------------------------------------------

    md5, sha256 = calculate_hashes(
        file_path
    )

    # --------------------------------------------------------
    # Classify evidence
    # --------------------------------------------------------

    evidence_category = (
        classify_evidence(
            safe_filename,
            mime_type,
        )
    )

    # --------------------------------------------------------
    # Acquisition timestamp
    # --------------------------------------------------------

    acquired_at = datetime.now(
        timezone.utc
    ).isoformat()

    acquisition_duration = (
        perf_counter()
        - acquisition_start
    ) * 1000

    # --------------------------------------------------------
    # Build evidence record
    # --------------------------------------------------------

    record = EvidenceRecord(

        evidence_id=evidence_id,

        original_filename=safe_filename,

        stored_filename=stored_filename,

        file_size=file_size,

        file_size_human=(
            format_file_size(
                file_size
            )
        ),

        mime_type=mime_type,

        file_extension=(
            extension
            or "NONE"
        ),

        md5=md5,

        sha256=sha256,

        acquired_at=acquired_at,

        acquisition_duration_ms=round(
            acquisition_duration,
            3,
        ),

        evidence_category=(
            evidence_category
        ),

        processing_status="ACQUIRED",

        integrity_status="VERIFIED",

        acquisition_method=(
            "LOCAL FORENSIC UPLOAD"
        ),

        acquisition_engine=(
            ENGINE_NAME
        ),

        acquisition_engine_version=(
            ENGINE_VERSION
        ),
    )

    return asdict(record)


# ============================================================
# INTEGRITY VERIFICATION
# ============================================================

def verify_evidence_integrity(
    file_path: Path,
    expected_sha256: str,
) -> dict:
    """
    Recalculate SHA-256 and compare it against the
    acquisition fingerprint.
    """

    if not file_path.exists():

        return {
            "verified": False,
            "status": "EVIDENCE NOT FOUND",
            "reason": (
                "Evidence file does not exist."
            ),
        }

    _, current_sha256 = (
        calculate_hashes(
            file_path
        )
    )

    verified = (
        current_sha256.lower()
        == expected_sha256.lower()
    )

    return {

        "verified": verified,

        "status": (
            "INTEGRITY VERIFIED"
            if verified
            else "INTEGRITY COMPROMISED"
        ),

        "expected_sha256": (
            expected_sha256
        ),

        "current_sha256": (
            current_sha256
        ),

        "artifact": file_path.name,

        "verification_mode": (
            "SHA-256 RE-CALCULATION"
        ),

        "read_only": True,
    }


# ============================================================
# ENGINE INFORMATION
# ============================================================

def acquisition_engine_info() -> dict:
    """
    Return acquisition engine capabilities.
    """

    return {

        "engine": ENGINE_NAME,

        "version": ENGINE_VERSION,

        "status": "OPERATIONAL",

        "storage": {
            "mode": "LOCAL FORENSIC VAULT",
            "path": str(UPLOAD_DIR),
        },

        "integrity": {
            "primary": "SHA-256",
            "secondary": "MD5",
        },

        "capabilities": [

            "Unique Evidence Identification",

            "Secure Filename Normalization",

            "Evidence Preservation",

            "Write Verification",

            "Cryptographic Fingerprinting",

            "Automatic MIME Detection",

            "Evidence Classification",

            "Integrity Verification",

            "Acquisition Timing",

            "Forensic Metadata Generation",

        ],
    }