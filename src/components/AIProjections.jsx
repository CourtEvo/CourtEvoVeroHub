import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaCogs, FaEuroSign, FaUsers, FaAward, FaFileExport } from "react-icons/fa";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { useReactToPrint } from "react-to-print";

// DEMO: initial club KPIs
const BASE = {
  players: 110,
  retention: 0.89,
  sponsorship: 8,
  staff: 7,
  budget: 220000,
  pipeline: 35,
  trophies: 1
};

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const years = [1, 3, 5];

// Simple projection formulas for demo
function project(base, changes, y) {
  const { retention, sponsorship, staff, budget, pipeline } = changes;
  return {
    year: `${y}y`,
    players: Math.round(base.players * Math.pow(1 + (retention - 0.89), y)),
    budget: Math.round(base.budget * Math.pow(1 + (budget - 220000) / 220000, y)),
    sponsorships: Math.round(base.sponsorship + (sponsorship - 8) * y),
    staff: Math.round(base.staff + (staff - 7) * y),
    pipeline: Math.round(base.pipeline * Math.pow(1 + (pipeline - 35) / 35, y)),
    trophies: Math.max(0, Math.round(base.trophies * (1 + 0.06 * (sponsorship - 8) + 0.05 * (retention - 0.89)) * y))
  };
}

