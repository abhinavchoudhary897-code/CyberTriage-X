"use client";

import { useEffect, useRef, useState } from "react";

const API = "http://127.0.0.1:8000";

type Evidence = {
  evidence_id: string;
  original_filename?: string;
  file_size_human?: string;
  mime_type?: string;
  file_extension?: string;
  md5?: string;
  sha256?: string;
  acquired_at?: string;
  acquisition_duration_ms?: number;
  evidence_category?: string;
  processing_status?: string;
  integrity_status?: string;
  acquisition_method?: string;
};

type UploadResponse = {
  success: boolean;
  message: string;
  evidence: Evidence;
};

export default function EvidenceVault() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  const [message, setMessage] = useState(
    "Evidence acquisition vault ready."
  );

  useEffect(() => {
    checkBackend();
  }, []);

  async function checkBackend() {
    try {
      const response = await fetch(`${API}/health`);
      setApiOnline(response.ok);
    } catch {
      setApiOnline(false);
    }
  }

  function selectFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    setFiles(Array.from(selectedFiles));

    setMessage(
      `${selectedFiles.length} artifact(s) selected and ready for acquisition.`
    );
  }

  function removeFile(name: string) {
    setFiles((current) =>
      current.filter((file) => file.name !== name)
    );
  }

  async function acquireEvidence() {
    if (!files.length) {
      setMessage(
        "Select at least one evidence artifact first."
      );
      return;
    }

    if (!apiOnline) {
      setMessage(
        "Backend API is offline. Start the FastAPI server first."
      );
      return;
    }

    setBusy(true);

    try {
      const uploaded: Evidence[] = [];

      for (const file of files) {
        setMessage(`Acquiring ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API}/api/evidence/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data =
          (await response.json()) as
            | UploadResponse
            | { detail?: string };

        if (!response.ok) {
          throw new Error(
            "detail" in data && data.detail
              ? data.detail
              : `Acquisition failed for ${file.name}`
          );
        }

        if ("evidence" in data) {
          uploaded.push(data.evidence);
        }
      }

      setEvidence((current) => [
        ...uploaded,
        ...current,
      ]);

      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        `${uploaded.length} evidence artifact(s) successfully acquired and integrity verified.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Evidence acquisition failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyEvidence(item: Evidence) {
    setMessage(
      `Verifying integrity of ${item.evidence_id}...`
    );

    try {
      const response = await fetch(
        `${API}/api/evidence/verify/${item.evidence_id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Integrity verification failed."
        );
      }

      if (data.verification?.verified) {
        setMessage(
          `${item.evidence_id}: SHA-256 integrity verified.`
        );
      } else {
        setMessage(
          `${item.evidence_id}: integrity verification failed.`
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Verification failed."
      );
    }
  }

  function clearSelection() {
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessage("Selection cleared.");
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
                  active
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

                  <span
                    className={`h-2 w-2 rounded-full ${
                      apiOnline
                        ? "bg-emerald-300"
                        : "bg-red-400"
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
                  Evidence Operations
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Evidence Vault
                </h2>
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
          </header>

          <div className="mx-auto max-w-[1500px] p-5 lg:p-8">

            {/* TITLE */}
            <section className="mb-6">

              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                01 / EVIDENCE
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Evidence Acquisition Vault
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Acquire digital artifacts, preserve their
                original content and generate cryptographic
                fingerprints for forensic integrity.
              </p>

            </section>

            {/* METRICS */}
            <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

              <VaultMetric
                label="Artifacts"
                value={String(evidence.length)}
                detail="Acquired"
              />

              <VaultMetric
                label="Selected"
                value={String(files.length)}
                detail="Pending acquisition"
              />

              <VaultMetric
                label="Integrity"
                value={
                  evidence.length
                    ? "VERIFIED"
                    : "READY"
                }
                detail="SHA-256"
              />

              <VaultMetric
                label="Backend"
                value={
                  apiOnline
                    ? "ONLINE"
                    : "OFFLINE"
                }
                detail="FastAPI"
                highlight
              />

            </section>

            {/* ACQUISITION */}
            <section className="rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Acquisition Interface
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Register New Evidence
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Select forensic artifacts for secure
                  local acquisition.
                </p>

              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_330px]">

                {/* DROP ZONE */}
                <div
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={(event) => {
                    event.preventDefault();

                    selectFiles(
                      event.dataTransfer.files
                    );
                  }}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group cursor-pointer rounded-2xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.025] p-8 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.04]"
                >

                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-300 transition group-hover:scale-105">
                      ↑
                    </div>

                    <h3 className="mt-5 text-sm font-black">
                      Drop evidence artifacts here
                    </h3>

                    <p className="mt-2 max-w-lg text-xs leading-6 text-slate-600">
                      Or click to browse files from your
                      computer. Multiple artifacts can be
                      acquired together.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-2">

                      {[
                        ".TXT",
                        ".LOG",
                        ".CSV",
                        ".JSON",
                        ".XML",
                        ".ZIP",
                        ".PCAP",
                        ".EVTX",
                      ].map((type) => (
                        <span
                          key={type}
                          className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[8px] text-slate-600"
                        >
                          {type}
                        </span>
                      ))}

                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) =>
                        selectFiles(
                          event.target.files
                        )
                      }
                    />

                  </div>
                </div>

                {/* PROTOCOL */}
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Acquisition Protocol
                  </p>

                  <div className="mt-5 space-y-4">

                    <Protocol
                      number="01"
                      title="Registration"
                      text="Generate unique evidence identifier."
                    />

                    <Protocol
                      number="02"
                      title="Preservation"
                      text="Store original artifact in forensic vault."
                    />

                    <Protocol
                      number="03"
                      title="Write Verification"
                      text="Confirm preserved byte count."
                    />

                    <Protocol
                      number="04"
                      title="SHA-256"
                      text="Generate primary cryptographic fingerprint."
                    />

                    <Protocol
                      number="05"
                      title="Classification"
                      text="Determine evidence category and metadata."
                    />

                  </div>
                </div>

              </div>

              {/* SELECTED FILES */}
              {files.length > 0 && (
                <div className="border-t border-white/10 p-6">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-300">
                        Pending Acquisition
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {files.length} artifact(s)
                      </p>
                    </div>

                    <button
                      onClick={clearSelection}
                      className="rounded-lg border border-white/5 px-3 py-2 text-[9px] font-bold text-slate-600 hover:bg-white/5 hover:text-slate-300"
                    >
                      CLEAR
                    </button>

                  </div>

                  <div className="mt-4 space-y-2">

                    {files.map((file) => (
                      <div
                        key={`${file.name}-${file.size}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3"
                      >

                        <div className="min-w-0">

                          <p className="truncate text-xs font-bold text-slate-300">
                            {file.name}
                          </p>

                          <p className="mt-1 font-mono text-[8px] text-slate-700">
                            {formatBytes(file.size)}
                          </p>

                        </div>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();

                            removeFile(
                              file.name
                            );
                          }}
                          className="ml-4 rounded-lg px-3 py-2 text-[9px] font-bold text-red-300 hover:bg-red-300/10"
                        >
                          REMOVE
                        </button>

                      </div>
                    ))}

                  </div>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      acquireEvidence();
                    }}
                    disabled={busy}
                    className="mt-5 rounded-xl bg-cyan-300 px-6 py-3 text-[10px] font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy
                      ? "ACQUIRING..."
                      : "ACQUIRE SELECTED EVIDENCE"}
                  </button>

                  <p className="mt-3 text-[9px] text-slate-700">
                    {message}
                  </p>

                </div>
              )}

              {files.length === 0 && (
                <div className="border-t border-white/10 px-6 py-4">
                  <p className="text-[9px] text-slate-700">
                    {message}
                  </p>
                </div>
              )}

            </section>

            {/* REGISTRY */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-[#080d16]">

              <div className="border-b border-white/10 px-6 py-5">

                <div className="flex flex-wrap items-end justify-between gap-3">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Evidence Registry
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Acquired Artifacts
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      Evidence registered during this
                      browser session.
                    </p>

                  </div>

                  <span className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 font-mono text-[9px] text-slate-600">
                    {evidence.length} ARTIFACTS
                  </span>

                </div>

              </div>

              {evidence.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center p-6 text-center">

                  <div>

                    <div className="text-3xl text-slate-800">
                      ▣
                    </div>

                    <p className="mt-4 text-xs font-bold text-slate-600">
                      No evidence acquired
                    </p>

                    <p className="mt-2 text-[10px] text-slate-700">
                      Acquired artifacts will appear here.
                    </p>

                  </div>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1000px] text-left">

                    <thead className="bg-white/[0.025]">

                      <tr className="text-[8px] uppercase tracking-widest text-slate-600">

                        <th className="px-6 py-4">
                          Evidence ID
                        </th>

                        <th className="px-6 py-4">
                          Artifact
                        </th>

                        <th className="px-6 py-4">
                          Category
                        </th>

                        <th className="px-6 py-4">
                          Size
                        </th>

                        <th className="px-6 py-4">
                          Integrity
                        </th>

                        <th className="px-6 py-4">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {evidence.map((item) => (
                        <tr
                          key={item.evidence_id}
                          className="border-t border-white/5 transition hover:bg-white/[0.015]"
                        >

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                setSelected(item)
                              }
                              className="font-mono text-[9px] text-cyan-300 hover:text-cyan-200"
                            >
                              {item.evidence_id}
                            </button>

                          </td>

                          <td className="px-6 py-4">

                            <p className="max-w-[220px] truncate text-xs text-slate-300">
                              {item.original_filename}
                            </p>

                            <p className="mt-1 font-mono text-[8px] text-slate-700">
                              {item.file_extension}
                            </p>

                          </td>

                          <td className="px-6 py-4 text-[9px] text-slate-500">
                            {item.evidence_category ||
                              "UNCLASSIFIED"}
                          </td>

                          <td className="px-6 py-4 font-mono text-[9px] text-slate-600">
                            {item.file_size_human ||
                              "—"}
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[8px] font-black text-emerald-300">
                              {item.integrity_status ||
                                "VERIFIED"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                verifyEvidence(
                                  item
                                )
                              }
                              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[8px] font-black text-slate-400 hover:bg-white/[0.07] hover:text-white"
                            >
                              VERIFY
                            </button>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>
                </div>
              )}

            </section>

            {/* INSPECTOR */}
            {selected && (
              <section className="mt-6 rounded-3xl border border-cyan-300/10 bg-[#080d16]">

                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Artifact Inspector
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      {selected.original_filename}
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setSelected(null)
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-[9px] font-bold text-slate-500 hover:text-white"
                  >
                    CLOSE
                  </button>

                </div>

                <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">

                  <Detail
                    label="Evidence ID"
                    value={
                      selected.evidence_id
                    }
                  />

                  <Detail
                    label="Category"
                    value={
                      selected.evidence_category ||
                      "UNKNOWN"
                    }
                  />

                  <Detail
                    label="File Size"
                    value={
                      selected.file_size_human ||
                      "UNKNOWN"
                    }
                  />

                  <Detail
                    label="MIME Type"
                    value={
                      selected.mime_type ||
                      "UNKNOWN"
                    }
                  />

                  <Detail
                    label="MD5"
                    value={
                      selected.md5 ||
                      "NOT AVAILABLE"
                    }
                    mono
                  />

                  <Detail
                    label="SHA-256"
                    value={
                      selected.sha256 ||
                      "NOT AVAILABLE"
                    }
                    mono
                  />

                  <Detail
                    label="Acquisition Method"
                    value={
                      selected.acquisition_method ||
                      "LOCAL FORENSIC UPLOAD"
                    }
                  />

                  <Detail
                    label="Processing Status"
                    value={
                      selected.processing_status ||
                      "ACQUIRED"
                    }
                  />

                  <Detail
                    label="Integrity"
                    value={
                      selected.integrity_status ||
                      "VERIFIED"
                    }
                  />

                </div>
              </section>
            )}

            <footer className="mt-8 border-t border-white/5 py-6 text-[8px] uppercase tracking-[0.2em] text-slate-700">
              CYBERTRIAGE X / EVIDENCE ACQUISITION /
              CRYPTOGRAPHIC INTEGRITY
            </footer>

          </div>
        </div>
      </div>
    </main>
  );
}

/* COMPONENTS */

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
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
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

function VaultMetric({
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
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-cyan-300/20 bg-cyan-300/[0.045]"
          : "border-white/10 bg-[#080d16]"
      }`}
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-black ${
          highlight
            ? "text-cyan-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-700">
        {detail}
      </p>
    </div>
  );
}

function Protocol({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">

      <span className="font-mono text-[9px] text-cyan-300">
        {number}
      </span>

      <div>

        <p className="text-[10px] font-bold text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-[9px] leading-5 text-slate-700">
          {text}
        </p>

      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4">

      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-700">
        {label}
      </p>

      <p
        className={`mt-2 break-all text-[10px] text-slate-400 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(2)} ${units[index]}`;
}