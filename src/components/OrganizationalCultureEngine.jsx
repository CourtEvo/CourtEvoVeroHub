// src/components/OrganizationalCultureEngine.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  FaUserTie, FaUsers, FaHandHoldingHeart, FaBrain, FaRegSmile, FaRegStar,
  FaBolt, FaCheck, FaExclamationTriangle, FaGlobeEurope, FaArrowUp, FaArrowDown,
  FaChartPie, FaLightbulb, FaSitemap, FaBookOpen, FaCrown, FaPlus, FaRocket, FaEye, FaFilePdf
} from "react-icons/fa";

// ========== Design Tokens & Data ==========
const palette = {
  bg: "#182033",
  card: "rgba(22,25,38,0.96)",
  gold: "#FFD700",
  green: "#1de682",
  silver: "#ececec",
  blue: "#3956a5",
  accent: "#43e0d9",
  risk: "#f56565"
};

const pillars = [
  { key: "trust", label: "Trust", icon: <FaHandHoldingHeart /> },
  { key: "accountability", label: "Accountability", icon: <FaCheck /> },
  { key: "growth", label: "Growth Mindset", icon: <FaArrowUp /> },
  { key: "resilience", label: "Resilience", icon: <FaBolt /> },
  { key: "communication", label: "Communication", icon: <FaRegSmile /> },
  { key: "inclusion", label: "Inclusion", icon: <FaGlobeEurope /> },
  { key: "leadership", label: "Leadership", icon: <FaCrown /> }
];

const roleViews = [
  { key: "board", label: "Board", color: "#FFD700", icon: <FaUserTie /> },
  { key: "coach", label: "Coach", color: "#1de682", icon: <FaUsers /> },
  { key: "athlete", label: "Athlete", color: "#ececec", icon: <FaRegStar /> }
];

const defaultScores = {
  trust: 76, accountability: 62, growth: 89, resilience: 57, communication: 71, inclusion: 81, leadership: 65
};
const pulseTimeline = [
  { date: "2025-06-01", score: 68, milestone: "Season review" },
  { date: "2025-06-13", score: 71 },
  { date: "2025-06-27", score: 75, milestone: "Coach hired" },
  { date: "2025-07-05", score: 78 },
  { date: "2025-07-10", score: 74, milestone: "Injury crisis" },
  { date: "2025-07-12", score: 79, milestone: "Team retreat" }
];

const feedbackSnippets = [
  "“Our voices are finally being heard by the staff.”",
  "“After the retreat, trust has improved on and off the court.”",
  "“We still struggle to hold each other accountable in tough moments.”",
  "“Leadership from the captains has made a real difference.”",
  "“I feel more included this season than last.”"
];

const recommendations = {
  trust: [
    "Run 'blindfold' partner passing games.",
    "Highlight positive risk-taking in meetings.",
    "Use player-led check-ins weekly."
  ],
  accountability: [
    "Use peer-to-peer performance reviews.",
    "Coach shares personal error before session.",
    "Publish a weekly 'promise vs. action' dashboard."
  ],
  growth: [
    "Reward visible effort, not just results.",
    "Invite athlete questions at every meeting.",
    "Coach reads a favorite sport bio monthly to team."
  ],
  resilience: [
    "Simulate setbacks in practice games.",
    "Reflect on losses as learning sessions.",
    "Celebrate bounce-back moments."
  ],
  communication: [
    "Rotate athlete-led huddles.",
    "Share one 'plus' and one 'must improve' after every practice.",
    "Gamify clear on-court talk (who calls out most screens?)"
  ],
  inclusion: [
    "Anonymous pulse survey on belonging, 1x/month.",
    "Rotate leadership for group activities.",
    "Invite families to 'open practice' twice a season."
  ],
  leadership: [
    "Boardroom shadowing for top athlete weekly.",
    "Peer-nominated 'leader of the week'.",
    "Coach/athlete joint planning for key games."
  ]
};

const defaultCultureMoments = [
  { date: "2025-07-01", who: "Head Coach", pillar: "trust", description: "Coach praised assistant for new defensive scheme.", highlight: true },
  { date: "2025-07-05", who: "Athlete", pillar: "resilience", description: "Player returned from injury, led practice.", highlight: false },
  { date: "2025-07-09", who: "Parent", pillar: "communication", description: "Parent feedback led to better session timing.", highlight: true }
];

const defaultMilestones = [
  { date: "2025-06-27", event: "Coach hired", pillar: "growth", desc: "New leadership to focus on development." },
  { date: "2025-07-10", event: "Injury crisis", pillar: "resilience", desc: "Team must step up after key injury." },
  { date: "2025-07-12", event: "Team retreat", pillar: "trust", desc: "Building bonds and unity." }
];

