import React, { useState, useMemo, useRef } from 'react';
import { FaLink, FaExclamationTriangle, FaCheck, FaSearch, FaSync, FaProjectDiagram, FaChartPie, FaBullseye, FaCog, FaDownload, FaFilePdf, FaFileCsv, FaFileAlt, FaStickyNote } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Example sectors and strategic pillars
const SECTORS = [
  "Basketball Operations", "Business Operations", "Academy", "Finance", "HR", "Marketing", "Governance", "Digital", "Medical", "Scouting"
];
const PILLARS = [
  "Talent Development", "Performance", "Compliance", "Fan Engagement", "Revenue Growth", "Innovation", "Culture", "Risk Management"
];

// Example alignment matrix: each sector mapped to its strategic pillar contribution
const EXAMPLE_MAP = [
  // sector, pillar, strength (1-5), criticalGap, comment
  { sector: "Basketball Operations", pillar: "Talent Development", strength: 5, criticalGap: false, comment: "Full pipeline, elite pathways" },
  { sector: "Basketball Operations", pillar: "Performance", strength: 4, criticalGap: false, comment: "Data-driven performance, modern workflow" },
  { sector: "Basketball Operations", pillar: "Compliance", strength: 2, criticalGap: true, comment: "Lacking document control for FIBA/league" },
  { sector: "Business Operations", pillar: "Revenue Growth", strength: 4, criticalGap: false, comment: "Strong sponsorship and B2B" },
  { sector: "Business Operations", pillar: "Innovation", strength: 2, criticalGap: true, comment: "No digital/AI revenue streams yet" },
  { sector: "Academy", pillar: "Talent Development", strength: 5, criticalGap: false, comment: "Integrated with main team, high output" },
  { sector: "Academy", pillar: "Culture", strength: 4, criticalGap: false, comment: "Mentorship & alumni network" },
  { sector: "Finance", pillar: "Risk Management", strength: 4, criticalGap: false, comment: "Proactive forecasting, solid reserves" },
  { sector: "Finance", pillar: "Compliance", strength: 3, criticalGap: false, comment: "Some late filings last year" },
  { sector: "HR", pillar: "Culture", strength: 3, criticalGap: true, comment: "Retention challenges, coach turnover" },
  { sector: "Marketing", pillar: "Fan Engagement", strength: 5, criticalGap: false, comment: "Excellent digital reach" },
  { sector: "Marketing", pillar: "Revenue Growth", strength: 4, criticalGap: false, comment: "Merch/ecom strong, needs event monetization" },
  { sector: "Digital", pillar: "Innovation", strength: 3, criticalGap: true, comment: "Legacy IT systems, poor integration" },
  { sector: "Governance", pillar: "Compliance", strength: 4, criticalGap: false, comment: "All policies up to date" },
  { sector: "Medical", pillar: "Performance", strength: 4, criticalGap: false, comment: "Injury return times best in league" },
  { sector: "Medical", pillar: "Innovation", strength: 3, criticalGap: false, comment: "Piloting wearable tech" },
  { sector: "Scouting", pillar: "Talent Development", strength: 3, criticalGap: true, comment: "Insufficient international coverage" },
];

// Utility: color for strength
function strengthColor(n) {
  if (n >= 5) return "#1de682";
  if (n === 4) return "#FFD700";
  if (n === 3) return "#48b5ff";
  return "#e94057";
}

// AI diagnosis summary
function aiSummary(matrix) {
  const gapSectors = matrix.filter(r => r.criticalGap).map(r => `${r.sector} (${r.pillar})`);
  if (gapSectors.length === 0) return "All sectors aligned. No critical gaps detected.";
  return `Attention: Critical alignment gaps in ${gapSectors.join(", ")}.`;
}

// Dummy trend data for historical chart
const trendData = [
  { month: "Jan", avg: 3.2, gaps: 4 },
  { month: "Feb", avg: 3.6, gaps: 3 },
  { month: "Mar", avg: 4.0, gaps: 2 },
  { month: "Apr", avg: 4.2, gaps: 1 },
  { month: "May", avg: 4.3, gaps: 0 }
];

