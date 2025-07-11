import React, { useState, useRef } from "react";
import {
  FaArrowUp, FaArrowDown, FaExclamationTriangle, FaFilePdf, FaClipboardCheck, FaPlus, FaCheckCircle, FaClock, FaUserTie, FaCalendarAlt, FaCommentDots, FaListUl, FaRobot, FaSignature, FaBullseye
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ------------ DEMO DATA (Replace with backend/CSV) -------------
const REVIEWS = [
  {
    subject: "Head Coach",
    type: "Annual Review",
    due: "2025-07-01",
    status: "Overdue",
    assignedTo: "Board HR",
    lastDone: "2024-07-01",
    compliance: "Pending",
    flagged: true,
    notes: "Delayed board signature, urgent to resolve.",
    comments: [
      { month: "May", score: 8 },
      { month: "Jun", score: 7 },
      { month: "Jul", score: 6 },
    ]
  },
  {
    subject: "Player Development Lead",
    type: "Semi-Annual Review",
    due: "2025-08-15",
    status: "Due Soon",
    assignedTo: "TD",
    lastDone: "2025-02-16",
    compliance: "On Track",
    flagged: false,
    notes: "Prepare 360 feedback survey.",
    comments: [
      { month: "Feb", score: 8 },
      { month: "Aug", score: 9 },
    ]
  },
  {
    subject: "Club Operations",
    type: "Annual Compliance Audit",
    due: "2025-11-10",
    status: "Upcoming",
    assignedTo: "Board Secretary",
    lastDone: "2024-11-10",
    compliance: "Planned",
    flagged: false,
    notes: "",
    comments: []
  }
];

// ------------- PDF EXPORT -------------
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
    pdf.text("Performance Review Cycle Board Report", 105, 76, { align: "center" });
    pdf.setFontSize(13);
    pdf.setTextColor(29,230,130);
    pdf.text("Elite Compliance Intelligence", 105, 93, { align: "center" });
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
    pdf.save("CourtEvoVero_Review_Boardroom.pdf");
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

// --------- ASSIGNMENT DRAWER ----------
function AssignmentDrawer({ show, onClose, item, onAssign }) {
  const [owner, setOwner] = useState("");
  const [deadline, setDeadline] = useState("");
  const [comment, setComment] = useState("");
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#232a2e] border-2 border-[#FFD700] rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button className="absolute top-4 right-6 text-2xl text-[#FFD700]" onClick={onClose}><FaClock /></button>
        <div className="text-[#FFD700] font-bold text-lg mb-3 flex items-center gap-2">
          <FaClipboardCheck /> Assign Review Action
        </div>
        <div className="text-white mb-2 text-sm">
          <b>Item:</b> {item?.subject || ""} ({item?.type || ""})
        </div>
        <input className="w-full rounded p-2 mb-3 bg-[#181e23] text-white border border-[#FFD700]" placeholder="Assign to (owner/role)" value={owner} onChange={e => setOwner(e.target.value)} />
        <input type="date" className="w-full rounded p-2 mb-3 bg-[#181e23] text-white border border-[#FFD700]" placeholder="Deadline" value={deadline} onChange={e => setDeadline(e.target.value)} />
        <textarea className="w-full rounded p-2 mb-3 bg-[#181e23] text-white border border-[#FFD700]" placeholder="Add comment/description" value={comment} onChange={e => setComment(e.target.value)} />
        <button className="bg-[#FFD700] text-[#232a2e] font-bold px-4 py-2 rounded hover:bg-[#1de682] w-full"
          onClick={() => {
            if (!owner || !deadline) return;
            onAssign({ owner, deadline, comment, item });
            setOwner(""); setDeadline(""); setComment("");
            onClose();
          }}>
          <FaCheckCircle className="inline mr-2" /> Assign
        </button>
      </div>
    </div>
  );
}

// ---------- AI Narrative Bar -----------
function AINarrative({ reviews }) {
  const [hint, setHint] = useState(0);
  const overdue = reviews.filter(r => r.status === "Overdue");
  const dueSoon = reviews.filter(r => r.status === "Due Soon");
  const hints = [
    {
      label: "Review Compliance",
      text: `${overdue.length} overdue reviews, ${dueSoon.length} due in next 30 days.`
    },
    {
      label: "Top Risk",
      text: overdue.length
        ? `Review for ${overdue[0].subject} flagged. Action needed: ${overdue[0].notes}`
        : "No critical overdue reviews."
    },
    {
      label: "Board Focus",
      text: "Prepare for next annual audit. Assign pending actions to responsible owners."
    }
  ];
  React.useEffect(() => {
    const t = setTimeout(() => setHint((hint + 1) % hints.length), 6000);
    return () => clearTimeout(t);
  }, [hint]);
  return (
    <div className="bg-gradient-to-r from-[#232a2e]/80 to-[#181e23]/95 border-l-4 border-[#FFD700] rounded-2xl shadow-xl p-5 mb-7 flex items-center gap-4">
      <div className="flex items-center text-[#FFD700] text-xl font-bold mr-4"><FaClock className="mr-2" /> {hints[hint].label}</div>
      <div className="text-white text-lg font-semibold">{hints[hint].text}</div>
      <div className="ml-auto flex gap-2">
        <span className="rounded-full bg-[#FFD700]/20 px-3 py-1 text-[#FFD700] text-xs font-bold animate-pulse">AI</span>
      </div>
    </div>
  );
}

