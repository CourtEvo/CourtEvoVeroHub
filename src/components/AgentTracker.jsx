import React, { useState } from "react";
import { saveAs } from "file-saver";
import { FaUserTie, FaUsers, FaFlagCheckered, FaMoneyBillWave, FaChartBar, FaExclamationTriangle, FaCheckCircle, FaStar, FaDownload, FaUserCircle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// --- Demo agents (premium data) ---
const initialAgents = [
  {
    id: 1,
    name: "T. Đorđević",
    agency: "Optimus Sports",
    players: [
      { name: "A. Proleta", contractExpiry: "2025-06-30", salary: 71000, status: "Active" },
      { name: "M. Nikolić", contractExpiry: "2024-11-30", salary: 55000, status: "Expiring" }
    ],
    deals: 16,
    pipelineValue: 1320000,
    risk: "Low",
    flag: "",
    lastContact: "2025-05-21",
  },
  {
    id: 2,
    name: "B. Marinčić",
    agency: "Paragon Agency",
    players: [
      { name: "J. Vuković", contractExpiry: "2024-08-31", salary: 43000, status: "Expiring" },
      { name: "R. Grgić", contractExpiry: "2026-02-15", salary: 68000, status: "Active" },
      { name: "D. Popov", contractExpiry: "2025-03-20", salary: 39500, status: "Active" }
    ],
    deals: 11,
    pipelineValue: 1605000,
    risk: "Medium",
    flag: "Check KYC docs for Vuković.",
    lastContact: "2025-04-17",
  },
  
];

// --- Utility functions ---
function monthsLeft(expiry) {
  if (!expiry) return 99;
  const now = new Date();
  const end = new Date(expiry);
  return Math.max(0, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
}
function riskBadge(risk) {
  if (risk === "High") return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold"><FaExclamationTriangle className="mr-1" /> High</span>;
  if (risk === "Medium") return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold"><FaStar className="mr-1" /> Medium</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold"><FaCheckCircle className="mr-1" /> Low</span>;
}
function exportCSV(agents) {
  let rows = [
    ["Agent", "Agency", "Deals", "Pipeline (€)", "Risk", "Flag", "Last Contact", "Player", "Expiry", "Salary", "Status"]
  ];
  agents.forEach(agent =>
    agent.players.forEach(p =>
      rows.push([
        agent.name, agent.agency, agent.deals, agent.pipelineValue, agent.risk, agent.flag, agent.lastContact,
        p.name, p.contractExpiry, p.salary, p.status
      ])
    )
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_AgentTracker_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function AgentTracker() {
  const [agents, setAgents] = useState(initialAgents);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(null);

  // --- Analytics
  const expiringContracts = agents.flatMap(a =>
    a.players.filter(p => monthsLeft(p.contractExpiry) < 4)
      .map(p => ({ ...p, agent: a.name, agency: a.agency }))
  );
  const totalPipeline = agents.reduce((a, b) => a + b.pipelineValue, 0);
  const totalDeals = agents.reduce((a, b) => a + b.deals, 0);

  // --- Chart
  const barData = agents.map(a => ({
    agent: a.name,
    Pipeline: a.pipelineValue,
    Deals: a.deals,
  }));

  // --- Search filter
  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.agency.toLowerCase().includes(search.toLowerCase()) ||
    a.players.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  // --- Drawer: handle edit
  function handleEdit(player, idx, i) {
    setEdit(true);
    setDraft({ ...player, idx, i, agent: agents[idx].name, agency: agents[idx].agency });
  }
  function handleSaveEdit() {
    const arr = [...agents];
    arr[draft.idx].players[draft.i] = { ...draft };
    setAgents(arr);
    setEdit(false);
    setSelectedPlayer(null);
    setDraft(null);
  }

  return (
    <div className="max-w-[1700px] mx-auto py-8 px-8"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #222a2e 60%, #283E51 100%)",
        borderRadius: "32px", boxShadow: "0 8px 32px #2229", minHeight: 900
      }}
    >
      {/* Header/Analytics */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-7">
        <div>
          <div className="flex items-center gap-5">
            <FaUserTie size={58} color="#FFD700" />
            <div>
              <h1 className="font-extrabold text-4xl tracking-tight" style={{ color: "#FFD700", letterSpacing: 2, textShadow: "0 2px 10px #0008" }}>AGENT / INTERMEDIARY TRACKER</h1>
              <div className="font-bold italic text-[#FFD700] text-lg tracking-wide">BE REAL. BE VERO.</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <input
            type="text"
            placeholder="Search agent, agency, player…"
            className="px-3 py-2 rounded-lg text-[#212] outline-none border border-[#FFD70099] bg-[#f9f9f9] w-56"
            value={search}
            onChange={e => setSearch(e.target.value)}
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
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-7">
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-7 px-7 shadow border-l-4 border-[#FFD70099]">
          <div className="font-black text-2xl mb-1" style={{ color: "#FFD700" }}>€{totalPipeline.toLocaleString()}</div>
          <div className="font-bold text-[#1de682] text-lg">Total Pipeline</div>
        </div>
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-7 px-7 shadow border-l-4 border-[#1de68299]">
          <div className="font-black text-2xl mb-1" style={{ color: "#FFD700" }}>{totalDeals}</div>
          <div className="font-bold text-[#1de682] text-lg">Deals</div>
        </div>
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-7 px-7 shadow border-l-4 border-[#FFD70099]">
          <div className="font-black text-2xl mb-1" style={{ color: "#FFD700" }}>{agents.length}</div>
          <div className="font-bold text-[#1de682] text-lg">Agents</div>
        </div>
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-7 px-7 shadow border-l-4 border-[#e24242bb]">
          <div className="font-black text-2xl mb-1" style={{ color: "#FFD700" }}>{expiringContracts.length}</div>
          <div className="font-bold text-[#e24242] text-lg">Expiring <span className="text-xs">(&lt;4mo)</span></div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-8 bg-[#181e23] rounded-2xl p-8 shadow-lg border-l-8 border-[#FFD70099] max-w-[1200px] mx-auto">
        <div className="font-black text-2xl mb-3" style={{ color: "#FFD700" }}>Pipeline Value by Agent</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="agent" tick={{ fill: "#FFD700", fontSize: 16 }} />
            <YAxis fontSize={15} />
            <Tooltip />
            <Bar dataKey="Pipeline" radius={12}>
              {barData.map((entry, idx) => (
                <Cell key={idx} fill="#FFD700" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099] max-w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="font-black text-2xl" style={{ color: "#1de682" }}>AGENTS & CONTRACTS</div>
          <button onClick={() => setAgents([...agents, { id: Date.now(), name: "", agency: "", players: [], deals: 0, pipelineValue: 0, risk: "Low", flag: "", lastContact: "" }])}
            className="bg-[#FFD700] text-black rounded-lg px-4 py-2 font-bold hover:scale-105 shadow">+ Add Agent</button>
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: 400 }}>
          <table className="min-w-[1200px] text-lg">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Agency</th>
                <th>Deals</th>
                <th>Pipeline (€)</th>
                <th>Risk</th>
                <th>Flag</th>
                <th>Last Contact</th>
                <th>Players/Contracts</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={a.id} className={a.risk === "High" ? "bg-[#e2424233]" : ""}>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32" value={a.name}
                      onChange={e => { const arr = [...agents]; arr[idx].name = e.target.value; setAgents(arr); }} />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32" value={a.agency}
                      onChange={e => { const arr = [...agents]; arr[idx].agency = e.target.value; setAgents(arr); }} />
                  </td>
                  <td>
                    <input type="number" min={0} className="w-14 text-center bg-[#23292f] rounded"
                      value={a.deals}
                      onChange={e => { const arr = [...agents]; arr[idx].deals = Number(e.target.value); setAgents(arr); }} />
                  </td>
                  <td>
                    <input type="number" min={0} className="w-24 text-center bg-[#23292f] rounded"
                      value={a.pipelineValue}
                      onChange={e => { const arr = [...agents]; arr[idx].pipelineValue = Number(e.target.value); setAgents(arr); }} />
                  </td>
                  <td>{riskBadge(a.risk)}</td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-40"
                      value={a.flag}
                      onChange={e => { const arr = [...agents]; arr[idx].flag = e.target.value; setAgents(arr); }} />
                  </td>
                  <td>
                    <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-36"
                      value={a.lastContact}
                      onChange={e => { const arr = [...agents]; arr[idx].lastContact = e.target.value; setAgents(arr); }} />
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {a.players.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPlayer({ ...p, agent: a.name, agency: a.agency, idx, i })}
                          className="flex items-center gap-2 px-3 py-1 bg-[#23292f] rounded-xl shadow hover:bg-[#1de68244] transition"
                          style={{ color: p.status === "Expiring" ? "#FFD700" : "#1de682", fontWeight: 700 }}
                        >
                          <FaUserCircle /> {p.name}
                          <span className="ml-2 text-xs font-normal">({p.status}, {monthsLeft(p.contractExpiry)}mo)</span>
                        </button>
                      ))}
                      <button onClick={() => {
                        const arr = [...agents];
                        arr[idx].players.push({ name: "", contractExpiry: "", salary: 0, status: "Active" });
                        setAgents(arr);
                      }}
                        className="bg-[#FFD700] text-black rounded font-bold px-2 py-1 mt-2">+ Player</button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => setAgents(agents.filter((_, i) => i !== idx))}
                      className="text-[#e24242] font-black px-2 text-2xl">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expiring Contracts */}
      <div className="mb-10">
        <div className="font-bold text-xl mb-2 text-[#FFD700] flex items-center gap-2">
          <FaFlagCheckered /> Expiring Contracts <span className="text-base text-[#e24242]">(next 4 months)</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {expiringContracts.length === 0 && <span className="text-[#1de682] font-bold">No urgent expiries.</span>}
          {expiringContracts.map((c, idx) => (
            <div key={idx} className="rounded-xl px-6 py-3 bg-[#23292f] shadow border-l-4 border-[#e24242] flex flex-col items-start min-w-[220px] mb-2">
              <div className="font-bold text-[#FFD700] text-lg">{c.name}</div>
              <div className="text-xs text-[#bcbcbc]">Agent: {c.agent} / {c.agency}</div>
              <div className="text-sm">Expiry: {c.contractExpiry} ({monthsLeft(c.contractExpiry)} mo.)</div>
              <div className="text-sm">Salary: €{c.salary.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer/Popover for Player */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-[#1a2233bb] flex items-center justify-center">
          <div className="bg-[#181e23] rounded-2xl shadow-2xl max-w-[420px] w-full p-7 relative border-4 border-[#FFD700]">
            <button
              onClick={() => { setSelectedPlayer(null); setEdit(false); setDraft(null); }}
              className="absolute top-3 right-5 text-[#FFD700] text-3xl font-bold hover:scale-125"
            >×</button>
            <div className="flex items-center gap-3 mb-4">
              <FaUserCircle size={46} color="#1de682" />
              <div>
                <div className="font-black text-2xl" style={{ color: "#FFD700" }}>{selectedPlayer.name}</div>
                <div className="text-sm text-[#bcbcbc]">Agent: {selectedPlayer.agent} / {selectedPlayer.agency}</div>
              </div>
            </div>
            <div className="mb-1 text-lg font-bold flex items-center gap-2"><FaMoneyBillWave /> Salary: <span className="text-[#FFD700]">{edit ?
              <input type="number" className="bg-[#23292f] text-white rounded px-2 py-1 w-28"
                value={draft.salary}
                onChange={e => setDraft({ ...draft, salary: Number(e.target.value) })} />
              : <>€{selectedPlayer.salary.toLocaleString()}</>}</span></div>
            <div className="mb-1 text-lg font-bold flex items-center gap-2"><FaChartBar /> Expiry: <span className="text-[#FFD700]">{edit ?
              <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-28"
                value={draft.contractExpiry}
                onChange={e => setDraft({ ...draft, contractExpiry: e.target.value })} />
              : <>{selectedPlayer.contractExpiry}</>}</span> ({monthsLeft(selectedPlayer.contractExpiry)} mo.)</div>
            <div className="mb-3 text-lg font-bold flex items-center gap-2">
              <FaStar /> Status: <span className="text-[#FFD700]">{edit ?
                <select className="bg-[#23292f] text-white rounded px-1 py-1"
                  value={draft.status}
                  onChange={e => setDraft({ ...draft, status: e.target.value })}>
                  <option>Active</option>
                  <option>Expiring</option>
                </select>
                : selectedPlayer.status}</span>
            </div>
            {!edit ? (
              <button className="bg-[#FFD700] text-black rounded-xl font-bold px-5 py-2 mt-4 w-full"
                onClick={() => handleEdit(selectedPlayer, selectedPlayer.idx, selectedPlayer.i)}>Edit</button>
            ) : (
              <div className="flex gap-3 mt-4">
                <button className="bg-[#1de682] text-black rounded-xl font-bold px-5 py-2 flex-1"
                  onClick={handleSaveEdit}>Save</button>
                <button className="bg-[#e24242] text-white rounded-xl font-bold px-5 py-2 flex-1"
                  onClick={() => setEdit(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-16 border-t pt-7 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaUserTie size={38} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-2xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
