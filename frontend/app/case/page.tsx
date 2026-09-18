"use client";

import { useState } from "react";

const API = "http://127.0.0.1:8000";

export default function CasePage() {
  const [caseId, setCaseId] = useState("CTX-2026-001");
  const [caseName, setCaseName] = useState(
    "Digital Forensic Investigation"
  );
  const [investigator, setInvestigator] = useState(
    "Forensic Investigator"
  );
  const [incident, setIncident] = useState(
    "Cyber Incident"
  );
  const [priority, setPriority] = useState("HIGH");
  const [status, setStatus] = useState("ACTIVE");
  const [saved, setSaved] = useState(false);

  function saveCase() {
    const caseData = {
      caseId,
      caseName,
      investigator,
      incident,
      priority,
      status,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "cybertriage_case",
      JSON.stringify(caseData)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function loadCase() {
    const stored =
      localStorage.getItem("cybertriage_case");

    if (!stored) return;

    try {
      const data = JSON.parse(stored);

      setCaseId(data.caseId ?? "CTX-2026-001");
      setCaseName(
        data.caseName ??
          "Digital Forensic Investigation"
      );
      setInvestigator(
        data.investigator ??
          "Forensic Investigator"
      );
      setIncident(
        data.incident ?? "Cyber Incident"
      );
      setPriority(data.priority ?? "HIGH");
      setStatus(data.status ?? "ACTIVE");
    } catch {
      // Ignore malformed local case data.
    }
  }

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
                  {caseId}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-300">
                  {caseName}
                </p>

                <div className="mt-3 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                  <span className="text-[9px] font-bold text-emerald-300">
                    {status} CASE
                  </span>

                </div>

              </div>

            </div>

            <nav className="flex-1 overflow-y-auto p-4">

              <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-700">
                Investigation
              </p>

              <div className="space-y-1">

                <Nav label="Dashboard" href="/" icon="⌂" />
                <Nav label="Evidence Vault" href="/evidence" icon="▣" />
                <Nav label="Acquisition" href="/acquisition" icon="⇩" />
                <Nav label="Classification" href="/classification" icon="◇" />
                <Nav label="IOC Explorer" href="/ioc" icon="⌕" />
                <Nav label="Correlation" href="/correlation" icon="⌁" />
                <Nav label="Timeline" href="/timeline" icon="◷" />
                <Nav label="Investigation" href="/investigation" icon="◎" />
                <Nav label="Reports" href="/reports" icon="▤" />
                <Nav label="Case Management" href="/case" icon="□" active />

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

          <header className="border-b border-white/10 bg-[#050911]/90">

            <div className="flex h-[72px] items-center justify-between px-5 lg:px-8">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Case Administration
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Case Management
                </h2>

              </div>

              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[9px] font-black text-emerald-300">
                ● SYSTEM READY
              </div>

            </div>

          </header>

          <div className="mx-auto max-w-[1200px] p-5 lg:p-8">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
              09 / CASE
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Investigation Case
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Configure the active forensic investigation
              and maintain its operational status.
            </p>

            <section className="mt-8 rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 p-6">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Case Configuration
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Investigation Details
                </h2>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <Field
                  label="Case ID"
                  value={caseId}
                  onChange={setCaseId}
                />

                <Field
                  label="Case Name"
                  value={caseName}
                  onChange={setCaseName}
                />

                <Field
                  label="Investigator"
                  value={investigator}
                  onChange={setInvestigator}
                />

                <Field
                  label="Incident Type"
                  value={incident}
                  onChange={setIncident}
                />

                <div>

                  <label className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white outline-none"
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>

                </div>

                <div>

                  <label className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Case Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white outline-none"
                  >
                    <option>ACTIVE</option>
                    <option>ON HOLD</option>
                    <option>CLOSED</option>
                  </select>

                </div>

              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 p-6 sm:flex-row sm:justify-end">

                <button
                  onClick={loadCase}
                  className="rounded-xl border border-white/10 px-6 py-3 text-[9px] font-black text-slate-400 hover:bg-white/[0.04]"
                >
                  LOAD SAVED CASE
                </button>

                <button
                  onClick={saveCase}
                  className="rounded-xl bg-cyan-300 px-7 py-3 text-[9px] font-black text-black hover:bg-cyan-200"
                >
                  SAVE CASE
                </button>

              </div>

            </section>

            {saved && (
              <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-[9px] font-bold text-emerald-300">
                ✓ CASE CONFIGURATION SAVED
              </div>
            )}

            <section className="mt-6 grid gap-4 md:grid-cols-3">

              <Info
                label="CASE ID"
                value={caseId}
              />

              <Info
                label="PRIORITY"
                value={priority}
              />

              <Info
                label="STATUS"
                value={status}
              />

            </section>

            <section className="mt-6 rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.025] p-6">

              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">
                Investigation Workflow
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <Workflow label="Evidence" status="READY" />
                <Workflow label="Analysis" status="READY" />
                <Workflow label="Investigation" status="READY" />
                <Workflow label="Reporting" status="READY" />

              </div>

            </section>

            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / CASE MANAGEMENT
            </footer>

          </div>

        </div>

      </div>

    </main>
  );
}

function Nav({
  label,
  href,
  icon,
  active,
}: {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
        active
          ? "border border-cyan-300/15 bg-cyan-300/10 text-cyan-200"
          : "text-slate-500 hover:bg-white/[0.04]"
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-[9px]">
        {icon}
      </span>

      <span className="text-[10px] font-bold">
        {label}
      </span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
      )}
    </a>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-300 outline-none focus:border-cyan-300/30"
      />
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080d16] p-5">

      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-3 font-mono text-sm font-black text-cyan-300">
        {value}
      </p>

    </div>
  );
}

function Workflow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.03] p-4">

      <div className="flex items-center justify-between">

        <span className="text-[9px] font-black text-slate-400">
          {label}
        </span>

        <span className="text-[7px] font-black text-emerald-300">
          ✓ {status}
        </span>

      </div>

    </div>
  );
}