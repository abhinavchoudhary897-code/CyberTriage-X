"use client";

import { useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const DEFAULT_EVIDENCE_IDS = [
  "EVD-20260918-6495D4F12DA9",
  "EVD-20260918-74CBCCFF788C",
];

const navigation = [
  { name: "Dashboard", icon: "⌂", path: "/" },
  { name: "Evidence Vault", icon: "▣", path: "/evidence" },
  { name: "Acquisition", icon: "⇩", path: "/acquisition" },
  { name: "Classification", icon: "◇", path: "/classification" },
  { name: "IOC Explorer", icon: "⌕", path: "/ioc" },
  { name: "Correlation", icon: "⌁", path: "/correlation" },
  { name: "Timeline", icon: "◷", path: "/timeline" },
  { name: "Investigation", icon: "◎", path: "/investigation" },
  { name: "Reports", icon: "▤", path: "/reports" },
  { name: "Case Management", icon: "□", path: "/case" },
];

type SystemHealth = {
  status?: string;
  service?: string;
  version?: string;
};

type PipelineStage = {
  stage: string;
  name: string;
  status: string;
  description?: string;
};

type DashboardData = {
  evidence: number;
  indicators: number;
  findings: number;
  timeline: number;
  correlations: number;
  riskScore: number | null;
  riskLevel: string;
};

const PIPELINE_DEFAULTS: PipelineStage[] = [
  {
    stage: "EVIDENCE",
    name: "Evidence Collection",
    status: "WAITING",
  },
  {
    stage: "ACQUIRE",
    name: "Evidence Acquisition",
    status: "WAITING",
  },
  {
    stage: "CLASSIFY",
    name: "Evidence Classification",
    status: "WAITING",
  },
  {
    stage: "EXTRACT",
    name: "Artifact & IOC Extraction",
    status: "WAITING",
  },
  {
    stage: "CORRELATE",
    name: "Cross-Evidence Correlation",
    status: "WAITING",
  },
  {
    stage: "TIMELINE",
    name: "Forensic Timeline",
    status: "WAITING",
  },
  {
    stage: "INVESTIGATE",
    name: "Investigation Workspace",
    status: "WAITING",
  },
  {
    stage: "REPORT",
    name: "Forensic Reporting",
    status: "WAITING",
  },
];

export default function Home() {
  const [apiOnline, setApiOnline] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [pipeline, setPipeline] =
    useState<PipelineStage[]>(PIPELINE_DEFAULTS);

  const [pipelineStatus, setPipelineStatus] =
    useState("OFFLINE");

  const [dashboard, setDashboard] =
    useState<DashboardData>({
      evidence: 0,
      indicators: 0,
      findings: 0,
      timeline: 0,
      correlations: 0,
      riskScore: null,
      riskLevel: "NO ASSESSMENT",
    });

  const [caseData, setCaseData] = useState({
    id: "CTX-2026-001",
    name: "Digital Incident",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      const healthResponse = await fetch(`${API}/health`);

      if (!healthResponse.ok) {
        setApiOnline(false);
        return;
      }

      const healthData = await healthResponse.json();

      setHealth(healthData);
      setApiOnline(true);

      await loadPipeline();
      loadSavedCase();
      await loadInvestigationData();
    } catch {
      setApiOnline(false);
      setPipelineStatus("OFFLINE");
    }
  }

  async function loadPipeline() {
    try {
      const response = await fetch(
        `${API}/api/system/pipeline`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (Array.isArray(data?.pipeline)) {
        setPipeline(data.pipeline);
      }

      setPipelineStatus(
        typeof data?.pipeline_status === "string"
          ? data.pipeline_status
          : "OPERATIONAL"
      );
    } catch {
      setPipelineStatus("UNAVAILABLE");
    }
  }

  function getStage(stageName: string) {
    return (
      pipeline.find(
        (item) => item.stage === stageName
      ) ?? {
        stage: stageName,
        name: stageName,
        status: "WAITING",
      }
    );
  }

  function stageIsActive(stageName: string) {
    return (
      getStage(stageName).status === "ACTIVE"
    );
  }

  function stageStatus(stageName: string) {
    if (!apiOnline) return "OFFLINE";

    return getStage(stageName).status;
  }

  function loadSavedCase() {
    const stored =
      localStorage.getItem("cybertriage_case");

    if (!stored) return;

    try {
      const data = JSON.parse(stored);

      setCaseData({
        id: data.caseId ?? "CTX-2026-001",
        name:
          data.caseName ?? "Digital Incident",
        status: data.status ?? "ACTIVE",
      });
    } catch {
      // Ignore malformed local case data.
    }
  }

  async function loadInvestigationData() {
    try {
      const response = await fetch(
        `${API}/api/evidence/investigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            DEFAULT_EVIDENCE_IDS
          ),
        }
      );

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      const evidence =
        typeof result?.case?.evidence_sources ===
        "number"
          ? result.case.evidence_sources
          : Array.isArray(result?.evidence)
          ? result.evidence.length
          : DEFAULT_EVIDENCE_IDS.length;

      const indicators = Array.isArray(
        result?.evidence
      )
        ? result.evidence.reduce(
            (
              total: number,
              item: any
            ) =>
              total +
              (Number(
                item?.indicator_count
              ) || 0),
            0
          )
        : 0;

      const findings = Array.isArray(
        result?.findings
      )
        ? result.findings.length
        : typeof result?.case
              ?.investigation_findings ===
          "number"
        ? result.case
            .investigation_findings
        : 0;

      const timeline = Array.isArray(
        result?.timeline
      )
        ? result.timeline.length
        : typeof result?.case?.timeline_events ===
          "number"
        ? result.case.timeline_events
        : 0;

      const correlations = Array.isArray(
        result?.findings
      )
        ? result.findings.filter(
            (item: any) =>
              item?.type ===
                "CROSS_EVIDENCE_MATCH" ||
              item?.type === "TEMPORAL_LINK"
          ).length
        : 0;

      const riskScore =
        typeof result?.risk?.score ===
        "number"
          ? result.risk.score
          : null;

      const riskLevel =
        typeof result?.risk?.level ===
        "string"
          ? result.risk.level
          : "NO ASSESSMENT";

      setDashboard({
        evidence,
        indicators,
        findings,
        timeline,
        correlations,
        riskScore,
        riskLevel,
      });
    } catch {
      // Keep previous dashboard values.
    }
  }

  const riskDisplay =
    dashboard.riskScore !== null
      ? `${dashboard.riskScore}`
      : "—";

  const activeStages = pipeline.filter(
    (stage) => stage.status === "ACTIVE"
  ).length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#02050a] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(34,211,238,.12),transparent_30%),radial-gradient(circle_at_15%_70%,rgba(59,130,246,.08),transparent_28%)]" />

        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(34,211,238,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.06)_1px,transparent_1px)] [background-size:45px_45px]" />

        <div className="absolute left-[20%] top-[15%] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.025] blur-[100px]" />

        <div className="absolute right-[-100px] top-[40%] h-[450px] w-[450px] rounded-full bg-blue-500/[0.035] blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-r border-white/10 bg-[#040811]/95 backdrop-blur-2xl lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/20 to-blue-500/10 shadow-[0_0_35px_rgba(34,211,238,.15)]">
                  <div className="absolute inset-[5px] rounded-xl border border-cyan-300/10" />
                  <span className="relative text-sm font-black text-cyan-300">
                    CT
                  </span>
                </div>

                <div>
                  <h1 className="text-sm font-black tracking-tight">
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

              <div className="mt-3 rounded-2xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.06] to-transparent p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.03)]">
                <p className="font-mono text-[10px] text-cyan-300">
                  {caseData.id}
                </p>

                <p className="mt-2 text-xs font-bold text-slate-300">
                  {caseData.name}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />

                  <span className="text-[9px] font-bold text-emerald-300">
                    {caseData.status}{" "}
                    INVESTIGATION
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-700">
                Investigation
              </p>

              <div className="space-y-1">
                {navigation.map(
                  (item, index) => {
                    const active = index === 0;

                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          if (
                            item.path !== "/"
                          ) {
                            window.location.href =
                              item.path;
                          }
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                          active
                            ? "border border-cyan-300/15 bg-cyan-300/10 text-cyan-200 shadow-[inset_0_0_25px_rgba(34,211,238,.035)]"
                            : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                            active
                              ? "bg-cyan-300 text-black shadow-[0_0_18px_rgba(34,211,238,.25)]"
                              : "bg-white/[0.04] text-slate-600 group-hover:text-slate-300"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="text-[10px] font-bold tracking-wide">
                          {item.name}
                        </span>

                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </nav>

            <div className="border-t border-white/10 p-5">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.035] to-transparent p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Backend
                  </span>

                  <span
                    className={`h-2 w-2 rounded-full ${
                      apiOnline
                        ? "bg-emerald-300 shadow-[0_0_10px_#6ee7b7]"
                        : "bg-red-400 shadow-[0_0_10px_#f87171]"
                    }`}
                  />
                </div>

                <p
                  className={`mt-2 text-[10px] font-bold ${
                    apiOnline
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {apiOnline
                    ? "API ONLINE"
                    : "API OFFLINE"}
                </p>

                <p className="mt-1 font-mono text-[8px] text-slate-700">
                  {health?.version ||
                    "Waiting for API"}
                </p>

                <div className="mt-3 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[8px]">
                    <span className="text-slate-700">
                      PIPELINE
                    </span>

                    <span className="font-mono text-cyan-300">
                      {activeStages}/8
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050911]/85 backdrop-blur-2xl">
            <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Investigation Console
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2 md:block">
                  <p className="text-[8px] uppercase tracking-widest text-slate-700">
                    Pipeline
                  </p>

                  <p className="mt-1 text-[9px] font-bold text-emerald-300">
                    {pipelineStatus}
                  </p>
                </div>

                <div
                  className={`rounded-xl border px-3 py-2 text-[9px] font-black ${
                    apiOnline
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
                      : "border-red-300/20 bg-red-300/10 text-red-300"
                  }`}
                >
                  ●{" "}
                  {apiOnline
                    ? "API ONLINE"
                    : "API OFFLINE"}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] p-5 lg:p-8">
            <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0d1a2a] via-[#07101b] to-[#03070c] shadow-[0_30px_100px_rgba(0,0,0,.35)]">
              <div className="absolute right-[-100px] top-[-140px] h-[400px] w-[400px] rounded-full border border-cyan-300/[0.04] bg-cyan-300/[0.025] blur-[2px]" />

              <div className="absolute right-[40px] top-[70px] hidden h-[240px] w-[240px] rounded-full border border-cyan-300/10 lg:block">
                <div className="absolute inset-7 rounded-full border border-cyan-300/[0.08]" />
                <div className="absolute inset-14 rounded-full border border-cyan-300/[0.08]" />

                <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom rotate-[35deg] bg-gradient-to-t from-cyan-300/30 to-transparent" />

                <div className="absolute left-[20%] top-[35%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_15px_#67e8f9]" />
                <div className="absolute right-[25%] top-[62%] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
              </div>

              <div className="relative grid lg:grid-cols-[1fr_340px]">
                <div className="p-7 lg:p-11">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_15px_#67e8f9]" />

                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                      Digital Forensic Operations
                    </span>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    From raw evidence to{" "}
                    <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                      actionable investigation.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500">
                    CyberTriage X provides a centralized
                    forensic workflow for acquiring,
                    classifying, extracting, correlating
                    and investigating digital evidence.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="/evidence"
                      className="rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-black shadow-[0_0_30px_rgba(34,211,238,.15)] transition hover:bg-cyan-200 hover:shadow-[0_0_40px_rgba(34,211,238,.25)]"
                    >
                      OPEN EVIDENCE VAULT
                    </a>

                    <a
                      href="/investigation"
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-[10px] font-bold text-slate-300 transition hover:border-cyan-300/20 hover:bg-white/[0.08]"
                    >
                      INVESTIGATION WORKSPACE
                    </a>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-black/20 p-7 lg:border-l lg:border-t-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">
                      System Overview
                    </p>

                    <span className="font-mono text-[8px] text-slate-700">
                      {activeStages}/08
                    </span>
                  </div>

                  <div className="mt-6 space-y-2">
                    <StatusRow label="Evidence Engine" status={stageStatus("EVIDENCE")} />
                    <StatusRow label="Acquisition Engine" status={stageStatus("ACQUIRE")} />
                    <StatusRow label="Classification Engine" status={stageStatus("CLASSIFY")} />
                    <StatusRow label="Extraction Engine" status={stageStatus("EXTRACT")} />
                    <StatusRow label="Correlation Engine" status={stageStatus("CORRELATE")} />
                    <StatusRow label="Timeline Engine" status={stageStatus("TIMELINE")} />
                    <StatusRow label="Investigation Engine" status={stageStatus("INVESTIGATE")} />
                    <StatusRow label="Report Engine" status={stageStatus("REPORT")} />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <DashboardMetric
                label="Evidence Sources"
                value={`${dashboard.evidence}`}
                detail={
                  dashboard.evidence > 0
                    ? "Registered evidence"
                    : "Awaiting acquisition"
                }
              />

              <DashboardMetric
                label="Indicators"
                value={`${dashboard.indicators}`}
                detail={
                  dashboard.indicators > 0
                    ? "Extracted indicators"
                    : "Awaiting extraction"
                }
              />

              <DashboardMetric
                label="Findings"
                value={`${dashboard.findings}`}
                detail={
                  dashboard.findings > 0
                    ? "Investigation findings"
                    : "Awaiting analysis"
                }
              />

              <DashboardMetric
                label="Risk Priority"
                value={riskDisplay}
                detail={
                  dashboard.riskScore !== null
                    ? dashboard.riskLevel
                    : "No active assessment"
                }
                highlight
              />
            </section>

            <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <MiniMetric label="Timeline Events" value={dashboard.timeline} />
              <MiniMetric label="Correlations" value={dashboard.correlations} />
              <MiniMetric label="Risk Level" value={dashboard.riskLevel} />
            </section>

            <section className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[#070c14] shadow-[0_25px_80px_rgba(0,0,0,.25)]">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Forensic Pipeline
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Investigation Workflow
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      Live status received from the
                      CyberTriage X backend.
                    </p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-[8px] uppercase tracking-widest text-slate-700">
                      Pipeline State
                    </p>

                    <p className="mt-1 font-mono text-xs font-black text-emerald-300">
                      {pipelineStatus}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <WorkflowCard number="01" title="Evidence" description="Register digital artifacts." active={stageIsActive("EVIDENCE")} status={stageStatus("EVIDENCE")} />
                <WorkflowCard number="02" title="Acquire" description="Preserve and fingerprint evidence." active={stageIsActive("ACQUIRE")} status={stageStatus("ACQUIRE")} />
                <WorkflowCard number="03" title="Classify" description="Identify evidence type and category." active={stageIsActive("CLASSIFY")} status={stageStatus("CLASSIFY")} />
                <WorkflowCard number="04" title="Extract" description="Discover forensic indicators." active={stageIsActive("EXTRACT")} status={stageStatus("EXTRACT")} />
                <WorkflowCard number="05" title="Correlate" description="Connect evidence relationships." active={stageIsActive("CORRELATE")} status={stageStatus("CORRELATE")} />
                <WorkflowCard number="06" title="Timeline" description="Reconstruct chronological events." active={stageIsActive("TIMELINE")} status={stageStatus("TIMELINE")} />
                <WorkflowCard number="07" title="Investigate" description="Build investigator context." active={stageIsActive("INVESTIGATE")} status={stageStatus("INVESTIGATE")} />
                <WorkflowCard number="08" title="Report" description="Generate case documentation." active={stageIsActive("REPORT")} status={stageStatus("REPORT")} />
              </div>
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#091421] to-[#050a11] p-6">
                <div className="absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full border border-cyan-300/[0.06]" />
                <div className="absolute right-[-25px] top-[-25px] h-32 w-32 rounded-full border border-cyan-300/[0.05]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Forensic Command Monitor
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <CommandStat label="Pipeline" value={`${activeStages}/8`} detail="ACTIVE STAGES" />
                  <CommandStat label="Integrity" value="SHA-256" detail="PRIMARY HASH" />
                  <CommandStat label="Mode" value="LOCAL" detail="FORENSIC VAULT" />
                </div>

                <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
                      System Activity
                    </span>

                    <span className="flex items-center gap-2 text-[8px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                      LIVE
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <ActivityLine label="Evidence acquisition" value={stageStatus("ACQUIRE")} />
                    <ActivityLine label="IOC extraction" value={stageStatus("EXTRACT")} />
                    <ActivityLine label="Cross-evidence correlation" value={stageStatus("CORRELATE")} />
                    <ActivityLine label="Investigation reconstruction" value={stageStatus("INVESTIGATE")} />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#080d16] p-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Risk Intelligence
                </p>

                <div className="mt-6 flex items-center justify-center">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-cyan-300/10 bg-[radial-gradient(circle,rgba(34,211,238,.08),transparent_60%)]">
                    <div className="absolute inset-4 rounded-full border border-cyan-300/10" />
                    <div className="absolute inset-8 rounded-full border border-cyan-300/[0.08]" />

                    <div className="text-center">
                      <p className="font-mono text-4xl font-black text-cyan-300">
                        {riskDisplay}
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">
                        Risk Score
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <span className="rounded-full border border-cyan-300/10 bg-cyan-300/[0.05] px-4 py-2 text-[9px] font-black text-cyan-300">
                    {dashboard.riskLevel}
                  </span>
                </div>

                <p className="mt-5 text-center text-[9px] leading-5 text-slate-700">
                  Deterministic forensic triage.
                  Investigator validation required.
                </p>
              </div>
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <QuickAction
                title="Evidence Acquisition"
                description="Upload and preserve digital evidence with cryptographic fingerprints."
                button="OPEN VAULT"
                href="/evidence"
              />

              <QuickAction
                title="IOC Investigation"
                description="Explore extracted IP addresses, domains, URLs, hashes and emails."
                button="EXPLORE IOCs"
                href="/ioc"
              />

              <QuickAction
                title="Case Investigation"
                description="Review correlations, timeline events, findings and investigation context."
                button="OPEN WORKSPACE"
                href="/investigation"
              />
            </section>

            <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700 sm:flex-row">
              <span>
                CYBERTRIAGE X / SIH1744
              </span>

              <span>
                Evidence Integrity • Deterministic
                Analysis • Investigator Validation
              </span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const online = status === "ACTIVE";

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
      <span className="text-[10px] text-slate-500">
        {label}
      </span>

      <span
        className={`flex items-center gap-2 text-[8px] font-black ${
          online
            ? "text-emerald-300"
            : status === "OFFLINE"
            ? "text-red-300"
            : "text-slate-600"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            online
              ? "bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"
              : status === "OFFLINE"
              ? "bg-red-400"
              : "bg-slate-700"
          }`}
        />

        {online ? "ACTIVE" : status}
      </span>
    </div>
  );
}

function DashboardMetric({
  label,
  value,
  detail,
  highlight,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
        highlight
          ? "border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.07] to-[#080d16] shadow-[0_15px_45px_rgba(34,211,238,.05)]"
          : "border-white/10 bg-gradient-to-br from-[#0b111b] to-[#070b12]"
      }`}
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-300/[0.025] blur-2xl" />

      <p className="relative text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
        {label}
      </p>

      <p
        className={`relative mt-3 text-3xl font-black ${
          highlight
            ? "text-cyan-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="relative mt-1 text-[9px] text-slate-700">
        {detail}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b111b] to-[#070b12] px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
          {label}
        </span>

        <span className="font-mono text-xs font-black text-cyan-300">
          {value}
        </span>
      </div>
    </div>
  );
}

function WorkflowCard({
  number,
  title,
  description,
  active,
  status,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
  status: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
        active
          ? "border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.065] to-transparent shadow-[0_15px_40px_rgba(34,211,238,.035)]"
          : "border-white/5 bg-black/20 hover:border-white/10"
      }`}
    >
      {active && (
        <div className="absolute right-[-20px] top-[-20px] h-20 w-20 rounded-full bg-cyan-300/[0.04] blur-xl" />
      )}

      <div className="relative flex items-center justify-between">
        <span
          className={`font-mono text-[9px] ${
            active
              ? "text-cyan-300"
              : "text-slate-700"
          }`}
        >
          {number}
        </span>

        <span
          className={`rounded-full px-2 py-1 text-[7px] font-black ${
            active
              ? "bg-emerald-300/10 text-emerald-300"
              : "bg-white/[0.03] text-slate-700"
          }`}
        >
          {active
            ? "ACTIVE"
            : status}
        </span>
      </div>

      <h3 className="relative mt-5 text-sm font-black">
        {title}
      </h3>

      <p className="relative mt-2 text-[10px] leading-5 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function CommandStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
        {label}
      </p>

      <p className="mt-2 font-mono text-xl font-black text-cyan-300">
        {value}
      </p>

      <p className="mt-1 text-[7px] font-bold text-slate-700">
        {detail}
      </p>
    </div>
  );
}

function ActivityLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const active = value === "ACTIVE";

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-emerald-300 shadow-[0_0_7px_#6ee7b7]"
              : "bg-slate-700"
          }`}
        />

        <span className="text-[9px] text-slate-500">
          {label}
        </span>
      </div>

      <span
        className={`font-mono text-[8px] font-bold ${
          active
            ? "text-emerald-300"
            : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function QuickAction({
  title,
  description,
  button,
  href,
}: {
  title: string;
  description: string;
  button: string;
  href: string;
}) {
  return (
    <div className="group rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b111b] to-[#070b12] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/15">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
        Quick Access
      </p>

      <h3 className="mt-3 text-lg font-black">
        {title}
      </h3>

      <p className="mt-3 min-h-[50px] text-xs leading-6 text-slate-600">
        {description}
      </p>

      <a
        href={href}
        className="mt-5 inline-block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[9px] font-black text-slate-300 transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-200"
      >
        {button}
      </a>
    </div>
  );
}