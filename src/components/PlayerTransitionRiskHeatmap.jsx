import React from "react";
import { FaBolt, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

// Sample transition data (from PDF logic)
const transitions = [
  { from: "U11", to: "U13", risk: "warn", reason: "Under sessions threshold (avg 68 vs 90 req.)" },
  { from: "U13", to: "U15", risk: "ok", reason: "All KPIs on track" },
  { from: "U15", to: "U17", risk: "risk", reason: "Late specialization: 39% still multi-sport" },
  { from: "U17", to: "PRO", risk: "warn", reason: "Too few games at high comp level" }
];

function flagColor(flag) {
  if (flag === "ok") return "#1de682";
  if (flag === "warn") return "#FFD700";
  return "#e24242";
}
function flagIcon(flag) {
  if (flag === "ok") return <FaCheckCircle color="#1de682" style={{ marginRight: 7 }} />;
  if (flag === "warn") return <FaExclamationTriangle color="#FFD700" style={{ marginRight: 7 }} />;
  return <FaBolt color="#e24242" style={{ marginRight: 7 }} />;
}

export default function PlayerTransitionRiskHeatmap() {
  return (
    <div style={{
      padding: 36, borderRadius: 36, background: "linear-gradient(120deg, #232a2e 80%, #232a2e 100%)",
      boxShadow: "0 8px 48px #181e2330", color: "#fff", minHeight: 480
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <FaBolt color="#FFD700" size={38} />
        <h1 style={{ fontWeight: 900, fontSize: 32, color: "#FFD700", letterSpacing: 1 }}>
          Player Transition Risk Heatmap
        </h1>
      </div>
      <div style={{ fontSize: 18, marginBottom: 22, color: "#FFD700" }}>
        Visualize, track, and act on critical transition risks. <span style={{ color: "#1de682", fontWeight: 700 }}>Powered by CourtEvo Vero</span>
      </div>
      <table style={{
        width: "100%", background: "#23292f", borderRadius: 16, boxShadow: "0 2px 12px #FFD70011",
        borderCollapse: "separate", borderSpacing: 0
      }}>
        <thead>
          <tr style={{ background: "#FFD70011", color: "#FFD700", fontWeight: 900 }}>
            <th style={{ padding: 13, borderRadius: "16px 0 0 0" }}>From</th>
            <th style={{ padding: 13 }}>To</th>
            <th style={{ padding: 13 }}>Risk</th>
            <th style={{ padding: 13 }}>Flag/Reason</th>
            <th style={{ padding: 13, borderRadius: "0 16px 0 0" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {transitions.map((t, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? "#232a2e" : "#181e23", color: "#fff", fontWeight: 600
            }}>
              <td style={{ padding: 13 }}>{t.from}</td>
              <td style={{ padding: 13 }}>{t.to}</td>
              <td style={{ padding: 13 }}>
                {flagIcon(t.risk)} <span style={{ color: flagColor(t.risk) }}>{t.risk.toUpperCase()}</span>
              </td>
              <td style={{ padding: 13 }}>{t.reason}</td>
              <td style={{ padding: 13, color: "#FFD700", fontWeight: 700 }}>
                {t.risk === "ok" ? "On track" : (t.risk === "warn" ? "Monitor" : "Immediate review")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
        marginTop: 24, background: "#FFD70022", borderRadius: 13, padding: 18, color: "#FFD700", display: "flex", alignItems: "center", gap: 12
      }}>
        <FaBolt color="#FFD700" />
        <span>
          Use this heatmap to target resources and adapt development plans to minimize dropout and stagnation risks.
        </span>
      </div>
    </div>
  );
}