const AIProjections = () => {
  const [levers, setLevers] = useState({
    retention: 0.89, // %
    sponsorship: 8,  // count
    staff: 7,
    budget: 220000,
    pipeline: 35
  });
  const sectionRef = useRef();

  // Calculate projections
  const projection = years.map(y => project(BASE, levers, y));

  // For radar chart: compare 1y/3y/5y to base (as %)
  const radarData = [
    { kpi: "Players", "1y": projection[0].players, "3y": projection[1].players, "5y": projection[2].players },
    { kpi: "Budget", "1y": projection[0].budget, "3y": projection[1].budget, "5y": projection[2].budget },
    { kpi: "Sponsorships", "1y": projection[0].sponsorships, "3y": projection[1].sponsorships, "5y": projection[2].sponsorships },
    { kpi: "Pipeline", "1y": projection[0].pipeline, "3y": projection[1].pipeline, "5y": projection[2].pipeline },
    { kpi: "Staff", "1y": projection[0].staff, "3y": projection[1].staff, "5y": projection[2].staff }
  ];

  // Summary string
  function summary() {
    const risk =
      levers.retention < 0.85
        ? "ALERT: Risk of decline—retention too low!"
        : levers.sponsorship < 6
        ? "Sponsor pipeline weak—risk for next cycle."
        : levers.budget < 180000
        ? "Budget at critical level. Review cost base."
        : "On track for sustainable growth.";
    return risk;
  }

  // Export PDF
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `AIProjections_${new Date().toISOString().slice(0, 10)}`
  });

  return (
    <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 27, color: "#FFD700", fontWeight: 700, marginBottom: 15, display: "flex", alignItems: "center", gap: 10 }}>
          <FaChartLine /> AI-Driven Future Projections
          <button onClick={handlePrint} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "7px 18px", marginLeft: "auto" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} /> Export PDF
          </button>
        </div>
        {/* Input levers */}
        <div style={{ display: "flex", gap: 23, flexWrap: "wrap", marginBottom: 26 }}>
          <div style={{ background: "#232344", borderRadius: 14, padding: 16, flex: 1, minWidth: 240 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 9 }}><FaCogs /> Scenario Levers</div>
            <label>Retention (%): <input type="number" step="0.01" min={0.75} max={0.98}
              value={levers.retention} onChange={e => setLevers(l => ({ ...l, retention: Number(e.target.value) }))}
              style={{ width: 55, borderRadius: 5, fontSize: 15, marginLeft: 5 }} /></label><br />
            <label>Sponsorships: <input type="number" min={2} max={15}
              value={levers.sponsorship} onChange={e => setLevers(l => ({ ...l, sponsorship: Number(e.target.value) }))}
              style={{ width: 55, borderRadius: 5, fontSize: 15, marginLeft: 5 }} /></label><br />
            <label>Staff: <input type="number" min={2} max={18}
              value={levers.staff} onChange={e => setLevers(l => ({ ...l, staff: Number(e.target.value) }))}
              style={{ width: 55, borderRadius: 5, fontSize: 15, marginLeft: 5 }} /></label><br />
            <label>Budget (€): <input type="number" step="1000" min={120000} max={300000}
              value={levers.budget} onChange={e => setLevers(l => ({ ...l, budget: Number(e.target.value) }))}
              style={{ width: 85, borderRadius: 5, fontSize: 15, marginLeft: 5 }} /></label><br />
            <label>Player Pipeline: <input type="number" min={15} max={60}
              value={levers.pipeline} onChange={e => setLevers(l => ({ ...l, pipeline: Number(e.target.value) }))}
              style={{ width: 55, borderRadius: 5, fontSize: 15, marginLeft: 5 }} /></label>
          </div>
          {/* Projections table */}
          <div style={{ background: "#232344", borderRadius: 14, padding: 16, flex: 2, minWidth: 300 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 8 }}><FaChartLine /> KPI Projections (1/3/5y)</div>
            <table style={{ width: "100%", fontSize: 16, background: "#FFD70009", borderRadius: 8 }}>
              <thead style={{ background: "#222", color: "#FFD700" }}>
                <tr>
                  <th>KPI</th>
                  <th>Base</th>
                  <th>1 Year</th>
                  <th>3 Years</th>
                  <th>5 Years</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Players</td>
                  <td>{BASE.players}</td>
                  {projection.map(p => <td key={p.year}>{p.players}</td>)}
                </tr>
                <tr>
                  <td>Budget (€)</td>
                  <td>{BASE.budget}</td>
                  {projection.map(p => <td key={p.year}>{p.budget}</td>)}
                </tr>
                <tr>
                  <td>Sponsorships</td>
                  <td>{BASE.sponsorship}</td>
                  {projection.map(p => <td key={p.year}>{p.sponsorships}</td>)}
                </tr>
                <tr>
                  <td>Staff</td>
                  <td>{BASE.staff}</td>
                  {projection.map(p => <td key={p.year}>{p.staff}</td>)}
                </tr>
                <tr>
                  <td>Pipeline</td>
                  <td>{BASE.pipeline}</td>
                  {projection.map(p => <td key={p.year}>{p.pipeline}</td>)}
                </tr>
                <tr>
                  <td>Trophies</td>
                  <td>{BASE.trophies}</td>
                  {projection.map(p => <td key={p.year}>{p.trophies}</td>)}
                </tr>
              </tbody>
            </table>
            <div style={{ color: "#FFD700bb", fontWeight: 700, marginTop: 9 }}>
              <b>Boardroom Summary:</b> {summary()}
            </div>
          </div>
        </div>
        {/* Chart area */}
        <div style={{ display: "flex", gap: 24, marginBottom: 15 }}>
          {/* Line Chart: Player numbers over time */}
          <div style={{ background: "#232344", borderRadius: 14, padding: 13, flex: 2, minWidth: 310 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, marginBottom: 5 }}>Projected Players Over Time</div>
            <ResponsiveContainer width="100%" height={165}>
              <LineChart data={projection}>
                <XAxis dataKey="year" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Line type="monotone" dataKey="players" stroke="#FFD700" strokeWidth={3} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Radar Chart: KPIs at 1/3/5y */}
          <div style={{ background: "#232344", borderRadius: 14, padding: 13, flex: 2, minWidth: 310 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, marginBottom: 5 }}>KPI Radar: 1/3/5y</div>
            <ResponsiveContainer width="100%" height={170}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="kpi" stroke="#FFD700" fontSize={14} />
                <Radar name="1y" dataKey="1y" stroke="#27ef7d" fill="#27ef7d" fillOpacity={0.19} />
                <Radar name="3y" dataKey="3y" stroke="#FFD700" fill="#FFD700" fillOpacity={0.13} />
                <Radar name="5y" dataKey="5y" stroke="#e94057" fill="#e94057" fillOpacity={0.11} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ color: "#FFD700bb", fontWeight: 600 }}>
          <b>Tip:</b> Tweak any lever for “what if” planning—download for board, club, or sponsor meetings.
        </div>
      </motion.section>
    </div>
  );
};

export default AIProjections;
