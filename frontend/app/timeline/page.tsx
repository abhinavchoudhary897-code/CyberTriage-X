"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

type TimelineEvent = {
  timestamp: string;
  event_type: string;
  source: string;
  evidence_id: string;
  description: string;
  indicators?: string[];
};

type TimelineRelationship = {
  event_a: string;
  event_b: string;
  difference_seconds: number;
  confidence: string;
};

type TimelineResult = {
  success?: boolean;
  stage?: string;
  events?: TimelineEvent[];
  temporal_links?: TimelineRelationship[];
  summary?: {
    total_events?: number;
    category_counts?: Record<string, number>;
    temporal_link_count?: number;
  };
  analysis_note?: string;
};

export default function TimelinePage() {
  const [evidenceIds, setEvidenceIds] = useState(
    "EVD-20260918-6495D4F12DA9\nEVD-20260918-74CBCCFF788C"
  );

  const [result, setResult] =
    useState<TimelineResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(
    "Timeline engine ready."
  );

  async function buildTimeline() {
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
      "Building chronological forensic timeline..."
    );

    try {
      const response = await fetch(
        `${API}/api/evidence/timeline`,
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
          data?.detail ||
            "Timeline generation failed."
        );
      }

      const normalized: TimelineResult = {
        success: data?.success ?? true,
        stage: data?.stage ?? "TIMELINE",

        events: Array.isArray(data?.events)
          ? data.events
          : Array.isArray(data?.timeline)
          ? data.timeline
          : [],

        temporal_links: Array.isArray(
          data?.temporal_links
        )
          ? data.temporal_links
          : Array.isArray(
              data?.temporal_relationships
            )
          ? data.temporal_relationships
          : [],

        summary: {
          total_events:
            data?.summary?.total_events ??
            data?.events?.length ??
            data?.timeline?.length ??
            0,

          category_counts:
            data?.summary?.category_counts ??
            {},

          temporal_link_count:
            data?.summary
              ?.temporal_link_count ??
            data?.temporal_links?.length ??
            0,
        },

        analysis_note:
          data?.analysis_note ??
          "Timeline generated from extracted forensic timestamps.",
      };

      setResult(normalized);

      setMessage(
        "Forensic timeline generated successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Timeline generation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const events = result?.events ?? [];

  const temporalLinks =
    result?.temporal_links ?? [];

  const totalEvents =
    result?.summary?.total_events ??
    events.length;

  const totalLinks =
    result?.summary
      ?.temporal_link_count ??
    temporalLinks.length;

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

            {/* NAV */}
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
                />

                <NavItem
                  icon="◷"
                  label="Timeline"
                  href="/timeline"
                  active
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
                  Chronological Analysis
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Forensic Timeline
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
                06 / TIMELINE
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Forensic Event Timeline
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Reconstruct a chronological view of
                events extracted from digital evidence.
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
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  number="06"
                  label="TIMELINE"
                  status="ACTIVE"
                />

              </div>

            </section>

            {/* INPUT */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Timeline Console
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Evidence Sources
                </h2>

                <p className="mt-2 text-[10px] text-slate-600">
                  Enter one or more evidence IDs.
                  Separate multiple IDs using new lines.
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
                    onClick={buildTimeline}
                    disabled={loading}
                    className="rounded-xl bg-cyan-300 px-7 py-3 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading
                      ? "BUILDING TIMELINE..."
                      : "BUILD TIMELINE"}
                  </button>

                </div>

              </div>

            </section>

            {/* RESULTS */}
            {result && (
              <>

                {/* METRICS */}
                <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">

                  <Metric
                    label="Timeline Events"
                    value={String(totalEvents)}
                  />

                  <Metric
                    label="Temporal Links"
                    value={String(totalLinks)}
                  />

                  <Metric
                    label="Evidence Sources"
                    value={String(
                      new Set(
                        events.map(
                          (event) =>
                            event.evidence_id
                        )
                      ).size
                    )}
                  />

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

                  {events.length === 0 ? (

                    <div className="p-12 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-300/10 text-yellow-300">
                        !
                      </div>

                      <p className="mt-4 text-xs font-bold text-slate-500">
                        No timestamped events detected.
                      </p>

                      <p className="mt-2 text-[10px] text-slate-700">
                        Make sure the selected evidence
                        contains recognizable timestamps.
                      </p>

                    </div>

                  ) : (

                    <div className="p-6">

                      <div className="relative">

                        {/* TIMELINE LINE */}
                        <div className="absolute bottom-0 left-[15px] top-0 w-px bg-cyan-300/10" />

                        <div className="space-y-7">

                          {events.map(
                            (event, index) => (

                              <TimelineCard
                                key={`${event.timestamp}-${index}`}
                                event={event}
                                index={index}
                              />

                            )
                          )}

                        </div>

                      </div>

                    </div>

                  )}

                </section>

                {/* TEMPORAL LINKS */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <div className="border-b border-white/10 px-6 py-5">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Event Relationships
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Temporal Correlations
                    </h2>

                  </div>

                  {temporalLinks.length === 0 ? (

                    <div className="p-10 text-center">

                      <p className="text-xs text-slate-600">
                        No temporal links detected.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-3 p-6">

                      {temporalLinks.map(
                        (link, index) => (

                          <div
                            key={index}
                            className="rounded-2xl border border-white/5 bg-black/20 p-5"
                          >

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                              <div className="min-w-0">

                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
                                  EVENT A
                                </p>

                                <p className="mt-2 break-all font-mono text-[9px] text-slate-400">
                                  {link.event_a}
                                </p>

                              </div>

                              <div className="flex shrink-0 items-center gap-3">

                                <div className="h-px w-10 bg-cyan-300/20" />

                                <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-center">

                                  <p className="text-[8px] font-bold text-cyan-300">
                                    {link.difference_seconds}s
                                  </p>

                                  <p className="mt-1 text-[7px] text-emerald-300">
                                    {link.confidence ??
                                      "MEDIUM"}
                                  </p>

                                </div>

                                <div className="h-px w-10 bg-cyan-300/20" />

                              </div>

                              <div className="min-w-0">

                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
                                  EVENT B
                                </p>

                                <p className="mt-2 break-all font-mono text-[9px] text-slate-400">
                                  {link.event_b}
                                </p>

                              </div>

                            </div>

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
                        Timeline Analysis Note
                      </p>

                      <p className="mt-2 max-w-4xl text-[10px] leading-6 text-slate-500">
                        {result.analysis_note ??
                          "Timeline events should be validated against their original evidence sources."}
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
                        Investigation Workspace
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-600">
                        Combine evidence, intelligence,
                        correlations and timeline findings
                        into one investigation view.
                      </p>

                    </div>

                    <a
                      href="/investigation"
                      className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-center text-[9px] font-black text-cyan-300 hover:bg-cyan-300/20"
                    >
                      OPEN INVESTIGATION →
                    </a>

                  </div>

                </section>

              </>
            )}

            {/* FOOTER */}
            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / FORENSIC TIMELINE ENGINE
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
  status: "DONE" | "ACTIVE";
}) {
  const active = status === "ACTIVE";

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


function TimelineCard({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  return (
    <div className="relative pl-12">

      {/* DOT */}
      <div className="absolute left-[9px] top-5 z-10 h-3 w-3 rounded-full border-2 border-cyan-300 bg-[#080d16]" />

      <div className="rounded-2xl border border-white/5 bg-black/20 p-5 transition hover:border-cyan-300/10">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[8px] font-black text-cyan-300">
                {event.event_type ??
                  "GENERAL"}
              </span>

              <span className="text-[8px] text-slate-700">
                EVENT #{String(index + 1).padStart(2, "0")}
              </span>

            </div>

            <p className="mt-3 font-mono text-xs font-bold text-slate-300">
              {event.timestamp}
            </p>

            <p className="mt-3 text-[10px] leading-6 text-slate-500">
              {event.description ??
                "Forensic event detected in evidence."}
            </p>

          </div>

          <div className="shrink-0 rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <p className="text-[7px] uppercase tracking-widest text-slate-700">
              Evidence
            </p>

            <p className="mt-2 max-w-[180px] break-all font-mono text-[8px] text-cyan-300">
              {event.evidence_id}
            </p>

          </div>

        </div>

        {event.indicators &&
          event.indicators.length > 0 && (

            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">

              {event.indicators.map(
                (indicator, indicatorIndex) => (

                  <span
                    key={indicatorIndex}
                    className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[8px] text-slate-500"
                  >
                    {indicator}
                  </span>

                )
              )}

            </div>

          )}

        <div className="mt-4 flex items-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

          <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-300">
            Event Extracted
          </span>

        </div>

      </div>

    </div>
  );
}