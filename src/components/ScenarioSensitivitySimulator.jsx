import React, { useState } from "react";
import { FaChartPie, FaBalanceScale, FaBolt, FaExclamationTriangle, FaCheckCircle, FaArrowDown, FaArrowUp, FaDownload, FaInfoCircle, FaUserCheck, FaUserTimes, FaPlayCircle, FaHistory } from "react-icons/fa";

// Demo board members for vote workflow
const BOARD_MEMBERS = ["President", "Finance Director", "Technical Director", "Admin Lead", "Facilities Manager"];

const BASELINE = {
  revenue: 40000,
  expenses: 32000,
  staff: 13,
  sponsorVolatility: 10,
  growth: "Growth"
};
const RISK_LEVELS = [
  { value: 1, label: "Low", color: "#1de682" },
  { value: 2, label: "Medium", color: "#FFD700" },
  { value: 3, label: "High", color: "#e82e2e" }
];

// Scenario calculation (plug in real logic as needed)
function calculateScenario({ revenue, expenses, staff, sponsorVolatility }) {
  const cash = revenue - expenses;
  const savings = cash - staff * 600 - sponsorVolatility * 90;
  let risk = 1;
  if (cash < 12000 || savings < 1000) risk = 2;
  if (cash < 7000 || savings < 0) risk = 3;
  return {
    cash,
    savings,
    staff,
    sponsorVolatility,
    risk,
    alert: risk === 3
      ? "High risk! Urgent action needed."
      : risk === 2
        ? "Medium risk. Monitor and consider contingency plan."
        : "Low risk. Stable and sustainable.",
    recommendation: risk === 3
      ? "Freeze all discretionary spend and activate sponsor search immediately."
      : risk === 2
        ? "Monitor closely. Consider phased expansion only if cash improves."
        : "Clear to invest in growth or facility upgrades."
  };
}

// For radar chart
function norm(val, min, max) {
  return (val - min) / (max - min);
}

