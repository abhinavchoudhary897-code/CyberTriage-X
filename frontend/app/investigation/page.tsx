"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

type Finding = {
  category?: string;
  evidence_id?: string;
  type?: string;
  value?: string;
  severity?: string;
  confidence?: string;
  description?: string;
};

type Priority = {
  priority?: string;
  reason?: string;
};

type InvestigationResult = {
  success: boolean;

  case?: {
    status?: string;
    evidence_sources?: number;
    timeline_events?: number;
    investigation_findings?: number;
  };

  risk?: {
    score?: number;
    level?: string;
    basis?: string;
  };

  evidence?: Array<{
    evidence_id?: string;
    source_file?: string;
    indicator_count?: number;
    finding_count?: number;
    status?: string;
  }>;

  indicator_inventory?: {
    ip_addresses?: number;
    urls?: number;
    domains?: number;
    email_addresses?: number;
    file_hashes?: number;
    timestamps?: number;
  };

  timeline?: Array<{
    timestamp?: string;
    timestamp_display?: string;
    evidence_id?: string;
    source_file?: string;
    event_type?: string;
    category?: string;
    confidence?: string;
    description?: string;
  }>;

  temporal_links?: Array<{
    from_evidence?: string;
    to_evidence?: string;
    from_timestamp?: string;
    to_timestamp?: string;
    difference_seconds?: number;
    relationship?: string;
    confidence?: string;
    reason?: string;
  }>;

  findings?: Finding[];

  priorities?: Priority[];

  summary?: string[];

  investigator_note?: string;

  pipeline?: {
    completed_stage?: string;
    previous_stage?: string;
    next_stage?: string;
  };
};

