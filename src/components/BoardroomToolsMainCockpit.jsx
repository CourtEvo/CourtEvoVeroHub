import React, { useState } from "react";
import { FaClipboardList, FaFlag, FaCheckCircle, FaBell, FaComments, FaCogs, FaChartLine, FaPaperPlane } from "react-icons/fa";
import OrgScenarioAICockpit from "./OrgScenarioAICockpit";
import KPIMatrix from "./KPIMatrix";

// Pro demo feedback comments
const initialFeedback = [
  { user: "Board Member", text: "Very clear board reporting this month.", ts: "09:01" },
  { user: "Finance", text: "Would like more KPIs on resource usage.", ts: "09:03" },
  { user: "Compliance", text: "Great compliance transparency.", ts: "09:05" }
];

const toolTabs = [
  { key: "snapshots", icon: <FaClipboardList />, label: "Scenario Snapshots" },
  { key: "alerts", icon: <FaBell />, label: "Alerts" },
  { key: "feedback", icon: <FaComments />, label: "Feedback" },
  { key: "orgaicockpit", icon: <FaCogs />, label: "Org AI Cockpit" },
  { key: "kpi", icon: <FaChartLine />, label: "KPI Matrix" },
];

export default function BoardroomToolsMainCockpit() {
  const [activeTab, setActiveTab] = useState("snapshots");
  const [feedback, setFeedback] = useState(initialFeedback);
  const [feedbackInput, setFeedbackInput] = useState("");

  const renderContent = () => {
    switch (activeTab) {
      case "snapshots":
        return (
          <div>
            <h2 style={{ color: "#FFD700", fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Scenario Snapshots</h2>
            <ul style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              <li>⚡ <b>Budget Forecast:</b> +7% vs. plan</li>
              <li>⚡ <b>Compliance Risk:</b> <span style={{ color: "#e24242" }}>1 flagged</span></li>
              <li>⚡ <b>Coach Turnover:</b> <span style={{ color: "#FFD700" }}>Stable</span></li>
              <li>⚡ <b>Stakeholder engagement:</b> <span style={{ color: "#1de682" }}>+15%</span> vs. last cycle</li>
            </ul>
            <div style={{
              background: "linear-gradient(120deg,#23292f 92%,#FFD70022 100%)",
              borderRadius: 20,
              boxShadow: "0 2px 16px #FFD70033",
              padding: "22px 20px",
              maxWidth: 540
            }}>
              <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Latest Board Action:</div>
              <div style={{ color: "#fff", fontSize: 16 }}>Approved next phase of athlete pathway integration for 2025–2026.</div>
            </div>
          </div>
        );
      case "alerts":
        return (
          <div>
            <h2 style={{ color: "#e24242", fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Active Alerts</h2>
            <ul style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
              <li>🔔 <b>Financial Compliance:</b> Audit in 3 days</li>
              <li>🔔 <b>Grant Renewal:</b> Due in 7 days</li>
              <li>🔔 <b>Board Succession:</b> No successor named</li>
              <li>🔔 <b>Medical Check:</b> 2 athletes overdue</li>
            </ul>
            <div style={{
              background: "linear-gradient(120deg,#23292f 92%,#e24242bb 100%)",
              borderRadius: 20,
              boxShadow: "0 2px 16px #e24242aa",
              padding: "22px 20px",
              maxWidth: 540
            }}>
              <div style={{ color: "#e24242", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Action Required:</div>
              <div style={{ color: "#fff", fontSize: 16 }}>Schedule audit review before Friday.</div>
            </div>
          </div>
        );
      case "feedback":
        return (
          <div>
            <h2 style={{ color: "#1de682", fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Feedback & Comments</h2>
            <div style={{
              maxHeight: 195,
              overflowY: "auto",
              marginBottom: 22,
              paddingRight: 5
            }}>
              {feedback.map((msg, i) => (
                <div key={i} style={{
                  background: "#23292f",
                  borderLeft: "6px solid #1de682",
                  borderRadius: 10,
                  marginBottom: 11,
                  padding: "11px 17px",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: "0 2px 10px #1de68222"
                }}>
                  <span style={{ color: "#1de682", fontWeight: 700, marginRight: 9 }}>{msg.user}:</span>
                  {msg.text}
                  <span style={{ marginLeft: 13, fontSize: 13, opacity: 0.5 }}>{msg.ts}</span>
                </div>
              ))}
            </div>
            {/* Add Feedback */}
            <form style={{ display: "flex", gap: 10 }} onSubmit={e => {
              e.preventDefault();
              if (feedbackInput.trim()) {
                setFeedback([
                  ...feedback,
                  {
                    user: "You",
                    text: feedbackInput,
                    ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  }
                ]);
                setFeedbackInput("");
              }
            }}>
              <input
                type="text"
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  padding: "9px 13px",
                  background: "#181e23",
                  color: "#1de682",
                  outline: "none",
                  fontWeight: 700,
                  borderBottom: "2px solid #1de682"
                }}
                placeholder="Add feedback/comment…"
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
              />
              <button type="submit" style={{
                background: "#1de682",
                color: "#232a2e",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 18,
                padding: "8px 18px",
                cursor: "pointer",
                boxShadow: "0 2px 8px #1de68233"
              }}>
                <FaPaperPlane />
              </button>
            </form>
          </div>
        );
      case "orgaicockpit":
        return (
          <div>
            <h2 style={{ color: "#FFD700", fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Org AI Cockpit</h2>
            <OrgScenarioAICockpit />
          </div>
        );
      case "kpi":
        return (
          <div>
            <h2 style={{ color: "#FFD700", fontWeight: 800, fontSize: 22, marginBottom: 18 }}>KPI Matrix</h2>
            <KPIMatrix />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{
        display: "flex", gap: 14, marginBottom: 36, borderBottom: "2px solid #FFD70033", paddingBottom: 12
      }}>
        {toolTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? "#FFD700" : "transparent",
              color: activeTab === tab.key ? "#232a2e" : "#FFD700",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 17,
              padding: "10px 22px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: activeTab === tab.key ? "0 2px 8px #FFD70044" : undefined,
              cursor: "pointer",
              transition: "all 0.13s"
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ minHeight: 280 }}>
        {renderContent()}
      </div>
    </div>
  );
}
