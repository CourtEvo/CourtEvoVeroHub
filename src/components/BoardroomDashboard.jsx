import React from "react";
import { FaHeartbeat, FaChartLine, FaRegClock, FaClipboardList, FaCheckCircle, FaBolt } from "react-icons/fa";

const mockData = {
  clubHealth: 92,
  talentAtRisk: 2,
  complianceOpen: 1,
  nextBoardPack: "July 15, 2025",
  aiRecommendations: [
    "Increase U16 training intensity for next 2 weeks.",
    "Close open compliance action: Staff Licenses.",
    "Promote top performer from U14 to U16 rotation."
  ],
  keyInsights: [
    "Practice/Game Ratio is optimal (2.1:1).",
    "Financial risk: Stable.",
    "One U18 player flagged 'At Risk' due to missed sessions."
  ],
  quickActions: [
    "Download Board Pack PDF",
    "Schedule Compliance Review",
    "Send Athlete Progress Report"
  ]
};

export default function BoardroomDashboard() {
  return (
    <div>
      {/* Top Cards */}
      <div style={{
        display: 'flex',
        gap: 32,
        marginBottom: 36,
        flexWrap: 'wrap'
      }}>
        <Card icon={<FaHeartbeat color="#FFD700" size={32} />} title="CLUB HEALTH" value={`${mockData.clubHealth} / 100`} color="#FFD700" />
        <Card icon={<FaChartLine color="#1de682" size={32} />} title="TALENT AT RISK" value={mockData.talentAtRisk} color="#1de682" />
        <Card icon={<FaRegClock color="#FFD700" size={32} />} title="COMPLIANCE OPEN" value={mockData.complianceOpen} color="#FFD700" />
        <Card icon={<FaClipboardList color="#FFD700" size={32} />} title="NEXT BOARD PACK" value={mockData.nextBoardPack} color="#FFD700" />
      </div>

      {/* AI Action Prioritizer */}
      <SectionHeader>AI ACTION PRIORITIZER</SectionHeader>
      <ol style={{ fontSize: 18, margin: "0 0 28px 30px" }}>
        {mockData.aiRecommendations.map((rec, idx) => (
          <li key={idx} style={{ marginBottom: 9 }}>{rec}</li>
        ))}
      </ol>

      {/* Key Insights & Quick Actions */}
      <div style={{ display: "flex", gap: 28, marginBottom: 16 }}>
        <div style={{
          flex: 1,
          background: "#21282c",
          borderRadius: 18,
          padding: "26px 32px",
          boxShadow: "0 3px 18px #FFD70022"
        }}>
          <div style={{ color: "#1de682", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Key Insights</div>
          <ul style={{ margin: "14px 0 0 18px", color: "#fff", fontSize: 15 }}>
            {mockData.keyInsights.map((insight, idx) => (
              <li key={idx} style={{ marginBottom: 7 }}>{insight}</li>
            ))}
          </ul>
        </div>
        <div style={{
          flex: 1,
          background: "#21282c",
          borderRadius: 18,
          padding: "26px 32px",
          boxShadow: "0 3px 18px #FFD70022"
        }}>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Quick Actions</div>
          <ul style={{ margin: "14px 0 0 18px", color: "#fff", fontSize: 15 }}>
            {mockData.quickActions.map((action, idx) => (
              <li key={idx} style={{ marginBottom: 7 }}>
                <a href="#" style={{ color: "#1de682", fontWeight: 700, textDecoration: "underline dotted" }}>
                  {action}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function Card({ icon, title, value, color }) {
  return (
    <div style={{
      background: "#232a2e",
      borderRadius: 22,
      boxShadow: `0 3px 22px ${color}33`,
      padding: "28px 38px",
      minWidth: 210,
      display: "flex",
      alignItems: "center",
      gap: 22
    }}>
      {icon}
      <div>
        <div style={{ fontSize: 14, color, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 31, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      color: "#FFD700",
      fontWeight: 800,
      fontSize: 20,
      margin: "38px 0 12px 0",
      letterSpacing: 1.2
    }}>
      {children}
    </div>
  );
}
