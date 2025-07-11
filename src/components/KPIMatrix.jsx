import React, { useState } from "react";
import { FaArrowUp, FaArrowDown, FaMinus, FaDownload, FaChartBar, FaPlus, FaTrash, FaCheckCircle, FaExclamationTriangle, FaRegClock, FaEdit, FaInfoCircle } from "react-icons/fa";
import { saveAs } from "file-saver";

// Demo data: Each KPI can track history, notes, etc.
const demoKPIs = [
  {
    dept: "Sport",
    group: "Athlete",
    label: "Athlete Retention",
    value: 92,
    target: 90,
    trend: 1,
    history: [89, 90, 91, 91, 92, 92],
    owner: "Sport Director",
    note: "New onboarding improved retention",
    lastUpdate: "2025-06-14"
  },
  {
    dept: "Sport",
    group: "Performance",
    label: "Win %",
    value: 58,
    target: 60,
    trend: -3,
    history: [65, 64, 60, 58, 61, 58],
    owner: "Head Coach",
    note: "Injuries mid-season",
    lastUpdate: "2025-06-14"
  },
  {
    dept: "Finance",
    group: "Revenue",
    label: "Revenue YTD (€k)",
    value: 710,
    target: 650,
    trend: 14,
    history: [600, 615, 630, 655, 680, 710],
    owner: "CFO",
    note: "Grant payment landed",
    lastUpdate: "2025-06-12"
  },
  {
    dept: "Finance",
    group: "Efficiency",
    label: "Cost per Win (€)",
    value: 4200,
    target: 4000,
    trend: 200,
    history: [3800, 3900, 3950, 4150, 4200, 4200],
    owner: "Finance",
    note: "",
    lastUpdate: "2025-06-14"
  },
  {
    dept: "HR",
    group: "Staff",
    label: "Staff Turnover (%)",
    value: 5,
    target: 8,
    trend: -2,
    history: [6, 7, 8, 5, 4, 5],
    owner: "HR Lead",
    note: "Stable core staff",
    lastUpdate: "2025-06-14"
  },
  {
    dept: "Ops",
    group: "Compliance",
    label: "Compliance Tasks Complete",
    value: 96,
    target: 100,
    trend: -1,
    history: [98, 97, 99, 98, 97, 96],
    owner: "Ops Lead",
    note: "Vendor delays",
    lastUpdate: "2025-06-13"
  },
  {
    dept: "Comms",
    group: "Digital",
    label: "Social Engagement",
    value: 13000,
    target: 12000,
    trend: 400,
    history: [11800, 12100, 12200, 12450, 12600, 13000],
    owner: "Comms",
    note: "Campaign launched",
    lastUpdate: "2025-06-10"
  }
];

// Color/flag logic
function kpiColor(value, target) {
  if (value >= target) return "#1de682"; // green
  if (value >= target * 0.9) return "#FFD700"; // amber
  return "#e24242"; // red
}
function trendIcon(trend) {
  if (trend > 0) return <FaArrowUp style={{ color: "#1de682" }} />;
  if (trend < 0) return <FaArrowDown style={{ color: "#e24242" }} />;
  return <FaMinus style={{ color: "#FFD700" }} />;
}
function flagBadge(value, target) {
  if (value < target * 0.9) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold text-xs"><FaExclamationTriangle className="mr-1" />AT RISK</span>;
  if (value < target) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold text-xs"><FaRegClock className="mr-1" />CLOSE</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold text-xs"><FaCheckCircle className="mr-1" />ON TRACK</span>;
}

// Mini chart (SVG sparkline)
function miniChart(history, color) {
  const w = 48, h = 24, pad = 2;
  const min = Math.min(...history), max = Math.max(...history);
  const range = max - min || 1;
  const points = history.map((v, i) =>
    `${pad + (w - 2 * pad) * i / (history.length - 1)},${h - pad - (h - 2 * pad) * (v - min) / range}`
  ).join(" ");
  return (
    <svg width={w} height={h} style={{ background: "#2226", borderRadius: 4 }}>
      <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
      <circle cx={w - pad} cy={h - pad - (h - 2 * pad) * (history[history.length - 1] - min) / range} r="2.7" fill={color} />
    </svg>
  );
}