export default function InvestigationPage() {
  const [evidenceIds, setEvidenceIds] = useState(
    "EVD-20260918-6495D4F12DA9\nEVD-20260918-74CBCCFF788C"
  );

  const [result, setResult] =
    useState<InvestigationResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(
    "Investigation engine ready."
  );

  async function runInvestigation() {
    const ids = evidenceIds
      .split(/\n|,/)
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      setMessage("Enter at least one evidence ID.");
      return;
    }

    setLoading(true);
    setResult(null);
    setMessage(
      "Running complete forensic investigation..."
    );

    try {
      const response = await fetch(
        `${API}/api/evidence/investigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ids),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Investigation failed."
        );
      }

      setResult(data);

      setMessage(
        "Investigation workspace generated successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Investigation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const evidenceCount =
    result?.case?.evidence_sources ??
    result?.evidence?.length ??
    0;

  const indicatorCount =
    result?.evidence?.reduce(
      (total, item) =>
        total + (item.indicator_count ?? 0),
      0
    ) ?? 0;

  const findings =
    result?.findings ?? [];

  const findingCount =
    findings.length;

  const timelineCount =
    result?.timeline?.length ?? 0;

  const correlationCount =
    findings.filter(
      (finding) =>
        finding.type ===
          "CROSS_EVIDENCE_MATCH" ||
        finding.type ===
          "TEMPORAL_LINK"
    ).length;

  const priorities =
    result?.priorities ?? [];

  const riskScore =
    result?.risk?.score ?? 0;

  const riskLevel =
    result?.risk?.level ?? "INFO";

  const timeline =
    result?.timeline ?? [];

  const temporalLinks =
    result?.temporal_links ?? [];

  const inventory =
    result?.indicator_inventory ?? {};

  return (
    <main className="min-h-screen bg-[#03060b] text-white">

      {/* BACKGROUND */}
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

                <NavItem icon="⌂" label="Dashboard" href="/" />

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
                  active
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
                  Investigation Command Center
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Investigation Workspace
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
                07 / INVESTIGATION
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Forensic Investigation Workspace
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Consolidate evidence, indicators,
                correlations, intelligence and
                chronological events into a unified
                investigation view.
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
                ].map((stage, index) => (

                  <div
                    key={stage}
                    className="flex items-center"
                  >

                    <PipelineStep
                      number={String(
                        index + 1
                      ).padStart(2, "0")}
                      label={stage}
                      active={
                        stage ===
                        "INVESTIGATE"
                      }
                    />

                    {index < 6 && (
                      <PipelineLine />
                    )}

                  </div>

                ))}

              </div>

            </section>

            {/* CONTROL */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Investigation Console
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Case Evidence
                </h2>

                <p className="mt-2 text-[10px] text-slate-600">
                  Provide evidence IDs to execute the
                  complete investigation pipeline.
                </p>

              </div>

              <div className="p-6">

                <textarea
                  value={evidenceIds}
                  onChange={(event) =>
                    setEvidenceIds(
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-mono text-[10px] leading-6 text-cyan-200 outline-none focus:border-cyan-300/40"
                  placeholder="EVD-..."
                />

                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <p className="text-[9px] text-slate-600">
                    {message}
                  </p>

                  <button
                    onClick={runInvestigation}
                    disabled={loading}
                    className="rounded-xl bg-cyan-300 px-7 py-3 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading
                      ? "RUNNING INVESTIGATION..."
                      : "RUN FULL INVESTIGATION"}
                  </button>

                </div>

              </div>

            </section>

            {/* RESULTS */}
            {result && (
              <>

                {/* STATUS + RISK */}
                <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">

                  <div className="rounded-3xl border border-white/10 bg-[#080d16] p-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                          Case Status
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                          {result.case?.status ??
                            "INVESTIGATION READY"}
                        </h2>

                        <p className="mt-2 max-w-xl text-[10px] leading-6 text-slate-500">
                          The investigation engine has
                          consolidated the available
                          forensic analysis into a
                          structured case view.
                        </p>

                      </div>

                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4">

                        <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-300">
                          SYSTEM
                        </p>

                        <p className="mt-2 text-sm font-black text-emerald-300">
                          OPERATIONAL
                        </p>

                      </div>

                    </div>

                  </div>

                  <RiskCard
                    score={riskScore}
                    level={riskLevel}
                  />

                </section>

                {/* METRICS */}
                <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

                  <Metric
                    label="Evidence"
                    value={String(
                      evidenceCount
                    )}
                  />

                  <Metric
                    label="Indicators"
                    value={String(
                      indicatorCount
                    )}
                  />

                  <Metric
                    label="Findings"
                    value={String(
                      findingCount
                    )}
                  />

                  <Metric
                    label="Timeline"
                    value={String(
                      timelineCount
                    )}
                  />

                  <Metric
                    label="Correlations"
                    value={String(
                      correlationCount
                    )}
                  />

                </section>

                {/* INDICATOR INVENTORY */}
                <section className="mt-6">

                  <div className="mb-4">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Indicator Inventory
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Extracted Forensic Artifacts
                    </h2>

                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

                    <InventoryCard
                      label="IP Addresses"
                      value={
                        inventory.ip_addresses ?? 0
                      }
                    />

                    <InventoryCard
                      label="URLs"
                      value={
                        inventory.urls ?? 0
                      }
                    />

                    <InventoryCard
                      label="Domains"
                      value={
                        inventory.domains ?? 0
                      }
                    />

                    <InventoryCard
                      label="Emails"
                      value={
                        inventory.email_addresses ?? 0
                      }
                    />

                    <InventoryCard
                      label="Hashes"
                      value={
                        inventory.file_hashes ?? 0
                      }
                    />

                    <InventoryCard
                      label="Timestamps"
                      value={
                        inventory.timestamps ?? 0
                      }
                    />

                  </div>

                </section>

                {/* FINDINGS + PRIORITIES */}
                <section className="mt-6 grid gap-6 xl:grid-cols-2">

                  <div className="rounded-3xl border border-white/10 bg-[#080d16]">

                    <div className="border-b border-white/10 px-6 py-5">

                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                        Analytical Findings
                      </p>

                      <h2 className="mt-2 text-xl font-black">
                        Investigation Findings
                      </h2>

                    </div>

                    <div className="space-y-3 p-5">

                      {findings.length === 0 ? (

                        <p className="p-6 text-center text-xs text-slate-600">
                          No findings returned.
                        </p>

                      ) : (

                        findings.map(
                          (finding, index) => (
                            <FindingCard
                              key={index}
                              finding={finding}
                            />
                          )
                        )

                      )}

                    </div>

                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#080d16]">

                    <div className="border-b border-white/10 px-6 py-5">

                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-300">
                        Investigation Priorities
                      </p>

                      <h2 className="mt-2 text-xl font-black">
                        Analyst Priorities
                      </h2>

                    </div>

                    <div className="space-y-3 p-5">

                      {priorities.length === 0 ? (

                        <p className="p-6 text-center text-xs text-slate-600">
                          No priority actions returned.
                        </p>

                      ) : (

                        priorities.map(
                          (priority, index) => (
                            <PriorityCard
                              key={index}
                              priority={priority}
                              index={index}
                            />
                          )
                        )

                      )}

                    </div>

                  </div>

                </section>

                {/* TIMELINE */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <div className="border-b border-white/10 px-6 py-5">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Chronological Reconstruction
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Investigation Timeline
                    </h2>

                  </div>

                  <div className="divide-y divide-white/5">

                    {timeline.map(
                      (event, index) => (

                        <div
                          key={index}
                          className="grid gap-4 px-6 py-5 md:grid-cols-[180px_1fr_auto]"
                        >

                          <div>

                            <p className="font-mono text-[9px] text-cyan-300">
                              {event.timestamp_display ??
                                event.timestamp}
                            </p>

                            <p className="mt-2 text-[8px] uppercase tracking-widest text-slate-700">
                              {event.category ??
                                "FORENSIC EVENT"}
                            </p>

                          </div>

                          <div>

                            <p className="text-[10px] font-bold text-slate-300">
                              {event.event_type ??
                                "FORENSIC EVENT"}
                            </p>

                            <p className="mt-2 text-[9px] leading-5 text-slate-600">
                              {event.description}
                            </p>

                            <p className="mt-2 font-mono text-[8px] text-slate-700">
                              {event.evidence_id}
                            </p>

                          </div>

                          <span className="h-fit rounded-full border border-yellow-300/15 bg-yellow-300/10 px-3 py-1 text-[7px] font-black text-yellow-300">
                            {event.confidence ??
                              "MEDIUM"}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </section>

                {/* TEMPORAL LINKS */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <div className="border-b border-white/10 px-6 py-5">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-orange-300">
                      Cross-Evidence Relationships
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Temporal Correlations
                    </h2>

                  </div>

                  <div className="p-5">

                    {temporalLinks.length === 0 ? (

                      <p className="p-6 text-center text-xs text-slate-600">
                        No temporal relationships detected.
                      </p>

                    ) : (

                      <div className="space-y-3">

                        {temporalLinks.map(
                          (link, index) => (

                            <div
                              key={index}
                              className="rounded-2xl border border-orange-300/10 bg-orange-300/[0.025] p-5"
                            >

                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                <div>

                                  <p className="text-[9px] font-black text-orange-300">
                                    {link.relationship ??
                                      "TEMPORALLY RELATED"}
                                  </p>

                                  <p className="mt-2 font-mono text-[9px] text-slate-400">
                                    {link.from_evidence}
                                  </p>

                                  <p className="my-1 text-[8px] text-slate-700">
                                    ↓
                                  </p>

                                  <p className="font-mono text-[9px] text-slate-400">
                                    {link.to_evidence}
                                  </p>

                                </div>

                                <div className="text-right">

                                  <p className="text-2xl font-black text-orange-300">
                                    {link.difference_seconds}s
                                  </p>

                                  <p className="mt-1 text-[8px] uppercase tracking-widest text-slate-700">
                                    TIME GAP
                                  </p>

                                </div>

                              </div>

                              <p className="mt-4 border-t border-white/5 pt-4 text-[9px] leading-5 text-slate-600">
                                {link.reason}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </section>

                {/* INVESTIGATOR NOTE */}
                <section className="mt-6 rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.025] p-6">

                  <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-xs font-black text-cyan-300">
                      CT
                    </div>

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                        Investigator Note
                      </p>

                      <p className="mt-3 max-w-5xl text-[10px] leading-7 text-slate-500">
                        {result.investigator_note}
                      </p>

                    </div>

                  </div>

                </section>

                {/* NEXT */}
                <section className="mt-6 grid gap-4 md:grid-cols-2">

                  <a
                    href="/reports"
                    className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 transition hover:bg-cyan-300/[0.08]"
                  >

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Next Stage
                    </p>

                    <h3 className="mt-2 text-sm font-black">
                      Generate Forensic Report →
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-slate-600">
                      Convert the investigation workspace
                      into a structured forensic report.
                    </p>

                  </a>

                  <a
                    href="/timeline"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:bg-white/[0.04]"
                  >

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Review
                    </p>

                    <h3 className="mt-2 text-sm font-black">
                      Reopen Timeline →
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-slate-600">
                      Review chronological events and
                      temporal relationships.
                    </p>

                  </a>

                </section>

              </>
            )}

            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / INVESTIGATION ENGINE
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
  active,
}: {
  number: string;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[9px] font-black ${
          active
            ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-300"
            : "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
        }`}
      >
        {active ? number : "✓"}
      </span>

      <div>

        <p
          className={`text-[8px] font-black ${
            active
              ? "text-cyan-300"
              : "text-emerald-300"
          }`}
        >
          {label}
        </p>

        <p className="mt-0.5 text-[7px] text-slate-700">
          {active ? "ACTIVE" : "DONE"}
        </p>

      </div>

    </div>
  );
}


