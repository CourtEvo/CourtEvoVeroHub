import React from "react";
import { FaUsers, FaHeartbeat, FaSmile, FaUserTie } from "react-icons/fa";

const scorecard = [
  { group: "Parents", engagement: 78, lastPulse: "Q2", flag: "warn" },
  { group: "Coaches", engagement: 94, lastPulse: "Q2", flag: "ok" },
  { group: "Athletes", engagement: 68, lastPulse: "Q2", flag: "risk" }
];

function flagColor(flag) {
  if (flag === "ok") return "#1de682";
  if (flag === "warn") return "#FFD700";
  return "#e24242";
}

export default function StakeholderScorecard() {
  return (
    <div style={{
      padding: 36, borderRadius: 36, background: "linear-gradient(120deg, #181e23 80%, #232a2e 100%)",
      boxShadow: "0 8px 48px #181e2330", color: "#fff", minHeight: 480
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <FaUsers color="#1de682" size={38} />
        <h1 style={{ fontWeight: 900, fontSize: 32, color: "#1de682", letterSpacing: 1 }}>
          Stakeholder Scorecard
        </h1>
      </div>
      <div style={{ fontSize: 18, marginBottom: 22, color: "#FFD700" }}>
        Monitor satisfaction and engagement for all stakeholders. <span style={{ color: "#1de682", fontWeight: 700 }}>Live Pulse | CourtEvo Vero</span>
      </div>
      <table style={{
        width: "100%", background: "#23292f", borderRadius: 16, boxShadow: "0 2px 12px #FFD70011",
        borderCollapse: "separate", borderSpacing: 0
      }}>
        <thead>
          <tr style={{ background: "#1de68222", color: "#1de682", fontWeight: 900 }}>
            <th style={{ padding: 13, borderRadius: "16px 0 0 0" }}>Group</th>
            <th style={{ padding: 13 }}>Engagement</th>
            <th style={{ padding: 13 }}>Last Pulse</th>
            <th style={{ padding: 13, borderRadius: "0 16px 0 0" }}>Flag</th>
          </tr>
        </thead>
        <tbody>
          {scorecard.map((row, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? "#232a2e" : "#181e23", color: "#fff", fontWeight: 600
            }}>
              <td style={{ padding: 13 }}>
                {row.group === "Parents" && <FaSmile color="#FFD700" style={{marginRight:7}} />}
                {row.group === "Coaches" && <FaUserTie color="#1de682" style={{marginRight:7}} />}
                {row.group === "Athletes" && <FaHeartbeat color="#e24242" style={{marginRight:7}} />}
                {row.group}
              </td>
              <td style={{ padding: 13, color: flagColor(row.flag), fontWeight:700 }}>{row.engagement}%</td>
              <td style={{ padding: 13 }}>{row.lastPulse}</td>
              <td style={{ padding: 13 }}>
                <span style={{
                  color: flagColor(row.flag),
                  fontWeight: 800,
                  fontSize: 17
                }}>{row.flag.toUpperCase()}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
        marginTop: 24, background: "#1de68222", borderRadius: 13, padding: 18, color: "#1de682", display: "flex", alignItems: "center", gap: 12
      }}>
        <FaUsers color="#1de682" />
        <span>
          Low engagement? Target interviews and satisfaction surveys to the flagged group. Real-time boardroom insight.
        </span>
      </div>
    </div>
  );
}
