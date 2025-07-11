import React, { useState } from "react";
import { FaChartLine, FaArrowRight, FaCalendarAlt, FaCheck, FaFlag, FaUserTie, FaBullseye, FaBolt, FaLightbulb, FaExclamationTriangle, FaCrown } from "react-icons/fa";
import { ResponsiveLine } from "@nivo/line";
import { motion, AnimatePresence } from "framer-motion";
import "./LongTermDevelopmentPlan.css";

const PHASES = [
  {
    phase: "Entry/Orientation",
    kpi: 7,
    trend: "up",
    milestone: "Complete onboarding",
    progress: 1,
    kpiDelta: +2,
    owner: "Coach/Player",
    risk: "None",
    opportunity: "Excellent early adoption."
  },
  {
    phase: "Development",
    kpi: 16,
    trend: "up",
    milestone: "Pass skill benchmarks",
    progress: 0.88,
    kpiDelta: +1,
    owner: "Coach",
    risk: "Skill variance in U14 squad.",
    opportunity: "Elite U16 group."
  },
  {
    phase: "High Performance",
    kpi: 11,
    trend: "down",
    milestone: "Elite comp. achieved",
    progress: 0.71,
    kpiDelta: -1,
    owner: "Performance Staff",
    risk: "Fatigue spikes. Injury watch.",
    opportunity: "U19 all-time KPI high."
  },
  {
    phase: "Transition/Pro",
    kpi: 9,
    trend: "up",
    milestone: "Pro contract signed",
    progress: 0.61,
    kpiDelta: 0,
    owner: "Board",
    risk: "Limited pro contracts in region.",
    opportunity: "Foreign placement possible."
  },
];

const YEARLY_KPI = [
  { id: "Avg KPI", data: [{ x: "2022", y: 7 }, { x: "2023", y: 12 }, { x: "2024", y: 15 }, { x: "2025", y: 16 }] },
];

const TIMELINE = [
  { date: "2025-02-10", phase: "Entry/Orientation", label: "Onboarding", status: "done" },
  { date: "2025-05-05", phase: "Development", label: "Skill Review", status: "done" },
  { date: "2025-08-22", phase: "Development", label: "Mid-year Progress", status: "missed" },
  { date: "2025-10-14", phase: "High Performance", label: "KPI High", status: "ontrack" },
  { date: "2026-01-21", phase: "Transition/Pro", label: "First Pro Offer", status: "upcoming" },
];

// Helper for owner avatars
function getOwnerAvatar(owner) {
  if (owner.includes("Coach")) return <FaUserTie className="ltp-owner-avatar" style={{ color: "#FFD700" }} />;
  if (owner.includes("Performance")) return <FaBolt className="ltp-owner-avatar" style={{ color: "#27ef7d" }} />;
  if (owner.includes("Board")) return <FaCrown className="ltp-owner-avatar" style={{ color: "#e94057" }} />;
  return <FaUserTie className="ltp-owner-avatar" />;
}

