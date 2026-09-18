"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

type Artifact = {
  stored_filename?: string;
  size_bytes?: number;
  extension?: string;
  storage?: string;
};

type ApiResponse = {
  success?: boolean;
  evidence_id?: string;
  artifact?: Artifact;
  detail?: string;
};

type Classification = {
  name: string;
  icon: string;
  confidence: number;
  route: string;
  description: string;
};

export default function ClassificationPage() {
  const [evidenceId, setEvidenceId] = useState("EVD-20260918-6495D4F12DA9");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Classification engine ready.");

  async function classifyEvidence() {
    const id = evidenceId.trim();
    if (!id) {
      setMessage("Please enter an evidence ID.");
      return;
    }

    setLoading(true);
    setResult(null);
    setMessage("Reading forensic artifact metadata...");

    try {
      const response = await fetch(
        `${API}/api/evidence/artifact/${encodeURIComponent(id)}`
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to classify evidence.");
      }

      setResult(data);
      setMessage("Evidence classification completed successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Classification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const artifact = result?.artifact;
  const extension = artifact?.extension?.toLowerCase() || "";
  const classification = getClassification(extension);

  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      {/* BACKGROUND GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[260px] shrink-0 border-r border-white/10 bg-[#050911] lg:block">
          <div className="flex h-screen flex-col">
            {/* LOGO */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10">
                  <span className="font-black text-cyan-300">CT</span>
                </div>
                <div>
                  <h1 className="text-sm font-black">
                    CYBERTRIAGE <span className="text-cyan-300">X</span>
                  </h1>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-slate-600">
                    Forensic Command Center
                  </p>
                </div>
              </div>
            </div>

            {/* CASE */}
            <div className="border-b border-white/10 p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">
                Active Case
              </p>
              <div className="mt-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] p-3">
                <p className="font-mono text-[10px] text-cyan-300">
                  CTX-2026-001
                </p>
                <p className="mt-1 text-xs font-bold text-slate-300">
                  Digital Incident
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="text-[9px] font-bold text-emerald-300">
                    ACTIVE INVESTIGATION
                  </span>
                </div>
              </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-700">
                Investigation
              </p>

              <div className="space-y-1">
                <NavItem icon="⌂" label="Dashboard" href="/" />
                <NavItem icon="▣" label="Evidence Vault" href="/evidence" />
                <NavItem icon="⇩" label="Acquisition" href="/acquisition" />
                <NavItem
                  icon="◇"
                  label="Classification"
                  href="/classification"
                  active
                />
                <NavItem icon="⌕" label="IOC Explorer" href="/ioc" />
                <NavItem icon="⌁" label="Correlation" href="/correlation" />
                <NavItem icon="◷" label="Timeline" href="/timeline" />
                <NavItem icon="◎" label="Investigation" href="/investigation" />
                <NavItem icon="▤" label="Reports" href="/reports" />
                <NavItem icon="□" label="Case Management" href="/case" />
              </div>
            </nav>

            {/* BACKEND STATUS */}
            <div className="border-t border-white/10 p-5">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-slate-600">
                    Backend
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                </div>
                <p className="mt-2 text-[10px] font-bold text-emerald-300">
                  API ONLINE
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050911]/95 backdrop-blur-xl">
            <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Evidence Intelligence
                </p>
                <h2 className="mt-1 text-lg font-black">
                  Evidence Classification
                </h2>
              </div>

              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[9px] font-black text-emerald-300">
                ● API ONLINE
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 lg:p-8">
            {/* HERO */}
            <section className="mb-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                03 / CLASSIFICATION
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Evidence Classification Engine
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Identify the type of acquired digital evidence, inspect its
                metadata and determine the appropriate forensic processing
                route.
              </p>
            </section>

            {/* PIPELINE */}
            <section className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#080d16] p-4">
              <div className="flex min-w-[850px] items-center justify-between">
                {[
                  "EVIDENCE",
                  "ACQUIRE",
                  "CLASSIFY",
                  "EXTRACT",
                  "CORRELATE",
                  "TIMELINE",
                  "INVESTIGATE",
                ].map((stage, index) => {
                  const completed = index < 2;
                  const active = index === 2;

                  return (
                    <div key={stage} className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[9px] font-black ${
                            active
                              ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-300"
                              : completed
                              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
                              : "border-white/10 bg-white/[0.02] text-slate-600"
                          }`}
                        >
                          {completed ? "✓" : String(index + 1).padStart(2, "0")}
                        </div>

                        <div>
                          <p
                            className={`text-[8px] font-black ${
                              active
                                ? "text-cyan-300"
                                : completed
                                ? "text-emerald-300"
                                : "text-slate-600"
                            }`}
                          >
                            {stage}
                          </p>
                          <p className="mt-0.5 text-[7px] text-slate-700">
                            {active
                              ? "ACTIVE"
                              : completed
                              ? "DONE"
                              : "PENDING"}
                          </p>
                        </div>
                      </div>

                      {index < 6 && (
                        <div className="mx-3 h-px min-w-[22px] bg-white/10" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CLASSIFICATION CONSOLE */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Classification Console
                </p>
                <h2 className="mt-2 text-xl font-black">
                  Analyze Evidence Artifact
                </h2>
                <p className="mt-2 text-[10px] text-slate-600">
                  Enter an acquired evidence ID to classify the artifact.
                </p>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <input
                    type="text"
                    value={evidenceId}
                    onChange={(event) => setEvidenceId(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        classifyEvidence();
                      }
                    }}
                    placeholder="EVD-20260918-XXXXXXXXXXXX"
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-mono text-[10px] text-cyan-200 outline-none placeholder:text-slate-700 focus:border-cyan-300/40"
                  />

                  <button
                    type="button"
                    onClick={classifyEvidence}
                    disabled={loading}
                    className="rounded-xl bg-cyan-300 px-8 py-4 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "CLASSIFYING..." : "CLASSIFY EVIDENCE"}
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      loading
                        ? "bg-yellow-300"
                        : result
                        ? "bg-emerald-300"
                        : "bg-cyan-300"
                    }`}
                  />
                  <p className="text-[9px] text-slate-600">{message}</p>
                </div>
              </div>
            </section>

            {/* RESULTS */}
            {result && artifact && (
              <>
                {/* TOP RESULT */}
                <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_350px]">
                  <div className="rounded-3xl border border-white/10 bg-[#080d16] p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Classification Result
                    </p>

                    <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10">
                        <span className="text-lg font-black text-cyan-300">
                          {classification.icon}
                        </span>
                      </div>

                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                          Detected Evidence Type
                        </p>
                        <h2 className="mt-2 text-3xl font-black">
                          {classification.name}
                        </h2>
                        <p className="mt-3 max-w-2xl text-[10px] leading-6 text-slate-500">
                          {classification.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CONFIDENCE */}
                  <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.04] p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                      Classification Confidence
                    </p>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-5xl font-black text-emerald-300">
                        {classification.confidence}
                      </span>
                      <span className="mb-2 text-xl font-black text-emerald-300">
                        %
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-emerald-300"
                        style={{
                          width: `${classification.confidence}%`,
                        }}
                      />
                    </div>

                    <p className="mt-4 text-[8px] leading-5 text-slate-600">
                      Classification is based on the detected artifact extension
                      and forensic evidence mapping rules.
                    </p>
                  </div>
                </section>

                {/* METADATA */}
                <section className="mt-6">
                  <div className="mb-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Artifact Intelligence
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Evidence Metadata
                    </h2>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard
                      label="Evidence ID"
                      value={result.evidence_id || evidenceId}
                      mono
                    />
                    <InfoCard
                      label="Stored Filename"
                      value={artifact.stored_filename || "UNKNOWN"}
                      mono
                    />
                    <InfoCard
                      label="File Extension"
                      value={extension ? extension.toUpperCase() : "UNKNOWN"}
                    />
                    <InfoCard
                      label="File Size"
                      value={formatBytes(artifact.size_bytes || 0)}
                    />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <InfoCard
                      label="Storage Location"
                      value={artifact.storage || "LOCAL FORENSIC VAULT"}
                    />
                    <InfoCard
                      label="Recommended Processing Route"
                      value={classification.route}
                    />
                  </div>
                </section>

                {/* LOGIC */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">
                  <div className="border-b border-white/10 px-6 py-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-purple-300">
                      Classification Analysis
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Classification Logic
                    </h2>
                  </div>

                  <div className="grid gap-3 p-5 md:grid-cols-3">
                    <LogicCard
                      number="01"
                      title="Artifact Detection"
                      text={`File extension detected as ${
                        extension || "unknown"
                      }.`}
                    />
                    <LogicCard
                      number="02"
                      title="Evidence Mapping"
                      text={`Mapped to the ${classification.name} category.`}
                    />
                    <LogicCard
                      number="03"
                      title="Pipeline Decision"
                      text={classification.route}
                    />
                  </div>
                </section>

                {/* NEXT STAGE */}
                <section className="mt-6 grid gap-4 md:grid-cols-2">
                  <a
                    href="/ioc"
                    className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 transition hover:bg-cyan-300/[0.08]"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Next Stage
                    </p>
                    <h3 className="mt-2 text-sm font-black">
                      IOC Explorer →
                    </h3>
                    <p className="mt-2 text-[10px] leading-5 text-slate-600">
                      Extract IP addresses, URLs, domains, emails, hashes and
                      timestamps from supported textual evidence.
                    </p>
                  </a>

                  <a
                    href="/evidence"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:bg-white/[0.04]"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Review
                    </p>
                    <h3 className="mt-2 text-sm font-black">
                      Evidence Vault →
                    </h3>
                    <p className="mt-2 text-[10px] leading-5 text-slate-600">
                      Inspect acquired evidence and cryptographic integrity
                      information.
                    </p>
                  </a>
                </section>
              </>
            )}

            {/* FOOTER */}
            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / CLASSIFICATION ENGINE
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
        active
          ? "border border-cyan-300/15 bg-cyan-300/10 text-cyan-200"
          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-black ${
          active ? "bg-cyan-300 text-black" : "bg-white/[0.04] text-slate-600"
        }`}
      >
        {icon}
      </span>

      <span className="text-[10px] font-bold tracking-wide">{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
      )}
    </a>
  );
}

/* ================= INFO CARD ================= */
function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080d16] p-4">
      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-3 break-all font-black text-slate-300 ${
          mono ? "font-mono text-[10px]" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ================= LOGIC CARD ================= */
function LogicCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-300/10 font-mono text-[8px] font-black text-purple-300">
          {number}
        </div>

        <p className="text-[10px] font-black text-slate-300">{title}</p>
      </div>

      <p className="mt-4 text-[9px] leading-5 text-slate-600">{text}</p>
    </div>
  );
}

/* ================= CLASSIFICATION ENGINE ================= */
function getClassification(extension: string): Classification {
  const ext = extension.toLowerCase();

  if ([".txt", ".log", ".csv", ".json", ".xml"].includes(ext)) {
    return {
      name: "TEXTUAL EVIDENCE",
      icon: "TXT",
      confidence: 98,
      route: "IOC EXTRACTION → CORRELATION",
      description:
        "Textual evidence can be processed for IP addresses, URLs, domains, email addresses, hashes and timestamps.",
    };
  }

  if ([".pcap", ".pcapng"].includes(ext)) {
    return {
      name: "NETWORK CAPTURE",
      icon: "NET",
      confidence: 96,
      route: "NETWORK ANALYSIS → CORRELATION",
      description:
        "Network capture evidence containing packet-level information for network forensic analysis.",
    };
  }

  if (ext === ".evtx") {
    return {
      name: "WINDOWS EVENT LOG",
      icon: "EVT",
      confidence: 97,
      route: "EVENT ANALYSIS → TIMELINE",
      description:
        "Windows Event Log evidence intended for structured event analysis and timeline reconstruction.",
    };
  }

  if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(ext)) {
    return {
      name: "IMAGE EVIDENCE",
      icon: "IMG",
      confidence: 95,
      route: "MEDIA ANALYSIS → INVESTIGATION",
      description:
        "Image evidence suitable for metadata inspection and visual forensic examination.",
    };
  }

  if ([".pdf", ".doc", ".docx", ".xlsx"].includes(ext)) {
    return {
      name: "DOCUMENT EVIDENCE",
      icon: "DOC",
      confidence: 95,
      route: "DOCUMENT ANALYSIS → EXTRACTION",
      description:
        "Document evidence that may contain textual content, metadata and structured information.",
    };
  }

  if ([".zip", ".tar", ".gz", ".7z", ".rar"].includes(ext)) {
    return {
      name: "ARCHIVE EVIDENCE",
      icon: "ARC",
      confidence: 94,
      route: "ARCHIVE INSPECTION → EXTRACTION",
      description:
        "Archive evidence that may contain multiple forensic artifacts.",
    };
  }

  if ([".db", ".sqlite", ".sqlite3"].includes(ext)) {
    return {
      name: "DATABASE EVIDENCE",
      icon: "DB",
      confidence: 96,
      route: "DATABASE ANALYSIS → CORRELATION",
      description:
        "Structured database evidence suitable for record extraction and relationship analysis.",
    };
  }

  if ([".raw", ".dd", ".img", ".dmp"].includes(ext)) {
    return {
      name: "FORENSIC IMAGE",
      icon: "IMG",
      confidence: 97,
      route: "IMAGE ANALYSIS → ARTIFACT EXTRACTION",
      description:
        "Forensic disk or memory image requiring specialized artifact analysis.",
    };
  }

  return {
    name: "UNKNOWN EVIDENCE",
    icon: "???",
    confidence: 50,
    route: "MANUAL REVIEW REQUIRED",
    description:
      "The artifact extension is not currently mapped to a recognized evidence category.",
  };
}

/* ================= FILE SIZE ================= */
function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}