// Export
function exportCSV(kpis) {
  let rows = [["Department", "Group", "KPI", "Value", "Target", "Trend", "Owner", "Last Update", "Note"]];
  kpis.forEach(k =>
    rows.push([k.dept, k.group, k.label, k.value, k.target, k.trend, k.owner, k.lastUpdate, k.note])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_KPI_Matrix_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function KPIMatrix() {
  const [kpis, setKpis] = useState(demoKPIs);
  const [filter, setFilter] = useState("All");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  // Unique departments/groups
  const depts = Array.from(new Set(kpis.map(k => k.dept)));
  const groups = Array.from(new Set(kpis.map(k => k.group)));

  // Board summary
  const numGreen = kpis.filter(k => kpiColor(k.value, k.target) === "#1de682").length;
  const numAmber = kpis.filter(k => kpiColor(k.value, k.target) === "#FFD700").length;
  const numRed = kpis.filter(k => kpiColor(k.value, k.target) === "#e24242").length;
  const atRisk = kpis.filter(k => k.value < k.target * 0.9);

  // Filtered data
  const filtered = kpis.filter(k =>
    (filter === "All" || k.dept === filter)
  );

  // Add KPI
  function addKPI() {
    setKpis([
      ...kpis,
      {
        dept: depts[0] || "Sport",
        group: groups[0] || "General",
        label: "",
        value: 0,
        target: 1,
        trend: 0,
        history: [0, 0, 0, 0, 0, 0],
        owner: "",
        note: "",
        lastUpdate: new Date().toISOString().slice(0, 10)
      }
    ]);
    setEditingIdx(kpis.length);
    setEditDraft({
      dept: depts[0] || "Sport",
      group: groups[0] || "General",
      label: "",
      value: 0,
      target: 1,
      trend: 0,
      history: [0, 0, 0, 0, 0, 0],
      owner: "",
      note: "",
      lastUpdate: new Date().toISOString().slice(0, 10)
    });
  }

  // Edit handlers
  function startEdit(idx) {
    setEditingIdx(idx);
    setEditDraft({ ...kpis[idx] });
  }
  function saveEdit(idx) {
    const arr = [...kpis];
    arr[idx] = { ...editDraft };
    setKpis(arr);
    setEditingIdx(null);
    setEditDraft(null);
  }
  function cancelEdit() {
    setEditingIdx(null);
    setEditDraft(null);
  }

  function removeKPI(idx) {
    setKpis(kpis.filter((_, i) => i !== idx));
    setEditingIdx(null);
    setEditDraft(null);
  }

  return (
    <div className="max-w-[1350px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #222a2e 70%, #283E51 100%)",
        borderRadius: "32px",
        boxShadow: "0 8px 32px #2229",
        minHeight: 840
      }}>
      {/* Header/Summary */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaChartBar size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700" }}>KPI MATRIX / HEATMAP</h1>
          </div>
          <div className="text-[#FFD700] italic text-base">Traffic-light analytics. Inline edit. Board summary. Export. All departments.</div>
        </div>
        <div className="flex items-center gap-3">
          <select className="rounded px-2 py-2 bg-[#FFD700] text-[#222] font-bold"
            value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Depts</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={() => exportCSV(filtered)}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Board summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#1de682]">
          <div className="font-black text-2xl mb-1 text-[#1de682]">{numGreen}</div>
          <div className="font-bold">On Track</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD700]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{numAmber}</div>
          <div className="font-bold">Close/Amber</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#e24242]">
          <div className="font-black text-2xl mb-1 text-[#e24242]">{numRed}</div>
          <div className="font-bold">At Risk</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD70099]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{atRisk.slice(0, 3).map(k => k.label).join(', ') || "—"}</div>
          <div className="font-bold">Top At Risk</div>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-[#181e23] rounded-2xl p-6 shadow border-l-8 border-[#FFD70099] mb-8">
        <table className="min-w-full text-lg">
          <thead>
            <tr>
              <th>Department</th>
              <th>Group</th>
              <th>KPI</th>
              <th>Value</th>
              <th>Target</th>
              <th>Progress</th>
              <th>Trend</th>
              <th>Status</th>
              <th>Mini Chart</th>
              <th>Owner</th>
              <th>Note</th>
              <th>Last Update</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k, idx) => editingIdx === idx ? (
              <tr key={idx} style={{ background: "#FFD70018" }}>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-20"
                    value={editDraft.dept}
                    onChange={e => setEditDraft({ ...editDraft, dept: e.target.value })} />
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-16"
                    value={editDraft.group}
                    onChange={e => setEditDraft({ ...editDraft, group: e.target.value })} />
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                    value={editDraft.label}
                    onChange={e => setEditDraft({ ...editDraft, label: e.target.value })} />
                </td>
                <td>
                  <input type="number" className="w-16 text-center bg-[#23292f] rounded"
                    value={editDraft.value}
                    onChange={e => setEditDraft({ ...editDraft, value: Number(e.target.value) })} />
                </td>
                <td>
                  <input type="number" className="w-16 text-center bg-[#23292f] rounded"
                    value={editDraft.target}
                    onChange={e => setEditDraft({ ...editDraft, target: Number(e.target.value) })} />
                </td>
                <td>
                  <progress value={editDraft.value} max={editDraft.target} style={{ width: 70, height: 11 }} />
                </td>
                <td>
                  <input type="number" className="w-12 text-center bg-[#23292f] rounded"
                    value={editDraft.trend}
                    onChange={e => setEditDraft({ ...editDraft, trend: Number(e.target.value) })} />
                </td>
                <td>{flagBadge(editDraft.value, editDraft.target)}</td>
                <td>
                  {/* Mini chart */}
                  {miniChart(editDraft.history, kpiColor(editDraft.value, editDraft.target))}
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24"
                    value={editDraft.owner}
                    onChange={e => setEditDraft({ ...editDraft, owner: e.target.value })} />
                </td>
                <td>
                  <input className="bg-[#23292f] text-white rounded px-2 py-1 w-40"
                    value={editDraft.note}
                    onChange={e => setEditDraft({ ...editDraft, note: e.target.value })} />
                </td>
                <td>
                  <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                    value={editDraft.lastUpdate}
                    onChange={e => setEditDraft({ ...editDraft, lastUpdate: e.target.value })} />
                </td>
                <td>
                  <button onClick={() => saveEdit(idx)} className="text-[#1de682] font-bold px-2">Save</button>
                  <button onClick={cancelEdit} className="text-[#e24242] font-bold px-2">Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={idx}>
                <td>{k.dept}</td>
                <td>{k.group}</td>
                <td>{k.label}</td>
                <td style={{
                  background: kpiColor(k.value, k.target),
                  color: "#181e23",
                  borderRadius: "9px",
                  fontWeight: 700,
                  padding: "0 10px"
                }}>{k.value}</td>
                <td>{k.target}</td>
                <td>
                  <progress value={k.value} max={k.target} style={{ width: 70, height: 11, background: "#222" }} />
                </td>
                <td>{trendIcon(k.trend)}</td>
                <td>{flagBadge(k.value, k.target)}</td>
                <td>{miniChart(k.history, kpiColor(k.value, k.target))}</td>
                <td>{k.owner}</td>
                <td>
                  <span title={k.note}><FaInfoCircle className="inline mr-1" />{k.note && k.note.slice(0, 16)}{k.note && k.note.length > 16 ? "…" : ""}</span>
                </td>
                <td>{k.lastUpdate}</td>
                <td>
                  <button onClick={() => startEdit(idx)} className="text-[#FFD700] font-bold px-2"><FaEdit /></button>
                  <button onClick={() => removeKPI(idx)} className="text-[#e24242] font-bold px-2"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addKPI}
          className="flex items-center gap-2 mt-4 bg-[#FFD700] text-black rounded font-bold px-4 py-2"
        ><FaPlus /> Add KPI</button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-12 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
