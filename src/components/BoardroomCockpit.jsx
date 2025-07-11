import React, { useRef, useState } from "react";
import {
  FaEuroSign, FaChartBar, FaUserTie, FaClipboardCheck, FaRobot, FaCheckCircle, FaExclamationTriangle,
   FaBullseye, FaCalendarAlt, FaSignature, FaArrowRight, FaUsers, FaBasketballBall, FaFilePdf, 
   FaTasks, FaPlus, FaChevronRight, FaRegSmile, FaRegFrown, FaHeart, FaMedal, FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, 
    Bar, YAxis, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- DEMO DATA ---
const DATA = {
  sponsorship: {
    margin: 27500,
    overdue: 1,
    topPartner: "Nike",
    pipeline: [
      { sponsor: "Nike", value: 25000 },
      { sponsor: "Telekom", value: 15000 },
      { sponsor: "NextGen", value: 9000 }
    ],
    marginTrend: [24000, 25000, 26500, 25500, 27500]
  },
  periodization: {
    phase: "In-Season",
    load: 67,
    nextRisk: "Playoff Push",
    highRisk: true,
    timeline: [
      { phase: "Pre-Season", load: 88 },
      { phase: "In-Season", load: 67 },
      { phase: "Playoff", load: 81 },
      { phase: "Post-Season", load: 37 }
    ]
  },
  performance: {
    injuries: 2,
    trend: [7, 8, 9, 8, 10, 8],
    playerDev: 3,
    wellness: 8.3,
    mood: 8.1,
    health: 93,
    playerRadar: [
      { metric: "Tactics", value: 8.9 },
      { metric: "Physical", value: 9.2 },
      { metric: "Skill", value: 8.7 },
      { metric: "Mental", value: 8.3 },
      { metric: "Recovery", value: 7.7 }
    ]
  },
  governance: {
    overdueReviews: 2,
    compliance: 96,
    flagged: 1,
    rolling: [88, 90, 94, 92, 96]
  },
  boardActions: [
    { action: "Sign Nike renewal", assigned: "President", due: "2025-06-21", status: "Due", icon: <FaSignature />, color: "#FFD700" },
    { action: "Approve Playoff Load Plan", assigned: "TD", due: "2025-06-23", status: "Upcoming", icon: <FaChartBar />, color: "#1de682" },
    { action: "Review Injury Report", assigned: "Med Staff", due: "2025-06-22", status: "Due", icon: <FaHeart />, color: "#F87171" },
    { action: "Board Compliance Sign-Off", assigned: "Board", due: "2025-07-01", status: "Upcoming", icon: <FaClipboardCheck />, color: "#00B4D8" }
  ],
  ai: {
    nextBest: [
      "Assign extra digital asset to Nike, upsell margin by +12%",
      "Prep board session on playoff periodization—AI flags +9% risk",
      "Escalate overdue review: board signature block needed",
      "AI: Move player wellness module up board agenda"
    ],
    mood: [
      { mood: "Good", score: 8.1, icon: <FaRegSmile style={{color:"#1de682"}}/> },
      { mood: "Risk", score: 6.3, icon: <FaRegFrown style={{color:"#FFD700"}}/> }
    ]
  },
  scenarioWall: [
    {
      title: "Nike renews at +15%",
      impact: "+€3,700 margin, extra digital activation load.",
      board: "Assign digital assets, prep board signature.",
      risk: 2, opportunity: 5
    },
    {
      title: "Compress pre-season",
      impact: "-11% conditioning, +4% injury, 1 extra friendly.",
      board: "Assign performance staff, monitor wellness.",
      risk: 7, opportunity: 3
    }
  ]
};

// --- PDF EXPORT ---
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
    pdf.text("BOARDROOM COCKPIT", 105, 76, { align: "center" });
    pdf.setFontSize(13);
    pdf.setTextColor(29,230,130);
    pdf.text("Elite 360° Boardroom Intelligence", 105, 93, { align: "center" });
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
    pdf.text("Actions:", 30, 110);
    pdf.rect(30,113,150,30);
    pdf.save("CourtEvoVero_Boardroom.pdf");
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

// --- BOARD ACTIONS ASSIGNMENT ---
function QuickAssignFAB({ onClick }) {
  return (
    <button
      className="fixed bottom-8 right-8 z-50 bg-[#1de682] text-[#232a2e] px-6 py-4 font-extrabold rounded-full shadow-lg flex items-center gap-2 border-2 border-[#FFD700] text-lg hover:bg-[#FFD700] hover:text-[#1de682]"
      onClick={onClick}
      style={{ boxShadow: "0 4px 24px #1de68299", fontSize: 14 }}
      title="Quick Assign Board Action"
    >
      <FaPlus /> Quick Assign
    </button>
  );
}

// --- MAIN ---
export default function BoardroomCockpit() {
  const dashboardRef = useRef(null);
  const [scenarioWall, setScenarioWall] = useState(DATA.scenarioWall);
  const [actions, setActions] = useState(DATA.boardActions);
  const [assignModal, setAssignModal] = useState(false);
  const [aiNBX, setAiNBX] = useState(0);

  // Rotate AI Next Best Action
  React.useEffect(() => {
    const t = setInterval(() => setAiNBX(x => (x+1)%DATA.ai.nextBest.length), 9000);
    return () => clearInterval(t);
  }, []);

  // Global Club Mood Score
  const clubMood = DATA.performance.mood > 7.5 ? "Excellent" : DATA.performance.mood > 6 ? "Stable" : "Alert";
  const clubMoodColor = clubMood === "Excellent" ? "#1de682" : clubMood === "Stable" ? "#FFD700" : "#F87171";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #232a2e 0%, #181e23 100%)",
      fontFamily: "Segoe UI, sans-serif",
      padding: 32,
      position: "relative"
    }}>
      <BoardPDFExportButton dashboardRef={dashboardRef} />
      <QuickAssignFAB onClick={() => setAssignModal(true)} />
      {/* Assign Modal */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.26 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <div className="bg-[#181e23] border-4 border-[#FFD700] rounded-3xl shadow-2xl p-7 w-full max-w-lg relative">
              <button className="absolute top-4 right-8 text-[#FFD700] text-3xl" onClick={() => setAssignModal(false)}><FaTimes /></button>
              <div className="text-2xl font-extrabold text-[#FFD700] mb-2 flex items-center gap-2"><FaClipboardCheck /> Quick Assign Action</div>
              <input className="w-full rounded p-3 mb-3 bg-[#232a2e] text-white border border-[#1de682]" placeholder="Action (e.g. Approve NPS Plan)" />
              <input className="w-full rounded p-3 mb-3 bg-[#232a2e] text-white border border-[#1de682]" placeholder="Assign to (owner/role)" />
              <input className="w-full rounded p-3 mb-3 bg-[#232a2e] text-white border border-[#1de682]" type="date" />
              <button className="bg-[#FFD700] text-[#232a2e] font-bold px-4 py-2 rounded hover:bg-[#1de682] w-full text-lg">
                <FaCheckCircle className="inline mr-2" /> Assign
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={dashboardRef}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ fontWeight: 900, fontSize: 44, color: "#FFD700", marginBottom: 3, letterSpacing: 1.5 }}>
            <FaBullseye style={{ color: "#1de682", fontSize: 39, marginRight: 18 }} />
            BOARDROOM COCKPIT
          </div>
          <div style={{ color: "#FFD700cc", fontWeight: 700, fontSize: 21, marginBottom: 12 }}>Elite 360° Club Intelligence • Board-Ready • No Excuses</div>
        </motion.div>
        {/* Global Mood / Health / NPS */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.11 }}
          style={{
            display: "flex", gap: 22, alignItems: "center", marginBottom: 20, flexWrap: "wrap"
          }}>
          <div style={{
            background: "rgba(40,62,81,0.95)", borderRadius: 21, border: "3px solid #FFD700",
            boxShadow: "0 2px 18px #FFD70022", padding: "22px 34px", minWidth: 230, display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{ fontWeight: 800, fontSize: 19, color: "#FFD700" }}><FaRegSmile style={{ marginRight: 8 }} /> Club Mood</div>
            <div style={{ fontSize: 31, fontWeight: 900, color: clubMoodColor }}>{clubMood} <span style={{ fontSize: 21, color: "#FFD700", marginLeft: 7 }}>{DATA.performance.mood}/10</span></div>
            <div style={{ color: "#FFD700a8", fontWeight: 600, fontSize: 13, marginTop: 6 }}>Global player/coach NPS mood</div>
          </div>
          <div style={{
            background: "rgba(40,62,81,0.95)", borderRadius: 21, border: "3px solid #1de682",
            boxShadow: "0 2px 18px #1de68222", padding: "22px 34px", minWidth: 230, display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{ fontWeight: 800, fontSize: 19, color: "#1de682" }}><FaHeart style={{ marginRight: 8 }} /> Club Health</div>
            <div style={{ fontSize: 31, fontWeight: 900, color: "#FFD700" }}>{DATA.performance.health}%</div>
            <div style={{ color: "#FFD700a8", fontWeight: 600, fontSize: 13, marginTop: 6 }}>Roster available, injuries, absences</div>
          </div>
          <div style={{
            background: "rgba(40,62,81,0.95)", borderRadius: 21, border: "3px solid #A3E635",
            boxShadow: "0 2px 18px #A3E63522", padding: "22px 34px", minWidth: 230, display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{ fontWeight: 800, fontSize: 19, color: "#A3E635" }}><FaMedal style={{ marginRight: 8 }} /> Team NPS</div>
            <div style={{ fontSize: 31, fontWeight: 900, color: "#1de682" }}>{DATA.performance.wellness}/10</div>
            <div style={{ color: "#FFD700a8", fontWeight: 600, fontSize: 13, marginTop: 6 }}>Performance, wellness, satisfaction</div>
          </div>
          {/* AI Next Best Action */}
          <div style={{
            background: "rgba(40,62,81,0.98)", borderRadius: 21, border: "3px solid #00B4D8",
            boxShadow: "0 2px 18px #00B4D822", padding: "22px 34px", minWidth: 330, maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{ fontWeight: 800, fontSize: 19, color: "#00B4D8" }}><FaRobot style={{ marginRight: 8 }} /> AI Next Best Action</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#FFD700", margin: "14px 0" }}>{DATA.ai.nextBest[aiNBX]}</div>
            <div style={{ color: "#FFD700a8", fontWeight: 600, fontSize: 13 }}>AI Concierge for board action</div>
          </div>
        </motion.div>

        {/* KPI Glass Wall */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.16 }}
          style={{ display: "flex", gap: 26, flexWrap: "wrap", marginBottom: 29 }}
        >
          {/* Sponsorship Trend */}
          <div style={{
            background: "linear-gradient(135deg,#FFD70018 0%,#232a2e77 100%)",
            border: "3px solid #FFD700",
            borderRadius: 22,
            boxShadow: "0 2px 16px #FFD70019",
            padding: "26px 32px", minWidth: 235, flex: 1, maxWidth: 290
          }}>
            <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 17, marginBottom: 8, display: "flex", alignItems: "center" }}>
              <FaEuroSign style={{ marginRight: 8 }} /> Margin Trend
            </div>
            <ResponsiveContainer width="100%" height={36}>
              <LineChart data={DATA.sponsorship.marginTrend.map((v, i) => ({ x: i+1, y: v }))}>
                <XAxis dataKey="x" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="y" stroke="#FFD700" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: "#FFD700bb", marginTop: 5 }}>Sponsor margin last 5 periods</div>
          </div>
          {/* Rolling Compliance */}
          <div style={{
            background: "linear-gradient(135deg,#00B4D818 0%,#232a2e77 100%)",
            border: "3px solid #00B4D8",
            borderRadius: 22,
            boxShadow: "0 2px 16px #00B4D819",
            padding: "26px 32px", minWidth: 235, flex: 1, maxWidth: 290
          }}>
            <div style={{ color: "#00B4D8", fontWeight: 800, fontSize: 17, marginBottom: 8, display: "flex", alignItems: "center" }}>
              <FaClipboardCheck style={{ marginRight: 8 }} /> Compliance Wheel
            </div>
            <ResponsiveContainer width="100%" height={36}>
              <LineChart data={DATA.governance.rolling.map((v,i)=>({x:i+1, y:v}))}>
                <XAxis dataKey="x" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="y" stroke="#00B4D8" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: "#FFD700bb", marginTop: 5 }}>Compliance % last 5 cycles</div>
          </div>
          {/* Player Radar */}
          <div style={{
            background: "linear-gradient(135deg,#A3E63518 0%,#232a2e77 100%)",
            border: "3px solid #A3E635",
            borderRadius: 22,
            boxShadow: "0 2px 16px #A3E63519",
            padding: "26px 32px", minWidth: 235, flex: 1, maxWidth: 320
          }}>
            <div style={{ color: "#A3E635", fontWeight: 800, fontSize: 17, marginBottom: 8, display: "flex", alignItems: "center" }}>
              <FaBasketballBall style={{ marginRight: 8 }} /> Player Development Radar
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <RadarChart outerRadius={35} width={150} height={100} data={DATA.performance.playerRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" stroke="#FFD700" fontSize={11} />
                <Radar name="Player" dataKey="value" stroke="#1de682" fill="#1de68299" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: "#FFD700bb", marginTop: 5 }}>Skill, tactical, physical, mental, recovery</div>
          </div>
        </motion.div>

        {/* Board Actions Table */}
        <motion.div
          initial={{ opacity: 0, y: 13 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.19 }}
          style={{
            background: "#232a2e", borderRadius: 21, border: "2.5px solid #FFD700",
            boxShadow: "0 2px 12px #FFD70012", padding: 23, marginBottom: 24
          }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700", marginBottom: 7 }}>
            <FaTasks style={{ color: "#1de682", fontSize: 25, marginRight: 13 }} />
            Boardroom Actions & Assignments
          </div>
          <table style={{ width: "100%", fontSize: 15, borderRadius: 9, overflow: "hidden" }}>
            <thead>
              <tr style={{ color: "#FFD700" }}>
                <th align="left" style={{ padding: "6px 9px" }}>Action</th>
                <th align="left" style={{ padding: "6px 9px" }}>Assigned</th>
                <th align="left" style={{ padding: "6px 9px" }}>Due</th>
                <th align="left" style={{ padding: "6px 9px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #FFD70022" }}>
                  <td style={{ color: a.color, fontWeight: 900, padding: "8px 9px", display: "flex", alignItems: "center" }}>{a.icon}&nbsp;{a.action}</td>
                  <td style={{ color: "#FFD700", fontWeight: 700, padding: "8px 9px" }}>{a.assigned}</td>
                  <td style={{ color: "#A3E635", padding: "8px 9px" }}>{a.due}</td>
                  <td style={{ color: a.status === "Due" ? "#FFD700" : "#1de682", fontWeight: 800, padding: "8px 9px" }}>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Interactive Timeline & Scenario Wall */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))", gap: 28, marginBottom: 36 }}
        >
          {/* Timeline */}
          <div style={{
            background: "#232a2e", borderRadius: 18, padding: 23, border: "2.5px solid #1de682", minWidth: 320, boxShadow: "0 2px 12px #1de68212"
          }}>
            <div style={{ color: "#1de682", fontWeight: 900, fontSize: 17, marginBottom: 7 }}>
              <FaCalendarAlt style={{ marginRight: 8 }} /> Periodization Timeline
            </div>
            <ResponsiveContainer width="100%" height={70}>
              <LineChart data={DATA.periodization.timeline}>
                <XAxis dataKey="phase" tick={{ fill: "#FFD700" }} />
                <YAxis domain={[0,100]} hide />
                <Tooltip />
                <Line type="monotone" dataKey="load" stroke="#FFD700" strokeWidth={4} dot={{ r: 4, fill: "#1de682" }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13, marginTop: 5 }}>
              Training load across phases—click for risk/decision.
            </div>
          </div>
          {/* Scenario Wall */}
          <div style={{
            background: "#232a2e", borderRadius: 18, padding: 23, border: "2.5px solid #FFD700", minWidth: 320, boxShadow: "0 2px 12px #FFD70012"
          }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#FFD700", marginBottom: 7 }}>
              <FaRobot style={{ color: "#1de682", fontSize: 21, marginRight: 9 }} />
              Scenario Wall / Heatmap
            </div>
            <div style={{ display: "flex", gap: 17, flexDirection: "column" }}>
              {scenarioWall.map((sc, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.025 }}
                  style={{
                    background: "#181e23",
                    border: "2px solid #FFD70044",
                    borderRadius: 13,
                    padding: "14px 11px",
                    boxShadow: "0 1px 8px #FFD70016",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 16
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 15 }}>{sc.title}</div>
                    <div style={{ color: "#FFD700cc", fontWeight: 700, fontSize: 13 }}>{sc.impact}</div>
                    <div style={{ color: "#1de682", fontWeight: 600, fontSize: 13 }}>
                      <FaClipboardCheck style={{ marginRight: 5 }} /> {sc.board}
                    </div>
                  </div>
                  {/* Risk/Opportunity mini heatmap */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ fontWeight: 900, color: "#F87171", fontSize: 17 }}>Risk: {sc.risk}</div>
                    <div style={{ fontWeight: 900, color: "#1de682", fontSize: 17 }}>Opp: {sc.opportunity}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <div style={{ marginTop: 26, color: "#FFD700a0", fontSize: 15, textAlign: "center", fontWeight: 600 }}>
        <FaBullseye style={{ marginRight: 7, color: "#1de682" }} />
        CourtEvo Vero Boardroom Cockpit: Where elite decisions are made—faster, smarter, boardroom-proven.<br />
        Every metric is actionable. Every risk is visual. No excuses, only next steps.
      </div>
    </div>
  );
}
