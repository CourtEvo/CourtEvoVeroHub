import React, { useRef, useState } from "react";
import { FaBookOpen, FaFlag, FaChartLine, FaCheckCircle, FaBolt, FaCogs, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaDownload } from "react-icons/fa";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useReactToPrint } from "react-to-print";

const gold = "#FFD700", green = "#1de682", red = "#e24242", bg = "#23292f";

// --- Example DATA from your doc: Replace with your values if needed! ---
const tvViewershipData = [
  { year: 2018, value: 110 },
  { year: 2019, value: 120 },
  { year: 2020, value: 123 },
  { year: 2021, value: 130 },
  { year: 2022, value: 136 },
  { year: 2023, value: 151 },
  { year: 2024, value: 170 },
];

const sponsorshipData = [
  { segment: "Broadcast", value: 3.2 },
  { segment: "Ticketing", value: 1.1 },
  { segment: "Sponsorship", value: 2.7 },
  { segment: "Merchandise", value: 0.6 },
];

const attendanceData = [
  { year: 2021, value: 2.8 },
  { year: 2022, value: 2.6 },
  { year: 2023, value: 2.5 },
  { year: 2024, value: 2.7 },
];

const pieColors = [gold, green, red, "#555"];

const competitiveClubs = [
  { club: "Club A", rank: 1, playerSpend: "€2.4M", staff: 19, analytics: "High", digital: 87, edge: "Scouting" },
  { club: "Club B", rank: 2, playerSpend: "€2.2M", staff: 16, analytics: "Medium", digital: 73, edge: "Sponsorship" },
  { club: "Your Club", rank: 3, playerSpend: "€1.6M", staff: 13, analytics: "Medium", digital: 68, edge: "Talent pipeline" },
];

const inefficiencies = [
  { issue: "Short contracts", impact: "High", cause: "Budget constraint", solution: "Long-term sponsor deals", score: 8 },
  { issue: "Practice hours", impact: "Medium", cause: "Facility limits", solution: "Shared agreements", score: 6 },
  { issue: "Scouting gaps", impact: "High", cause: "Staffing", solution: "Invest in digital", score: 7 },
];

const revenueRows = [
  { category: "Broadcast", league: 3.2, club: 2.7, delta: -0.5, status: "Risk" },
  { category: "Sponsorship", league: 2.7, club: 2.4, delta: -0.3, status: "Opportunity" },
  { category: "Ticketing", league: 1.1, club: 1.3, delta: 0.2, status: "Strength" },
  { category: "Merchandise", league: 0.6, club: 0.4, delta: -0.2, status: "Gap" },
];

const riskMatrix = [
  { item: "Sponsorship", probability: "Medium", impact: "High", score: 7, status: "Opportunity" },
  { item: "Transfer Policy", probability: "High", impact: "High", score: 9, status: "Risk" },
  { item: "Fan App Engagement", probability: "Low", impact: "Medium", score: 5, status: "Opportunity" },
];

const recs = [
  { action: "Invest in digital platform", owner: "CEO", urgency: "High", step: "App RFP" },
  { action: "Expand scouting staff", owner: "Sports Director", urgency: "Medium", step: "Budget review" },
  { action: "Negotiate sponsor deals", owner: "Commercial Dir.", urgency: "High", step: "Initiate outreach" },
];

// Section nav
const sections = [
  { key: "summary", label: "Executive Summary", icon: <FaFlag color={gold} /> },
  { key: "trends", label: "Key Market Trends", icon: <FaChartLine color={green} /> },
  { key: "comp", label: "Competitive Landscape", icon: <FaCogs color={gold} /> },
  { key: "ineff", label: "Structural Inefficiencies", icon: <FaExclamationTriangle color={red} /> },
  { key: "dev", label: "Development Pipeline", icon: <FaChartLine color={gold} /> },
  { key: "rev", label: "Revenue & Sponsorship", icon: <FaCheckCircle color={green} /> },
  { key: "attend", label: "Attendance & Engagement", icon: <FaFlag color={gold} /> },
  { key: "policy", label: "Regulatory Watch", icon: <FaBolt color={red} /> },
  { key: "matrix", label: "Opportunity-Risk Matrix", icon: <FaFlag color={gold} /> },
  { key: "rec", label: "Recommendations", icon: <FaCheckCircle color={green} /> },
];