// ----------- KPI WALL ----------
function KpiWall({ reviews }) {
  const total = reviews.length;
  const completed = reviews.filter(r => r.compliance === "Completed").length;
  const overdue = reviews.filter(r => r.status === "Overdue").length;
  const dueSoon = reviews.filter(r => r.status === "Due Soon").length;
  const onTime = reviews.filter(r => r.compliance === "On Track" || r.compliance === "Completed").length;
  return (
    <div className="flex gap-7 mb-8 flex-wrap justify-center md:justify-start">
      <KpiDonut value={total} color="#FFD700" label="Total Reviews" />
      <KpiDonut value={completed} color="#1de682" label="Completed" />
      <KpiDonut value={overdue} color="#F87171" label="Overdue" warn={overdue > 0} />
      <KpiDonut value={dueSoon} color="#FFD700" label="Due Soon" warn={dueSoon > 0} />
      <KpiDonut value={onTime ? Math.round((onTime/total)*100) : 0} color="#1de682" label="% On Time" />
    </div>
  );
}
function KpiDonut({ value, color, label, warn }) {
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value);
  React.useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0, end = value, step = Math.max(1, Math.floor(end / 50));
    let interval = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(interval); }
      else setDisplay(start);
    }, 10);
    return () => clearInterval(interval);
  }, [value]);
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl shadow-lg border-4 glass p-4 min-w-[140px] bg-gradient-to-br from-[#232a2e] to-[#181e23]" style={{ borderColor: color }}>
      <div className="relative flex items-center justify-center mb-2">
        <svg width={44} height={44}>
          <circle cx={22} cy={22} r={18} stroke="#282d36" strokeWidth={6} fill="none" />
          <circle cx={22} cy={22} r={18} stroke={color} strokeWidth={6} fill="none" strokeDasharray={120} strokeDashoffset={120 - 120 * (value/100)} style={{ transition: "stroke-dashoffset 1.2s" }} />
        </svg>
        <span className="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center text-xl font-extrabold" style={{ color }}>{display}</span>
      </div>
      <div className="text-sm font-bold text-white">{label}</div>
      {warn && <FaExclamationTriangle className="text-[#F87171] animate-pulse mt-1" />}
    </div>
  );
}

