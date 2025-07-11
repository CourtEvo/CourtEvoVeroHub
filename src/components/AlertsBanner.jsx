import React from "react";
import { FaExclamationTriangle, FaHeartbeat, FaRegClock } from "react-icons/fa";

export default function AlertsBanner() {
  // Mock alert data, replace with real-time status later
  const alerts = [
    { type: "critical", msg: "1 COMPLIANCE ACTION OVERDUE: Staff Licenses", icon: <FaExclamationTriangle />, color: "#e82e2e" },
    { type: "info", msg: "CLUB HEALTH: 92/100", icon: <FaHeartbeat />, color: "#FFD700" },
    { type: "info", msg: "Next Board Pack Due: July 15", icon: <FaRegClock />, color: "#1de682" }
  ];

  return (
    <div style={{ display: "flex", gap: 18, marginBottom: 20 }}>
      {alerts.map((alert, idx) => (
        <div key={idx} style={{
          display: "flex",
          alignItems: "center",
          background: "#181e23cc",
          color: alert.color,
          borderRadius: 11,
          fontWeight: 600,
          padding: "8px 18px",
          boxShadow: `0 1px 6px ${alert.color}44`,
          fontSize: 15
        }}>
          <span style={{ marginRight: 8 }}>{alert.icon}</span>
          {alert.msg}
        </div>
      ))}
    </div>
  );
}
