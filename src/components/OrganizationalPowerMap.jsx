import React, { useState } from "react";
import {
  FaSitemap,
  FaUserTie,
  FaUserShield,
  FaUsers,
  FaCogs,
  FaBalanceScale,
  FaStar,
  FaHandshake,
  FaTrash,
  FaEdit,
  FaPlusCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartPie,
  FaRegClock,
  FaDownload,
  FaShareAlt,
} from "react-icons/fa";

// Demo roles (can be edited)
const initRoles = [
  { id: 1, name: "President", type: "Board", influence: 95, reports: [2, 3], tenure: 7, decisionWeight: 9 },
  { id: 2, name: "Technical Director", type: "Technical", influence: 90, reports: [4, 5, 6], tenure: 5, decisionWeight: 8 },
  { id: 3, name: "Operations Manager", type: "Operations", influence: 75, reports: [7, 8], tenure: 6, decisionWeight: 6 },
  { id: 4, name: "U18 Coach", type: "Technical", influence: 65, reports: [], tenure: 4, decisionWeight: 6 },
  { id: 5, name: "U16 Coach", type: "Technical", influence: 62, reports: [], tenure: 2, decisionWeight: 5 },
  { id: 6, name: "U14 Coach", type: "Technical", influence: 58, reports: [], tenure: 2, decisionWeight: 5 },
  { id: 7, name: "Facility Manager", type: "Operations", influence: 50, reports: [], tenure: 3, decisionWeight: 4 },
  { id: 8, name: "Sponsor Rep", type: "External", influence: 40, reports: [], tenure: 2, decisionWeight: 2 },
];

const roleTypes = {
  Board: { color: "#FFD700", icon: <FaUserShield /> },
  Technical: { color: "#1de682", icon: <FaUserTie /> },
  Operations: { color: "#485563", icon: <FaCogs /> },
  External: { color: "#ff6b6b", icon: <FaHandshake /> },
};

