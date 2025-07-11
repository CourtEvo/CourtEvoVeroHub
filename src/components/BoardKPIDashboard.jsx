import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaChartBar, FaCheckCircle, FaExclamationTriangle, FaRegClock } from "react-icons/fa";

// Demo KPI data (replace with live values)
const KPIS = [
  { label: "Board Attendance", value: 88, type: "%", goal: 90 },
  { label: "Decision Consensus", value: 82, type: "%", goal: 85 },
  { label: "Open Risks", value: 2, type: "count", goal: 0 },
  { label: "Overdue Follow-Ups", value: 1, type: "count", goal: 0 },
  { label: "Minutes Approved", value: 95, type: "%", goal: 100 }
];

const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function getStatus(kpi) {
  if (kpi.type === "%") {
    if (kpi.value >= kpi.goal) return { color: "#27ef7d", icon: <FaCheckCircle /> };
    if (kpi.value >= kpi.goal - 10) return { color: "#FFD700", icon: <FaExclamationTriangle /> };
    return { color: "#e94057", icon: <FaExclamationTriangle /> };
  } else {
    if (kpi.value <= kpi.goal) return { color: "#27ef7d", icon: <FaCheckCircle /> };
    if (kpi.value <= kpi.goal + 2) return { color: "#FFD700", icon: <FaExclamationTriangle /> };
    return { color: "#e94057", icon: <FaExclamationTriangle /> };
  }
}

const BoardKPIDashboard = () => (
  <div style={{ width: "100%", maxWidth: 830, margin: "0 auto", padding: 0 }}>
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.8 }}
      style={{
        background: "rgba(255,255,255,0.10)",
        borderRadius: 20,
        padding: 32,
        marginTop: 36,
        marginBottom: 36,
        boxShadow: "0 2px 16px #FFD70044"
      }}
    >
      <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 20 }}>
        Board KPI Dashboard
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))",
        gap: 22
      }}>
        {KPIS.map((kpi, i) => {
          const status = getStatus(kpi);
          return (
            <div key={kpi.label} style={{
              background: status.color + "22",
              borderRadius: 13,
              padding: "25px 16px 17px 16px",
              color: status.color,
              fontWeight: 700,
              fontSize: 22,
              textAlign: "center",
              boxShadow: "0 1px 7px #FFD70022"
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{status.icon}</div>
              {kpi.label}
              <div style={{ color: "#fff", fontSize: 33, fontWeight: 900, margin: "8px 0" }}>
                {kpi.value}{kpi.type}
              </div>
              <div style={{ color: "#FFD700", fontSize: 15 }}>
                Target: {kpi.goal}{kpi.type}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        color: "#FFD700",
        fontWeight: 600,
        fontSize: 16,
        marginTop: 18
      }}>
        Pro insight: All key metrics in one view—instantly boardroom ready.
      </div>
    </motion.section>
  </div>
);

export default BoardKPIDashboard;
