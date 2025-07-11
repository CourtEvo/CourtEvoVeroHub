import React from "react";
import { FaClipboardList, FaFlag, FaCogs, FaChartLine, FaCheckCircle, FaClipboardCheck, FaBolt, FaUsers, FaChartPie,
FaUserTie} from "react-icons/fa";

const tools = [
  { label: "Snapshots", icon: <FaClipboardList />, key: "ScenarioSnapshots" },
  { label: "Alerts", icon: <FaFlag />, key: "AlertsBanner" },
  { label: "Feedback", icon: <FaCheckCircle />, key: "FeedbackPanel" },
  { label: "Org AI Cockpit", icon: <FaCogs />, key: "OrgScenarioAICockpit" },
  { label: "KPIs", icon: <FaChartLine />, key: "KPIMatrix" },
  // NEW MODULES:
  { label: "LTAD Compliance", icon: <FaClipboardCheck />, key: "LTADCompliance" },
  { label: "Transition Risk", icon: <FaBolt />, key: "TransitionHeatmap" },
  { label: "Stakeholder Scorecard", icon: <FaUsers />, key: "StakeholderScorecard" },
  { label: "Market Radar", icon: <FaChartPie />, key: "MarketGapRadar" },
  { label: "Role Roadmap", icon: <FaUserTie />, key: "DynamicRoleRoadmap" },
];

export default function BoardroomToolsSidebar({ setView, currentView }) {
  return (
    <nav style={{
      width: 75,
      minHeight: "100vh",
      background: "rgba(24,36,51,0.97)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRight: "2px solid #FFD70033",
      padding: "28px 0",
      zIndex: 14
    }}>
      <div style={{ marginBottom: 30 }}>
        <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 45 }} />
      </div>
      {tools.map(item => (
        <button
          key={item.key}
          onClick={() => setView(item.key)}
          title={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: currentView === item.key ? "#FFD700" : "transparent",
            color: currentView === item.key ? "#232a2e" : "#FFD700",
            border: "none",
            outline: "none",
            fontWeight: 700,
            fontSize: 21,
            padding: "16px 0",
            margin: "6px 0",
            borderRadius: 12,
            width: 50,
            transition: "all 0.14s",
            boxShadow: currentView === item.key ? "0 2px 8px #FFD70033" : undefined
          }}>
          {item.icon}
        </button>
      ))}
    </nav>
  );
}
