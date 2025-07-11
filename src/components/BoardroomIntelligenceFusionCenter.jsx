import React, { useState } from "react";
import {
  FaHeartbeat, FaEuroSign, FaUserTie, FaFlag, FaRobot, FaUsers, FaCheckCircle,
  FaExclamationTriangle, FaArrowUp, FaArrowDown, FaDownload, FaCalendarAlt, FaComments, FaPaperPlane, FaSitemap
} from "react-icons/fa";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import "./BoardroomIntelligenceFusionCenter.css";

// --- Demo Data by Org ---
const orgs = [
  {
    key: "club", label: "Demo Club", color: "#FFD700", orgHealth: 6.3, finHealth: 124000, riskLevel: 1, talentCount: 14, boardClarity: 94,
    kpi: [
      {
        icon: <FaEuroSign />, label: "Financial", value: "€124k", trend: "+14k", pos: true, alert: false, key: "finance",
        history: [110, 116, 118, 121, 122, 124], volume: [450, 420, 470, 540, 490, 520]
      },
      {
        icon: <FaUsers />, label: "Talent Promoted", value: "14", trend: "+2", pos: true, alert: false, key: "talent",
        history: [10, 11, 11, 12, 13, 14], volume: [3, 2, 2, 4, 1, 2]
      },
      {
        icon: <FaUserTie />, label: "RACI Conflicts", value: "1", trend: "-2", pos: true, alert: true, key: "raci",
        history: [4, 3, 2, 3, 2, 1], volume: [1, 2, 1, 1, 2, 1]
      },
      {
        icon: <FaHeartbeat />, label: "Medical", value: "1 Alert", trend: "0", pos: false, alert: true, key: "medical",
        history: [0, 1, 0, 1, 1, 1], volume: [0, 1, 1, 0, 1, 1]
      },
      {
        icon: <FaCheckCircle />, label: "Compliance", value: "100%", trend: "0", pos: true, alert: false, key: "compliance",
        history: [90, 95, 98, 99, 100, 100], volume: [2, 0, 1, 0, 0, 0]
      }
    ],
    alerts: [
      { icon: <FaExclamationTriangle />, text: "Role Overload: Technical Director (3 areas)", color: "#f2a900", kpi: "raci" },
      { icon: <FaFlag />, text: "RACI Conflict: Marketing (2 A assigned)", color: "#FFD700", kpi: "raci" },
      { icon: <FaHeartbeat />, text: "Medical Alert: 1 athlete not cleared", color: "#f35650", kpi: "medical" },
      { icon: <FaEuroSign />, text: "Travel Expenses exceeded budget (Finance)", color: "#f2a900", kpi: "finance" }
    ],
    timeline: [
      { date: "2024-07-03", label: "Quarterly Board Meeting", icon: <FaCalendarAlt />, important: true, sim: "meeting" },
      { date: "2024-07-07", label: "Talent Promotion Review", icon: <FaUsers />, sim: "talentWave" },
      { date: "2024-07-15", label: "Budget Reforecast", icon: <FaEuroSign />, sim: "budgetCut" },
      { date: "2024-07-19", label: "Compliance Audit", icon: <FaCheckCircle />, sim: "audit" },
      { date: "2024-07-22", label: "Scenario: Board Role Reshuffle", icon: <FaUserTie />, sim: "roleShuffle" },
    ],
    boardLog: [
      { time: "2024-06-19", text: "Approved annual surplus strategy.", status: "approved" },
      { time: "2024-06-20", text: "Role conflict flagged in Marketing.", status: "alert" },
      { time: "2024-06-21", text: "Travel expenses exceeded Q2 budget.", status: "alert" },
      { time: "2024-06-21", text: "Compliance cleared.", status: "ok" },
    ],
    roles: [
      { name: "President", status: "ok", orgs: ["club"], history: [6, 6, 6, 6, 7, 6.3] },
      { name: "Technical Director", status: "overload", orgs: ["club"], history: [4, 5, 6, 7, 5, 6.3] },
      { name: "Finance Director", status: "ok", orgs: ["club"], history: [7, 7, 7, 7, 7, 7] },
      { name: "Head Coach", status: "ok", orgs: ["club"], history: [5, 5, 5.5, 6, 6.1, 6] },
      { name: "Marketing Manager", status: "conflict", orgs: ["club"], history: [2, 2, 3, 2, 3, 2] },
      { name: "Medical Chief", status: "vacant", orgs: ["club"], history: [6, 6, 6, 5, 4, 4] }
    ]
  },
  {
    key: "academy", label: "Demo Academy", color: "#35b378", orgHealth: 5.6, finHealth: 55000, riskLevel: 2, talentCount: 19, boardClarity: 88,
    kpi: [
      {
        icon: <FaEuroSign />, label: "Financial", value: "€55k", trend: "-5k", pos: false, alert: true, key: "finance",
        history: [62, 60, 57, 58, 59, 55], volume: [350, 320, 310, 300, 290, 270]
      },
      {
        icon: <FaUsers />, label: "Talent Promoted", value: "19", trend: "+1", pos: true, alert: false, key: "talent",
        history: [14, 15, 16, 18, 19, 19], volume: [2, 2, 3, 3, 4, 5]
      },
      {
        icon: <FaUserTie />, label: "RACI Conflicts", value: "2", trend: "+1", pos: false, alert: true, key: "raci",
        history: [0, 1, 1, 2, 2, 2], volume: [0, 1, 0, 2, 1, 2]
      },
      {
        icon: <FaHeartbeat />, label: "Medical", value: "0 Alert", trend: "0", pos: true, alert: false, key: "medical",
        history: [0, 0, 0, 0, 0, 0], volume: [0, 0, 0, 0, 0, 0]
      },
      {
        icon: <FaCheckCircle />, label: "Compliance", value: "96%", trend: "-4%", pos: false, alert: false, key: "compliance",
        history: [100, 99, 98, 97, 96, 96], volume: [0, 0, 0, 1, 1, 1]
      }
    ],
    alerts: [
      { icon: <FaEuroSign />, text: "Academy deficit: Surplus drop to €55k", color: "#f35650", kpi: "finance" },
      { icon: <FaUserTie />, text: "RACI Conflicts in Admin & Coaching", color: "#f2a900", kpi: "raci" }
    ],
    timeline: [
      { date: "2024-07-01", label: "Youth Intake", icon: <FaUsers />, sim: "talentWave" },
      { date: "2024-07-05", label: "Quarterly Audit", icon: <FaCheckCircle />, sim: "audit" },
      { date: "2024-07-13", label: "Financial Review", icon: <FaEuroSign />, sim: "budgetCut" },
    ],
    boardLog: [
      { time: "2024-06-12", text: "RACI restructured after conflict.", status: "approved" },
      { time: "2024-06-18", text: "Compliance dropped post audit.", status: "alert" }
    ],
    roles: [
      { name: "Academy Director", status: "ok", orgs: ["academy"], history: [6, 5.5, 6, 6, 5, 5.6] },
      { name: "Youth Lead", status: "ok", orgs: ["academy"], history: [6, 7, 7, 7, 7, 7] },
      { name: "Admin Chief", status: "conflict", orgs: ["academy"], history: [2, 3, 2, 3, 2, 2] }
    ]
  },
  {
    key: "federation", label: "Demo Federation", color: "#283E51", orgHealth: 6.9, finHealth: 278000, riskLevel: 0, talentCount: 26, boardClarity: 99,
    kpi: [
      {
        icon: <FaEuroSign />, label: "Financial", value: "€278k", trend: "+26k", pos: true, alert: false, key: "finance",
        history: [220, 225, 240, 255, 270, 278], volume: [800, 850, 860, 870, 900, 980]
      },
      {
        icon: <FaUsers />, label: "Talent Promoted", value: "26", trend: "+4", pos: true, alert: false, key: "talent",
        history: [19, 21, 22, 23, 24, 26], volume: [2, 2, 4, 5, 6, 7]
      },
      {
        icon: <FaUserTie />, label: "RACI Conflicts", value: "0", trend: "-1", pos: true, alert: false, key: "raci",
        history: [3, 2, 2, 1, 1, 0], volume: [1, 1, 1, 0, 0, 0]
      },
      {
        icon: <FaHeartbeat />, label: "Medical", value: "0 Alert", trend: "0", pos: true, alert: false, key: "medical",
        history: [0, 0, 0, 0, 0, 0], volume: [0, 0, 0, 0, 0, 0]
      },
      {
        icon: <FaCheckCircle />, label: "Compliance", value: "100%", trend: "0", pos: true, alert: false, key: "compliance",
        history: [99, 100, 100, 100, 100, 100], volume: [0, 0, 0, 0, 0, 0]
      }
    ],
    alerts: [],
    timeline: [
      { date: "2024-07-02", label: "Board Review", icon: <FaCalendarAlt />, important: true, sim: "meeting" },
      { date: "2024-07-10", label: "Club Licencing", icon: <FaCheckCircle />, sim: "audit" }
    ],
    boardLog: [
      { time: "2024-06-19", text: "All targets met. Board praised clarity.", status: "ok" }
    ],
    roles: [
      { name: "President", status: "ok", orgs: ["federation"], history: [7, 7, 6.5, 7, 6.9, 6.9] },
      { name: "Secretary", status: "ok", orgs: ["federation"], history: [6, 6.5, 7, 6.9, 6.9, 7] }
    ]
  }
];