function PipelineLine() {
  return (
    <div className="mx-3 h-px min-w-[22px] flex-1 bg-white/10" />
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


function InventoryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080d16] p-4">

      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-cyan-300">
        {value}
      </p>

    </div>
  );
}


function RiskCard({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  const normalizedScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const levelUpper =
    String(level).toUpperCase();

  const riskClass =
    levelUpper === "CRITICAL"
      ? "text-red-300 border-red-300/20 bg-red-300/10"
      : levelUpper === "HIGH"
      ? "text-orange-300 border-orange-300/20 bg-orange-300/10"
      : levelUpper === "MEDIUM"
      ? "text-yellow-300 border-yellow-300/20 bg-yellow-300/10"
      : levelUpper === "LOW"
      ? "text-cyan-300 border-cyan-300/20 bg-cyan-300/10"
      : "text-emerald-300 border-emerald-300/20 bg-emerald-300/10";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#080d16] p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">
            Risk Assessment
          </p>

          <p className="mt-2 text-4xl font-black">
            {normalizedScore}
          </p>

        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-center ${riskClass}`}
        >

          <p className="text-[8px] font-black uppercase tracking-widest">
            Level
          </p>

          <p className="mt-1 text-xs font-black">
            {levelUpper}
          </p>

        </div>

      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-cyan-300 transition-all"
          style={{
            width: `${normalizedScore}%`,
          }}
        />

      </div>

      <p className="mt-3 text-[8px] text-slate-700">
        Deterministic risk score generated from
        extracted forensic intelligence.
      </p>

    </div>
  );
}


function FindingCard({
  finding,
}: {
  finding: Finding;
}) {
  const severity =
    finding.severity ?? "INFO";

  const severityUpper =
    severity.toUpperCase();

  const badge =
    severityUpper === "CRITICAL"
      ? "border-red-300/20 bg-red-300/10 text-red-300"
      : severityUpper === "HIGH"
      ? "border-orange-300/20 bg-orange-300/10 text-orange-300"
      : severityUpper === "MEDIUM"
      ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-300"
      : severityUpper === "LOW"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-300"
      : "border-slate-300/10 bg-slate-300/5 text-slate-400";

  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

      <div className="flex items-center justify-between gap-3">

        <span className="font-mono text-[8px] text-slate-700">
          {finding.type ??
            "FORENSIC FINDING"}
        </span>

        <span
          className={`rounded-full border px-2.5 py-1 text-[7px] font-black ${badge}`}
        >
          {severityUpper}
        </span>

      </div>

      <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-cyan-300">
        {finding.category ??
          finding.type ??
          "FORENSIC FINDING"}
      </p>

      <p className="mt-2 break-all font-mono text-[10px] text-slate-300">
        {finding.value ??
          "No value supplied"}
      </p>

      <p className="mt-3 text-[10px] leading-6 text-slate-600">
        {finding.description ??
          "Forensic finding identified during analysis."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">

        <span className="text-[7px] uppercase tracking-widest text-slate-700">
          Confidence
        </span>

        <span className="text-[8px] font-bold text-emerald-300">
          {finding.confidence ??
            "UNSPECIFIED"}
        </span>

      </div>

    </div>
  );
}


function PriorityCard({
  priority,
  index,
}: {
  priority: Priority;
  index: number;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

      <div className="flex gap-3">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-300/20 bg-yellow-300/10 text-[8px] font-black text-yellow-300">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-[10px] font-black text-slate-300">
              Investigation Priority
            </p>

            {priority.priority && (
              <span className="rounded-full border border-yellow-300/15 bg-yellow-300/10 px-2 py-1 text-[7px] font-black text-yellow-300">
                {priority.priority}
              </span>
            )}

          </div>

          <p className="mt-2 text-[9px] leading-5 text-slate-600">
            {priority.reason ??
              "Review this item against the available evidence."}
          </p>

        </div>

      </div>

    </div>
  );
}