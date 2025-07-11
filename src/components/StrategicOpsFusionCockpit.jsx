// src/components/StrategicOpsFusionCockpit.jsx
import React, { useState } from "react";
import {
  FaRocket, FaHeartbeat, FaChartPie, FaSync, FaClipboardCheck, FaExclamationTriangle,
  FaCogs, FaFileExport, FaLayerGroup, FaBullseye, FaUsers, FaMoneyBillWave,
  FaStream, FaRegSmile, FaGavel, FaKey, FaCommentDots, FaMap, FaChalkboardTeacher, FaBrain
} from "react-icons/fa";

const palette = {
  gold: "#FFD700",
  green: "#1de682",
  dark: "#232a2e",
  bg: "#181e23"
};

const tabs = [
  { key: "ops", label: "Live Ops", icon: <FaCogs /> },
  { key: "timeline", label: "Timeline & Pulse", icon: <FaStream /> },
  { key: "kpi", label: "KPI Radar", icon: <FaChartPie /> },
  { key: "scenario", label: "Scenario Wizard", icon: <FaSync /> },
  { key: "resources", label: "Resource Matrix", icon: <FaLayerGroup /> },
  { key: "risk", label: "Risk Domino Map", icon: <FaExclamationTriangle /> },
  { key: "raci", label: "Accountability Matrix", icon: <FaKey /> },
  { key: "compliance", label: "Compliance & Governance", icon: <FaGavel /> },
  { key: "dna", label: "Club DNA Tracker", icon: <FaBullseye /> },
  { key: "sentiment", label: "Stakeholder Sentiment", icon: <FaRegSmile /> },
  { key: "maturity", label: "Maturity Heatmap", icon: <FaMap /> },
  { key: "actions", label: "Decision Log", icon: <FaClipboardCheck /> },
  { key: "chat", label: "Boardroom Chat", icon: <FaCommentDots /> },
  { key: "export", label: "Debrief Export", icon: <FaFileExport /> }
];

export default function StrategicOpsFusionCockpit() {
  const [tab, setTab] = useState("ops");

  return (
    <div style={{
      background: `linear-gradient(135deg, ${palette.dark} 70%, ${palette.bg} 100%)`,
      borderRadius: 22,
      boxShadow: "0 8px 48px #232a2e44",
      minHeight: 900,
      padding: 46,
      color: palette.gold,
      fontFamily: "Segoe UI, sans-serif",
      fontWeight: 600,
      letterSpacing: 0.5,
      maxWidth: 1650,
      margin: "0 auto"
    }}>
      <h2 style={{ fontSize: 40, color: palette.gold, fontWeight: 900, letterSpacing: 2 }}>
        <FaRocket style={{ marginRight: 16, fontSize: 33, color: palette.green, verticalAlign: "middle" }} />
        STRATEGIC OPS FUSION COCKPIT <span style={{
          background: palette.green, color: palette.dark, fontSize: 16, fontWeight: 900, borderRadius: 8, padding: "5px 12px", marginLeft: 18
        }}>BE REAL. BE VERO.</span>
      </h2>
      <div style={{ display: "flex", gap: 26, margin: "38px 0 30px 0", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? palette.gold : "transparent",
              color: tab === t.key ? palette.dark : palette.gold,
              border: "none",
              borderBottom: tab === t.key ? `4px solid ${palette.green}` : "4px solid transparent",
              borderRadius: 18,
              fontWeight: 800,
              fontSize: 19,
              padding: "13px 28px",
              marginRight: 4,
              boxShadow: tab === t.key ? `0 2px 18px #FFD70044` : "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 13,
              transition: "all 0.15s"
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{
        background: "#232a2e",
        borderRadius: 19,
        padding: 42,
        minHeight: 530,
        color: "#fff"
      }}>
        {tab === "ops" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaCogs style={{ marginRight: 14, color: palette.green, fontSize: 28 }} />
              Live Ops Status – Roster, Schedule, Compliance, Alerts
            </div>
            {/* Replace with full CRUD status tiles + live ops */}
          </div>
        )}
        {tab === "timeline" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaStream style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Timeline & Club Pulse
            </div>
            {/* Timeline of actions, events, pulse health bar */}
          </div>
        )}
        {tab === "kpi" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaChartPie style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              KPI Radar – Weighted, Color-Banded, Drag/Drop
            </div>
            {/* KPI radar graph with weights */}
          </div>
        )}
        {tab === "scenario" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaSync style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Scenario Wizard (AI + Playbooks)
            </div>
            {/* AI scenario builder, save/load, CourtEvo recs */}
          </div>
        )}
        {tab === "resources" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaLayerGroup style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Resource Allocation Matrix (Live)
            </div>
            {/* Visual resource grid, drag/drop */}
          </div>
        )}
        {tab === "risk" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaExclamationTriangle style={{ marginRight: 13, color: palette.gold, fontSize: 25 }} />
              Risk Domino Map (Cascade Effect)
            </div>
            {/* Visual domino/cascade of risk */}
          </div>
        )}
        {tab === "raci" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaKey style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Role & Accountability Matrix (RACI)
            </div>
            {/* RACI table, role gaps, overloads */}
          </div>
        )}
        {tab === "compliance" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaGavel style={{ marginRight: 13, color: palette.gold, fontSize: 25 }} />
              Compliance & Board Governance Radar
            </div>
            {/* Checklist, calendar sync, alerts */}
          </div>
        )}
        {tab === "dna" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaBullseye style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Club DNA/Brand Tracker
            </div>
            {/* Club philosophy/values tracking */}
          </div>
        )}
        {tab === "sentiment" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaRegSmile style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Stakeholder Sentiment & Engagement
            </div>
            {/* Sentiment graph/tracker */}
          </div>
        )}
        {tab === "maturity" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaMap style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Club Maturity Heatmap
            </div>
            {/* Maturity visualization per pillar */}
          </div>
        )}
        {tab === "actions" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaClipboardCheck style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Decision/Action Log
            </div>
            {/* CRUD log, tagging, export */}
          </div>
        )}
        {tab === "chat" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaCommentDots style={{ marginRight: 13, color: palette.green, fontSize: 25 }} />
              Boardroom Chat & Audit Trail
            </div>
            {/* Chat UI, links to actions/timeline */}
          </div>
        )}
        {tab === "export" && (
          <div>
            <div style={{ fontSize: 25, color: palette.gold, marginBottom: 18 }}>
              <FaFileExport style={{ marginRight: 13, color: palette.gold, fontSize: 25 }} />
              Boardroom Debrief Export (PDF/Word/Print)
            </div>
            {/* Narrative summary, branded */}
          </div>
        )}
      </div>
    </div>
  );
}
