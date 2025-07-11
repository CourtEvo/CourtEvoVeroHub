import React, { useState } from "react";
import { saveAs } from "file-saver";
import { FaClipboardCheck, FaStar, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

// Grant requirements list
const REQUIREMENTS = [
  {
    key: "purpose",
    label: "Clear Funding Purpose",
    help: "Is the goal and impact of the funding clearly stated?",
  },
  {
    key: "budget",
    label: "Detailed Budget Submitted",
    help: "Is there a transparent, compliant, and realistic project budget attached?",
  },
  {
    key: "docs",
    label: "All Required Documents Ready",
    help: "Statute, registration, tax number, prior-year accounts, certificates—all uploaded and in date?",
  },
  {
    key: "timeline",
    label: "Realistic Timeline",
    help: "Is the project timeline feasible and matches the grant period?",
  },
  {
    key: "inclusion",
    label: "Inclusion/DEI Commitment",
    help: "Does your program meet all inclusion/diversity requirements of the grant?",
  },
  {
    key: "reporting",
    label: "Reporting & Monitoring Plan",
    help: "Are outcome measurement and reporting methods in place and documented?",
  },
  {
    key: "cofunding",
    label: "Co-funding or Match Secured",
    help: "Is any required co-funding or club contribution secured and documented?",
  },
  {
    key: "sustainability",
    label: "Sustainability/Legacy",
    help: "Will the project have positive impact after funding ends? Is there a plan for sustainability?",
  },
  {
    key: "deadline",
    label: "Deadline Compliance",
    help: "Is the application ready before the deadline, with time to spare for review?",
  },
];

// Status colors
const STATUS = [
  { label: "Not Ready", color: "#e24242", icon: <FaExclamationTriangle /> },
  { label: "At Risk", color: "#FFD700", icon: <FaClock /> },
  { label: "Ready", color: "#1de682", icon: <FaCheckCircle /> },
  { label: "Elite", color: "#1de682", icon: <FaStar /> }
];

// Helper
function getStatus(checks, daysLeft) {
  const total = checks.length;
  const complete = checks.filter(c => c.status === 2).length;
  if (complete === total && daysLeft > 2) return 3; // Elite
  if (complete === total) return 2; // Ready
  if (complete >= total - 2 && daysLeft > 1) return 1; // At Risk
  return 0; // Not Ready
}

// --- Main Component ---
export default function GrantApplicationAnalyzer() {
  const [grant, setGrant] = useState({
    name: "City Sport Grant",
    deadline: "",
    daysLeft: "",
    link: "",
  });
  const [checks, setChecks] = useState(REQUIREMENTS.map(r => ({
    ...r,
    status: 0, // 0=Not Met, 1=Partial, 2=Met
    notes: ""
  })));

  // Deadline calculation
  function handleDeadlineChange(val) {
    setGrant(g => ({ ...g, deadline: val }));
    if (val) {
      const days = Math.ceil((new Date(val) - new Date()) / (1000 * 60 * 60 * 24));
      setGrant(g => ({ ...g, daysLeft: days }));
    }
  }

  // Grant status
  const statIdx = getStatus(checks, grant.daysLeft || 0);
  const status = STATUS[statIdx];
  const percent = Math.round((checks.filter(c => c.status === 2).length / checks.length) * 100);

  // Recommendations
  const recs = checks
    .filter(c => c.status < 2)
    .map(c => `• ${c.label}: ${c.notes || c.help}`);

  // Export
  function exportPDF() {
    const content = [
      `CourtEvo Vero Grant Application Analyzer | ${new Date().toLocaleDateString()}`,
      "-------------------------------------",
      `Grant: ${grant.name}`,
      `Deadline: ${grant.deadline || "-"} | Days Left: ${grant.daysLeft || "-"}`,
      "",
      ...checks.map(
        (c) =>
          `${c.label}: ${c.status === 2 ? "Met" : c.status === 1 ? "Partial" : "Not Met"}\nNotes: ${c.notes || "-"}\n`
      ),
      "-------------------------------------",
      `Grant Status: ${status.label}`,
      "",
      "Key Recommendations:",
      ...recs,
      "",
      "Powered by CourtEvo Vero | BE REAL. BE VERO."
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_GrantAnalyzer_${new Date().toISOString().slice(0,10)}.txt`);
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-3" style={{ fontFamily: "Segoe UI, sans-serif", color: "#fff" }}>
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="bg-[#181e23cc] rounded-2xl p-3 shadow-lg flex items-center">
          <FaClipboardCheck size={44} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700" }}>
            Grant Application<br /><span className="text-[#1de682]">Analyzer</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-1 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
      </div>

      {/* Grant Info */}
      <div className="rounded-2xl mb-7 px-6 py-5" style={{
        background: "linear-gradient(90deg, #1e2a35cc 75%, #22292Fcc 100%)",
        border: "1.5px solid #FFD70055"
      }}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/2">
            <label className="font-bold">Grant Program</label>
            <input className="block w-full mt-1 bg-[#22272d] rounded px-2 py-1 border border-[#FFD70033]" value={grant.name}
              onChange={e => setGrant(g => ({ ...g, name: e.target.value }))} />
          </div>
          <div className="w-full md:w-1/4">
            <label className="font-bold">Deadline</label>
            <input type="date" className="block w-full mt-1 bg-[#22272d] rounded px-2 py-1 border border-[#FFD70033]"
              value={grant.deadline} onChange={e => handleDeadlineChange(e.target.value)} />
            <div className="mt-1 text-[#FFD700] text-sm">
              {grant.daysLeft !== "" && (
                <>
                  Days left: <span className={grant.daysLeft > 5 ? "text-[#1de682]" : grant.daysLeft > 2 ? "text-[#FFD700]" : "text-[#e24242]"}>{grant.daysLeft}</span>
                </>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/4">
            <label className="font-bold">Grant Link</label>
            <input className="block w-full mt-1 bg-[#22272d] rounded px-2 py-1 border border-[#FFD70033]" value={grant.link}
              onChange={e => setGrant(g => ({ ...g, link: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Progress & Status */}
      <div className="mb-7 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl" style={{ color: status.color }}>{status.icon}</span>
            <span className="font-black text-lg" style={{ color: status.color }}>{status.label}</span>
            <span className="ml-3 text-base text-[#FFD700]">Checklist: {percent}%</span>
          </div>
          <div className="w-full bg-[#22272d] h-5 rounded-full mt-3 shadow-inner relative overflow-hidden">
            <div className="transition-all duration-500" style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg,#e24242 0%,#FFD700 60%,#1de682 100%)`,
              height: "100%",
              borderRadius: "inherit",
              boxShadow: "0 1px 8px 0 #0003"
            }} />
          </div>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
            onClick={exportPDF}
          >Export PDF</button>
        </div>
      </div>

      {/* Checklist */}
      <div className="grid gap-6 mb-10">
        {checks.map((c, idx) => (
          <div key={c.key} className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-[#181e23] rounded-xl shadow p-5 border-l-8"
            style={{ borderColor: c.status === 2 ? "#1de682" : c.status === 1 ? "#FFD700" : "#e24242" }}>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg" style={{ color: c.status === 2 ? "#1de682" : c.status === 1 ? "#FFD700" : "#e24242" }}>
                {c.label}
              </div>
              <div className="text-sm text-gray-400">{c.help}</div>
              <textarea
                placeholder="Notes / Missing Docs / Actions"
                className="w-full mt-2 p-2 rounded-lg bg-[#23292f] text-white"
                value={c.notes}
                onChange={e => {
                  const arr = [...checks];
                  arr[idx].notes = e.target.value;
                  setChecks(arr);
                }}
              />
            </div>
            <div className="flex flex-row md:flex-col gap-2 items-center">
              <button
                className={`px-3 py-1 rounded-xl font-bold text-sm ${c.status === 0 ? "bg-[#e24242]" : "bg-[#23292f] border border-[#FFD70044]"}`}
                onClick={() => {
                  const arr = [...checks];
                  arr[idx].status = 0;
                  setChecks(arr);
                }}
              >Not Met</button>
              <button
                className={`px-3 py-1 rounded-xl font-bold text-sm ${c.status === 1 ? "bg-[#FFD700] text-black" : "bg-[#23292f] border border-[#FFD70044]"}`}
                onClick={() => {
                  const arr = [...checks];
                  arr[idx].status = 1;
                  setChecks(arr);
                }}
              >Partial</button>
              <button
                className={`px-3 py-1 rounded-xl font-bold text-sm ${c.status === 2 ? "bg-[#1de682] text-black" : "bg-[#23292f] border border-[#1de68244]"}`}
                onClick={() => {
                  const arr = [...checks];
                  arr[idx].status = 2;
                  setChecks(arr);
                }}
              >Met</button>
            </div>
          </div>
        ))}
      </div>

      {/* Guidance */}
      <div className="mb-10">
        <div className="font-black text-lg mb-2" style={{ color: "#FFD700" }}>Key Recommendations</div>
        <div className="bg-[#181e23] rounded-xl p-4 shadow">
          <ul className="list-disc ml-5">
            {recs.length ? recs.map((r, i) =>
              <li key={i} className="mb-1 text-[#FFD700]">{r}</li>
            ) : (
              <li className="text-[#1de682] font-bold">All grant requirements are fully met. You are READY to submit!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaClipboardCheck size={34} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-lg">COURTEVO VERO</div>
        </div>
        <div className="text-base text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
