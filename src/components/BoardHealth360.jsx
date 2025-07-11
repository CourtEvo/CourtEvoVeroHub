import React, { useState } from "react";
import { saveAs } from "file-saver";
import { PieChart, Pie, Cell, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { FaUsersCog, FaMedal, FaTrophy, FaUserTie, FaChartPie, FaStar, FaShieldAlt, FaCheck, FaHourglassEnd, FaCalendarCheck, FaExclamationTriangle, FaChartBar, FaGraduationCap, FaCrown } from "react-icons/fa";

// Skills for radar
const SKILLS = ["Legal", "Finance", "Sport", "Marketing", "PR", "Tech", "Audit", "Education", "HR"];

// Initial demo board data (all male)
const initialMembers = [
  { name: "J. Novak", role: "President", tenure: 4, skills: ["Finance", "Sport"], attendance: 10, totalMeetings: 12, independent: true, cpd: 2, conflict: false },
  { name: "M. Ivanovic", role: "Audit Chair", tenure: 2, skills: ["Audit", "Legal"], attendance: 12, totalMeetings: 12, independent: true, cpd: 2, conflict: false },
  { name: "P. Smith", role: "Member", tenure: 7, skills: ["Marketing"], attendance: 9, totalMeetings: 12, independent: false, cpd: 0, conflict: true }
];

// Board practices state
const initialPractices = {
  meetingsPerYear: 12,
  lastAuditDate: "2023-08-15",
  riskPolicy: true,
  successionPlan: false,
  successionPlannedDate: "",
  transparency: true
};

function monthsSince(dateStr) {
  if (!dateStr) return 99;
  const then = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

// Board health score
function getHealthScore(members, practices) {
  if (!members.length) return 0;
  let score = 0;
  score += (members.reduce((a, m) => a + (m.attendance / (m.totalMeetings || 1)), 0) / members.length) * 20;
  score += (members.filter(m => m.independent).length / members.length) * 15;
  score += (members.filter(m => m.cpd >= 1).length / members.length) * 10;
  score += (SKILLS.filter(s => members.some(m => m.skills.includes(s))).length / SKILLS.length) * 15;
  score += (practices.lastAuditDate && monthsSince(practices.lastAuditDate) <= 12) ? 15 : 0;
  score += practices.riskPolicy ? 10 : 0;
  score += practices.successionPlan ? 10 : 0;
  score += practices.transparency ? 10 : 0;
  return Math.round(score);
}
function healthBadge(score) {
  if (score >= 90) return { label: "ELITE GOVERNANCE", color: "#1de682", icon: <FaCrown /> };
  if (score >= 75) return { label: "Audit Ready", color: "#FFD700", icon: <FaMedal /> };
  if (score >= 55) return { label: "At Risk", color: "#FFA500", icon: <FaTrophy /> };
  return { label: "Red Flag", color: "#e24242", icon: <FaUserTie /> };
}

export default function BoardHealth360() {
  const [members, setMembers] = useState(initialMembers);
  const [practices, setPractices] = useState(initialPractices);

  // Board Health Score
  const health = getHealthScore(members, practices);
  const badge = healthBadge(health);

  // Attendance
  const avgAttendance = members.length
    ? Math.round(members.reduce((a, m) => a + (m.attendance / (m.totalMeetings || 1)), 0) / members.length * 100)
    : 0;

  // Independence %
  const indPct = members.length
    ? Math.round(100 * members.filter(m => m.independent).length / members.length)
    : 0;

  // Tenure analytics
  const avgTenure = members.length
    ? (members.reduce((a, m) => a + m.tenure, 0) / members.length).toFixed(1)
    : 0;

  // CPD completion %
  const cpdPct = members.length
    ? Math.round(100 * members.filter(m => m.cpd >= 1).length / members.length)
    : 0;

  // Audit timeline
  const auditMonths = monthsSince(practices.lastAuditDate);
  const auditStatus = auditMonths <= 12
    ? { label: "Audit up to date", color: "#1de682", icon: <FaCalendarCheck /> }
    : { label: "Audit overdue", color: "#e24242", icon: <FaHourglassEnd /> };

  // Succession visuals
  const successionStatus = practices.successionPlan
    ? { label: "Succession Plan In Place", color: "#1de682", icon: <FaCheck /> }
    : { label: "No Succession Plan", color: "#FFA500", icon: <FaExclamationTriangle /> };

  // Skills radar
  const skillRadarData = SKILLS.map(skill => ({
    skill,
    value: members.some(m => m.skills.includes(skill)) ? 5 : 1
  }));

  // Risks and improvement tips
  const risks = [];
  if (members.some(m => (m.attendance / (m.totalMeetings || 1)) < 0.7)) risks.push("Attendance below 70% for one or more members.");
  if (indPct < 50) risks.push("Less than 50% independent directors.");
  if (cpdPct < 70) risks.push("CPD/training completion below 70%.");
  if (SKILLS.filter(s => members.some(m => m.skills.includes(s))).length < 6) risks.push("Key skills missing on the board.");
  if (auditMonths > 12) risks.push("Audit overdue.");
  if (!practices.successionPlan) risks.push("No succession plan.");
  if (!practices.riskPolicy) risks.push("No formal risk policy.");
  if (!practices.transparency) risks.push("Transparency/reporting is lacking.");
  if (members.some(m => m.conflict)) risks.push("Conflict of interest reported.");

  // Export
  function exportCSV() {
    let rows = [
      ["Name", "Role", "Tenure", "Skills", "Attendance", "Independence", "CPD", "Conflict"]
    ];
    members.forEach(m =>
      rows.push([m.name, m.role, m.tenure, m.skills.join("|"), m.attendance + "/" + m.totalMeetings, m.independent ? "Yes" : "No", m.cpd, m.conflict ? "Yes" : "No"])
    );
    rows.push([]);
    rows.push(["Meetings/Yr", "Last Audit Date", "Risk Policy", "Succession", "Transparency"]);
    rows.push([practices.meetingsPerYear, practices.lastAuditDate, practices.riskPolicy ? "Yes" : "No", practices.successionPlan ? "Yes" : "No", practices.transparency ? "Yes" : "No"]);
    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_BoardHealth_${new Date().toISOString().slice(0,10)}.csv`);
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
          <FaUsersCog size={60} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-4xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700", textShadow: "0 3px 16px #0009" }}>
            Board Health<br /><span className="text-[#1de682]">360 Analyzer</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-2 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="mb-8 flex flex-col md:flex-row gap-10 items-center bg-[#181e23bb] rounded-2xl shadow-lg px-8 py-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-extrabold text-3xl" style={{ color: badge.color, textShadow: "0 1px 8px #0009" }}>{badge.icon}</span>
            <span className="font-black text-xl" style={{ color: badge.color }}>{badge.label}</span>
            <span className="ml-3 text-lg text-[#FFD700]">Health: <span className="font-black">{health}/100</span></span>
          </div>
          <div className="w-full bg-[#22272d] h-7 rounded-full mt-4 shadow-inner relative overflow-hidden">
            <div className="transition-all duration-500" style={{
              width: `${health}%`,
              background: `linear-gradient(90deg,#e24242 0%,#FFD700 60%,#1de682 100%)`,
              height: "100%",
              borderRadius: "inherit",
              boxShadow: "0 1px 8px 0 #0005"
            }} />
            <span
              className="absolute right-6 text-lg font-bold"
              style={{ color: badge.color, textShadow: "0 1px 8px #000" }}
            >{badge.label}</span>
          </div>
        </div>
        <div>
          <button
            className="px-6 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
            onClick={exportCSV}
          ><FaShieldAlt className="mr-2 inline" />Export CSV</button>
        </div>
      </div>

      {/* Succession & Audit */}
      <div className="mb-10 grid md:grid-cols-2 gap-8">
        <div className="bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#1de68299] flex flex-col">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{successionStatus.icon}</span>
            <span className="font-bold text-lg" style={{ color: successionStatus.color }}>{successionStatus.label}</span>
          </div>
          <div className="text-[#fff] mb-2">Succession {practices.successionPlan ? "last planned for" : "planned for"}: {practices.successionPlannedDate || "N/A"}</div>
          <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-52 border border-[#FFD70033] mb-1"
            value={practices.successionPlannedDate}
            onChange={e => setPractices(p => ({ ...p, successionPlannedDate: e.target.value }))}
            disabled={!practices.successionPlan}
          />
          <div className="flex items-center mt-2">
            <input type="checkbox" checked={practices.successionPlan}
              onChange={e => setPractices(p => ({ ...p, successionPlan: e.target.checked }))}
            />
            <span className="ml-2 text-[#1de682] font-bold">Succession plan exists</span>
          </div>
        </div>
        <div className="bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099] flex flex-col">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{auditStatus.icon}</span>
            <span className="font-bold text-lg" style={{ color: auditStatus.color }}>{auditStatus.label}</span>
          </div>
          <div className="text-[#fff] mb-2">Last audit: {practices.lastAuditDate || "N/A"}</div>
          <input type="date" className="bg-[#23292f] text-white rounded px-2 py-1 w-52 border border-[#FFD70033] mb-2"
            value={practices.lastAuditDate}
            onChange={e => setPractices(p => ({ ...p, lastAuditDate: e.target.value }))}
          />
          <div className="flex items-center">
            <FaHourglassEnd className="mr-2" color={auditMonths > 12 ? "#e24242" : "#1de682"} />
            <span className={auditMonths > 12 ? "text-[#e24242]" : "text-[#1de682]"}>{auditMonths > 12 ? "Overdue" : "Up to date"}</span>
            <span className="ml-2 text-[#fff]">({auditMonths} months since last audit)</span>
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="mb-12 bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-2xl" style={{ color: "#1de682" }}>Board Members</div>
          <button onClick={() => setMembers([...members, { name: "", role: "", tenure: 1, skills: [], attendance: 0, totalMeetings: 12, independent: false, cpd: 0, conflict: false }])}
            className="bg-[#FFD700] text-black rounded-lg px-4 py-1.5 font-bold hover:scale-105 shadow">+ Add Member</button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Tenure</th>
                <th>Skills</th>
                <th>Attendance</th>
                <th>Indep.</th>
                <th>CPD</th>
                <th>Conflict?</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <tr key={idx} className={m.conflict ? "bg-[#e2424233]" : ""}>
                  <td><input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-20" value={m.name}
                    onChange={e => { const arr = [...members]; arr[idx].name = e.target.value; setMembers(arr); }} /></td>
                  <td><input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-16" value={m.role}
                    onChange={e => { const arr = [...members]; arr[idx].role = e.target.value; setMembers(arr); }} /></td>
                  <td><input type="number" min={1} max={30} className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                    value={m.tenure}
                    onChange={e => { const arr = [...members]; arr[idx].tenure = Number(e.target.value); setMembers(arr); }} /></td>
                  <td>
                    <select multiple className="bg-[#23292f] text-white rounded px-1 py-1 border border-[#FFD70033] w-32"
                      value={m.skills}
                      onChange={e => {
                        const arr = [...members];
                        arr[idx].skills = Array.from(e.target.selectedOptions, o => o.value);
                        setMembers(arr);
                      }}>
                      {SKILLS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" min={0} max={m.totalMeetings}
                      className="w-10 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                      value={m.attendance}
                      onChange={e => { const arr = [...members]; arr[idx].attendance = Number(e.target.value); setMembers(arr); }} />
                    /
                    <input type="number" min={1} max={30}
                      className="w-10 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                      value={m.totalMeetings}
                      onChange={e => { const arr = [...members]; arr[idx].totalMeetings = Number(e.target.value); setMembers(arr); }} />
                  </td>
                  <td>
                    <input type="checkbox" checked={m.independent}
                      onChange={e => { const arr = [...members]; arr[idx].independent = e.target.checked; setMembers(arr); }} />
                  </td>
                  <td>
                    <input type="number" min={0} max={12} className="w-10 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                      value={m.cpd}
                      onChange={e => { const arr = [...members]; arr[idx].cpd = Number(e.target.value); setMembers(arr); }} />
                  </td>
                  <td>
                    <input type="checkbox" checked={m.conflict}
                      onChange={e => { const arr = [...members]; arr[idx].conflict = e.target.checked; setMembers(arr); }} />
                  </td>
                  <td>
                    <button onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                      className="text-[#e24242] font-black px-2">×</button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={9} className="text-center py-4 text-gray-500">
                  Add board members for analytics and governance benchmarking.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-10 grid md:grid-cols-4 gap-8">
        <div className="bg-[#181e23] rounded-2xl p-6 shadow flex flex-col items-center text-center border-l-4 border-[#FFD70099]">
          <FaChartBar size={32} className="mb-2" color="#FFD700" />
          <div className="text-3xl font-black mb-1" style={{ color: "#FFD700" }}>{avgAttendance}%</div>
          <div className="font-bold text-[#1de682]">Attendance Rate</div>
        </div>
        <div className="bg-[#181e23] rounded-2xl p-6 shadow flex flex-col items-center text-center border-l-4 border-[#FFD70099]">
          <FaGraduationCap size={32} className="mb-2" color="#1de682" />
          <div className="text-3xl font-black mb-1" style={{ color: "#FFD700" }}>{cpdPct}%</div>
          <div className="font-bold text-[#1de682]">CPD Completion</div>
        </div>
        <div className="bg-[#181e23] rounded-2xl p-6 shadow flex flex-col items-center text-center border-l-4 border-[#FFD70099]">
          <FaUserTie size={32} className="mb-2" color="#FFD700" />
          <div className="text-3xl font-black mb-1" style={{ color: "#FFD700" }}>{indPct}%</div>
          <div className="font-bold text-[#1de682]">Independent Board</div>
        </div>
        <div className="bg-[#181e23] rounded-2xl p-6 shadow flex flex-col items-center text-center border-l-4 border-[#FFD70099]">
          <FaStar size={32} className="mb-2" color="#FFD700" />
          <div className="text-3xl font-black mb-1" style={{ color: "#FFD700" }}>{avgTenure}</div>
          <div className="font-bold text-[#1de682]">Avg Tenure (yrs)</div>
        </div>
      </div>

      {/* Skills Radar */}
      <div className="my-10">
        <div className="font-black text-lg mb-3" style={{ color: "#FFD700" }}>Skill Coverage Radar</div>
        <div className="bg-[#181e23] p-4 rounded-xl shadow">
          <RadarChart outerRadius={90} width={330} height={240} data={skillRadarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#FFD700", fontSize: 13 }} />
            <PolarRadiusAxis angle={30} domain={[1, 5]} />
            <Radar name="Skill Coverage" dataKey="value" stroke="#FFD700" fill="#1de682" fillOpacity={0.5} />
            <Tooltip />
          </RadarChart>
        </div>
      </div>

      {/* Risks/Improvements */}
      <div className="mb-10">
        <div className="font-black text-xl mb-2" style={{ color: "#FFD700" }}>Risks & Improvement Tips</div>
        <div className="bg-[#181e23] rounded-xl p-5 shadow">
          <ul className="list-disc ml-5">
            {risks.length ? risks.map((r, i) =>
              <li key={i} className="mb-1 text-[#FFD700]">{r}</li>
            ) : (
              <li className="text-[#1de682] font-bold"><FaCheck className="inline-block mb-1 mr-1" />Board meets all CourtEvo Vero best practices. Keep leading.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-16 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaUsersCog size={38} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