// ========== Component ==========
export default function OrganizationalCultureEngine() {
  const [role, setRole] = useState("board");
  const [scores, setScores] = useState(defaultScores);
  const [selectedPillar, setSelectedPillar] = useState(pillars[0].key);
  const [cultureMoments, setCultureMoments] = useState(defaultCultureMoments);
  const [momentDesc, setMomentDesc] = useState("");
  const [momentPillar, setMomentPillar] = useState(pillars[0].key);
  const [milestones, setMilestones] = useState(defaultMilestones);
  const [milestoneEvent, setMilestoneEvent] = useState("");
  const [milestonePillar, setMilestonePillar] = useState(pillars[0].key);
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [feedbackIdx, setFeedbackIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFeedbackIdx(idx => (idx + 1) % feedbackSnippets.length), 4200);
    return () => clearInterval(interval);
  }, []);

  // Risk
  const atRisk = Object.keys(scores).filter(key => scores[key] < 60);

  // Quick-win AI coach
  const quickWin = atRisk.length
    ? `Immediate action: ${recommendations[atRisk[0]][0]}`
    : "All pillars healthy. Continue current leadership strategies!";

  // Spider chart math
  const size = 330, center = size / 2, radius = 115;
  const points = pillars.map((pillar, i) => {
    const angle = (i / pillars.length) * 2 * Math.PI - Math.PI / 2;
    const value = scores[pillar.key] / 100;
    return [
      center + Math.cos(angle) * radius * value,
      center + Math.sin(angle) * radius * value
    ];
  });
  const axisEnds = pillars.map((pillar, i) => {
    const angle = (i / pillars.length) * 2 * Math.PI - Math.PI / 2;
    return [
      center + Math.cos(angle) * radius,
      center + Math.sin(angle) * radius
    ];
  });

  // Pillar info pane
  const activePillar = pillars.find(p => p.key === selectedPillar);

  // Executive dashboard data
  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / pillars.length);
  const minKey = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b, pillars[0].key);
  const topTrendKey = Object.keys(scores).reduce((a, b) => {
    const curr = scores[a] - (defaultScores[a] || 0);
    const next = scores[b] - (defaultScores[b] || 0);
    return curr > next ? a : b;
  }, pillars[0].key);

  // Group moments by pillar
  const groupedMoments = useMemo(() => {
    const groups = {};
    pillars.forEach(p => { groups[p.key] = []; });
    cultureMoments.forEach(m => { groups[m.pillar]?.push(m); });
    return groups;
  }, [cultureMoments]);

  // Add culture moment
  const addCultureMoment = () => {
    if (!momentDesc.trim()) return;
    setCultureMoments(arr => [
      {
        date: new Date().toISOString().slice(0, 10),
        who: roleViews.find(r => r.key === role).label,
        pillar: momentPillar,
        description: momentDesc,
        highlight: false
      },
      ...arr
    ]);
    setMomentDesc("");
  };
  // Add milestone
  const addMilestone = () => {
    if (!milestoneEvent.trim() || !milestoneDesc.trim()) return;
    setMilestones(arr => [
      ...arr,
      {
        date: new Date().toISOString().slice(0, 10),
        event: milestoneEvent,
        pillar: milestonePillar,
        desc: milestoneDesc
      }
    ]);
    setMilestoneEvent(""); setMilestoneDesc("");
  };

  return (
    <div style={{
      minHeight: "98vh", background: palette.bg,
      fontFamily: "Segoe UI, sans-serif", color: "#fff", padding: 38, paddingBottom: 100
    }}>
      {/* Executive Row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20
      }}>
        <div style={{
          fontWeight: 900, fontSize: 38, letterSpacing: 2, color: palette.gold,
          textShadow: "0 3px 28px #FFD70030"
        }}>
          <FaUsers style={{ color: palette.green, marginRight: 15, fontSize: 32, verticalAlign: "middle" }} />
          COURTEVO VERO CULTURE & LEADERSHIP ENGINE
        </div>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <div style={{
            background: "#1b2a36", color: palette.gold, borderRadius: 11, padding: "7px 16px", fontWeight: 900, fontSize: 17
          }}>Avg: {avgScore}</div>
          <div style={{
            background: "#1b2a36", color: palette.risk, borderRadius: 11, padding: "7px 16px", fontWeight: 900, fontSize: 17
          }}>Lowest: {pillars.find(p=>p.key===minKey).label} ({scores[minKey]})</div>
          <div style={{
            background: "#1b2a36", color: palette.green, borderRadius: 11, padding: "7px 16px", fontWeight: 900, fontSize: 17
          }}>Top Trending: {pillars.find(p=>p.key===topTrendKey).label}</div>
          <div style={{
            background: atRisk.length ? palette.risk : palette.green, color: palette.bg,
            borderRadius: 11, padding: "7px 16px", fontWeight: 900, fontSize: 17
          }}>{atRisk.length ? `Risks: ${atRisk.length}` : "All Healthy"}</div>
        </div>
      </div>
      {/* Role Switch */}
      <div style={{
        display: "flex", gap: 12, alignItems: "center", marginBottom: 15
      }}>
        {roleViews.map(rv => (
          <div key={rv.key} onClick={()=>setRole(rv.key)} style={{
            background: role===rv.key ? rv.color : "#21294c", color: role===rv.key ? palette.bg : "#fff",
            fontWeight: 900, borderRadius: 8, padding: "7px 20px", fontSize: 16, cursor: "pointer", marginRight: 2,
            borderBottom: role===rv.key ? "4px solid #FFD700" : "none", transition: "all 0.2s"
          }}>{rv.icon} {rv.label}</div>
        ))}
        <span style={{
          background: "#23294a", color: palette.gold, borderRadius: 11, padding: "7px 18px",
          fontWeight: 900, fontSize: 15, letterSpacing: 1, marginLeft: 15
        }}>
          <FaEye style={{marginRight:8}}/>VIEW MODE
        </span>
      </div>
      {/* Org feedback ticker */}
      <div style={{
        margin: "7px 0 20px 0", background: palette.card, borderRadius: 12,
        boxShadow: "0 2px 8px #FFD70022", padding: "13px 20px", color: palette.gold, fontWeight: 800, fontSize: 18
      }}>
        <FaLightbulb style={{ marginRight: 11, color: palette.green }} />
        {feedbackSnippets[feedbackIdx]}
      </div>
      {/* Main: Heatmap & Info */}
      <div style={{ display: "flex", gap: 44, alignItems: "flex-start", marginBottom: 36 }}>
        {/* Spider/Radar Chart */}
        <div style={{
          background: palette.card, borderRadius: 29, boxShadow: "0 4px 24px #0008", padding: 32, minWidth: 400, minHeight: 420, position: "relative"
        }}>
          <div style={{
            fontSize: 18, color: "#fff", fontWeight: 900, opacity: 0.7, letterSpacing: 1, marginBottom: 6
          }}>CULTURE HEATMAP</div>
          <svg width={size} height={size} style={{ display: "block", margin: "0 auto", zIndex: 2 }}>
            {/* Axes */}
            {pillars.map((pillar, i) => {
              const [x, y] = axisEnds[i];
              return (
                <g key={pillar.key}>
                  <line
                    x1={center} y1={center}
                    x2={x} y2={y}
                    stroke={selectedPillar === pillar.key ? palette.green : "#aaa"}
                    strokeWidth={selectedPillar === pillar.key ? 3.6 : 1.7}
                  />
                  <circle cx={x} cy={y} r={7} fill={selectedPillar === pillar.key ? palette.gold : "#fff"} />
                  <text
                    x={center + Math.cos((i/pillars.length)*2*Math.PI-Math.PI/2)*(radius+32)}
                    y={center + Math.sin((i/pillars.length)*2*Math.PI-Math.PI/2)*(radius+32)}
                    fill="#fff"
                    fontWeight={900}
                    fontSize={17}
                    textAnchor="middle"
                    style={{userSelect:"none"}}
                  >
                    {pillar.label}
                  </text>
                </g>
              );
            })}
            {/* Polygon - area fill */}
            <polygon
              points={points.map(p=>p.join(",")).join(" ")}
              fill="#FFD70033"
              stroke={palette.gold}
              strokeWidth={3}
            />
            {/* Pillar dots */}
            {points.map(([x, y], i) => (
              <g key={i}>
                <circle
                  cx={x} cy={y} r={selectedPillar===pillars[i].key?13:11}
                  fill={selectedPillar===pillars[i].key?palette.green:palette.gold}
                  style={{
                    filter:selectedPillar===pillars[i].key?"drop-shadow(0 4px 14px #FFD70099)":"none",
                    cursor:"pointer", transition:"all 0.23s"
                  }}
                  onMouseEnter={()=>setSelectedPillar(pillars[i].key)}
                />
                <text
                  x={x} y={y+4}
                  fill={palette.bg}
                  fontWeight={900}
                  fontSize={selectedPillar===pillars[i].key?16:13}
                  textAnchor="middle"
                >{scores[pillars[i].key]}</text>
              </g>
            ))}
          </svg>
          {/* Quick Win AI */}
          <div style={{
            marginTop: 18, background: atRisk.length?palette.risk:palette.green, color: palette.bg,
            borderRadius: 9, padding: "11px 18px", fontWeight: 900, fontSize: 16, boxShadow:"0 1px 8px #FFD70044"
          }}>
            <FaRocket style={{marginRight:10}}/>
            {quickWin}
          </div>
        </div>
        {/* Pillar Info Pane */}
        <div style={{
          flex: 1, background: palette.card, borderRadius: 22, boxShadow: "0 2px 18px #FFD70011", padding: 30, minHeight: 400
        }}>
          <div style={{
            fontWeight: 900, color: palette.gold, fontSize: 25, marginBottom: 10, display: "flex", alignItems: "center"
          }}>
            {activePillar.icon}
            <span style={{ marginLeft: 14 }}>{activePillar.label}</span>
            <span style={{
              marginLeft: 24, color: (scores[selectedPillar] - (defaultScores[selectedPillar]||0)) >= 0 ? palette.green : palette.risk,
              fontWeight: 900, fontSize: 19
            }}>
              {(scores[selectedPillar] - (defaultScores[selectedPillar]||0)) >= 0 ? <FaArrowUp/> : <FaArrowDown/>}
              {(scores[selectedPillar] - (defaultScores[selectedPillar]||0)) > 0 && "+"}
              {(scores[selectedPillar] - (defaultScores[selectedPillar]||0))}
            </span>
          </div>
          <div style={{
            color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 10
          }}>
            {selectedPillar === "trust" && "High trust allows coaches/players to share real issues early. Model it in meetings, reward it daily."}
            {selectedPillar === "accountability" && "Everyone owns their actions. Peer-to-peer accountability beats top-down control."}
            {selectedPillar === "growth" && "Celebrate process, not just outcomes. Growth shows in how you handle setbacks and effort."}
            {selectedPillar === "resilience" && "Bounce back fast! Simulate adversity, reflect as a team, and celebrate comeback moments."}
            {selectedPillar === "communication" && "Clarity, honesty, and high-frequency. Prioritize listening and direct talk."}
            {selectedPillar === "inclusion" && "Belonging isn’t a slogan; it’s daily habits. Rotate voices and leadership."}
            {selectedPillar === "leadership" && "Leadership is influence at every level. Grow it, reward it, and spotlight new leaders."}
          </div>
          <div style={{ color: palette.gold, fontWeight: 900, fontSize: 15, marginBottom: 8 }}>
            Recommendations:
          </div>
          <ul style={{ color: palette.green, marginBottom: 12, marginLeft: 18 }}>
            {recommendations[selectedPillar].map((rec, i) =>
              <li key={i} style={{ marginBottom: 2 }}>{rec}</li>
            )}
          </ul>
          <div style={{ color: "#fff", fontSize: 15 }}>
            <FaLightbulb style={{ marginRight: 9, color: palette.gold }} />
            What will you do today to move this pillar forward? <b>Take action now!</b>
          </div>
        </div>
      </div>
      {/* Timeline Ribbon */}
      <div style={{
        background: palette.card, borderRadius: 22, padding: 20, boxShadow: "0 2px 14px #FFD70011", marginBottom: 33
      }}>
        <div style={{ fontWeight: 900, color: palette.gold, fontSize: 20, marginBottom: 6 }}>
          <FaChartPie style={{ marginRight: 10, color: palette.green }} />
          Culture Milestones Timeline
        </div>
        <div style={{
          display: "flex", gap: 16, overflowX: "auto", padding: "12px 0"
        }}>
          {pulseTimeline.map((pt, i) => (
            <div key={i} style={{
              background: "#232b49", color: "#fff", borderRadius: 13, minWidth: 110,
              padding: "14px 18px", fontWeight: 900, fontSize: 15, boxShadow: "0 1px 5px #FFD70022",
              border: pt.milestone ? `2.5px solid ${palette.gold}` : undefined
            }}>
              <div>{pt.date}</div>
              <div style={{ fontSize: 19, color: palette.green }}>{pt.score}</div>
              {pt.milestone && <div style={{ color: palette.gold }}>{pt.milestone}</div>}
            </div>
          ))}
          {milestones.map((m,i) => (
            <div key={i+"mile"} style={{
              background: palette.gold, color: palette.bg, borderRadius: 13, minWidth: 120,
              padding: "14px 18px", fontWeight: 900, fontSize: 15, boxShadow: "0 1px 7px #FFD70033"
            }}>
              <div>{m.date}</div>
              <div style={{ fontSize: 17, color: palette.risk }}>{m.event}</div>
              <div style={{ color: palette.green }}>{m.desc}</div>
            </div>
          ))}
        </div>
        {/* Milestone input */}
        <div style={{display:"flex", alignItems:"center", gap:9, marginTop:14}}>
          <input type="text" placeholder="Event..." value={milestoneEvent}
            onChange={e=>setMilestoneEvent(e.target.value)}
            style={{
              padding: "7px 13px", borderRadius: 9, border: "1.5px solid #FFD70055",
              background: "#23294a", color: "#fff", fontWeight: 700, fontSize: 15, width: 110
            }}
          />
          <select value={milestonePillar} onChange={e=>setMilestonePillar(e.target.value)}
            style={{
              padding: "7px 13px", borderRadius: 9, border: "1.5px solid #FFD70055",
              background: "#23294a", color: "#fff", fontWeight: 700, fontSize: 15
            }}>
            {pillars.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <input type="text" placeholder="Describe impact..." value={milestoneDesc}
            onChange={e=>setMilestoneDesc(e.target.value)}
            style={{
              padding: "7px 13px", borderRadius: 9, border: "1.5px solid #FFD70033",
              background: "#23294a", color: "#fff", fontWeight: 700, fontSize: 15, width: 210
            }}
          />
          <button onClick={addMilestone}
            style={{
              background: palette.green, color: palette.bg, fontWeight: 900,
              border: "none", borderRadius: 10, fontSize: 18, padding: "7px 17px", cursor: "pointer"
            }}>
            <FaPlus style={{ marginRight: 7 }} /> Add
          </button>
        </div>
      </div>
      {/* Culture Moments - Sticky Note Board */}
      <div style={{
        background: palette.card, borderRadius: 21, boxShadow: "0 2px 12px #FFD70022",
        padding: 28, minHeight: 220
      }}>
        <div style={{ fontWeight: 900, color: palette.gold, fontSize: 20, marginBottom: 7 }}>
          <FaBookOpen style={{ marginRight: 7, color: palette.green }} />
          Culture Moments & Behaviors
        </div>
        {/* Add moment */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 17
        }}>
          <select value={momentPillar}
            onChange={e => setMomentPillar(e.target.value)}
            style={{
              padding: "7px 13px", borderRadius: 11, border: "1.5px solid #FFD70055",
              background: "#23294a", color: "#fff", fontWeight: 700, fontSize: 15
            }}>
            {pillars.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <input type="text" value={momentDesc} onChange={e => setMomentDesc(e.target.value)}
            placeholder="Describe a moment or key behavior…"
            style={{
              width: 330, padding: "7px 13px", borderRadius: 11, border: "1.5px solid #FFD70033",
              background: "#23294a", color: "#fff", fontWeight: 700, fontSize: 15
            }}
          />
          <button onClick={addCultureMoment}
            style={{
              background: palette.green, color: palette.bg, fontWeight: 900,
              border: "none", borderRadius: 10, fontSize: 18, padding: "7px 20px", cursor: "pointer"
            }}>
            <FaPlus style={{ marginRight: 7 }} /> Add
          </button>
        </div>
        {/* Sticky Notes by Pillar */}
        <div style={{ display: "flex", gap: 23, flexWrap: "wrap" }}>
          {pillars.map(pillar => (
            <div key={pillar.key} style={{
              flex: 1, minWidth: 180, background: "#232b49", borderRadius: 14, padding: "11px 15px", marginBottom: 10
            }}>
              <div style={{ fontWeight: 900, color: palette.gold, fontSize: 17, marginBottom: 6 }}>
                {pillar.icon} {pillar.label}
              </div>
              {groupedMoments[pillar.key].length === 0 && (
                <div style={{ color: "#aaa", fontSize: 14, fontStyle: "italic" }}>No moments logged.</div>
              )}
              {groupedMoments[pillar.key].map((m, i) => (
                <div key={i} style={{
                  background: m.highlight ? palette.gold : "#fff",
                  color: palette.bg, borderRadius: 11, padding: "8px 11px", fontWeight: 900,
                  boxShadow: "0 1px 7px #FFD70033", fontSize: 15, marginBottom: 4, position: "relative"
                }}>
                  <span>{m.description}</span>
                  <span style={{
                    position: "absolute", right: 12, bottom: 7, color: palette.blue, fontWeight: 900, fontSize: 12
                  }}>{m.date}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