function statusFlag(s) {
  if (s === "Risk") return <span style={{ color: red, fontWeight: 700, marginLeft: 8 }}><FaBolt /> {s}</span>;
  if (s === "Opportunity") return <span style={{ color: gold, fontWeight: 700, marginLeft: 8 }}><FaFlag /> {s}</span>;
  if (s === "Strength") return <span style={{ color: green, fontWeight: 700, marginLeft: 8 }}><FaCheckCircle /> {s}</span>;
  return <span style={{ color: "#fff", marginLeft: 8 }}>{s}</span>;
}

export default function EnrichedMarketReport() {
  const [activeSection, setActiveSection] = useState("summary");
  const reportRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `CourtEvoVero_EnrichedMarketReport_${new Date().toISOString().slice(0, 10)}`
  });

  return (
    <div
      style={{
        background: `linear-gradient(120deg, #232a2e 70%, #232a2e 100%)`,
        borderRadius: 38,
        boxShadow: "0 8px 50px #202a",
        color: "#fff",
        padding: 0,
        margin: "0 auto",
        maxWidth: 1350,
        fontFamily: "Segoe UI, sans-serif",
        minHeight: 1200,
        position: "relative"
      }}
    >
      {/* Sticky Header/Section Nav */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 44,
        background: "rgba(35,41,47,0.99)",
        borderTopLeftRadius: 38,
        borderTopRightRadius: 38,
        borderBottom: "2px solid #FFD700",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "26px 38px 15px 38px",
        gap: 38,
        boxShadow: "0 2px 12px #FFD70022"
      }}>
        <div style={{ display: "flex", gap: 19, alignItems: "center" }}>
          <FaBookOpen color={gold} size={38} />
          <span style={{ fontWeight: 900, fontSize: 28, color: gold, letterSpacing: 2 }}>
            ENRICHED MARKET REPORT
          </span>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          {sections.map(s =>
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              style={{
                background: activeSection === s.key ? gold : "transparent",
                color: activeSection === s.key ? "#232a2e" : gold,
                fontWeight: 800,
                border: "none",
                padding: "6px 15px",
                borderRadius: 11,
                fontSize: 17,
                transition: "0.15s",
                cursor: "pointer"
              }}>
              <span style={{ marginRight: 6 }}>{s.icon}</span> {s.label}
            </button>
          )}
        </div>
        <button
          style={{
            background: gold,
            color: "#23292f",
            fontWeight: 900,
            border: "none",
            padding: "9px 24px",
            borderRadius: 15,
            fontSize: 17,
            boxShadow: "0 2px 8px #FFD70044",
            cursor: "pointer",
            transition: "0.15s"
          }}
          onClick={handlePrint}
        >
          <FaDownload style={{ marginRight: 9 }} /> Export PDF
        </button>
      </div>

      {/* Main report content */}
      <div ref={reportRef} style={{ padding: "34px 40px 44px 40px" }}>
        {/* EXECUTIVE SUMMARY */}
        {activeSection === "summary" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 30, marginBottom: 15 }}>Executive Summary</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 23,
              marginBottom: 26
            }}>
              <div style={{ background: green, color: "#232a2e", borderRadius: 15, padding: 20, fontWeight: 900, fontSize: 21, boxShadow: "0 2px 10px #1de68233" }}>
                Men’s basketball TV viewership <b>+12% YoY</b>
              </div>
              <div style={{ background: gold, color: "#232a2e", borderRadius: 15, padding: 20, fontWeight: 900, fontSize: 21, boxShadow: "0 2px 10px #FFD70033" }}>
                Top 3 clubs investing <b>2x</b> in analytics
              </div>
              <div style={{ background: red, color: "#fff", borderRadius: 15, padding: 20, fontWeight: 900, fontSize: 21, boxShadow: "0 2px 10px #e2424233" }}>
                <FaBolt /> Transfer pipeline tightening – <b>URGENT RISK</b>
              </div>
              <div style={{ background: gold, color: "#232a2e", borderRadius: 15, padding: 20, fontWeight: 900, fontSize: 21, boxShadow: "0 2px 10px #FFD70033" }}>
                <FaCheckCircle /> Only <b>28%</b> of fans on club apps (Opportunity)
              </div>
            </div>
            <div style={{
              background: "#FFD70022",
              color: "#FFD700",
              borderRadius: 15,
              padding: 18,
              fontWeight: 700,
              fontSize: 18,
              boxShadow: "0 2px 8px #FFD70011"
            }}>
              <FaFlag style={{ marginRight: 10 }} />
              <span>Recommended action: <b>Invest in scouting + digital platform now.</b></span>
            </div>
          </>
        )}

        {/* KEY MARKET TRENDS */}
        {activeSection === "trends" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Key Market Trends</h2>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 16
            }}>
              <div style={{ flex: "1 1 340px", minWidth: 260 }}>
                <div style={{ color: gold, fontWeight: 600 }}>TV Viewership (2018–2024)</div>
                <ResponsiveContainer width="99%" height={180}>
                  <LineChart data={tvViewershipData}>
                    <CartesianGrid stroke="#FFD70022" />
                    <XAxis dataKey="year" tick={{ fill: gold }} />
                    <YAxis tick={{ fill: gold }} />
                    <Line type="monotone" dataKey="value" stroke={green} strokeWidth={3} />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: "1 1 340px", minWidth: 260 }}>
                <div style={{ color: gold, fontWeight: 600 }}>Sponsorship Breakdown</div>
                <ResponsiveContainer width="99%" height={180}>
                  <PieChart>
                    <Pie
                      data={sponsorshipData}
                      dataKey="value"
                      nameKey="segment"
                      cx="50%" cy="50%"
                      outerRadius={65}
                      labelLine={false}
                      label={({ segment }) => segment}
                    >
                      {sponsorshipData.map((entry, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: "1 1 340px", minWidth: 260 }}>
                <div style={{ color: gold, fontWeight: 600 }}>Attendance – League Avg (k/game)</div>
                <ResponsiveContainer width="99%" height={180}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid stroke="#FFD70022" />
                    <XAxis dataKey="year" tick={{ fill: gold }} />
                    <YAxis tick={{ fill: gold }} />
                    <Bar dataKey="value" fill={red} />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ color: "#FFD700cc", fontSize: 18, marginTop: 8 }}>
              TV and sponsorship rising, but in-venue engagement softening.
            </div>
          </>
        )}

        {/* COMPETITIVE LANDSCAPE */}
        {activeSection === "comp" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Competitive Landscape</h2>
            <table style={{ width: "100%", background: bg, borderRadius: 17, boxShadow: "0 2px 12px #FFD70015", marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#FFD70018", color: gold, fontWeight: 900 }}>
                  <th>Club</th><th>Rank</th><th>Player Spend</th><th>Staff</th><th>Analytics</th><th>Digital</th><th>Main Edge</th>
                </tr>
              </thead>
              <tbody>
                {competitiveClubs.map((c, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#181e23" : "#23292f", color: "#fff", fontWeight: 700 }}>
                    <td style={{ color: gold }}>{c.club}</td>
                    <td>{c.rank}</td>
                    <td>{c.playerSpend}</td>
                    <td>{c.staff}</td>
                    <td>{c.analytics}</td>
                    <td>
                      {c.digital}
                      {c.digital >= 85 ? <FaArrowUp style={{ color: green, marginLeft: 5 }} /> : c.digital < 70 ? <FaArrowDown style={{ color: red, marginLeft: 5 }} /> : null}
                    </td>
                    <td>{c.edge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* STRUCTURAL INEFFICIENCIES */}
        {activeSection === "ineff" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Structural Inefficiencies</h2>
            <table style={{ width: "100%", background: bg, borderRadius: 17, boxShadow: "0 2px 12px #FFD70015", marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#FFD70018", color: gold, fontWeight: 900 }}>
                  <th>Issue</th><th>Impact</th><th>Cause</th><th>Suggested Solution</th><th>Impact Score</th>
                </tr>
              </thead>
              <tbody>
                {inefficiencies.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#181e23" : "#23292f", color: "#fff", fontWeight: 700 }}>
                    <td>{r.issue}</td>
                    <td>{r.impact}</td>
                    <td>{r.cause}</td>
                    <td>{r.solution}</td>
                    <td>
                      {r.score}
                      {r.score >= 8 ? <FaFlag style={{ color: red, marginLeft: 7 }} /> : r.score >= 7 ? <FaFlag style={{ color: gold, marginLeft: 7 }} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* DEVELOPMENT PIPELINE */}
        {activeSection === "dev" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Development Pipeline</h2>
            <div style={{ background: "#FFD70022", color: "#FFD700", borderRadius: 14, padding: 17, fontWeight: 700, fontSize: 18 }}>
              <b>Phase-by-phase analysis:</b> Early-stage talent, youth bottlenecks, transition gaps—see Executive Summary for bottleneck details.
            </div>
            {/* Pipeline visuals here */}
          </>
        )}

        {/* REVENUE AND SPONSORSHIP */}
        {activeSection === "rev" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Revenue and Sponsorship</h2>
            <table style={{ width: "100%", background: bg, borderRadius: 17, boxShadow: "0 2px 12px #FFD70015", marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#FFD70018", color: gold, fontWeight: 900 }}>
                  <th>Category</th><th>League Avg</th><th>Your Club</th><th>Delta</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {revenueRows.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#181e23" : "#23292f", color: "#fff", fontWeight: 700 }}>
                    <td>{r.category}</td>
                    <td>{r.league}</td>
                    <td>{r.club}</td>
                    <td style={{ color: r.delta < 0 ? red : green, fontWeight: 800 }}>{r.delta}</td>
                    <td>{statusFlag(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ATTENDANCE & ENGAGEMENT */}
        {activeSection === "attend" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Attendance & Engagement</h2>
            <div style={{ background: "#FFD70022", color: "#FFD700", borderRadius: 14, padding: 17, fontWeight: 700, fontSize: 18 }}>
              <b>Attendance:</b> Steady decline (-5% YoY). <b>Engagement:</b> Only 28% app penetration. See risk matrix.
            </div>
            {/* More engagement charts here */}
          </>
        )}

        {/* REGULATORY POLICY WATCH */}
        {activeSection === "policy" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Regulatory Policy Watch</h2>
            <div style={{ background: "#FFD70022", color: "#FFD700", borderRadius: 14, padding: 17, fontWeight: 700, fontSize: 18 }}>
              <b>Key Policy:</b> New transfer regulations in force. <b>Action:</b> Compliance audit required.
            </div>
            {/* Policy tables/details */}
          </>
        )}

        {/* OPPORTUNITY-RISK MATRIX */}
        {activeSection === "matrix" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Opportunity-Risk Matrix</h2>
            <table style={{ width: "100%", background: bg, borderRadius: 17, boxShadow: "0 2px 12px #FFD70015", marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#FFD70018", color: gold, fontWeight: 900 }}>
                  <th>Item</th><th>Probability</th><th>Impact</th><th>Score</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {riskMatrix.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#181e23" : "#23292f", color: "#fff", fontWeight: 700 }}>
                    <td>{r.item}</td>
                    <td>{r.probability}</td>
                    <td>{r.impact}</td>
                    <td>{r.score}</td>
                    <td>{statusFlag(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* STRATEGIC RECOMMENDATIONS */}
        {activeSection === "rec" && (
          <>
            <h2 style={{ color: gold, fontWeight: 700, fontSize: 27, marginBottom: 8 }}>Strategic Recommendations</h2>
            <table style={{ width: "100%", background: bg, borderRadius: 17, boxShadow: "0 2px 12px #FFD70015", marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#FFD70018", color: gold, fontWeight: 900 }}>
                  <th>Action</th><th>Owner</th><th>Urgency</th><th>Next Step</th>
                </tr>
              </thead>
              <tbody>
                {recs.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#181e23" : "#23292f", color: "#fff", fontWeight: 700 }}>
                    <td>{r.action}</td>
                    <td>{r.owner}</td>
                    <td style={{ color: r.urgency === "High" ? red : gold, fontWeight: 800 }}>{r.urgency}</td>
                    <td>{r.step}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: "#FFD70022", color: "#FFD700", borderRadius: 14, padding: 17, fontWeight: 700, fontSize: 18 }}>
              <FaFlag style={{ marginRight: 10 }} />
              <b>Boardroom priority:</b> Approve next steps within 30 days to capture opportunity.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
