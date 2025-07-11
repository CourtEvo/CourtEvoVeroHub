import React, { useState, useRef } from "react";
import {
  FaEuroSign, FaChartBar, FaRobot, FaExclamationTriangle, FaClipboardCheck, FaPlus, FaUserTie, FaSignature, FaBullseye, FaBell, FaListAlt, FaCheckCircle, FaTimes, FaCalendarAlt, FaArrowRight, FaChevronDown, FaChevronRight, FaFilePdf, FaRegCommentDots
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// -------- DATA ---------
const SECTORS = [
  { key: "pipeline",    label: "Deal Pipeline",     icon: <FaChartBar color="#FFD700" /> },
  { key: "activation",  label: "Activation & NPS",  icon: <FaClipboardCheck color="#1de682" /> },
  { key: "compliance",  label: "Compliance/Legal",  icon: <FaSignature color="#A3E635" /> },
  { key: "board",       label: "Board Actions",     icon: <FaUserTie color="#00B4D8" /> },
  { key: "scenario",    label: "Scenario AI",       icon: <FaRobot color="#FFD700" /> }
];

const DEALS = [
  {
    sponsor: "Nike",
    value: 25000,
    margin: 18000,
    pipeline: "Renewal",
    status: "Active",
    risk: "Low",
    nps: 9,
    expiring: false,
    legal: "Signed",
    board: "Approved",
    signature: true,
    activations: [
      { name: "Jersey Branding", status: "Completed", nps: 8, due: "2025-03-01" },
      { name: "Social Campaign", status: "In Progress", nps: 9, due: "2025-08-01" }
    ],
    feedback: [
      { month: "Jan", score: 8 }, { month: "Feb", score: 8 }, { month: "Mar", score: 9 }, { month: "Apr", score: 9 }, { month: "May", score: 10 }
    ],
    accountOwner: "M. Proleta",
    notes: "Expect upsell if digital activation succeeds.",
    lastBoardAlert: "AI: Digital campaign underperforming vs. Q1.",
    comments: [
      { author: "Board", text: "Excellent upsell opportunity for Q3.", time: "2025-05-03 10:08" }
    ]
  },
  {
    sponsor: "Telekom",
    value: 15000,
    margin: 9500,
    pipeline: "Active",
    status: "Active",
    risk: "Medium",
    nps: 7,
    expiring: true,
    legal: "Review",
    board: "Pending",
    signature: false,
    activations: [
      { name: "Court Signage", status: "Completed", nps: 7, due: "2025-01-20" },
      { name: "Youth Clinic", status: "In Progress", nps: 6, due: "2025-06-10" }
    ],
    feedback: [
      { month: "Jan", score: 7 }, { month: "Feb", score: 6 }, { month: "Mar", score: 7 }, { month: "Apr", score: 7 }, { month: "May", score: 6 }
    ],
    accountOwner: "D. Peric",
    notes: "Critical audit: activation proof needed.",
    lastBoardAlert: "Board: Urgent legal review. Overdue deliverables flagged.",
    comments: [
      { author: "Legal", text: "Board must finalize contract before month end.", time: "2025-05-09 18:43" }
    ]
  }
];

const SCENARIOS = [
  {
    scenario: "Nike renews at +15% margin",
    impact: "+€2,700 margin, boosts board confidence, extra activation needed",
    breakdown: [
      { metric: "Revenue", value: "+€3,750", type: "Opportunity" },
      { metric: "Activation Load", value: "+1 event", type: "Risk" }
    ],
    boardAlert: "AI: Assign new digital asset to Marketing for delivery."
  },
  {
    scenario: "Telekom fails to renew",
    impact: "-€15,000 revenue, -€9,500 margin, risk to youth programs",
    breakdown: [
      { metric: "Revenue Gap", value: "-€15,000", type: "Risk" },
      { metric: "Youth Impact", value: "-8% program budget", type: "Risk" }
    ],
    boardAlert: "Escalate: Board to approve contingency sponsor search."
  },
  {
    scenario: "Both sponsors upsell digital assets",
    impact: "+€8,500 new revenue, +6% NPS boost, more staff workload",
    breakdown: [
      { metric: "Digital Revenue", value: "+€8,500", type: "Opportunity" },
      { metric: "Staff Load", value: "+4h/wk", type: "Risk" }
    ],
    boardAlert: "AI: Assign HR to monitor staff burnout risk."
  }
];

const npsColor = score =>
  score >= 9 ? "#1de682" : score >= 7 ? "#FFD700" : "#F87171";
const statusColor = status =>
  status === "Completed" ? "#1de682" : status === "In Progress" ? "#FFD700" : "#F87171";

// --- BOARDROOM EXPORT ---
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
    pdf.text("Sponsorship Boardroom Report", 105, 76, { align: "center" });
    pdf.setFontSize(13);
    pdf.setTextColor(29,230,130);
    pdf.text("Elite Commercial Intelligence", 105, 93, { align: "center" });
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

// --- DEAL ROOM MODAL ---
function DealRoom({ deal, onClose }) {
  const [tab, setTab] = useState("analytics");
  const [signed, setSigned] = useState(deal.signature);
  const [comment, setComment] = useState("");
  if (!deal) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 animate-fade-in">
      <motion.div
        initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 70, opacity: 0 }} transition={{ duration: 0.27 }}
        className="w-full max-w-2xl bg-[#181e23] p-7 rounded-3xl shadow-2xl border-4 border-[#FFD700] relative flex flex-col"
      >
        <button className="absolute top-4 right-8 text-[#FFD700] text-3xl" onClick={onClose}><FaTimes /></button>
        <div className="mb-2 flex gap-2 items-center">
          <span className="text-2xl font-extrabold text-[#FFD700]">{deal.sponsor}</span>
          <span className="ml-2 text-[#1de682] text-md">Owner: {deal.accountOwner}</span>
        </div>
        <div className="mb-4 flex gap-2">
          <button onClick={() => setTab("analytics")} className={`px-4 py-2 rounded font-bold ${tab === "analytics" ? "bg-[#1de682] text-[#232a2e]" : "bg-[#FFD70022] text-[#FFD700]"}`}>Analytics</button>
          <button onClick={() => setTab("actions")} className={`px-4 py-2 rounded font-bold ${tab === "actions" ? "bg-[#FFD700] text-[#232a2e]" : "bg-[#FFD70022] text-[#FFD700]"}`}>Board Actions</button>
          <button onClick={() => setTab("comments")} className={`px-4 py-2 rounded font-bold ${tab === "comments" ? "bg-[#00B4D8] text-white" : "bg-[#FFD70022] text-[#FFD700]"}`}>Comments</button>
        </div>
        {tab === "analytics" && (
          <div>
            <div className="flex gap-7 mb-4">
              <div className="bg-[#232a2e] rounded-xl p-4 border-2 border-[#FFD700] flex-1">
                <div className="font-bold text-[#FFD700]">Margin</div>
                <div className="text-2xl font-bold text-[#1de682]">€{deal.margin.toLocaleString()}</div>
              </div>
              <div className="bg-[#232a2e] rounded-xl p-4 border-2 border-[#1de682] flex-1">
                <div className="font-bold text-[#FFD700]">NPS</div>
                <div className="text-2xl font-bold" style={{ color: npsColor(deal.nps) }}>{deal.nps}</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-bold text-[#FFD700] mb-2">Activations</div>
              <table className="w-full text-white text-sm">
                <thead>
                  <tr>
                    <th align="left">Name</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.activations.map((a, idx) => (
                    <tr key={a.name + idx}>
                      <td className="font-bold">{a.name}</td>
                      <td style={{ color: statusColor(a.status), fontWeight: 600 }}>{a.status}</td>
                      <td className="text-[#FFD700]">{a.due}</td>
                      <td style={{ color: npsColor(a.nps), fontWeight: 700 }}>{a.nps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-[#FFD700]">{deal.notes}</div>
          </div>
        )}
        {tab === "actions" && (
          <div>
            <div className="font-bold text-[#FFD700] mb-2">Legal / Board Status</div>
            <div className="flex gap-4 mb-2 items-center">
              <span className="text-[#FFD700] font-bold">Legal: </span>
              <span className={deal.legal === "Signed" ? "text-[#1de682]" : "text-[#FFD700]"}>{deal.legal}</span>
              <span className="ml-6 text-[#FFD700] font-bold">Board: </span>
              <span className={deal.board === "Approved" ? "text-[#1de682]" : "text-[#FFD700]"}>{deal.board}</span>
            </div>
            <div className="mb-4">
              <span className="text-[#FFD700] font-bold">Board Signature:</span>
              {signed
                ? <span className="ml-2 text-[#1de682] font-bold">Signed <FaCheckCircle className="inline text-lg" /></span>
                : <button className="ml-2 bg-[#FFD700] text-[#232a2e] px-2 py-1 rounded font-bold" onClick={() => setSigned(true)}>Sign</button>}
            </div>
            <div className="font-bold text-[#FFD700] mb-2">AI/Boardroom Alert</div>
            <div className="bg-[#181e23] border-l-4 border-[#FFD700] rounded-xl p-3 mb-3 text-[#FFD700]">{deal.lastBoardAlert}</div>
          </div>
        )}
        {tab === "comments" && (
          <div>
            <div className="font-bold text-[#FFD700] mb-2">Board Comments</div>
            <ul>
              {deal.comments.map((c, i) => (
                <li key={i} className="mb-2 bg-[#232a2e] rounded-xl px-3 py-2 text-[#FFD700] flex gap-3 items-center">
                  <FaRegCommentDots />
                  <span className="font-bold">{c.author}</span>
                  <span className="ml-2 text-[#fff]">{c.text}</span>
                  <span className="ml-auto text-xs text-[#1de682]">{c.time}</span>
                </li>
              ))}
            </ul>
            <div className="flex mt-3 gap-2">
              <input
                className="flex-1 rounded px-2 py-1 bg-[#181e23] text-white border border-[#FFD700]"
                placeholder="Add comment (as Board)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button
                className="bg-[#FFD700] text-[#232a2e] font-bold px-4 py-2 rounded hover:bg-[#1de682]"
                onClick={() => {
                  if (comment.trim()) {
                    deal.comments.push({ author: "Board", text: comment, time: new Date().toLocaleString() });
                    setComment("");
                  }
                }}
              >Add</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ---------- MAIN COMPONENT ----------
export default function SponsorshipActivationDashboard() {
  // UI State
  const [sector, setSector] = useState("pipeline");
  const [deals, setDeals] = useState(DEALS);
  const [dealRoom, setDealRoom] = useState(null);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [customScenario, setCustomScenario] = useState("");
  const [customImpact, setCustomImpact] = useState("");
  const [customBoardAlert, setCustomBoardAlert] = useState("");
  const [savedScenarios, setSavedScenarios] = useState([]);
  const dashboardRef = useRef(null);

  // Metrics
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const totalMargin = deals.reduce((sum, d) => sum + d.margin, 0);
  const avgNPS = Math.round(deals.reduce((sum, d) => sum + d.nps, 0) / deals.length);
  const overdue = deals.filter(d => d.expiring).length;

  const allActivations = deals.flatMap(d => d.activations.map(a => ({
    ...a, sponsor: d.sponsor
  })));
  const timelineData = allActivations.map((a, i) => ({
    sponsor: a.sponsor, name: a.name, due: a.due, status: a.status
  }));

  // NPS trendline
  const months = ["Jan", "Feb", "Mar", "Apr", "May"];
  const npsData = months.map(month => {
    let total = 0, count = 0;
    deals.forEach(s => {
      const f = s.feedback.find(fb => fb.month === month);
      if (f) { total += f.score; count++; }
    });
    return { month, score: count ? Math.round(total / count) : null };
  });

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

  // PDF Export Ref
  const stickyExportBar = <BoardPDFExportButton dashboardRef={dashboardRef} />;

  return (
    <div style={{
      minHeight: "100vh", padding: 30, background: "linear-gradient(135deg, #232a2e 0%, #181e23 100%)",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      {/* Sticky Export */}
      {stickyExportBar}
      <div ref={dashboardRef}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontWeight: 900, fontSize: 38, letterSpacing: 2, color: "#FFD700", marginRight: 26 }}>
          <FaEuroSign style={{ marginRight: 13, fontSize: 34, color: "#1de682" }} />
          Sponsorship Boardroom
        </div>
        <div style={{
          marginLeft: "auto", display: "flex", gap: 11
        }}>
          <button onClick={() => setSector("scenario")} style={{
            background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 10,
            padding: "10px 22px", fontSize: 17, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 8px #FFD70033", border: "none"
          }}>
            <FaRobot /> Run Scenario/AI
          </button>
        </div>
      </div>

      {/* Sector Tabs */}
      <div style={{ display: "flex", gap: 9, marginBottom: 18, flexWrap: "wrap" }}>
        {SECTORS.map(s => (
          <button
            key={s.key}
            onClick={() => setSector(s.key)}
            style={{
              background: sector === s.key ? "#FFD700" : "#222d38",
              color: sector === s.key ? "#222" : "#FFD700",
              border: "none",
              borderRadius: 8,
              padding: "10px 25px",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: sector === s.key ? "0 2px 12px #FFD70055" : "none",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: "pointer"
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Boardroom AI Bar */}
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
          Boardroom AI: {overdue > 0 ? `ALERT: ${overdue} expiring deals. Immediate board action required.` : "All deals up to date."}
        </span>
        <span style={{ marginLeft: "auto", color: "#FFD700bb", fontWeight: 600, fontSize: 16 }}>
          Margin: €{totalMargin.toLocaleString()} | Avg NPS: <span style={{ color: npsColor(avgNPS) }}>{avgNPS}</span>
        </span>
      </motion.div>

      <AnimatePresence>
        {/* PIPELINE */}
        {sector === "pipeline" && (
          <motion.div key="pipeline" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.65 }}>
            <div style={{ display: "flex", gap: 25, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{
                background: "#232a2e", borderRadius: 13, padding: "21px 30px", minWidth: 260,
                border: "3px solid #FFD700", color: "#FFD700", fontWeight: 900, fontSize: 28, boxShadow: "0 2px 12px #FFD70022"
              }}>
                <FaEuroSign style={{ marginRight: 9, color: "#1de682" }} /> €{totalValue.toLocaleString()} <span style={{ fontSize: 17, fontWeight: 500, color: "#fff", marginLeft: 7 }}>Total Deals</span>
              </div>
              <div style={{
                flex: 1, background: "#181e23", borderRadius: 13, padding: 17,
                border: "3px solid #1de682", color: "#1de682", minWidth: 350
              }}>
                <ResponsiveContainer width="100%" height={55}>
                  <BarChart data={deals} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="sponsor" type="category" tick={{ fill: "#FFD700" }} width={85} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FFD700" barSize={14} onClick={(_, idx) => setDealRoom(deals[idx])} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ color: "#FFD70099", fontWeight: 600, fontSize: 13, marginTop: 7 }}>Deal value by sponsor (click for Deal Room)</div>
              </div>
            </div>
            {/* Timeline Chart */}
            <div style={{ background: "#232a2e", borderRadius: 13, padding: 17, border: "2px solid #FFD700", marginBottom: 20 }}>
              <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>
                Activations Timeline
              </div>
              <ResponsiveContainer width="100%" height={125}>
                <BarChart data={timelineData}>
                  <XAxis dataKey="due" tick={{ fill: "#FFD700" }} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey={() => 1} fill="#1de682" onClick={(_, idx) => setDealRoom(deals.find(d => d.sponsor === timelineData[idx].sponsor))}>
                    {timelineData.map((a, i) => (
                      <Cell key={i} fill={a.status === "Completed" ? "#1de682" : a.status === "In Progress" ? "#FFD700" : "#F87171"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13 }}>All activation due dates and status (click to open Deal Room)</div>
            </div>
            {/* Assignments Table */}
            <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, border: "2px solid #FFD700", marginBottom: 16 }}>
              <table style={{ width: "100%", fontSize: 15 }}>
                <thead>
                  <tr style={{ color: "#FFD700", fontWeight: 700 }}>
                    <th align="left">Sponsor</th>
                    <th align="left">Owner</th>
                    <th align="left">Status</th>
                    <th align="left">Legal</th>
                    <th align="left">Board</th>
                    <th align="left">NPS</th>
                    <th align="left">Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d, idx) => (
                    <tr key={d.sponsor} style={{ cursor: "pointer" }} onClick={() => setDealRoom(d)}>
                      <td style={{ color: "#FFD700", fontWeight: 800 }}>{d.sponsor}</td>
                      <td>{d.accountOwner}</td>
                      <td style={{ color: statusColor(d.status) }}>{d.status}</td>
                      <td style={{ color: d.legal === "Signed" ? "#1de682" : "#FFD700" }}>{d.legal}</td>
                      <td style={{ color: d.board === "Approved" ? "#1de682" : "#FFD700" }}>{d.board}</td>
                      <td style={{ color: npsColor(d.nps), fontWeight: 900 }}>{d.nps}</td>
                      <td style={{ color: "#fff" }}>{d.notes}</td>
                      <td>
                        {d.expiring && (
                          <FaExclamationTriangle style={{ color: "#FFD700", fontSize: 21, marginLeft: 8, verticalAlign: "middle" }} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {/* ACTIVATION/NPS */}
        {sector === "activation" && (
          <motion.div key="activation" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "flex", gap: 19, marginBottom: 17, flexWrap: "wrap" }}>
              <div style={{
                background: "#232a2e", borderRadius: 13, padding: 17, flex: 1,
                border: "2px solid #1de682", minWidth: 270
              }}>
                <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>NPS/Feedback Trend</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={npsData}>
                    <XAxis dataKey="month" tick={{ fill: "#FFD700" }} />
                    <YAxis domain={[0, 10]} tick={{ fill: "#1de682" }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#FFD700" strokeWidth={3} dot={{ r: 4, fill: "#1de682" }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13 }}>Sponsor NPS/feedback per month</div>
              </div>
              <div style={{
                background: "#232a2e", borderRadius: 13, padding: 17, flex: 1,
                border: "2px solid #FFD700", minWidth: 270
              }}>
                <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>Activation Completion</div>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie
                      data={allActivations}
                      dataKey={() => 1}
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={48}
                      label={({ status }) => status}
                    >
                      {allActivations.map((a, i) =>
                        <Cell key={i} fill={statusColor(a.status)} />
                      )}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13 }}>Completed / in progress / overdue activations</div>
              </div>
            </div>
          </motion.div>
        )}
        {/* COMPLIANCE/LEGAL */}
        {sector === "compliance" && (
          <motion.div key="compliance" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
            <div style={{ background: "#232a2e", borderRadius: 13, padding: 18, border: "2px solid #A3E635", marginBottom: 14 }}>
              <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 5 }}>Legal & Compliance Status</div>
              <table style={{ width: "100%", fontSize: 15 }}>
                <thead>
                  <tr style={{ color: "#FFD700", fontWeight: 700 }}>
                    <th align="left">Sponsor</th>
                    <th align="left">Legal</th>
                    <th align="left">Board</th>
                    <th align="left">Signature</th>
                    <th align="left">Expiring</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d, idx) => (
                    <tr key={d.sponsor}>
                      <td style={{ color: "#FFD700", fontWeight: 800 }}>{d.sponsor}</td>
                      <td style={{ color: d.legal === "Signed" ? "#1de682" : "#FFD700" }}>{d.legal}</td>
                      <td style={{ color: d.board === "Approved" ? "#1de682" : "#FFD700" }}>{d.board}</td>
                      <td>{d.signature ? <FaSignature className="text-[#1de682] text-lg" /> : <FaSignature className="text-[#FFD700] text-lg" />}</td>
                      <td style={{ color: d.expiring ? "#FFD700" : "#1de682" }}>{d.expiring ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ color: "#FFD70099", fontWeight: 500, fontSize: 13, marginTop: 8 }}>
                Board/Legal sign-off status for every major sponsor.
              </div>
            </div>
          </motion.div>
        )}
        {/* BOARD ACTIONS */}
        {sector === "board" && (
          <motion.div key="board" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
            <div style={{ background: "#232a2e", borderRadius: 13, padding: 17, border: "2px solid #00B4D8", marginBottom: 15 }}>
              <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 9 }}>Open Board Alerts</div>
              <ul style={{ paddingLeft: 0 }}>
                {deals.map(d => (
                  <li key={d.sponsor} style={{
                    marginBottom: 15, background: "#181e23", borderRadius: 10, padding: "10px 16px", color: "#FFD700"
                  }}>
                    <FaBell style={{ marginRight: 7 }} /> <b>{d.sponsor}:</b> <span style={{ color: "#fff", fontWeight: 600 }}>{d.lastBoardAlert}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ color: "#FFD700a0", fontSize: 14, marginTop: 18 }}>
              All critical board-level AI alerts and escalation needs for the sponsorship pipeline.
            </div>
          </motion.div>
        )}
        {/* SCENARIO AI */}
        {sector === "scenario" && (
          <motion.div key="scenario" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
            {/* Scenario Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(285px,1fr))",
              gap: 18, marginBottom: 23
            }}>
              {SCENARIOS.map(sc => (
                <motion.div
                  key={sc.scenario}
                  whileHover={{ scale: 1.03 }}
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
                          <td style={{ padding: "4px 8px", color: b.type === "Opportunity" ? "#1de682" : "#FFD700" }}>{b.type}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div style={{ color: "#27ef7d", fontWeight: 700, background: "#181e23", borderRadius: 7, padding: "9px 14px", fontSize: 15, marginTop: 5 }}>
                    <FaBell style={{ marginRight: 8 }} /> {sc.boardAlert}
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
                  placeholder="Scenario (e.g. New sponsor, margin loss)"
                  value={customScenario}
                  onChange={e => setCustomScenario(e.target.value)}
                  style={{
                    padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 180, fontSize: 15, flex: 2
                  }}
                />
                <input
                  placeholder="Impact (e.g. -€10k, risk to digital)"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guidance */}
      <div style={{ marginTop: 28, color: "#FFD700a0", fontSize: 14, textAlign: "center" }}>
        <FaExclamationTriangle style={{ marginRight: 6 }} />
        All boardroom scenarios, pipeline, compliance and AI insights are ready for reporting/export. Assign actions, escalate to board, and run “what-if” at will. Click any row/chart for deep dive.
      </div>

      {/* Deal Room Modal */}
      <AnimatePresence>
        {dealRoom && <DealRoom deal={dealRoom} onClose={() => setDealRoom(null)} />}
      </AnimatePresence>
      </div>
    </div>
  );
}
