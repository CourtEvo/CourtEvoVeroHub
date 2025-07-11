import React, { useState } from "react";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FaUsersCog, FaUserTie, FaCrown, FaUserCheck, FaUserClock, FaExclamationTriangle, FaHourglassEnd, FaCheckCircle, FaClipboardList } from "react-icons/fa";

function monthsLeft(expiry) {
  if (!expiry) return 99;
  const now = new Date();
  const end = new Date(expiry);
  return Math.max(0, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
}

// --- Demo data
const initialRoles = [
  { role: "President", current: "J. Novak", backup: "M. Ivanovic", successor: "A. Marković", readiness: 8, expiry: "2027-06-30" },
  { role: "Sports Director", current: "P. Smith", backup: "", successor: "B. Kovač", readiness: 5, expiry: "2025-06-30" },
  { role: "Head Coach", current: "S. Petrović", backup: "", successor: "", readiness: 2, expiry: "2024-09-30" }
];

const initialContracts = [
  { name: "S. Petrović", role: "Head Coach", expiry: "2024-09-30", status: "Open" },
  { name: "B. Kovač", role: "U18 Coach", expiry: "2025-05-31", status: "Negotiating" },
  { name: "A. Marković", role: "U16 Coach", expiry: "2026-07-31", status: "Signed" }
];

const initialStaff = [
  { name: "P. Smith", role: "Sports Director", cpdHours: 12, upToDate: true },
  { name: "S. Petrović", role: "Head Coach", cpdHours: 8, upToDate: false },
  { name: "B. Kovač", role: "U18 Coach", cpdHours: 10, upToDate: true },
  { name: "A. Marković", role: "U16 Coach", cpdHours: 9, upToDate: false }
];

// -- Main Component
export default function BoardSuccessionMatrix() {
  const [roles, setRoles] = useState(initialRoles);
  const [contracts, setContracts] = useState(initialContracts);
  const [staff, setStaff] = useState(initialStaff);

  // --- Analytics
  const urgentContracts = contracts.filter(c => monthsLeft(c.expiry) < 4);
  const fullReady = roles.every(r => r.readiness >= 7 && r.successor);
  const cpd100 = staff.every(s => s.upToDate);

  // CPD for barchart
  const cpdData = staff.map(s => ({ name: s.name, CPD: s.cpdHours }));

  // --- Export
  function exportCSV() {
    let rows = [
      ["Role Succession:"],
      ["Role", "Current", "Backup", "Successor", "Readiness", "Contract Expiry"],
      ...roles.map(r => [r.role, r.current, r.backup, r.successor, r.readiness, r.expiry]),
      [],
      ["Contracts:"],
      ["Name", "Role", "Expiry", "Status"],
      ...contracts.map(c => [c.name, c.role, c.expiry, c.status]),
      [],
      ["Staff CPD:"],
      ["Name", "Role", "CPD Hours", "Up to Date"],
      ...staff.map(s => [s.name, s.role, s.cpdHours, s.upToDate ? "Yes" : "No"])
    ];
    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_SuccessionMatrix_${new Date().toISOString().slice(0,10)}.csv`);
  }

  // --- Render
  return (
    <div className="max-w-7xl mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #222a2e 60%, #283E51 100%)",
        borderRadius: "26px", boxShadow: "0 8px 32px #2229",
        minHeight: 840
      }}>
      {/* Header */}
      <div className="flex items-center gap-7 mb-9">
        <div className="bg-[#181e23ee] rounded-2xl p-4 shadow-2xl flex items-center border-2 border-[#FFD70033]">
          <FaClipboardList size={54} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700", textShadow: "0 2px 10px #0009" }}>
            Succession Planner <span className="text-[#1de682]">/ Contracts / CPD</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-2 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
        <div className="ml-auto">
          <button
            className="px-5 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
            onClick={exportCSV}
          ><FaCheckCircle className="mr-2 inline" />Export CSV</button>
        </div>
      </div>

      {/* Status Row */}
      <div className="mb-7 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#181e23ee] rounded-xl flex items-center gap-4 py-5 px-7 shadow">
          <FaCrown size={30} color={fullReady ? "#1de682" : "#FFD700"} />
          <div>
            <div className="font-bold text-xl" style={{ color: fullReady ? "#1de682" : "#FFD700" }}>{fullReady ? "All Key Roles Covered" : "Succession Risk"}</div>
            <div className="text-[#fff]">Succession readiness: {roles.filter(r => r.readiness >= 7 && r.successor).length} / {roles.length}</div>
          </div>
        </div>
        <div className="bg-[#181e23ee] rounded-xl flex items-center gap-4 py-5 px-7 shadow">
          <FaUserClock size={30} color={urgentContracts.length ? "#e24242" : "#1de682"} />
          <div>
            <div className="font-bold text-xl" style={{ color: urgentContracts.length ? "#e24242" : "#1de682" }}>
              {urgentContracts.length ? "Contract Urgency" : "Contracts Secure"}
            </div>
            <div className="text-[#fff]">
              {urgentContracts.length
                ? urgentContracts.length + " expiring soon"
                : "No urgent renewals"}
            </div>
          </div>
        </div>
        <div className="bg-[#181e23ee] rounded-xl flex items-center gap-4 py-5 px-7 shadow">
          <FaCheckCircle size={30} color={cpd100 ? "#1de682" : "#FFA500"} />
          <div>
            <div className="font-bold text-xl" style={{ color: cpd100 ? "#1de682" : "#FFA500" }}>{cpd100 ? "All CPD Up-to-Date" : "CPD Gaps"}</div>
            <div className="text-[#fff]">{staff.filter(s => s.upToDate).length} / {staff.length} up-to-date</div>
          </div>
        </div>
      </div>

      {/* Succession Table */}
      <div className="mb-7 bg-[#181e23] rounded-xl p-5 shadow-lg border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-xl" style={{ color: "#FFD700" }}>Succession Table</div>
          <button onClick={() => setRoles([...roles, { role: "", current: "", backup: "", successor: "", readiness: 5, expiry: "" }])}
            className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Role</button>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 260 }}>
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Role</th>
                <th>Current</th>
                <th>Backup</th>
                <th>Successor</th>
                <th>Readiness (1-10)</th>
                <th>Expiry</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, idx) => {
                const mths = monthsLeft(r.expiry);
                const risk = !r.successor || r.readiness < 6 || mths < 8;
                return (
                  <tr key={idx} className={risk ? "bg-[#e2424233]" : "bg-[#1de68222]"}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-28" value={r.role}
                        onChange={e => { const arr = [...roles]; arr[idx].role = e.target.value; setRoles(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24" value={r.current}
                        onChange={e => { const arr = [...roles]; arr[idx].current = e.target.value; setRoles(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24" value={r.backup}
                        onChange={e => { const arr = [...roles]; arr[idx].backup = e.target.value; setRoles(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24" value={r.successor}
                        onChange={e => { const arr = [...roles]; arr[idx].successor = e.target.value; setRoles(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={1} max={10}
                        className="w-14 text-center bg-[#23292f] rounded"
                        value={r.readiness}
                        onChange={e => { const arr = [...roles]; arr[idx].readiness = Number(e.target.value); setRoles(arr); }}
                      />
                    </td>
                    <td>
                      <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-36"
                        value={r.expiry}
                        onChange={e => { const arr = [...roles]; arr[idx].expiry = e.target.value; setRoles(arr); }} />
                      <div className="text-xs text-[#FFD700] mt-1">
                        {r.expiry && mths + " mo. left"}
                      </div>
                    </td>
                    <td className="text-center">
                      {risk ? <FaExclamationTriangle color="#e24242" /> : <FaCheckCircle color="#1de682" />}
                    </td>
                    <td>
                      <button onClick={() => setRoles(roles.filter((_, i) => i !== idx))}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="mb-7 bg-[#181e23] rounded-xl p-5 shadow-lg border-l-8 border-[#1de68299]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-xl" style={{ color: "#1de682" }}>Contract Pipeline</div>
          <button onClick={() => setContracts([...contracts, { name: "", role: "", expiry: "", status: "Open" }])}
            className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Contract</button>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 220 }}>
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Months Left</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, idx) => {
                const mths = monthsLeft(c.expiry);
                const risk = mths < 4;
                return (
                  <tr key={idx} className={risk ? "bg-[#e2424233]" : ""}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-28" value={c.name}
                        onChange={e => { const arr = [...contracts]; arr[idx].name = e.target.value; setContracts(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24" value={c.role}
                        onChange={e => { const arr = [...contracts]; arr[idx].role = e.target.value; setContracts(arr); }} />
                    </td>
                    <td>
                      <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                        value={c.expiry}
                        onChange={e => { const arr = [...contracts]; arr[idx].expiry = e.target.value; setContracts(arr); }} />
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
                    <td className="text-center">
                      {c.expiry ? mths : "-"}
                    </td>
                    <td className="text-center">
                      {risk ? <FaExclamationTriangle color="#e24242" /> : <FaCheckCircle color="#1de682" />}
                    </td>
                    <td>
                      <button onClick={() => setContracts(contracts.filter((_, i) => i !== idx))}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff CPD Table + Chart */}
      <div className="mb-10 bg-[#181e23] rounded-xl p-5 shadow-lg border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-xl" style={{ color: "#FFD700" }}>Staff CPD Analyzer</div>
          <button onClick={() => setStaff([...staff, { name: "", role: "", cpdHours: 5, upToDate: false }])}
            className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Staff</button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="overflow-auto" style={{ maxHeight: 220, flex: 2 }}>
            <table className="min-w-full text-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>CPD Hours</th>
                  <th>Up-to-date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, idx) => (
                  <tr key={idx} className={s.upToDate ? "bg-[#1de68222]" : "bg-[#e2424233]"}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-28" value={s.name}
                        onChange={e => { const arr = [...staff]; arr[idx].name = e.target.value; setStaff(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-24" value={s.role}
                        onChange={e => { const arr = [...staff]; arr[idx].role = e.target.value; setStaff(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={0} max={40}
                        className="w-14 text-center bg-[#23292f] rounded"
                        value={s.cpdHours}
                        onChange={e => { const arr = [...staff]; arr[idx].cpdHours = Number(e.target.value); setStaff(arr); }}
                      />
                    </td>
                    <td className="text-center">
                      <input type="checkbox" checked={s.upToDate}
                        onChange={e => { const arr = [...staff]; arr[idx].upToDate = e.target.checked; setStaff(arr); }} />
                    </td>
                    <td>
                      <button onClick={() => setStaff(staff.filter((_, i) => i !== idx))}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* CPD Bar Chart */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="font-bold text-[#FFD700] mb-2">CPD Hours by Staff</div>
            <div className="bg-[#22272d] rounded-xl p-2">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={cpdData}>
                  <XAxis dataKey="name" tick={{ fill: "#FFD700" }} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="CPD">
                    {cpdData.map((entry, i) => (
                      <Cell key={i} fill={staff[i].upToDate ? "#1de682" : "#e24242"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-12 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaUsersCog size={34} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
