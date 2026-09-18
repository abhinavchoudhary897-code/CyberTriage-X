"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

type IOC = {
  type: string;
  value: string;
  severity: string;
  reason: string;
};

type ExtractionResult = {
  success: boolean;
  stage: string;
  evidence_id: string;
  source_file: string;
  source_text?: string;
  bytes_analyzed: number;
  text_length: number;

  indicators: {
    ip_addresses: string[];
    urls: string[];
    domains: string[];
    email_addresses: string[];
    file_hashes: string[];
    timestamps: string[];

    counts: {
      ip_addresses: number;
      urls: number;
      domains: number;
      email_addresses: number;
      file_hashes: number;
      timestamps: number;
    };
  };

  findings: IOC[];

  summary: {
    total_indicators: number;
    total_findings: number;
    medium: number;
    high: number;
    critical: number;
  };

  analysis_note: string;

  pipeline?: {
    completed_stage: string;
    previous_stage: string;
    next_stage: string;
  };
};

export default function IOCPage() {
  const [evidenceId, setEvidenceId] = useState(
    "EVD-20260918-6495D4F12DA9"
  );

  const [data, setData] =
    useState<ExtractionResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState("ALL");

  const [message, setMessage] = useState(
    "IOC intelligence engine ready."
  );

  async function loadIOCData() {
    if (!evidenceId.trim()) {
      setMessage("Enter an evidence ID.");
      return;
    }

    setLoading(true);
    setMessage("Extracting forensic indicators...");

    try {
      const response = await fetch(
        `${API}/api/evidence/extract/${evidenceId.trim()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Unable to extract IOC intelligence."
        );
      }

      setData(result);

      setMessage(
        "IOC extraction completed successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "IOC extraction failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const findings = data?.findings ?? [];

  const filteredFindings =
    filter === "ALL"
      ? findings
      : findings.filter(
          (item) => item.severity === filter
        );

  return (
    <main className="min-h-screen bg-[#03060b] text-white">

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(34,211,238,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.06)_1px,transparent_1px)] [background-size:45px_45px]" />

      <div className="relative z-10 flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[260px] shrink-0 border-r border-white/10 bg-[#050911]/95 lg:block">

          <div className="sticky top-0 flex h-screen flex-col">

            {/* BRAND */}
            <div className="border-b border-white/10 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10">
                  <span className="font-black text-cyan-300">
                    CT
                  </span>
                </div>

                <div>
                  <h1 className="text-sm font-black">
                    CYBERTRIAGE{" "}
                    <span className="text-cyan-300">
                      X
                    </span>
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

                <NavItem
                  icon="⌂"
                  label="Dashboard"
                  href="/"
                />

                <NavItem
                  icon="▣"
                  label="Evidence Vault"
                  href="/evidence"
                />

                <NavItem
                  icon="⇩"
                  label="Acquisition"
                  href="/acquisition"
                />

                <NavItem
                  icon="◇"
                  label="Classification"
                  href="/classification"
                />

                <NavItem
                  icon="⌕"
                  label="IOC Explorer"
                  href="/ioc"
                  active
                />

                <NavItem
                  icon="⌁"
                  label="Correlation"
                  href="/correlation"
                />

                <NavItem
                  icon="◷"
                  label="Timeline"
                  href="/timeline"
                />

                <NavItem
                  icon="◎"
                  label="Investigation"
                  href="/investigation"
                />

                <NavItem
                  icon="▤"
                  label="Reports"
                  href="/reports"
                />

                <NavItem
                  icon="□"
                  label="Case Management"
                  href="/case"
                />

              </div>

            </nav>

            {/* BACKEND */}
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

        {/* MAIN */}
        <div className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050911]/90 backdrop-blur-xl">

            <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Threat Intelligence
                </p>

                <h2 className="mt-1 text-lg font-black">
                  IOC Explorer
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
                04 / INDICATOR INTELLIGENCE
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Indicator of Compromise Explorer
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Review observable indicators extracted
                from acquired evidence and prioritize
                them for forensic investigation.
              </p>

            </section>

            {/* PIPELINE */}
            <section className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#080d16] p-4">

              <div className="flex min-w-[800px] items-center justify-between">

                <PipelineStep
                  number="01"
                  label="EVIDENCE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  number="02"
                  label="ACQUIRE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  number="03"
                  label="CLASSIFY"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  number="04"
                  label="EXTRACT"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  number="05"
                  label="INTELLIGENCE"
                  status="ACTIVE"
                />

                <PipelineLine />

                <PipelineStep
                  number="06"
                  label="CORRELATE"
                  status="WAITING"
                />

              </div>

            </section>

            {/* CONTROL */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Intelligence Console
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Load Evidence Indicators
                </h2>

              </div>

              <div className="grid gap-4 p-6 lg:grid-cols-[1fr_auto]">

                <div>

                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Evidence ID
                  </label>

                  <input
                    value={evidenceId}
                    onChange={(event) =>
                      setEvidenceId(
                        event.target.value
                      )
                    }
                    placeholder="EVD-20260918-XXXXXXXXXXXX"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-cyan-200 outline-none placeholder:text-slate-700 focus:border-cyan-300/40"
                  />

                </div>

                <button
                  onClick={loadIOCData}
                  disabled={loading}
                  className="self-end rounded-xl bg-cyan-300 px-7 py-3 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? "SCANNING..."
                    : "LOAD IOC INTELLIGENCE"}
                </button>

              </div>

              <div className="border-t border-white/10 px-6 py-4">

                <p className="text-[9px] text-slate-600">
                  {message}
                </p>

              </div>

            </section>

            {data && (
              <>

                {/* METRICS */}
                <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

                  <Metric
                    label="Total IOCs"
                    value={String(
                      data.summary.total_indicators
                    )}
                  />

                  <Metric
                    label="Findings"
                    value={String(
                      data.summary.total_findings
                    )}
                  />

                  <Metric
                    label="IP Addresses"
                    value={String(
                      data.indicators.counts.ip_addresses
                    )}
                  />

                  <Metric
                    label="URLs"
                    value={String(
                      data.indicators.counts.urls
                    )}
                  />

                  <Metric
                    label="Domains"
                    value={String(
                      data.indicators.counts.domains
                    )}
                  />

                  <Metric
                    label="Hashes"
                    value={String(
                      data.indicators.counts.file_hashes
                    )}
                  />

                </section>

                {/* EXTRA ANALYSIS */}
                <section className="mt-6 grid gap-6 lg:grid-cols-3">

                  <Metric
                    label="Email Addresses"
                    value={String(
                      data.indicators.counts.email_addresses
                    )}
                  />

                  <Metric
                    label="Timestamps"
                    value={String(
                      data.indicators.counts.timestamps
                    )}
                  />

                  <Metric
                    label="Bytes Analyzed"
                    value={formatBytes(
                      data.bytes_analyzed
                    )}
                  />

                </section>

                {/* IOC MATRIX */}
                <section className="mt-6 grid gap-6 lg:grid-cols-2">

                  <IOCPanel
                    title="IP Addresses"
                    subtitle="Network indicators"
                    icon="IP"
                    values={
                      data.indicators.ip_addresses
                    }
                  />

                  <IOCPanel
                    title="URLs"
                    subtitle="Web indicators"
                    icon="URL"
                    values={
                      data.indicators.urls
                    }
                  />

                  <IOCPanel
                    title="Domains"
                    subtitle="Domain indicators"
                    icon="DNS"
                    values={
                      data.indicators.domains
                    }
                  />

                  <IOCPanel
                    title="File Hashes"
                    subtitle="Cryptographic indicators"
                    icon="HASH"
                    values={
                      data.indicators.file_hashes
                    }
                  />

                  <IOCPanel
                    title="Email Addresses"
                    subtitle="Identity indicators"
                    icon="MAIL"
                    values={
                      data.indicators.email_addresses
                    }
                  />

                  <IOCPanel
                    title="Timestamps"
                    subtitle="Temporal artifacts"
                    icon="TIME"
                    values={
                      data.indicators.timestamps
                    }
                  />

                </section>

                {/* FINDINGS */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                        Prioritized Findings
                      </p>

                      <h2 className="mt-2 text-xl font-black">
                        Investigation Indicators
                      </h2>

                    </div>

                    <div className="flex gap-2">

                      {[
                        "ALL",
                        "MEDIUM",
                        "HIGH",
                        "CRITICAL",
                      ].map((level) => (

                        <button
                          key={level}
                          onClick={() =>
                            setFilter(level)
                          }
                          className={`rounded-lg px-3 py-2 text-[8px] font-black transition ${
                            filter === level
                              ? "bg-cyan-300 text-black"
                              : "border border-white/10 bg-white/[0.02] text-slate-600 hover:text-slate-300"
                          }`}
                        >
                          {level}
                        </button>

                      ))}

                    </div>

                  </div>

                  {filteredFindings.length === 0 ? (

                    <div className="p-10 text-center">

                      <p className="text-xs text-slate-600">
                        No findings match this filter.
                      </p>

                    </div>

                  ) : (

                    <div className="divide-y divide-white/5">

                      {filteredFindings.map(
                        (item, index) => (

                          <div
                            key={`${item.value}-${index}`}
                            className="grid gap-5 px-6 py-5 lg:grid-cols-[100px_170px_1fr_auto]"
                          >

                            {/* SEVERITY */}
                            <div>

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black ${
                                  item.severity ===
                                  "CRITICAL"
                                    ? "bg-red-400/10 text-red-300"
                                    : item.severity ===
                                      "HIGH"
                                    ? "bg-orange-400/10 text-orange-300"
                                    : item.severity ===
                                      "MEDIUM"
                                    ? "bg-yellow-400/10 text-yellow-300"
                                    : "bg-slate-400/10 text-slate-400"
                                }`}
                              >
                                {item.severity}
                              </span>

                            </div>

                            {/* TYPE */}
                            <div>

                              <p className="text-[9px] font-black text-cyan-300">
                                {item.type}
                              </p>

                              <p className="mt-2 text-[8px] uppercase tracking-widest text-slate-700">
                                OBSERVED
                              </p>

                            </div>

                            {/* VALUE */}
                            <div>

                              <p className="break-all rounded-lg border border-white/5 bg-black/20 px-3 py-2 font-mono text-[10px] text-slate-400">
                                {item.value}
                              </p>

                              <p className="mt-2 text-[9px] leading-5 text-slate-600">
                                {item.reason}
                              </p>

                            </div>

                            {/* STATUS */}
                            <div className="flex items-center">

                              <span className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[8px] font-black text-slate-600">
                                REVIEW
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </section>

                {/* ANALYSIS NOTE */}
                <section className="mt-6 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

                  <div className="flex gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-[9px] font-black text-cyan-300">
                      AI
                    </div>

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                        Deterministic Analysis
                      </p>

                      <p className="mt-2 max-w-4xl text-[10px] leading-6 text-slate-500">
                        {data.analysis_note}
                      </p>

                    </div>

                  </div>

                </section>

                {/* INVESTIGATION NOTE */}
                <section className="mt-6 rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

                  <div className="flex gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-300/20 bg-yellow-300/10 text-[9px] font-black text-yellow-300">
                      !
                    </div>

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300">
                        Investigator Advisory
                      </p>

                      <p className="mt-2 max-w-4xl text-[10px] leading-6 text-slate-500">
                        These indicators are automatically
                        extracted forensic observations.
                        They should be validated against
                        additional evidence before drawing
                        investigative conclusions.
                      </p>

                    </div>

                  </div>

                </section>

                {/* NEXT */}
                <section className="mt-6 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                        Next Forensic Stage
                      </p>

                      <h3 className="mt-2 text-sm font-black">
                        Cross-Evidence Correlation
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-600">
                        Compare indicators across multiple
                        evidence sources and identify
                        temporal relationships.
                      </p>

                    </div>

                    <a
                      href="/correlation"
                      className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-center text-[9px] font-black text-cyan-300 hover:bg-cyan-300/20"
                    >
                      OPEN CORRELATION →
                    </a>

                  </div>

                </section>

              </>
            )}

            {/* FOOTER */}
            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / IOC INTELLIGENCE ENGINE
            </footer>

          </div>

        </div>

      </div>

    </main>
  );
}


