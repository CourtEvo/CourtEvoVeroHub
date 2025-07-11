import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  FaUserTie, FaHeartbeat, FaCogs, FaChartLine, FaUsers, FaClipboardList, FaBolt, FaFilePdf,
  FaCheckCircle, FaExclamationTriangle, FaFlag, FaUserClock, FaSyncAlt, FaRegCalendar, FaTrash, FaPlus, FaEdit, FaSave
} from "react-icons/fa";
import { Radar, Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

// --- INITIAL DATA ---
const initialKpis = [
  { label: "Athlete Retention", value: 93, max: 100, status: "ok" },
  { label: "Cost Per Win", value: 3400, max: 4000, status: "warn" },
  { label: "Skill Progression", value: 8.8, max: 10, status: "ok" },
  { label: "NPS (Parents)", value: 54, max: 100, status: "ok" },
  { label: "Revenue YTD (€k)", value: 781, max: 900, status: "ok" },
  { label: "Cashflow Risk (score)", value: 2, max: 10, status: "ok" },
  { label: "Staffing Gaps", value: 2, max: 8, status: "risk" }
];

const initialCompliance = [
  { label: "Safeguarding", status: "ok" },
  { label: "Financial Audit", status: "warn" },
  { label: "Board Succession Plan", status: "ok" },
  { label: "Governance Self-Audit", status: "risk" },
  { label: "Coach Licensing", status: "ok" },
  { label: "Board Training", status: "warn" }
];

const initialRiskRegister = [
  { risk: "Sponsor loss risk", level: "warn", trend: [2, 3, 4, 4, 5, 4, 3], action: "Meet sponsor, review renewal" },
  { risk: "Staff turnover", level: "risk", trend: [1, 1, 2, 2, 3, 3, 4], action: "New contracts, staff survey" },
  { risk: "Compliance delay", level: "warn", trend: [1, 2, 2, 3, 2, 3, 2], action: "Board review, legal consult" },
];

const initialMeetingLog = [
  { date: "2025-06-13", action: "Quarterly board review, finance + youth KPIs" },
  { date: "2025-05-20", action: "Annual safeguarding audit, passed" },
  { date: "2025-04-10", action: "Sponsor dinner, new pipeline opened" },
];

const initialSuccession = [
  { role: "President", next: "M. Proleta", eta: "2025-10", ready: true },
  { role: "CEO", next: "J. Ivanovic", eta: "2026-06", ready: false },
  { role: "Head Coach", next: "A. Dalić", eta: "2025-08", ready: true },
  { role: "Finance Dir.", next: "L. Horvat", eta: "2026-01", ready: false }
];

const initialAiScenarios = [
  { scenario: "Cut travel by 10%", effect: "+€29k cashflow, minor impact on games" },
  { scenario: "Raise membership 8%", effect: "+€45k revenue, 2% risk of dropouts" },
  { scenario: "Switch kit provider", effect: "+€11k, no service impact" },
];

function statusBadge(status) {
  if (status === "ok")
    return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold text-xs"><FaCheckCircle className="mr-1" />OK</span>;
  if (status === "warn")
    return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold text-xs"><FaExclamationTriangle className="mr-1" />Check</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold text-xs"><FaBolt className="mr-1" />Risk</span>;
}

const complianceStatusColor = (status) => {
  if (status === "ok") return "#1de682";
  if (status === "warn") return "#FFD700";
  return "#e24242";
};

export default function ExecutiveBoardCockpit() {
  const [tab, setTab] = useState("cockpit");
  const [kpis, setKpis] = useState(initialKpis);
  const [compliance, setCompliance] = useState(initialCompliance);
  const [riskRegister, setRiskRegister] = useState(initialRiskRegister);
  const [meetingLog, setMeetingLog] = useState(initialMeetingLog);
  const [succession, setSuccession] = useState(initialSuccession);
  const [aiScenarios, setAiScenarios] = useState(initialAiScenarios);

  // Editing states
  const [editKpi, setEditKpi] = useState(null);
  const [newKpi, setNewKpi] = useState({ label: "", value: 0, max: 100, status: "ok" });

  const [editRisk, setEditRisk] = useState(null);
  const [newRisk, setNewRisk] = useState({ risk: "", level: "warn", trend: [1,2,2,3,2,3,2], action: "" });

  const [editSuccession, setEditSuccession] = useState(null);
  const [newSuccession, setNewSuccession] = useState({ role: "", next: "", eta: "", ready: false });

  const [editScenario, setEditScenario] = useState(null);
  const [newScenario, setNewScenario] = useState({ scenario: "", effect: "" });

  const reportRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `CourtEvoVero_BoardCockpit_${new Date().toISOString().slice(0,10)}`
  });

  // --- Chart Data ---
  const radarLabels = kpis.map(k => k.label);
  const radarValues = kpis.map(k => (k.value / (k.max || 1)) * 100);
  const complianceCounts = {
    ok: compliance.filter(c => c.status === "ok").length,
    warn: compliance.filter(c => c.status === "warn").length,
    risk: compliance.filter(c => c.status === "risk").length
  };
  const riskTrends = {
    labels: riskRegister.map(r => r.risk),
    datasets: [{
      label: "Trend (last 6mo)",
      backgroundColor: ["#FFD700", "#e24242", "#FFD700"],
      data: riskRegister.map(r => r.trend[r.trend.length - 1])
    }]
  };
  const successionData = {
    labels: succession.map(s => s.role),
    datasets: [{
      label: "Ready",
      data: succession.map(s => s.ready ? 1 : 0),
      backgroundColor: succession.map(s => s.ready ? "#1de682" : "#FFD700")
    }]
  };

  // --- Editing Logic ---
  // KPI
  const handleKpiEdit = (i, field, val) => {
    const k = [...kpis];
    if (field === "value" || field === "max") k[i][field] = Number(val);
    else k[i][field] = val;
    setKpis(k);
  };
  const saveNewKpi = () => {
    setKpis([...kpis, newKpi]);
    setNewKpi({ label: "", value: 0, max: 100, status: "ok" });
  };
  const removeKpi = (idx) => setKpis(kpis.filter((_, i) => i !== idx));

  // Compliance
  const handleComplianceEdit = (i, fieldOrValue, valueMaybe) => {
    const c = [...compliance];
    if (valueMaybe === undefined) {
      // called as handleComplianceEdit(i, "ok"/"warn"/"risk")
      c[i].status = fieldOrValue;
    } else {
      // called as handleComplianceEdit(i, field, value)
      c[i][fieldOrValue] = valueMaybe;
    }
    setCompliance(c);
  };

  // Risk
  const handleRiskEdit = (i, field, val) => {
    const r = [...riskRegister];
    if (field === "trend") r[i][field][r[i][field].length - 1] = Number(val);
    else r[i][field] = val;
    setRiskRegister(r);
  };
  const saveNewRisk = () => {
    setRiskRegister([...riskRegister, newRisk]);
    setNewRisk({ risk: "", level: "warn", trend: [1,2,2,3,2,3,2], action: "" });
  };
  const removeRisk = (idx) => setRiskRegister(riskRegister.filter((_, i) => i !== idx));

  // Succession
  const handleSuccessionEdit = (i, field, val) => {
    const s = [...succession];
    if (field === "ready") s[i][field] = !s[i][field];
    else s[i][field] = val;
    setSuccession(s);
  };
  const saveNewSuccession = () => {
    setSuccession([...succession, newSuccession]);
    setNewSuccession({ role: "", next: "", eta: "", ready: false });
  };
  const removeSuccession = (idx) => setSuccession(succession.filter((_, i) => i !== idx));

  // Scenario
  const handleScenarioEdit = (i, field, val) => {
    const sc = [...aiScenarios];
    sc[i][field] = val;
    setAiScenarios(sc);
  };
  const saveNewScenario = () => {
    setAiScenarios([...aiScenarios, newScenario]);
    setNewScenario({ scenario: "", effect: "" });
  };
  const removeScenario = (idx) => setAiScenarios(aiScenarios.filter((_, i) => i !== idx));

  // --- Render ---
  return (
    <div className="max-w-[1440px] mx-auto py-10 px-2"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #232a2e 85%, #283E51 100%)",
        borderRadius: "38px",
        boxShadow: "0 8px 40px #222a",
        minHeight: 1040
      }}>
      <div className="flex flex-wrap justify-between items-end mb-9 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaUserTie size={44} color="#FFD700" />
            <h1 className="font-extrabold text-4xl" style={{ color: "#FFD700", letterSpacing: 1 }}>
              EXECUTIVE BOARD COCKPIT
            </h1>
          </div>
          <div className="text-[#FFD700] italic text-lg">
            360° dashboard — health, compliance, risk, pipeline & scenario. CourtEvo Vero standards.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={handlePrint}>
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button className={`px-7 py-2 rounded-t-2xl font-bold transition-colors ${tab === "cockpit" ? "bg-[#FFD700] text-[#23292f]" : "bg-[#23292f] text-[#FFD700]"}`} onClick={() => setTab("cockpit")}>Cockpit</button>
        <button className={`px-7 py-2 rounded-t-2xl font-bold transition-colors ${tab === "reports" ? "bg-[#FFD700] text-[#23292f]" : "bg-[#23292f] text-[#FFD700]"}`} onClick={() => setTab("reports")}>Reports</button>
        <button className={`px-7 py-2 rounded-t-2xl font-bold transition-colors ${tab === "scenario" ? "bg-[#FFD700] text-[#23292f]" : "bg-[#23292f] text-[#FFD700]"}`} onClick={() => setTab("scenario")}>Scenarios</button>
      </div>
      <div ref={reportRef} className="transition-all">
        {/* Cockpit View */}
        {tab === "cockpit" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Board Snapshot */}
            <div className="col-span-1 bg-[#23292f] rounded-3xl p-8 shadow-2xl flex flex-col justify-between border-t-8 border-[#FFD700]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]">
                <FaFlag /> Snapshot
              </div>
              <Radar
                data={{
                  labels: radarLabels,
                  datasets: [{
                    label: "KPI Health (%)",
                    backgroundColor: "rgba(255,215,0,0.30)",
                    borderColor: "#FFD700",
                    pointBackgroundColor: "#FFD700",
                    data: radarValues
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    r: {
                      angleLines: { color: "#FFD70055" },
                      grid: { color: "#FFD70022" },
                      pointLabels: { color: "#FFD700", font: { size: 13 } },
                      min: 0, max: 100, ticks: { stepSize: 20, color: "#fff" }
                    }
                  }
                }}
                style={{ maxWidth: 320, margin: "0 auto" }}
              />
              {/* KPI List */}
              <div className="mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-[#FFD700]">KPI</th>
                      <th className="text-[#FFD700]">Value</th>
                      <th className="text-[#FFD700]">Max</th>
                      <th className="text-[#FFD700]">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((k, i) => (
                      <tr key={i}>
                        <td>
                          {editKpi === i ? (
                            <input value={k.label} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                              onChange={e => handleKpiEdit(i, "label", e.target.value)} />
                          ) : k.label}
                        </td>
                        <td>
                          {editKpi === i ? (
                            <input type="number" value={k.value} className="w-14 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                              onChange={e => handleKpiEdit(i, "value", e.target.value)} />
                          ) : k.value}
                        </td>
                        <td>
                          {editKpi === i ? (
                            <input type="number" value={k.max} className="w-14 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                              onChange={e => handleKpiEdit(i, "max", e.target.value)} />
                          ) : k.max}
                        </td>
                        <td>
                          {editKpi === i ? (
                            <select value={k.status} className="bg-[#FFD700] text-black px-2 rounded"
                              onChange={e => handleKpiEdit(i, "status", e.target.value)}>
                              <option value="ok">OK</option>
                              <option value="warn">Check</option>
                              <option value="risk">Risk</option>
                            </select>
                          ) : statusBadge(k.status)}
                        </td>
                        <td>
                          {editKpi === i ? (
                            <button onClick={() => setEditKpi(null)} className="text-[#1de682] ml-1"><FaSave /></button>
                          ) : (
                            <>
                              <button onClick={() => setEditKpi(i)} className="text-[#FFD700] ml-1"><FaEdit /></button>
                              <button onClick={() => removeKpi(i)} className="text-[#e24242] ml-1"><FaTrash /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Add new */}
                    <tr>
                      <td>
                        <input value={newKpi.label} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          placeholder="Add KPI"
                          onChange={e => setNewKpi({ ...newKpi, label: e.target.value })} />
                      </td>
                      <td>
                        <input type="number" value={newKpi.value} className="w-14 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => setNewKpi({ ...newKpi, value: Number(e.target.value) })} />
                      </td>
                      <td>
                        <input type="number" value={newKpi.max} className="w-14 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => setNewKpi({ ...newKpi, max: Number(e.target.value) })} />
                      </td>
                      <td>
                        <select value={newKpi.status} className="bg-[#FFD700] text-black px-2 rounded"
                          onChange={e => setNewKpi({ ...newKpi, status: e.target.value })}>
                          <option value="ok">OK</option>
                          <option value="warn">Check</option>
                          <option value="risk">Risk</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={saveNewKpi} className="text-[#1de682]"><FaPlus /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Compliance */}
            <div className="col-span-1 bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#1de682]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaCogs /> Compliance Overview</div>
              <Bar
                data={{
                  labels: ["OK", "Check", "Risk"],
                  datasets: [{
                    label: "Compliance",
                    backgroundColor: ["#1de682", "#FFD700", "#e24242"],
                    data: [complianceCounts.ok, complianceCounts.warn, complianceCounts.risk]
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: "#FFD70022" }, ticks: { color: "#FFD700", font: { size: 13 } } },
                    y: { beginAtZero: true, grid: { color: "#FFD70022" }, ticks: { color: "#fff", stepSize: 1 } }
                  }
                }}
                style={{ maxWidth: 320, margin: "0 auto" }}
              />
              <ul className="mt-5 text-base">
                {compliance.map((c, i) => (
                  <li key={i} className="flex justify-between items-center py-1 gap-2">
                    <input value={c.label} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                      onChange={e => handleComplianceEdit(i, "label", e.target.value)} />
                    <select
                      style={{
                        background: complianceStatusColor(c.status),
                        color: c.status === "risk" ? "#fff" : "#222",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 700,
                        padding: "2px 14px",
                        fontSize: 15
                      }}
                      value={c.status}
                      onChange={e => handleComplianceEdit(i, e.target.value)}
                    >
                      <option value="ok">OK</option>
                      <option value="warn">Check</option>
                      <option value="risk">Risk</option>
                    </select>
                    <button onClick={() => setCompliance(compliance.filter((_, idx) => idx !== i))} className="text-[#e24242]"><FaTrash /></button>
                  </li>
                ))}
                {/* Add new */}
                <li className="flex justify-between items-center py-1 gap-2">
                  <input value={""} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                    placeholder="Add Compliance Area"
                    onChange={e => setCompliance([...compliance, { label: e.target.value, status: "ok" }])} />
                </li>
              </ul>
            </div>
            {/* Risk Register */}
            <div className="col-span-1 bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#e24242]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaBolt /> Risk Register</div>
              <Bar
                data={riskTrends}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: "#FFD70022" }, ticks: { color: "#FFD700", font: { size: 12 } } },
                    y: { beginAtZero: true, grid: { color: "#FFD70022" }, ticks: { color: "#fff" } }
                  }
                }}
                style={{ maxWidth: 320, margin: "0 auto" }}
              />
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr>
                    <th className="text-[#FFD700]">Risk</th>
                    <th className="text-[#FFD700]">Level</th>
                    <th className="text-[#FFD700]">Trend</th>
                    <th className="text-[#FFD700]">Action</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {riskRegister.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <input value={r.risk} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleRiskEdit(i, "risk", e.target.value)} />
                      </td>
                      <td>
                        <select value={r.level} className="bg-[#FFD700] text-black px-2 rounded"
                          onChange={e => handleRiskEdit(i, "level", e.target.value)}>
                          <option value="ok">OK</option>
                          <option value="warn">Check</option>
                          <option value="risk">Risk</option>
                        </select>
                      </td>
                      <td>
                        <input type="number" value={r.trend[r.trend.length - 1]} className="w-12 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleRiskEdit(i, "trend", e.target.value)} />
                      </td>
                      <td>
                        <input value={r.action} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleRiskEdit(i, "action", e.target.value)} />
                      </td>
                      <td>
                        <button onClick={() => removeRisk(i)} className="text-[#e24242]"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                  {/* Add new */}
                  <tr>
                    <td>
                      <input value={newRisk.risk} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="Add Risk"
                        onChange={e => setNewRisk({ ...newRisk, risk: e.target.value })} />
                    </td>
                    <td>
                      <select value={newRisk.level} className="bg-[#FFD700] text-black px-2 rounded"
                        onChange={e => setNewRisk({ ...newRisk, level: e.target.value })}>
                        <option value="ok">OK</option>
                        <option value="warn">Check</option>
                        <option value="risk">Risk</option>
                      </select>
                    </td>
                    <td>
                      <input type="number" value={newRisk.trend[newRisk.trend.length - 1]} className="w-12 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        onChange={e => setNewRisk({ ...newRisk, trend: [...newRisk.trend.slice(0, -1), Number(e.target.value)] })} />
                    </td>
                    <td>
                      <input value={newRisk.action} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="Action"
                        onChange={e => setNewRisk({ ...newRisk, action: e.target.value })} />
                    </td>
                    <td>
                      <button onClick={saveNewRisk} className="text-[#1de682]"><FaPlus /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Succession */}
            <div className="col-span-1 bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#FFD700]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaUserClock /> Succession</div>
              <Bar
                data={successionData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: "#FFD70022" }, ticks: { color: "#FFD700", font: { size: 12 } } },
                    y: { beginAtZero: true, max: 1, grid: { color: "#FFD70022" }, ticks: { color: "#fff", stepSize: 1, callback: v => v === 1 ? "Ready" : "" } }
                  }
                }}
                style={{ maxWidth: 320, margin: "0 auto" }}
              />
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr>
                    <th className="text-[#FFD700]">Role</th>
                    <th className="text-[#FFD700]">Next</th>
                    <th className="text-[#FFD700]">ETA</th>
                    <th className="text-[#FFD700]">Ready</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {succession.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <input value={s.role} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleSuccessionEdit(i, "role", e.target.value)} />
                      </td>
                      <td>
                        <input value={s.next} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleSuccessionEdit(i, "next", e.target.value)} />
                      </td>
                      <td>
                        <input value={s.eta} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleSuccessionEdit(i, "eta", e.target.value)} />
                      </td>
                      <td>
                        <input type="checkbox" checked={s.ready}
                          onChange={() => handleSuccessionEdit(i, "ready")} />
                      </td>
                      <td>
                        <button onClick={() => removeSuccession(i)} className="text-[#e24242]"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                  {/* Add new */}
                  <tr>
                    <td>
                      <input value={newSuccession.role} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="Role"
                        onChange={e => setNewSuccession({ ...newSuccession, role: e.target.value })} />
                    </td>
                    <td>
                      <input value={newSuccession.next} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="Next"
                        onChange={e => setNewSuccession({ ...newSuccession, next: e.target.value })} />
                    </td>
                    <td>
                      <input value={newSuccession.eta} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="ETA"
                        onChange={e => setNewSuccession({ ...newSuccession, eta: e.target.value })} />
                    </td>
                    <td>
                      <input type="checkbox" checked={newSuccession.ready}
                        onChange={() => setNewSuccession({ ...newSuccession, ready: !newSuccession.ready })} />
                    </td>
                    <td>
                      <button onClick={saveNewSuccession} className="text-[#1de682]"><FaPlus /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Meeting Log (read only, but can add next) */}
            <div className="col-span-1 bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#1de682]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaRegCalendar /> Board Log</div>
              <ul className="mt-2 text-base">
                {meetingLog.map((m, i) => (
                  <li key={i} className="mb-2">
                    <span className="font-bold text-[#FFD700]">{m.date}:</span>
                    <span className="ml-2 text-[#fff]">{m.action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* Reports and Scenario tabs remain same (auto-update from edits above) */}
        {tab === "reports" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compliance Table */}
            <div className="bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#FFD700]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaClipboardList /> Full Compliance</div>
              <table className="w-full text-left text-base">
                <thead>
                  <tr className="text-[#FFD700] font-bold">
                    <th>Area</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compliance.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <input value={c.label} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleComplianceEdit(i, "label", e.target.value)} />
                      </td>
                      <td>
                        <select
                          style={{
                            background: complianceStatusColor(c.status),
                            color: c.status === "risk" ? "#fff" : "#222",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 700,
                            padding: "2px 14px",
                            fontSize: 15
                          }}
                          value={c.status}
                          onChange={e => handleComplianceEdit(i, e.target.value)}
                        >
                          <option value="ok">OK</option>
                          <option value="warn">Check</option>
                          <option value="risk">Risk</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Board Attendance & Actions */}
            <div className="bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#1de682]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaUsers /> Meeting Actions</div>
              <ul className="mt-2 text-base">
                {meetingLog.map((m, i) => (
                  <li key={i} className="mb-2">
                    <span className="font-bold text-[#FFD700]">{m.date}:</span>
                    <span className="ml-2 text-[#fff]">{m.action}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-[#FFD700]">Total Board Meetings: <b>{meetingLog.length}</b></div>
            </div>
          </div>
        )}
        {tab === "scenario" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Scenario Actions */}
            <div className="bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#FFD700]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaSyncAlt /> Scenario Controls</div>
              <table className="w-full text-base">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Effect</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {aiScenarios.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <input value={s.scenario} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleScenarioEdit(i, "scenario", e.target.value)} />
                      </td>
                      <td>
                        <input value={s.effect} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                          onChange={e => handleScenarioEdit(i, "effect", e.target.value)} />
                      </td>
                      <td>
                        <button onClick={() => removeScenario(i)} className="text-[#e24242]"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                  {/* Add new */}
                  <tr>
                    <td>
                      <input value={newScenario.scenario} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="Add Scenario"
                        onChange={e => setNewScenario({ ...newScenario, scenario: e.target.value })} />
                    </td>
                    <td>
                      <input value={newScenario.effect} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        placeholder="Effect"
                        onChange={e => setNewScenario({ ...newScenario, effect: e.target.value })} />
                    </td>
                    <td>
                      <button onClick={saveNewScenario} className="text-[#1de682]"><FaPlus /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Live Risk/Finance Chart */}
            <div className="bg-[#23292f] rounded-3xl p-8 shadow-2xl border-t-8 border-[#e24242]">
              <div className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FFD700]"><FaChartLine /> Board Impact (Risk/Finance)</div>
              <Bar
                data={{
                  labels: kpis.map(k => k.label),
                  datasets: [{
                    label: "Current KPI %",
                    data: kpis.map(k => (k.value / (k.max || 1)) * 100),
                    backgroundColor: kpis.map(k => k.status === "ok" ? "#1de682" : k.status === "warn" ? "#FFD700" : "#e24242")
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: "#FFD70022" }, ticks: { color: "#FFD700", font: { size: 12 } } },
                    y: { beginAtZero: true, max: 110, grid: { color: "#FFD70022" }, ticks: { color: "#fff", stepSize: 20 } }
                  }
                }}
                style={{ maxWidth: 420, margin: "0 auto" }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-16 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
