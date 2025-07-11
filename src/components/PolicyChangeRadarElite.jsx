import React, { useState } from "react";
import {
  FaBalanceScale, FaCheckCircle, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaFileExport, FaLightbulb, FaArrowRight, FaChartLine, FaCalendarAlt, FaComments
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const AREAS = [
  "Roster", "Finance", "Transfer", "Facilities", "Contracts", "Tax", "Eligibility", "Youth", "NIL", "TV/Media"
];
const DEFAULT_POLICIES = [
  { area: "Roster", policy: "FIBA Import Quota", status: "Active", risk: "Medium", lastReview: "2024-03-14", expiry: "2025-06-01", owner: "GM", impact: "Limits 2 non-EU per team" },
  { area: "Finance", policy: "State Subsidy Cap", status: "Active", risk: "High", lastReview: "2024-02-11", expiry: "2024-12-31", owner: "CFO", impact: "Caps grant funding to €200k" },
  { area: "Contracts", policy: "Youth Transfer Rules", status: "Reform proposed", risk: "Critical", lastReview: "2024-04-20", expiry: "2024-09-01", owner: "Legal", impact: "Restricts junior pro contracts" },
  { area: "Eligibility", policy: "Academic Progress Rule", status: "Active", risk: "Low", lastReview: "2024-01-09", expiry: "2025-09-01", owner: "Youth Dir", impact: "Players must pass school for U18 games" }
];

const statusColors = {
  "Active": "#1de682",
  "Reform proposed": "#FFD700",
  "Expired": "#ff4848"
};
const riskColors = {
  "Critical": "#ff4848",
  "High": "#FFD700",
  "Medium": "#FFD700aa",
  "Low": "#1de682"
};

function daysTo(date) {
  if (!date) return 999;
  return Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const PolicyChangeRadarElite = () => {
  const [policies, setPolicies] = useState([...DEFAULT_POLICIES]);
  const [addMode, setAddMode] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ area: AREAS[0], policy: "", status: "Active", risk: "Low", lastReview: "", expiry: "", owner: "", impact: "" });
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const [scenarioIdx, setScenarioIdx] = useState(-1);
  const [scenarioStatus, setScenarioStatus] = useState("");
  const [log, setLog] = useState([{ by: "Board", txt: "Reviewed new FIBA import quota impact.", date: "2024-06-10" }]);
  const [logText, setLogText] = useState("");

  // CRUD
  const addPolicy = () => {
    setPolicies([...policies, { ...newPolicy }]);
    setAddMode(false);
    setNewPolicy({ area: AREAS[0], policy: "", status: "Active", risk: "Low", lastReview: "", expiry: "", owner: "", impact: "" });
  };
  const startEdit = idx => { setEditMode(idx); setEditData({ ...policies[idx] }); };
  const saveEdit = () => {
    setPolicies(policies.map((p, i) => i === editMode ? { ...editData } : p));
    setEditMode(null); setEditData({});
  };
  const removePolicy = idx => setPolicies(policies.filter((_, i) => i !== idx));

  // Scenario
  const runScenario = idx => {
    setScenarioIdx(idx);
    let p = policies[idx];
    let msg =
      p.risk === "Critical"
        ? `If this policy changes, immediate impact on operations. Owners: ${p.owner}.`
        : p.risk === "High"
        ? `Significant board attention needed. Monitor for updates.`
        : `Monitor but risk is currently low.`;
    setScenarioStatus(
      <>{p.policy}<br />
        <b>IMPACT:</b> {p.impact}<br />
        <b>STATUS:</b> {p.status}, <b>RISK:</b> {p.risk}<br />{msg}
      </>
    );
  };

  // Export CSV
  function exportCSV() {
    let csv = ["Area,Policy,Status,Risk,LastReview,Expiry,Owner,Impact"];
    policies.forEach(p =>
      csv.push([p.area, p.policy, p.status, p.risk, p.lastReview, p.expiry, p.owner, p.impact].join(","))
    );
    csv.push("\nLog:");
    log.forEach(l => csv.push([l.date, l.by, l.txt].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "policy_change_radar.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  // Board log
  const addLog = () => {
    if (!logText.trim()) return;
    setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]);
    setLogText("");
  };

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1450, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaBalanceScale size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Policy & Regulatory Change Radar
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Elite Risk
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
      </div>
      {/* Add Policy */}
      <div style={{ marginBottom: 9 }}>
        <button onClick={() => setAddMode(a => !a)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginBottom: 8 }}>
          <FaPlus /> {addMode ? "Cancel" : "Add Policy"}
        </button>
        {addMode &&
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 9 }}>
            <select value={newPolicy.area} onChange={e => setNewPolicy({ ...newPolicy, area: e.target.value })} style={inputStyleMini}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
            <input value={newPolicy.policy} placeholder="Policy" onChange={e => setNewPolicy({ ...newPolicy, policy: e.target.value })} style={inputStyle} />
            <select value={newPolicy.status} onChange={e => setNewPolicy({ ...newPolicy, status: e.target.value })} style={inputStyleMini}>
              <option>Active</option>
              <option>Reform proposed</option>
              <option>Expired</option>
            </select>
            <select value={newPolicy.risk} onChange={e => setNewPolicy({ ...newPolicy, risk: e.target.value })} style={inputStyleMini}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <input value={newPolicy.lastReview} type="date" onChange={e => setNewPolicy({ ...newPolicy, lastReview: e.target.value })} style={inputStyleMini} />
            <input value={newPolicy.expiry} type="date" onChange={e => setNewPolicy({ ...newPolicy, expiry: e.target.value })} style={inputStyleMini} />
            <input value={newPolicy.owner} placeholder="Owner" onChange={e => setNewPolicy({ ...newPolicy, owner: e.target.value })} style={inputStyleMini} />
            <input value={newPolicy.impact} placeholder="Impact" onChange={e => setNewPolicy({ ...newPolicy, impact: e.target.value })} style={inputStyle} />
            <button onClick={addPolicy} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
          </div>
        }
      </div>
      {/* Table */}
      <div style={{ marginBottom: 13 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff" }}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Policy</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Last Review</th>
              <th>Expiry/Renewal</th>
              <th>Owner</th>
              <th>Impact</th>
              <th>Days to Expiry</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p, i) => editMode === i ? (
              <tr key={i} style={{ background: "#FFD70022" }}>
                <td>
                  <select value={editData.area} onChange={e => setEditData({ ...editData, area: e.target.value })} style={inputStyleMini}>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </td>
                <td><input value={editData.policy} onChange={e => setEditData({ ...editData, policy: e.target.value })} style={inputStyle} /></td>
                <td>
                  <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} style={inputStyleMini}>
                    <option>Active</option>
                    <option>Reform proposed</option>
                    <option>Expired</option>
                  </select>
                </td>
                <td>
                  <select value={editData.risk} onChange={e => setEditData({ ...editData, risk: e.target.value })} style={inputStyleMini}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </td>
                <td><input value={editData.lastReview} type="date" onChange={e => setEditData({ ...editData, lastReview: e.target.value })} style={inputStyleMini} /></td>
                <td><input value={editData.expiry} type="date" onChange={e => setEditData({ ...editData, expiry: e.target.value })} style={inputStyleMini} /></td>
                <td><input value={editData.owner} onChange={e => setEditData({ ...editData, owner: e.target.value })} style={inputStyleMini} /></td>
                <td><input value={editData.impact} onChange={e => setEditData({ ...editData, impact: e.target.value })} style={inputStyle} /></td>
                <td>{daysTo(editData.expiry)}</td>
                <td>
                  <button onClick={saveEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaCheckCircle /></button>
                  <button onClick={() => setEditMode(null)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                </td>
              </tr>
            ) : (
              <tr key={i} style={{ background: p.risk === "Critical" ? "#ff484822" : p.risk === "High" ? "#FFD70022" : "#1de68222" }}>
                <td style={{ color: brand.gold, fontWeight: 700 }}>{p.area}</td>
                <td>{p.policy}</td>
                <td style={{ color: statusColors[p.status], fontWeight: 700 }}>{p.status}</td>
                <td style={{ color: riskColors[p.risk], fontWeight: 700 }}>{p.risk}</td>
                <td>{p.lastReview}</td>
                <td>{p.expiry}</td>
                <td>{p.owner}</td>
                <td>{p.impact}</td>
                <td style={{ color: daysTo(p.expiry) < 60 ? "#FFD700" : "#1de682", fontWeight: 700 }}>{daysTo(p.expiry)}</td>
                <td>
                  <button onClick={() => startEdit(i)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 3 }}><FaEdit /></button>
                  <button onClick={() => removePolicy(i)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                  <button onClick={() => runScenario(i)} style={{ ...btnStyle, background: "#FFD70066", color: "#232a2e" }}><FaLightbulb /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Scenario */}
        {scenarioIdx >= 0 &&
          <div style={{ background: "#181e23", color: "#FFD700", padding: 15, borderRadius: 12, marginTop: 10 }}>
            <b>Scenario Analysis for:</b> <span style={{ color: "#FFD700", fontWeight: 700 }}>{policies[scenarioIdx]?.policy}</span>
            <div style={{ marginTop: 5 }}>{scenarioStatus}</div>
            <button onClick={() => setScenarioIdx(-1)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}><FaArrowRight /> Close</button>
          </div>
        }
      </div>
      {/* Timeline */}
      <div style={{ marginBottom: 14, background: "#232a2e", borderRadius: 13, padding: 13 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 6 }}>
          <FaCalendarAlt style={{ marginRight: 7 }} /> Upcoming Policy Changes & Renewals
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {policies
            .filter(p => daysTo(p.expiry) < 365)
            .sort((a, b) => daysTo(a.expiry) - daysTo(b.expiry))
            .map((p, i) => (
              <div key={i} style={{
                background: daysTo(p.expiry) < 60 ? "#ff4848" : daysTo(p.expiry) < 180 ? "#FFD700" : "#1de682",
                color: "#232a2e",
                borderRadius: 10,
                minWidth: 180,
                padding: "8px 15px",
                fontWeight: 800,
                boxShadow: "0 2px 8px #FFD70022"
              }}>
                {p.policy} <br />
                <span style={{ fontWeight: 500 }}>{p.area}</span><br />
                Expiry: <b>{p.expiry}</b> <br />
                <span style={{ fontWeight: 400 }}>Days: {daysTo(p.expiry)}</span>
              </div>
            ))}
        </div>
      </div>
      {/* Boardroom Recommendations & Log */}
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}><FaLightbulb style={{ marginRight: 7 }} /> Boardroom Recommendations</div>
          <ul>
            {policies.filter(p => p.risk === "Critical" || p.risk === "High").length > 0 &&
              <li style={{ color: "#ff4848", fontWeight: 700 }}>Critical/high policy risks present—legal/board action required.</li>
            }
            <li style={{ color: "#1de682", fontWeight: 600 }}>Maintain legal monitoring and advocacy pipeline.</li>
          </ul>
        </div>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
          <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
            {log.map((c, i) =>
              <div key={i}>
                <span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt}
                <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={logText} placeholder="Add board note or action..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
            <button onClick={addLog} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 110
};
const inputStyleFull = {
  ...inputStyle, width: 220
};
const inputStyleMini = {
  ...inputStyle, width: 60, fontSize: 14, marginRight: 0, marginBottom: 2
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default PolicyChangeRadarElite;