export default function SystemAlignmentMap() {
  // Filter/search UI state
  const [search, setSearch] = useState("");
  const [showGaps, setShowGaps] = useState(false);
  const [showCollapsed, setShowCollapsed] = useState({});
  const [notes, setNotes] = useState({});
  const alignmentRef = useRef();

  // Compute filtered matrix
  const filtered = useMemo(() => {
    let out = EXAMPLE_MAP;
    if (search.trim())
      out = out.filter(row => row.sector.toLowerCase().includes(search.trim().toLowerCase()) || row.pillar.toLowerCase().includes(search.trim().toLowerCase()));
    if (showGaps)
      out = out.filter(row => row.criticalGap);
    return out;
  }, [search, showGaps]);

  // Grouped view by sector
  const groupedBySector = useMemo(() => {
    const out = {};
    for (let r of filtered) {
      if (!out[r.sector]) out[r.sector] = [];
      out[r.sector].push(r);
    }
    return out;
  }, [filtered]);

  // KPI stats
  const kpi = useMemo(() => {
    const total = EXAMPLE_MAP.length;
    const aligned = EXAMPLE_MAP.filter(r => !r.criticalGap).length;
    const gaps = EXAMPLE_MAP.filter(r => r.criticalGap).length;
    const avg = (EXAMPLE_MAP.reduce((s, r) => s + r.strength, 0) / total).toFixed(2);
    return { total, aligned, gaps, avg };
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(EXAMPLE_MAP);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `SystemAlignmentMap_${new Date().toISOString().slice(0, 10)}.csv`);
  };
  // Export PDF
  const handlePrint = useReactToPrint({
    content: () => alignmentRef.current,
    documentTitle: `SystemAlignmentMap_${new Date().toISOString().slice(0, 10)}`
  });

  // Collapsible sector handler
  const toggleCollapse = sector => setShowCollapsed(prev => ({ ...prev, [sector]: !prev[sector] }));

  return (
    <div style={{ padding: 36, background: "rgba(35,42,46,0.99)", borderRadius: 16, boxShadow: "0 3px 28px #FFD70022", minHeight: 750, maxWidth: 1300, margin: "40px auto" }}>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 22, marginBottom: 32 }}>
        <div style={kpiCard}><FaBullseye style={iconBig} /> <div>Total Links<br /><b>{kpi.total}</b></div></div>
        <div style={kpiCard}><FaCheck style={{ ...iconBig, color: "#1de682" }} /> <div>Aligned<br /><b>{kpi.aligned}</b></div></div>
        <div style={kpiCard}><FaExclamationTriangle style={{ ...iconBig, color: "#e94057" }} /> <div>Gaps<br /><b>{kpi.gaps}</b></div></div>
        <div style={kpiCard}><FaChartPie style={{ ...iconBig, color: "#FFD700" }} /> <div>Avg. Strength<br /><b>{kpi.avg}</b></div></div>
      </div>

      {/* Alignment Trend */}
      <div style={{ background: "#232a2e", borderRadius: 14, padding: 20, marginBottom: 34, boxShadow: "0 2px 13px #1de68233", maxWidth: 600 }}>
        <div style={{ fontWeight: 900, color: "#FFD700", marginBottom: 6, fontSize: 17 }}>Alignment History</div>
        <div style={{ display: "flex", gap: 19, alignItems: "flex-end" }}>
          {trendData.map((d, idx) => (
            <div key={idx} style={{ textAlign: "center" }}>
              <div style={{
                width: 38,
                height: 12 + d.avg * 19,
                background: "#1de682",
                marginBottom: 4,
                borderRadius: 6,
                boxShadow: "0 1px 7px #1de68255",
                transition: "height 0.3s"
              }} title={`Avg: ${d.avg} | Gaps: ${d.gaps}`} />
              <div style={{ color: "#FFD700", fontWeight: 900 }}>{d.month}</div>
              <div style={{ fontSize: 12, color: "#FFD70099" }}>Gaps: {d.gaps}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 10 }}>
        <FaProjectDiagram style={{ fontSize: 36, color: "#FFD700" }} />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 34, letterSpacing: 1 }}>System Alignment Map</h2>
        <span style={{
          background: "#232a2e", color: "#1de682", fontWeight: 900,
          padding: "8px 19px", borderRadius: 16, marginLeft: 16, fontSize: 17
        }}>ELITE | BOARDROOM</span>
        <button onClick={handlePrint} style={exportBtn}><FaFilePdf /> PDF</button>
        <button onClick={handleExportCSV} style={{ ...exportBtn, background: "#FFD700", color: "#232a2e" }}><FaFileCsv /> CSV</button>
      </div>
      <div style={{ fontSize: 19, color: "#FFD700", marginBottom: 11, fontWeight: 600 }}>
        Multi-sector club system-to-strategy alignment, visualizing all strengths, gaps, and overlaps.
      </div>

      {/* Search and filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sector or pillar..."
          style={{ padding: "9px 19px", borderRadius: 8, border: "none", fontSize: 16, minWidth: 240, fontWeight: 700, color: "#232a2e" }}
        />
        <button onClick={() => setShowGaps(v => !v)} style={{
          background: showGaps ? "#e94057" : "#232a2e",
          color: "#FFD700",
          fontWeight: 800,
          border: "none",
          borderRadius: 8,
          padding: "9px 19px",
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 2px 8px #FFD70022"
        }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} />
          {showGaps ? "Show All" : "Show Only Critical Gaps"}
        </button>
        <button onClick={() => { setSearch(""); setShowGaps(false); }} style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 8, padding: "9px 19px", border: "none", marginLeft: 14, fontSize: 16
        }}>
          <FaSync style={{ marginRight: 7 }} /> Reset Filters
        </button>
      </div>

      {/* AI Analysis */}
      <div style={{
        background: "#181e23",
        color: "#1de682",
        padding: 18,
        borderRadius: 10,
        fontWeight: 800,
        fontSize: 18,
        marginBottom: 25,
        boxShadow: "0 2px 16px #1de68233"
      }}>
        <FaBullseye style={{ marginRight: 7 }} />
        {aiSummary(EXAMPLE_MAP)}
        <div style={{ fontSize: 14, color: "#FFD700aa", fontWeight: 600, marginTop: 8 }}>
          <FaStickyNote /> AI Tip: <span style={{ color: "#1de682" }}>Consider cross-training for gaps in HR, and digitalize document workflows for compliance boost.</span>
        </div>
      </div>

      <div ref={alignmentRef}>
        {/* Matrix Table */}
        <div style={{
          overflowX: "auto",
          borderRadius: 16,
          boxShadow: "0 2px 17px #232a2e55",
          background: "#232a2e",
          padding: 0,
          marginBottom: 32
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={thS}>Sector</th>
                <th style={thS}>Strategic Pillar</th>
                <th style={thS}>Alignment Strength</th>
                <th style={thS}>Critical Gap</th>
                <th style={thS}>Comment / Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdS}>{row.sector}</td>
                  <td style={tdS}>{row.pillar}</td>
                  <td style={{ ...tdS, fontWeight: 900, color: strengthColor(row.strength) }}>{row.strength} / 5</td>
                  <td style={{ ...tdS, color: row.criticalGap ? "#e94057" : "#1de682", fontWeight: 800 }}>
                    {row.criticalGap ? <FaExclamationTriangle title="Critical Gap" /> : <FaCheck />}
                  </td>
                  <td style={tdS}>{row.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grouped Gaps by Sector (visual drilldown) */}
      <div style={{ marginTop: 14 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, marginBottom: 7, marginTop: 22 }}>
          Sector Drilldown (Gaps & Overlaps)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 22 }}>
          {Object.entries(groupedBySector).map(([sector, items]) => (
            <div key={sector} style={{
              background: "#181e23",
              borderRadius: 12,
              padding: 22,
              boxShadow: "0 2px 12px #FFD70022",
              minHeight: 120
            }}>
              <div
                style={{ fontWeight: 900, color: "#1de682", fontSize: 18, marginBottom: 8, letterSpacing: 1, cursor: "pointer", userSelect: "none" }}
                onClick={() => toggleCollapse(sector)}
                title="Click to expand/collapse"
              >
                <FaCog style={{ marginRight: 5 }} /> {sector}
                {showCollapsed[sector] ? " ▼" : " ▶"}
              </div>
              {!showCollapsed[sector] && items.map((item, i) => (
                <div key={i} style={{
                  marginBottom: 7, color: strengthColor(item.strength), fontWeight: 700,
                  display: "flex", alignItems: "center"
                }}>
                  {item.criticalGap && <FaExclamationTriangle style={{ marginRight: 7, color: "#e94057" }} />}
                  <span style={{ minWidth: 150, color: "#FFD700", fontWeight: 900 }}>{item.pillar}</span>
                  <span style={{ marginLeft: 9, color: strengthColor(item.strength), fontWeight: 800 }}>{item.strength} / 5</span>
                  <span style={{ marginLeft: 12, color: "#fff", fontWeight: 500, fontStyle: "italic" }}>{item.comment}</span>
                  {/* Per-sector notes */}
                  <input
                    type="text"
                    value={notes[sector + "-" + item.pillar] || ""}
                    onChange={e => setNotes({ ...notes, [sector + "-" + item.pillar]: e.target.value })}
                    placeholder="Add note/attachment"
                    style={{
                      marginLeft: 13, padding: "5px 11px", borderRadius: 7, border: "1px solid #FFD70088", fontSize: 13, minWidth: 90
                    }}
                  />
                  <FaFileAlt style={{ marginLeft: 5, color: "#FFD70088" }} title="Attach file (manual)" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 42, textAlign: "center", color: "#FFD700aa", fontWeight: 700, fontSize: 18 }}>
        <FaProjectDiagram style={{ marginRight: 8, fontSize: 22 }} />
        All system, all pillar, all data: Elevate your club's operational alignment, cross-sector.
      </div>
    </div>
  );
}

// --- Styles ---
const kpiCard = {
  background: "#232a2e",
  borderRadius: 18,
  boxShadow: "0 2px 18px #1de68222",
  color: "#FFD700",
  fontWeight: 900,
  fontSize: 18,
  padding: "23px 31px",
  minWidth: 137,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  gap: 14
};
const iconBig = { fontSize: 34, color: "#FFD700", marginRight: 14 };
const thS = { background: "#181e23", color: "#FFD700", fontWeight: 900, fontSize: 17, padding: "12px 8px", borderBottom: "2px solid #FFD70055" };
const tdS = { color: "#fff", fontWeight: 700, fontSize: 16, padding: "9px 8px", borderBottom: "1px solid #FFD70022" };
const exportBtn = {
  background: "#1de682",
  color: "#232a2e",
  fontWeight: 900,
  borderRadius: 8,
  padding: "9px 17px",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
  marginLeft: 12,
  boxShadow: "0 2px 8px #1de68233"
};