// ----------- REVIEW TIMELINE CHART -----------
function ReviewTimeline({ reviews }) {
  const data = reviews.map(r => ({ ...r, week: r.due.slice(0,7) })).sort((a,b) => a.due.localeCompare(b.due));
  return (
    <div className="bg-[#232a2e] rounded-2xl border-2 border-[#FFD700] p-6 shadow-xl my-8">
      <div className="text-[#FFD700] font-bold text-lg mb-3 flex items-center gap-2">
        <FaCalendarAlt /> Performance Review Timeline
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="subject" tick={{ fill: "#FFD700", fontSize: 12 }} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "#FFD70033" }}
            content={({ active, payload }) => active && payload && payload.length ? (
              <div className="bg-[#181e23] border border-[#FFD700] p-3 rounded-xl text-xs shadow-xl text-white">
                <b className="text-[#FFD700]">{payload[0].payload.subject}</b><br />
                Due: {payload[0].payload.due}<br />
                Status: <span style={{ color: payload[0].payload.status === "Overdue" ? "#F87171" : "#FFD700" }}>{payload[0].payload.status}</span>
              </div>
            ) : null}
          />
          <Bar dataKey={() => 1} fill="#FFD700">
            {data.map((entry, idx) =>
              <Cell key={idx} fill={entry.status === "Overdue" ? "#F87171" : entry.status === "Due Soon" ? "#FFD700" : "#1de682"} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ------------- SUPER TABLE -------------
function SuperTable({ reviews, onAssign }) {
  const [expanded, setExpanded] = useState(-1);
  return (
    <div className="bg-[#232a2e] rounded-2xl shadow-xl border-2 border-[#FFD700] overflow-auto mb-12">
      <table className="min-w-full text-white text-sm">
        <thead>
          <tr className="bg-[#1c2328] text-[#FFD700] text-sm sticky top-0 z-10">
            <th className="py-3 px-4">Subject</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Due</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Assigned</th>
            <th className="py-3 px-4">Compliance</th>
            <th className="py-3 px-4">Flagged</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r, idx) => (
            <React.Fragment key={idx}>
              <tr className={`border-b border-[#FFD70022] hover:bg-[#1c2328]/50 transition ${expanded === idx ? "bg-[#FFD700]/10" : ""}`}>
                <td className="py-2 px-4 font-bold">{r.subject}</td>
                <td className="py-2 px-4">{r.type}</td>
                <td className="py-2 px-4 text-[#FFD700]">{r.due}</td>
                <td className="py-2 px-4" style={{ color: r.status === "Overdue" ? "#F87171" : r.status === "Due Soon" ? "#FFD700" : "#1de682" }}>{r.status}</td>
                <td className="py-2 px-4">{r.assignedTo}</td>
                <td className="py-2 px-4" style={{ color: r.compliance === "On Track" || r.compliance === "Completed" ? "#1de682" : "#FFD700" }}>{r.compliance}</td>
                <td className="py-2 px-4">{r.flagged ? <FaExclamationTriangle className="text-[#F87171] animate-pulse" /> : <FaCheckCircle className="text-[#1de682]" />}</td>
                <td className="py-2 px-4">
                  <button onClick={() => setExpanded(expanded === idx ? -1 : idx)} className="text-[#FFD700] hover:text-[#1de682] text-xl">
                    {expanded === idx ? <FaArrowUp /> : <FaArrowDown />}
                  </button>
                </td>
              </tr>
              {expanded === idx && (
                <tr>
                  <td colSpan={8} className="p-3 bg-[#181e23] rounded-b-2xl">
                    <div className="flex flex-col md:flex-row gap-5 items-center">
                      <div className="flex-1 text-sm">
                        <div className="text-[#FFD700] font-bold mb-1">Notes:</div>
                        <div className="mb-2 text-white">{r.notes || "—"}</div>
                        <div className="flex gap-4 items-center mb-2">
                          <span className="font-bold text-[#FFD700]">Last Done:</span>
                          <span className="text-white">{r.lastDone}</span>
                        </div>
                        <div className="flex gap-3">
                          <button className="bg-[#FFD700] text-[#232a2e] px-3 py-1 rounded font-bold flex items-center gap-2 hover:bg-[#1de682]"
                            onClick={() => onAssign(r)}>
                            <FaClipboardCheck /> Assign Action
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="text-[#FFD700] font-bold mb-1 flex items-center gap-2"><FaCommentDots /> Comments/Feedback</div>
                        <ul className="mb-2">
                          {r.comments && r.comments.length > 0 ? r.comments.map((c, i) => (
                            <li key={i} className="flex items-center gap-2 text-white mb-1">
                              <FaClock className="text-xs text-[#FFD700]" />
                              <span className="font-bold">{c.month}</span>
                              <span className="ml-2">{c.score}/10</span>
                            </li>
                          )) : <li className="text-[#FFD70099]">No feedback yet</li>}
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------- BOARDROOM SCENARIO AI -------------
const SCENARIOS = [
  {
    scenario: "Board Delays Head Coach Review",
    impact: "+2 weeks delay, risk: non-compliance, morale impact",
    breakdown: [
      { metric: "Compliance Risk", value: "+13%", type: "Risk" },
      { metric: "Morale", value: "-8%", type: "Risk" }
    ],
    boardAlert: "AI: Recommend urgent board signature. Assign to HR."
  },
  {
    scenario: "Automate 360° Feedback for Staff",
    impact: "+19% feedback coverage, -2h admin workload, +3% completion rate",
    breakdown: [
      { metric: "Feedback Rate", value: "+19%", type: "Opportunity" },
      { metric: "Admin Time", value: "-2h", type: "Opportunity" }
    ],
    boardAlert: "AI: Assign pilot group and board review."
  },
  {
    scenario: "Split Annual Audit into Two Semi-Annual Reviews",
    impact: "+12% transparency, -5% disruption, +1 compliance report",
    breakdown: [
      { metric: "Transparency", value: "+12%", type: "Opportunity" },
      { metric: "Disruption", value: "-5%", type: "Opportunity" }
    ],
    boardAlert: "Assign: Club Secretary & Compliance Officer."
  }
];

// ----------- SCENARIO BUILDER / AI -------------
function ScenarioAI({ scenario, setScenario, customScenario, setCustomScenario, customImpact, setCustomImpact, customBoardAlert, setCustomBoardAlert, savedScenarios, setSavedScenarios }) {
  // Save
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
    setCustomScenario(""); setCustomImpact(""); setCustomBoardAlert(""); setScenario(null);
  };
  return (
    <div className="my-10 bg-[#232a2e] border-2 border-[#FFD700] rounded-2xl p-7 shadow-xl">
      <div className="font-extrabold text-xl text-[#FFD700] flex items-center gap-2 mb-5"><FaRobot /> Review Cycle What-If Scenarios</div>
      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-7">
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
              <FaBullseye style={{ marginRight: 8 }} /> {sc.boardAlert}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Custom Scenario Builder */}
      <div className="bg-[#202D36] border rounded-xl p-5 mb-5">
        <div className="font-bold text-[#A3E635] mb-3 flex items-center gap-2"><FaClipboardCheck /> Build your own scenario:</div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="rounded p-2 bg-[#181e23] text-white border border-[#FFD700] flex-1 mb-2 md:mb-0"
            placeholder="Scenario (e.g. Delay feedback process)"
            value={customScenario}
            onChange={e => setCustomScenario(e.target.value)}
          />
          <input
            className="rounded p-2 bg-[#181e23] text-white border border-[#FFD700] flex-1 mb-2 md:mb-0"
            placeholder="Impact (e.g. +5% non-compliance)"
            value={customImpact}
            onChange={e => setCustomImpact(e.target.value)}
          />
          <input
            className="rounded p-2 bg-[#181e23] text-white border border-[#FFD700] flex-1"
            placeholder="Board Alert/AI"
            value={customBoardAlert}
            onChange={e => setCustomBoardAlert(e.target.value)}
          />
          <button
            className="bg-[#FFD700] text-[#232a2e] font-bold px-4 py-2 rounded hover:bg-[#1de682]"
            onClick={saveScenario}
          >
            Save
          </button>
        </div>
      </div>
      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <div className="bg-[#232d38] border rounded-xl p-5">
          <div className="font-bold text-[#FFD700] mb-3 flex items-center gap-2"><FaListUl /> Saved Scenarios</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#FFD700]">
                <th className="py-1 px-2">Time</th>
                <th className="py-1 px-2">Scenario</th>
                <th className="py-1 px-2">Impact</th>
                <th className="py-1 px-2">AI/Board</th>
              </tr>
            </thead>
            <tbody>
              {savedScenarios.map(s => (
                <tr key={s.id}>
                  <td className="py-1 px-2">{s.time}</td>
                  <td className="py-1 px-2">{s.scenario}</td>
                  <td className="py-1 px-2">{s.impact}</td>
                  <td className="py-1 px-2">{s.boardAlert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ------------- MAIN COMPONENT -------------
export default function PerformanceReviewCycleDashboard() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [assignments, setAssignments] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignItem, setAssignItem] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [customScenario, setCustomScenario] = useState("");
  const [customImpact, setCustomImpact] = useState("");
  const [customBoardAlert, setCustomBoardAlert] = useState("");
  const [savedScenarios, setSavedScenarios] = useState([]);
  const dashboardRef = useRef(null);

  // Assign
  const handleAssign = (a) => setAssignments([a, ...assignments]);
  const handleResolve = (idx) => setAssignments(assignments.filter((_,i) => i !== idx));

  return (
    <div className="relative min-h-screen p-6 md:p-8 bg-gradient-to-br from-[#232a2e] to-[#181e23]">
      <BoardPDFExportButton dashboardRef={dashboardRef} />
      <div className="fixed bottom-0 left-0 w-full flex justify-center opacity-20 pointer-events-none z-0">
        <div className="text-6xl font-extrabold tracking-wider text-[#FFD700]/40 select-none animate-pulse">COURTEVO VERO</div>
      </div>
      <div ref={dashboardRef}>
        <AINarrative reviews={reviews} />
        <KpiWall reviews={reviews} />
        <ReviewTimeline reviews={reviews} />
        <SuperTable reviews={reviews} onAssign={item => { setShowAssign(true); setAssignItem(item); }} />
        <ScenarioAI
          scenario={scenario} setScenario={setScenario}
          customScenario={customScenario} setCustomScenario={setCustomScenario}
          customImpact={customImpact} setCustomImpact={setCustomImpact}
          customBoardAlert={customBoardAlert} setCustomBoardAlert={setCustomBoardAlert}
          savedScenarios={savedScenarios} setSavedScenarios={setSavedScenarios}
        />
      </div>
      <AssignmentDrawer
        show={showAssign}
        onClose={() => setShowAssign(false)}
        assignTo={null}
        item={assignItem}
        onAssign={handleAssign}
      />
      <div className="mt-16 text-center text-[#FFD700] font-bold text-lg tracking-wider pt-8 border-t border-[#FFD70022]">
        COURTEVO VERO &bull; Elite Compliance Intelligence &bull; Boardroom Grade
      </div>
    </div>
  );
}
