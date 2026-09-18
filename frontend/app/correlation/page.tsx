"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

type Correlation = {
  type: string;
  indicator_type?: string;
  value?: string;
  evidence: string[];
  confidence: string;
  reason: string;
  timestamp_a?: string;
  timestamp_b?: string;
  difference_seconds?: number;
};

type CorrelationResult = {
  success: boolean;
  stage: string;
  evidence_count: number;
  timestamp_window_seconds: number;
  correlations: Correlation[];
  summary: {
    total_correlations: number;
    shared_indicators: number;
    temporal_correlations: number;
    high_confidence: number;
    medium_confidence: number;
  };
  analysis_note: string;
};

export default function CorrelationPage() {
  const [evidenceA, setEvidenceA] = useState(
    "EVD-20260918-6495D4F12DA9"
  );

  const [evidenceB, setEvidenceB] = useState(
    "EVD-20260918-74CBCCFF788C"
  );

  const [result, setResult] =
    useState<CorrelationResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(
    "Correlation engine ready."
  );

  async function runCorrelation() {
    const idA = evidenceA.trim();
    const idB = evidenceB.trim();

    if (!idA || !idB) {
      setMessage("Both evidence IDs are required.");
      return;
    }

    if (idA === idB) {
      setMessage(
        "Please select two different evidence sources."
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setMessage("Comparing evidence sources...");

    try {
      const response = await fetch(
        `${API}/api/evidence/correlate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([idA, idB]),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Correlation analysis failed."
        );
      }

      const normalized: CorrelationResult = {
        success: data?.success ?? true,

        stage:
          data?.stage ??
          "CORRELATE",

        evidence_count:
          Number(data?.evidence_count) || 2,

        timestamp_window_seconds:
          Number(
            data?.timestamp_window_seconds
          ) || 300,

        correlations:
          Array.isArray(data?.correlations)
            ? data.correlations
            : [],

        summary: {
          total_correlations:
            Number(
              data?.summary
                ?.total_correlations
            ) ||
            data?.correlations?.length ||
            0,

          shared_indicators:
            Number(
              data?.summary
                ?.shared_indicators
            ) ||
            0,

          temporal_correlations:
            Number(
              data?.summary
                ?.temporal_correlations
            ) ||
            0,

          high_confidence:
            Number(
              data?.summary
                ?.high_confidence
            ) ||
            0,

          medium_confidence:
            Number(
              data?.summary
                ?.medium_confidence
            ) ||
            0,
        },

        analysis_note:
          data?.analysis_note ??
          "Correlation analysis completed.",
      };

      setResult(normalized);

      setMessage(
        "Cross-evidence correlation completed successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Correlation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const correlations =
    result?.correlations ?? [];

  const sharedIndicators =
    correlations.filter(
      (item) =>
        item.type === "SHARED_INDICATOR"
    );

  const temporalCorrelations =
    correlations.filter(
      (item) =>
        item.type ===
        "TEMPORAL_CORRELATION"
    );

  return (
    <main className="min-h-screen bg-[#03060b] text-white">

      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(34,211,238,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.06)_1px,transparent_1px)] [background-size:45px_45px]" />

      <div className="relative z-10 flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[260px] shrink-0 border-r border-white/10 bg-[#050911]/95 lg:block">

          <div className="sticky top-0 flex h-screen flex-col">

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
                />

                <NavItem
                  icon="⌁"
                  label="Correlation"
                  href="/correlation"
                  active
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

          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050911]/90 backdrop-blur-xl">

            <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Cross-Evidence Analysis
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Correlation Engine
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
                05 / CORRELATE
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Cross-Evidence Correlation
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Connect artifacts from multiple evidence
                sources to identify shared indicators and
                temporal relationships.
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
                  label="CORRELATE"
                  status="ACTIVE"
                />

                <PipelineLine />

                <PipelineStep
                  number="06"
                  label="INVESTIGATE"
                  status="WAITING"
                />

              </div>

            </section>

            {/* CONSOLE */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Correlation Console
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Select Evidence Sources
                </h2>

                <p className="mt-2 text-[10px] text-slate-600">
                  Compare two acquired evidence artifacts.
                </p>

              </div>

              <div className="grid gap-4 p-6 lg:grid-cols-[1fr_60px_1fr_auto] lg:items-end">

                <div>

                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Evidence Source A
                  </label>

                  <input
                    value={evidenceA}
                    onChange={(e) =>
                      setEvidenceA(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-[10px] text-cyan-200 outline-none focus:border-cyan-300/40"
                  />

                </div>

                <div className="hidden justify-center lg:flex">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-black text-cyan-300">
                    ↔
                  </div>

                </div>

                <div>

                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Evidence Source B
                  </label>

                  <input
                    value={evidenceB}
                    onChange={(e) =>
                      setEvidenceB(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-[10px] text-cyan-200 outline-none focus:border-cyan-300/40"
                  />

                </div>

                <button
                  onClick={runCorrelation}
                  disabled={loading}
                  className="rounded-xl bg-cyan-300 px-7 py-3 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? "CORRELATING..."
                    : "RUN CORRELATION"}
                </button>

              </div>

              <div className="border-t border-white/10 px-6 py-4">

                <p className="text-[9px] text-slate-600">
                  {message}
                </p>

              </div>

            </section>

            {/* RESULTS */}
            {result && (
              <>
                {/* METRICS */}
                <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                  <Metric
                    label="Evidence Sources"
                    value={String(
                      result.evidence_count
                    )}
                  />

                  <Metric
                    label="Shared Indicators"
                    value={String(
                      result.summary
                        .shared_indicators
                    )}
                  />

                  <Metric
                    label="Temporal Links"
                    value={String(
                      result.summary
                        .temporal_correlations
                    )}
                  />

                  <Metric
                    label="Total Correlations"
                    value={String(
                      result.summary
                        .total_correlations
                    )}
                  />

                </section>

                {/* CONNECTION MAP */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16] p-6">

                  <div className="mb-6">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Evidence Relationship
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Cross-Evidence Connection Map
                    </h2>

                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_100px_1fr] md:items-center">

                    <EvidenceNode
                      label="SOURCE A"
                      id={evidenceA}
                    />

                    <div className="flex flex-col items-center gap-2">

                      <div className="h-px w-full bg-cyan-300/20" />

                      <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[8px] font-black text-cyan-300">
                        {result.summary.total_correlations} LINKS
                      </span>

                      <div className="h-px w-full bg-cyan-300/20" />

                    </div>

                    <EvidenceNode
                      label="SOURCE B"
                      id={evidenceB}
                    />

                  </div>

                </section>

                {/* SHARED INDICATORS */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <div className="border-b border-white/10 px-6 py-5">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Shared Artifacts
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Common Indicators
                    </h2>

                  </div>

                  {sharedIndicators.length === 0 ? (
                    <div className="p-10 text-center">

                      <p className="text-xs text-slate-600">
                        No shared indicators detected.
                      </p>

                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">

                      {sharedIndicators.map(
                        (item, index) => (
                          <div
                            key={`${item.value}-${index}`}
                            className="grid gap-4 px-6 py-5 lg:grid-cols-[150px_1fr_180px]"
                          >

                            <div>
                              <span className="rounded-full bg-red-400/10 px-2.5 py-1 text-[8px] font-black text-red-300">
                                SHARED
                              </span>
                            </div>

                            <div>

                              <p className="text-[9px] font-black text-cyan-300">
                                {item.indicator_type}
                              </p>

                              <p className="mt-2 break-all rounded-lg border border-white/5 bg-black/20 px-3 py-2 font-mono text-[10px] text-slate-400">
                                {item.value}
                              </p>

                              <p className="mt-2 text-[8px] text-slate-700">
                                Evidence:{" "}
                                {item.evidence.join(
                                  " • "
                                )}
                              </p>

                              <p className="mt-2 text-[9px] leading-5 text-slate-600">
                                {item.reason}
                              </p>

                            </div>

                            <div>

                              <p className="text-[8px] uppercase tracking-widest text-slate-700">
                                CONFIDENCE
                              </p>

                              <p className="mt-2 text-[10px] font-black text-emerald-300">
                                {item.confidence}
                              </p>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </section>

                {/* TEMPORAL */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <div className="border-b border-white/10 px-6 py-5">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Temporal Analysis
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Timeline Relationships
                    </h2>

                  </div>

                  {temporalCorrelations.length === 0 ? (
                    <div className="p-10 text-center">

                      <p className="text-xs text-slate-600">
                        No temporal relationships detected.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-4 p-6">

                      {temporalCorrelations.map(
                        (item, index) => (
                          <div
                            key={`${item.timestamp_a}-${index}`}
                            className="rounded-2xl border border-white/5 bg-black/20 p-5"
                          >

                            <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">

                              <div>

                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
                                  Source A
                                </p>

                                <p className="mt-2 break-all font-mono text-[9px] text-slate-400">
                                  {item.evidence[0]}
                                </p>

                                <p className="mt-2 text-[9px] text-cyan-300">
                                  {item.timestamp_a}
                                </p>

                              </div>

                              <div className="text-center">

                                <p className="text-[8px] uppercase tracking-widest text-slate-700">
                                  Time Gap
                                </p>

                                <p className="mt-2 text-xl font-black text-cyan-300">
                                  {item.difference_seconds}s
                                </p>

                                <p className="mt-1 text-[8px] font-bold text-emerald-300">
                                  {item.confidence}
                                </p>

                              </div>

                              <div>

                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
                                  Source B
                                </p>

                                <p className="mt-2 break-all font-mono text-[9px] text-slate-400">
                                  {item.evidence[1]}
                                </p>

                                <p className="mt-2 text-[9px] text-cyan-300">
                                  {item.timestamp_b}
                                </p>

                              </div>

                            </div>

                            <p className="mt-5 border-t border-white/5 pt-4 text-[9px] leading-5 text-slate-600">
                              {item.reason}
                            </p>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </section>

                {/* ANALYSIS NOTE */}
                <section className="mt-6 rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5">

                  <div className="flex gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-300/20 bg-yellow-300/10 text-[9px] font-black text-yellow-300">
                      !
                    </div>

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300">
                        Correlation Note
                      </p>

                      <p className="mt-2 max-w-4xl text-[10px] leading-6 text-slate-500">
                        {result.analysis_note}
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
                        Build Investigation Timeline
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-600">
                        Organize correlated events into a chronological forensic timeline.
                      </p>

                    </div>

                    <a
                      href="/timeline"
                      className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-center text-[9px] font-black text-cyan-300 hover:bg-cyan-300/20"
                    >
                      OPEN TIMELINE →
                    </a>

                  </div>

                </section>
              </>
            )}

            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / CROSS-EVIDENCE CORRELATION ENGINE
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

function EvidenceNode({
  label,
  id,
}: {
  label: string;
  id: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-5">

      <p className="text-[8px] font-black uppercase tracking-widest text-cyan-300">
        {label}
      </p>

      <p className="mt-3 break-all font-mono text-[10px] text-slate-400">
        {id}
      </p>

      <div className="mt-4 flex items-center gap-2">

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

        <span className="text-[8px] font-bold text-emerald-300">
          ACQUIRED
        </span>

      </div>

    </div>
  );
}