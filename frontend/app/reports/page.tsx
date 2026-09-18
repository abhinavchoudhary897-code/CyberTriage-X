"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

type ReportResult = {
  success?: boolean;
  report_id?: string;
  generated_at?: string;

  case?: {
    status?: string;
    evidence_count?: number;
    finding_count?: number;
    timeline_event_count?: number;
    temporal_relationship_count?: number;
  };

  risk_assessment?: {
    score?: number;
    level?: string;
    reasons?: string[];
  };

  evidence?: Array<{
    evidence_id?: string;
    filename?: string;
    category?: string;
    sha256?: string;
    md5?: string;
    size?: string;
    integrity?: string;
  }>;

  findings?: Array<{
    id?: string;
    type?: string;
    value?: string;
    severity?: string;
    confidence?: string;
    description?: string;
  }>;

  timeline?: Array<{
    timestamp?: string;
    event_type?: string;
    evidence_id?: string;
    description?: string;
  }>;

  temporal_relationships?: Array<{
    event_a?: string;
    event_b?: string;
    difference_seconds?: number;
    confidence?: string;
  }>;

  priorities?: Array<{
    priority?: string;
    title?: string;
    description?: string;
  }>;

  summary?: string;
  conclusion?: string;

  pipeline?: Array<{
    stage?: string;
    status?: string;
  }>;
};

