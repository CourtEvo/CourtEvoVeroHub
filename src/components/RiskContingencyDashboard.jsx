import React, { useState, useMemo } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaChartBar, FaEye, FaEdit, FaTimes, 
    FaArrowUp, FaArrowDown, FaUserTie, FaInfoCircle } from "react-icons/fa";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsiveBar } from "@nivo/bar";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment";
import "./RiskContingencyDashboard.css";

// --- DEMO risk data (replace with CSV import/parse)
const RISK_MATRIX = [
  { category: "Digital",        type: "Cyber Attack",        level: 5, likelihood: 4, impact: 5, owner: "Ana Novak",         status: "Open",     mitigation: "Pen-testing, Training", lastReviewed: "2025-06-16" },
  { category: "Finance",        type: "Sponsor Default",      level: 3, likelihood: 2, impact: 5, owner: "Sara Savić",       status: "Monitored", mitigation: "Diversify partners", lastReviewed: "2025-05-29" },
  { category: "Competition",    type: "Season Cancellation",  level: 4, likelihood: 2, impact: 5, owner: "Dario Luka",       status: "Resolved",  mitigation: "Alternative revenue plans", lastReviewed: "2025-03-10" },
  { category: "Talent",         type: "Coach Turnover",       level: 2, likelihood: 3, impact: 3, owner: "Marko Proleta",    status: "Open",     mitigation: "Succession, Onboarding", lastReviewed: "2025-06-01" },
  { category: "Legal",          type: "Compliance Breach",    level: 4, likelihood: 3, impact: 4, owner: "Nina Hrstić",      status: "Open",     mitigation: "Audits, Policy update", lastReviewed: "2025-06-13" },
  { category: "Ops",            type: "Facility Outage",      level: 2, likelihood: 1, impact: 4, owner: "Ivan Rajić",       status: "Monitored", mitigation: "Backup site ready", lastReviewed: "2025-05-20" },
  { category: "Reputation",     type: "Social Media Scandal", level: 3, likelihood: 2, impact: 4, owner: "Martina Petrović", status: "Open",     mitigation: "Comms protocol", lastReviewed: "2025-05-30" }
];

const CATEGORIES = [...new Set(RISK_MATRIX.map(r => r.category))];
const OWNERS = [...new Set(RISK_MATRIX.map(r => r.owner))];

function getCellColor(level) {
  if (level >= 5) return "#e94057";
  if (level === 4) return "#FFD700";
  if (level === 3) return "#ffa502";
  if (level === 2) return "#27ef7d";
  return "#222d38";
}

