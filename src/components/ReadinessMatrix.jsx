import React, { useState } from "react";
import { FaClipboardCheck, FaDownload, FaArrowUp, FaArrowDown, FaMinus, FaExclamationTriangle, FaCheckCircle, FaRegClock, FaUser, FaClipboardList } from "react-icons/fa";
import { saveAs } from "file-saver";

// --- DEMO READINESS DATA (multi-area) ---
const initial = [
  { category: "Sport", area: "Player Pathways", score: 9, trend: 1, lastAudit: "2025-06-14", owner: "Sport Dir.", note: "LTAD mapped" },
  { category: "Sport", area: "Coach Dev.", score: 7, trend: 0, lastAudit: "2025-06-10", owner: "Coach Dir.", note: "" },
  { category: "HR", area: "Staff Onboarding", score: 6, trend: -1, lastAudit: "2025-06-09", owner: "HR Lead", note: "Docs slow" },
  { category: "Finance", area: "Budget Planning", score: 8, trend: 1, lastAudit: "2025-06-13", owner: "CFO", note: "Board signed" },
  { category: "Finance", area: "Grant Readiness", score: 5, trend: 0, lastAudit: "2025-05-31", owner: "CFO", note: "New process" },
  { category: "Operations", area: "Session Safety", score: 10, trend: 0, lastAudit: "2025-06-14", owner: "Ops Lead", note: "" },
  { category: "Operations", area: "Facility Access", score: 7, trend: 1, lastAudit: "2025-06-11", owner: "Ops Lead", note: "" },
  { category: "Legal", area: "GDPR Compliance", score: 8, trend: 1, lastAudit: "2025-05-22", owner: "Legal", note: "Audit scheduled" },
  { category: "Digital", area: "Data Backup", score: 6, trend: -1, lastAudit: "2025-06-02", owner: "IT", note: "Vendor change" },
  { category: "Medical", area: "Concussion Protocol", score: 10, trend: 0, lastAudit: "2025-06-12", owner: "Medical", note: "" },
  { category: "Comms", area: "Stakeholder Updates", score: 7, trend: 1, lastAudit: "2025-06-09", owner: "Comms", note: "New platform" },
];

