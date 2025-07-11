import React, { useState, useMemo, useRef } from 'react';
import {
  FaStar, FaCheck, FaExclamationTriangle, FaSearch, FaSync, FaUsers, FaCogs,
  FaFilePdf, FaFileCsv, FaFileExcel, FaFileAlt, FaClipboardList, FaStickyNote, FaPaperclip
} from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// --- Mocked Data (You can extend further or load CSV if needed) ---
const SECTORS = [
  { name: "Sport", roles: ["Sport Director", "Head Coach", "Assistant Coach", "Performance Analyst", "Youth Coach"] },
  { name: "Business", roles: ["Business Director", "Finance Lead", "Marketing Lead", "Academy Manager"] },
  { name: "Medical", roles: ["Medical Lead"] }
];

const ROLES = [
  "Sport Director", "Head Coach", "Assistant Coach", "Performance Analyst",
  "Youth Coach", "Business Director", "Finance Lead", "Academy Manager", "Marketing Lead", "Medical Lead"
];

const COMPETENCIES = [
  "Leadership", "Technical Skills", "Analytics", "Communication",
  "Talent ID", "Planning", "Injury Prevention", "Compliance", "Digital Skills", "Innovation"
];

const SKILL_MATRIX = [
  // Sport
  { role: "Sport Director", competency: "Leadership", level: 5, note: "Elite, FIBA certified", sector: "Sport" },
  { role: "Sport Director", competency: "Analytics", level: 3, note: "Needs upskilling for advanced data", sector: "Sport" },
  { role: "Sport Director", competency: "Compliance", level: 4, note: "", sector: "Sport" },
  { role: "Head Coach", competency: "Leadership", level: 5, note: "Strong motivator", sector: "Sport" },
  { role: "Head Coach", competency: "Planning", level: 4, note: "Needs microcycle periodization CPD", sector: "Sport" },
  { role: "Assistant Coach", competency: "Technical Skills", level: 4, note: "", sector: "Sport" },
  { role: "Performance Analyst", competency: "Analytics", level: 5, note: "Synergy certified", sector: "Sport" },
  { role: "Youth Coach", competency: "Talent ID", level: 3, note: "Misses outliers", sector: "Sport" },
  // Business
  { role: "Business Director", competency: "Leadership", level: 4, note: "Legacy workflows", sector: "Business" },
  { role: "Business Director", competency: "Innovation", level: 3, note: "", sector: "Business" },
  { role: "Finance Lead", competency: "Compliance", level: 3, note: "Two late filings", sector: "Business" },
  { role: "Finance Lead", competency: "Technical Skills", level: 4, note: "", sector: "Business" },
  { role: "Academy Manager", competency: "Communication", level: 4, note: "", sector: "Business" },
  { role: "Marketing Lead", competency: "Digital Skills", level: 5, note: "Advanced, runs campaigns", sector: "Business" },
  { role: "Marketing Lead", competency: "Innovation", level: 3, note: "Needs influencer project", sector: "Business" },
  // Medical
  { role: "Medical Lead", competency: "Injury Prevention", level: 5, note: "Best practice protocols", sector: "Medical" },
  { role: "Medical Lead", competency: "Compliance", level: 4, note: "", sector: "Medical" },
];

// --- Utilities ---
function levelColor(lvl) {
  if (lvl >= 5) return "#1de682";
  if (lvl >= 4) return "#FFD700";
  if (lvl >= 3) return "#48b5ff";
  return "#e94057";
}
function nowDate() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}
function downloadExcel(matrix) {
  // Simple Excel CSV workaround
  const csv = Papa.unparse(matrix);
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  saveAs(blob, `CompetencyFramework_${new Date().toISOString().slice(0, 10)}.xls`);
}
function aiInsights(matrix) {
  // Identify critical risk roles and suggest clusters for upskilling
  let risks = matrix.filter(x => x.level < 3);
  let criticalRoles = [...new Set(risks.map(x => x.role))];
  let upskillClusters = {};
  matrix.forEach(x => {
    if (x.level < 4) upskillClusters[x.competency] = (upskillClusters[x.competency] || 0) + 1;
  });
  let biggestCluster = Object.entries(upskillClusters)
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0])
    .slice(0, 2);
  return {
    risks: criticalRoles,
    cluster: biggestCluster,
    message: risks.length
      ? `Critical: ${criticalRoles.length} roles below threshold. Most common skill gaps: ${biggestCluster.join(", ")}.`
      : "No urgent role risks detected. All sectors stable."
  };
}

