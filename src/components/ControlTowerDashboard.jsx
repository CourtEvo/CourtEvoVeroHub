import React, { useState } from 'react';
import { FaBell, FaChartLine, FaTrophy, FaUsers, FaExclamationTriangle, FaUserTie, FaRobot, FaMoneyBillWave, FaCheck, FaCalendarAlt } from 'react-icons/fa';

const initialWidgets = [
  {
    title: 'Live KPIs',
    value: '87%',
    trend: '+2%',
    description: 'Club-wide key metric (training attendance, compliance, engagement).',
    icon: <FaChartLine style={{ color: "#FFD700", fontSize: 25 }} />,
    color: '#283E51',
  },
  {
    title: 'Revenue YTD',
    value: '€250,000',
    trend: '+8%',
    description: 'Year-to-date income from sponsorships, tickets, and programs.',
    icon: <FaMoneyBillWave style={{ color: "#27ef7d", fontSize: 25 }} />,
    color: '#283E51',
  },
  {
    title: 'Player Wellness',
    value: '93%',
    trend: '+1%',
    description: 'Current player readiness and injury risk (weekly pulse survey).',
    icon: <FaUsers style={{ color: "#00B4D8", fontSize: 25 }} />,
    color: '#283E51',
  },
  {
    title: 'Coach CPD Completion',
    value: '72%',
    trend: '+5%',
    description: 'Percentage of staff with updated CPD requirements.',
    icon: <FaUserTie style={{ color: "#f39c12", fontSize: 25 }} />,
    color: '#283E51',
  },
  {
    title: 'Risk Alerts',
    value: '2',
    trend: '',
    description: 'Unresolved high-priority risks.',
    icon: <FaExclamationTriangle style={{ color: "#e94057", fontSize: 25 }} />,
    color: '#283E51',
  },
];

const initialAlerts = [
  {
    time: 'Now',
    type: 'Risk',
    text: 'Potential compliance issue: contract renewal overdue for 1st team coach.',
    icon: <FaExclamationTriangle color="#e94057" style={{ marginRight: 7 }} />,
    action: 'Review',
  },
  {
    time: 'Today',
    type: 'Performance',
    text: 'S&C screening flagged 2 players for possible overload.',
    icon: <FaUsers color="#FFD700" style={{ marginRight: 7 }} />,
    action: 'Open Player Wellness',
  },
  {
    time: 'Yesterday',
    type: 'Finance',
    text: 'Budget utilization at 97% for Q2—requires director approval.',
    icon: <FaMoneyBillWave color="#27ef7d" style={{ marginRight: 7 }} />,
    action: 'Check Budget',
  },
];

const aiNextActions = [
  { label: "Schedule urgent board review", description: "Board action: review contract, approve new sponsor agreement." },
  { label: "Auto-notify parent group", description: "Send club updates and reminders for upcoming wellness days." },
  { label: "Recommend microcycle adjustments", description: "Reduce U16 load, add recovery for U18 squad." },
  { label: "Start compliance review", description: "AI-driven: flag missing staff certifications, prep instant report." }
];

const strategicEvents = [
  { date: "2025-06-20", event: "Board meeting: Season Review", status: "Upcoming" },
  { date: "2025-06-18", event: "Sponsor contract negotiation", status: "Pending" },
  { date: "2025-06-14", event: "U18 player development audit", status: "Done" }
];