// Color, trend, and flag logic
function areaColor(score) {
  if (score >= 8) return "#1de682"; // green
  if (score >= 6) return "#FFD700"; // amber
  return "#e24242"; // red
}
function trendIcon(trend) {
  if (trend > 0) return <FaArrowUp color="#1de682" title="Improving" />;
  if (trend < 0) return <FaArrowDown color="#e24242" title="Declining" />;
  return <FaMinus color="#FFD700" title="Stable" />;
}
function flagBadge(score) {
  if (score >= 8) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold text-xs"><FaCheckCircle className="mr-1" />READY</span>;
  if (score >= 6) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold text-xs"><FaRegClock className="mr-1" />Needs Work</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold text-xs"><FaExclamationTriangle className="mr-1" />CRITICAL</span>;
}
function outdated(date) {
  // More than 14 days old = overdue
  const now = new Date();
  const d = new Date(date);
  return (now - d) / 86400000 > 14;
}
function progress(score) {
  // Visual bar
  return <div style={{
    width: 90, height: 14, background: "#23292f", borderRadius: 7, position: "relative"
  }}>
    <div style={{
      width: `${score * 10}%`, height: 14, background: areaColor(score),
      borderRadius: 7, position: "absolute", left: 0, top: 0, transition: "width .25s"
    }} />
    <span style={{
      position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
      color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center", lineHeight: "14px"
    }}>{score * 10}%</span>
  </div>;
}
function exportCSV(rows, cat) {
  let lines = [["Category", "Area", "Score", "Trend", "Last Audit", "Owner", "Note"]];
  rows.filter(r => cat === "All" || r.category === cat).forEach(r =>
    lines.push([r.category, r.area, r.score, r.trend, r.lastAudit, r.owner, r.note])
  );
  const csv = lines.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_Readiness_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function ReadinessMatrix() {
  const [rows, setRows] = useState(initial);
  const [cat, setCat] = useState("All");

  // Unique categories
  const cats = Array.from(new Set(rows.map(r => r.category)));
  const filtered = cat === "All" ? rows : rows.filter(r => r.category === cat);

  // Board summary
  const readyPct = Math.round(rows.filter(r => r.score >= 8).length / rows.length * 100);
  const atRisk = rows.filter(r => r.score < 6);
  const overdue = rows.filter(r => outdated(r.lastAudit));
  const mostAtRisk = atRisk.sort((a, b) => a.score - b.score)[0];

  // Inline edit
  function update(idx, key, val) {
    const arr = [...rows];
    arr[idx][key] =
      key === "score" || key === "trend"
        ? Number(val)
        : val;
    setRows(arr);
  }
  function addRow() {
    setRows([
      ...rows,
      { category: cats[0] || "", area: "", score: 5, trend: 0, lastAudit: new Date().toISOString().slice(0, 10), owner: "", note: "" }
    ]);
  }
  function remove(idx) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  // Heatmap grid (categories x areas)
  const heatmapCats = Array.from(new Set(rows.map(r => r.category)));
  const heatmapAreas = Array.from(new Set(rows.map(r => r.area)));
  const heatmap = heatmapCats.map(cat =>
    heatmapAreas.map(area =>
      rows.find(r => r.category === cat && r.area === area)
    )
  );

  return (
    <div className="max-w-[1350px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #232a2e 70%, #283E51 100%)",
        borderRadius: "32px",
        boxShadow: "0 8px 32px #2229",
        minHeight: 950
      }}>
      {/* Header / summary */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaClipboardCheck size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700" }}>READINESS & COMPLIANCE MATRIX</h1>
          </div>
          <div className="text-[#FFD700] italic text-base">
            Multi-area, traffic-light, trend & risk. Board export, inline edit, heatmap, drilldown.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="rounded px-2 py-2 bg-[#FFD700] text-[#222] font-bold"
            value={cat} onChange={e => setCat(e.target.value)}>
            <option value="All">All Categories</option>
            {cats.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={() => exportCSV(rows, cat)}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Board summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#1de682]">
          <div className="font-black text-2xl mb-1 text-[#1de682]">{readyPct}%</div>
          <div className="font-bold">Ready</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#e24242]">
          <div className="font-black text-2xl mb-1 text-[#e24242]">{atRisk.length}</div>
          <div className="font-bold">Critical</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD700]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{overdue.length}</div>
          <div className="font-bold">Overdue Audit</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD70099]">
          <div className="font-black text-lg mb-1 text-[#FFD700]">
            {mostAtRisk ? `${mostAtRisk.category}/${mostAtRisk.area}` : "—"}
          </div>
          <div className="font-bold">Most at Risk</div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="mb-9">
        <div className="font-bold text-xl mb-2 text-[#FFD700] flex items-center gap-2">
          <FaClipboardList /> Readiness Heatmap
        </div>
        <div className="overflow-x-auto">
          <table className="text-center min-w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 bg-[#222a2e]"></th>
                {heatmapAreas.map(area => (
                  <th key={area} className="px-3 py-2 bg-[#222a2e]">{area}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapCats.map((cat, rowIdx) => (
                <tr key={cat}>
                  <th className="text-left bg-[#222a2e] px-2 py-2">{cat}</th>
                  {heatmapAreas.map((area, colIdx) => {
                    const cell = heatmap[rowIdx][colIdx];
                    return (
                      <td key={area} className="py-1"
                        style={{
                          background: cell ? areaColor(cell.score) : "#222a2e",
                          color: cell ? "#fff" : "#555",
                          borderRadius: 8,
                          fontWeight: cell ? 700 : 400,
                        }}>
                        {cell ? cell.score : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181e23] rounded-2xl p-6 shadow border-l-8 border-[#FFD70099] mb-8">
        <table className="min-w-full text-lg">
          <thead>
            <tr>
              <th>Category</th>
              <th>Area</th>
              <th>Score</th>
              <th>Progress</th>
              <th>Trend</th>
              <th>Status</th>
              <th>Last Audit</th>
              <th>Owner</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-20"
                    value={r.category}
                    onChange={e => update(rows.indexOf(r), "category", e.target.value)} />
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-28"
                    value={r.area}
                    onChange={e => update(rows.indexOf(r), "area", e.target.value)} />
                </td>
                <td>
                  <input type="number" min={1} max={10} className="w-14 text-center bg-[#23292f] rounded"
                    value={r.score}
                    onChange={e => update(rows.indexOf(r), "score", e.target.value)} />
                </td>
                <td>
                  {progress(r.score)}
                </td>
                <td>
                  <input type="number" className="w-12 text-center bg-[#23292f] rounded"
                    value={r.trend}
                    onChange={e => update(rows.indexOf(r), "trend", e.target.value)} />
                  {trendIcon(r.trend)}
                </td>
                <td>{flagBadge(r.score)}</td>
                <td>
                  <input type="date"
                    className={`bg-[#23292f] text-white rounded px-2 py-1 w-32 ${outdated(r.lastAudit) ? "border border-[#e24242]" : ""}`}
                    value={r.lastAudit}
                    onChange={e => update(rows.indexOf(r), "lastAudit", e.target.value)} />
                  {outdated(r.lastAudit) && <span className="text-[#e24242] font-bold text-xs ml-1">Overdue</span>}
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24"
                    value={r.owner}
                    onChange={e => update(rows.indexOf(r), "owner", e.target.value)} />
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                    value={r.note}
                    onChange={e => update(rows.indexOf(r), "note", e.target.value)} />
                </td>
                <td>
                  <button onClick={() => remove(rows.indexOf(r))} className="text-[#e24242] font-bold px-2">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addRow}
          className="flex items-center gap-2 mt-4 bg-[#FFD700] text-black rounded font-bold px-4 py-2"
        >+ Add Area</button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-12 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
