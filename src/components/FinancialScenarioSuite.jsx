import React, { useState } from "react";
import {
  FaEuroSign, FaArrowUp, FaArrowDown, FaMoneyBillWave, FaChartPie,
  FaCheckCircle, FaExclamationTriangle, FaBolt, FaSave, FaBalanceScale, FaFilePdf
} from "react-icons/fa";
import "./FinancialScenarioSuite.css";

// --- Demo Data ---
const baseYOY = [
  { year: 2023, income: 112000, expense: 99000 },
  { year: 2024, income: 127000, expense: 110000 },
  { year: 2025, income: 122000, expense: 116000 }
];
const scenarioLines = [
  { line: "Sponsorship Income", base: 90000, optimistic: 120000, downside: 70000, category: "Income" },
  { line: "Membership Fees", base: 30000, optimistic: 35000, downside: 25000, category: "Income" },
  { line: "Grant Funding", base: 25000, optimistic: 35000, downside: 10000, category: "Income" },
  { line: "Salaries", base: 80000, optimistic: 80000, downside: 82000, category: "Expense" },
  { line: "Operations", base: 40000, optimistic: 38000, downside: 45000, category: "Expense" },
  { line: "Travel & Games", base: 15000, optimistic: 12000, downside: 18000, category: "Expense" }
];
const capitalProjects = [
  { project: "Court Resurfacing", year: 2025, budgeted: 12000, actual: 12500, status: "Completed" },
  { project: "New Minibus", year: 2025, budgeted: 20000, actual: 18500, status: "Active" }
];
const kpis = [
  { label: "Admin %", value: 18, icon: <FaChartPie /> },
  { label: "Self-Sufficiency %", value: 67, icon: <FaCheckCircle /> }
];

// --- Financial Logic ---
function sum(lines, scenario, type) {
  return lines
    .filter(l => l.category === type)
    .reduce((acc, l) => acc + l[scenario], 0);
}
function calcKPI(income, expense) {
  const surplus = income - expense;
  return {
    surplus,
    cash: 25000 + surplus,
    admin: kpis[0].value,
    selfSuff: kpis[1].value,
    growth: 8
  };
}
function scenarioColor(val, base) {
  if (val > base) return "#1de682";
  if (val < base) return "#e84855";
  return "#FFD700";
}
function riskLevel(surplus) {
  if (surplus > 0) return { color: "#1de682", label: "Healthy" };
  if (surplus > -5000) return { color: "#FFD700", label: "Warning" };
  return { color: "#e84855", label: "Critical" };
}

// --- Sparkline SVG
function Sparkline({ data, type }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const h = 26, w = 52;
  const pts = data.map((v, i) =>
    `${(w / (data.length - 1)) * i},${h - ((v - min) / (max - min || 1)) * h}`
  );
  return (
    <svg width={w} height={h} style={{ verticalAlign: "middle" }}>
      <polyline fill="none" stroke={type === "inc" ? "#1de682" : "#FFD700"} strokeWidth="3" points={pts.join(" ")} />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * h} r="3.5" fill={type === "inc" ? "#1de682" : "#FFD700"} />
    </svg>
  );
}

// --- Financial Health Dial SVG
function HealthDial({ value }) {
  // value from -20,000 (bad) to +50,000 (best)
  const min = -20000, max = 50000;
  const angle = 225 + 270 * ((value - min) / (max - min));
  let color = "#1de682";
  if (value < 0) color = "#FFD700";
  if (value < -5000) color = "#e84855";
  return (
    <svg width="100" height="100">
      <circle cx="50" cy="50" r="40" stroke="#283E51" strokeWidth="15" fill="none"/>
      <path
        d={`M50,50 L50,10 A40,40 0 ${angle > 360 ? 1 : 0} 1 ${50 + 40 * Math.cos((angle-90)*Math.PI/180)},${50 + 40 * Math.sin((angle-90)*Math.PI/180)}`}
        stroke={color}
        strokeWidth="9"
        fill="none"
      />
      <circle cx="50" cy="50" r="23" fill="#232a2e"/>
      <text x="50%" y="55%" textAnchor="middle" fontSize="18" fill={color} fontWeight="700" dy="0.3em">
        €{value.toLocaleString()}
      </text>
    </svg>
  );
}