function radarPath(values, axes, rMax, cx, cy) {
  // values: array of {min, max, val}
  const points = axes.map((a, i) => {
    const angle = (2 * Math.PI * i) / axes.length - Math.PI/2;
    const r = norm(values[i].val, values[i].min, values[i].max) * rMax;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  return points.map((p,i) => (i===0?"M":"L")+p[0]+","+p[1]).join(" ")+"Z";
}

const INITIAL_HISTORY = [
  { name: "Moderate (default)", params: { ...BASELINE }, voted: null, votes: null }
];
const SENS_AXES = [
  { label: "Revenue", min: 18000, max: 65000 },
  { label: "Expenses", min: 9000, max: 60000 },
  { label: "Staff", min: 6, max: 30 },
  { label: "Sponsor Risk", min: 0, max: 35 },
  { label: "Risk", min: 1, max: 3 }
];
const RISK_SHOCKS = [
  { key: "sponsorDrop", label: "Sponsor Loss (-9000€ revenue)", impact: p => ({ ...p, revenue: Math.max(p.revenue-9000,0) }), icon: <FaBolt style={{color:"#e82e2e"}} /> },
  { key: "facilityDown", label: "Facility Shutdown (+7000€ expense)", impact: p => ({ ...p, expenses: p.expenses+7000 }), icon: <FaExclamationTriangle style={{color:"#FFD700"}} /> },
  { key: "injuryCrisis", label: "Injury Crisis (+4 staff)", impact: p => ({ ...p, staff: p.staff+4 }), icon: <FaArrowUp style={{color:"#FFD700"}} /> }
];

export default function ScenarioSensitivitySimulator() {
  const [params, setParams] = useState({ ...BASELINE });
  const [scenarioName, setScenarioName] = useState("");
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [activeIdx, setActiveIdx] = useState(0);
  const [log, setLog] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [voteStage, setVoteStage] = useState(false);
  const [votes, setVotes] = useState(BOARD_MEMBERS.map(()=>null));
  const [showRadar, setShowRadar] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [shockApplied, setShockApplied] = useState(null);

  const scenario = calculateScenario(params);
  const active = history[activeIdx];

  // Radar chart values
  const radarVals = [
    { ...SENS_AXES[0], val: params.revenue },
    { ...SENS_AXES[1], val: params.expenses },
    { ...SENS_AXES[2], val: params.staff },
    { ...SENS_AXES[3], val: params.sponsorVolatility },
    { ...SENS_AXES[4], val: scenario.risk }
  ];
  // Comparison radar for history
  const radarHist = history.map(h => [
    { ...SENS_AXES[0], val: h.params.revenue },
    { ...SENS_AXES[1], val: h.params.expenses },
    { ...SENS_AXES[2], val: h.params.staff },
    { ...SENS_AXES[3], val: h.params.sponsorVolatility },
    { ...SENS_AXES[4], val: calculateScenario(h.params).risk }
  ]);

  // Trendline demo
  const trend = [
    { year: "2021", val: 18000 + params.revenue * 0.14 - params.expenses * 0.08 },
    { year: "2022", val: 21500 + params.revenue * 0.15 - params.expenses * 0.09 },
    { year: "2023", val: scenario.cash },
    { year: "2024", val: scenario.cash * 0.98 },
    { year: "2025", val: scenario.cash * 1.04 }
  ];

  // For risk gauge
  const riskGauge = RISK_LEVELS[scenario.risk - 1];

  function handleSlider(field, value) {
    setParams(p => ({ ...p, [field]: value }));
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Scenario Change", detail: `${field} set to ${value}` }, ...l]);
  }

  function saveScenario() {
    if (!scenarioName.trim()) return;
    setHistory([{ name: scenarioName, params: { ...params }, voted: null, votes: null }, ...history]);
    setActiveIdx(0);
    setScenarioName("");
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Saved Scenario", detail: scenarioName }, ...l]);
  }

  function selectScenario(i) {
    setParams({ ...history[i].params });
    setActiveIdx(i);
    setVoteStage(false);
    setVotes(BOARD_MEMBERS.map(()=>null));
    setShockApplied(null);
  }

  function addBoardLogEntry() {
    setLog([
      { ts: new Date().toLocaleString(), name: active.name, ...scenario, action: "", votes: votes.slice() },
      ...log
    ]);
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Board Action Log", detail: active.name }, ...l]);
  }

  function handleExport() {
    setShowExport(true);
    setTimeout(() => setShowExport(false), 1000);
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Export", detail: "Exported report" }, ...l]);
  }

  function triggerVote() {
    setVoteStage(true);
    setVotes(BOARD_MEMBERS.map(()=>null));
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Vote Started", detail: active.name }, ...l]);
  }
  function voteMember(idx, val) {
    setVotes(vs => {
      const nvs = vs.slice();
      nvs[idx] = val;
      return nvs;
    });
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Vote", detail: `${BOARD_MEMBERS[idx]} voted ${val ? "YES" : "NO"}` }, ...l]);
  }
  function finalizeVote() {
    const approve = votes.filter(v => v === true).length;
    const deny = votes.filter(v => v === false).length;
    setHistory(h => {
      const nh = h.slice();
      nh[activeIdx] = { ...nh[activeIdx], voted: approve > deny, votes: votes.slice() };
      return nh;
    });
    setVoteStage(false);
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Vote Finalized", detail: `Result: ${approve > deny ? "Approved" : "Rejected"}` }, ...l]);
  }

  function applyShock(shock) {
    setParams(p => shock.impact(p));
    setShockApplied(shock.key);
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Risk Shock", detail: shock.label }, ...l]);
  }

  function clearShock() {
    setParams({ ...history[activeIdx].params });
    setShockApplied(null);
    setAuditLog(l => [{ ts: new Date().toLocaleString(), type: "Risk Shock Cleared", detail: "Reverted" }, ...l]);
  }

  // Board Approval status panel
  let approveCount = 0, denyCount = 0;
  if (active.votes) {
    approveCount = active.votes.filter(v => v === true).length;
    denyCount = active.votes.filter(v => v === false).length;
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #232a2e 0%, #283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1500,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 22px 0", background: "linear-gradient(90deg, #FFD700 40%, #1de682 100%)" }} />
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <FaChartPie style={{ fontSize: 30, color: "#FFD700", marginRight: 10 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>
          Scenario Sensitivity Simulator
        </h2>
        <button style={miniBtn} onClick={handleExport}><FaDownload style={{ marginRight: 7 }} /> Export Board Report</button>
        {showExport && <span style={{ color: "#1de682", fontWeight: 900, marginLeft: 10 }}>Exported!</span>}
        <button style={{ ...miniBtn, marginLeft: 13 }} onClick={()=>setShowRadar(r=>!r)}><FaChartPie style={{ marginRight: 7 }} /> {showRadar?"Hide Radar":"Compare Scenarios"}</button>
      </div>

      {/* Variable adjusters */}
      <div style={{ display: "flex", gap: 45, alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap" }}>
        <SliderField label="Revenue (€)" value={params.revenue} min={18000} max={65000} step={500}
          onChange={v => handleSlider("revenue", v)}
          tooltip="Total annual revenue (all sources, before costs)." />
        <SliderField label="Expenses (€)" value={params.expenses} min={9000} max={60000} step={500}
          onChange={v => handleSlider("expenses", v)}
          tooltip="Total annual operating/competitive costs." />
        <SliderField label="Staff" value={params.staff} min={6} max={30} step={1}
          onChange={v => handleSlider("staff", v)}
          tooltip="Total full-time or contracted staff." />
        <SliderField label="Sponsor Volatility" value={params.sponsorVolatility} min={0} max={35} step={1}
          onChange={v => handleSlider("sponsorVolatility", v)}
          tooltip="How unpredictable is main sponsor cash (higher = more risk, 0 = fixed)?" />
      </div>

      {/* Scenario save/compare */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 13 }}>
        <input
          style={inputStyle}
          value={scenarioName}
          onChange={e => setScenarioName(e.target.value)}
          placeholder="Name your scenario (e.g. 'Aggressive Growth')"
        />
        <button style={miniBtn} onClick={saveScenario}>Save Scenario</button>
        <span style={{ marginLeft: 25, color: "#FFD700bb" }}>Compare to:</span>
        <select
          value={activeIdx}
          onChange={e => selectScenario(Number(e.target.value))}
          style={{ ...miniBtn, background: "#232a2e", color: "#FFD700", minWidth: 200 }}
        >
          {history.map((h, i) =>
            <option key={h.name + i} value={i}>{h.name}</option>
          )}
        </select>
      </div>

      {/* Board Approval Workflow */}
      <div style={{ background: "#232a2e", borderRadius: 15, padding: "18px 24px", marginBottom: 15, display: "flex", alignItems: "center", gap: 38, flexWrap: "wrap" }}>
        <div>
          <b>Board Approval Status:</b>{" "}
          {active.voted === null ? (
            <span style={{ color: "#FFD700", fontWeight: 900 }}>Not Voted</span>
          ) : active.voted ? (
            <span style={{ color: "#1de682", fontWeight: 900 }}><FaUserCheck style={{ marginRight: 7 }} />Approved</span>
          ) : (
            <span style={{ color: "#e82e2e", fontWeight: 900 }}><FaUserTimes style={{ marginRight: 7 }} />Rejected</span>
          )}
        </div>
        <button style={{ ...miniBtn, background: "#FFD700", color: "#232a2e" }} onClick={triggerVote} disabled={voteStage}>Submit for Vote</button>
        {voteStage && (
          <div style={{ marginLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            <b>Cast Votes:</b>
            {BOARD_MEMBERS.map((m, idx) =>
              <span key={m} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#FFD700" }}>{m}</span>
                <button style={miniBtn} onClick={() => voteMember(idx, true)} disabled={votes[idx]!==null}><FaUserCheck /> Yes</button>
                <button style={{ ...miniBtn, background: "#e82e2e", color: "#fff" }} onClick={() => voteMember(idx, false)} disabled={votes[idx]!==null}><FaUserTimes /> No</button>
                {votes[idx] === true && <FaCheckCircle style={{ color: "#1de682" }} />}
                {votes[idx] === false && <FaExclamationTriangle style={{ color: "#e82e2e" }} />}
              </span>
            )}
            <button style={{ ...miniBtn, background: "#1de682", color: "#232a2e", marginTop: 9 }} onClick={finalizeVote} disabled={votes.some(v=>v===null)}>Finalize Vote</button>
          </div>
        )}
        {active.votes && (
          <div style={{ marginLeft: 17 }}>
            <b>Result: </b>
            <span style={{ color: "#1de682" }}>YES {approveCount}</span> /
            <span style={{ color: "#e82e2e", marginLeft: 8 }}>NO {denyCount}</span>
          </div>
        )}
      </div>

      {/* Risk Shock Simulator */}
      <div style={{ background: "#232a2e", borderRadius: 15, padding: "18px 24px", marginBottom: 15, display: "flex", alignItems: "center", gap: 24 }}>
        <b>Risk Shock Simulator:</b>
        {RISK_SHOCKS.map(shock =>
          <button key={shock.key} style={{ ...miniBtn, background: shockApplied===shock.key?"#FFD700":"#232a2e", color: "#FFD700", fontSize:15 }} onClick={()=>applyShock(shock)}>{shock.icon} {shock.label}</button>
        )}
        {shockApplied &&
          <button style={{ ...miniBtn, background: "#FFD700", color: "#232a2e" }} onClick={clearShock}>Revert Shock</button>
        }
      </div>

      {/* Live Radar Chart Comparison */}
      {showRadar && (
        <div style={{ background: "#232a2e", borderRadius: 15, padding: "18px 24px", marginBottom: 15 }}>
          <b style={{ color: "#FFD700", fontSize: 16 }}><FaChartPie style={{ marginRight: 7 }} /> Scenario Sensitivity Radar (Compare Saved Scenarios)</b>
          <svg width={420} height={360}>
            {/* Axes */}
            {[...Array(SENS_AXES.length)].map((_,i)=>{
              const angle = (2 * Math.PI * i)/SENS_AXES.length - Math.PI/2;
              return (
                <g key={i}>
                  <line
                    x1={210} y1={180}
                    x2={210+120*Math.cos(angle)} y2={180+120*Math.sin(angle)}
                    stroke="#FFD70044" strokeWidth={2}
                  />
                  <text
                    x={210+137*Math.cos(angle)}
                    y={180+137*Math.sin(angle)}
                    textAnchor="middle"
                    fontWeight={900}
                    fontSize={13}
                    fill="#FFD700"
                  >
                    {SENS_AXES[i].label}
                  </text>
                </g>
              );
            })}
            {/* Historical scenarios (dimmed) */}
            {radarHist.slice(1).map((vals,idx)=>
              <path
                key={idx}
                d={radarPath(vals, SENS_AXES, 120, 210, 180)}
                fill="#FFD70011"
                stroke="#FFD70055"
                strokeWidth={2}
                opacity={0.66}
              />
            )}
            {/* Current scenario */}
            <path
              d={radarPath(radarVals, SENS_AXES, 120, 210, 180)}
              fill="#FFD70055"
              stroke="#FFD700"
              strokeWidth={4}
              opacity={0.95}
            />
          </svg>
          <div style={{ color: "#FFD700bb", marginTop: 5 }}>
            <FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} /> Gold = Current; Transparent = Prior saved scenario(s).
          </div>
        </div>
      )}

      {/* Main scenario cockpit (same as before, omitted for brevity) */}
      <div style={{
        display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap"
      }}>
        {/* Risk meter */}
        <div style={{
          flex: 1,
          background: "#232a2e",
          borderRadius: 15,
          padding: 24,
          minWidth: 295,
          minHeight: 240,
          boxShadow: "0 0 22px #FFD70022",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <b style={{ color: "#FFD700", fontSize: 18, letterSpacing: 1, marginBottom: 13 }}>Risk Meter</b>
          <div style={{
            width: 112, height: 112, background: "#181e23",
            borderRadius: "50%", position: "relative", marginBottom: 14,
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${riskGauge.color}88`
          }}>
            <svg width={112} height={112} style={{ position: "absolute", top: 0, left: 0 }}>
              <circle cx={56} cy={56} r={50} fill="none" stroke="#28303e" strokeWidth={14} />
              <circle cx={56} cy={56} r={50} fill="none"
                stroke={riskGauge.color} strokeWidth={14}
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - scenario.risk / 3)}
                style={{ transition: "stroke-dashoffset 0.6s" }}
              />
            </svg>
            <span style={{ color: riskGauge.color, fontWeight: 900, fontSize: 27 }}>
              {riskGauge.label}
            </span>
          </div>
          <div style={{
            marginTop: 7,
            color: riskGauge.color,
            fontWeight: 700,
            fontSize: 16
          }}>
            <FaInfoCircle style={{ marginRight: 8 }} />
            {scenario.alert}
          </div>
        </div>
        {/* Metrics & AI Recommendation */}
        <div style={{
          flex: 2,
          background: "#232a2e",
          borderRadius: 15,
          padding: 24,
          minWidth: 370,
          minHeight: 240,
          boxShadow: "0 0 22px #FFD70022"
        }}>
          <b style={{ color: "#FFD700", fontSize: 18 }}>{active.name} Scenario Metrics</b>
          <ul style={{ fontSize: 16, fontWeight: 700, color: "#FFD700", margin: "11px 0 0 0" }}>
            <li title="Liquid cash after all revenue and cost lines.">
              <FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} /> Cash Reserves: <span style={{ color: scenario.cash < 10000 ? "#e82e2e" : "#FFD700", fontWeight: 900 }}>{scenario.cash} €</span>
            </li>
            <li title="Full-time and part-time.">
              <FaArrowUp style={{ color: "#FFD700", marginRight: 7 }} /> Staff/Contracted: <span style={{ color: "#FFD700", fontWeight: 900 }}>{scenario.staff}</span>
            </li>
            <li title="Year-end estimated net savings after all costs.">
              <FaArrowDown style={{ color: scenario.savings < 0 ? "#e82e2e" : "#1de682", fontWeight: 900, marginRight: 3 }} /> Year-End Savings: <span style={{ color: scenario.savings < 0 ? "#e82e2e" : "#1de682", fontWeight: 900 }}>{scenario.savings} €</span>
            </li>
            <li title="Sponsor revenue variability.">
              <FaBolt style={{ color: "#FFD700", marginRight: 7 }} /> Sponsor Volatility: <span style={{ color: "#FFD700", fontWeight: 900 }}>{scenario.sponsorVolatility}</span>
            </li>
          </ul>
          <div style={{
            background: "#181e23",
            borderRadius: 10,
            color: "#FFD700",
            padding: "11px 14px",
            marginTop: 11,
            fontSize: 15
          }}>
            <b>Board Recommendation:</b> {scenario.recommendation}
          </div>
          {/* AI Action */}
          <div style={{
            background: "#FFD70022",
            color: "#FFD700",
            fontWeight: 900,
            fontSize: 17,
            borderRadius: 10,
            padding: "15px 11px",
            width: "100%",
            textAlign: "center",
            marginTop: 9
          }}>
            <FaCheckCircle style={{ color: "#1de682", marginRight: 6 }} />
            AI Suggestion: {scenario.recommendation}
          </div>
        </div>
      </div>
      {/* Trendline */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "15px 18px", marginBottom: 19
      }}>
        <b style={{ color: "#FFD700", fontSize: 16 }}><FaChartPie style={{ marginRight: 7 }} /> Scenario Cashflow Trend (5 Years)</b>
        <svg width={560} height={170}>
          <polyline fill="none" stroke="#FFD700" strokeWidth={5} points={trend.map((d, i) => `${40 + i * 100},${160 - d.val / 350 * 110}`).join(" ")} />
          {/* Year markers */}
          {trend.map((d, i) => (
            <text
              key={i}
              x={40 + i * 100}
              y={165}
              textAnchor="middle"
              fontSize={13}
              fill="#FFD700"
              fontWeight={900}
            >{d.year}</text>
          ))}
          {/* Value markers */}
          {trend.map((d, i) => (
            <circle key={i} cx={40 + i * 100} cy={160 - d.val / 350 * 110} r={8} fill="#FFD700" stroke="#232a2e" strokeWidth={3} />
          ))}
        </svg>
        <div style={{ color: "#FFD700bb", marginTop: 5 }}>
          <FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} /> Gold = Current Scenario (compare others above)
        </div>
      </div>
      {/* Board Action Log */}
      <div style={{
        background: "#181e23", color: "#FFD700", borderRadius: 10,
        padding: "11px 14px", fontWeight: 700, marginBottom: 11
      }}>
        <b>Board Action Log:</b>
        <button style={{ ...miniBtn, marginLeft: 16 }} onClick={addBoardLogEntry}>
          Add Log Entry (demo)
        </button>
        <ul style={{ marginTop: 7 }}>
          {log.length === 0 && <li style={{ color: "#FFD70099" }}>No board actions logged yet.</li>}
          {log.map((entry, i) => (
            <li key={i}>
              [{entry.ts}] {entry.name} — Cash: <b>{entry.cash}€</b>, Savings: <b>{entry.savings}€</b>, Risk: <span style={{ color: RISK_LEVELS[entry.risk - 1].color }}>{RISK_LEVELS[entry.risk - 1].label}</span>
              {entry.votes && <span style={{ marginLeft: 13 }}>| Vote: <span style={{ color: entry.votes.filter(v=>v).length>entry.votes.filter(v=>v===false).length?"#1de682":"#e82e2e" }}>{entry.votes.filter(v=>v).length>entry.votes.filter(v=>v===false).length?"APPROVED":"REJECTED"}</span></span>}
            </li>
          ))}
        </ul>
      </div>
      {/* Audit Log */}
      <div style={{
        background: "#232a2e", color: "#FFD700", borderRadius: 10,
        padding: "10px 13px", fontWeight: 700, marginBottom: 7, fontSize:14
      }}>
        <FaHistory style={{marginRight:7}}/>
        <b>Audit Log:</b>
        <ul style={{ marginTop: 5 }}>
          {auditLog.length === 0 && <li style={{ color: "#FFD70077" }}>No audit events yet.</li>}
          {auditLog.slice(0,8).map((e,i)=>(
            <li key={i}>
              [{e.ts}] <b>{e.type}</b> — <span style={{ color: "#FFD700bb" }}>{e.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Final Advisory */}
      <div style={{
        background: "#181e23", color: "#FFD700", borderRadius: 10,
        padding: "12px 14px", fontWeight: 700, fontSize: 15, marginTop: 12
      }}>
        <FaBalanceScale style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Boardroom Guidance:</b> Every scenario, shock, vote, and metric—fully auditable and visually actionable for the board.
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, tooltip }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 110, alignItems: "center" }}>
      <label style={{ color: "#FFD700", fontWeight: 900, fontSize: 15, marginBottom: 6 }}>
        {label}
        <FaInfoCircle title={tooltip} style={{ color: "#1de682", marginLeft: 7, cursor: "help" }} />
      </label>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: 120, accentColor: "#FFD700", marginBottom: 5
        }}
      />
      <div style={{
        fontWeight: 900,
        color: "#FFD700",
        fontSize: 17,
        background: "#232a2e",
        borderRadius: 8,
        padding: "4px 10px"
      }}>{value}</div>
    </div>
  );
}

const miniBtn = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 15,
  padding: "7px 13px",
  cursor: "pointer"
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "6px 8px",
  margin: "7px 0"
};
