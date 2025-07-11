import React, { useState } from "react";
import { FaCalendarAlt, FaUserFriends, FaBalanceScale, FaExclamationTriangle, FaArrowRight, FaChartPie, FaRobot, FaFileExport, FaHandHoldingHeart, FaUsersCog } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// DEMO DATA
const demoSquads = [
  { id: 1, name: "U12 Boys", players: [
    { name: "Ante", dob: "2013-01-15" },
    { name: "Luka", dob: "2013-03-22" },
    { name: "Mate", dob: "2013-05-09" },
    { name: "Ivan", dob: "2013-10-10" },
    { name: "Marko", dob: "2013-12-01" },
    { name: "Nikola", dob: "2013-07-04" },
    { name: "Jakov", dob: "2013-09-12" },
    { name: "Karlo", dob: "2013-02-14" },
    { name: "Filip", dob: "2013-06-26" },
    { name: "David", dob: "2013-11-30" },
    { name: "Toni", dob: "2013-12-22" },
    { name: "Josip", dob: "2013-04-08" },
  ]},
  { id: 2, name: "U16 Boys", players: [
    { name: "Filip", dob: "2009-01-08" },
    { name: "Dario", dob: "2009-05-21" },
    { name: "Mario", dob: "2009-10-17" },
    { name: "Ivan", dob: "2009-07-11" },
    { name: "Dominik", dob: "2009-09-02" },
    { name: "Leon", dob: "2009-12-28" },
    { name: "Borna", dob: "2009-03-13" },
    { name: "Noa", dob: "2009-06-04" },
    { name: "Antonio", dob: "2009-08-16" },
    { name: "Tin", dob: "2009-11-07" },
  ]},
];

function birthQuarter(date) {
  const m = new Date(date).getMonth() + 1;
  if (m >= 1 && m <= 3) return "Q1";
  if (m >= 4 && m <= 6) return "Q2";
  if (m >= 7 && m <= 9) return "Q3";
  return "Q4";
}

function getDistribution(players) {
  const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  players.forEach(p => quarters[birthQuarter(p.dob)]++);
  return quarters;
}

function calcRAEScore(dist) {
  // Perfect: 25/25/25/25; more skew = lower score
  const values = Object.values(dist);
  const avg = values.reduce((a, b) => a + b, 0) / 4;
  const maxDev = Math.max(...values.map(v => Math.abs(v - avg)));
  let score = Math.max(100 - maxDev * 13, 40);
  if (score > 98) score = 100;
  return Math.round(score);
}

function getEquityAlert(score) {
  if (score >= 90) return { color: "#1de682", msg: "Excellent equity" };
  if (score >= 75) return { color: "#FFD700", msg: "Mild bias, watch selection" };
  return { color: "#FF4848", msg: "High RAE risk! Review process" };
}

// SVG Pie Chart
function QuarterPie({ quarters }) {
  const colors = { Q1: "#FFD700", Q2: "#1de682", Q3: "#3f8cfa", Q4: "#FF4848" };
  const total = Object.values(quarters).reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <svg width={130} height={130} viewBox="0 0 32 32">
      {Object.entries(quarters).map(([q, n], i) => {
        const start = acc / total * 2 * Math.PI;
        acc += n;
        const end = acc / total * 2 * Math.PI;
        const x1 = 16 + 16 * Math.sin(start), y1 = 16 - 16 * Math.cos(start);
        const x2 = 16 + 16 * Math.sin(end), y2 = 16 - 16 * Math.cos(end);
        const largeArc = end - start > Math.PI ? 1 : 0;
        return (
          <path key={q}
            d={`M16,16 L${x1},${y1} A16,16 0 ${largeArc} 1 ${x2},${y2} Z`}
            fill={colors[q]} stroke="#283E51" strokeWidth={0.5} />
        );
      })}
      <circle cx={16} cy={16} r={7} fill="#181e23" />
      <text x={16} y={17} fill="#fff" fontSize={4.7} fontWeight="bold" textAnchor="middle">{total}</text>
    </svg>
  );
}

