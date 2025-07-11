import React, { useState } from "react";
import { saveAs } from "file-saver";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import {
  FaChartLine,
  FaRunning,
  FaBolt,
  FaHeartbeat,
  FaDumbbell,
  FaUserCircle,
  FaDownload,
  FaTrophy,
  FaUserPlus,
  FaMedkit,
  FaStar,
  FaCalendarCheck,
  FaSearch,
  FaCheckCircle   
} from "react-icons/fa";

// --- DEMO DATA ---
const initialPlayers = [
  {
    name: "A. Proleta",
    age: 17,
    team: "U18",
    attendance: 97,
    status: "Active",
    metrics: {
      physical: 9,
      technical: 8,
      tactical: 7,
      mental: 8,
      recovery: 7,
    },
    injury: "",
    highPerf: true,
  },
  {
    name: "M. Nikolić",
    age: 18,
    team: "U18",
    attendance: 85,
    status: "Active",
    metrics: {
      physical: 7,
      technical: 8,
      tactical: 6,
      mental: 6,
      recovery: 6,
    },
    injury: "Hamstring, 2w",
    highPerf: false,
  },
  {
    name: "B. Petrović",
    age: 20,
    team: "Senior",
    attendance: 92,
    status: "Active",
    metrics: {
      physical: 8,
      technical: 9,
      tactical: 9,
      mental: 8,
      recovery: 7,
    },
    injury: "",
    highPerf: true,
  },
  {
    name: "I. Radić",
    age: 20,
    team: "Senior",
    attendance: 82,
    status: "Active",
    metrics: {
      physical: 6,
      technical: 7,
      tactical: 8,
      mental: 5,
      recovery: 6,
    },
    injury: "Ankle, 4d",
    highPerf: false,
  },
  {
    name: "M. Tomić",
    age: 17,
    team: "U18",
    attendance: 98,
    status: "Active",
    metrics: {
      physical: 9,
      technical: 7,
      tactical: 8,
      mental: 8,
      recovery: 8,
    },
    injury: "",
    highPerf: true,
  },
];

