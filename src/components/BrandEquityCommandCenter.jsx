import React, { useState } from "react";
import {
  FaRocket, FaUsers, FaStar, FaChild, FaHandshake, FaTwitter, FaTv, FaChartLine, FaLightbulb, FaFileExport, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown, FaEuroSign, FaTrophy
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DRIVERS = [
  { key: "performance", icon: <FaStar />, label: "Performance" },
  { key: "youth", icon: <FaChild />, label: "Youth" },
  { key: "community", icon: <FaUsers />, label: "Community" },
  { key: "social", icon: <FaTwitter />, label: "Social" },
  { key: "media", icon: <FaTv />, label: "Media" },
  { key: "sponsors", icon: <FaHandshake />, label: "Sponsors" },
  { key: "innovation", icon: <FaRocket />, label: "Innovation" }
];

const COMPETITORS = [
  { name: "Club Evo", performance: 88, youth: 91, community: 72, social: 81, media: 79, sponsors: 84, innovation: 76 },
  { name: "Rival United", performance: 81, youth: 75, community: 78, social: 80, media: 84, sponsors: 77, innovation: 70 },
  { name: "City Force", performance: 82, youth: 79, community: 68, social: 83, media: 85, sponsors: 82, innovation: 78 }
];

const SPONSORS = [
  { name: "Erste Bank", activation: 85, trend: +4, board: "Leverage youth social" },
  { name: "Nike", activation: 77, trend: -2, board: "Need activation with U16" },
  { name: "Local Media", activation: 68, trend: +7, board: "Capitalize on finals win" }
];

const DRIVER_HISTORY = {
  performance: [81, 82, 85, 86, 83, 84],
  youth: [93, 90, 91, 92, 91, 92],
  community: [80, 78, 77, 77, 76, 77],
  social: [77, 78, 78, 80, 79, 80],
  media: [75, 76, 75, 75, 77, 75],
  sponsors: [85, 85, 86, 85, 88, 87],
  innovation: [70, 71, 72, 71, 72, 73]
};

const INITIAL_STATE = {
  performance: 84, youth: 92, community: 77, social: 80, media: 75, sponsors: 87, innovation: 73,
  trend: { performance: +2, youth: -1, community: -4, social: +5, media: +2, sponsors: +7, innovation: +1 },
  alerts: [],
  history: [{ date: "2024-06-01", driver: "performance", change: +2, note: "Finals win, media surge" }],
  brandValue: 410000
};

function getColor(val) {
  if (val >= 85) return "#1de682";
  if (val >= 75) return "#FFD700";
  return "#ff4848";
}
function formatTrend(val) {
  return (val > 0 ? "+" : "") + val;
}
function aiMemo(state) {
  let topDriver = Object.entries(state).filter(([k, v]) => typeof v === "number").sort((a, b) => b[1] - a[1])[0];
  let weakDriver = Object.entries(state).filter(([k, v]) => typeof v === "number").sort((a, b) => a[1] - b[1])[0];
  let risk = Object.entries(state.trend).filter(([k, v]) => v < 0);
  let opp = Object.entries(state.trend).filter(([k, v]) => v > 2);
  return `Brand strongest: "${topDriver[0]}". Weakest: "${weakDriver[0]}". ${risk.length ? "Risks: " + risk.map(([k, v]) => `${k} falling (${v})`).join(", ") + ". " : ""}${opp.length ? "Opportunities: " + opp.map(([k, v]) => `${k} surging (+${v})`).join(", ") + ". " : ""}Brand value: €${state.brandValue.toLocaleString()}.`;
}
function aiOpportunities(state) {
  return [
    "Run youth-focused sponsor campaign: social is surging.",
    "Capitalize on performance—target new sponsor pitch.",
    "Leverage media uplift to tell club innovation story."
  ];
}
function aiThreats(state) {
  return [
    "Community driver falling—plan new event.",
    "Youth trend dipped—monitor academy engagement.",
    "Sponsorship value risk if performance drops next quarter."
  ];
}

const BrandEquityCommandCenter = () => {
  const [state, setState] = useState({ ...INITIAL_STATE });
  const [editDriver, setEditDriver] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [boardLog, setBoardLog] = useState([
    { by: "AI", txt: "Brand equity reviewed. Social +5 after influencer collab.", date: "2024-06-12" }
  ]);
  const [logText, setLogText] = useState("");
  const [view, setView] = useState("orbit");
  const [showInsights, setShowInsights] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Update value
  const updateDriver = () => {
    if (!editDriver) return;
    let val = Math.max(0, Math.min(100, Number(editVal)));
    let trendVal = val - state[editDriver];
    let newBrandValue = state.brandValue + (trendVal * 1000); // simple projection
    setState({
      ...state,
      [editDriver]: val,
      trend: { ...state.trend, [editDriver]: trendVal },
      history: [...state.history, { date: new Date().toISOString().slice(0, 10), driver: editDriver, change: trendVal, note: logText || "Manual update" }],
      brandValue: newBrandValue
    });
    setBoardLog([
      ...boardLog,
      { by: "Board", txt: `Updated ${editDriver} to ${val} (${trendVal >= 0 ? "+" : ""}${trendVal})`, date: new Date().toISOString().slice(0, 10) }
    ]);
    setEditDriver(null); setEditVal("");
  };

  // Export PDF/PNG (stub)
  const exportBrand = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2300);
  };

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 29,
      padding: 34, boxShadow: "0 8px 64px #FFD70044", maxWidth: 1900, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 17 }}>
        <FaRocket size={38} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 32, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Brand Equity Command Center
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 800, borderRadius: 17,
          padding: '8px 28px', fontSize: 16, marginLeft: 18, boxShadow: '0 2px 10px #FFD70044'
        }}>
          CourtEvo Vero | Brand Orbit
        </span>
        <button onClick={exportBrand} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 17, padding: "11px 26px", marginLeft: 13
        }}>
          <FaFileExport style={{ marginRight: 8 }} /> Export PDF/PNG
        </button>
      </div>
      {exporting &&
        <div style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 15,
          padding: 15, marginBottom: 13, fontSize: 18, textAlign: "center"
        }}>
          Export in progress...<br />All visuals, AI, and board memos included.
        </div>
      }
      {/* View Tabs */}
      <div style={{ display: "flex", gap: 13, marginBottom: 19 }}>
        <button onClick={() => setView("orbit")} style={{
          background: view === "orbit" ? "#FFD700" : "#232a2e", color: view === "orbit" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Brand Orbit</button>
        <button onClick={() => setView("pulse")} style={{
          background: view === "pulse" ? "#FFD700" : "#232a2e", color: view === "pulse" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Competitor Pulse Map</button>
        <button onClick={() => setView("sponsor")} style={{
          background: view === "sponsor" ? "#FFD700" : "#232a2e", color: view === "sponsor" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Sponsor Impact</button>
        <button onClick={() => setView("history")} style={{
          background: view === "history" ? "#FFD700" : "#232a2e", color: view === "history" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Driver History</button>
      </div>
      {/* Orbit with Driver Insights */}
      {view === "orbit" &&
        <div style={{ display: "flex", gap: 60 }}>
          {/* Brand Journey Animation (SVG) */}
          <div style={{ flex: 2, position: "relative" }}>
            <svg width={550} height={400}>
              <circle cx={275} cy={200} r={80} fill="#FFD70033" />
              <text x={275} y={203} fill="#FFD700" textAnchor="middle" fontWeight={900} fontSize={29}>OUR BRAND</text>
              {/* Journey path */}
              <polyline
                points="275,320 330,250 410,210 370,150 275,80"
                fill="none"
                stroke="#FFD700"
                strokeWidth={5}
                opacity={0.38}
                strokeDasharray="11,15"
              />
              {/* Journey comet */}
              <circle
                cx={275 + Math.sin(Date.now() / 800) * 180}
                cy={200 - Math.cos(Date.now() / 800) * 120}
                r={12}
                fill="#FFD700"
                opacity="0.95"
                stroke="#232a2e"
                strokeWidth={3}
              />
              {DRIVERS.map((d, i) => {
                const angle = (2 * Math.PI / DRIVERS.length) * i - Math.PI / 2;
                const radius = 170 + Math.sin(Date.now() / 1600 + i) * 8;
                const x = 275 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);
                const val = state[d.key];
                return (
                  <g key={d.key} style={{ cursor: "pointer" }} onMouseEnter={() => setShowInsights(d.key)} onMouseLeave={() => setShowInsights(null)}>
                    <circle cx={x} cy={y} r={44} fill={getColor(val) + "99"} stroke="#FFD700" strokeWidth={2 + Math.abs(state.trend[d.key])} />
                    <text x={x} y={y - 12} fill="#fff" fontWeight={800} fontSize={16} textAnchor="middle">{d.icon}</text>
                    <text x={x} y={y + 13} fill="#fff" fontWeight={900} fontSize={17} textAnchor="middle">{d.label}</text>
                    <text x={x} y={y + 32} fill="#FFD700" fontWeight={700} fontSize={16} textAnchor="middle">{val}</text>
                    {showInsights === d.key &&
                      <g>
                        {/* Mini-trend */}
                        <rect x={x + 42} y={y - 36} width={110} height={70} rx={11} fill="#232a2e" stroke="#FFD700" strokeWidth={1.5} />
                        <text x={x + 98} y={y - 22} fill="#FFD700" fontWeight={700} fontSize={13} textAnchor="middle">Last 6 Months</text>
                        {/* Mini graph */}
                        <polyline
                          points={DRIVER_HISTORY[d.key].map((v, i) => `${x + 50 + i * 13},${y + 18 - v / 6}`).join(" ")}
                          fill="none" stroke="#1de682" strokeWidth={3} />
                        {/* Last change */}
                        <text x={x + 98} y={y + 34} fill="#1de682" fontWeight={800} fontSize={12} textAnchor="middle">
                          {formatTrend(state.trend[d.key])} | {state.history.slice(-1)[0]?.note || ""}
                        </text>
                      </g>
                    }
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", left: 60, top: 320 }}>
              <b style={{ color: "#FFD700" }}>Update Brand Drivers:</b>
              {DRIVERS.map((d, i) =>
                <button key={d.key} onClick={() => setEditDriver(d.key)} style={{
                  background: "#232a2e", color: "#FFD700", border: "1.5px solid #FFD700",
                  borderRadius: 9, padding: "7px 15px", fontWeight: 700, fontSize: 14, margin: 4
                }}>{d.label}</button>
              )}
            </div>
          </div>
          {/* AI Brand Memo & Opportunities/Threats */}
          <div style={{ flex: 1.4, background: "#232a2e", borderRadius: 19, boxShadow: "0 2px 18px #FFD70044", padding: 26 }}>
            <b style={{ color: "#FFD700", fontSize: 22 }}><FaLightbulb style={{ marginRight: 9 }} /> AI Boardroom Brand Memo</b>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "12px 0 19px 0" }}>
              {aiMemo(state)}
            </div>
            <b style={{ color: "#FFD700", fontSize: 17 }}>Top 3 Opportunities:</b>
            <ul style={{ fontSize: 15, margin: "8px 0 12px 0" }}>
              {aiOpportunities(state).map((o, i) => <li key={i} style={{ color: "#1de682", fontWeight: 700 }}>{o}</li>)}
            </ul>
            <b style={{ color: "#FFD700", fontSize: 17 }}>Top 3 Threats:</b>
            <ul style={{ fontSize: 15, margin: "8px 0 0 0" }}>
              {aiThreats(state).map((o, i) => <li key={i} style={{ color: "#ff4848", fontWeight: 700 }}>{o}</li>)}
            </ul>
            <div style={{
              marginTop: 22, color: "#FFD700", fontWeight: 800, background: "#FFD70022",
              padding: 12, borderRadius: 10, fontSize: 18
            }}>
              <FaEuroSign style={{ marginRight: 9 }} /> Projected Brand Value: <span style={{ color: "#1de682", fontWeight: 900 }}>€{state.brandValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      }
      {/* Competitor Pulse Map */}
      {view === "pulse" &&
        <div style={{ marginTop: 15 }}>
          <b style={{ color: "#FFD700", fontSize: 20 }}><FaChartLine style={{ marginRight: 8 }} /> Competitor Pulse Map</b>
          <table style={{ width: "97%", margin: "25px auto", borderCollapse: "collapse", fontSize: 19, boxShadow: "0 2px 18px #FFD70022" }}>
            <thead>
              <tr style={{ color: "#FFD700", fontWeight: 900, fontSize: 19 }}>
                <th>Club</th>
                {DRIVERS.map(d => <th key={d.key}>{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c, i) =>
                <tr key={i} style={{ background: "#232a2e" }}>
                  <td style={{ fontWeight: 900 }}>{c.name}</td>
                  {DRIVERS.map(d => (
                    <td key={d.key} style={{ color: getColor(c[d.key]), fontWeight: 900 }}>
                      {c[d.key]}{" "}
                      {state[d.key] > c[d.key] &&
                        <FaArrowUp style={{ color: "#1de682", marginLeft: 4 }} />
                      }
                      {state[d.key] < c[d.key] &&
                        <FaArrowDown style={{ color: "#ff4848", marginLeft: 4 }} />
                      }
                    </td>
                  ))}
                </tr>
              )}
              <tr style={{ background: "#FFD70044" }}>
                <td style={{ fontWeight: 900, color: "#FFD700" }}>CourtEvo Vero</td>
                {DRIVERS.map(d => (
                  <td key={d.key} style={{ color: getColor(state[d.key]), fontWeight: 900 }}>{state[d.key]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      }
      {/* Sponsor Impact Matrix */}
      {view === "sponsor" &&
        <div style={{ marginTop: 15 }}>
          <b style={{ color: "#FFD700", fontSize: 20 }}><FaHandshake style={{ marginRight: 7 }} /> Sponsor Impact Matrix</b>
          <table style={{ width: "70%", margin: "23px auto", borderCollapse: "collapse", fontSize: 18 }}>
            <thead>
              <tr style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>
                <th>Sponsor</th>
                <th>Activation</th>
                <th>Trend</th>
                <th>Board Action</th>
              </tr>
            </thead>
            <tbody>
              {SPONSORS.map((s, i) =>
                <tr key={i} style={{ background: "#232a2e" }}>
                  <td style={{ fontWeight: 900 }}>{s.name}</td>
                  <td style={{ color: getColor(s.activation), fontWeight: 900 }}>{s.activation}</td>
                  <td style={{ color: s.trend >= 0 ? "#1de682" : "#ff4848", fontWeight: 800 }}>
                    {formatTrend(s.trend)}
                  </td>
                  <td style={{ fontWeight: 700, color: "#FFD700" }}>{s.board}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }
      {/* Driver History */}
      {view === "history" &&
        <div style={{ marginTop: 15 }}>
          <b style={{ color: "#FFD700", fontSize: 18 }}><FaCheckCircle style={{ marginRight: 8 }} /> Driver History & Board Actions</b>
          <ul>
            {(state.history || []).map((h, i) =>
              <li key={i} style={{ color: h.change > 0 ? "#1de682" : "#ff4848", fontWeight: 800, fontSize: 17 }}>
                {h.date}: {h.driver} {h.change > 0 ? "improved" : "declined"} by {h.change}. Note: {h.note}
              </li>
            )}
          </ul>
        </div>
      }
      {/* Board Log */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "24px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 18 }}><FaLightbulb style={{ marginRight: 8 }} /> Brand Board Log</b>
        <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 15, marginBottom: 8 }}>
          {boardLog.map((c, i) =>
            <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span></div>
          )}
        </div>
        <input value={logText} placeholder="Log a board note or action..." onChange={e => setLogText(e.target.value)} style={inputStyle} />
        <button onClick={() => {
          setBoardLog([...boardLog, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]); setLogText("");
        }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 7 }}>Send</button>
      </div>
      {/* Driver edit popup */}
      {editDriver &&
        <div style={{
          position: "fixed", left: "45%", top: "45%", background: "#232a2e", borderRadius: 17,
          boxShadow: "0 8px 36px #FFD70044", padding: 28, zIndex: 2000
        }}>
          <h3 style={{ color: "#FFD700", marginTop: 0 }}>Update {DRIVERS.find(d => d.key === editDriver)?.label} Score</h3>
          <input value={editVal} type="number" min={0} max={100} placeholder="New score..." onChange={e => setEditVal(e.target.value)} style={inputStyle} />
          <button onClick={updateDriver} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 13 }}>Save</button>
          <button onClick={() => setEditDriver(null)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 13 }}>Close</button>
        </div>
      }
      <div style={{ marginTop: 15, fontSize: 14, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 16, width: 135
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "8px 18px", marginRight: 6, cursor: "pointer"
};

export default BrandEquityCommandCenter;