export default function FinancialScenarioSuite() {
  const [scenario, setScenario] = useState("base");
  const [liveVals, setLiveVals] = useState(
    scenarioLines.reduce((acc, l) => ({ ...acc, [l.line]: l.base }), {})
  );
  const [saved, setSaved] = useState([]);
  const [stress, setStress] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Battle mode & shockwave
  const [compareMode, setCompareMode] = useState(false);
  const [rightScenario, setRightScenario] = useState("optimistic");
  const [showShock, setShowShock] = useState(false);

  // Finance logic
  const income = scenarioLines
    .filter(l => l.category === "Income")
    .reduce((a, l) => a + (liveVals[l.line] ?? l.base), 0);
  const expense = scenarioLines
    .filter(l => l.category === "Expense")
    .reduce((a, l) => a + (liveVals[l.line] ?? l.base), 0);
  const kpi = calcKPI(income, expense);
  const allYOY = baseYOY.concat([{ year: 2025, income, expense }]);
  const worstLine = scenarioLines
    .filter(l => l.category === "Income")
    .sort((a, b) => (liveVals[a.line] ?? a.base) - a.downside - ((liveVals[b.line] ?? b.base) - b.downside))[0];

  // Boardroom "battle mode"
  const rightLiveVals = scenarioLines.reduce((acc, l) => ({ ...acc, [l.line]: l[rightScenario] }), {});
  const rightIncome = scenarioLines.filter(l => l.category === "Income").reduce((a, l) => a + (rightLiveVals[l.line]), 0);
  const rightExpense = scenarioLines.filter(l => l.category === "Expense").reduce((a, l) => a + (rightLiveVals[l.line]), 0);
  const rightKPI = calcKPI(rightIncome, rightExpense);

  // Handlers
  const handleSlider = (l, v) => setLiveVals(prev => ({ ...prev, [l.line]: +v }));
  const handleScenario = s => {
    setScenario(s);
    setLiveVals(scenarioLines.reduce((acc, l) => ({ ...acc, [l.line]: l[s] }), {}));
    setStress(false);
  };
  const handleStress = () => {
    let newVals = { ...liveVals };
    scenarioLines.forEach(l => {
      if (l.category === "Income") newVals[l.line] = Math.round((liveVals[l.line] ?? l.base) * 0.9);
      else newVals[l.line] = Math.round((liveVals[l.line] ?? l.base) * 1.1);
    });
    setLiveVals(newVals);
    setStress(true);
    setShowShock(true);
    setTimeout(() => setShowShock(false), 900);
  };
  const handleShock = type => {
    setShowShock(true);
    setTimeout(() => setShowShock(false), 900);
    let newVals = { ...liveVals };
    if (type === "sponsor") newVals["Sponsorship Income"] = Math.round((liveVals["Sponsorship Income"] || 0) * 0.5);
    if (type === "grant") newVals["Grant Funding"] = 0;
    if (type === "salary") newVals["Salaries"] = Math.round((liveVals["Salaries"] || 0) * 1.15);
    setLiveVals(newVals);
  };
  const handleSave = () => setSaved(s => [...s, { scenario, values: { ...liveVals }, dt: Date.now() }]);
  const handleExport = () => setShowExport(true);

  return (
    <div className="fss-main">
      <div className="fss-header">
        <h2>Financial Scenario & Strategy Suite</h2>
        <div className="fss-subtitle">
          <FaEuroSign style={{ marginRight: 9, color: "#FFD700" }} />
          Instantly visualize “what-if” scenarios, stress-test your budget, and present board-level clarity.
        </div>
      </div>

      {/* SCENARIO SELECTOR, CONTROLS, SHOCKWAVE */}
      <div className="fss-section fss-scenario-toggle">
        <span>Scenario:</span>
        <button className={scenario === "base" ? "active" : ""} onClick={() => handleScenario("base")}>Base</button>
        <button className={scenario === "optimistic" ? "active" : ""} onClick={() => handleScenario("optimistic")}>Optimistic</button>
        <button className={scenario === "downside" ? "active" : ""} onClick={() => handleScenario("downside")}>Downside</button>
        <button onClick={handleStress} style={{ marginLeft: 15 }} className={stress ? "active" : ""}>
          <FaBalanceScale style={{ marginRight: 5 }} /> Stress Test
        </button>
        <button onClick={handleSave} style={{ marginLeft: 8 }}>
          <FaSave style={{ marginRight: 4 }} /> Save Board Scenario
        </button>
        <button onClick={handleExport} style={{ marginLeft: 8 }}>
          <FaFilePdf style={{ marginRight: 4 }} /> Board PDF Export
        </button>
        <button onClick={() => setCompareMode(c => !c)} style={{ marginLeft: 8 }}>
          <FaBalanceScale style={{ marginRight: 4 }} /> {compareMode ? "Exit Battle Mode" : "Battle Mode"}
        </button>
      </div>

      <div className="fss-shock-controls">
        <button onClick={() => handleShock("sponsor")}>Sponsor Pulls Out</button>
        <button onClick={() => handleShock("grant")}>Grant Delayed</button>
        <button onClick={() => handleShock("salary")}>Salary Overruns</button>
        {showShock && <div className="fss-shockwave"></div>}
      </div>

      {/* BOARDROOM BATTLE MODE */}
      {compareMode && (
        <div className="fss-battle-row">
          <div>
            <div className="fss-dashboard-card">
              <div className="fss-dash-label">Your Plan</div>
              <HealthDial value={kpi.surplus} />
            </div>
            <div className="fss-dash-label" style={{ textAlign: "center", color: "#1de682" }}>Current</div>
          </div>
          <div>
            <div className="fss-dashboard-card">
              <div className="fss-dash-label">Chairman/AI Plan</div>
              <HealthDial value={rightKPI.surplus} />
            </div>
            <div className="fss-dash-label" style={{ textAlign: "center", color: "#FFD700" }}>{rightScenario}</div>
            <button onClick={() => setRightScenario(s => s === "optimistic" ? "downside" : "optimistic")}>
              Switch Scenario
            </button>
          </div>
          <div className="fss-battle-delta">
            Surplus Δ: <b style={{ color: (kpi.surplus - rightKPI.surplus) > 0 ? "#1de682" : "#e84855" }}>
              €{(kpi.surplus - rightKPI.surplus).toLocaleString()}
            </b>
          </div>
        </div>
      )}

      {/* DASHBOARD KPIs/SPARKLINES/RISK */}
      <div className="fss-section">
        <div className="fss-dashboard-row">
          <div className="fss-dashboard-card">
            <div className="fss-dash-label">Total Income</div>
            <div className="fss-dash-value" style={{ color: "#1de682" }}>
              €{income.toLocaleString()}
              <div className="fss-sparkline"><Sparkline data={allYOY.map(y => y.income)} type="inc" /></div>
            </div>
          </div>
          <div className="fss-dashboard-card">
            <div className="fss-dash-label">Total Expense</div>
            <div className="fss-dash-value" style={{ color: "#FFD700" }}>
              €{expense.toLocaleString()}
              <div className="fss-sparkline"><Sparkline data={allYOY.map(y => y.expense)} type="exp" /></div>
            </div>
          </div>
          <div className="fss-dashboard-card">
            <div className="fss-dash-label">Surplus / Deficit</div>
            <div className="fss-dash-value" style={{ color: kpi.surplus >= 0 ? "#1de682" : "#e84855" }}>
              €{kpi.surplus.toLocaleString()}
            </div>
          </div>
          <div className="fss-dashboard-card">
            <div className="fss-dash-label">Risk Meter</div>
            <div className="fss-riskmeter" style={{ color: riskLevel(kpi.surplus).color }}>
              <FaExclamationTriangle style={{ marginRight: 7 }} />
              {riskLevel(kpi.surplus).label}
            </div>
          </div>
          <div className="fss-dashboard-card">
            <div className="fss-dash-label">Cash Position</div>
            <div className="fss-dash-value" style={{ color: "#FFD700" }}>
              €{kpi.cash.toLocaleString()}
            </div>
          </div>
          {kpis.map(k => (
            <div className="fss-dashboard-card" key={k.label}>
              <div className="fss-dash-label">{k.label}</div>
              <div className="fss-dash-value" style={{ color: "#1de682" }}>
                {k.value}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE SLIDERS */}
      <div className="fss-section">
        <div className="fss-section-title">Live Scenario Sliders</div>
        <div className="fss-slider-row">
          {scenarioLines.map(l => (
            <div className="fss-slider-card" key={l.line}>
              <div className="fss-slider-label">{l.line}</div>
              <input
                type="range"
                min={Math.min(l.downside, l.base, l.optimistic) * 0.75}
                max={Math.max(l.downside, l.base, l.optimistic) * 1.25}
                step={1000}
                value={liveVals[l.line]}
                onChange={e => handleSlider(l, e.target.value)}
                className={l.category === "Income" ? "fss-slider-inc" : "fss-slider-exp"}
              />
              <div className="fss-slider-value" style={{ color: l.category === "Income" ? "#1de682" : "#FFD700" }}>
                €{Number(liveVals[l.line]).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCENARIO TABLE */}
      <div className="fss-section">
        <div className="fss-section-title">Scenario Table & Drilldown</div>
        <div className="fss-table">
          <div className="fss-thead">
            <div className="fss-th">Line Item</div>
            <div className="fss-th">Base</div>
            <div className="fss-th">Optimistic</div>
            <div className="fss-th">Downside</div>
            <div className="fss-th">Live</div>
            <div className="fss-th">Category</div>
          </div>
          {scenarioLines.map(l => (
            <div className="fss-trow" key={l.line}>
              <div className="fss-td">{l.line}</div>
              <div className="fss-td" style={{ color: scenarioColor(l.base, l.base) }}>€{l.base.toLocaleString()}</div>
              <div className="fss-td" style={{ color: scenarioColor(l.optimistic, l.base) }}>€{l.optimistic.toLocaleString()}</div>
              <div className="fss-td" style={{ color: scenarioColor(l.downside, l.base) }}>€{l.downside.toLocaleString()}</div>
              <div className="fss-td" style={{ color: "#1de682", fontWeight: 700 }}>€{Number(liveVals[l.line]).toLocaleString()}</div>
              <div className="fss-td">{l.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CAPITAL PROJECTS */}
      <div className="fss-section">
        <div className="fss-section-title">Capital Projects Monitor</div>
        <div className="fss-table">
          <div className="fss-thead">
            <div className="fss-th">Project</div>
            <div className="fss-th">Year</div>
            <div className="fss-th">Budgeted (€)</div>
            <div className="fss-th">Actual (€)</div>
            <div className="fss-th">Status</div>
          </div>
          {capitalProjects.map(p => (
            <div className="fss-trow" key={p.project}>
              <div className="fss-td">{p.project}</div>
              <div className="fss-td">{p.year}</div>
              <div className="fss-td">€{p.budgeted.toLocaleString()}</div>
              <div className="fss-td" style={{
                color: p.actual > p.budgeted ? "#e84855" : "#1de682",
                fontWeight: 600
              }}>
                €{p.actual.toLocaleString()}
              </div>
              <div className="fss-td">{p.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI PANEL */}
      <div className="fss-section">
        <div className="fss-section-title">AI Strategic Panel</div>
        <div className="fss-ai-panel">
          <FaBolt style={{ color: "#1de682", marginRight: 9 }} />
          <span>
            Board Insight: <b>Your most fragile line is {worstLine.line}. If funding dips, break-even requires at least €{expense.toLocaleString()} in income, or cost trim of €{(expense - income) > 0 ? (expense - income).toLocaleString() : 0}.</b>
          </span>
        </div>
      </div>

      {/* AI Copilot Demo */}
      <div className="fss-ai-ask">
        <span>AI Copilot:</span>
        <button onClick={() => handleSlider({line: "Operations"}, (liveVals["Operations"] || 40000) * 1.2)}>
          What if Operations cost rise by 20%?
        </button>
        <button onClick={() => handleSlider({line: "Sponsorship Income"}, (liveVals["Sponsorship Income"] || 90000) + 15000)}>
          How much to hit €20k surplus?
        </button>
      </div>

      {/* SAVED SCENARIOS */}
      {saved.length > 0 && (
        <div className="fss-section">
          <div className="fss-section-title">Boardroom Scenario Archive</div>
          <div className="fss-saved-row">
            {saved.map((s, i) => (
              <div className="fss-saved-card" key={i}>
                <div className="fss-saved-title">Scenario: {s.scenario}</div>
                <div className="fss-saved-meta">Saved {new Date(s.dt).toLocaleTimeString()}</div>
                <div className="fss-saved-val">Surplus: €{
                  scenarioLines
                    .filter(l => l.category === "Income")
                    .reduce((a, l) => a + (s.values[l.line] ?? l.base), 0)
                  - scenarioLines
                    .filter(l => l.category === "Expense")
                    .reduce((a, l) => a + (s.values[l.line] ?? l.base), 0)
                }</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF EXPORT MODAL */}
      {showExport && (
        <div className="fss-export-modal">
          <div className="fss-export-box">
            <button className="fss-export-close" onClick={() => setShowExport(false)}>×</button>
            <h3>PDF Export (UI Preview Only)</h3>
            <div style={{ color: "#FFD700", fontWeight: 700 }}>All financials, scenario tables, KPIs and risk dashboard will be ready for PDF export in v2.</div>
            <div style={{ marginTop: 13, color: "#fff" }}>
              <div>Scenario: <b>{scenario}</b></div>
              <div>Current Surplus: <b>€{kpi.surplus.toLocaleString()}</b></div>
              <div>Cash Position: <b>€{kpi.cash.toLocaleString()}</b></div>
              <div>Risk Meter: <b style={{ color: riskLevel(kpi.surplus).color }}>{riskLevel(kpi.surplus).label}</b></div>
              <div style={{ marginTop: 13, fontSize: 15, color: "#1de682" }}>Board branding, logos, signatures and time-stamp ready for print.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