/* ================= COMPONENTS ================= */

function NavItem({
  icon,
  label,
  href,
  active,
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
          active
            ? "bg-cyan-300 text-black"
            : "bg-white/[0.04] text-slate-600"
        }`}
      >
        {icon}
      </span>

      <span className="text-[10px] font-bold tracking-wide">
        {label}
      </span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
      )}
    </a>
  );
}


function PipelineStep({
  number,
  label,
  status,
}: {
  number: string;
  label: string;
  status: "DONE" | "ACTIVE" | "WAITING";
}) {
  const active = status === "ACTIVE";
  const done = status === "DONE";

  return (
    <div className="flex items-center gap-2">

      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[9px] font-black ${
          done
            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
            : active
            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-300"
            : "border-white/5 bg-white/[0.02] text-slate-700"
        }`}
      >
        {done ? "✓" : number}
      </span>

      <div>

        <p
          className={`text-[8px] font-black ${
            done
              ? "text-emerald-300"
              : active
              ? "text-cyan-300"
              : "text-slate-700"
          }`}
        >
          {label}
        </p>

        <p className="mt-0.5 text-[7px] text-slate-700">
          {status}
        </p>

      </div>

    </div>
  );
}


function PipelineLine() {
  return (
    <div className="mx-3 h-px min-w-[25px] flex-1 bg-white/10" />
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080d16] p-5">

      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

    </div>
  );
}


function IOCPanel({
  title,
  subtitle,
  icon,
  values,
}: {
  title: string;
  subtitle: string;
  icon: string;
  values: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#080d16]">

      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.04] font-mono text-[8px] font-black text-cyan-300">
            {icon}
          </div>

          <div>

            <h3 className="text-sm font-black">
              {title}
            </h3>

            <p className="mt-1 text-[8px] uppercase tracking-widest text-slate-700">
              {subtitle}
            </p>

          </div>

        </div>

        <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-cyan-300">
          {values.length}
        </span>

      </div>

      <div className="max-h-[190px] space-y-2 overflow-y-auto p-4">

        {values.length === 0 ? (

          <p className="py-5 text-center text-[9px] text-slate-700">
            No indicators detected
          </p>

        ) : (

          values.map((value) => (

            <div
              key={value}
              className="break-all rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 font-mono text-[9px] text-slate-500"
            >
              {value}
            </div>

          ))

        )}

      </div>

    </div>
  );
}


function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}