export default function CompetencyFrameworkDashboard() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [notes, setNotes] = useState({});
  const [attachedFiles, setAttachedFiles] = useState({});
  const [showAI, setShowAI] = useState(false);
  const dashRef = useRef();

  // Filtered table
  const filtered = useMemo(() => {
    let out = SKILL_MATRIX;
    if (filterRole !== "All") out = out.filter(x => x.role === filterRole);
    if (search.trim())
      out = out.filter(
        x =>
          x.role.toLowerCase().includes(search.trim().toLowerCase()) ||
          x.competency.toLowerCase().includes(search.trim().toLowerCase()) ||
          (x.note && x.note.toLowerCase().includes(search.trim().toLowerCase()))
      );
    return out;
  }, [filterRole, search]);

  // Sector summaries
  const sectorStats = useMemo(() => {
    return SECTORS.map(sec => {
      const secRows = SKILL_MATRIX.filter(x => x.sector === sec.name);
      const elite = secRows.filter(x => x.level >= 5).length;
      const gap = secRows.filter(x => x.level < 3).length;
      const avg = (secRows.reduce((s, x) => s + x.level, 0) / (secRows.length || 1)).toFixed(2);
      return { name: sec.name, total: secRows.length, elite, gap, avg };
    });
  }, []);

  // Per-competency heatmap
  const compHeatmap = COMPETENCIES.map(skill => {
    return {
      skill,
      spread: ROLES.map(role => {
        const found = SKILL_MATRIX.find(x => x.role === role && x.competency === skill);
        return found ? found.level : null;
      })
    };
  });

  // By-role breakdown
  const byRole = useMemo(() => {
    const m = {};
    filtered.forEach(x => {
      if (!m[x.role]) m[x.role] = [];
      m[x.role].push(x);
    });
    return m;
  }, [filtered]);

  // Export CSV/PDF/Excel
  const handleExportCSV = () => {
    const csv = Papa.unparse(SKILL_MATRIX);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `CompetencyFramework_${new Date().toISOString().slice(0, 10)}.csv`);
  };
  const handlePrint = useReactToPrint({
    content: () => dashRef.current,
    documentTitle: `CompetencyFramework_${new Date().toISOString().slice(0, 10)}`
  });

  // File upload handler
  const handleFileUpload = (e, rowKey) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFiles(prev => ({ ...prev, [rowKey]: file.name }));
    }
  };

  // AI Panel
  const ai = aiInsights(SKILL_MATRIX);

  return (
    <div style={{
      padding: 32, background: "rgba(35,42,46,0.99)",
      borderRadius: 16, boxShadow: "0 3px 28px #FFD70022",
      minHeight: 750, maxWidth: 1400, margin: "36px auto"
    }}>
      {/* Top Summary Cards */}
      <div style={{ display: "flex", gap: 21, marginBottom: 18 }}>
        {sectorStats.map(s =>
          <div key={s.name} style={card}>
            <FaClipboardList style={iconBig} />
            <div>
              <div style={{ fontSize: 15 }}>{s.name} Sector</div>
              <div><span style={{ color: "#FFD700" }}>{s.total}</span> skills</div>
              <div><FaStar color="#1de682" /> {s.elite} elite</div>
              <div><FaExclamationTriangle color="#e94057" /> {s.gap} gaps</div>
              <div>Avg: <span style={{ color: "#1de682" }}>{s.avg}</span></div>
            </div>
          </div>
        )}
        <div style={card}>
          <FaUsers style={iconBig} />
          <div>
            <div>Total Roles</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{ROLES.length}</div>
          </div>
        </div>
      </div>

      {/* Title/AI/controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
        <FaUsers style={{ fontSize: 32, color: "#FFD700" }} />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 32, letterSpacing: 1 }}>
          Competency Framework Dashboard
        </h2>
        <button onClick={handlePrint} style={exportBtn}><FaFilePdf /> PDF</button>
        <button onClick={handleExportCSV} style={{ ...exportBtn, background: "#FFD700", color: "#232a2e" }}><FaFileCsv /> CSV</button>
        <button onClick={() => downloadExcel(SKILL_MATRIX)} style={{ ...exportBtn, background: "#48b5ff", color: "#fff" }}><FaFileExcel /> Excel</button>
        <button onClick={() => setShowAI(a => !a)} style={{ ...exportBtn, background: "#FFD700", color: "#232a2e", minWidth: 106 }}>
          <FaCogs style={{ marginRight: 6 }} />
          {showAI ? "Hide AI" : "Show AI"}
        </button>
      </div>
      <div style={{ fontSize: 18, color: "#FFD700", marginBottom: 14, fontWeight: 700 }}>
        Real-time matrix for all critical competencies, with sector breakdowns, alerts, upskilling, and full evidence support.
      </div>

      {/* AI Panel */}
      {showAI && (
        <div style={{
          background: "#181e23", color: "#1de682", padding: 14, borderRadius: 10,
          fontWeight: 800, fontSize: 17, marginBottom: 21, boxShadow: "0 2px 13px #1de68222"
        }}>
          <FaStickyNote style={{ marginRight: 8 }} /> {ai.message}
          {ai.risks.length > 0 && (
            <span style={{ color: "#e94057", fontWeight: 700, marginLeft: 18 }}>
              Risk Roles: {ai.risks.join(", ")}
            </span>
          )}
          <span style={{ color: "#FFD70099", fontWeight: 600, marginLeft: 18, fontSize: 14 }}>
            AI Tip: Prioritize {ai.cluster.join(", ")} upskilling.
          </span>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          style={{
            padding: 10, borderRadius: 7, border: "none", fontSize: 16, minWidth: 130,
            fontWeight: 700, color: "#232a2e"
          }}>
          <option>All</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by role, skill, note..."
          style={{
            padding: "10px 17px", borderRadius: 8, border: "none",
            fontSize: 16, minWidth: 260, fontWeight: 700, color: "#232a2e"
          }}
        />
        <button onClick={() => { setFilterRole("All"); setSearch(""); }} style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900,
          borderRadius: 8, padding: "10px 17px", border: "none", fontSize: 16, marginLeft: 10
        }}>
          <FaSync style={{ marginRight: 7 }} /> Reset
        </button>
      </div>

      {/* Per-Competency Heatmap */}
      <div style={{
        margin: "18px 0", background: "#181e23", borderRadius: 10, padding: 14,
        boxShadow: "0 2px 11px #FFD70018", overflowX: "auto"
      }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 16, marginBottom: 6 }}>
          Skill Heatmap: Each role's rating (see elite, gaps)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thS, minWidth: 110 }}>Competency</th>
              {ROLES.map(role => <th key={role} style={thS}>{role}</th>)}
            </tr>
          </thead>
          <tbody>
            {compHeatmap.map((row, i) => (
              <tr key={i}>
                <td style={tdS}>{row.skill}</td>
                {row.spread.map((lvl, idx) =>
                  <td key={idx} style={{
                    ...tdS,
                    background: lvl == null ? "#282e38" : levelColor(lvl) + "33",
                    color: lvl == null ? "#999" : levelColor(lvl),
                    fontWeight: lvl == null ? 600 : 900,
                    fontSize: 16,
                  }}>
                    {lvl != null ? lvl : <span style={{ opacity: 0.4 }}>–</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Skill Matrix Table */}
      <div ref={dashRef} style={{
        overflowX: "auto", borderRadius: 15, boxShadow: "0 2px 17px #232a2e44",
        background: "#232a2e", padding: 0, marginBottom: 28
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              <th style={thS}>Role</th>
              <th style={thS}>Competency</th>
              <th style={thS}>Level</th>
              <th style={thS}>Note / Update</th>
              <th style={thS}>Evidence</th>
              <th style={thS}>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const rowKey = row.role + "-" + row.competency;
              return (
                <tr key={idx}>
                  <td style={{ ...tdS, color: row.level < 3 ? "#e94057" : "#fff", fontWeight: 900 }}>
                    {row.role}
                  </td>
                  <td style={tdS}>{row.competency}</td>
                  <td style={{
                    ...tdS, fontWeight: 900, color: levelColor(row.level)
                  }}>
                    {row.level} / 5
                    {row.level < 3 && <FaExclamationTriangle style={{ marginLeft: 8, color: "#e94057" }} title="Gap" />}
                    {row.level >= 5 && <FaStar style={{ marginLeft: 8, color: "#1de682" }} title="Elite" />}
                  </td>
                  <td style={tdS}>
                    <input
                      type="text"
                      value={notes[rowKey] ?? row.note}
                      onChange={e => setNotes({ ...notes, [rowKey]: e.target.value })}
                      placeholder="Add note/update"
                      style={{
                        padding: "7px 13px", borderRadius: 6,
                        border: "1px solid #FFD70099", fontSize: 13, minWidth: 90,
                        background: "#282e38", color: "#fff"
                      }}
                    />
                  </td>
                  <td style={tdS}>
                    <label style={{
                      background: "#FFD70033", borderRadius: 8,
                      padding: "7px 15px", color: "#FFD700", fontWeight: 700, cursor: "pointer"
                    }}>
                      <FaPaperclip /> {attachedFiles[rowKey] ? attachedFiles[rowKey] : "Attach"}
                      <input type="file" style={{ display: "none" }}
                        onChange={e => handleFileUpload(e, rowKey)} />
                    </label>
                  </td>
                  <td style={{ ...tdS, fontSize: 13 }}>{nowDate()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ color: "#FFD700aa", fontSize: 13, textAlign: "center" }}>
        Download, search, print, and attach evidence for every role.  
        <br />
        Last AI review: {nowDate()}.
      </div>
    </div>
  );
}

// --- Styling ---
const card = {
  background: "#232a2e",
  borderRadius: 17,
  boxShadow: "0 3px 16px #FFD70012",
  color: "#fff",
  padding: "16px 19px",
  display: "flex",
  alignItems: "center",
  gap: 16,
  fontWeight: 800,
  minWidth: 185,
  minHeight: 112,
};
const iconBig = { fontSize: 40, marginRight: 13, color: "#FFD700" };
const thS = {
  background: "#181e23",
  color: "#FFD700",
  fontWeight: 900,
  fontSize: 16,
  padding: "10px 11px"
};
const tdS = {
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  fontWeight: 600,
  padding: "9px 10px",
  borderBottom: "1.5px solid #FFD70022",
  textAlign: "center"
};
const exportBtn = {
  background: "#232a2e",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 900,
  padding: "7px 14px",
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 2px 6px #FFD70014"
};
