import React, { useState, useRef } from "react";
import {
  FaBasketballBall, FaBolt, FaExclamationTriangle, FaClipboardCheck, FaBullseye, 
  FaRobot, FaChartLine, FaUserTie, FaCheckCircle, FaSignature, FaFilePdf, 
  FaPlus, FaCalendarAlt, FaRegCommentDots, FaListAlt, FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ----------- DATA -----------
const PERIODS = [
  { phase: "Pre-Season", start: "2025-08-01", end: "2025-09-14", load: 85, risk: "High", alert: "Monitor for fatigue. Emphasize injury prevention.", color: "#FFD700" },
  { phase: "In-Season", start: "2025-09-15", end: "2026-03-30", load: 65, risk: "Medium", alert: "Balance skill/tactics with recovery windows.", color: "#1de682" },
  { phase: "Playoff Push", start: "2026-04-01", end: "2026-05-15", load: 80, risk: "High", alert: "Shortened recovery, high stress. AI: Assign mental coach." , color: "#F87171"},
  { phase: "Post-Season", start: "2026-05-16", end: "2026-06-30", load: 40, risk: "Low", alert: "Plan exit interviews, promote active rest.", color: "#A3E635" }
];

// Example scenario templates for coaching/boardroom
const SCENARIOS = [
  {
    scenario: "Shorten Pre-Season by 2 Weeks",
    impact: "-12% base conditioning, +5% injury risk, earlier team chemistry issues",
    breakdown: [
      { metric: "Conditioning", value: "-12%", type: "Risk" },
      { metric: "Injury Risk", value: "+5%", type: "Risk" },
      { metric: "Season Start", value: "Earlier", type: "Opportunity" }
    ],
    boardAlert: "Alert: Assign sports science review, flag for coaching staff."
  },
  {
    scenario: "Increase U18 Team Practices to 6/wk",
    impact: "+9% skill acquisition, +8% burnout risk, staff overload",
    breakdown: [
      { metric: "Skill Acquisition", value: "+9%", type: "Opportunity" },
      { metric: "Burnout Risk", value: "+8%", type: "Risk" },
      { metric: "Staff Workload", value: "+3h/wk", type: "Risk" }
    ],
    boardAlert: "AI: Monitor wellness and load with weekly survey."
  },
  {
    scenario: "Add In-Season Recovery Block",
    impact: "-10% muscle soreness, +2% tactical drop-off",
    breakdown: [
      { metric: "Injury Risk", value: "-5%", type: "Opportunity" },
      { metric: "Tactical Quality", value: "-2%", type: "Risk" }
    ],
    boardAlert: "Best practice: Assign to Performance Lead and medical."
  },
  {
    scenario: "Double Playoff Video Sessions",
    impact: "+7% tactical efficiency, -2% physical workload, +0.5h/wk staff",
    breakdown: [
      { metric: "Tactical Efficiency", value: "+7%", type: "Opportunity" },
      { metric: "Physical Load", value: "-2%", type: "Opportunity" },
      { metric: "Staff Time", value: "+0.5h/wk", type: "Risk" }
    ],
    boardAlert: "Assign to Video Analyst; monitor sleep/fatigue."
  }
];

// Risk Color Mapping
const riskColor = risk =>
  risk === "High" ? "#F87171" : risk === "Medium" ? "#FFD700" : "#1de682";
const breakdownColor = type =>
  type === "Opportunity" ? "#1de682" : "#FFD700";

// ---- BOARD EXPORT ----
function BoardPDFExportButton({ dashboardRef }) {
  const isExporting = useRef(false);
  const handleExport = async () => {
    if (!dashboardRef.current || isExporting.current) return;
    isExporting.current = true;
    const input = dashboardRef.current;
    window.scrollTo({ top: 0, behavior: "auto" });
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.setFillColor(35, 42, 46);
    pdf.rect(0, 0, 210, 297, "F");
    pdf.setTextColor(255, 215, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(30);
    pdf.text("CourtEvo Vero", 105, 52, { align: "center" });
    pdf.setFontSize(19);
    pdf.text("Periodization Cockpit Board Report", 105, 76, { align: "center" });
    pdf.setFontSize(13);
    pdf.setTextColor(29,230,130);
    pdf.text("Elite Basketball Intelligence", 105, 93, { align: "center" });
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text("Generated " + new Date().toLocaleString(), 105, 105, { align: "center" });
    pdf.setDrawColor(255, 215, 0);
    pdf.setFontSize(50);
    pdf.setTextColor(255,215,0, 0.08);
    pdf.text("COURTEVO VERO", 105, 200, { align: "center", opacity: 0.10 });
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 5, 8, pdfWidth-10, pdfHeight-20, undefined, "FAST");
    pdf.addPage();
    pdf.setTextColor(255, 215, 0);
    pdf.setFontSize(20);
    pdf.text("Board Sign-Off", 105, 30, { align: "center" });
    pdf.setDrawColor(255,215,0);
    pdf.line(25,60,185,60);
    pdf.text("Board Member:", 30, 50);
    pdf.text("Signature:", 30, 70);
    pdf.line(70,68,170,68);
    pdf.text("Date:", 30, 90);
    pdf.line(45,88,90,88);
    pdf.setFontSize(12);
    pdf.setTextColor(160,160,160);
    pdf.text("Comments/Actions:", 30, 110);
    pdf.rect(30,113,150,30);
    pdf.save("CourtEvoVero_Periodization_Boardroom.pdf");
    isExporting.current = false;
  };
  return (
    <button
      className="fixed top-4 right-6 z-50 bg-[#FFD700] text-[#232a2e] px-5 py-2 font-bold rounded-xl shadow flex items-center gap-2 hover:bg-[#1de682] border-2 border-[#1de682]"
      onClick={handleExport}
      style={{ boxShadow: "0 2px 12px #FFD70055" }}
    >
      <FaFilePdf /> Board Export (PDF)
    </button>
  );
}

// ---- PERIOD/ASSIGNMENT MODAL ----
function PeriodModal({ period, onClose }) {
  const [assigned, setAssigned] = useState(false);
  if (!period) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70">
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ duration: 0.25 }}
        className="w-full max-w-lg bg-[#181e23] p-8 rounded-2xl shadow-2xl border-4 border-[#FFD700] relative flex flex-col"
      >
        <button className="absolute top-4 right-8 text-[#FFD700] text-3xl" onClick={onClose}><FaTimes /></button>
        <div className="mb-2 flex gap-2 items-center">
          <FaBasketballBall className="text-[#FFD700] text-xl" />
          <span className="text-2xl font-extrabold text-[#FFD700]">{period.phase}</span>
        </div>
        <div className="mb-2 text-white font-bold">Start: <span className="text-[#FFD700]">{period.start}</span> &nbsp; | &nbsp; End: <span className="text-[#FFD700]">{period.end}</span></div>
        <div className="mb-2 text-white font-bold">Load: <span className="text-[#FFD700]">{period.load}%</span> &nbsp; | &nbsp; Risk: <span style={{ color: riskColor(period.risk), fontWeight: 700 }}>{period.risk}</span></div>
        <div className="mb-2 text-xs text-[#FFD700]">{period.alert}</div>
        <div className="mt-3 flex gap-3">
          <button className={`px-4 py-2 rounded font-bold bg-[#FFD700] text-[#232a2e] ${assigned ? "opacity-60" : ""}`} disabled={assigned} onClick={() => setAssigned(true)}>
            <FaClipboardCheck className="inline mr-2" /> {assigned ? "Assigned" : "Assign To Coach/Staff"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---- MAIN COMPONENT ----
export default function PeriodizationCockpit() {
  const [periods] = useState(PERIODS);
  const [modal, setModal] = useState(null);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [customScenario, setCustomScenario] = useState("");
  const [customImpact, setCustomImpact] = useState("");
  const [customBoardAlert, setCustomBoardAlert] = useState("");
  const [savedScenarios, setSavedScenarios] = useState([]);
  const dashboardRef = useRef(null);

  // Timeline Data (for chart)
  const timelineData = periods.map((p, idx) => ({
    phase: p.phase,
    load: p.load,
    risk: p.risk,
    idx
  }));

  // Pie data for load distribution
  const pieData = periods.map(p => ({
    name: p.phase, value: p.load, color: p.color
  }));

  // Save scenario
  const saveScenario = () => {
    if (!scenario && !customScenario) return;
    setSavedScenarios([
      ...savedScenarios,
      {
        id: Date.now(),
        scenario: scenario ? scenario.scenario : customScenario,
        impact: scenario ? scenario.impact : customImpact,
        boardAlert: scenario ? scenario.boardAlert : customBoardAlert,
        time: new Date().toLocaleString()
      }
    ]);
    setCustomScenario(""); setCustomImpact(""); setCustomBoardAlert("");
  };

  return (
    <div style={{
      minHeight: "100vh", padding: 30, background: "linear-gradient(135deg, #232a2e 0%, #181e23 100%)",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      {/* Sticky Export */}
      <BoardPDFExportButton dashboardRef={dashboardRef} />
      <div ref={dashboardRef}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 2, color: "#FFD700", marginRight: 26 }}>
            <FaBasketballBall style={{ marginRight: 13, fontSize: 34, color: "#1de682" }} />
            Periodization Cockpit
          </div>
          <div style={{
            marginLeft: "auto", display: "flex", gap: 11
          }}>
            <button onClick={() => setScenario(SCENARIOS[0])} style={{
              background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 10,
              padding: "10px 22px", fontSize: 17, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px #FFD70033", border: "none"
            }}>
              <FaRobot /> Run Scenario/AI
            </button>
          </div>
        </div>

        {/* Narrative AI Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(90deg, #FFD70020 0%, #232a2e 100%)",
            padding: 18, borderRadius: 13, marginBottom: 19,
            display: "flex", alignItems: "center", gap: 17, boxShadow: "0 3px 13px #FFD70017"
          }}>
          <FaBullseye style={{ color: "#1de682", fontSize: 25 }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#FFD700" }}>
            Boardroom AI: {periods.some(p => p.risk === "High") ? "High-risk period detected. Review recovery and injury plans." : "All periods within optimal load."}
          </span>
          <span style={{ marginLeft: "auto", color: "#FFD700bb", fontWeight: 600, fontSize: 16 }}>
            Current Phase: <span style={{ color: "#1de682" }}>{periods[1].phase}</span>
          </span>
        </motion.div>

        {/* Timeline Chart */}
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 20, border: "2px solid #FFD700", marginBottom: 20 }}>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>
            Load Timeline (Click phase for details)
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={timelineData}>
              <XAxis dataKey="phase" tick={{ fill: "#FFD700" }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#1de682" }} />
              <Tooltip />
              <Line type="monotone" dataKey="load" stroke="#FFD700" strokeWidth={4} dot={{ r: 6, fill: "#1de682" }} activeDot={{ onClick: (_, idx) => setModal(periods[idx]) }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13 }}>
            Weekly/phase load for all key periods (pre-season, in-season, playoffs, post-season)
          </div>
        </div>

        {/* Pie Load Distribution */}
        <div style={{ display: "flex", gap: 21, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{
            background: "#232a2e", borderRadius: 13, padding: 20, flex: 1,
            border: "2px solid #1de682", minWidth: 250
          }}>
            <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>Load Distribution</div>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label>
                  {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13 }}>Share of load by period/phase</div>
          </div>
          {/* Risk Table */}
          <div style={{
            background: "#232a2e", borderRadius: 13, padding: 20, flex: 1,
            border: "2px solid #FFD700", minWidth: 300
          }}>
            <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>Risk Alerts</div>
            <table style={{ width: "100%", fontSize: 15 }}>
              <thead>
                <tr style={{ color: "#FFD700", fontWeight: 700 }}>
                  <th align="left">Phase</th>
                  <th align="left">Risk</th>
                  <th align="left">AI Alert</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(p => (
                  <tr key={p.phase}>
                    <td style={{ color: "#FFD700", fontWeight: 800 }}>{p.phase}</td>
                    <td style={{ color: riskColor(p.risk), fontWeight: 700 }}>{p.risk}</td>
                    <td style={{ color: "#fff" }}>{p.alert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Board Scenario AI */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          <div style={{
            background: "#222d38", borderRadius: 15, padding: 24, marginBottom: 18,
            boxShadow: "0 2px 10px #FFD70017"
          }}>
            <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 8, display: "flex", alignItems: "center" }}>
              <FaRobot style={{ marginRight: 10 }} />
              Periodization What-If Scenarios (AI)
            </div>
            {/* Scenario Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(285px,1fr))",
              gap: 19, marginBottom: 16
            }}>
              {SCENARIOS.map(sc => (
                <motion.div
                  key={sc.scenario}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setScenario(sc)}
                  style={{
                    background: "#232E3B",
                    borderRadius: 13,
                    padding: "17px 16px",
                    minHeight: 99,
                    cursor: "pointer",
                    boxShadow: scenario && scenario.scenario === sc.scenario ? "0 2px 18px #FFD70055" : "0 2px 8px #232e3b66",
                    border: scenario && scenario.scenario === sc.scenario ? "3px solid #FFD700" : "2px solid #FFD70033"
                  }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#FFD700", marginBottom: 3 }}>
                    <FaRobot style={{ marginRight: 6, fontSize: 19 }} />
                    {sc.scenario}
                  </div>
                  <div style={{ color: "#27ef7d", fontWeight: 800, fontSize: 14, margin: "4px 0" }}>{sc.impact}</div>
                  {/* Breakdown Table */}
                  <table style={{ width: "100%", background: "#232E3B", borderRadius: 7, marginTop: 8, marginBottom: 5 }}>
                    <tbody>
                      {sc.breakdown.map((b, idx) =>
                        <tr key={b.metric + idx}>
                          <td style={{ padding: "4px 8px", fontWeight: 600 }}>{b.metric}</td>
                          <td style={{ padding: "4px 8px", color: "#FFD700" }}>{b.value}</td>
                          <td style={{ padding: "4px 8px", color: breakdownColor(b.type) }}>{b.type}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div style={{ color: "#27ef7d", fontWeight: 700, background: "#181e23", borderRadius: 7, padding: "9px 14px", fontSize: 15, marginTop: 5 }}>
                    <FaBullseye style={{ marginRight: 8 }} /> {sc.boardAlert}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Custom Scenario Builder */}
            <div style={{ background: "#202D36", borderRadius: 13, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, color: "#A3E635", fontSize: 17, marginBottom: 8 }}>
                <FaClipboardCheck style={{ marginRight: 7 }} />
                Build your own scenario:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  placeholder="Scenario (e.g. Extra video analysis, compress off-season)"
                  value={customScenario}
                  onChange={e => setCustomScenario(e.target.value)}
                  style={{
                    padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 180, fontSize: 15, flex: 2
                  }}
                />
                <input
                  placeholder="Impact (e.g. +5% fatigue, -3% skill)"
                  value={customImpact}
                  onChange={e => setCustomImpact(e.target.value)}
                  style={{
                    padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 120, fontSize: 15, flex: 2
                  }}
                />
                <input
                  placeholder="Board Alert/AI"
                  value={customBoardAlert}
                  onChange={e => setCustomBoardAlert(e.target.value)}
                  style={{
                    padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 160, fontSize: 15, flex: 3
                  }}
                />
                <button
                  onClick={saveScenario}
                  style={{
                    background: "#FFD700", color: "#222", border: "none", borderRadius: 7,
                    padding: "8px 22px", fontWeight: 900, fontSize: 16, cursor: "pointer"
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            {/* Saved Scenarios */}
            {savedScenarios.length > 0 && (
              <div style={{ marginTop: 18, background: "#232d38", borderRadius: 12, padding: 17 }}>
                <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18, marginBottom: 7, display: "flex", alignItems: "center" }}>
                  <FaListAlt style={{ marginRight: 8 }} />
                  Saved Scenarios
                </div>
                <table style={{ width: "100%", fontSize: 15, borderRadius: 5 }}>
                  <thead>
                    <tr style={{ color: "#FFD700" }}>
                      <th align="left" style={{ padding: "2px 7px" }}>Time</th>
                      <th align="left" style={{ padding: "2px 7px" }}>Scenario</th>
                      <th align="left" style={{ padding: "2px 7px" }}>Impact</th>
                      <th align="left" style={{ padding: "2px 7px" }}>AI/Board</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedScenarios.map(s => (
                      <tr key={s.id}>
                        <td style={{ padding: "2px 7px" }}>{s.time}</td>
                        <td style={{ padding: "2px 7px" }}>{s.scenario}</td>
                        <td style={{ padding: "2px 7px" }}>{s.impact}</td>
                        <td style={{ padding: "2px 7px" }}>{s.boardAlert}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Guidance */}
        <div style={{ marginTop: 28, color: "#FFD700a0", fontSize: 14, textAlign: "center" }}>
          <FaExclamationTriangle style={{ marginRight: 6 }} />
          100% Basketball—All sensitive periods, training windows, and scenarios are mapped for elite decision-making. Click any period/phase or AI scenario for detail, assignment, or export.
        </div>

        {/* Modal for Period Deep-Dive */}
        <AnimatePresence>
          {modal && <PeriodModal period={modal} onClose={() => setModal(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
