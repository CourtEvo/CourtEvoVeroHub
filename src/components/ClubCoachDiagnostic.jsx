import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaLightbulb, FaMapSigns, FaChartLine, FaUserGraduate, FaMoneyBillWave, FaHandshake, FaHeartbeat, FaUniversalAccess, FaChartBar, FaFlask, FaStar } from "react-icons/fa";

// Assign an icon to each section for visual punch
const SECTION_ICONS = [
  <FaLightbulb size={24} color="#FFD700" />,      // Vision
  <FaMapSigns size={24} color="#1de682" />,       // Pathway
  <FaChartLine size={24} color="#3aa9ff" />,      // Ratio
  <FaUserGraduate size={24} color="#FFD700" />,   // Coaching
  <FaMoneyBillWave size={24} color="#1de682" />,  // Finance
  <FaHandshake size={24} color="#FFD700" />,      // Stakeholders
  <FaHeartbeat size={24} color="#3aa9ff" />,      // Holistic
  <FaUniversalAccess size={24} color="#FFD700" />,// Inclusivity (now only refers to access for all boys/men)
  <FaChartBar size={24} color="#1de682" />,       // Analytics
  <FaFlask size={24} color="#FFD700" />,          // Innovation
];

// Section structure: NO girls/female/“disabled”/gender lines anywhere.
const SECTIONS = {
  Club: [
    {
      key: "vision",
      label: "Strategic Vision & Alignment",
      description: "Does the club have a documented, actionable strategic plan aligned with LTAD and organizational mission?",
    },
    {
      key: "pathway",
      label: "Player Development Pathway Structure",
      description: "Are player pathways structured, progressive, and inclusive of all ages and abilities?",
    },
    {
      key: "ratio",
      label: "Practice:Game Ratio",
      description: "Are training-to-competition ratios in line with CourtEvo Vero standards (minimum 2:1 for youth)?",
    },
    {
      key: "coaching",
      label: "Coach Education & Retention",
      description: "Are coaches supported with CPD, mentoring, and evaluated for performance and retention?",
    },
    {
      key: "finance",
      label: "Financial Health & Resource Allocation",
      description: "Does the club have transparent budgets, sustainable funding, and resources allocated to development?",
    },
    {
      key: "stakeholders",
      label: "Stakeholder Engagement",
      description: "How well does the club engage parents, community, and external stakeholders in its mission?",
    },
    {
      key: "holistic",
      label: "Holistic Athlete Development",
      description: "Does the club support physical, mental, cognitive, and emotional development of athletes?",
    },
    {
      key: "inclusivity",
      label: "Inclusivity & Participation",
      description: "Does the club provide accessible pathways for all male athletes, including late entrants and those with diverse backgrounds?",
    },
    {
      key: "analytics",
      label: "Use of Data & Analytics",
      description: "How effectively does the club collect, analyze, and use data for decisions and improvement?",
    },
    {
      key: "innovation",
      label: "Innovation & Best Practices",
      description: "Is the club actively innovating, benchmarking, and adopting modern best practices?",
    },
  ],
  Coach: [
    {
      key: "ltad",
      label: "LTAD/ADM Application",
      description: "Do you apply Long-Term Athlete Development principles in practice design and player management?",
    },
    {
      key: "goalsetting",
      label: "Player Assessment & Goal Setting",
      description: "Do you assess players individually and set actionable, realistic goals for development?",
    },
    {
      key: "session",
      label: "Session Design & Periodization",
      description: "Are sessions well-structured, progressive, periodized, and adapted for individual needs?",
    },
    {
      key: "progressive",
      label: "Progressive Coaching Mindset",
      description: "Do you apply progressive coaching (challenge, engage, differentiate, and adapt)?",
    },
    {
      key: "leadership",
      label: "Feedback, Communication, Leadership",
      description: "Do you deliver clear feedback, communicate openly, and provide effective leadership?",
    },
    {
      key: "ethics",
      label: "Ethics, Fair Play, Character Development",
      description: "Do you teach and model ethics, fair play, and character in your coaching practice?",
    },
    {
      key: "tech",
      label: "Use of Analytics/Tech",
      description: "Do you use analytics, video, or modern tech for player/coach improvement?",
    },
    {
      key: "cpd",
      label: "Personal Development/CPD",
      description: "Are you engaged in ongoing learning, self-reflection, and professional development?",
    },
  ],
};

const INITIAL_STATE = (role) =>
  SECTIONS[role].map(() => ({
    score: 0,
    notes: "",
    evidence: null,
  }));

function complianceMeter(score, role) {
  if (score >= 4.5) return { label: "ELITE", color: "#1de682" };
  if (score >= 3.5) return { label: "ON TRACK", color: "#FFD700" };
  if (score >= 2.5) return { label: "NEEDS WORK", color: "#FFA500" };
  return { label: "AT RISK", color: "#e24242" };
}

