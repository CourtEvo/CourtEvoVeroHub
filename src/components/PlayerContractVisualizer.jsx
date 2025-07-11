import React, { useState } from "react";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FaHandshake, FaExclamationTriangle, FaCheckCircle, FaUserTie, FaMoneyBillAlt } from "react-icons/fa";

function monthsLeft(expiry) {
  if (!expiry) return 99;
  const now = new Date();
  const end = new Date(expiry);
  return Math.max(0, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
}

const initialContracts = [
  { name: "A. Perković", team: "Senior", expiry: "2025-06-30", salary: 65000, option: true, release: false, agent: "J. Marković", status: "Open" },
  { name: "M. Matić", team: "U18", expiry: "2024-12-31", salary: 22000, option: false, release: true, agent: "F. Novak", status: "Negotiating" },
  { name: "I. Kovač", team: "U16", expiry: "2026-07-31", salary: 18000, option: true, release: false, agent: "—", status: "Signed" }
];

function badge(months, status) {
  if (months < 4 && status !== "Signed") return { label: "Expiring", color: "#e24242", icon: <FaExclamationTriangle /> };
  if (status === "Signed") return { label: "Secured", color: "#1de682", icon: <FaCheckCircle /> };
  if (status === "Negotiating") return { label: "Negotiating", color: "#FFD700", icon: <FaHandshake /> };
  return { label: "Open", color: "#FFD700", icon: <FaUserTie /> };
}

// Export
function exportCSV(contracts) {
  let rows = [
    ["Name", "Team", "Expiry", "Months Left", "Salary", "Option", "Release", "Agent", "Status"]
  ];
  contracts.forEach(c => {
    rows.push([
      c.name, c.team, c.expiry, monthsLeft(c.expiry), c.salary, c.option ? "Yes" : "No", c.release ? "Yes" : "No", c.agent, c.status
    ]);
  });
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_PlayerContracts_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function PlayerContractVisualizer() {
  const [contracts, setContracts] = useState(initialContracts);

  // Add/remove
  function addContract() {
    setContracts([...contracts, { name: "", team: "", expiry: "", salary: 0, option: false, release: false, agent: "", status: "Open" }]);
  }
  function removeContract(idx) {
    setContracts(contracts.filter((_, i) => i !== idx));
  }

  // Timeline bar data
  const barData = contracts.map(c => ({
    name: c.name,
    Months: monthsLeft(c.expiry)
  }));

  const totalSalary = contracts.reduce((a, c) => a + (Number(c.salary) || 0), 0);
  const avgSalary = contracts.length ? Math.round(totalSalary / contracts.length) : 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #222a2e 60%, #283E51 100%)",
        borderRadius: "28px", boxShadow: "0 8px 32px #2229",
        minHeight: 820
      }}>
      {/* Header */}
      <div className="flex items-center gap-7 mb-10">
        <div className="bg-[#181e23ee] rounded-2xl p-4 shadow-2xl flex items-center border-2 border-[#FFD70033]">
          <FaMoneyBillAlt size={54} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700", textShadow: "0 2px 10px #0009" }}>
            Player Contract <span className="text-[#1de682]">Visualizer</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-2 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
        <div className="ml-auto">
          <button
            className="px-5 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
            onClick={() => exportCSV(contracts)}
          >Export CSV</button>
        </div>
      </div>

      {/* Salary summary */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-5 px-7 shadow border-l-4 border-[#FFD70099]">
          <div className="text-2xl font-black mb-1" style={{ color: "#FFD700" }}>{contracts.length}</div>
          <div className="font-bold text-[#1de682]">Contracts</div>
        </div>
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-5 px-7 shadow border-l-4 border-[#1de68299]">
          <div className="text-2xl font-black mb-1" style={{ color: "#FFD700" }}>{totalSalary.toLocaleString()} €</div>
          <div className="font-bold text-[#1de682]">Total Salary</div>
        </div>
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-5 px-7 shadow border-l-4 border-[#FFD70099]">
          <div className="text-2xl font-black mb-1" style={{ color: "#FFD700" }}>{avgSalary.toLocaleString()} €</div>
          <div className="font-bold text-[#1de682]">Avg. Salary</div>
        </div>
        <div className="bg-[#181e23] rounded-xl flex flex-col items-center py-5 px-7 shadow border-l-4 border-[#1de68299]">
          <div className="text-2xl font-black mb-1" style={{ color: "#FFD700" }}>
            {contracts.filter(c => monthsLeft(c.expiry) < 4).length}
          </div>
          <div className="font-bold text-[#e24242]">Expiring Soon</div>
        </div>
      </div>

      {/* Expiry Timeline Bar Chart */}
      <div className="mb-8 bg-[#181e23] rounded-2xl p-6 shadow-lg border-l-8 border-[#FFD70099]">
        <div className="font-black text-xl mb-3" style={{ color: "#FFD700" }}>Contract Months Remaining</div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fill: "#FFD700", fontSize: 15 }} />
            <YAxis fontSize={13} />
            <Tooltip />
            <Bar dataKey="Months">
              {barData.map((entry, idx) => (
                <Cell key={idx} fill={monthsLeft(contracts[idx].expiry) < 4 ? "#e24242" : "#1de682"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contracts Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-5 shadow-xl border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-xl" style={{ color: "#1de682" }}>Contracts Table</div>
          <button onClick={addContract}
            className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Contract</button>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 340 }}>
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Team</th>
                <th>Expiry</th>
                <th>Months Left</th>
                <th>Salary (€)</th>
                <th>Option</th>
                <th>Release</th>
                <th>Agent</th>
                <th>Status</th>
                <th>Badge</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, idx) => {
                const mths = monthsLeft(c.expiry);
                const b = badge(mths, c.status);
                return (
                  <tr key={idx} className={b.label === "Expiring" ? "bg-[#e2424233]" : b.label === "Secured" ? "bg-[#1de68222]" : b.label === "Negotiating" ? "bg-[#FFD70033]" : ""}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-20" value={c.name}
                        onChange={e => { const arr = [...contracts]; arr[idx].name = e.target.value; setContracts(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-16" value={c.team}
                        onChange={e => { const arr = [...contracts]; arr[idx].team = e.target.value; setContracts(arr); }} />
                    </td>
                    <td>
                      <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-28"
                        value={c.expiry}
                        onChange={e => { const arr = [...contracts]; arr[idx].expiry = e.target.value; setContracts(arr); }} />
                    </td>
                    <td className="text-center">{c.expiry ? mths : "-"}</td>
                    <td>
                      <input type="number" min={0} className="w-20 text-center bg-[#23292f] rounded"
                        value={c.salary}
                        onChange={e => { const arr = [...contracts]; arr[idx].salary = Number(e.target.value); setContracts(arr); }} />
                    </td>
                    <td className="text-center">
                      <input type="checkbox" checked={c.option}
                        onChange={e => { const arr = [...contracts]; arr[idx].option = e.target.checked; setContracts(arr); }} />
                    </td>
                    <td className="text-center">
                      <input type="checkbox" checked={c.release}
                        onChange={e => { const arr = [...contracts]; arr[idx].release = e.target.checked; setContracts(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-18" value={c.agent}
                        onChange={e => { const arr = [...contracts]; arr[idx].agent = e.target.value; setContracts(arr); }} />
                    </td>
                    <td>
                      <select className="bg-[#23292f] text-white rounded px-1 py-1"
                        value={c.status}
                        onChange={e => { const arr = [...contracts]; arr[idx].status = e.target.value; setContracts(arr); }}>
                        <option>Open</option>
                        <option>Negotiating</option>
                        <option>Signed</option>
                        <option>Closed</option>
                      </select>
                    </td>
                    <td>
                      <span className="inline-flex items-center font-bold" style={{ color: b.color }}>
                        {b.icon}
                        <span className="ml-1">{b.label}</span>
                      </span>
                    </td>
                    <td>
                      <button onClick={() => removeContract(idx)}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-10 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaMoneyBillAlt size={34} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
