from __future__ import annotations

import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.evidence import router as evidence_router


# ============================================================
# CYBERTRIAGE X — APPLICATION CONFIGURATION
# ============================================================

APP_NAME = "CyberTriage X"
APP_VERSION = "3.0.0"

APP_DESCRIPTION = (
    "Advanced digital-forensic triage and investigation "
    "platform for rapid evidence acquisition, classification, "
    "extraction, correlation, timeline reconstruction, "
    "investigation and forensic reporting."
)


# ============================================================
# FORENSIC PIPELINE
# ============================================================

FORENSIC_PIPELINE = [
    {
        "stage": "EVIDENCE",
        "name": "Evidence Collection",
        "status": "ACTIVE",
        "description": "Receive and register digital evidence.",
    },
    {
        "stage": "ACQUIRE",
        "name": "Evidence Acquisition",
        "status": "ACTIVE",
        "description": "Preserve evidence and generate cryptographic fingerprints.",
    },
    {
        "stage": "CLASSIFY",
        "name": "Evidence Classification",
        "status": "ACTIVE",
        "description": "Identify evidence type, format and forensic category.",
    },
    {
        "stage": "EXTRACT",
        "name": "Artifact & IOC Extraction",
        "status": "ACTIVE",
        "description": "Extract observable forensic indicators and artifacts.",
    },
    {
        "stage": "CORRELATE",
        "name": "Cross-Evidence Correlation",
        "status": "ACTIVE",
        "description": "Connect shared indicators and temporally related events.",
    },
    {
        "stage": "TIMELINE",
        "name": "Forensic Timeline",
        "status": "ACTIVE",
        "description": "Reconstruct chronological forensic events and relationships.",
    },
    {
        "stage": "INVESTIGATE",
        "name": "Investigation Workspace",
        "status": "ACTIVE",
        "description": "Consolidate evidence, findings, risk and investigator context.",
    },
    {
        "stage": "REPORT",
        "name": "Forensic Reporting",
        "status": "ACTIVE",
        "description": "Generate structured forensic investigation reports.",
    },
]


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print()
    print("=" * 65)
    print(" CYBERTRIAGE X - FORENSIC BACKEND")
    print("=" * 65)
    print(f" Version : {APP_VERSION}")
    print(" Mode    : Digital Forensic Triage")
    print(" Status  : INITIALIZING")
    print("=" * 65)

    print("[+] Evidence acquisition engine available")
    print("[+] API routing initialized")
    print("[+] Forensic pipeline loaded")
    print("[+] Classification engine available")
    print("[+] Extraction engine available")
    print("[+] Correlation engine available")
    print("[+] Timeline engine available")
    print("[+] Investigation engine available")
    print("[+] Reporting engine available")
    print("[+] Backend ready")

    print("=" * 65)
    print()

    yield

    print()
    print("[*] CyberTriage X shutting down...")
    print("[*] Backend stopped safely.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST TRACKING MIDDLEWARE
# ============================================================

@app.middleware("http")
async def request_tracking_middleware(
    request: Request,
    call_next,
):
    request_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    try:
        response = await call_next(request)

    except Exception as error:
        duration = (time.perf_counter() - start_time) * 1000

        print(
            f"[ERROR] "
            f"{request.method} "
            f"{request.url.path} "
            f"{duration:.2f}ms "
            f"request={request_id} "
            f"error={error}"
        )

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error.",
                "request_id": request_id,
            },
        )

    duration = (time.perf_counter() - start_time) * 1000

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Processing-Time-MS"] = f"{duration:.2f}"

    return response


# ============================================================
# EVIDENCE API ROUTER
# ============================================================

app.include_router(evidence_router)


# ============================================================
# ROOT SYSTEM ENDPOINT
# ============================================================

@app.get(
    "/",
    tags=["System"],
    summary="CyberTriage system overview",
)
async def root():
    return {
        "success": True,
        "system": {
            "name": APP_NAME,
            "version": APP_VERSION,
            "status": "OPERATIONAL",
            "mode": "FORENSIC TRIAGE",
        },
        "problem_statement": (
            "Creating a Cyber Triage Tool "
            "to Streamline Digital Forensic Investigation"
        ),
        "workflow": [
            stage["stage"]
            for stage in FORENSIC_PIPELINE
        ],
        "message": "CyberTriage X forensic backend is online.",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get(
    "/health",
    tags=["System"],
    summary="Backend health check",
)
async def health_check():
    return {
        "success": True,
        "status": "HEALTHY",
        "service": APP_NAME,
        "version": APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "api": "ONLINE",
            "evidence_acquisition": "ONLINE",
            "classification_engine": "ONLINE",
            "extraction_engine": "ONLINE",
            "correlation_engine": "ONLINE",
            "timeline_engine": "ONLINE",
            "investigation_engine": "ONLINE",
            "report_engine": "ONLINE",
        },
    }


# ============================================================
# FORENSIC PIPELINE STATUS
# ============================================================

@app.get(
    "/api/system/pipeline",
    tags=["System"],
    summary="Get forensic pipeline status",
)
async def pipeline_status():
    active_stages = sum(
        stage["status"] == "ACTIVE"
        for stage in FORENSIC_PIPELINE
    )

    return {
        "success": True,
        "pipeline": FORENSIC_PIPELINE,
        "total_stages": len(FORENSIC_PIPELINE),
        "active_stages": active_stages,
        "pipeline_status": (
            "OPERATIONAL"
            if active_stages == len(FORENSIC_PIPELINE)
            else "PARTIAL"
        ),
    }


# ============================================================
# SYSTEM INFORMATION
# ============================================================

@app.get(
    "/api/system/info",
    tags=["System"],
    summary="Get CyberTriage system information",
)
async def system_information():
    return {
        "platform": APP_NAME,
        "version": APP_VERSION,
        "status": "OPERATIONAL",
        "architecture": "Modular Forensic Backend",
        "capabilities": [
            "Evidence Acquisition",
            "Cryptographic Integrity",
            "Evidence Classification",
            "Artifact Extraction",
            "IOC Discovery",
            "Cross-Evidence Correlation",
            "Forensic Timeline",
            "Risk Intelligence",
            "Investigation Workspace",
            "Forensic Reporting",
        ],
        "pipeline": [
            stage["stage"]
            for stage in FORENSIC_PIPELINE
        ],
        "integrity": {
            "primary_hash": "SHA-256",
            "secondary_hash": "MD5",
        },
        "api": {
            "documentation": "/docs",
            "openapi": "/openapi.json",
            "redoc": "/redoc",
            "health": "/health",
            "pipeline": "/api/system/pipeline",
        },
    }