import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FaChartLine, FaUsers, FaCogs, FaBalanceScale, FaMicrophoneAlt, FaDollarSign, FaLaptop, FaUserMd, FaRegLightbulb, FaHandsHelping, FaBuilding, FaShieldAlt, FaBullhorn, FaUserTie, FaClipboardCheck, FaArrowUp, FaArrowDown, FaRegEdit, FaDownload, FaFlag, FaSearch, FaStar, FaExclamationTriangle, FaRobot, FaBell, FaHistory } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Sector, group, and metrics config ---
// (Use your real config here; demo sample below.)
const GROUPS = [
  {
    label: "Sport",
    sectors: [{ key: "Sport", label: "Sport", icon: <FaUsers /> }],
  },
  {
    label: "Business Operations",
    sectors: [
      { key: "Business", label: "Business", icon: <FaCogs /> },
      { key: "Finance", label: "Finance", icon: <FaDollarSign /> },
      { key: "Legal", label: "Legal", icon: <FaBalanceScale /> },
      { key: "Media", label: "Media", icon: <FaMicrophoneAlt /> },
      { key: "Digital", label: "Digital", icon: <FaLaptop /> },
      { key: "Health", label: "Health", icon: <FaUserMd /> },
      { key: "Innovation", label: "Innovation", icon: <FaRegLightbulb /> },
      { key: "Community", label: "Community", icon: <FaHandsHelping /> },
      { key: "Facilities", label: "Facilities", icon: <FaBuilding /> },
      { key: "Risk", label: "Risk", icon: <FaShieldAlt /> },
      { key: "PR", label: "PR", icon: <FaBullhorn /> },
      { key: "Governance", label: "Governance", icon: <FaUserTie /> },
    ],
  }
];

const SECTOR_METRICS = {
  Sport: [
    { key: "attendance", label: "Attendance", icon: <FaUsers /> },
    { key: "coach_dev", label: "Coach Dev", icon: <FaClipboardCheck /> },
    { key: "training", label: "Training", icon: <FaRegLightbulb /> },
    { key: "wellness", label: "Wellness", icon: <FaUserMd /> },
    { key: "injury", label: "Injury Rate", icon: <FaBalanceScale /> },
    { key: "nps", label: "Athlete NPS", icon: <FaStar /> }
  ],
  Business: [
    { key: "fin_reporting", label: "Financial Reporting", icon: <FaDollarSign /> },
    { key: "staff", label: "Staffing", icon: <FaUsers /> },
    { key: "ops_efficiency", label: "Ops Efficiency", icon: <FaCogs /> },
    { key: "compliance", label: "Compliance", icon: <FaBalanceScale /> },
    { key: "sponsorship", label: "Sponsorship", icon: <FaRegLightbulb /> }
  ],
  Finance: [
    { key: "budget", label: "Budget Use", icon: <FaDollarSign /> },
    { key: "fin_reporting", label: "Reporting", icon: <FaClipboardCheck /> }
  ],
  Legal: [
    { key: "compliance", label: "Compliance", icon: <FaBalanceScale /> }
  ],
  Media: [
    { key: "coverage", label: "Coverage", icon: <FaMicrophoneAlt /> }
  ],
  Digital: [
    { key: "social", label: "Social Engagement", icon: <FaLaptop /> }
  ],
  Health: [
    { key: "wellness", label: "Wellness", icon: <FaUserMd /> }
  ],
  Innovation: [
    { key: "project", label: "Projects", icon: <FaRegLightbulb /> }
  ],
  Community: [
    { key: "impact", label: "Impact", icon: <FaHandsHelping /> }
  ],
  Facilities: [
    { key: "maintenance", label: "Maintenance", icon: <FaBuilding /> }
  ],
  Risk: [
    { key: "risk", label: "Risk Score", icon: <FaShieldAlt /> }
  ],
  PR: [
    { key: "coverage", label: "Coverage", icon: <FaBullhorn /> }
  ],
  Governance: [
    { key: "compliance", label: "Compliance", icon: <FaUserTie /> }
  ],
};

const THRESHOLDS = { elite: 90, solid: 75, warning: 60, fail: 40 };
const COLORS = { elite: "#1de682", solid: "#FFD700", warning: "#f58820", fail: "#e94057" };

