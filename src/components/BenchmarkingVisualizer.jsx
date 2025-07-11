import React, { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import { FaChartPie, FaChartBar, FaDownload, FaTrophy, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { saveAs } from "file-saver";

// Demo: Each kpi/metric compared across 3 clubs/standards
const initialBench = [
  {
    kpi: "Athlete Retention (%)",
    department: "Sport",
    yours: 92,
    peer: 87,
    gold: 95,
    target: 90,
  },
  {
    kpi: "Win %",
    department: "Sport",
    yours: 58,
    peer: 60,
    gold: 66,
    target: 62,
  },
  {
    kpi: "Revenue YTD (€k)",
    department: "Finance",
    yours: 710,
    peer: 670,
    gold: 750,
    target: 700,
  },
  {
    kpi: "Cost per Win (€)",
    department: "Finance",
    yours: 4200,
    peer: 4100,
    gold: 3700,
    target: 4000,
  },
  {
    kpi: "Staff Turnover (%)",
    department: "HR",
    yours: 5,
    peer: 7,
    gold: 3,
    target: 6,
  },
  {
    kpi: "Compliance (%)",
    department: "Ops",
    yours: 96,
    peer: 92,
    gold: 98,
    target: 95,
  },
];

function getFlag(val, peer, gold, target, invert = false) {
  // invert: lower is better (e.g. cost per win, turnover)
  if (invert) {
    if (val < gold) return ["#1de682", <FaTrophy />];
    if (val < peer) return ["#FFD700", <FaCheckCircle />];
    if (val > target) return ["#e24242", <FaExclamationTriangle />];
    return ["#FFD700", <FaCheckCircle />];
  }
  if (val > gold) return ["#1de682", <FaTrophy />];
  if (val > peer) return ["#FFD700", <FaCheckCircle />];
  if (val < target) return ["#e24242", <FaExclamationTriangle />];
  return ["#FFD700", <FaCheckCircle />];
}

function exportCSV(bench, selectedDept) {
  let rows = [["KPI", "Department", "Yours", "Peer", "Gold", "Target"]];
  bench.filter(b => selectedDept === "All" || b.department === selectedDept).forEach(b =>
    rows.push([b.kpi, b.department, b.yours, b.peer, b.gold, b.target])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_Benchmarking_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function BenchmarkingVisualizer() {
  const [bench, setBench] = useState(initialBench);
  const [dept, setDept] = useState("All");

  // Filter
  const departments = Array.from(new Set(bench.map(b => b.department)));
  const filtered = bench.filter(b => dept === "All" || b.department === dept);

  // Board summary
  const aboveGold = filtered.filter(b => b.yours > b.gold).length;
  const belowPeer = filtered.filter(b => b.yours < b.peer).length;

  // For radar
  const radarData = filtered.map(b => ({
    metric: b.kpi.split(" ")[0],
    Yours: b.yours,
    Peer: b.peer,
    Gold: b.gold,
    Target: b.target,
  }));

  // For bar
  const barData = filtered.map(b => ({
    name: b.kpi.split(" ")[0],
    Yours: b.yours,
    Peer: b.peer,
    Gold: b.gold,
    Target: b.target,
  }));

  // Inline edit
  function update(idx, key, val) {
    const arr = [...bench];
    arr[idx][key] = Number(val);
    setBench(arr);
  }

  // For flag logic (invert for "lower is better" metrics)
  function isInverted(kpi) {
    return /(cost|turnover)/i.test(kpi);
  }

  return (
    <div className="max-w-[1350px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #222a2e 70%, #283E51 100%)",
        borderRadius: "32px",
        boxShadow: "0 8px 32px #2229",
        minHeight: 900
      }}>
      {/* Header / Board cards */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaChartPie size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700" }}>BENCHMARKING VISUALIZER</h1>
          </div>
          <div className="text-[#FFD700] italic text-base">Compare to peer, gold standard, or custom targets. Board-ready visuals, inline edit, export.</div>
        </div>
        <div className="flex items-center gap-3">
          <select className="rounded px-2 py-2 bg-[#FFD700] text-[#222] font-bold"
            value={dept} onChange={e => setDept(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={() => exportCSV(bench, dept)}>
            <FaDownload /> Export
          </button>
        </div>
      </div>
      {/* Board summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-7">
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#1de682]">
          <div className="font-black text-2xl mb-1 text-[#1de682]">{aboveGold}</div>
          <div className="font-bold">Above Gold Standard</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD700]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{belowPeer}</div>
          <div className="font-bold">Below Peer</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD70099]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{filtered.length}</div>
          <div className="font-bold">KPIs Compared</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#e24242]">
          <div className="font-black text-2xl mb-1 text-[#e24242]">{filtered.filter(b => b.yours < b.target).length}</div>
          <div className="font-bold">Below Target</div>
        </div>
      </div>

      {/* Radar + Bar Chart Row */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="bg-[#181e23] rounded-2xl shadow-xl p-7 flex-1 flex flex-col items-center min-w-[350px] max-w-[520px]">
          <div className="font-black text-2xl mb-3" style={{ color: "#FFD700" }}>Benchmark Radar</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#FFD700", fontSize: 14 }} />
              <PolarRadiusAxis angle={30} />
              <Radar name="Yours" dataKey="Yours" stroke="#1de682" fill="#1de682" fillOpacity={0.3} />
              <Radar name="Peer" dataKey="Peer" stroke="#FFD700" fill="#FFD700" fillOpacity={0.2} />
              <Radar name="Gold" dataKey="Gold" stroke="#e24242" fill="#e24242" fillOpacity={0.12} />
              <Radar name="Target" dataKey="Target" stroke="#fff" fill="#fff" fillOpacity={0.05} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#181e23] rounded-2xl shadow-xl p-7 flex-1 flex flex-col items-center min-w-[350px] max-w-[620px]">
          <div className="font-black text-2xl mb-3" style={{ color: "#FFD700" }}>Bar Comparison</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: "#FFD700", fontSize: 15 }} />
              <YAxis fontSize={13} />
              <Tooltip />
              <Bar dataKey="Yours" fill="#1de682" />
              <Bar dataKey="Peer" fill="#FFD700" />
              <Bar dataKey="Gold" fill="#e24242" />
              <Bar dataKey="Target" fill="#fff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099] max-w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="font-black text-2xl" style={{ color: "#1de682" }}>KPI BENCHMARKS</div>
          <span className="text-[#FFD700] text-sm font-bold">Inline edit your scores</span>
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: 340 }}>
          <table className="min-w-[1200px] text-lg">
            <thead>
              <tr>
                <th>KPI</th>
                <th>Department</th>
                <th>Your Value</th>
                <th>Peer</th>
                <th>Gold</th>
                <th>Target</th>
                <th>Status</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => {
                const [color, icon] = getFlag(b.yours, b.peer, b.gold, b.target, isInverted(b.kpi));
                const delta = b.yours - b.peer;
                return (
                  <tr key={idx}>
                    <td>{b.kpi}</td>
                    <td>{b.department}</td>
                    <td>
                      <input
                        className="bg-[#23292f] text-white rounded px-2 py-1 w-24 text-right"
                        type="number"
                        value={b.yours}
                        onChange={e => update(bench.indexOf(b), "yours", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="bg-[#23292f] text-white rounded px-2 py-1 w-20 text-right"
                        type="number"
                        value={b.peer}
                        onChange={e => update(bench.indexOf(b), "peer", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="bg-[#23292f] text-white rounded px-2 py-1 w-20 text-right"
                        type="number"
                        value={b.gold}
                        onChange={e => update(bench.indexOf(b), "gold", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="bg-[#23292f] text-white rounded px-2 py-1 w-20 text-right"
                        type="number"
                        value={b.target}
                        onChange={e => update(bench.indexOf(b), "target", e.target.value)}
                      />
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-1 rounded-xl" style={{ background: color, color: color === "#FFD700" ? "#181e23" : "#fff", fontWeight: 700 }}>{icon}{color === "#1de682" ? " Above Gold" : color === "#FFD700" ? " On/Above Peer" : " Below Target"}</span>
                    </td>
                    <td style={{ color: delta >= 0 ? "#1de682" : "#e24242", fontWeight: 700 }}>
                      {delta >= 0 ? "+" : ""}{delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-12 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