// --- Export CSV ---
function exportCSV(players) {
  let rows = [
    ["Name", "Age", "Team", "Attendance (%)", "Physical", "Technical", "Tactical", "Mental", "Recovery", "Injury", "High Perf"]
  ];
  players.forEach(p =>
    rows.push([
      p.name, p.age, p.team, p.attendance,
      p.metrics.physical, p.metrics.technical, p.metrics.tactical, p.metrics.mental, p.metrics.recovery,
      p.injury, p.highPerf ? "YES" : ""
    ])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_HighPerf_${new Date().toISOString().slice(0,10)}.csv`);
}

// --- Badge logic
function statusBadge(p) {
  if (p.injury) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold"><FaMedkit className="mr-1" />INJ</span>;
  if (p.highPerf) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold"><FaStar className="mr-1" />PERF</span>;
  if (p.attendance < 85) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFA500] text-black font-bold"><FaCalendarCheck className="mr-1" />LOW ATT</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold"><FaCheckCircle className="mr-1" />OK</span>;
}

export default function HighPerformanceDashboard() {
  const [players, setPlayers] = useState(initialPlayers);
  const [filter, setFilter] = useState("");
  const [viewIdx, setViewIdx] = useState(0);

  // Analytics: averages/min/max
  const teamStats = players.reduce(
    (acc, p) => {
      Object.keys(p.metrics).forEach(k => {
        acc[k] = (acc[k] || []);
        acc[k].push(p.metrics[k]);
      });
      return acc;
    }, {}
  );
  const averages = Object.fromEntries(
    Object.entries(teamStats).map(([k, arr]) => [k, arr.reduce((a, b) => a + b, 0) / arr.length])
  );

  // Attendance chart data
  const barData = players.map(p => ({
    name: p.name,
    Attendance: p.attendance
  }));

  // Radar for selected player
  const radarData = Object.entries(players[viewIdx]?.metrics || {}).map(([k, v]) => ({
    skill: k.charAt(0).toUpperCase() + k.slice(1),
    value: v
  }));

  // Filtered player list
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.team.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-[1700px] mx-auto py-8 px-8"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #232a2e 65%, #283E51 100%)",
        borderRadius: "32px", boxShadow: "0 8px 32px #2229", minHeight: 900
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-6 mb-7">
        <div>
          <div className="flex items-center gap-5">
            <FaChartLine size={58} color="#FFD700" />
            <div>
              <h1 className="font-extrabold text-4xl tracking-tight" style={{ color: "#FFD700", letterSpacing: 2, textShadow: "0 2px 10px #0008" }}>HIGH-PERFORMANCE DASHBOARD</h1>
              <div className="font-bold italic text-[#FFD700] text-lg tracking-wide">BE REAL. BE VERO.</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <input
            type="text"
            placeholder="Search name or team…"
            className="px-3 py-2 rounded-lg text-[#212] outline-none border border-[#FFD70099] bg-[#f9f9f9] w-56"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ fontSize: 17, fontWeight: 600 }}
          />
          <button
            className="flex items-center gap-2 px-6 py-2 bg-[#FFD700] rounded-xl font-semibold text-[#222] shadow hover:scale-105"
            onClick={() => exportCSV(filtered)}
            style={{ fontSize: 17, fontWeight: 700 }}
          ><FaDownload /> Export</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-7">
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-7 px-7 shadow border-l-4 border-[#FFD70099]">
          <div className="font-black text-2xl mb-1" style={{ color: "#FFD700" }}>{players.length}</div>
          <div className="font-bold text-[#1de682] text-lg">Players</div>
        </div>
        {Object.keys(averages).map(key => (
          <div key={key} className="bg-[#181e23] rounded-xl flex flex-col items-center py-7 px-7 shadow border-l-4 border-[#1de68299]">
            <div className="font-black text-2xl mb-1" style={{ color: "#FFD700" }}>
              {Math.round(averages[key] * 10) / 10}
            </div>
            <div className="font-bold text-[#1de682] text-lg">{key.charAt(0).toUpperCase() + key.slice(1)} Avg.</div>
          </div>
        ))}
      </div>

      {/* Chart row */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Radar */}
        <div className="bg-[#181e23] rounded-2xl shadow-xl p-7 flex-1 flex flex-col items-center min-w-[350px] max-w-[460px]">
          <div className="font-black text-2xl mb-3" style={{ color: "#FFD700" }}>Player Radar</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "#FFD700", fontSize: 16 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Skills" dataKey="value" stroke="#FFD700" fill="#1de682" fillOpacity={0.55} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          {/* Player select */}
          <div className="flex flex-wrap gap-2 mt-6">
            {filtered.map((p, idx) => (
              <button key={p.name}
                onClick={() => setViewIdx(players.indexOf(p))}
                className={`px-4 py-1 rounded-lg font-bold ${viewIdx === players.indexOf(p) ? "bg-[#FFD700] text-black" : "bg-[#222] text-[#FFD700]"} transition`}
              >
                <FaUserCircle className="mr-1 inline" /> {p.name}
              </button>
            ))}
          </div>
        </div>
        {/* Attendance chart */}
        <div className="bg-[#181e23] rounded-2xl shadow-xl p-7 flex-1 flex flex-col min-w-[320px] max-w-[520px]">
          <div className="font-black text-2xl mb-3" style={{ color: "#FFD700" }}>Attendance</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: "#FFD700", fontSize: 15 }} />
              <YAxis fontSize={13} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="Attendance">
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.Attendance >= 95 ? "#1de682" : entry.Attendance >= 85 ? "#FFD700" : "#e24242"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Injury log */}
        <div className="bg-[#181e23] rounded-2xl shadow-xl p-7 flex-1 flex flex-col min-w-[300px] max-w-[380px]">
          <div className="font-black text-2xl mb-3 flex items-center gap-2" style={{ color: "#FFD700" }}><FaMedkit />Injury Log</div>
          {players.filter(p => p.injury).length === 0 && <div className="text-[#1de682] font-bold mt-4">No injuries.</div>}
          <ul className="mt-2 flex flex-col gap-2">
            {players.filter(p => p.injury).map(p => (
              <li key={p.name} className="bg-[#e2424222] rounded px-4 py-2 flex flex-col">
                <span className="font-bold text-[#FFD700]">{p.name}</span>
                <span className="text-sm text-[#FFD700]">{p.injury}</span>
                <span className="text-xs text-[#bcbcbc]">Team: {p.team}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099] max-w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="font-black text-2xl" style={{ color: "#1de682" }}>PERFORMANCE DATA</div>
          <button onClick={() => setPlayers([...players, {
            name: "", age: 18, team: "", attendance: 100, status: "Active", metrics: { physical: 7, technical: 7, tactical: 7, mental: 7, recovery: 7 }, injury: "", highPerf: false
          }])}
            className="bg-[#FFD700] text-black rounded-lg px-4 py-2 font-bold hover:scale-105 shadow"><FaUserPlus /> Add Player</button>
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: 400 }}>
          <table className="min-w-[1200px] text-lg">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Team</th>
                <th>Attendance (%)</th>
                <th>Physical</th>
                <th>Technical</th>
                <th>Tactical</th>
                <th>Mental</th>
                <th>Recovery</th>
                <th>Injury</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.name} className={p.highPerf ? "bg-[#FFD70022]" : p.injury ? "bg-[#e2424233]" : ""}>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-28" value={p.name}
                      onChange={e => {
                        const arr = [...players];
                        arr[players.indexOf(p)].name = e.target.value;
                        setPlayers(arr);
                      }} />
                  </td>
                  <td>
                    <input type="number" min={15} max={35} className="w-16 text-center bg-[#23292f] rounded"
                      value={p.age}
                      onChange={e => {
                        const arr = [...players];
                        arr[players.indexOf(p)].age = Number(e.target.value);
                        setPlayers(arr);
                      }} />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-16" value={p.team}
                      onChange={e => {
                        const arr = [...players];
                        arr[players.indexOf(p)].team = e.target.value;
                        setPlayers(arr);
                      }} />
                  </td>
                  <td>
                    <input type="number" min={0} max={100} className="w-16 text-center bg-[#23292f] rounded"
                      value={p.attendance}
                      onChange={e => {
                        const arr = [...players];
                        arr[players.indexOf(p)].attendance = Number(e.target.value);
                        setPlayers(arr);
                      }} />
                  </td>
                  {["physical", "technical", "tactical", "mental", "recovery"].map(m => (
                    <td key={m}>
                      <input type="number" min={1} max={10} className="w-14 text-center bg-[#23292f] rounded"
                        value={p.metrics[m]}
                        onChange={e => {
                          const arr = [...players];
                          arr[players.indexOf(p)].metrics[m] = Number(e.target.value);
                          setPlayers(arr);
                        }} />
                    </td>
                  ))}
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24" value={p.injury}
                      onChange={e => {
                        const arr = [...players];
                        arr[players.indexOf(p)].injury = e.target.value;
                        setPlayers(arr);
                      }} />
                  </td>
                  <td>{statusBadge(p)}</td>
                  <td>
                    <button onClick={() => setPlayers(players.filter(x => x !== p))}
                      className="text-[#e24242] font-black px-2 text-2xl">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-16 border-t pt-7 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaChartLine size={38} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-2xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
