import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LineChart, Line } from "recharts";
import { FaEuroSign, FaUsers, FaHeartbeat, FaAward, FaBell, FaUserShield, FaFileExport, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// DEMO DATA
const CLUB_DATA = {
  finance: { budget: 210000, spent: 197000, revenue: 220000, kpi: 0.94, risk: "yellow", trend: [0.95, 0.97, 0.96, 0.94] },
  sponsorship: { secured: 8, lost: 1, pipeline: 3, goal: 10, risk: "green", trend: [6, 8, 8, 9] },
  retention: { rate: 87, last: 82, goal: 90, risk: "green", trend: [80, 82, 84, 87] },
  pipeline: { u12: 39, u14: 35, u16: 27, senior: 14, risk: "yellow" },
  staff: [
    { name: "Ana", cert: "FIBA Youth", expires: "2025-04-30", risk: "green" },
    { name: "Luka", cert: "First Aid", expires: "2024-07-01", risk: "red" },
    { name: "Ivan", cert: "Pro License", expires: "2026-11-15", risk: "green" }
  ]
};

const RISK_COLORS = { green: "#27ef7d", yellow: "#FFD700", red: "#e94057" };
const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const ClubHealthDashboard = () => {
  const sectionRef = useRef();
  const [showAllStaff, setShowAllStaff] = useState(false);

  // Calculations
  const staffExpiring = CLUB_DATA.staff.filter(s => s.risk === "red").length;

  // Export PDF
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `ClubHealthDashboard_${new Date().toISOString().slice(0, 10)}`
  });

  // Boardroom summary
  const summaryAlerts = [
    CLUB_DATA.finance.risk === "red" && "Critical: Club is over budget. Act now.",
    CLUB_DATA.sponsorship.risk === "red" && "Sponsor pipeline in red—activate new deals.",
    CLUB_DATA.retention.risk === "red" && "Retention crisis: review onboarding/exit process.",
    CLUB_DATA.pipeline.risk === "red" && "Player pipeline is too narrow—expand recruitment.",
    staffExpiring > 0 && `Staff alert: ${staffExpiring} certifications expiring!`
  ].filter(Boolean);

  // Player pipeline chart data
  const pipelineData = [
    { stage: "U12", count: CLUB_DATA.pipeline.u12 },
    { stage: "U14", count: CLUB_DATA.pipeline.u14 },
    { stage: "U16", count: CLUB_DATA.pipeline.u16 },
    { stage: "Senior", count: CLUB_DATA.pipeline.senior }
  ];

  return (
    <div style={{ width: "100%", maxWidth: 1080, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
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
        <div style={{ fontSize: 29, color: "#FFD700", fontWeight: 700, marginBottom: 18 }}>
          Club Health & Sustainability Dashboard
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 28 }}>
          {/* Finance KPI */}
          <div style={{ flex: 1, minWidth: 230, background: "#fff1", borderRadius: 14, padding: 17, boxShadow: "0 2px 10px #FFD70011" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <FaEuroSign style={{ color: "#FFD700", fontSize: 28 }} />
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 19 }}>Finance</div>
              <span style={{
                marginLeft: "auto", fontWeight: 700, color: RISK_COLORS[CLUB_DATA.finance.risk],
                fontSize: 17, background: "#fff4", borderRadius: 6, padding: "2px 8px"
              }}>{CLUB_DATA.finance.risk.toUpperCase()}</span>
            </div>
            <div style={{ color: "#FFD700cc", fontWeight: 600, marginTop: 6 }}>
              Budget: €{CLUB_DATA.finance.budget.toLocaleString()}<br />
              Spent: €{CLUB_DATA.finance.spent.toLocaleString()}<br />
              Revenue: €{CLUB_DATA.finance.revenue.toLocaleString()}
            </div>
            <div style={{ marginTop: 5, color: "#FFD700bb", fontSize: 15 }}>
              Budget Use: <b>{Math.round(CLUB_DATA.finance.kpi * 100)}%</b>
            </div>
            <ResponsiveContainer width="100%" height={55}>
              <LineChart data={CLUB_DATA.finance.trend.map((kpi, i) => ({ period: `Q${i + 1}`, value: kpi * 100 }))}>
                <XAxis dataKey="period" tick={false} />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="#27ef7d" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Sponsorship KPI */}
          <div style={{ flex: 1, minWidth: 230, background: "#fff1", borderRadius: 14, padding: 17, boxShadow: "0 2px 10px #FFD70011" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <FaAward style={{ color: "#48b5ff", fontSize: 28 }} />
              <div style={{ fontWeight: 700, color: "#48b5ff", fontSize: 19 }}>Sponsorship</div>
              <span style={{
                marginLeft: "auto", fontWeight: 700, color: RISK_COLORS[CLUB_DATA.sponsorship.risk],
                fontSize: 17, background: "#fff4", borderRadius: 6, padding: "2px 8px"
              }}>{CLUB_DATA.sponsorship.risk.toUpperCase()}</span>
            </div>
            <div style={{ color: "#FFD700cc", fontWeight: 600, marginTop: 6 }}>
              Secured: <b>{CLUB_DATA.sponsorship.secured}</b><br />
              Pipeline: <b>{CLUB_DATA.sponsorship.pipeline}</b><br />
              Goal: <b>{CLUB_DATA.sponsorship.goal}</b>
            </div>
            <ResponsiveContainer width="100%" height={55}>
              <LineChart data={CLUB_DATA.sponsorship.trend.map((n, i) => ({ period: `Q${i + 1}`, value: n }))}>
                <XAxis dataKey="period" tick={false} />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="#48b5ff" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Retention KPI */}
          <div style={{ flex: 1, minWidth: 230, background: "#fff1", borderRadius: 14, padding: 17, boxShadow: "0 2px 10px #FFD70011" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <FaUsers style={{ color: "#27ef7d", fontSize: 28 }} />
              <div style={{ fontWeight: 700, color: "#27ef7d", fontSize: 19 }}>Retention</div>
              <span style={{
                marginLeft: "auto", fontWeight: 700, color: RISK_COLORS[CLUB_DATA.retention.risk],
                fontSize: 17, background: "#fff4", borderRadius: 6, padding: "2px 8px"
              }}>{CLUB_DATA.retention.risk.toUpperCase()}</span>
            </div>
            <div style={{ color: "#FFD700cc", fontWeight: 600, marginTop: 6 }}>
              Rate: <b>{CLUB_DATA.retention.rate}%</b><br />
              Last Year: <b>{CLUB_DATA.retention.last}%</b><br />
              Goal: <b>{CLUB_DATA.retention.goal}%</b>
            </div>
            <ResponsiveContainer width="100%" height={55}>
              <LineChart data={CLUB_DATA.retention.trend.map((v, i) => ({ period: `Y${i + 1}`, value: v }))}>
                <XAxis dataKey="period" tick={false} />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="#27ef7d" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#FFD700", marginBottom: 10 }}>
            Player Pipeline
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FFD700" barSize={40}>
                {pipelineData.map((entry, index) => (
                  <Cell key={index} fill={index % 2 === 0 ? "#FFD700" : "#27ef7d"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Certification Overview */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#FFD700", marginBottom: 10 }}>
            Staff Certification Tracker
          </div>
          <table style={{ width: "100%", background: "#FFD70009", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ background: "#222", color: "#FFD700" }}>
              <tr>
                <th>Staff Member</th>
                <th>Certification</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CLUB_DATA.staff.map((staff, index) => (
                <tr key={index} style={{
                  color: staff.risk === "green" ? "#27ef7d"
                    : staff.risk === "yellow" ? "#FFD700"
                    : "#e94057",
                  fontWeight: 600,
                  background: index % 2 === 0 ? "#fff1" : "#fff0"
                }}>
                  <td>{staff.name}</td>
                  <td>{staff.cert}</td>
                  <td>{staff.expires}</td>
                  <td>{staff.risk === "green" ? <FaCheckCircle /> : staff.risk === "yellow" ? <FaExclamationTriangle /> : <FaTimesCircle />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary of Alerts */}
        <div style={{ marginTop: 20, fontSize: 17, color: "#FFD700" }}>
          <div><b>Summary of Actions:</b></div>
          {summaryAlerts.length > 0
            ? summaryAlerts.map((alert, idx) => (
              <div key={idx} style={{ marginBottom: 8, color: "#e94057" }}>
                <FaBell style={{ marginRight: 8 }} /> {alert}
              </div>
            ))
            : <div style={{ color: "#27ef7d" }}>No critical actions needed!</div>}
        </div>
      </motion.section>
    </div>
  );
};

export default ClubHealthDashboard;