export default function OrganizationalPowerMap() {
  const [roles, setRoles] = useState(initRoles);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(roles[0]);
  const [showLegend, setShowLegend] = useState(false);

  // CRUD
  function handleEdit(role) {
    setEditing(role);
    setForm({ ...role });
    setAdding(false);
  }
  function handleDelete(id) {
    setRoles(rs => rs.filter(r => r.id !== id).map(r => ({
      ...r, reports: r.reports.filter(rid => rid !== id)
    })));
    if (selected && selected.id === id) setSelected(null);
  }
  function handleSaveEdit() {
    setRoles(rs => rs.map(r => r.id === editing.id ? { ...form, id: editing.id } : r));
    setEditing(null);
  }
  function handleAddNew() {
    const newRole = { ...form, id: Date.now(), reports: form.reports || [] };
    setRoles(rs => [...rs, newRole]);
    setAdding(false);
  }

  // Analytics & network
  const roleMap = {};
  roles.forEach(r => { roleMap[r.id] = r; });
  const totalInfluence = roles.reduce((a, r) => a + r.influence, 0);

  // Bottleneck/alert detection
  const bottlenecks = roles.filter(r => r.reports.length > 3 || r.influence > 80);
  const disconnected = roles.filter(r => roles.every(rr => !rr.reports.includes(r.id)) && r.reports.length === 0);

  // Power breakdown
  const typePower = { Board: 0, Technical: 0, Operations: 0, External: 0 };
  roles.forEach(r => typePower[r.type] += r.influence);

  return (
    <div
      style={{
        background: "#232a2e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        borderRadius: "24px",
        padding: "38px 28px 18px 28px",
        boxShadow: "0 6px 32px 0 #1a1d20",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaSitemap size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            ORGANIZATIONAL POWER MAP
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Real-time power flows. Live, add/edit/delete. Boardroom only.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          fontWeight: 700,
          background: "#FFD700",
          color: "#232a2e",
          borderRadius: 12,
          padding: "10px 22px",
          fontSize: 17,
          boxShadow: "0 2px 12px 0 #2a2d31",
          minWidth: 195,
          textAlign: "center"
        }}>
          Total Influence: <span style={{ color: "#FFD700" }}>{totalInfluence}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Network Map */}
        <div style={{ minWidth: 380, maxWidth: 490, background: "#283E51", borderRadius: 22, padding: 20, boxShadow: "0 2px 12px 0 #15171a" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 9 }}>
            Power Network & Reporting Flow
            <button
              onClick={() => setAdding(true)}
              style={{
                background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 700, border: "none", marginLeft: 24, fontSize: 15, padding: "5px 14px", cursor: "pointer"
              }}>
              <FaPlusCircle style={{ marginRight: 7 }} /> Add Role
            </button>
          </div>
          {/* Simulated graph */}
          <div style={{
            background: "#232a2e", borderRadius: 15, minHeight: 190, padding: 12, marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 13, alignItems: "center"
          }}>
            {roles.map(role => (
              <div key={role.id}
                style={{
                  background: selected && selected.id === role.id ? "#FFD700" : roleTypes[role.type].color + "22",
                  color: selected && selected.id === role.id ? "#232a2e" : "#FFD700",
                  borderRadius: "50%",
                  width: 70 + Math.floor(role.influence / 2),
                  height: 70 + Math.floor(role.influence / 2),
                  fontWeight: 700,
                  fontSize: 15,
                  textAlign: "center",
                  lineHeight: (70 + Math.floor(role.influence / 2)) + "px",
                  position: "relative",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px 0 #121416",
                  border: "3px solid " + roleTypes[role.type].color,
                  zIndex: 2
                }}
                onClick={() => setSelected(role)}
                title={role.name}
              >
                <div style={{
                  fontSize: 22, color: roleTypes[role.type].color, marginBottom: 2, marginTop: 6,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{roleTypes[role.type].icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginTop: -5 }}>{role.name}</div>
                <div style={{ fontWeight: 500, fontSize: 13, color: "#232a2e" }}>{role.influence}</div>
                {/* Draw reporting arrows */}
                {role.reports.map(rid => (
                  <div key={rid} style={{
                    position: "absolute", left: "100%", top: "50%", color: "#FFD700", fontSize: 19,
                    transform: "translateY(-50%)"
                  }}>
                    →
                  </div>
                ))}
                <div style={{
                  position: "absolute", right: 10, bottom: 6, fontSize: 16, color: "#FFD700"
                }}>{roleTypes[role.type].icon}</div>
              </div>
            ))}
          </div>
          {/* Add/Edit Form */}
          {(adding || editing) &&
            <div style={{
              background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13
            }}>
              <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7 }}>{adding ? "Add New Role" : "Edit Role"}</div>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Type:</b>
                  <select value={form.type || ""} required
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select...</option>
                    {Object.keys(roleTypes).map(rt => <option key={rt} value={rt}>{rt}</option>)}
                  </select>
                </div>
                <div>
                  <b>Influence:</b>
                  <input type="number" min="1" max="100" value={form.influence || 1} required
                    onChange={e => setForm(f => ({ ...f, influence: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 65 }} />
                </div>
                <div>
                  <b>Tenure (yrs):</b>
                  <input type="number" min="1" max="20" value={form.tenure || 1} required
                    onChange={e => setForm(f => ({ ...f, tenure: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 65 }} />
                </div>
                <div>
                  <b>Decision Weight:</b>
                  <input type="number" min="1" max="10" value={form.decisionWeight || 1} required
                    onChange={e => setForm(f => ({ ...f, decisionWeight: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 65 }} />
                </div>
                <div>
                  <b>Reports to (IDs, comma):</b>
                  <input type="text" value={(form.reports || []).join(",")}
                    onChange={e => setForm(f => ({ ...f, reports: e.target.value.split(",").map(Number).filter(Boolean) }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 120 }} placeholder="e.g. 1,2" />
                </div>
                <div style={{ marginTop: 9 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", marginRight: 8, cursor: "pointer"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", cursor: "pointer"
                  }} onClick={() => { setAdding(false); setEditing(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
        </div>

        {/* Role Table + Analytics */}
        <div style={{ minWidth: 340, maxWidth: 440 }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "15px 15px 11px 15px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 15 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, marginBottom: 5 }}>
              Power Heatmap & Risk Table
              <button
                onClick={() => setShowLegend(l => !l)}
                style={{ background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 700, border: "none", marginLeft: 17, fontSize: 14, padding: "2px 10px", cursor: "pointer" }}
              >
                Legend
              </button>
            </div>
            <table style={{ width: "100%", fontSize: 14, color: "#fff" }}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Influence</th>
                  <th>Reports</th>
                  <th>Tenure</th>
                  <th>Decision</th>
                  <th>Alerts</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}
                    style={{ background: selected && selected.id === role.id ? "#FFD70022" : "transparent" }}>
                    <td style={{ color: "#FFD700", fontWeight: 700 }}>{role.name}</td>
                    <td>{roleTypes[role.type].icon} {role.type}</td>
                    <td style={{ color: role.influence > 80 ? "#FFD700" : role.influence > 60 ? "#1de682" : "#fff", fontWeight: 700 }}>{role.influence}</td>
                    <td>{role.reports.length}</td>
                    <td>{role.tenure} yrs</td>
                    <td>{role.decisionWeight}</td>
                    <td>
                      {bottlenecks.includes(role) && <span style={{ color: "#FFD700", fontWeight: 700 }} title="Bottleneck or overload"><FaExclamationTriangle /></span>}
                      {disconnected.includes(role) && <span style={{ color: "#ff6b6b", fontWeight: 700 }} title="Disconnected / Unmanaged"><FaExclamationTriangle /></span>}
                      {(!bottlenecks.includes(role) && !disconnected.includes(role)) && <span style={{ color: "#1de682", fontWeight: 700 }} title="Healthy"><FaCheckCircle /></span>}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(role)}
                        style={{ background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", marginRight: 3, padding: "2px 8px", cursor: "pointer" }}>
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(role.id)}
                        style={{ background: "#ff6b6b", color: "#fff", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showLegend &&
              <div style={{ marginTop: 8, background: "#FFD70022", borderRadius: 7, padding: 7, color: "#232a2e", fontWeight: 600 }}>
                <span style={{ color: "#FFD700" }}><FaUserShield /> Board</span> &nbsp; | &nbsp;
                <span style={{ color: "#1de682" }}><FaUserTie /> Technical</span> &nbsp; | &nbsp;
                <span style={{ color: "#485563" }}><FaCogs /> Operations</span> &nbsp; | &nbsp;
                <span style={{ color: "#ff6b6b" }}><FaHandshake /> External</span>
              </div>
            }
            <div style={{ marginTop: 10, color: "#FFD700", fontWeight: 700 }}>Power Analytics</div>
            <ul style={{ fontSize: 14, marginLeft: 0, marginTop: 3 }}>
              <li><span style={{ color: "#FFD700" }}>Board:</span> {typePower.Board}</li>
              <li><span style={{ color: "#1de682" }}>Technical:</span> {typePower.Technical}</li>
              <li><span style={{ color: "#485563" }}>Operations:</span> {typePower.Operations}</li>
              <li><span style={{ color: "#ff6b6b" }}>External:</span> {typePower.External}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          fontSize: 14,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Proprietary to CourtEvo Vero. Power is visible. Bottlenecks, risks, and flows—always managed. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