const AI_CAUSE_BANK = {
  attendance: [
    "Late arrivals from previous activity",
    "Injury/illness spike",
    "Transport/logistics issue",
    "Low session engagement"
  ],
  staff: [
    "Competing commitments",
    "Low morale/fatigue",
    "Poor schedule communication"
  ],
  fin_reporting: [
    "Accounting backlog",
    "New system transition",
    "Missing approvals"
  ],
  compliance: [
    "Regulatory change",
    "Staff turnover",
    "Incomplete documentation"
  ],
  coverage: [
    "Media team unavailable",
    "Delayed press release",
    "Negative sentiment event"
  ],
  nps: [
    "Fan zone accessibility",
    "Recent team results",
    "Ticket pricing sensitivity"
  ],
  // Extend as you want
};

const DEMO = [
  { org: "Main Club", sector: "Sport", period: "June", group: "U18", metric: "attendance", value: 67, root: "", action: "", ai: "" },
  { org: "Main Club", sector: "Business", period: "June", group: "Ops", metric: "fin_reporting", value: 58, root: "", action: "", ai: "" },
  { org: "Main Club", sector: "Legal", period: "June", group: "Admin", metric: "compliance", value: 100, root: "", action: "", ai: "" },
  { org: "Main Club", sector: "Media", period: "June", group: "Media", metric: "coverage", value: 42, root: "", action: "", ai: "" },
  { org: "Main Club", sector: "Sport", period: "June", group: "U18", metric: "coach_dev", value: 84, root: "", action: "", ai: "" },
  { org: "Main Club", sector: "Sport", period: "July", group: "U18", metric: "attendance", value: 80, root: "", action: "", ai: "" },
  { org: "Main Club", sector: "Sport", period: "July", group: "U18", metric: "coach_dev", value: 89, root: "", action: "", ai: "" },
];

function getColor(val) {
  if (val >= THRESHOLDS.elite) return COLORS.elite;
  if (val >= THRESHOLDS.solid) return COLORS.solid;
  if (val >= THRESHOLDS.warning) return COLORS.warning;
  return COLORS.fail;
}

function calcTrend(arr, key) {
  if (arr.length < 2) return null;
  const last = arr[arr.length - 1][key], prev = arr[arr.length - 2][key];
  if (last == null || prev == null) return null;
  return last > prev ? "up" : last < prev ? "down" : "flat";
}

function simpleForecast(arr, key) {
  if (arr.length === 0) return null;
  const lastVals = arr.slice(-3).map(r => r[key]).filter(v => typeof v === 'number');
  if (!lastVals.length) return null;
  return Math.round(lastVals.reduce((a, b) => a + b, 0) / lastVals.length);
}

function aiPredictCause(metricKey) {
  const options = AI_CAUSE_BANK[metricKey];
  if (!options) return "AI: Review for context-specific patterns.";
  return options[Math.floor(Math.random() * options.length)];
}

function boardroomAlert(value, metricKey, period, root) {
  if (value == null) return null;
  let messages = [];
  if (value < THRESHOLDS.warning) {
    messages.push("Major Risk: Urgent board attention required.");
  } else if (value < THRESHOLDS.solid) {
    messages.push("Warning: Performance below acceptable standards.");
  }
  if (!root) messages.push("No root cause entered. AI suggestion available.");
  return messages.length ? messages : null;
}