export default function RelativeAgeEffectAnalyzer() {
  const [squad, setSquad] = useState(demoSquads[0]);
  const quarters = getDistribution(squad.players);
  const raeScore = calcRAEScore(quarters);
  const equity = getEquityAlert(raeScore);
  const [showSim, setShowSim] = useState(false);
  const [simQ, setSimQ] = useState({ Q1: 3, Q2: 3, Q3: 3, Q4: 3 });
  const [showExport, setShowExport] = useState(false);

  // Simulate "What if" adjustment
  function simulateScenario() {
    setShowSim(true);
  }
  function applySimulation() {
    setShowSim(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #212c3a 0%, #283E51 100%)", color: "#fff", fontFamily: "Segoe UI,sans-serif" }}>
      {/* Pulse Banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 19, padding: "23px 32px 14px 32px", background: "#181e23", boxShadow: "0 1px 14px #FFD70025" }}>
        <FaBalanceScale style={{ fontSize: 31, color: equity.color }} />
        <span style={{ fontSize: 23, fontWeight: 900, color: equity.color, letterSpacing: 1 }}>Relative Age Effect & Equity Analyzer</span>
        <span style={{ background: equity.color, color: "#181e23", fontWeight: 900, borderRadius: 7, padding: "7px 22px" }}>
          {equity.msg} · RAE Score: {raeScore}
        </span>
        {raeScore < 80 && <span style={{ color: "#FF4848", fontWeight: 900, marginLeft: 15 }}><FaExclamationTriangle /> Bias Risk Detected</span>}
      </div>
      {/* Squad Selector & Main */}
      <div style={{ display: "flex", alignItems: "center", gap: 17, padding: "19px 34px 0 34px" }}>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Squad:</span>
        <select value={squad.id} onChange={e => setSquad(demoSquads.find(s => s.id == e.target.value))} style={{ fontWeight: 900, padding: "8px 18px", borderRadius: 10 }}>
          {demoSquads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={simulateScenario}><FaRobot /> Run “What If” Scenario</Button>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={() => setShowExport(true)}><FaFileExport style={{ marginRight: 7 }} />Export Report</Button>
      </div>
      {/* Charts + Data */}
      <div style={{ display: "flex", gap: 40, padding: "26px 38px 0 38px" }}>
        <div style={{ background: "#232b39", borderRadius: 17, padding: "20px 30px", minWidth: 320 }}>
          <b style={{ color: "#FFD700", fontSize: 18 }}><FaChartPie style={{ marginRight: 6 }} /> Birth Quarter Distribution</b>
          <QuarterPie quarters={quarters} />
          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 9 }}>
            {Object.entries(quarters).map(([q, n]) =>
              <span key={q} style={{ color: q === "Q1" ? "#FFD700" : q === "Q2" ? "#1de682" : q === "Q3" ? "#3f8cfa" : "#FF4848", fontWeight: 900 }}>
                {q}: {n}
              </span>
            )}
          </div>
          <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 700, textAlign: "center" }}>
            Squad size: {squad.players.length}
          </div>
        </div>
        {/* Table */}
        <div style={{ flex: 2 }}>
          <b style={{ color: "#FFD700", fontSize: 17 }}><FaUserFriends style={{ marginRight: 6 }} /> Squad Roster</b>
          <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 7 }}>
            <thead>
              <tr>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "7px 3px" }}>Name</th>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "7px 3px" }}>DOB</th>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "7px 3px" }}>Quarter</th>
              </tr>
            </thead>
            <tbody>
              {squad.players.map((p, i) =>
                <tr key={i}>
                  <td style={{ color: "#FFD700", fontWeight: 900, padding: "7px 3px" }}>{p.name}</td>
                  <td style={{ color: "#fff", fontWeight: 800, padding: "7px 3px" }}>{p.dob}</td>
                  <td style={{ color: birthQuarter(p.dob) === "Q1" ? "#FFD700" : birthQuarter(p.dob) === "Q2" ? "#1de682" : birthQuarter(p.dob) === "Q3" ? "#3f8cfa" : "#FF4848", fontWeight: 900, padding: "7px 3px" }}>{birthQuarter(p.dob)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Simulate What If */}
      <AnimatePresence>
        {showSim && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            style={{
              position: "fixed", top: 70, left: 0, right: 0, margin: "auto", width: 440, zIndex: 222,
              background: "#232b39", color: "#FFD700", borderRadius: 20, boxShadow: "0 4px 44px #FFD70044", padding: 30
            }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700", marginBottom: 12 }}>What If… Squad Selection</div>
            <b style={{ color: "#FFD700" }}>Manually Adjust Quarter Distribution</b>
            <div style={{ display: "flex", gap: 8, margin: "18px 0" }}>
              {["Q1", "Q2", "Q3", "Q4"].map(q =>
                <div key={q}>
                  <span style={{ color: q === "Q1" ? "#FFD700" : q === "Q2" ? "#1de682" : q === "Q3" ? "#3f8cfa" : "#FF4848", fontWeight: 900 }}>{q}</span>
                  <input type="number" min={0} max={15} value={simQ[q]} onChange={e => setSimQ({ ...simQ, [q]: Number(e.target.value) })}
                    style={{ borderRadius: 8, padding: 5, width: 44, fontWeight: 900, marginLeft: 3 }} />
                </div>
              )}
            </div>
            <div style={{ marginTop: 9 }}>
              <b>Simulated RAE Score: <span style={{ color: getEquityAlert(calcRAEScore(simQ)).color }}>{calcRAEScore(simQ)}</span></b>
              <span style={{ marginLeft: 11, color: getEquityAlert(calcRAEScore(simQ)).color }}>{getEquityAlert(calcRAEScore(simQ)).msg}</span>
            </div>
            <Button style={{ background: "#1de682", color: "#181e23", marginTop: 17 }} onClick={() => setShowSim(false)}>Close</Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Export Notification */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", top: 50, right: 50, zIndex: 120, background: "#232b39", color: "#FFD700", padding: 19, borderRadius: 12, boxShadow: "0 3px 18px #FFD70088", fontWeight: 900
            }}>
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (PDF/Excel available soon)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Button helper
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "12px 20px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}
