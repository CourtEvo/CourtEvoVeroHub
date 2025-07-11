import React, { useState } from "react";
import { FaCogs, FaDownload, FaPlus, FaTrash, FaExclamationTriangle, FaCheckCircle, FaRegClock, FaUserTie, FaChartLine, FaEuroSign, FaHeartbeat, FaWrench, FaSyncAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { saveAs } from "file-saver";

// Icons for different resource types
const resourceIcons = {
  Coaches: <FaUserTie color="#FFD700" />,
  Analysts: <FaChartLine color="#1de682" />,
  Physios: <FaHeartbeat color="#e24242" />,
  Funding: <FaEuroSign color="#FFD700" />,
  "Medical Equipment": <FaWrench color="#FFD700" />,
  Gear: <FaWrench color="#FFD700" />,
  "": <FaSyncAlt color="#FFD700" />,
};

const initial = [
  { unit: "U18", resource: "Coaches", required: 3, actual: 2, note: "1 on leave", trend: 0, lastUpdate: "2025-06-14" },
  { unit: "U18", resource: "Analysts", required: 1, actual: 1, note: "", trend: 0, lastUpdate: "2025-06-14" },
  { unit: "U18", resource: "Physios", required: 1, actual: 0, note: "Cover from seniors", trend: -1, lastUpdate: "2025-06-10" },
  { unit: "Senior", resource: "Coaches", required: 4, actual: 4, note: "", trend: 0, lastUpdate: "2025-06-14" },
  { unit: "Senior", resource: "Analysts", required: 2, actual: 1, note: "Recruiting", trend: 1, lastUpdate: "2025-06-12" },
  { unit: "Senior", resource: "Physios", required: 2, actual: 2, note: "", trend: 0, lastUpdate: "2025-06-14" },
  { unit: "Senior", resource: "Medical Equipment", required: 10, actual: 7, note: "Waiting delivery", trend: 1, lastUpdate: "2025-06-11" },
  { unit: "Academy", resource: "Funding", required: 180, actual: 120, note: "Grant pending", trend: 0, lastUpdate: "2025-06-09" },
];

// Color/flag logic
function gapColor(actual, required) {
  if (actual >= required) return "#1de682";
  if (actual >= required * 0.7) return "#FFD700";
  return "#e24242";
}
function gapBadge(actual, required) {
  if (actual >= required) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold text-xs"><FaCheckCircle className="mr-1" />OK</span>;
  if (actual >= required * 0.7) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold text-xs"><FaRegClock className="mr-1" />Warning</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold text-xs"><FaExclamationTriangle className="mr-1" />Critical</span>;
}
function donut(percent, color) {
  // SVG donut: percent 0–100, color hex
  const r = 17, c = 2 * Math.PI * r, val = Math.max(0, Math.min(100, percent));
  return (
    <svg width={42} height={42}>
      <circle cx={21} cy={21} r={r} fill="#23292f" stroke="#222" strokeWidth="5" />
      <circle
        cx={21} cy={21} r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${(val / 100) * c},${c}`}
        transform="rotate(-90 21 21)"
      />
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">{Math.round(val)}%</text>
    </svg>
  );
}
function trendIcon(trend) {
  if (trend > 0) return <FaArrowUp color="#1de682" title="Improving" />;
  if (trend < 0) return <FaArrowDown color="#e24242" title="Worsening" />;
  return <FaRegClock color="#FFD700" title="No Change" />;
}
function outdated(date) {
  // More than 5 days old = outdated
  const now = new Date();
  const d = new Date(date);
  return (now - d) / 86400000 > 5;
}
function exportCSV(data) {
  let rows = [["Unit", "Resource", "Required", "Actual", "%", "Trend", "Last Update", "Note"]];
  data.forEach(r =>
    rows.push([r.unit, r.resource, r.required, r.actual, Math.round((r.actual / r.required) * 100), r.trend, r.lastUpdate, r.note])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_ResourceGap_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function ResourceGapAnalyzer() {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState("All");

  // Units for filter/tabs
  const units = Array.from(new Set(rows.map(r => r.unit)));
  const filtered = filter === "All" ? rows : rows.filter(r => r.unit === filter);

  // Board summary: Per-unit coverage
  const perUnit = units.map(unit => {
    const unitRows = rows.filter(r => r.unit === unit);
    const coverage = unitRows.reduce((a, r) => a + Math.min(r.actual / r.required, 1), 0) / unitRows.length * 100;
    return { unit, coverage: Math.round(coverage) };
  });
  const overall = perUnit.reduce((a, b) => a + b.coverage, 0) / perUnit.length;

  const mostCritical = filtered.filter(r => r.actual < r.required).sort((a, b) => (a.actual/a.required) - (b.actual/b.required))[0];

  // Add row
  function addRow() {
    setRows([
      ...rows,
      { unit: units[0] || "", resource: "", required: 1, actual: 0, note: "", trend: 0, lastUpdate: new Date().toISOString().slice(0,10) }
    ]);
  }
  // Edit row
  function update(idx, key, val) {
    const arr = [...rows];
    arr[idx][key] = key === "required" || key === "actual" || key === "trend" ? Number(val) : val;
    setRows(arr);
  }
  // Remove
  function remove(idx) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #232a2e 65%, #283E51 100%)",
        borderRadius: "32px",
        boxShadow: "0 8px 32px #2229",
        minHeight: 880
      }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaCogs size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700" }}>RESOURCE GAP ANALYZER</h1>
          </div>
          <div className="text-[#FFD700] italic text-base">See all gaps by unit/team. Flags, trends, icons, donut coverage, board export.</div>
        </div>
        <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
          onClick={() => exportCSV(filtered)}>
          <FaDownload /> Export
        </button>
      </div>

      {/* Unit tabs / Coverage cards */}
      <div className="flex flex-wrap gap-3 mb-7">
        <button
          onClick={() => setFilter("All")}
          className={`px-4 py-2 rounded-xl font-bold ${filter === "All" ? "bg-[#FFD700] text-black" : "bg-[#181e23] text-[#FFD700]"} shadow`}>
          All Units
        </button>
        {perUnit.map(u => (
          <button
            key={u.unit}
            onClick={() => setFilter(u.unit)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${filter === u.unit ? "bg-[#FFD700] text-black" : "bg-[#181e23] text-[#FFD700]"} shadow`}>
            {u.unit} {donut(u.coverage, u.coverage >= 100 ? "#1de682" : u.coverage >= 70 ? "#FFD700" : "#e24242")}
          </button>
        ))}
        <div className="px-4 py-2 rounded-xl font-bold bg-[#181e23] text-[#FFD700] shadow ml-auto flex items-center gap-2">
          Overall {donut(overall, overall >= 100 ? "#1de682" : overall >= 70 ? "#FFD700" : "#e24242")}
        </div>
      </div>

      {/* Board summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#1de682]">
          <div className="font-black text-2xl mb-1 text-[#1de682]">{filtered.filter(r => r.actual >= r.required).length}</div>
          <div className="font-bold">Fully Resourced</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD700]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{filtered.filter(r => r.actual < r.required && r.actual >= r.required * 0.7).length}</div>
          <div className="font-bold">Warning</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#e24242]">
          <div className="font-black text-2xl mb-1 text-[#e24242]">{filtered.filter(r => r.actual < r.required * 0.7).length}</div>
          <div className="font-bold">Critical Gap</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD70099]">
          <div className="font-black text-lg mb-1 text-[#FFD700]">
            {mostCritical ? `${mostCritical.unit} / ${mostCritical.resource}` : "—"}
          </div>
          <div className="font-bold">Most Under-Resourced</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181e23] rounded-2xl p-6 shadow border-l-8 border-[#FFD70099] mb-8">
        <table className="min-w-full text-lg">
          <thead>
            <tr>
              <th>Unit/Team</th>
              <th>Resource</th>
              <th>Required</th>
              <th>Actual</th>
              <th>%</th>
              <th>Progress</th>
              <th>Trend</th>
              <th>Status</th>
              <th>Last Update</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-20"
                    value={r.unit}
                    onChange={e => update(rows.indexOf(r), "unit", e.target.value)} />
                </td>
                <td className="flex items-center gap-2">
                  {resourceIcons[r.resource] || resourceIcons[""]}
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24"
                    value={r.resource}
                    onChange={e => update(rows.indexOf(r), "resource", e.target.value)} />
                </td>
                <td>
                  <input type="number" min={1} className="w-14 text-center bg-[#23292f] rounded"
                    value={r.required}
                    onChange={e => update(rows.indexOf(r), "required", e.target.value)} />
                </td>
                <td>
                  <input type="number" min={0} className="w-14 text-center bg-[#23292f] rounded"
                    value={r.actual}
                    onChange={e => update(rows.indexOf(r), "actual", e.target.value)} />
                </td>
                <td style={{ color: gapColor(r.actual, r.required), fontWeight: 700 }}>
                  {Math.round((r.actual / r.required) * 100)}%
                </td>
                <td>
                  <progress value={Math.min(r.actual, r.required)} max={r.required} style={{ width: 70, height: 11, background: "#222" }} />
                </td>
                <td>
                  <input type="number" className="w-12 text-center bg-[#23292f] rounded"
                    value={r.trend}
                    onChange={e => update(rows.indexOf(r), "trend", e.target.value)} />
                  {trendIcon(r.trend)}
                </td>
                <td>{gapBadge(r.actual, r.required)}</td>
                <td>
                  <input type="date" className={`bg-[#23292f] text-white rounded px-2 py-1 w-32 ${outdated(r.lastUpdate) ? "border border-[#e24242]" : ""}`}
                    value={r.lastUpdate}
                    onChange={e => update(rows.indexOf(r), "lastUpdate", e.target.value)} />
                  {outdated(r.lastUpdate) && <span className="text-[#e24242] font-bold text-xs ml-1">Outdated</span>}
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                    value={r.note}
                    onChange={e => update(rows.indexOf(r), "note", e.target.value)} />
                </td>
                <td>
                  <button onClick={() => remove(rows.indexOf(r))} className="text-[#e24242] font-bold px-2"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addRow}
          className="flex items-center gap-2 mt-4 bg-[#FFD700] text-black rounded font-bold px-4 py-2"
        ><FaPlus /> Add Resource</button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-12 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
