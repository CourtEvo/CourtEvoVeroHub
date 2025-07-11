import React, { useState } from "react";
import { FaListUl, FaUserShield, FaExclamationTriangle, FaSearch, FaHistory, FaRegCalendarAlt, FaClipboardCheck, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";

// Fake logs (real-world: load from database)
const AUDIT_LOGS = [
  { id: 1, date: "2024-05-10 15:33", user: "jmarkovic", action: "Changed player contract status", area: "Player Ops", risk: "Medium" },
  { id: 2, date: "2024-05-10 14:12", user: "board_admin", action: "Exported full finance report", area: "Finance", risk: "High" },
  { id: 3, date: "2024-05-09 18:41", user: "tina.ivan", action: "Updated GDPR consents", area: "Data Privacy", risk: "Critical" },
  { id: 4, date: "2024-05-09 13:08", user: "coach_stipe", action: "Edited training session attendance", area: "Sport", risk: "Low" },
  { id: 5, date: "2024-05-08 16:45", user: "sec_vlatka", action: "Deleted session (U14)", area: "Sport", risk: "Medium" },
  { id: 6, date: "2024-05-07 09:20", user: "board_admin", action: "Added new board policy", area: "Governance", risk: "High" }
];

const RISK_COL = {
  "Low": "#27ef7d",
  "Medium": "#FFD700",
  "High": "#e94057",
  "Critical": "#d7263d"
};

export default function AuditTrailDashboard() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const logs = AUDIT_LOGS.filter(
    l =>
      l.user.toLowerCase().includes(filter.toLowerCase()) ||
      l.area.toLowerCase().includes(filter.toLowerCase()) ||
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.risk.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", background: "rgba(40,62,81,0.95)", borderRadius: 24, padding: 24, boxShadow: "0 4px 20px #FFD70019" }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 30, marginBottom: 10 }}>
        <FaListUl style={{ marginBottom: -8, fontSize: 29 }} /> Audit Trail & Forensics
      </h2>
      <div style={{ color: "#FFD700cc", fontWeight: 600, marginBottom: 22 }}>
        Complete, tamper-resistant record of all major club/system actions. Board-level forensic search and risk.
      </div>

      <div style={{ marginBottom: 13, display: "flex", alignItems: "center", gap: 9 }}>
        <FaSearch color="#FFD700" />
        <input
          style={{ width: 340, padding: 7, borderRadius: 7, border: "none", fontSize: 16 }}
          placeholder="Search by user, area, action, or risk..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <table style={{ width: "100%", borderRadius: 7, background: "#222d38" }}>
        <thead>
          <tr style={{ color: "#FFD700", fontWeight: 800 }}>
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Area</th>
            <th>Risk</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, idx) => (
            <tr
              key={l.id}
              style={{
                background: selected?.id === l.id ? "#FFD70011" : idx % 2 === 0 ? "#283e51" : "#222d38",
                cursor: "pointer"
              }}
              onClick={() => setSelected(l)}
            >
              <td>{l.date}</td>
              <td style={{ fontWeight: 700 }}>{l.user}</td>
              <td>{l.action}</td>
              <td>{l.area}</td>
              <td style={{ color: RISK_COL[l.risk], fontWeight: 800 }}>{l.risk}</td>
              <td>
                <motion.button
                  style={{
                    background: "#FFD700",
                    color: "#222",
                    border: "none",
                    borderRadius: 5,
                    padding: "5px 11px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                  whileHover={{ scale: 1.08 }}
                  onClick={e => { e.stopPropagation(); setSelected(l); }}
                >
                  <FaEye />
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          style={{
            background: "#181e23", padding: 21, borderRadius: 13, marginTop: 13,
            color: "#FFD700bb", fontWeight: 600, boxShadow: "0 2px 9px #FFD70011"
          }}>
          <h3 style={{ color: "#FFD700", fontWeight: 900 }}>
            <FaHistory style={{ marginBottom: -4, marginRight: 4 }} />
            Action Forensics — {selected.date}
          </h3>
          <div><b>User:</b> {selected.user}</div>
          <div><b>Action:</b> {selected.action}</div>
          <div><b>Area:</b> {selected.area}</div>
          <div><b>Risk:</b> <span style={{ color: RISK_COL[selected.risk], fontWeight: 800 }}>{selected.risk}</span></div>
        </motion.div>
      )}

      <div style={{ marginTop: 19, color: "#FFD700a0", fontSize: 14, textAlign: "center" }}>
        <FaUserShield style={{ marginRight: 6 }} />
        All board/ops logs are protected. Forensic audit available for every major action, every user.
      </div>
    </div>
  );
}
