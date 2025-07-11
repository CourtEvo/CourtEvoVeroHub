import React, { useState } from "react";
import { saveAs } from "file-saver";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { FaChalkboardTeacher, FaStar, FaCheck, FaTrophy, FaUserTie, FaUserShield } from "react-icons/fa";

// Metrics (board can adjust weights below)
const METRICS = [
  { key: "alignment", label: "Club Fit" },
  { key: "tactical", label: "Tactical" },
  { key: "technical", label: "Technical" },
  { key: "leadership", label: "Leadership" },
  { key: "cpd", label: "CPD" },
  { key: "playerdev", label: "Player Dev." },
  { key: "interview", label: "Interview" }
];

// Weights (changeable in table)
const initialWeights = {
  alignment: 2, tactical: 1.5, technical: 1.5, leadership: 1.2, cpd: 1, playerdev: 1.2, interview: 2
};

const initialCandidates = [
  { name: "D. Matić", exp: 8, cert: "FIBA", role: "Head Coach", reference: 9, interview: 9, club: "Zagreb", alignment: 8, tactical: 8, technical: 8, leadership: 7, cpd: 7, playerdev: 8 },
  { name: "S. Petrović", exp: 4, cert: "UEFA C", role: "Youth Coach", reference: 7, interview: 7, club: "Cedevita", alignment: 7, tactical: 7, technical: 7, leadership: 6, cpd: 5, playerdev: 7 }
];

// Score per candidate
function getScore(candidate, weights) {
  let total = 0, denom = 0;
  METRICS.forEach(m => {
    total += (Number(candidate[m.key]) || 0) * (weights[m.key] || 1);
    denom += 10 * (weights[m.key] || 1);
  });
  return denom ? Math.round(100 * total / denom) : 0;
}

function getFlags(c) {
  const flags = [];
  if (!c.cert || c.cert.toLowerCase() === "none") flags.push("Missing certification");
  if ((c.reference || 0) < 7) flags.push("Reference below 7");
  if ((c.interview || 0) < 6) flags.push("Interview below 6");
  if ((c.alignment || 0) < 6) flags.push("Low club fit");
  if ((c.tactical || 0) < 5) flags.push("Weak tactical rating");
  if ((c.leadership || 0) < 5) flags.push("Low leadership");
  return flags;
}