export default function ConsistencyDashboard() {
  const [group, setGroup] = useState('');
  const [sector, setSector] = useState('Sport');
  const [metricKeys, setMetricKeys] = useState([]);
  const [data, setData] = useState([]);
  const [org, setOrg] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [editCause, setEditCause] = useState(null);
  const [editAction, setEditAction] = useState(null);
  const [drilldown, setDrilldown] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setData(DEMO);
      setOrgs([...new Set(DEMO.map(d => d.org))]);
      setOrg(DEMO[0]?.org || "");
      const filteredGroups = [...new Set(DEMO.filter(d => d.sector === sector).map(d => d.group))];
      setGroups(filteredGroups);
      setGroup(filteredGroups[0] || "");
      setPeriods([...new Set(DEMO.map(d => d.period))]);
      setMetricKeys(SECTOR_METRICS[sector] ? SECTOR_METRICS[sector].map(m => m.key) : []);
    }, 450);
  }, [sector]);

  // Defensive: always fallback to empty arrays if undefined
  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeOrgs = Array.isArray(orgs) ? orgs : [];
  const safePeriods = Array.isArray(periods) ? periods : [];
  const metrics = Array.isArray(SECTOR_METRICS[sector]) ? SECTOR_METRICS[sector] : [];

  const sectorData = data.filter(d => d.sector === sector && d.group === group && d.org === org);
  const chartData = safePeriods.map(period => {
    const row = { period };
    metrics.forEach(m => {
      const entry = sectorData.find(d => d.period === period && d.metric === m.key);
      row[m.key] = entry?.value ?? null;
    });
    return row;
  });

  const trendIcons = { up: <FaArrowUp style={{ color: "#1de682" }} />, down: <FaArrowDown style={{ color: "#e94057" }} />, flat: <FaFlag style={{ color: "#FFD700" }} /> };
  const forecasts = {};
  metrics.forEach(m => { forecasts[m.key] = simpleForecast(chartData, m.key); });

  // Export CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ConsistencyDashboard_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };
  // Export PDF
  const handleExportPDF = async () => {
    const element = document.getElementById("consistency-dashboard-root");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "l", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`ConsistencyDashboard_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Edit Root Cause & Action
  const updateCause = (period, mKey, val) => {
    setData(arr => arr.map(d =>
      d.sector === sector && d.group === group && d.period === period && d.metric === mKey && d.org === org
        ? { ...d, root: val }
        : d
    ));
    setEditCause(null);
  };
  const updateAction = (period, mKey, val) => {
    setData(arr => arr.map(d =>
      d.sector === sector && d.group === group && d.period === period && d.metric === mKey && d.org === org
        ? { ...d, action: val }
        : d
    ));
    setEditAction(null);
  };

  // Custom drilldown modal
  function renderDrilldown() {
    if (!drilldown) return null;
    const { period, metric } = drilldown;
    const entries = data.filter(d => d.metric === metric && d.sector === sector && d.org === org && d.group === group);
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(22,29,39,0.94)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 720, background: "#232a2e", borderRadius: 24, boxShadow: "0 3px 28px #FFD70044",
          padding: 36, position: 'relative', maxHeight: '85vh', overflowY: 'auto'
        }}>
          <button style={{
            position: 'absolute', top: 17, right: 22, fontSize: 23, color: "#FFD700", background: "none", border: "none", fontWeight: 900, cursor: "pointer"
          }} onClick={() => setDrilldown(null)}>&times;</button>
          <h3 style={{ color: "#FFD700", fontSize: 26, marginBottom: 11 }}>
            <FaHistory style={{ marginRight: 8 }} />
            Drilldown: {metrics.find(m => m.key === metric)?.label || metric}
          </h3>
          <div>
            {entries.length === 0 && <div style={{ color: "#FFD70099", fontSize: 17 }}>No data available for this metric.</div>}
            {entries.map((entry, idx) => (
              <div key={idx} style={{
                marginBottom: 22, background: "#181e23", borderRadius: 12, padding: 19,
                boxShadow: "0 1px 7px #FFD70022"
              }}>
                <div style={{ color: "#FFD700", fontWeight: 700 }}>Period: {entry.period}</div>
                <div>Value: <b style={{ color: getColor(entry.value) }}>{entry.value}</b> {boardroomAlert(entry.value, metric, entry.period, entry.root) && <FaBell style={{ color: "#e94057", marginLeft: 7 }} />}</div>
                <div>Root Cause: {entry.root || <span style={{ color: "#FFD70099" }}>None</span>}</div>
                <div>AI Suggestion: <FaRobot /> <b>{aiPredictCause(metric)}</b></div>
                <div>Action Plan: {entry.action || <span style={{ color: "#FFD70099" }}>None</span>}</div>
                {boardroomAlert(entry.value, metric, entry.period, entry.root) && (
                  <div style={{ color: "#e94057", fontWeight: 800, marginTop: 8 }}>
                    {boardroomAlert(entry.value, metric, entry.period, entry.root).map((msg, i) => <div key={i}><FaExclamationTriangle /> {msg}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="consistency-dashboard-root" style={{
      background: "#232a2e", borderRadius: 22, boxShadow: "0 4px 18px #FFD70025",
      maxWidth: 1800, margin: "38px auto", padding: 36, position: "relative"
    }}>
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 900, margin: 0 }}>
          <FaChartLine style={{ marginBottom: -5, marginRight: 10 }} />
          Consistency & Sector Performance Dashboard
        </h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button title="Export PDF" onClick={handleExportPDF}><FaDownload /> PDF</button>
          <button title="Export CSV" onClick={handleExportCSV}><FaDownload /> CSV</button>
        </div>
      </div>
      {/* --- GROUPED SECTOR BUTTONS --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, marginBottom: 17 }}>
        {GROUPS.map(gr =>
          <div key={gr.label} style={{ minWidth: 210 }}>
            <div style={{ fontWeight: 800, color: "#FFD700", marginBottom: 8, fontSize: 17 }}>{gr.label}</div>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              {gr.sectors.map(s => (
                <button
                  key={s.key}
                  onClick={() => { setSector(s.key); }}
                  style={{
                    background: sector === s.key ? "#FFD700" : "#181e23",
                    color: sector === s.key ? "#181e23" : "#FFD700",
                    borderRadius: 8, fontWeight: 900, padding: "7px 14px", fontSize: 16, cursor: "pointer"
                  }}
                >{s.icon} {s.label}</button>
              ))}
            </div>
          </div>
        )}
        <select value={org} onChange={e => setOrg(e.target.value)} style={{
          fontWeight: 700, fontSize: 17, marginLeft: 28, background: "#181e23", color: "#FFD700", borderRadius: 8
        }}>
          {safeOrgs.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      {/* --- GROUP + METRIC TOGGLE --- */}
      <div style={{ marginBottom: 21, display: "flex", gap: 18, alignItems: "center" }}>
        <span style={{ color: "#FFD700", fontWeight: 800 }}>Group:</span>
        <select value={group} onChange={e => setGroup(e.target.value)} style={{
          background: "#181e23", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 17
        }}>
          {safeGroups.map(g => <option key={g}>{g}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 800, marginLeft: 28 }}>Metrics:</span>
        {metrics.map(m =>
          <label key={m.key} style={{ marginRight: 13, fontWeight: 800, color: metricKeys.includes(m.key) ? "#FFD700" : "#888" }}>
            <input
              type="checkbox"
              checked={metricKeys.includes(m.key)}
              onChange={e => {
                if (e.target.checked) setMetricKeys(keys => Array.from(new Set([...keys, m.key])));
                else setMetricKeys(keys => keys.filter(k => k !== m.key));
              }}
              style={{ marginRight: 6 }}
            />
            {m.icon} {m.label}
          </label>
        )}
      </div>
      {/* --- METRICS CHART --- */}
      <div style={{ width: "100%", height: 360, margin: "24px 0 38px 0", background: "#181e23", borderRadius: 18, boxShadow: "0 2px 13px #FFD70022", padding: 18 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#FFD70022" strokeDasharray="3 3" />
            <XAxis dataKey="period" stroke="#FFD700" />
            <YAxis stroke="#FFD700" />
            <Tooltip />
            {metricKeys.map(k =>
              <Line key={k} dataKey={k} name={metrics.find(m => m.key === k)?.label} stroke={COLORS.elite} strokeWidth={3} dot />
            )}
            <ReferenceLine y={THRESHOLDS.solid} label="Solid" stroke="#FFD700" strokeDasharray="6 3" />
            <ReferenceLine y={THRESHOLDS.warning} label="Warning" stroke="#e94057" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* --- DATA TABLE --- */}
      <div style={{ overflowX: "auto", marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16, background: "#181e23" }}>
          <thead>
            <tr>
              <th style={{ background: "#232a2e", color: "#FFD700" }}>Period</th>
              {metricKeys.map(k => (
                <th key={k} style={{ background: "#232a2e", color: "#FFD700" }}>
                  {metrics.find(m => m.key === k)?.icon} {metrics.find(m => m.key === k)?.label}
                </th>
              ))}
              {metricKeys.map(k => (
                <th key={k + "_trend"} style={{ background: "#232a2e", color: "#1de682" }}>Trend</th>
              ))}
              {metricKeys.map(k => (
                <th key={k + "_cause"} style={{ background: "#232a2e", color: "#FFD700" }}>Root Cause</th>
              ))}
              {metricKeys.map(k => (
                <th key={k + "_ai"} style={{ background: "#232a2e", color: "#FFD700" }}>AI Cause</th>
              ))}
              {metricKeys.map(k => (
                <th key={k + "_action"} style={{ background: "#232a2e", color: "#FFD700" }}>Action Plan</th>
              ))}
              {metricKeys.map(k => (
                <th key={k + "_alert"} style={{ background: "#232a2e", color: "#FFD700" }}>Alerts</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safePeriods.map(period => (
              <tr key={period}>
                <td style={{ background: "#232a2e", fontWeight: 800, color: "#FFD700", padding: 7 }}>{period}</td>
                {metricKeys.map(k => {
                  const entry = sectorData.find(d => d.period === period && d.metric === k);
                  const val = entry?.value ?? null;
                  return (
                    <td key={k} style={{ background: "#232a2e", color: getColor(val), fontWeight: 900, textAlign: "center", padding: 7, cursor: "pointer" }}
                      onClick={() => setDrilldown({ period, metric: k })}>
                      {val == null ? "--" : val}
                    </td>
                  );
                })}
                {metricKeys.map(k => {
                  const t = calcTrend(chartData, k);
                  return (
                    <td key={k + "_trend"} style={{ textAlign: "center", padding: 7 }}>
                      {t && trendIcons[t]}
                    </td>
                  );
                })}
                {metricKeys.map(k => {
                  const entry = sectorData.find(d => d.period === period && d.metric === k);
                  if (!entry) return <td key={k + "_cause"} />;
                  return editCause && editCause.period === period && editCause.metric === k ? (
                    <td key={k + "_cause"}>
                      <input
                        autoFocus
                        defaultValue={entry.root}
                        onBlur={e => updateCause(period, k, e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") updateCause(period, k, e.target.value); }}
                        style={{ width: 95, fontSize: 13, borderRadius: 6 }}
                      />
                    </td>
                  ) : (
                    <td key={k + "_cause"}>
                      <span onClick={() => setEditCause({ period, metric: k })} style={{ cursor: "pointer" }}>
                        {entry.root || <FaRegEdit />}
                      </span>
                    </td>
                  );
                })}
                {metricKeys.map(k => (
                  <td key={k + "_ai"} style={{ fontWeight: 700, color: "#1de682", fontSize: 15 }}>
                    <FaRobot /> {aiPredictCause(k)}
                  </td>
                ))}
                {metricKeys.map(k => {
                  const entry = sectorData.find(d => d.period === period && d.metric === k);
                  if (!entry) return <td key={k + "_action"} />;
                  return editAction && editAction.period === period && editAction.metric === k ? (
                    <td key={k + "_action"}>
                      <input
                        autoFocus
                        defaultValue={entry.action}
                        onBlur={e => updateAction(period, k, e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") updateAction(period, k, e.target.value); }}
                        style={{ width: 95, fontSize: 13, borderRadius: 6 }}
                      />
                    </td>
                  ) : (
                    <td key={k + "_action"}>
                      <span onClick={() => setEditAction({ period, metric: k })} style={{ cursor: "pointer" }}>
                        {entry.action || <FaRegEdit />}
                      </span>
                    </td>
                  );
                })}
                {metricKeys.map(k => {
                  const entry = sectorData.find(d => d.period === period && d.metric === k);
                  const alerts = boardroomAlert(entry?.value, k, period, entry?.root);
                  return (
                    <td key={k + "_alert"} style={{ fontWeight: 900, color: alerts ? "#e94057" : "#1de682", textAlign: "center" }}>
                      {alerts ? alerts.map((msg, i) => <div key={i}><FaBell /> {msg}</div>) : <FaStar style={{ color: "#1de682" }} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* --- DRILLDOWN MODAL --- */}
      {renderDrilldown()}
      <div style={{ color: "#FFD70088", fontSize: 13, textAlign: "center", marginTop: 9, fontWeight: 700 }}>
        <b>
          World-class boardroom: cross-sector, signals, alerts, instant AI. Every click drills deeper.
        </b>
      </div>
      <style>{`
        button {
          background:#283E51; color:#FFD700; border:none; padding:7px 13px;
          border-radius:7px; cursor:pointer; font-size:17px; font-weight:800;
          transition:background 0.2s; outline:none;
        }
        button:hover { background:#FFD700; color:#232a2e }
        select { outline: none; }
        table th, table td { border: 1px solid #FFD70033; }
        table th { background: #232a2e; }
        input[type="checkbox"] { accent-color: #FFD700; }
      `}</style>
    </div>
  );
}