export default function ControlTowerDashboard() {
  const [widgets] = useState(initialWidgets);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [aiActions] = useState(aiNextActions);
  const [events] = useState(strategicEvents);
  const [filterType, setFilterType] = useState("All");

  const filteredAlerts = filterType === "All"
    ? alerts
    : alerts.filter(a => a.type === filterType);

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: 28,
      background: 'rgba(40,62,81,0.95)',
      borderRadius: 24,
      boxShadow: "0 6px 42px #283E5144"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 31, fontWeight: 800, color: "#FFD700", letterSpacing: 1.5, marginBottom: 0 }}>
          CONTROL TOWER
        </h2>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>
          Mission Control – Live Club Oversight
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 25, marginBottom: 25, flexWrap: 'wrap' }}>
        {widgets.map((w, idx) => (
          <div
            key={w.title}
            style={{
              background: w.color,
              minWidth: 198,
              padding: '24px 26px',
              borderRadius: 16,
              color: '#fff',
              boxShadow: "0 2px 18px #FFD70022",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              position: 'relative',
              flex: '1 0 180px'
            }}
          >
            <span style={{ fontSize: 21, fontWeight: 700, color: "#FFD700", display: 'flex', alignItems: 'center' }}>
              {w.icon}
              <span style={{ marginLeft: 12 }}>{w.title}</span>
            </span>
            <span style={{ fontSize: 32, fontWeight: 800, margin: "12px 0 4px 0", letterSpacing: 2 }}>{w.value}</span>
            <span style={{ fontWeight: 700, color: w.trend.startsWith('+') ? "#27ef7d" : "#e94057", fontSize: 15 }}>
              {w.trend ? (w.trend.startsWith('+') ? "▲" : "▼") + w.trend : ""}
            </span>
            <span style={{ color: '#FFD700aa', fontSize: 13, marginTop: 7 }}>{w.description}</span>
          </div>
        ))}
      </div>

      {/* Alerts & Next Actions */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 18, flexWrap: 'wrap' }}>
        {/* Alerts */}
        <div style={{ flex: 2, background: "#232E3B", borderRadius: 18, padding: 22, minWidth: 270, minHeight: 240 }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: "#FFD700", marginBottom: 5, letterSpacing: 0.7 }}>
            <FaBell style={{ marginRight: 8, fontSize: 21 }} />
            Real-Time Alerts
          </div>
          <div style={{ marginBottom: 11 }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ padding: '5px 13px', borderRadius: 7, fontWeight: 700, fontSize: 14 }}>
              <option>All</option>
              <option>Risk</option>
              <option>Performance</option>
              <option>Finance</option>
            </select>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredAlerts.length === 0 && <li style={{ color: '#FFD70077' }}>No active alerts</li>}
            {filteredAlerts.map((alert, idx) => (
              <li key={idx} style={{
                marginBottom: 13,
                borderLeft: `5px solid ${alert.type === "Risk" ? "#e94057" : alert.type === "Finance" ? "#27ef7d" : "#FFD700"}`,
                background: "#19232E",
                padding: "12px 16px",
                borderRadius: 9,
                color: '#fff'
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{alert.icon}{alert.text}</span>
                <div style={{ fontSize: 13, color: "#FFD700bb", marginTop: 3 }}>{alert.time} • <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{alert.type}</span></div>
                <button style={{
                  background: "#FFD700",
                  color: "#222",
                  border: "none",
                  borderRadius: 7,
                  padding: "4px 13px",
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 13,
                  marginTop: 6
                }}>
                  {alert.action}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Next AI Actions */}
        <div style={{ flex: 1, background: "#202D36", borderRadius: 18, padding: 22, minWidth: 240 }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: "#27ef7d", marginBottom: 7, letterSpacing: 0.7 }}>
            <FaRobot style={{ marginRight: 8, fontSize: 21 }} />
            AI Next Actions
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {aiActions.map((a, i) => (
              <li key={a.label} style={{
                marginBottom: 12,
                borderLeft: "4px solid #27ef7d",
                background: "#283E51",
                borderRadius: 8,
                padding: "10px 12px"
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{a.label}</span>
                <div style={{ color: "#FFD700aa", fontSize: 13 }}>{a.description}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Calendar Events */}
      <div style={{ background: "#233445", borderRadius: 16, padding: 22, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#FFD700", marginBottom: 5, letterSpacing: 0.6 }}>
          <FaCalendarAlt style={{ marginRight: 7 }} />
          Strategic Events & Deadlines
        </div>
        <table style={{ width: "100%", borderSpacing: 0, fontSize: 15, marginTop: 9 }}>
          <thead>
            <tr style={{ color: "#FFD700", fontWeight: 700 }}>
              <th style={{ padding: "8px 8px" }}>Date</th>
              <th style={{ padding: "8px 8px" }}>Event</th>
              <th style={{ padding: "8px 8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.date + e.event} style={{ background: "#19232E", color: "#fff" }}>
                <td style={{ padding: "7px 8px" }}>{e.date}</td>
                <td style={{ padding: "7px 8px" }}>{e.event}</td>
                <td style={{ padding: "7px 8px", color: e.status === "Done" ? "#27ef7d" : "#FFD700" }}>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