function getRecommendations(answers, sections) {
  return answers
    .map((a, idx) => ({ ...a, label: sections[idx].label, description: sections[idx].description }))
    .filter((a) => a.score < 3)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(
      (a) =>
        `• ${a.label}: ${a.score}/5. ${a.description} — Priority for improvement.`
    );
}

function handleExportCSV(answers, sections, role) {
  const rows = [
    ["Section", "Score", "Notes"],
    ...answers.map((a, idx) => [sections[idx].label, a.score, a.notes.replace(/(\r\n|\n|\r)/gm, " ")]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvo_Vero_${role}_SelfAssessment_${new Date().toISOString().slice(0,10)}.csv`);
}

function handleExportPDF(answers, sections, role, total, compliance, recommendations) {
  const content = [
    `CourtEvo Vero Self-Assessment: ${role} | ${new Date().toLocaleDateString()}`,
    "-------------------------------------",
    ...answers.map(
      (a, idx) =>
        `${sections[idx].label}: ${a.score}/5\nNotes: ${a.notes ? a.notes : "N/A"}\n`
    ),
    "-------------------------------------",
    `Total Score: ${total.toFixed(2)}/5 - Compliance: ${compliance.label}`,
    "",
    "Top Priorities for Improvement:",
    ...recommendations,
    "",
    "Powered by CourtEvo Vero | BE REAL. BE VERO."
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `CourtEvo_Vero_${role}_SelfAssessment_${new Date().toISOString().slice(0,10)}.txt`);
}

function DiagnosticRadarChart({ answers, sections }) {
  const data = sections.map((s, i) => ({
    metric: s.label,
    Score: answers[i]?.score ?? 0,
    Standard: 4,
  }));
  return (
    <div className="rounded-3xl shadow-2xl bg-[#181e23] p-4">
      <ResponsiveContainer width="100%" height={310}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#FFD700", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar
            name="Your Score"
            dataKey="Score"
            stroke="#FFD700"
            fill="#FFD700"
            fillOpacity={0.4}
          />
          <Radar
            name="CourtEvo Vero Standard"
            dataKey="Standard"
            stroke="#1de682"
            fill="#1de682"
            fillOpacity={0.12}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Animated compliance meter
const ComplianceMeter = ({ value, status }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-1">
      <span>AT RISK</span>
      <span>ELITE</span>
    </div>
    <div className="w-full h-6 bg-[#22272d] rounded-full shadow-inner flex items-center relative overflow-hidden">
      <div
        className="transition-all duration-500"
        style={{
          height: "100%",
          width: `${(value / 5) * 100}%`,
          background: `linear-gradient(90deg,#e24242 0%,#FFD700 60%,#1de682 100%)`,
          borderRadius: "inherit",
          boxShadow: "0 1px 8px 0 #0003"
        }}
      />
      <span
        className="absolute right-4 text-md font-bold"
        style={{ color: status.color, textShadow: "0 1px 8px #0008" }}
      >
        {status.label}
      </span>
    </div>
  </div>
);

export default function ClubCoachDiagnostic() {
  const [role, setRole] = useState("Club");
  const [answers, setAnswers] = useState(INITIAL_STATE("Club"));
  const sections = SECTIONS[role];
  const total = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
  const compliance = complianceMeter(total, role);
  const recommendations = getRecommendations(answers, sections);

  const handleEvidence = (idx, file) => {
    const updated = [...answers];
    updated[idx].evidence = file;
    setAnswers(updated);
  };

  return (
    <div
      className="max-w-5xl mx-auto py-10 px-3"
      style={{ fontFamily: "Segoe UI, sans-serif", color: "#fff" }}
    >
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="bg-[#181e23cc] rounded-2xl p-3 shadow-lg flex items-center">
          <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 60, borderRadius: 12, boxShadow: "0 2px 12px #FFD70033" }} />
        </div>
        <div>
          <h1 className="font-extrabold text-4xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700" }}>
            CourtEvo Vero<br /><span className="text-[#1de682]">Self-Assessment Diagnostic</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-1 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            className={`px-5 py-2 rounded-xl font-bold shadow transition-all duration-200
              ${role === "Club"
                ? "bg-[#FFD700] text-black scale-105"
                : "bg-[#22272d] text-[#FFD700] border border-[#FFD700] hover:scale-105"
              }`}
            onClick={() => { setRole("Club"); setAnswers(INITIAL_STATE("Club")); }}
          >
            Club
          </button>
          <button
            className={`px-5 py-2 rounded-xl font-bold shadow transition-all duration-200
              ${role === "Coach"
                ? "bg-[#1de682] text-black scale-105"
                : "bg-[#22272d] text-[#1de682] border border-[#1de682] hover:scale-105"
              }`}
            onClick={() => { setRole("Coach"); setAnswers(INITIAL_STATE("Coach")); }}
          >
            Coach
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl mb-7 px-6 py-5" style={{
        background: "linear-gradient(90deg, #1e2a35cc 75%, #22292Fcc 100%)",
        border: "1.5px solid #FFD70055"
      }}>
        <div className="text-lg font-bold mb-1">How to use:</div>
        <div className="text-[#e1eaff]">Score each area from <b>0</b> (Not Present) to <b>5</b> (Elite/Best Practice). Add improvement notes and upload evidence (optional) for board-grade review. Live analytics update below. Use export for board meetings or benchmarking.</div>
      </div>

      {/* Diagnostic Cards */}
      <div className="grid gap-7">
        {sections.map((section, idx) => (
          <div key={section.key}
            className="relative p-6 bg-[#181e23e8] rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 border-l-8 border-[#FFD70033] hover:border-[#1de682] transition-all duration-200"
            style={{
              backdropFilter: "blur(4px)",
              borderImage: idx % 2 === 0 ? "linear-gradient(180deg,#FFD700 0,#1de682 100%) 1" : undefined,
            }}
          >
            {/* Icon area */}
            <div className="flex flex-col items-center justify-start">
              <div className="mb-2">{SECTION_ICONS[idx % SECTION_ICONS.length]}</div>
              <div className="h-12 border-l-2 border-dashed border-[#FFD70044] hidden md:block" />
            </div>
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-xl tracking-wide mb-1" style={{ color: "#FFD700" }}>{section.label}</div>
              <div className="text-sm text-gray-400 mb-2">{section.description}</div>
              <div className="flex gap-2 items-center mt-2 mb-1">
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={answers[idx].score}
                  onChange={e => {
                    const updated = [...answers];
                    updated[idx].score = Number(e.target.value);
                    setAnswers(updated);
                  }}
                  style={{ width: 150 }}
                  className="accent-[#FFD700] focus:accent-[#1de682] transition-all"
                />
                {[0, 1, 2, 3, 4, 5].map(val => (
                  <span
                    key={val}
                    className={answers[idx].score === val
                      ? "font-extrabold text-[#FFD700] scale-110"
                      : "text-gray-500"}
                    style={{ fontSize: 19, marginLeft: 2, marginRight: 2, transition: "all 0.12s" }}
                  >{val}</span>
                ))}
              </div>
              <textarea
                placeholder="Add notes, improvement actions, board comments…"
                className="w-full mt-2 p-3 rounded-lg bg-[#1a222d] text-white text-base shadow-inner outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-[#242c36]"
                style={{ minHeight: 54, transition: "background 0.15s" }}
                value={answers[idx].notes}
                onChange={e => {
                  const updated = [...answers];
                  updated[idx].notes = e.target.value;
                  setAnswers(updated);
                }}
              />
            </div>
            {/* Evidence Upload */}
            <div className="flex flex-col items-end justify-between gap-2">
              <div>
                <label style={{ fontSize: 13, color: "#1de682" }}>Upload Evidence:</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => handleEvidence(idx, e.target.files?.[0] ?? null)}
                  className="block mt-2"
                  style={{ color: "#fff" }}
                />
                {answers[idx].evidence && (
                  <div className="text-xs text-[#FFD700] mt-1">
                    Uploaded: {answers[idx].evidence.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Meter */}
      <div className="my-14 grid md:grid-cols-2 gap-10">
        <div>
          <div className="font-extrabold text-xl mb-4" style={{ color: "#FFD700" }}>Analytics & Benchmark</div>
          <DiagnosticRadarChart answers={answers} sections={sections} />
        </div>
        <div>
          <div className="font-extrabold text-xl mb-3" style={{ color: "#FFD700" }}>Compliance Meter</div>
          <ComplianceMeter value={total} status={compliance} />
          <div className="text-3xl mb-2 mt-2">
            <span style={{ color: compliance.color }}>{total.toFixed(2)}/5</span> <span className="text-base opacity-70">average score</span>
          </div>
          <div className="mb-3 text-lg font-bold text-[#FFD700]">Top Priorities for Improvement</div>
          <ul className="list-disc ml-6 mb-4">
            {recommendations.length === 0 ? (
              <li className="text-[#1de682] font-bold">All critical areas are strong. Continue to monitor and review.</li>
            ) : (
              recommendations.map((r, i) => <li key={i} className="text-[#FFA500]">{r}</li>)
            )}
          </ul>
          <div className="font-semibold mb-2">Export Results:</div>
          <div className="flex gap-3 mb-2">
            <button
              className="px-4 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
              onClick={() => handleExportCSV(answers, sections, role)}
            >
              Export CSV
            </button>
            <button
              className="px-4 py-2 bg-[#1de682] text-black rounded-xl font-bold shadow hover:scale-105 transition"
              onClick={() =>
                handleExportPDF(answers, sections, role, total, compliance, recommendations)
              }
            >
              Export PDF
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">Exports are branded and boardroom-ready</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 38, borderRadius: 9, boxShadow: "0 2px 10px #FFD70022" }} />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-lg">COURTEVO VERO</div>
        </div>
        <div className="text-base text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