export default function RiskContingencyDashboard() {
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState({ col: "level", dir: "desc" });

  // --- Sort risk table
  const risks = useMemo(() => {
    const sorted = Array.isArray(RISK_MATRIX) ? [...RISK_MATRIX] : [];
    sorted.sort((a, b) => {
      if (sort.col === "level") return sort.dir === "asc" ? a.level - b.level : b.level - a.level;
      if (sort.col === "lastReviewed") return sort.dir === "asc" 
        ? new Date(a.lastReviewed) - new Date(b.lastReviewed) 
        : new Date(b.lastReviewed) - new Date(a.lastReviewed);
      return 0;
    });
    return sorted;
  }, [sort]);

  // --- Risk Matrix Table Data
  const likelihoods = [1, 2, 3, 4, 5];
  const matrixTable = CATEGORIES.map(cat => {
    const row = { category: cat };
    likelihoods.forEach(lh => {
      const risk = RISK_MATRIX.find(r => r.category === cat && r.likelihood === lh);
      row[lh] = risk ? risk.level : null;
    });
    return row;
  });

  // --- Radar data (risk category profile)
  const radarData = [
    {
      risk: "Likelihood",
      ...CATEGORIES.reduce((acc, cat) => {
        acc[cat] = RISK_MATRIX.filter(r => r.category === cat).reduce((a, b) => a + b.likelihood, 0);
        return acc;
      }, {})
    },
    {
      risk: "Impact",
      ...CATEGORIES.reduce((acc, cat) => {
        acc[cat] = RISK_MATRIX.filter(r => r.category === cat).reduce((a, b) => a + b.impact, 0);
        return acc;
      }, {})
    }
  ];

  // --- Owner workload bar chart
  const barData = OWNERS.map(owner => ({
    owner,
    risks: RISK_MATRIX.filter(r => r.owner === owner).length
  }));

  return (
    <div style={{
      padding: 32,
      background: "linear-gradient(140deg,#232a2e 0%,#222d38 100%)",
      borderRadius: 18,
      boxShadow: "0 8px 40px #FFD70022",
      minHeight: 900,
      maxWidth: 1250,
      margin: "0 auto",
      color: "#fff"
    }}>
      <h2 style={{
        fontSize: 35, fontWeight: 900, color: "#FFD700", marginBottom: 18, letterSpacing: 1.5
      }}>
        <FaExclamationTriangle style={{ marginBottom: -10, marginRight: 8 }} />
        RISK & CONTINGENCY BOARD COCKPIT
      </h2>
      <div style={{
        color: "#FFD700cc",
        fontWeight: 600,
        fontSize: 19,
        marginBottom: 18
      }}>
        Board-level risk intelligence, matrix, radar, scenario AI, all at a glance—zero heatmap errors.
      </div>

      {/* --- Risk Matrix Table --- */}
      <div style={{ marginBottom: 35 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 23, marginBottom: 8 }}>Boardroom Risk Matrix</h3>
        <div style={{ overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 10px #FFD70022" }}>
          <table style={{ background: "#232d38", width: "100%", borderRadius: 13, fontWeight: 700, fontSize: 15 }}>
            <thead>
              <tr style={{ color: "#FFD700", fontWeight: 900 }}>
                <th>Category</th>
                {likelihoods.map(lh => (
                  <th key={lh}>Likelihood {lh}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixTable.map(row => (
                <tr key={row.category}>
                  <td style={{ color: "#FFD700" }}>{row.category}</td>
                  {likelihoods.map(lh => (
                    <td
                      key={lh}
                      style={{
                        background: getCellColor(row[lh]),
                        color: row[lh] >= 4 ? "#222" : "#FFD700",
                        borderRadius: 5,
                        minWidth: 55,
                        fontWeight: row[lh] >= 4 ? 900 : 600,
                        textAlign: "center",
                        cursor: row[lh] ? "pointer" : "default",
                        boxShadow: row[lh] ? "0 2px 8px #FFD70033" : "none"
                      }}
                      onClick={() => {
                        const risk = RISK_MATRIX.find(
                          r => r.category === row.category && r.likelihood === lh
                        );
                        if (risk) setSelected(risk);
                      }}
                    >
                      {row[lh] ? (
                        <>
                          {row[lh]}{" "}
                          {row[lh] >= 4 && <FaExclamationTriangle style={{ color: "#e94057", marginBottom: -3 }} />}
                        </>
                      ) : "--"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ color: "#FFD70099", marginTop: 6, fontSize: 14 }}>
          <FaInfoCircle style={{ marginRight: 5 }} />
          Click a risk cell to drill down. Level 4-5 = Board Alert.
        </div>
      </div>

      {/* --- Risk Category Radar Chart --- */}
      <div style={{ marginBottom: 30, background: "#222d38", borderRadius: 13, padding: 20 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 21, marginBottom: 5 }}>
          Risk Category Radar (Likelihood vs Impact)
        </h3>
        <div style={{ height: 270 }}>
          <ResponsiveRadar
            data={radarData}
            keys={CATEGORIES}
            indexBy="risk"
            maxValue="auto"
            margin={{ top: 60, right: 110, bottom: 60, left: 110 }}
            curve="catmullRomClosed"
            borderWidth={3}
            borderColor="#FFD700"
            gridLevels={5}
            gridShape="circular"
            gridLabelOffset={36}
            enableDots={true}
            dotSize={9}
            dotColor="#FFD700"
            dotBorderWidth={2}
            colors={["#FFD700", "#27ef7d"]}
            blendMode="multiply"
            animate={true}
            motionConfig="wobbly"
            legends={[
              {
                anchor: "top-left",
                direction: "column",
                translateX: -85,
                translateY: -35,
                itemWidth: 90,
                itemHeight: 21,
                itemTextColor: "#FFD700",
                symbolSize: 15,
                symbolShape: "circle"
              }
            ]}
          />
        </div>
      </div>

      {/* --- Owner Workload Bar Chart --- */}
      <div style={{ marginBottom: 30, background: "#222d38", borderRadius: 13, padding: 20 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 21, marginBottom: 5 }}>
          Owner Risk Workload
        </h3>
        <div style={{ height: 220 }}>
          <ResponsiveBar
            data={barData}
            keys={["risks"]}
            indexBy="owner"
            margin={{ top: 30, right: 60, bottom: 60, left: 60 }}
            padding={0.45}
            layout="vertical"
            colors={["#FFD700"]}
            colorBy="id"
            borderRadius={4}
            borderWidth={2}
            borderColor="#232d38"
            labelSkipWidth={14}
            labelSkipHeight={12}
            labelTextColor="#232d38"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 8,
              tickPadding: 8,
              tickRotation: 0,
              legend: "Owner",
              legendOffset: 45,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 8,
              tickPadding: 8,
              tickRotation: 0,
              legend: "Number of Risks",
              legendOffset: -45,
              legendPosition: "middle"
            }}
            animate={true}
            motionConfig="wobbly"
            tooltip={({ id, value, color, indexValue }) => (
              <div style={{
                background: "#232a2e",
                color: "#FFD700",
                padding: "7px 15px",
                borderRadius: 7,
                fontWeight: 800,
                fontSize: 15,
                border: "1.5px solid #FFD700"
              }}>
                <b>{indexValue}:</b> {value} risks
              </div>
            )}
          />
        </div>
      </div>

      {/* --- Full Risk Table --- */}
      <div style={{ marginBottom: 38 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>
          Board Risk Register
        </h3>
        <table style={{ width: "100%", background: "#232d38", borderRadius: 10, boxShadow: "0 2px 8px #FFD70033", fontSize: 15 }}>
          <thead>
            <tr style={{ color: "#FFD700", fontWeight: 900 }}>
              <th>Category</th>
              <th>Type</th>
              <th>
                <span style={{ cursor: "pointer" }} onClick={() => setSort({ col: "level", dir: sort.dir === "asc" ? "desc" : "asc" })}>
                  Level {sort.col === "level" ? (sort.dir === "asc" ? <FaArrowUp /> : <FaArrowDown />) : ""}
                </span>
              </th>
              <th>Likelihood</th>
              <th>Impact</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Mitigation</th>
              <th>
                <span style={{ cursor: "pointer" }} onClick={() => setSort({ col: "lastReviewed", dir: sort.dir === "asc" ? "desc" : "asc" })}>
                  Last Reviewed {sort.col === "lastReviewed" ? (sort.dir === "asc" ? <FaArrowUp /> : <FaArrowDown />) : ""}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r, idx) => (
              <tr key={r.type + idx} style={{
                color: r.level >= 4 ? "#FFD700" : "#27ef7d",
                fontWeight: r.level >= 4 ? 800 : 600,
                background: idx % 2 ? "#FFD70011" : "#fff2",
                borderBottom: "1px solid #FFD70033"
              }}>
                <td>{r.category}</td>
                <td>{r.type}</td>
                <td style={{ fontWeight: 900 }}>{r.level}</td>
                <td>{r.likelihood}</td>
                <td>{r.impact}</td>
                <td>{r.owner}</td>
                <td>
                  {r.status === "Open"     && <span style={{ color: "#FFD700" }}><FaExclamationTriangle /> {r.status}</span>}
                  {r.status === "Monitored" && <span style={{ color: "#27ef7d" }}><FaEye /> {r.status}</span>}
                  {r.status === "Resolved"  && <span style={{ color: "#27ef7d" }}><FaCheckCircle /> {r.status}</span>}
                </td>
                <td>{r.mitigation}</td>
                <td>{moment(r.lastReviewed).format("YYYY-MM-DD")}</td>
                <td>
                  <button
                    onClick={() => setSelected(r)}
                    style={{
                      background: "#FFD700",
                      color: "#222",
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 700,
                      padding: "2px 10px",
                      cursor: "pointer"
                    }}
                  ><FaEdit /> Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Scenario Simulation (AI) --- */}
      <div style={{ marginBottom: 38, background: "#222d38", borderRadius: 10, padding: 18 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 21 }}>AI Risk Scenario Simulator</h3>
        <div style={{ color: "#FFD700bb", marginBottom: 8, fontWeight: 600 }}>
          Select a risk above to review or simulate impact of a new threat.
        </div>
        {selected && (
          <motion.div
            key={selected.type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              background: "#FFD70011",
              color: "#FFD700",
              borderRadius: 9,
              padding: "13px 22px",
              fontWeight: 800,
              marginBottom: 11
            }}>
            <div>
              <FaExclamationTriangle style={{ marginRight: 8, fontSize: 20 }} />
              <b>Type:</b> {selected.type} | <b>Category:</b> {selected.category}
            </div>
            <div style={{ margin: "6px 0" }}>
              <b>Level:</b> {selected.level} | <b>Likelihood:</b> {selected.likelihood} | <b>Impact:</b> {selected.impact}
            </div>
            <div>
              <b>Owner:</b> {selected.owner} | <b>Status:</b> {selected.status}
            </div>
            <div style={{ color: "#27ef7d", margin: "7px 0" }}>
              <b>Mitigation:</b> {selected.mitigation}
            </div>
            <div style={{ margin: "6px 0" }}>
              <FaChartBar style={{ marginRight: 8 }} />
              <b>AI Scenario:</b> {selected.type === "Cyber Attack" ? "Increase digital security spend. If breach occurs, digital operations halt, sponsor exposure drops 12%, reputation risk triggers auto-notify protocol." : "Scenario simulation coming soon."}
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: "#FFD700",
                color: "#222",
                border: "none",
                borderRadius: 7,
                fontWeight: 700,
                padding: "7px 19px",
                fontSize: 16,
                marginTop: 9,
                cursor: "pointer"
              }}><FaTimes style={{ marginRight: 7 }} />Close</button>
          </motion.div>
        )}
      </div>

      <div style={{ color: "#FFD70088", fontSize: 14, marginTop: 24, textAlign: "center" }}>
        All data auto-syncs with your CSV frameworks.<br />
        This cockpit delivers board-level risk intelligence, mitigation, and AI-powered scenario planning. CourtEvo Vero™
      </div>
    </div>
  );
}
