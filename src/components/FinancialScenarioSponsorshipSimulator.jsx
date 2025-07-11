import React, { useState } from "react";
import {
  FaMoneyBillWave, FaEuroSign, FaArrowUp, FaArrowDown, FaPlus, FaEdit, FaTrash, FaFileExport, FaChartLine, FaLightbulb, FaExclamationTriangle, FaCheck, FaMinusCircle, FaComments, FaUndo, FaSync
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

// --- Default Data
const DEFAULT_YEARS = [2024, 2025, 2026, 2027];
const DEFAULT_SPONSORS = [
  { name: "Erste Bank", value: 120000, expiry: 2025 },
  { name: "Adidas", value: 70000, expiry: 2026 },
  { name: "Telekom", value: 60000, expiry: 2024 }
];
const DEFAULT_SCENARIOS = [
  { name: "Lose Main Sponsor", impact: { income: -250000, sponsorship: -120000, action: "Activate board fundraising; cut non-essential costs.", risk: "high" } },
  { name: "Sell Top Player", impact: { income: +150000, expenses: -80000, action: "Invest in youth; review depth.", risk: "medium" } },
  { name: "New TV Deal", impact: { income: +90000, action: "Allocate to long-term contracts.", risk: "low" } },
  { name: "Wage Inflation", impact: { expenses: +70000, action: "Negotiate multi-year deals, lock in costs.", risk: "medium" } }
];

const demoData = {
  years: [...DEFAULT_YEARS],
  income: [950000, 970000, 980000, 1000000],
  expenses: [890000, 910000, 920000, 980000],
  playerSales: [0, 150000, 0, 0],
  runway: 210000
};

// --- Currency Formatting
const fmt = n => n.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

// --- The Component
const FinancialScenarioSponsorshipElite = () => {
  const [years, setYears] = useState([...demoData.years]);
  const [income, setIncome] = useState([...demoData.income]);
  const [expenses, setExpenses] = useState([...demoData.expenses]);
  const [playerSales, setPlayerSales] = useState([...demoData.playerSales]);
  const [sponsors, setSponsors] = useState([...DEFAULT_SPONSORS]);
  const [scenarios, setScenarios] = useState([...DEFAULT_SCENARIOS]);
  const [scenarioStack, setScenarioStack] = useState([]);
  const [customScenario, setCustomScenario] = useState({ name: "", impact: {}, action: "", risk: "medium" });
  const [comments, setComments] = useState([{ by: "Board", txt: "Review sponsor expiry before new season.", date: "2024-05-12" }]);
  const [commentText, setCommentText] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [resetCounter, setResetCounter] = useState(0);

  // --- Financial Calculations
  function getSponsorTotal(yr) {
    return sponsors.reduce((sum, s) => s.expiry >= yr ? sum + s.value : sum, 0);
  }
  const sponsorship = years.map(y => getSponsorTotal(y));
  const net = years.map((y, i) => (income[i] + (sponsorship[i] || 0) + (playerSales[i] || 0)) - (expenses[i] || 0));
  const balance = net.reduce((acc, n, i) => { acc.push((acc[i - 1] || demoData.runway) + n); return acc; }, []);
  const breakEvenYear = balance.findIndex(b => b <= 0);
  const minBalance = Math.min(...balance);

  // --- Scenario Impact Preview (non-mutating)
  function previewScenario(scenario) {
    let i = income.slice(), e = expenses.slice(), p = playerSales.slice(), spon = sponsorship.slice();
    years.forEach((y, idx) => {
      i[idx] += scenario.impact.income || 0;
      e[idx] += scenario.impact.expenses || 0;
      spon[idx] += scenario.impact.sponsorship || 0;
      p[idx] += scenario.impact.playerSales || 0;
    });
    let netPrev = years.map((y, i) => (i[i] + (spon[i] || 0) + (p[i] || 0)) - (e[i] || 0));
    let balancePrev = netPrev.reduce((acc, n, i) => { acc.push((acc[i - 1] || demoData.runway) + n); return acc; }, []);
    return { net: netPrev, balance: balancePrev };
  }

  // --- Apply/Undo/Reset Scenarios
  const applyScenario = idx => {
    const s = scenarios[idx];
    setScenarioStack([...scenarioStack, s]);
    let i = income.slice(), e = expenses.slice(), p = playerSales.slice();
    years.forEach((y, j) => {
      i[j] += s.impact.income || 0;
      e[j] += s.impact.expenses || 0;
      p[j] += s.impact.playerSales || 0;
    });
    setIncome(i); setExpenses(e); setPlayerSales(p);
  };
  const undoScenario = () => {
    // Reset and re-apply all except last
    let stack = scenarioStack.slice(0, -1);
    let i = [...demoData.income], e = [...demoData.expenses], p = [...demoData.playerSales];
    stack.forEach(s => {
      years.forEach((y, j) => {
        i[j] += s.impact.income || 0;
        e[j] += s.impact.expenses || 0;
        p[j] += s.impact.playerSales || 0;
      });
    });
    setIncome(i); setExpenses(e); setPlayerSales(p); setScenarioStack(stack);
  };
  const resetAll = () => {
    setIncome([...demoData.income]);
    setExpenses([...demoData.expenses]);
    setPlayerSales([...demoData.playerSales]);
    setScenarioStack([]);
    setResetCounter(c => c + 1);
  };

  // --- Sponsors CRUD
  const [newSponsor, setNewSponsor] = useState({ name: "", value: 0, expiry: years[years.length - 1] });
  const addSponsor = () => {
    if (!newSponsor.name || !newSponsor.value) return;
    setSponsors([...sponsors, { ...newSponsor }]);
    setNewSponsor({ name: "", value: 0, expiry: years[years.length - 1] });
  };
  const removeSponsor = idx => setSponsors(sponsors.filter((_, i) => i !== idx));

  // --- Sponsor Health/Exposure
  function sponsorExpiryAlert() {
    const soon = sponsors.filter(s => s.expiry <= years[0]);
    if (soon.length) return `ALERT: ${soon.map(s => s.name).join(", ")} expiring this year!`;
    const next = sponsors.filter(s => s.expiry === years[1]);
    if (next.length) return `Notice: ${next.map(s => s.name).join(", ")} expiring next year.`;
    return "All main sponsors under contract beyond next season.";
  }
  function sponsorConcentration() {
    const total = sponsors.reduce((a, s) => a + s.value, 0);
    const max = sponsors.reduce((a, s) => Math.max(a, s.value), 0);
    return total ? Math.round(100 * max / total) : 0;
  }
  function avgSponsorDuration() {
    if (!sponsors.length) return 0;
    const now = years[0];
    return Math.round(sponsors.reduce((a, s) => a + (s.expiry - now + 1), 0) / sponsors.length * 10) / 10;
  }

  // --- Boardroom Comments
  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([...comments, { by: "Board", txt: commentText, date: new Date().toISOString().slice(0, 10), type: "action" }]);
    setCommentText("");
  };

  // --- Recommendations
  function riskRecos() {
    let out = [];
    if (sponsorConcentration() > 60) out.push("HIGH RISK: Over 60% of sponsorship from one partner.");
    if (breakEvenYear >= 0) out.push(`Deficit/runway ends in ${years[breakEvenYear]}: urgent board action needed.`);
    if (sponsors.filter(s => s.expiry <= years[0]).length) out.push("Sponsor expiring this year: renew or replace.");
    if (expenses.some((e, i) => e > (income[i] + (sponsorship[i] || 0) + (playerSales[i] || 0))))
      out.push("Expenses exceed revenue: review wage bill, staff, or cut discretionary spending.");
    if (!out.length) out.push("Financial runway is safe. Maintain discipline, diversify sponsors.");
    return out;
  }

  // --- Export
  const exportCSV = () => {
    let csv = ["Year,Income,Expenses,Sponsorship,Player Sales,Net,Cash Balance"];
    years.forEach((y, i) => csv.push(
      [y, income[i], expenses[i], sponsorship[i], playerSales[i], net[i], balance[i]].join(",")
    ));
    csv.push("\nSponsors:");
    sponsors.forEach(s => csv.push(`${s.name},${s.value},${s.expiry}`));
    csv.push("\nScenarios:");
    scenarios.forEach(s => csv.push([s.name, (s.risk || "medium"), JSON.stringify(s.impact), s.action].join(",")));
    csv.push("\nBoard Log:");
    comments.forEach(c => csv.push([c.date, c.by, c.txt].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "financial_scenario.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // --- Utility for editable cells (this fixes your error!)
  function updateFinancial(arr, setArr, idx, val) {
    const next = arr.slice();
    next[idx] = Number(val);
    setArr(next);
  }

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1450, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaMoneyBillWave size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Financial Scenario & Sponsorship Simulator (ELITE)
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Elite Finance
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
        <button onClick={resetAll} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 6 }}><FaSync style={{ marginRight: 5 }} /> Reset All</button>
      </div>
      {/* Sponsor Health Dashboard */}
      <div style={{ display: "flex", gap: 18, marginBottom: 9 }}>
        <div style={{ flex: 2, background: "#232a2e", borderRadius: 14, boxShadow: "0 2px 18px #FFD70022", padding: 16 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18 }}>Sponsors</div>
          <div style={{ fontSize: 15, color: "#FFD700aa", marginBottom: 5 }}>
            <b>Top sponsor exposure:</b> {sponsorConcentration()}% &nbsp; | &nbsp;
            <b>Avg contract duration:</b> {avgSponsorDuration()} yr &nbsp; | &nbsp;
            <b>Next renewal:</b> {Math.min(...sponsors.map(s => s.expiry))}
          </div>
          <div style={{ color: sponsorConcentration() > 60 ? "#ff4848" : "#1de682", fontWeight: 800, marginLeft: 2 }}>
            {sponsorExpiryAlert()}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff", marginTop: 7 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Annual Value</th>
                <th>Contract Expiry</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s, i) =>
                <tr key={i} style={{ background: s.expiry <= years[0] ? "#ff484822" : s.expiry === years[1] ? "#FFD70022" : "#1de68222" }}>
                  <td style={{ fontWeight: 700, color: "#FFD700" }}>{s.name}</td>
                  <td>{fmt(s.value)}</td>
                  <td>{s.expiry}</td>
                  <td>
                    <button onClick={() => removeSponsor(i)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 9 }}>
            <input value={newSponsor.name} placeholder="Name" onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })} style={inputStyle} />
            <input value={newSponsor.value} type="number" placeholder="Annual Value" onChange={e => setNewSponsor({ ...newSponsor, value: Number(e.target.value) })} style={inputStyle} />
            <input value={newSponsor.expiry} type="number" placeholder="Expiry Year" onChange={e => setNewSponsor({ ...newSponsor, expiry: Number(e.target.value) })} style={inputStyle} />
            <button onClick={addSponsor} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaPlus /> Add Sponsor</button>
          </div>
          {/* Timeline: Multi-sponsor contracts overlay */}
          <div style={{ marginTop: 8 }}>
            <div style={{ color: "#FFD700bb", fontWeight: 700, marginBottom: 3 }}>Sponsor Timeline</div>
            <svg width={400} height={30}>
              {sponsors.map((s, i) =>
                <rect key={i}
                  x={25 + (s.expiry - years[0]) * 80}
                  y={3 + i * 9}
                  width={80 * (s.expiry - years[0] + 1)}
                  height={8}
                  fill={s.expiry <= years[0] ? "#ff4848" : "#1de682"}
                  opacity="0.7"
                />
              )}
              {years.map((y, i) =>
                <text key={i} x={25 + i * 80} y={28} fill="#FFD700cc" fontSize={12}>{y}</text>
              )}
            </svg>
          </div>
        </div>
        {/* Charts */}
        <div style={{ flex: 1, background: "#232a2e", borderRadius: 14, boxShadow: "0 2px 18px #FFD70022", padding: 16 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 4 }}><FaChartLine style={{ marginRight: 7 }} /> Cashflow</div>
          <svg width={220} height={120}>
            {balance.map((b, i) => i > 0 &&
              <line key={i} x1={30 + (i - 1) * 60} y1={90 - balance[i - 1] / 5000}
                x2={30 + i * 60} y2={90 - b / 5000} stroke="#FFD700" strokeWidth={4} />
            )}
            {years.map((y, i) => (
              <g key={y}>
                <circle cx={30 + i * 60} cy={90 - balance[i] / 5000} r={7} fill={balance[i] < 0 ? "#ff4848" : "#1de682"} />
                <text x={30 + i * 60} y={110} textAnchor="middle" fill="#FFD700">{y}</text>
              </g>
            ))}
          </svg>
          <div style={{ fontSize: 12, color: "#FFD700aa" }}>Y axis: 5k EUR units</div>
        </div>
      </div>
      {/* Table */}
      <div style={{ margin: "10px 0 14px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16, color: "#fff" }}>
          <thead>
            <tr>
              <th>Year</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Sponsorship</th>
              <th>Player Sales</th>
              <th>Net</th>
              <th>Cash Balance</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y, i) =>
              <tr key={y} style={{ background: balance[i] < 0 ? "#ff484822" : balance[i] < 100000 ? "#FFD70022" : "#1de68222" }}>
                <td>{y}</td>
                <td><input value={income[i]} onChange={e => updateFinancial(income, setIncome, i, e.target.value)} style={inputStyle} /></td>
                <td><input value={expenses[i]} onChange={e => updateFinancial(expenses, setExpenses, i, e.target.value)} style={inputStyle} /></td>
                <td>{fmt(sponsorship[i])}</td>
                <td><input value={playerSales[i]} onChange={e => updateFinancial(playerSales, setPlayerSales, i, e.target.value)} style={inputStyle} /></td>
                <td style={{ color: net[i] < 0 ? "#ff4848" : "#1de682", fontWeight: 700 }}>{fmt(net[i])}</td>
                <td style={{ color: balance[i] < 0 ? "#ff4848" : "#1de682", fontWeight: 700 }}>{fmt(balance[i])}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Scenario Engine */}
      <div style={{ background: "#283E51", borderRadius: 13, padding: 13, margin: "22px 0" }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 16, marginBottom: 6, display: "flex", alignItems: "center" }}><FaLightbulb style={{ marginRight: 7 }} />What-if Scenario Engine (Stackable)</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff", marginBottom: 7 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Impact</th>
              <th>Board Action</th>
              <th>Risk</th>
              <th>Preview</th>
              <th>Apply</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => {
              const prev = previewScenario(s);
              return (
                <tr key={i} style={{ background: (s.risk || "medium") === "high" ? "#ff484822" : (s.risk || "medium") === "medium" ? "#FFD70022" : "#1de68222" }}>
                  <td style={{ fontWeight: 700, color: "#FFD700" }}>{s.name}</td>
                  <td>
                    {s.impact.income && (s.impact.income > 0 ? <span style={{ color: "#1de682" }}>+{fmt(s.impact.income)}</span> : <span style={{ color: "#ff4848" }}>{fmt(s.impact.income)}</span>)}<br />
                    {s.impact.expenses && (s.impact.expenses > 0 ? <span style={{ color: "#ff4848" }}>+{fmt(s.impact.expenses)}</span> : <span style={{ color: "#1de682" }}>{fmt(s.impact.expenses)}</span>)}<br />
                    {s.impact.sponsorship && (s.impact.sponsorship > 0 ? <span style={{ color: "#1de682" }}>+{fmt(s.impact.sponsorship)} (Spons)</span> : <span style={{ color: "#ff4848" }}>{fmt(s.impact.sponsorship)} (Spons)</span>)}
                  </td>
                  <td>{s.action}</td>
                  <td style={{ color: (s.risk || "medium") === "high" ? "#ff4848" : (s.risk || "medium") === "medium" ? "#FFD700" : "#1de682", fontWeight: 800 }}>
                    {(s.risk || "medium").toUpperCase()}
                  </td>
                  <td>
                    <span style={{ color: prev.balance.some(b => b < 0) ? "#ff4848" : "#1de682", fontWeight: 700 }}>
                      Net: {prev.net.map((n, j) => <span key={j} style={{ marginRight: 7 }}>{fmt(n)}</span>)}<br />
                      Runway: {prev.balance.map((b, j) => <span key={j} style={{ marginRight: 7 }}>{fmt(b)}</span>)}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => applyScenario(i)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaArrowUp /> Apply</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Scenario stack / Undo/Reset */}
        <div style={{ marginTop: 8 }}>
          {scenarioStack.length > 0 &&
            <button onClick={undoScenario} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 7 }}><FaUndo style={{ marginRight: 5 }} /> Undo Last</button>
          }
          {(scenarioStack.length > 0 || resetCounter > 0) &&
            <button onClick={resetAll} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaSync style={{ marginRight: 5 }} /> Full Reset</button>
          }
        </div>
        {/* Add scenario */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 11 }}>
          <input value={customScenario.name} placeholder="Name" onChange={e => setCustomScenario({ ...customScenario, name: e.target.value })} style={inputStyle} />
          <input value={customScenario.impact.income || ""} type="number" placeholder="Δ Income" onChange={e => setCustomScenario({ ...customScenario, impact: { ...customScenario.impact, income: Number(e.target.value) } })} style={inputStyle} />
          <input value={customScenario.impact.expenses || ""} type="number" placeholder="Δ Expenses" onChange={e => setCustomScenario({ ...customScenario, impact: { ...customScenario.impact, expenses: Number(e.target.value) } })} style={inputStyle} />
          <input value={customScenario.impact.sponsorship || ""} type="number" placeholder="Δ Sponsorship" onChange={e => setCustomScenario({ ...customScenario, impact: { ...customScenario.impact, sponsorship: Number(e.target.value) } })} style={inputStyle} />
          <input value={customScenario.action} placeholder="Action Plan" onChange={e => setCustomScenario({ ...customScenario, action: e.target.value })} style={inputStyleFull} />
          <select value={customScenario.risk} onChange={e => setCustomScenario({ ...customScenario, risk: e.target.value })} style={inputStyle}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={() => setScenarios([...scenarios, { ...customScenario, risk: customScenario.risk || "medium" }])} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaPlus /> Add Scenario</button>
        </div>
      </div>
      {/* Recommendations & Board Log */}
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}><FaLightbulb style={{ marginRight: 7 }} /> Boardroom Recommendations</div>
          <ul>
            {riskRecos().map((r, i) => <li key={i} style={{ color: r.includes("RISK") || r.includes("deficit") ? "#ff4848" : "#1de682", fontWeight: 600 }}>{r}</li>)}
          </ul>
        </div>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
          <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
            {comments
              .filter(c => logFilter === "all" || c.type === logFilter)
              .map((c, i) => <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12 }}>{c.date}</span></div>)
            }
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={commentText} placeholder="Add board note or action..." onChange={e => setCommentText(e.target.value)} style={inputStyleFull} />
            <button onClick={addComment} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
            <select value={logFilter} onChange={e => setLogFilter(e.target.value)} style={inputStyle}>
              <option value="all">All</option>
              <option value="action">Actions</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 110
};
const inputStyleFull = {
  ...inputStyle, width: 220
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default FinancialScenarioSponsorshipElite;
