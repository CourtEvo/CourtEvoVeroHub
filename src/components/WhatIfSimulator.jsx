import React, { useState } from "react";
import { FaChartBar, FaCogs, FaEuroSign, FaBasketballBall, FaUsers, FaUserTie, FaBalanceScale, FaBolt, FaBullseye, FaExclamationTriangle, FaRobot, FaSave, FaTrash, FaTable, FaListAlt, FaLink } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SECTORS = [
  { key: "sport",        label: "Sport Ops",      icon: <FaBasketballBall color="#FFD700" /> },
  { key: "business",     label: "Business Ops",   icon: <FaEuroSign color="#27ef7d" /> },
  { key: "governance",   label: "Governance",     icon: <FaBalanceScale color="#00B4D8" /> },
  { key: "staffing",     label: "Staffing/HR",    icon: <FaUserTie color="#f39c12" /> },
  { key: "community",    label: "Community",      icon: <FaUsers color="#c084fc" /> },
  { key: "digital",      label: "Digital/Media",  icon: <FaCogs color="#A3E635" /> }
];

const EXAMPLES = {
  sport: [
    {
      scenario: "Add 2 extra training sessions/week",
      variable: "+2 sessions",
      impact: "+4% player fatigue, +2% skill gain",
      breakdown: [
        { metric: "Player Fatigue", value: "+4%", risk: "Risk" },
        { metric: "Skill Gain", value: "+2%", risk: "Opportunity" },
        { metric: "Coach Workload", value: "+2h/wk", risk: "Risk" }
      ],
      boardAlert: "Flag for monitoring: Possible overtraining risk in U18s."
    },
    {
      scenario: "Shorten off-season by 2 weeks",
      variable: "-2 weeks",
      impact: "-10% recovery, +5% injury risk",
      breakdown: [
        { metric: "Recovery Time", value: "-10%", risk: "Risk" },
        { metric: "Injury Risk", value: "+5%", risk: "Risk" },
        { metric: "Earlier Start", value: "+1 game", risk: "Opportunity" }
      ],
      boardAlert: "Urgent: Board must sign off on insurance policy update."
    },
    {
      scenario: "Integrate AI performance analytics",
      variable: "AI tracking",
      impact: "+7% tactical efficiency",
      breakdown: [
        { metric: "Tactical Efficiency", value: "+7%", risk: "Opportunity" },
        { metric: "Learning Curve", value: "2 weeks", risk: "Risk" }
      ],
      boardAlert: "Recommend cross-sector training for coaches and staff."
    },
    {
      scenario: "Cut travel budget by 20%",
      variable: "-20% cost",
      impact: "-5% competition exposure",
      breakdown: [
        { metric: "Competition Exposure", value: "-5%", risk: "Risk" },
        { metric: "Budget Saved", value: "+€9,000", risk: "Opportunity" }
      ],
      boardAlert: "Cross-impact: Business ops must re-calculate sponsor deliverables."
    }
  ],
  business: [
    {
      scenario: "Increase ticket prices by 15%",
      variable: "+15% price",
      impact: "+11% revenue, -4% attendance",
      breakdown: [
        { metric: "Revenue", value: "+11%", risk: "Opportunity" },
        { metric: "Attendance", value: "-4%", risk: "Risk" }
      ],
      boardAlert: "AI: Test with a pilot group before global rollout."
    },
    {
      scenario: "Secure new sponsor (€80k/yr)",
      variable: "+€80k",
      impact: "+8% budget flexibility",
      breakdown: [
        { metric: "Budget Flexibility", value: "+8%", risk: "Opportunity" },
        { metric: "Sponsor Deliverables", value: "+3 per month", risk: "Risk" }
      ],
      boardAlert: "Board: Allocate 15% of new funds for digital initiatives."
    },
    {
      scenario: "Launch new youth camp",
      variable: "+1 camp",
      impact: "+9% new families, +€15k net",
      breakdown: [
        { metric: "New Families", value: "+9%", risk: "Opportunity" },
        { metric: "Net Revenue", value: "+€15,000", risk: "Opportunity" }
      ],
      boardAlert: "Cross-sector: Alert staffing to temporary overload risk."
    },
    {
      scenario: "Cut merch investment by 50%",
      variable: "-50% spend",
      impact: "-15% shop revenue, -7% fan engagement",
      breakdown: [
        { metric: "Shop Revenue", value: "-15%", risk: "Risk" },
        { metric: "Fan Engagement", value: "-7%", risk: "Risk" }
      ],
      boardAlert: "Monitor fan feedback for dissatisfaction signals."
    }
  ],
  governance: [
    {
      scenario: "Shorten board meeting intervals to monthly",
      variable: "Monthly",
      impact: "+12% decision speed, +2h/month workload",
      breakdown: [
        { metric: "Decision Speed", value: "+12%", risk: "Opportunity" },
        { metric: "Board Workload", value: "+2h/month", risk: "Risk" }
      ],
      boardAlert: "Add meeting recap to minimize confusion between cycles."
    },
    {
      scenario: "Update Code of Conduct",
      variable: "v3.1",
      impact: "+100% compliance, -1.5h legal review",
      breakdown: [
        { metric: "Compliance", value: "+100%", risk: "Opportunity" },
        { metric: "Legal Review", value: "-1.5h", risk: "Opportunity" }
      ],
      boardAlert: "Cross-impact: Notify all staff and coaches of new version."
    },
    {
      scenario: "Add one independent board member",
      variable: "+1 member",
      impact: "+7% objectivity, +2% meeting length",
      breakdown: [
        { metric: "Objectivity", value: "+7%", risk: "Opportunity" },
        { metric: "Meeting Length", value: "+2%", risk: "Risk" }
      ],
      boardAlert: "Ensure onboarding for new member—risk of groupthink disruption."
    },
    {
      scenario: "Delay annual audit by 2 months",
      variable: "+2 months",
      impact: "-15% transparency, +€0 saved",
      breakdown: [
        { metric: "Transparency", value: "-15%", risk: "Risk" },
        { metric: "Budget", value: "+€0", risk: "Risk" }
      ],
      boardAlert: "Risk flagged: Inform sponsors of delayed reporting."
    }
  ],
  staffing: [
    {
      scenario: "Hire experienced assistant coach",
      variable: "+1 coach",
      impact: "+6% tactical strength, -€25k salary",
      breakdown: [
        { metric: "Tactical Strength", value: "+6%", risk: "Opportunity" },
        { metric: "Salary Cost", value: "-€25,000", risk: "Risk" }
      ],
      boardAlert: "Set performance review at 6 months to ensure ROI."
    },
    {
      scenario: "Increase physio coverage to 5 days/wk",
      variable: "+2 days",
      impact: "-8% injury downtime",
      breakdown: [
        { metric: "Injury Downtime", value: "-8%", risk: "Opportunity" },
        { metric: "Budget", value: "-€5,000", risk: "Risk" }
      ],
      boardAlert: "AI: Negotiate group deal for sports clinic support."
    },
    {
      scenario: "Implement staff AI scheduling",
      variable: "AI tool",
      impact: "+14% efficiency, -3h/week admin",
      breakdown: [
        { metric: "Efficiency", value: "+14%", risk: "Opportunity" },
        { metric: "Admin Load", value: "-3h/week", risk: "Opportunity" }
      ],
      boardAlert: "Cross-sector: Alert IT for integration and privacy checks."
    },
    {
      scenario: "Freeze hiring for 6 months",
      variable: "0 hires",
      impact: "-4% morale, +€30k saved",
      breakdown: [
        { metric: "Morale", value: "-4%", risk: "Risk" },
        { metric: "Budget", value: "+€30,000", risk: "Opportunity" }
      ],
      boardAlert: "Risk: Monitor turnover and workload weekly."
    }
  ],
  community: [
    {
      scenario: "Host monthly open practice",
      variable: "12/yr",
      impact: "+15% local engagement",
      breakdown: [
        { metric: "Engagement", value: "+15%", risk: "Opportunity" }
      ],
      boardAlert: "Cross-sector: Sport ops—prepare logistics for larger crowds."
    },
    {
      scenario: "Launch club ambassador program",
      variable: "+8 ambassadors",
      impact: "+12% brand visibility",
      breakdown: [
        { metric: "Brand Visibility", value: "+12%", risk: "Opportunity" }
      ],
      boardAlert: "AI: Track social media metrics for lift."
    },
    {
      scenario: "Partner with 3 local schools",
      variable: "+3 partners",
      impact: "+18% youth pipeline",
      breakdown: [
        { metric: "Youth Pipeline", value: "+18%", risk: "Opportunity" }
      ],
      boardAlert: "Link: Staff onboarding guide for new families."
    },
    {
      scenario: "Cut annual charity drive",
      variable: "-1 event",
      impact: "-9% reputation",
      breakdown: [
        { metric: "Reputation", value: "-9%", risk: "Risk" }
      ],
      boardAlert: "Flag: Replace with digital campaign if budget cut."
    }
  ],
  digital: [
    {
      scenario: "Deploy new club app",
      variable: "Mobile app",
      impact: "+25% digital engagement, +€8k dev cost",
      breakdown: [
        { metric: "Digital Engagement", value: "+25%", risk: "Opportunity" },
        { metric: "Dev Cost", value: "+€8,000", risk: "Risk" }
      ],
      boardAlert: "AI: Bundle with ticket sales campaign."
    },
    {
      scenario: "Automate newsletter",
      variable: "AI writing",
      impact: "+50% reach, -2h/week admin",
      breakdown: [
        { metric: "Reach", value: "+50%", risk: "Opportunity" },
        { metric: "Admin", value: "-2h/week", risk: "Opportunity" }
      ],
      boardAlert: "Test: A/B old vs. new—measure click rates."
    },
    {
      scenario: "Upgrade live streaming",
      variable: "Full HD",
      impact: "+22% online views, +€5k setup",
      breakdown: [
        { metric: "Online Views", value: "+22%", risk: "Opportunity" },
        { metric: "Setup Cost", value: "+€5,000", risk: "Risk" }
      ],
      boardAlert: "Include sponsor logo overlays in stream."
    },
    {
      scenario: "Reduce social posts by 40%",
      variable: "-40% posts",
      impact: "-17% follower growth",
      breakdown: [
        { metric: "Follower Growth", value: "-17%", risk: "Risk" }
      ],
      boardAlert: "AI: Schedule fewer, but higher-impact, content releases."
    }
  ]
};