// --- Modal Overlay Component for Role Drilldown ---
function RoleModal({ role, onClose }) {
  if (!role) return null;
  return (
    <div className="fusion-role-modal-overlay" onClick={onClose}>
      <div className="fusion-role-modal" onClick={e=>e.stopPropagation()}>
        <button className="fusion-role-close" onClick={onClose}>×</button>
        <div className="fusion-role-modal-header">
          <FaUserTie style={{marginRight:10}}/>
          <span className="fusion-role-name">{role.name}</span>
          <span className={`fusion-role-badge fusion-${role.status}`}>{role.status.toUpperCase()}</span>
        </div>
        <div className="fusion-role-assignments">
          <b>Assignments:</b>
          <ul>
            {role.orgs.map((o,i)=>
              <li key={i}><FaSitemap style={{marginRight:5}}/>{o.charAt(0).toUpperCase()+o.slice(1)}</li>
            )}
          </ul>
        </div>
        <div className="fusion-role-history">
          <b>Performance (Last 6 Months):</b>
          <div style={{height:80, margin:"12px 0"}}>
            <ResponsiveLine
              data={[{
                id: "Org Health", data: role.history.map((v,i)=>({x:i+1,y:v}))
              }]}
              margin={{top:8,right:8,bottom:24,left:28}}
              xScale={{type:"point"}}
              yScale={{type:"linear", min:0, max:7}}
              curve="monotoneX"
              colors={["#FFD700"]}
              enablePoints={false}
              axisBottom={null}
              axisLeft={null}
              gridYValues={[2,4,6]}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="fusion-role-actions">
          <button className="fusion-role-approve"><FaCheckCircle/> Approve Assignment</button>
          <button className="fusion-role-reassign"><FaRobot/> AI Reassign</button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function BoardroomIntelligenceFusionCenter() {
  // State
  const [orgKey, setOrgKey] = useState("club");
  const [roleModal, setRoleModal] = useState(null);
  const [noteMsg, setNoteMsg] = useState("");
  const [noteKPI, setNoteKPI] = useState("finance");

  // Select active org data
  const org = orgs.find(o=>o.key===orgKey);
  const { orgHealth, finHealth, riskLevel, talentCount, boardClarity } = org;

  // Simulate AI Copilot logic
  function aiCopilotText() {
    if (org.alerts.length > 0) return `Risks: ${org.alerts.map(a=>a.text).join(" | ")}. Next: Approve, resolve conflicts, run AI RACI scenario.`;
    return "All clear. Monitor for deadlines, simulate a board scenario, and review quicknotes.";
  }

  // Simulate scenario runs: (no backend, just a banner here)
  const [simBanner, setSimBanner] = useState(null);
  function runScenario(type) {
    let msg = "";
    if (type === "talentWave") msg = "Talent promotion wave simulated. Talent Pipeline, Board Clarity improved.";
    if (type === "budgetCut") msg = "Budget cut simulated. Surplus drops, financial alert raised.";
    if (type === "roleShuffle") msg = "Role shuffle simulated. RACI conflicts resolved, Org Health up.";
    if (type === "audit") msg = "Audit fail simulated. Compliance alert raised, risk up.";
    if (type === "meeting") msg = "Quarterly Board Meeting scenario exported for review.";
    if (msg) {
      setSimBanner(msg);
      setTimeout(() => setSimBanner(null), 4000);
    }
  }

  // QuickNotes handling
  const [quickNotes, setQuickNotes] = useState(org.key === "club"
    ? [
        { author: "President", msg: "Flag finance/talent for deeper review next quarter.", time: "2024-06-20 12:08", kpi: "finance" }
      ]
    : []
  );
  function submitNote() {
    if (noteMsg.trim()) {
      setQuickNotes(n=>[
        ...n,
        { author: "You", msg: noteMsg, time: new Date().toISOString().slice(0,16).replace("T"," "), kpi: noteKPI }
      ]);
      setNoteMsg(""); setNoteKPI("finance");
    }
  }

  // For KPI card QuickNote badge
  function hasNote(k) { return quickNotes.some(n => n.kpi === k.key); }

  return (
    <div className="fusion-main">
      {/* ORG SWITCHER */}
      <div className="fusion-org-row">
        <div className="fusion-org-badge" style={{background: org.color}}>
          <FaSitemap /> {org.label}
        </div>
        <select
          className="fusion-org-switch"
          value={orgKey}
          onChange={e=>{ setOrgKey(e.target.value); setRoleModal(null); setQuickNotes([]); }}
        >
          {orgs.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      <div className="fusion-header">
        <h2><FaSitemap style={{marginRight:9}}/>Boardroom Intelligence Fusion Center</h2>
        <div className="fusion-sub">ALL-ORG COCKPIT • BOARD-LEVEL INTELLIGENCE • NO WEAK LINKS</div>
      </div>

      {/* Org Heatmap */}
      <div className="fusion-heatmap-row">
        {org.kpi.map((c,i)=>
          <div key={i} className={`fusion-heatmap-cell ${c.alert ? "fusion-heat-danger" : c.pos ? "fusion-heat-ok" : "fusion-heat-warning"}`}
            title={c.label + ": " + c.value}
            onClick={()=>window.alert(`Area: ${c.label}\nStatus: ${c.value}\nTrend: ${c.trend}`)}
          >
            {c.icon}
            <span className="fusion-heatmap-label">{c.label}</span>
          </div>
        )}
      </div>

      {/* Headline Dials */}
      <div className="fusion-dials-row">
        <Dial label="Org Health" value={orgHealth} max={7} color="#FFD700" />
        <Dial label="Finance" value={finHealth} prefix="€" max={250000} color="#35b378" />
        <Dial label="Risk Level" value={riskLevel} max={3} color={riskLevel>1?"#f35650":"#FFD700"} />
        <Dial label="Talent Pipeline" value={talentCount} max={30} color="#FFD700" />
        <Dial label="Board Clarity" value={boardClarity} max={100} suffix="%" color="#35b378" />
      </div>

      {/* KPIs with Nivo charts */}
      <div className="fusion-kpi-row">
        {org.kpi.map((k,i)=>
          <div className={`fusion-kpi-card${k.alert?' fusion-kpi-alert':''}`} key={k.label}>
            <div className="fusion-kpi-icon">{k.icon}</div>
            <div className="fusion-kpi-main">{k.value}</div>
            <div className="fusion-kpi-label">{k.label}</div>
            <div className="fusion-kpi-trend" style={{color: k.pos?"#35b378":"#f35650"}}>
              {k.pos ? <FaArrowUp /> : <FaArrowDown />} {k.trend}
            </div>
            <div className="fusion-kpi-nivo-charts">
              <div className="fusion-kpi-nivo">
                <ResponsiveLine
                  data={[{
                    id: k.label + " Trend",
                    data: k.history.map((y,idx)=>({x: `M${idx+1}`, y}))
                  }]}
                  margin={{top:6,right:6,bottom:14,left:10}}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                  colors={['#FFD700']}
                  enablePoints={false}
                  axisBottom={null}
                  axisLeft={null}
                  gridYValues={[]}
                  theme={{ axis: { ticks: { text: { fill: "#FFD700" } } }, grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } } }}
                  isInteractive={false}
                  animate={false}
                  height={36}
                  width={76}
                />
              </div>
              <div className="fusion-kpi-nivo">
                <ResponsiveBar
                  data={k.volume.map((y,idx)=>({x: `M${idx+1}`, y}))}
                  keys={['y']}
                  indexBy="x"
                  margin={{top:6,right:6,bottom:14,left:10}}
                  padding={0.3}
                  colors={['#35b378']}
                  axisBottom={null}
                  axisLeft={null}
                  enableGridY={false}
                  labelSkipWidth={100}
                  labelSkipHeight={100}
                  theme={{ axis: { ticks: { text: { fill: "#FFD700" } } }, grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } } }}
                  isInteractive={false}
                  animate={false}
                  height={36}
                  width={76}
                />
              </div>
            </div>
            <div className="fusion-kpi-note-badge">
              {hasNote(k) && <FaComments title="QuickNote attached"/>}
            </div>
          </div>
        )}
      </div>

      {/* Sim banner */}
      {simBanner && (
        <div className="fusion-sim-banner"><FaRobot/> {simBanner}</div>
      )}

      {/* Alerts, Timeline, Approvals */}
      <div className="fusion-row fusion-row-split">
        <div className="fusion-feed">
          <h4>CRITICAL EVENTS & ALERTS</h4>
          <ul>
            {org.alerts.length===0 && <li style={{color:"#35b378"}}><FaCheckCircle/> No critical events pending.</li>}
            {org.alerts.map((a,i)=>
              <li key={i} style={{color: a.color}}>
                {a.icon} {a.text}
                <button className="fusion-approve-btn" onClick={()=>window.alert('Approve logic placeholder')}>
                  <FaCheckCircle/> Approve
                </button>
              </li>
            )}
          </ul>
        </div>
        <div className="fusion-timeline">
          <h4>UPCOMING BOARD TIMELINE</h4>
          <ul>
            {org.timeline.map((t,i)=>
              <li key={i} className={t.important?"fusion-timeline-important":""}
                  onClick={()=>runScenario(t.sim)}>
                <span className="fusion-timeline-date">{t.date}</span>
                <span className="fusion-timeline-icon">{t.icon}</span>
                <span>{t.label}</span>
                <button className="fusion-sim-btn" title="Simulate event"><FaRobot/></button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Org Key Roles + Quicknotes */}
      <div className="fusion-row">
        <div className="fusion-orgchart">
          <h4>LEADERSHIP & KEY ROLES</h4>
          <ul>
            {org.roles.map((r,i)=>
              <li key={i} className={`fusion-role-${r.status}`}
                  onClick={()=>setRoleModal(r)}
                  style={{cursor: "pointer"}}
              >
                <FaUserTie style={{marginRight:5}}/>
                {r.name}
                {r.status==="ok" && <span className="fusion-role-badge fusion-ok">OK</span>}
                {r.status==="conflict" && <span className="fusion-role-badge fusion-conflict">Conflict</span>}
                {r.status==="overload" && <span className="fusion-role-badge fusion-overload">Overload</span>}
                {r.status==="vacant" && <span className="fusion-role-badge fusion-vacant">Vacant</span>}
              </li>
            )}
          </ul>
        </div>
        {/* QuickNotes */}
        <div className="fusion-quicknotes">
          <h4>BOARD QUICK NOTES</h4>
          <ul>
            {quickNotes.map((n,i)=>
              <li key={i}>
                <b>{n.author}:</b> {n.msg}
                <span className="fusion-qnote-time">{n.time}</span>
                <span className="fusion-qnote-kpi">{n.kpi.toUpperCase()}</span>
              </li>
            )}
          </ul>
          <div className="fusion-qnote-compose">
            <input value={noteMsg} onChange={e=>setNoteMsg(e.target.value)} placeholder="Add QuickNote…" />
            <select value={noteKPI} onChange={e=>setNoteKPI(e.target.value)}>
              {org.kpi.map(k=><option value={k.key} key={k.key}>{k.label}</option>)}
            </select>
            <button onClick={submitNote}><FaPaperPlane/></button>
          </div>
        </div>
      </div>

      {/* AI Copilot and API Banner */}
      <div className="fusion-ai-copilot">
        <FaRobot style={{color: "#FFD700", marginRight:8, fontSize:22}} />
        <span>AI Board Copilot: {aiCopilotText()}</span>
        <button className="fusion-ai-btn"><FaDownload/> Board Pack</button>
        <span className="fusion-api-banner" title="Future-ready: Push to Slack, Teams, HR, or email.">API: Integration Ready</span>
      </div>

      {/* Board Log */}
      <div className="fusion-boardlog">
        <h4>BOARDROOM DECISION LOG</h4>
        <ul>
          {org.boardLog.map((l,i)=>(
            <li key={i} className={`fusion-boardlog-${l.status}`}>
              <span className="fusion-boardlog-time">{l.time}</span>
              <span className="fusion-boardlog-text">{l.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Role Drill-Down Modal */}
      {roleModal &&
        <RoleModal role={roleModal} onClose={()=>setRoleModal(null)} />
      }
    </div>
  );
}

// --- SVG Dial (headline metrics)
function Dial({ label, value, max, color, prefix, suffix }) {
  const pct = Math.min(1, value / max);
  const ang = 270 * pct + 135;
  return (
    <div className="fusion-dial">
      <svg width="83" height="83">
        <circle cx="41.5" cy="41.5" r="34" stroke="#283E51" strokeWidth="11" fill="none"/>
        <path
          d={`M41.5,41.5 L41.5,7.5 A34,34 0 ${ang>360?1:0} 1 ${41.5 + 34*Math.cos((ang-90)*Math.PI/180)},${41.5+34*Math.sin((ang-90)*Math.PI/180)}`}
          stroke={color}
          strokeWidth="9"
          fill="none"
        />
        <circle cx="41.5" cy="41.5" r="21" fill="#22272b"/>
        <text x="50%" y="51%" textAnchor="middle" fontSize="20" fill={color} fontWeight="800" dy="0.3em">
          {prefix||""}{typeof value==="number"?value:suffix?value:suffix||""}
        </text>
      </svg>
      <div className="fusion-dial-label">{label}</div>
    </div>
  );
}