// Export
function exportCSV(candidates, weights) {
  let rows = [
    ["Name", "Experience", "Cert", "Role", "Reference", ...METRICS.map(m => m.label), "Weighted Score", "Flags"]
  ];
  candidates.forEach(c =>
    rows.push([
      c.name, c.exp, c.cert, c.role, c.reference,
      ...METRICS.map(m => c[m.key]),
      getScore(c, weights),
      getFlags(c).join("|")
    ])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_CoachMatrix_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function CoachHiringMatrix() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [weights, setWeights] = useState(initialWeights);

  // Scores
  const scored = candidates.map(c => ({
    ...c,
    score: getScore(c, weights),
    flags: getFlags(c)
  }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score || 0;

  // Add/remove
  function addCandidate() {
    setCandidates([...candidates, { name: "", exp: 1, cert: "", role: "", reference: 5, interview: 5, club: "", alignment: 5, tactical: 5, technical: 5, leadership: 5, cpd: 5, playerdev: 5 }]);
  }
  function removeCandidate(idx) {
    setCandidates(candidates.filter((_, i) => i !== idx));
  }

  // Radar chart for top
  const radarData = METRICS.map(m => ({
    metric: m.label,
    value: sorted[0]?.[m.key] || 0
  }));

  // Badges
  function Badge({ score, flags }) {
    if (score >= 90) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#FFD700] to-[#1de682] text-black shadow border-2 border-[#FFD70099] animate-bounce mr-2"><FaStar className="mr-1" /> Hire!</span>;
    if (flags.length) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#e24242] to-[#FFD700] text-black shadow border-2 border-[#e24242] animate-pulse mr-2"><FaUserShield className="mr-1" /> Flags</span>;
    if (score >= 75) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#b5bac2] to-[#FFD700] text-black shadow border-2 border-[#FFD70099] animate-pulse mr-2"><FaCheck className="mr-1" /> Strong</span>;
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #222a2e 70%, #283E51 100%)",
        borderRadius: "28px", boxShadow: "0 8px 48px #2229",
      }}>
      {/* Header */}
      <div className="flex items-center gap-7 mb-10">
        <div className="bg-[#181e23ee] rounded-2xl p-4 shadow-2xl flex items-center border-2 border-[#FFD70033]">
          <FaChalkboardTeacher size={54} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-4xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700", textShadow: "0 3px 16px #0009" }}>
            Coach Hiring<br /><span className="text-[#1de682]">Matrix</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-2 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
      </div>

      {/* Weights Bar */}
      <div className="mb-8 bg-[#181e23bb] rounded-2xl shadow-lg px-8 py-6">
        <div className="font-bold mb-2 text-lg" style={{ color: "#FFD700" }}>Adjust Weights</div>
        <div className="flex flex-wrap gap-6">
          {METRICS.map(m =>
            <div key={m.key} className="flex flex-col items-center">
              <span className="font-semibold text-[#FFD700]">{m.label}</span>
              <input type="number" min={0.5} max={3} step={0.1} value={weights[m.key]}
                onChange={e => setWeights({ ...weights, [m.key]: Number(e.target.value) })}
                className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-16 text-center"
              />
            </div>
          )}
        </div>
      </div>

      {/* Candidate Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-2xl" style={{ color: "#1de682" }}>Candidates</div>
          <button onClick={addCandidate}
            className="bg-[#FFD700] text-black rounded-lg px-4 py-1.5 font-bold hover:scale-105 shadow">+ Add Candidate</button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Exp.</th>
                <th>Cert</th>
                <th>Role</th>
                <th>Past Club</th>
                <th>Reference</th>
                {METRICS.map(m => <th key={m.key}>{m.label}</th>)}
                <th>Score</th>
                <th>Flags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, idx) => (
                <tr key={idx} className={c.flags.length ? "bg-[#e2424233]" : c.score === topScore ? "bg-[#1de68222]" : ""}>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-24" value={c.name}
                      onChange={e => { const arr = [...candidates]; arr[idx].name = e.target.value; setCandidates(arr); }} />
                  </td>
                  <td>
                    <input type="number" min={0} max={50} className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                      value={c.exp}
                      onChange={e => { const arr = [...candidates]; arr[idx].exp = Number(e.target.value); setCandidates(arr); }} />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-16"
                      value={c.cert}
                      onChange={e => { const arr = [...candidates]; arr[idx].cert = e.target.value; setCandidates(arr); }} />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-20"
                      value={c.role}
                      onChange={e => { const arr = [...candidates]; arr[idx].role = e.target.value; setCandidates(arr); }} />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-20"
                      value={c.club}
                      onChange={e => { const arr = [...candidates]; arr[idx].club = e.target.value; setCandidates(arr); }} />
                  </td>
                  <td>
                    <input type="number" min={1} max={10} className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                      value={c.reference}
                      onChange={e => { const arr = [...candidates]; arr[idx].reference = Number(e.target.value); setCandidates(arr); }} />
                  </td>
                  {METRICS.map(m =>
                    <td key={m.key}>
                      <input type="number" min={1} max={10}
                        className="w-10 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={c[m.key]}
                        onChange={e => { const arr = [...candidates]; arr[idx][m.key] = Number(e.target.value); setCandidates(arr); }}
                      />
                    </td>
                  )}
                  <td>
                    <span className="font-bold text-lg" style={{ color: c.score === topScore ? "#1de682" : "#FFD700" }}>{c.score}</span>
                  </td>
                  <td>
                    <Badge score={c.score} flags={c.flags} />
                    <ul className="list-disc ml-2">
                      {c.flags.map((f, i) => <li key={i} className="text-xs text-[#e24242]">{f}</li>)}
                    </ul>
                  </td>
                  <td>
                    <button onClick={() => removeCandidate(idx)}
                      className="text-[#e24242] font-black px-2">×</button>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr><td colSpan={18} className="text-center py-4 text-gray-500">
                  Add candidates to analyze board-level fit and hiring.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Candidate Radar */}
      <div className="mb-10">
        <div className="font-black text-lg mb-3" style={{ color: "#FFD700" }}>Top Candidate Radar</div>
        <div className="bg-[#181e23] p-4 rounded-xl shadow max-w-lg">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#FFD700", fontSize: 13 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Top Candidate" dataKey="value" stroke="#FFD700" fill="#1de682" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-16 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaChalkboardTeacher size={38} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