export default function LongTermDevelopmentPlan() {
  const [phases, setPhases] = useState(PHASES);
  const [showAI, setShowAI] = useState(true);

  // DnD logic for demo (reorder phase order)
  const dragPhase = (dragIndex, hoverIndex) => {
    const newPhases = [...phases];
    const [removed] = newPhases.splice(dragIndex, 1);
    newPhases.splice(hoverIndex, 0, removed);
    setPhases(newPhases);
  };

  // Find next phase needing attention for AI
  const nextPhase = phases.find(p => p.kpiDelta < 0 || p.progress < 0.7) || phases[phases.length - 1];

  return (
    <div className="ltp-main ltp-elitev2">
      <div className="ltp-header elite">
        <FaChartLine style={{ color: "#FFD700", fontSize: 32, marginRight: 13 }} />
        <div>
          <div className="ltp-title">Long-Term Athlete Development Cockpit</div>
          <div className="ltp-desc">
            <b>Strategic, multi-year progression. </b>Visualize, reorder, and board-review phases. Micro-AI insight—every step.
          </div>
        </div>
      </div>

      {/* --- Phase Roadmap: Drag, Cards, Inline Progress --- */}
      <div className="ltp-section-title" style={{ marginBottom: 0 }}>
        Development Phase Roadmap
        <span className="ltp-helptext">Drag & reorder. Click for risk/opportunity.</span>
      </div>
      <div className="ltp-phase-roadmap elite">
        {phases.map((phase, idx) => (
          <motion.div
            key={phase.phase}
            className="ltp-phase-card elite"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            whileHover={{ scale: 1.03, boxShadow: "0 6px 20px #FFD70033" }}
            dragElastic={0.35}
            style={{ zIndex: 1 + (phases.length - idx) }}
            onDragEnd={(e, info) => {
              if (info.offset.x > 50 && idx < phases.length - 1) dragPhase(idx, idx + 1);
              if (info.offset.x < -50 && idx > 0) dragPhase(idx, idx - 1);
            }}
            tabIndex={0}
          >
            <div className="ltp-phase-head">
              <span className="ltp-phase-name">{phase.phase}</span>
              <span className="ltp-phase-milestone"><FaBullseye /> {phase.milestone}</span>
            </div>
            <div className="ltp-phase-progress-bar">
              <div className="ltp-phase-bar-outer">
                <div className="ltp-phase-bar-inner" style={{
                  width: `${Math.round(phase.progress * 100)}%`,
                  background: phase.progress > 0.9 ? "linear-gradient(90deg,#27ef7d,#FFD700 85%)" : "#FFD700aa"
                }} />
                <span className="ltp-phase-bar-label">{Math.round(phase.progress * 100)}%</span>
              </div>
              <div className="ltp-phase-mini-kpi">
                <FaChartLine /> KPI: <b>{phase.kpi}</b> {phase.trend === "up" ? <span style={{ color: "#27ef7d" }}>↑</span> : <span style={{ color: "#e94057" }}>↓</span>}
                <span className="ltp-phase-kpidelta">
                  ({phase.kpiDelta >= 0 ? "+" : ""}{phase.kpiDelta})
                </span>
              </div>
            </div>
            <div className="ltp-phase-meta">
              <span className="ltp-phase-owner">{getOwnerAvatar(phase.owner)}{phase.owner}</span>
              <span className="ltp-phase-risk">{phase.risk && <><FaExclamationTriangle style={{ marginRight: 4 }} />{phase.risk}</>}</span>
              <span className="ltp-phase-opp">{phase.opportunity && <FaLightbulb style={{ color: "#27ef7d", marginRight: 5 }} />}{phase.opportunity}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- AI Advisor Callout --- */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            className="ltp-ai-callout elite"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 26 }}
          >
            <FaLightbulb style={{ color: "#FFD700", marginRight: 9, fontSize: 23 }} />
            <b>AI Insight:</b> <span>
              {nextPhase
                ? `Focus: "${nextPhase.phase}" — ${nextPhase.kpiDelta < 0 ? "KPI drop detected, board review advised." : "Action lag, consider owner sync."}`
                : "All phases on track."}
            </span>
            <button onClick={() => setShowAI(false)} className="ltp-ai-hidebtn">Hide</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Timeline Chart --- */}
      <div className="ltp-section-title">Year-over-Year KPI Trend</div>
      <div style={{ height: 210, background: "#232b38", borderRadius: 13, padding: 16 }}>
        <ResponsiveLine
          data={YEARLY_KPI}
          margin={{ top: 24, right: 40, bottom: 44, left: 46 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          axisLeft={{
            tickSize: 8, tickPadding: 6, tickRotation: 0,
            legend: "KPI", legendOffset: -32, legendPosition: "middle"
          }}
          axisBottom={{
            tickSize: 8, tickPadding: 6, tickRotation: 0,
            legend: "Year", legendOffset: 32, legendPosition: "middle"
          }}
          theme={{
            axis: {
              ticks: {
                text: { fill: "#FFD700", fontWeight: 700, fontSize: 16 }
              },
              legend: { text: { fill: "#FFD700" } }
            },
            labels: { text: { fill: "#27ef7d", fontWeight: 900, fontSize: 18 } },
            grid: { line: { stroke: "#FFD70022" } }
          }}
          colors={["#FFD700"]}
          pointSize={13}
          pointBorderWidth={4}
          pointBorderColor={{ from: "serieColor" }}
          enableGridX={false}
          enableGridY={true}
          labelTextColor="#FFD700"
          curve="monotoneX"
        />
      </div>

      {/* --- Animated Timeline --- */}
      <div className="ltp-section-title">Plan Timeline & Event Log</div>
      <div className="ltp-timeline elite">
        {TIMELINE.map(e => (
          <motion.div
            className={`ltp-timeline-event elite ${e.status}`}
            key={e.date + e.phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="ltp-timeline-date"><FaCalendarAlt style={{ color: "#FFD700", marginRight: 6 }} /> {e.date}</div>
            <div className="ltp-timeline-phase">{e.phase}</div>
            <div className="ltp-timeline-label">{e.label}</div>
            <div className={`ltp-timeline-status ${e.status}`}>
              {e.status === "done" && <span style={{ color: "#27ef7d", fontWeight: 900 }}><FaCheck /> Complete</span>}
              {e.status === "ontrack" && <span style={{ color: "#FFD700", fontWeight: 900 }}><FaFlag /> On Track</span>}
              {e.status === "upcoming" && <span style={{ color: "#27ef7d", fontWeight: 900 }}><FaFlag /> Upcoming</span>}
              {e.status === "missed" && <span style={{ color: "#e94057", fontWeight: 900 }}><FaFlag /> Missed</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Board Review MiniDashboard --- */}
      <div className="ltp-section-title">Board Review Microdashboard</div>
      <div className="ltp-boardreview elite">
        <div className="ltp-brev-section">
          <div className="ltp-brev-title">Phase Progress</div>
          {phases.map(p => (
            <div key={p.phase} className="ltp-brev-progressrow">
              <span>{p.phase}</span>
              <div className="ltp-brev-progressbar">
                <div className="ltp-brev-progressfill" style={{
                  width: `${Math.round(p.progress * 100)}%`,
                  background: p.progress > 0.9 ? "#27ef7d" : "#FFD700"
                }} />
              </div>
              <span>{Math.round(p.progress * 100)}%</span>
            </div>
          ))}
        </div>
        <div className="ltp-brev-section">
          <div className="ltp-brev-title">Phase Risks</div>
          {phases.filter(p => p.risk && p.risk !== "None").map(p => (
            <div key={p.phase} className="ltp-brev-riskrow">
              <FaExclamationTriangle style={{ color: "#e94057", marginRight: 6 }} />
              <span>{p.phase}:</span>
              <span style={{ color: "#FFD700", marginLeft: 5 }}>{p.risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