export default function ReportsPage() {
  const [evidenceIds, setEvidenceIds] = useState(
    "EVD-20260918-6495D4F12DA9\nEVD-20260918-74CBCCFF788C"
  );

  const [report, setReport] =
    useState<ReportResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(
    "Forensic reporting engine ready."
  );

  async function generateReport() {
    const ids = evidenceIds
      .split(/\n|,/)
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      setMessage("Enter at least one evidence ID.");
      return;
    }

    setLoading(true);
    setReport(null);
    setMessage(
      "Generating structured forensic report..."
    );

    try {
      const response = await fetch(
        `${API}/api/evidence/report`,
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
            "Report generation failed."
        );
      }

      setReport(data);

      setMessage(
        "Forensic report generated successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Report generation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadJSON() {
    if (!report) return;

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download = `${
      report.report_id ??
      "cybertriage-forensic-report"
    }.json`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function downloadTextReport() {
    if (!report) return;

    const text = buildTextReport(report);

    const blob = new Blob(
      [text],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download = `${
      report.report_id ??
      "cybertriage-forensic-report"
    }.txt`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  }

  const caseInfo =
    report?.case ?? {};

  const risk =
    report?.risk_assessment ?? {};

  const evidence =
    report?.evidence ?? [];

  const findings =
    report?.findings ?? [];

  const timeline =
    report?.timeline ?? [];

  const relationships =
    report?.temporal_relationships ?? [];

  const priorities =
    report?.priorities ?? [];

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
                  active
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
                  Forensic Documentation
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Investigation Reports
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
                08 / REPORTING
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Forensic Report Center
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Generate a structured investigation
                report from acquired digital evidence,
                forensic findings, risk intelligence and
                timeline analysis.
              </p>

            </section>

            {/* PIPELINE */}
            <section className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#080d16] p-4">

              <div className="flex min-w-[850px] items-center justify-between">

                <PipelineStep
                  label="EVIDENCE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="ACQUIRE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="CLASSIFY"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="EXTRACT"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="CORRELATE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="TIMELINE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="INVESTIGATE"
                  status="DONE"
                />

                <PipelineLine />

                <PipelineStep
                  label="REPORT"
                  status="ACTIVE"
                />

              </div>

            </section>

            {/* GENERATOR */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Report Generator
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Evidence Sources
                </h2>

                <p className="mt-2 text-[10px] text-slate-600">
                  Generate a complete forensic report
                  from one or more acquired evidence
                  artifacts.
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
                    onClick={generateReport}
                    disabled={loading}
                    className="rounded-xl bg-cyan-300 px-7 py-3 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading
                      ? "GENERATING REPORT..."
                      : "GENERATE FORENSIC REPORT"}
                  </button>

                </div>

              </div>

            </section>

            {/* REPORT */}
            {report && (
              <>

                {/* REPORT HEADER */}
                <section className="mt-6 rounded-3xl border border-cyan-300/15 bg-[#080d16]">

                  <div className="border-b border-white/10 p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                          Generated Forensic Report
                        </p>

                        <h2 className="mt-2 break-all text-xl font-black">
                          {report.report_id ??
                            "FORENSIC-REPORT"}
                        </h2>

                        <p className="mt-2 font-mono text-[9px] text-slate-600">
                          Generated:{" "}
                          {formatDate(
                            report.generated_at
                          )}
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-3">

                        <button
                          onClick={downloadJSON}
                          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-[9px] font-black text-cyan-300 hover:bg-cyan-300/20"
                        >
                          ↓ JSON EXPORT
                        </button>

                        <button
                          onClick={
                            downloadTextReport
                          }
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[9px] font-black text-slate-300 hover:bg-white/[0.06]"
                        >
                          ↓ TEXT EXPORT
                        </button>

                      </div>

                    </div>

                  </div>

                </section>

                {/* CASE METRICS */}
                <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

                  <Metric
                    label="Evidence"
                    value={String(
                      caseInfo.evidence_count ??
                        evidence.length
                    )}
                  />

                  <Metric
                    label="Findings"
                    value={String(
                      caseInfo.finding_count ??
                        findings.length
                    )}
                  />

                  <Metric
                    label="Timeline"
                    value={String(
                      caseInfo.timeline_event_count ??
                        timeline.length
                    )}
                  />

                  <Metric
                    label="Temporal Links"
                    value={String(
                      caseInfo.temporal_relationship_count ??
                        relationships.length
                    )}
                  />

                  <Metric
                    label="Risk Score"
                    value={String(
                      risk.score ?? 0
                    )}
                  />

                  <Metric
                    label="Risk Level"
                    value={String(
                      risk.level ?? "INFO"
                    )}
                  />

                </section>

                {/* SUMMARY + RISK */}
                <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">

                  <div className="rounded-3xl border border-white/10 bg-[#080d16] p-6">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Executive Summary
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Investigation Summary
                    </h2>

                    <p className="mt-5 text-[10px] leading-7 text-slate-500">
                      {report.summary ??
                        "No investigation summary was returned by the reporting engine."}
                    </p>

                  </div>

                  <RiskPanel
                    score={risk.score ?? 0}
                    level={
                      risk.level ?? "INFO"
                    }
                  />

                </section>

                {/* EVIDENCE */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <SectionHeader
                    eyebrow="01 / EVIDENCE"
                    title="Evidence Register"
                  />

                  {evidence.length === 0 ? (

                    <Empty text="No evidence records returned." />

                  ) : (

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[900px]">

                        <thead>

                          <tr className="border-b border-white/5 text-left">

                            <Th>ID</Th>
                            <Th>FILE</Th>
                            <Th>CATEGORY</Th>
                            <Th>SIZE</Th>
                            <Th>INTEGRITY</Th>
                            <Th>SHA-256</Th>

                          </tr>

                        </thead>

                        <tbody>

                          {evidence.map(
                            (item, index) => (

                              <tr
                                key={
                                  item.evidence_id ??
                                  index
                                }
                                className="border-b border-white/5"
                              >

                                <Td mono cyan>
                                  {item.evidence_id ??
                                    "—"}
                                </Td>

                                <Td>
                                  {item.filename ??
                                    "—"}
                                </Td>

                                <Td>
                                  {item.category ??
                                    "—"}
                                </Td>

                                <Td>
                                  {item.size ??
                                    "—"}
                                </Td>

                                <Td>

                                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 text-[7px] font-black text-emerald-300">
                                    {item.integrity ??
                                      "VERIFIED"}
                                  </span>

                                </Td>

                                <Td mono>
                                  {shortHash(
                                    item.sha256
                                  )}
                                </Td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </section>

                {/* FINDINGS */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <SectionHeader
                    eyebrow="02 / ANALYSIS"
                    title="Forensic Findings"
                  />

                  {findings.length === 0 ? (

                    <Empty text="No findings returned." />

                  ) : (

                    <div className="grid gap-3 p-6 md:grid-cols-2">

                      {findings.map(
                        (finding, index) => (

                          <FindingCard
                            key={
                              finding.id ??
                              index
                            }
                            finding={finding}
                          />

                        )
                      )}

                    </div>

                  )}

                </section>

                {/* TIMELINE */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <SectionHeader
                    eyebrow="03 / TIMELINE"
                    title="Chronological Events"
                  />

                  {timeline.length === 0 ? (

                    <Empty text="No timeline events returned." />

                  ) : (

                    <div className="space-y-3 p-6">

                      {timeline.map(
                        (event, index) => (

                          <div
                            key={index}
                            className="rounded-2xl border border-white/5 bg-black/20 p-4"
                          >

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                              <div>

                                <p className="font-mono text-[10px] font-bold text-cyan-300">
                                  {event.timestamp ??
                                    "UNKNOWN TIME"}
                                </p>

                                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {event.event_type ??
                                    "GENERAL EVENT"}
                                </p>

                                <p className="mt-2 text-[10px] leading-5 text-slate-600">
                                  {event.description ??
                                    "Forensic event detected."}
                                </p>

                              </div>

                              <span className="break-all rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 font-mono text-[8px] text-slate-600">
                                {event.evidence_id ??
                                  "UNKNOWN"}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </section>

                {/* TEMPORAL */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <SectionHeader
                    eyebrow="04 / CORRELATION"
                    title="Temporal Relationships"
                  />

                  {relationships.length === 0 ? (

                    <Empty text="No temporal relationships returned." />

                  ) : (

                    <div className="space-y-3 p-6">

                      {relationships.map(
                        (relationship, index) => (

                          <div
                            key={index}
                            className="rounded-2xl border border-white/5 bg-black/20 p-5"
                          >

                            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">

                              <div>

                                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-700">
                                  EVENT A
                                </p>

                                <p className="mt-2 break-all font-mono text-[9px] text-slate-400">
                                  {relationship.event_a ??
                                    "—"}
                                </p>

                              </div>

                              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/10 px-4 py-3 text-center">

                                <p className="text-[8px] font-black text-cyan-300">
                                  {relationship.difference_seconds ??
                                    0}
                                  s
                                </p>

                                <p className="mt-1 text-[7px] text-emerald-300">
                                  {relationship.confidence ??
                                    "MEDIUM"}
                                </p>

                              </div>

                              <div>

                                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-700">
                                  EVENT B
                                </p>

                                <p className="mt-2 break-all font-mono text-[9px] text-slate-400">
                                  {relationship.event_b ??
                                    "—"}
                                </p>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </section>

                {/* PRIORITIES */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

                  <SectionHeader
                    eyebrow="05 / RESPONSE"
                    title="Investigation Priorities"
                  />

                  {priorities.length === 0 ? (

                    <Empty text="No priorities returned." />

                  ) : (

                    <div className="grid gap-3 p-6 md:grid-cols-2">

                      {priorities.map(
                        (priority, index) => (

                          <div
                            key={index}
                            className="rounded-2xl border border-yellow-300/10 bg-yellow-300/[0.025] p-5"
                          >

                            <div className="flex gap-3">

                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-300/20 bg-yellow-300/10 text-[8px] font-black text-yellow-300">
                                {String(
                                  index + 1
                                ).padStart(2, "0")}
                              </span>

                              <div>

                                <div className="flex flex-wrap gap-2">

                                  <p className="text-[10px] font-black text-slate-300">
                                    {priority.title ??
                                      "Investigation Priority"}
                                  </p>

                                  {priority.priority && (
                                    <span className="rounded-full border border-yellow-300/15 bg-yellow-300/10 px-2 py-1 text-[7px] font-black text-yellow-300">
                                      {
                                        priority.priority
                                      }
                                    </span>
                                  )}

                                </div>

                                <p className="mt-2 text-[9px] leading-5 text-slate-600">
                                  {priority.description ??
                                    "Review against the original evidence."}
                                </p>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </section>

                {/* CONCLUSION */}
                <section className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.025] p-6">

                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    06 / CONCLUSION
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    Forensic Assessment
                  </h2>

                  <p className="mt-5 max-w-5xl text-[10px] leading-7 text-slate-500">
                    {report.conclusion ??
                      "No conclusion was returned by the forensic reporting engine."}
                  </p>

                </section>

                {/* FOOTER ACTIONS */}
                <section className="mt-6 grid gap-4 md:grid-cols-3">

                  <button
                    onClick={downloadJSON}
                    className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 text-left hover:bg-cyan-300/[0.08]"
                  >

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                      Export
                    </p>

                    <p className="mt-2 text-sm font-black">
                      Download JSON →
                    </p>

                  </button>

                  <button
                    onClick={
                      downloadTextReport
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left hover:bg-white/[0.04]"
                  >

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Export
                    </p>

                    <p className="mt-2 text-sm font-black">
                      Download Text Report →
                    </p>

                  </button>

                  <a
                    href="/"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04]"
                  >

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Navigation
                    </p>

                    <p className="mt-2 text-sm font-black">
                      Return Dashboard →
                    </p>

                  </a>

                </section>

              </>
            )}

            {/* FOOTER */}
            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / FORENSIC REPORTING ENGINE
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
  label,
  status,
}: {
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
        {active ? "08" : "✓"}
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
    <div className="mx-2 h-px min-w-[18px] flex-1 bg-white/10" />
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

      <p className="mt-3 break-all text-xl font-black">
        {value}
      </p>

    </div>
  );
}


function RiskPanel({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const upper =
    String(level).toUpperCase();

  const badge =
    upper === "CRITICAL"
      ? "border-red-300/20 bg-red-300/10 text-red-300"
      : upper === "HIGH"
      ? "border-orange-300/20 bg-orange-300/10 text-orange-300"
      : upper === "MEDIUM"
      ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-300"
      : upper === "LOW"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-300"
      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-300";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#080d16] p-6">

      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">
        Risk Assessment
      </p>

      <div className="mt-4 flex items-end justify-between">

        <p className="text-5xl font-black">
          {safeScore}
        </p>

        <span
          className={`rounded-xl border px-3 py-2 text-[8px] font-black ${badge}`}
        >
          {upper}
        </span>

      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-cyan-300"
          style={{
            width: `${safeScore}%`,
          }}
        />

      </div>

      <p className="mt-3 text-[8px] leading-5 text-slate-700">
        Deterministic risk assessment generated from
        forensic findings and cross-evidence analysis.
      </p>

    </div>
  );
}


function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="border-b border-white/10 px-6 py-5">

      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-black">
        {title}
      </h2>

    </div>
  );
}


function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="p-10 text-center">

      <p className="text-xs text-slate-600">
        {text}
      </p>

    </div>
  );
}


function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-[7px] font-black uppercase tracking-widest text-slate-700">
      {children}
    </th>
  );
}


function Td({
  children,
  mono,
  cyan,
}: {
  children: React.ReactNode;
  mono?: boolean;
  cyan?: boolean;
}) {
  return (
    <td
      className={`px-5 py-4 text-[9px] ${
        mono ? "font-mono" : ""
      } ${
        cyan
          ? "text-cyan-300"
          : "text-slate-500"
      }`}
    >
      {children}
    </td>
  );
}


function FindingCard({
  finding,
}: {
  finding: {
    id?: string;
    type?: string;
    value?: string;
    severity?: string;
    confidence?: string;
    description?: string;
  };
}) {
  const severity =
    String(
      finding.severity ?? "INFO"
    ).toUpperCase();

  const badge =
    severity === "CRITICAL"
      ? "border-red-300/20 bg-red-300/10 text-red-300"
      : severity === "HIGH"
      ? "border-orange-300/20 bg-orange-300/10 text-orange-300"
      : severity === "MEDIUM"
      ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-300"
      : severity === "LOW"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-300"
      : "border-slate-300/10 bg-slate-300/5 text-slate-400";

  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-5">

      <div className="flex items-center justify-between gap-3">

        <span className="font-mono text-[8px] text-slate-700">
          {finding.id ?? "FINDING"}
        </span>

        <span
          className={`rounded-full border px-2.5 py-1 text-[7px] font-black ${badge}`}
        >
          {severity}
        </span>

      </div>

      <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-cyan-300">
        {finding.type ??
          "FORENSIC FINDING"}
      </p>

      <p className="mt-2 break-all font-mono text-[10px] text-slate-300">
        {finding.value ??
          "No value supplied"}
      </p>

      <p className="mt-3 text-[9px] leading-6 text-slate-600">
        {finding.description ??
          "Forensic finding identified during analysis."}
      </p>

      <div className="mt-4 border-t border-white/5 pt-3">

        <span className="text-[7px] uppercase tracking-widest text-slate-700">
          Confidence
        </span>

        <span className="ml-3 text-[8px] font-bold text-emerald-300">
          {finding.confidence ??
            "UNSPECIFIED"}
        </span>

      </div>

    </div>
  );
}


function shortHash(
  value?: string
) {
  if (!value) return "—";

  if (value.length <= 22) {
    return value;
  }

  return `${value.slice(
    0,
    12
  )}...${value.slice(-8)}`;
}


function formatDate(
  value?: string
) {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}


function buildTextReport(
  report: ReportResult
) {
  const lines: string[] = [];

  lines.push(
    "CYBERTRIAGE X - FORENSIC INVESTIGATION REPORT"
  );

  lines.push(
    "=================================================="
  );

  lines.push(
    `Report ID: ${
      report.report_id ?? "N/A"
    }`
  );

  lines.push(
    `Generated: ${
      report.generated_at ?? "N/A"
    }`
  );

  lines.push("");

  lines.push("CASE SUMMARY");
  lines.push(
    "--------------------------------------------------"
  );

  lines.push(
    `Evidence: ${
      report.case?.evidence_count ?? 0
    }`
  );

  lines.push(
    `Findings: ${
      report.case?.finding_count ?? 0
    }`
  );

  lines.push(
    `Timeline Events: ${
      report.case?.timeline_event_count ?? 0
    }`
  );

  lines.push(
    `Temporal Relationships: ${
      report.case
        ?.temporal_relationship_count ?? 0
    }`
  );

  lines.push("");

  lines.push("RISK ASSESSMENT");
  lines.push(
    "--------------------------------------------------"
  );

  lines.push(
    `Score: ${
      report.risk_assessment?.score ?? 0
    }`
  );

  lines.push(
    `Level: ${
      report.risk_assessment?.level ??
      "INFO"
    }`
  );

  lines.push("");

  lines.push("SUMMARY");
  lines.push(
    "--------------------------------------------------"
  );

  lines.push(
    report.summary ??
      "No summary available."
  );

  lines.push("");

  lines.push("FINDINGS");
  lines.push(
    "--------------------------------------------------"
  );

  for (
    const finding of report.findings ?? []
  ) {
    lines.push(
      `${finding.id ?? "FINDING"} | ${
        finding.type ?? "UNKNOWN"
      } | ${
        finding.severity ?? "INFO"
      } | ${
        finding.value ?? "N/A"
      }`
    );
  }

  lines.push("");

  lines.push("CONCLUSION");
  lines.push(
    "--------------------------------------------------"
  );

  lines.push(
    report.conclusion ??
      "No conclusion available."
  );

  lines.push("");

  lines.push(
    "Generated by CyberTriage X Forensic Reporting Engine"
  );

  return lines.join("\n");
}