// For risk color mapping
const RISK_COLOR = {
  Opportunity: "#27ef7d",
  Risk: "#FFD700"
};

function calculateImpact(selected, variable, change) {
  if (!selected || !variable || !change) return null;
  // Advanced AI-style “interdependency” warning
  let warning = "";
  if (selected === "sport" && (variable.includes("sessions") || variable.includes("fatigue"))) {
    warning = "Sport/Staffing interdependency: Review physiotherapist coverage before confirming.";
  }
  if (selected === "business" && variable.includes("sponsor")) {
    warning = "Business/Digital interdependency: Ensure digital exposure for new sponsors.";
  }
  // Add more as needed...
  return {
    summary: "Mixed impact. AI recommends deeper scenario analysis.",
    ai: "See related modules for more detailed forecasts.",
    warning
  };
}

export default function WhatIfSimulator() {
  const [sector, setSector] = useState("sport");
  const [selectedExample, setSelectedExample] = useState(EXAMPLES["sport"][0]);
  const [customScenario, setCustomScenario] = useState("");
  const [customVariable, setCustomVariable] = useState("");
  const [customChange, setCustomChange] = useState("");
  const [impact, setImpact] = useState(null);
  const [savedSimulations, setSavedSimulations] = useState([]);
  const [showBoardMinutes, setShowBoardMinutes] = useState(false);

  // Handle simulation from cards or custom
  const runSimulation = (ex) => {
    setSelectedExample(ex);
    setCustomScenario("");
    setCustomVariable("");
    setCustomChange("");
    setImpact({ ...ex, warning: ex.boardAlert && ex.boardAlert.includes("cross") ? ex.boardAlert : "" });
  };

  // Custom scenario submit
  const runCustom = () => {
    if (!customScenario || !customVariable || !customChange) return;
    setSelectedExample(null);
    const ai = calculateImpact(sector, customVariable, customChange);
    setImpact({
      scenario: customScenario,
      variable: customVariable,
      impact: customChange,
      breakdown: [
        { metric: "Custom Effect", value: customChange, risk: "Opportunity" }
      ],
      boardAlert: ai.ai,
      warning: ai.warning
    });
  };

  // Save current simulation
  const saveCurrentSimulation = () => {
    if (!impact) return;
    setSavedSimulations([
      ...savedSimulations,
      {
        id: Date.now(),
        sector,
        scenario: selectedExample ? selectedExample.scenario : customScenario,
        variable: selectedExample ? selectedExample.variable : customVariable,
        impact: selectedExample ? selectedExample.impact : customChange,
        timestamp: new Date().toLocaleString()
      }
    ]);
  };

  // Board minutes summary generator
  const generateBoardMinutes = () => {
    if (!impact) return "";
    return (
      `---\n[Board Decision Minutes]\n` +
      `Sector: ${sector.charAt(0).toUpperCase() + sector.slice(1)}\n` +
      `Scenario: ${impact.scenario}\n` +
      `Variable: ${impact.variable}\n` +
      `Impact: ${impact.impact}\n` +
      (impact.breakdown
        ? `Breakdown:\n${impact.breakdown.map(b => `- ${b.metric}: ${b.value} [${b.risk}]`).join("\n")}\n`
        : "") +
      `AI Insight: ${impact.boardAlert}\n` +
      (impact.warning ? `Warning: ${impact.warning}\n` : "") +
      `Date: ${new Date().toLocaleString()}\n---`
    );
  };

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: 28, borderRadius: 28,
      background: "rgba(40,62,81,0.99)", boxShadow: "0 8px 36px #FFD70030"
    }}>
      <h2 style={{ color: "#FFD700", fontSize: 31, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>
        Cross-Sector What-If Simulator <FaChartBar style={{ marginBottom: -7, fontSize: 29 }} />
      </h2>
      <div style={{ color: "#FFD700cc", fontWeight: 600, marginBottom: 23 }}>
        Simulate club-level “what if” scenarios. AI identifies risks, downstream effects, board alerts, and more.
      </div>

      {/* Sector Selector */}
      <div style={{ display: "flex", gap: 13, marginBottom: 18, flexWrap: 'wrap' }}>
        {SECTORS.map(s => (
          <button
            key={s.key}
            onClick={() => {
              setSector(s.key);
              setSelectedExample(EXAMPLES[s.key][0]);
              setImpact(null);
            }}
            style={{
              background: sector === s.key ? "#FFD700" : "#222d38",
              color: sector === s.key ? "#222" : "#FFD700",
              border: "none",
              borderRadius: 8,
              padding: "10px 25px",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: sector === s.key ? "0 2px 12px #FFD70055" : "none",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: "pointer"
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Example Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(245px,1fr))",
        gap: 19, marginBottom: 22
      }}>
        {EXAMPLES[sector].map(ex => (
          <motion.div
            key={ex.scenario}
            onClick={() => runSimulation(ex)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "#232E3B",
              borderRadius: 13,
              padding: "18px 16px",
              minHeight: 99,
              cursor: "pointer",
              boxShadow: selectedExample && selectedExample.scenario === ex.scenario ? "0 2px 18px #FFD70055" : "0 2px 8px #232e3b66",
              border: selectedExample && selectedExample.scenario === ex.scenario ? "3px solid #FFD700" : "2px solid #FFD70033"
            }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#FFD700", marginBottom: 3, display: 'flex', alignItems: 'center' }}>
              <FaBolt style={{ marginRight: 6, fontSize: 19 }} />
              {ex.scenario}
            </div>
            <div style={{ color: "#27ef7d", fontWeight: 800, fontSize: 14, margin: "4px 0" }}>{ex.variable}</div>
            <div style={{ color: "#FFD700bb", fontSize: 13 }}>{ex.impact}</div>
            <div style={{ fontSize: 13, marginTop: 7, color: "#FFD700aa" }}>
              {ex.boardAlert}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom What-If */}
      <div style={{ marginTop: 15, background: "#202D36", borderRadius: 13, padding: 16 }}>
        <div style={{ fontWeight: 800, color: "#A3E635", fontSize: 17, marginBottom: 8 }}>
          <FaCogs style={{ marginRight: 7 }} />
          Or test your own scenario:
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Your scenario (e.g. Hire new data analyst)"
            value={customScenario}
            onChange={e => setCustomScenario(e.target.value)}
            style={{
              padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 210, fontSize: 15, flex: 2
            }}
          />
          <input
            placeholder="Key variable (e.g. +1 hire)"
            value={customVariable}
            onChange={e => setCustomVariable(e.target.value)}
            style={{
              padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 120, fontSize: 15, flex: 1
            }}
          />
          <input
            placeholder="Expected change/impact"
            value={customChange}
            onChange={e => setCustomChange(e.target.value)}
            style={{
              padding: "7px 11px", borderRadius: 6, border: "none", minWidth: 160, fontSize: 15, flex: 2
            }}
          />
          <button
            onClick={runCustom}
            style={{
              background: "#FFD700", color: "#222", border: "none", borderRadius: 7,
              padding: "8px 22px", fontWeight: 900, fontSize: 16, cursor: "pointer"
            }}
          >
            Simulate
          </button>
        </div>
      </div>

      {/* Impact Output */}
      {(impact || selectedExample) && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              marginTop: 28, background: "#222d38", borderRadius: 16, padding: 26, boxShadow: "0 2px 14px #FFD70024"
            }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#FFD700", marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <FaBullseye style={{ marginRight: 9 }} />
              Predicted Board-Level Impact
            </div>
            <div style={{ color: "#FFD700bb", fontSize: 15, marginBottom: 6 }}>
              {(selectedExample || impact) &&
                <>Scenario: <span style={{ fontWeight: 700, color: "#27ef7d" }}>{(selectedExample && selectedExample.scenario) || (impact && impact.scenario)}</span></>
              }
            </div>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
              {(impact && impact.summary) || (selectedExample && selectedExample.impact)}
            </div>
            {/* Impact breakdown */}
            {((impact && impact.breakdown) || (selectedExample && selectedExample.breakdown)) && (
              <div style={{ marginBottom: 10 }}>
                <table style={{ width: "100%", background: "#232E3B", borderRadius: 7, marginTop: 8 }}>
                  <thead>
                    <tr style={{ color: "#FFD700", fontWeight: 800, fontSize: 15 }}>
                      <th align="left" style={{ padding: "4px 8px" }}>Metric</th>
                      <th align="left" style={{ padding: "4px 8px" }}>Value</th>
                      <th align="left" style={{ padding: "4px 8px" }}>Risk/Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((impact && impact.breakdown) || (selectedExample && selectedExample.breakdown)).map((b, idx) =>
                      <tr key={b.metric + idx}>
                        <td style={{ padding: "4px 8px", fontWeight: 600 }}>{b.metric}</td>
                        <td style={{ padding: "4px 8px", color: "#FFD700" }}>{b.value}</td>
                        <td style={{ padding: "4px 8px", color: RISK_COLOR[b.risk] || "#aaa" }}>{b.risk}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* Board Alert */}
            {(impact && impact.boardAlert || selectedExample && selectedExample.boardAlert) && (
              <div style={{
                color: "#27ef7d", fontWeight: 700, background: "#181e23",
                borderRadius: 7, padding: "9px 14px", fontSize: 16, marginBottom: 7, marginTop: 5
              }}>
                <FaRobot style={{ marginRight: 9 }} />
                {(impact && impact.boardAlert) || (selectedExample && selectedExample.boardAlert)}
              </div>
            )}
            {/* Interdependency warning */}
            {(impact && impact.warning) && (
              <div style={{
                color: "#FFD700", fontWeight: 700, background: "#e9405716",
                borderRadius: 7, padding: "7px 13px", fontSize: 15, marginTop: 5
              }}>
                <FaExclamationTriangle style={{ marginRight: 7 }} />
                {impact.warning}
              </div>
            )}
            {/* Save/Minutes buttons */}
            <div style={{ display: "flex", gap: 9, marginTop: 10 }}>
              <button
                onClick={saveCurrentSimulation}
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 6,
                  padding: "6px 15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center"
                }}
              >
                <FaSave style={{ marginRight: 6 }} />
                Save Simulation
              </button>
              <button
                onClick={() => setShowBoardMinutes(!showBoardMinutes)}
                style={{
                  background: "#FFD700", color: "#222", border: "none", borderRadius: 6,
                  padding: "6px 15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center"
                }}
              >
                <FaListAlt style={{ marginRight: 6 }} />
                {showBoardMinutes ? "Hide Board Minutes" : "Show Board Minutes"}
              </button>
            </div>
            {/* Board Minutes */}
            {showBoardMinutes && (
              <pre style={{
                background: "#11171c", color: "#FFD700", fontWeight: 600, borderRadius: 8,
                marginTop: 14, padding: 17, fontSize: 15, whiteSpace: "pre-wrap"
              }}>
                {generateBoardMinutes()}
              </pre>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Saved Simulations */}
      {savedSimulations.length > 0 && (
        <div style={{ marginTop: 26, background: "#222d38", borderRadius: 12, padding: 17 }}>
          <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18, marginBottom: 7, display: "flex", alignItems: "center" }}>
            <FaTable style={{ marginRight: 8 }} />
            Saved Simulations
          </div>
          <table style={{ width: "100%", fontSize: 15, borderRadius: 5 }}>
            <thead>
              <tr style={{ color: "#FFD700" }}>
                <th align="left" style={{ padding: "2px 7px" }}>Time</th>
                <th align="left" style={{ padding: "2px 7px" }}>Sector</th>
                <th align="left" style={{ padding: "2px 7px" }}>Scenario</th>
                <th align="left" style={{ padding: "2px 7px" }}>Variable</th>
                <th align="left" style={{ padding: "2px 7px" }}>Impact</th>
                <th align="left" style={{ padding: "2px 7px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {savedSimulations.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: "2px 7px" }}>{s.timestamp}</td>
                  <td style={{ padding: "2px 7px" }}>{s.sector}</td>
                  <td style={{ padding: "2px 7px" }}>{s.scenario}</td>
                  <td style={{ padding: "2px 7px" }}>{s.variable}</td>
                  <td style={{ padding: "2px 7px" }}>{s.impact}</td>
                  <td>
                    <button
                      style={{ background: "none", border: "none", color: "#FFD700", cursor: "pointer" }}
                      title="Delete"
                      onClick={() => setSavedSimulations(savedSimulations.filter(x => x.id !== s.id))}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guidance */}
      <div style={{ marginTop: 24, color: "#FFD700a0", fontSize: 14, textAlign: "center" }}>
        <FaExclamationTriangle style={{ marginRight: 6 }} />
        Use this elite tool for strategic decisions: Board, Sport Director, HR, Finance, Digital, or Community. Interdependencies, risk, and opportunity are mapped for you, with ready-to-export board minutes.
      </div>
    </div>
  );
}
