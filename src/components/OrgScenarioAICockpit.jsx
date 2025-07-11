import React, { useState, useRef } from "react";
import {
  FaUsers, FaUserTie, FaHeartbeat, FaCogs, FaExclamationTriangle, FaCheckCircle, FaFlag, FaDownload, FaRobot, FaArrowUp, FaArrowDown, FaChevronDown, FaChevronRight, FaCloudUploadAlt, FaCommentDots, FaPlus, FaTimes, FaCheck, FaCamera, FaClock, FaUndo, FaChevronUp
} from "react-icons/fa";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import html2pdf from "html2pdf.js";
import OrgSidebarChatRoom from "./OrgSidebarChatRoom";

// ===== FeedbackPanel =====
function FeedbackPanel({ section, comments, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("none");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd({
      section,
      text,
      priority,
      timestamp: new Date().toLocaleString(),
      by: "Stakeholder"
    });
    setText("");
    setPriority("none");
  };

  return (
    <>
      <button
        className="fixed top-1/2 left-0 z-50 bg-[#FFD700] text-black p-2 rounded-r-xl font-bold shadow-lg"
        style={{ transform: "translateY(-50%)" }}
        onClick={() => setOpen(v => !v)}
        title="Open Feedback Panel"
      >
        <FaCommentDots size={24} />
      </button>
      {open && (
        <div className="fixed top-0 left-0 h-full w-[340px] bg-[#23292fae] shadow-2xl z-50 p-5 flex flex-col border-r-4 border-[#FFD700]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-xl text-[#FFD700]">Feedback & Comments</span>
            <button onClick={() => setOpen(false)} className="text-[#FFD700] text-2xl"><FaTimes /></button>
          </div>
          <div className="mb-3 flex flex-col gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Leave feedback for: ${section}`}
              className="w-full p-2 rounded bg-[#181e23] text-white border border-[#FFD700] min-h-[64px]"
            />
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#FFD700]">Priority:</span>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-[#FFD700] text-[#222] rounded p-1 font-bold">
                <option value="none">None</option>
                <option value="info">Info</option>
                <option value="flag">Flag</option>
                <option value="critical">Critical</option>
              </select>
              <button
                className="ml-auto bg-[#FFD700] text-[#23292f] px-3 py-1 rounded-lg font-bold hover:scale-105"
                onClick={handleAdd}
              >
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {comments.length === 0 && <div className="text-[#FFD70099] italic">No comments yet.</div>}
            {comments.map((c, i) => (
              <div key={i} className="mb-3 bg-[#181e23dd] rounded-lg p-3 shadow">
                <div className="flex items-center gap-2 mb-1">
                  {c.priority === "flag" && <FaFlag color="#FFD700" />}
                  {c.priority === "critical" && <FaFlag color="#e24242" />}
                  {c.priority === "info" && <FaCheckCircle color="#1de682" />}
                  <span className="font-bold text-[#FFD700]">{c.by}</span>
                  <span className="ml-auto text-xs text-[#1de682]">{c.timestamp}</span>
                  <button onClick={() => onRemove(i)} className="ml-3 text-[#FFD700] hover:text-[#e24242] text-xl"><FaTimes /></button>
                </div>
                <div className="text-white">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ===== AlertsBanner =====
function AlertsBanner({ alerts }) {
  if (!alerts.length) return null;
  return (
    <div className="w-full mb-7">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-bold mb-2`}
          style={{
            background: a.type === "critical"
              ? "linear-gradient(90deg,#e24242 80%,#FFD700 100%)"
              : a.type === "warning"
                ? "linear-gradient(90deg,#FFD700 80%,#1de682 100%)"
                : "linear-gradient(90deg,#1de682 80%,#FFD700 100%)",
            color: a.type === "critical" ? "#fff" : "#23292f"
          }}
        >
          {a.type === "critical" && <FaExclamationTriangle size={22} />}
          {a.type === "warning" && <FaFlag size={22} />}
          {a.type === "info" && <FaCheckCircle size={22} />}
          <span>{a.text}</span>
        </div>
      ))}
    </div>
  );
}

// ===== ScenarioSnapshots =====
function ScenarioSnapshots({ state, onRestore }) {
  const [snapshots, setSnapshots] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    setSnapshots([
      ...snapshots,
      {
        timestamp: new Date().toLocaleString(),
        state: JSON.parse(JSON.stringify(state))
      }
    ]);
  };

  return (
    <div className="fixed bottom-0 right-[320px] z-40 m-4">
      <button
        className="bg-[#FFD700] text-black px-4 py-2 rounded-t-2xl font-bold shadow-xl flex items-center gap-2"
        onClick={() => setOpen(v => !v)}
      >
        <FaCamera /> {open ? <FaChevronDown /> : <FaChevronUp />} Snapshots
      </button>
      {open && (
        <div className="bg-[#23292f] rounded-b-2xl shadow-xl p-5 w-[320px] max-h-[400px] overflow-y-auto">
          <button
            className="mb-4 bg-[#1de682] text-black px-3 py-1 rounded-xl font-bold hover:scale-105 flex items-center gap-2"
            onClick={handleSave}
          >
            <FaCamera /> Save Current Snapshot
          </button>
          <div>
            {snapshots.length === 0 && (
              <div className="text-[#FFD700] italic">No snapshots yet.</div>
            )}
            {snapshots.slice().reverse().map((snap, i) => (
              <div key={i} className="mb-4 bg-[#181e23cc] rounded-lg p-3 shadow">
                <div className="flex items-center gap-2 mb-1 text-[#FFD700]">
                  <FaClock /> {snap.timestamp}
                  <button className="ml-auto text-[#1de682] hover:text-[#FFD700]" onClick={() => onRestore(snap.state)}>
                    <FaUndo /> Restore
                  </button>
                </div>
                <div className="text-xs text-[#FFD700bb]">[State saved]</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ======== Core OrgScenarioAICockpit =========
const DEFAULTS = {
  budget: 800,
  staff: 20,
  dualCareer: 35,
  coachRetention: 85,
  boardSuccession: 1,
  resourceScore: 75,
  complianceScore: 82
};

const departmentMetrics = vars => ({
  athletes: {
    u14Pipeline: Math.round(vars.dualCareer * 0.5 + vars.staff * 0.7),
    u18Retention: Math.round(vars.dualCareer * 0.4 + vars.coachRetention * 0.6),
    dualCareer: vars.dualCareer,
    talentExport: Math.round(vars.dualCareer * 0.2 + vars.staff * 0.5),
    future: vars.dualCareer + 6
  },
  coaches: {
    experience: Math.round(vars.staff * 1.2 + vars.coachRetention * 0.4),
    license: Math.round(vars.staff * 0.7 + vars.resourceScore * 0.2),
    turnover: 100 - vars.coachRetention,
    future: vars.coachRetention - 4
  },
  board: {
    succession: vars.boardSuccession ? 95 : 68,
    training: Math.round(vars.resourceScore * 0.7 + vars.staff * 0.3),
    future: vars.boardSuccession ? 92 : 60
  },
  compliance: {
    audits: Math.round(vars.complianceScore * 0.8),
    childSafety: Math.round(vars.complianceScore * 0.65 + vars.resourceScore * 0.2),
    financialRisk: 100 - vars.complianceScore,
    future: vars.complianceScore - 5
  },
  resource: {
    facilities: Math.round(vars.resourceScore * 0.6 + vars.staff * 0.5),
    ITtools: Math.round(vars.resourceScore * 0.5 + vars.budget * 0.1),
    medical: Math.round(vars.resourceScore * 0.4 + vars.staff * 0.2),
    future: vars.resourceScore + 4
  }
});

function aiRecommendations(vars, dept) {
  const recs = [];
  if (vars.dualCareer < 40) recs.push({
    type: "warning", color: "#FFD700",
    text: "Increase dual-career support to lower athlete risk and boost pipeline.",
    future: `If dual-career stays below 40%, pipeline attrition risk may rise 15% within 12 months.`
  });
  if (vars.staff < 18) recs.push({
    type: "critical", color: "#e24242",
    text: "Low staff numbers. Athlete/coach risk elevated. Prioritize hiring.",
    future: `Staff below 18 → coach impact may fall by 12% by season end.`
  });
  if (!vars.boardSuccession) recs.push({
    type: "warning", color: "#FFD700",
    text: "Board succession delayed. Governance risk rising.",
    future: `Delayed succession doubles board risk in 6–9 months.`
  });
  if (vars.budget < 700) recs.push({
    type: "critical", color: "#e24242",
    text: "Budget at risk zone. Consider strategic cost savings or new revenue.",
    future: `Budget under 700k may reduce resource health 10% in next fiscal cycle.`
  });
  if (dept.compliance.future < 65) recs.push({
    type: "warning", color: "#FFD700",
    text: "Compliance falling behind. Schedule audits or staff training.",
    future: `Compliance below 65% will trigger regulator review within 6 months.`
  });
  if (recs.length === 0) recs.push({
    type: "info", color: "#1de682",
    text: "Organization in optimal health. Maintain current strategies.",
    future: "All trends stable. Continue current approach."
  });
  return recs;
}

function RichRadialChart({ value, label, color, icon, trend, forecast }) {
  const colorId = `radialcolor-${label.replace(/\s/g, "")}`;
  const data = [{ name: label, value }];
  return (
    <div style={{
      background: "rgba(35,41,47,0.80)",
      borderRadius: 32,
      boxShadow: "0 4px 28px #23292f44, 0 0px 0px #FFD70022",
      padding: "25px 8px 15px 8px",
      margin: 0,
      position: "relative",
      minWidth: 165,
      minHeight: 180,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <ResponsiveContainer width="98%" height={115}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="64%"
          outerRadius="98%"
          barSize={18}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <linearGradient id={colorId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color[0]} />
              <stop offset="70%" stopColor={color[1]} />
            </linearGradient>
          </defs>
          <RadialBar
            minAngle={15}
            label={false}
            clockWise
            dataKey="value"
            fill={`url(#${colorId})`}
            background
            cornerRadius={18}
            animationEasing="ease-in-out"
            isAnimationActive={true}
          />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{
        position: "absolute", top: 52, left: 0, right: 0, textAlign: "center",
        fontWeight: 800, fontSize: 29, color: color[1], textShadow: "0 1px 10px #000a"
      }}>
        {icon} {Math.round(value)}%
      </div>
      <div style={{
        fontWeight: 800, fontSize: 16, color: "#FFD700", letterSpacing: 1, marginTop: 6, textAlign: "center"
      }}>{label}</div>
      {forecast &&
        <div style={{
          color: trend > 0 ? "#1de682" : "#e24242",
          fontWeight: 700, fontSize: 12, marginTop: 4, opacity: 0.97, textAlign: "center"
        }}>
          {trend > 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trend)}% forecast
        </div>
      }
    </div>
  );
}

export default function OrgScenarioAICockpit() {
  const [vars, setVars] = useState(DEFAULTS);
  const [logo, setLogo] = useState(null);
  const [expanded, setExpanded] = useState({ athletes: false, coaches: false, board: false, compliance: false, resource: false });
  const [comments, setComments] = useState([]);
  const aiRecs = aiRecommendations(vars, departmentMetrics(vars));
  const alerts = aiRecs.filter(a => a.type !== "info").map(({ type, text }) => ({ type, text }));
  const pdfRef = useRef();

  const scenarioState = { vars, expanded, logo };
  const handleRestoreSnapshot = restored => {
    setVars(restored.vars);
    setExpanded(restored.expanded);
    setLogo(restored.logo);
  };

  const handleLogoChange = e => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = evt => setLogo(evt.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePdfExport = () => {
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `CourtEvoVero_OrgScenarioAI_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(pdfRef.current).set(options).save();
  };

  // === Layout: content with sidebar ===
  return (
    <div className="flex flex-row" style={{ minHeight: "100vh" }}>
      {/* Main dashboard */}
      <div className="flex-1 max-w-[1600px] mx-auto py-9 px-4 relative">
        <FeedbackPanel
          section="OrgScenarioAICockpit"
          comments={comments}
          onAdd={c => setComments([...comments, c])}
          onRemove={idx => setComments(comments.filter((_, i) => i !== idx))}
        />
        <AlertsBanner alerts={alerts} />
        <ScenarioSnapshots state={scenarioState} onRestore={handleRestoreSnapshot} />

        <div ref={pdfRef}>
          <div className="flex flex-wrap justify-between items-center mb-7 gap-3" style={{ minHeight: 60 }}>
            <div className="flex items-center gap-4">
              {logo ?
                <img src={logo} alt="Org Logo" style={{
                  height: 65, width: 65, objectFit: "contain",
                  background: "#fff", borderRadius: 19, boxShadow: "0 1px 10px #FFD70044"
                }} />
                :
                <label htmlFor="logo-upload" style={{
                  cursor: "pointer", background: "#FFD700",
                  borderRadius: 19, width: 65, height: 65, display: "flex",
                  alignItems: "center", justifyContent: "center", boxShadow: "0 1px 10px #FFD70044"
                }}>
                  <FaCloudUploadAlt size={32} color="#23292f" />
                  <input id="logo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                </label>
              }
              <div>
                <div className="flex items-center gap-2">
                  <FaRobot size={39} color="#FFD700" style={{ filter: "drop-shadow(0 2px 20px #FFD70055)" }} />
                  <span className="font-extrabold text-3xl" style={{
                    color: "#FFD700", letterSpacing: 1, textShadow: "0 2px 16px #23292f55"
                  }}>ORG SCENARIO AI COCKPIT</span>
                </div>
                <div className="text-[#FFD700] italic text-lg font-bold" style={{ marginTop: 2 }}>
                  Boardroom Engine <span style={{ color: "#1de682" }}>| Demo & PDF Export</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-[#FFD700] text-black px-6 py-2 rounded-2xl font-extrabold text-lg hover:scale-105 shadow-xl"
              style={{ letterSpacing: 1, transition: "0.12s" }}
              onClick={handlePdfExport}>
              <FaDownload /> Export PDF
            </button>
          </div>
          {/* CONTROLS */}
          <div className="bg-[#23292ff5] rounded-3xl shadow-2xl p-8 mb-9 flex flex-col md:flex-row gap-12 border-t-8 border-[#FFD700]">
            <div className="flex-1 flex flex-col gap-6">
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Budget (€k)
                <input type="number" min={400} max={1200} value={vars.budget}
                  onChange={e => setVars({ ...vars, budget: Number(e.target.value) })}
                  className="ml-2 w-24 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}
                />
              </label>
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Staff
                <input type="number" min={8} max={36} value={vars.staff}
                  onChange={e => setVars({ ...vars, staff: Number(e.target.value) })}
                  className="ml-2 w-20 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}
                />
              </label>
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Dual Career % Athletes
                <input type="number" min={0} max={100} value={vars.dualCareer}
                  onChange={e => setVars({ ...vars, dualCareer: Number(e.target.value) })}
                  className="ml-2 w-20 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}
                />
              </label>
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Coach Retention %
                <input type="number" min={40} max={100} value={vars.coachRetention}
                  onChange={e => setVars({ ...vars, coachRetention: Number(e.target.value) })}
                  className="ml-2 w-20 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}
                />
              </label>
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Board Succession
                <select value={vars.boardSuccession} onChange={e => setVars({ ...vars, boardSuccession: Number(e.target.value) })}
                  className="ml-2 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}>
                  <option value={1}>On Plan</option>
                  <option value={0}>Delayed</option>
                </select>
              </label>
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Resource Score
                <input type="number" min={0} max={100} value={vars.resourceScore}
                  onChange={e => setVars({ ...vars, resourceScore: Number(e.target.value) })}
                  className="ml-2 w-20 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}
                />
              </label>
              <label className="font-bold text-[#FFD700] text-lg flex gap-2">Compliance Score
                <input type="number" min={0} max={100} value={vars.complianceScore}
                  onChange={e => setVars({ ...vars, complianceScore: Number(e.target.value) })}
                  className="ml-2 w-20 px-3 py-1.5 rounded-lg font-bold bg-[#181e23] text-[#FFD700] border-2 border-[#FFD700] shadow-inner focus:ring-2"
                  style={{ fontSize: 18 }}
                />
              </label>
            </div>
          </div>
          {/* SECTION BREAKDOWNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-7">
            {[
              {
                key: "athletes",
                title: "Athlete Development",
                icon: <FaHeartbeat color="#1de682" size={26} />,
                color: ["#e24242", "#1de682"],
                metrics: [
                  { label: "U14 Pipeline", val: departmentMetrics(vars).athletes.u14Pipeline, forecast: departmentMetrics(vars).athletes.future },
                  { label: "U18 Retention", val: departmentMetrics(vars).athletes.u18Retention },
                  { label: "Dual Career %", val: departmentMetrics(vars).athletes.dualCareer },
                  { label: "Talent Export", val: departmentMetrics(vars).athletes.talentExport }
                ]
              },
              {
                key: "coaches",
                title: "Coach Development",
                icon: <FaUserTie color="#FFD700" size={26} />,
                color: ["#1de682", "#FFD700"],
                metrics: [
                  { label: "Experience", val: departmentMetrics(vars).coaches.experience, forecast: departmentMetrics(vars).coaches.future },
                  { label: "License", val: departmentMetrics(vars).coaches.license },
                  { label: "Turnover", val: departmentMetrics(vars).coaches.turnover }
                ]
              },
              {
                key: "board",
                title: "Board & Succession",
                icon: <FaCogs color="#FFD700" size={26} />,
                color: ["#FFD700", "#1de682"],
                metrics: [
                  { label: "Succession", val: departmentMetrics(vars).board.succession, forecast: departmentMetrics(vars).board.future },
                  { label: "Training", val: departmentMetrics(vars).board.training }
                ]
              },
              {
                key: "compliance",
                title: "Compliance & Audit",
                icon: <FaExclamationTriangle color="#FFD700" size={26} />,
                color: ["#FFD700", "#e24242"],
                metrics: [
                  { label: "Audits", val: departmentMetrics(vars).compliance.audits, forecast: departmentMetrics(vars).compliance.future },
                  { label: "Child Safety", val: departmentMetrics(vars).compliance.childSafety },
                  { label: "Financial Risk", val: departmentMetrics(vars).compliance.financialRisk }
                ]
              },
              {
                key: "resource",
                title: "Resource/Facilities",
                icon: <FaFlag color="#1de682" size={26} />,
                color: ["#1de682", "#FFD700"],
                metrics: [
                  { label: "Facilities", val: departmentMetrics(vars).resource.facilities, forecast: departmentMetrics(vars).resource.future },
                  { label: "IT Tools", val: departmentMetrics(vars).resource.ITtools },
                  { label: "Medical", val: departmentMetrics(vars).resource.medical }
                ]
              }
            ].map(sec => (
              <div key={sec.key} className="bg-[#23292fe9] rounded-3xl shadow-xl p-7 border-t-8"
                style={{
                  borderColor: sec.color[0],
                  boxShadow: "0 2px 28px " + sec.color[0] + "33"
                }}>
                <button className="flex items-center gap-2 mb-2 font-extrabold text-xl text-[#FFD700] hover:underline"
                  onClick={() => setExpanded(e => ({ ...e, [sec.key]: !e[sec.key] }))}>
                  {sec.icon}
                  {sec.title}
                  {expanded[sec.key] ?
                    <FaChevronDown color="#FFD700" /> :
                    <FaChevronRight color="#FFD700" />}
                </button>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {sec.metrics.map((m, i) =>
                    <RichRadialChart
                      key={i}
                      value={m.val}
                      label={m.label}
                      color={sec.color}
                      icon={sec.icon}
                      trend={m.forecast ? m.forecast - m.val : null}
                      forecast={m.forecast ? m.forecast - m.val : null}
                    />
                  )}
                </div>
                {expanded[sec.key] &&
                  <div className="mt-3 bg-[#181e23ee] rounded-xl p-4 shadow text-[#FFD700] font-bold">
                    {sec.metrics.map((m, i) =>
                      <div key={i} className="mb-2">
                        {m.label}: <span style={{ color: "#1de682" }}>{m.val}%</span>
                        {m.forecast &&
                          <>
                            <span style={{
                              color: (m.forecast - m.val) > 0 ? "#1de682" : "#e24242",
                              marginLeft: 8
                            }}>
                              {m.forecast > m.val ? <FaArrowUp /> : <FaArrowDown />}
                              {Math.abs(m.forecast - m.val)}% next season
                            </span>
                          </>
                        }
                      </div>
                    )}
                  </div>
                }
              </div>
            ))}
          </div>
          {/* AI Recommendation Feed */}
          <div className="bg-[#181e23f0] rounded-2xl p-7 shadow-xl mb-8">
            <div className="font-bold text-lg text-[#FFD700] mb-3 flex items-center gap-2">
              <FaRobot /> AI Boardroom Recommendations & Forecast
            </div>
            <ul>
              {aiRecs.map((rec, i) => (
                <li key={i} className="flex items-center gap-2 mb-2">
                  {rec.type === "critical" && <FaExclamationTriangle color="#e24242" />}
                  {rec.type === "warning" && <FaFlag color="#FFD700" />}
                  {rec.type === "info" && <FaCheckCircle color="#1de682" />}
                  <span style={{ color: rec.color, fontWeight: 600 }}>{rec.text}</span>
                  <span className="ml-2 text-[#1de682] text-sm italic">{rec.future}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* FOOTER */}
          <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
            <div className="text-[#FFD700] font-extrabold tracking-wider text-xl flex items-center gap-3">
              {logo &&
                <img src={logo} alt="Org Logo" style={{ height: 36, width: 36, objectFit: "contain", background: "#fff", borderRadius: 9, marginRight: 12 }} />}
              COURTEVO VERO
            </div>
            <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
          </div>
          {/* PDF-ONLY: AI recommendations as final “page” */}
          <div className="hidden-print pt-12">
            <div className="w-full text-center mt-32 pt-16">
              <span className="text-4xl font-extrabold text-[#FFD700]">AI Summary Page</span>
              <ul className="mt-8">
                {aiRecs.map((rec, i) => (
                  <li key={i} className="flex items-center gap-3 justify-center mb-3 text-2xl font-bold">
                    {rec.type === "critical" && <FaExclamationTriangle color="#e24242" />}
                    {rec.type === "warning" && <FaFlag color="#FFD700" />}
                    {rec.type === "info" && <FaCheckCircle color="#1de682" />}
                    <span style={{ color: rec.color }}>{rec.text}</span>
                    <span className="ml-2 text-[#1de682] text-lg italic">{rec.future}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-14 text-lg text-[#FFD700] font-bold">
                Date: {new Date().toLocaleDateString()} &nbsp; | &nbsp; Powered by <span className="text-[#1de682]">CourtEvo Vero</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sidebar Chat Room */}
      <div style={{
        width: 320, minWidth: 320, background: "#23292f", borderLeft: "4px solid #FFD700",
        boxShadow: "0 0 32px #181e2350", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, zIndex: 20
      }}>
        <OrgSidebarChatRoom />
      </div>
    </div>
  );
}
