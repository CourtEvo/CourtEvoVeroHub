import React, { useState } from "react";
import { FaRobot, FaFlagCheckered, FaClipboardList, FaArrowRight, FaBell, FaChartBar, FaInfoCircle, FaLightbulb, FaTable, FaCopy, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SECTORS = [
  { key: "sport",      label: "Sport Operations", icon: <FaFlagCheckered color="#FFD700" /> },
  { key: "business",   label: "Business Ops",     icon: <FaChartBar color="#27ef7d" /> },
  { key: "governance", label: "Governance",       icon: <FaClipboardList color="#00B4D8" /> },
  { key: "staffing",   label: "Staffing/HR",      icon: <FaBell color="#f39c12" /> },
  { key: "community",  label: "Community",        icon: <FaInfoCircle color="#c084fc" /> },
  { key: "digital",    label: "Digital/Media",    icon: <FaLightbulb color="#A3E635" /> }
];

const ACTION_LIBRARY = {
  sport: [
    {
      situation: "High injury rates in last 30 days",
      type: "Urgent",
      aiAction: "Immediate medical review of training plans. Reduce intensity for U18/U16 squads by 15% for next two weeks.",
      rationale: "Preemptive adjustment reduces risk of season-impacting injuries. Similar clubs saw 40% drop with this protocol.",
      followUp: "Notify medical staff and adjust game rotations.",
      risk: "Critical"
    },
    {
      situation: "Below-target skill progression (U14)",
      type: "Performance",
      aiAction: "Integrate micro-skill drills 2x weekly. Deploy video analysis for targeted players.",
      rationale: "Best-practice: Adding targeted drills accelerates catch-up by 18% on average.",
      followUp: "Assign coach leads for video review, report in 10 days.",
      risk: "Moderate"
    },
    {
      situation: "Drop in training attendance",
      type: "Engagement",
      aiAction: "Survey athletes anonymously for feedback; offer open Q&A session after Friday practice.",
      rationale: "Data: Anonymous feedback increases honest reporting. Open sessions drive +7% attendance recovery.",
      followUp: "Report insights to coaching staff; adapt schedules as needed.",
      risk: "Low"
    },
    {
      situation: "Upcoming regional tournament",
      type: "Strategic",
      aiAction: "Shift focus to tactical walkthroughs, set up 2 friendly matches vs. top-5 teams.",
      rationale: "Simulation: More real-game scenarios increases win rate by 9% (per AI projections).",
      followUp: "Schedule with team managers. Monitor injury risk.",
      risk: "Opportunity"
    }
  ],
  business: [
    {
      situation: "Sponsorship renewal at risk",
      type: "Urgent",
      aiAction: "Board-level call with sponsor. Prepare retention case showing fan engagement data and new digital campaigns.",
      rationale: "Retaining major sponsors = +€80k/year. Face-to-face recovers 66% of ‘at risk’ deals.",
      followUp: "Create sponsor dashboard; assign account manager.",
      risk: "Critical"
    },
    {
      situation: "Revenue down vs. forecast",
      type: "Performance",
      aiAction: "Initiate flash sale (limited time merch offer), optimize event pricing based on dynamic demand.",
      rationale: "Flash sales lift monthly revenue by 9-12%. Dynamic pricing boosts event revenue 7%.",
      followUp: "Marketing/ops to launch within 48h; track metrics.",
      risk: "High"
    },
    {
      situation: "Surplus detected (+€20k)",
      type: "Strategic",
      aiAction: "Allocate 30% to digital upgrade (streaming), 30% to youth scholarships, 40% for reserve.",
      rationale: "Mixed allocation builds both short/long term resilience.",
      followUp: "Board to approve split; ops implement quarterly.",
      risk: "Low"
    },
    {
      situation: "New sponsor offer (crypto brand)",
      type: "Governance",
      aiAction: "Full risk/ethics review with legal team before engagement.",
      rationale: "Crypto partners carry regulatory/media risk. Legal pre-clear reduces incidents.",
      followUp: "Legal to submit recommendation within 10 days.",
      risk: "Moderate"
    }
  ],
  governance: [
    {
      situation: "Delayed board policy update",
      type: "Compliance",
      aiAction: "Set emergency session, assign board task force for rapid draft, circulate for e-sign.",
      rationale: "Rapid cycle ensures league compliance. E-sign reduces lag by 60%.",
      followUp: "Share update club-wide post-signoff.",
      risk: "Critical"
    },
    {
      situation: "New league reporting standard",
      type: "Regulatory",
      aiAction: "Appoint compliance officer, automate report creation using data pipeline.",
      rationale: "Automation cuts error by 88%, compliance cost -€2,200/year.",
      followUp: "Weekly audits for 6 weeks.",
      risk: "Moderate"
    },
    {
      situation: "Election year for board seats",
      type: "Strategic",
      aiAction: "Deploy digital nomination portal, increase candidate Q&A visibility.",
      rationale: "Openness increases member participation 22%. Reduces election disputes.",
      followUp: "Schedule Q&A sessions. Review all digital logs.",
      risk: "Low"
    },
    {
      situation: "Conflict of interest flagged",
      type: "Ethics",
      aiAction: "Board ethics panel review. Suspend affected parties from decision-making until resolved.",
      rationale: "Prompt action avoids media escalation.",
      followUp: "Report resolution in next public statement.",
      risk: "Critical"
    }
  ],
  staffing: [
    {
      situation: "Key coach resigns mid-season",
      type: "Urgent",
      aiAction: "Temporary promote senior assistant, activate hiring pipeline. Offer retention bonuses.",
      rationale: "Continuity = team stability. Data: +14% performance if disruption <3 weeks.",
      followUp: "HR to start interviews. Review after 2 weeks.",
      risk: "Critical"
    },
    {
      situation: "Excess overtime (staff)",
      type: "Performance",
      aiAction: "Redistribute workload, introduce weekly pulse check-ins. Consider temp hires.",
      rationale: "Workload rebalance cuts burnout risk in half.",
      followUp: "Monitor staff pulse survey; adjust in 1 month.",
      risk: "Moderate"
    },
    {
      situation: "Staff resistance to new tech",
      type: "Engagement",
      aiAction: "Peer training, set up open feedback sessions, reward early adopters.",
      rationale: "Peer learning smooths transition; reward accelerates adoption by 25%.",
      followUp: "Track digital KPIs weekly.",
      risk: "Low"
    },
    {
      situation: "Insufficient volunteers for event",
      type: "Ops",
      aiAction: "Send urgent call to parent group; offer incentives (free merch/priority seating).",
      rationale: "Incentives increase volunteer sign-up rates 37%.",
      followUp: "Review volunteer numbers 48h before event.",
      risk: "High"
    }
  ],
  community: [
    {
      situation: "Negative press (local paper)",
      type: "Crisis",
      aiAction: "Immediate public response with facts, invite press to club event.",
      rationale: "Proactive response recovers reputation twice as fast as ‘wait and see’.",
      followUp: "Monitor sentiment. Adjust outreach plan.",
      risk: "Critical"
    },
    {
      situation: "Drop in social media engagement",
      type: "Performance",
      aiAction: "Reboot content plan—feature behind-the-scenes, athlete stories, weekly Q&A.",
      rationale: "Story-driven content regains engagement by 16%.",
      followUp: "Track reach/engagement weekly.",
      risk: "Moderate"
    },
    {
      situation: "Fan complaints (ticketing)",
      type: "Service",
      aiAction: "Launch feedback portal. Comp tickets for next home game to affected fans.",
      rationale: "Direct feedback+comp = +9% future attendance.",
      followUp: "Survey post-game satisfaction.",
      risk: "Low"
    },
    {
      situation: "Low turnout for youth open day",
      type: "Outreach",
      aiAction: "Partner with local schools, launch influencer invite.",
      rationale: "School partnerships boost turnout by 23%. Influencer = +6%.",
      followUp: "Evaluate signups after campaign.",
      risk: "Opportunity"
    }
  ],
  digital: [
    {
      situation: "Website outage during event",
      type: "Urgent",
      aiAction: "Switch to backup hosting. Communicate via SMS/email/social instantly.",
      rationale: "Backup = <5min downtime. Multi-channel = +90% info reach.",
      followUp: "Audit infra. Add uptime monitor.",
      risk: "Critical"
    },
    {
      situation: "Outdated app UX",
      type: "Performance",
      aiAction: "User survey, map pain points, launch sprint to fix top 3.",
      rationale: "User-driven sprint = +25% app ratings in 2 months.",
      followUp: "Survey NPS after update.",
      risk: "Moderate"
    },
    {
      situation: "No livestream for away games",
      type: "Ops",
      aiAction: "Partner with streaming vendor; mobile-first setup. Pilot with next away match.",
      rationale: "Vendor = zero capex. Pilot = fast learning.",
      followUp: "Gather feedback; full rollout if positive.",
      risk: "Low"
    },
    {
      situation: "Slow content pipeline",
      type: "Engagement",
      aiAction: "Automate content calendar; train media team on batching.",
      rationale: "Automation = +13% content volume, -5h/week admin.",
      followUp: "Track weekly post count.",
      risk: "Low"
    }
  ]
};

// AI urgency signal color
const RISK_COLOR = {
  Critical: "#e94057",
  High: "#FFD700",
  Moderate: "#f39c12",
  Low: "#27ef7d",
  Opportunity: "#27ef7d"
};

export default function AINextActionEngine() {
  const [sector, setSector] = useState("sport");
  const [situation, setSituation] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [customSituation, setCustomSituation] = useState("");
  const [aiCustom, setAiCustom] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSelect = (s) => {
    setSelected(s);
    setAiCustom(null);
    setSituation("");
    setCustomSituation("");
    setHistory([
      {
        sector,
        ...s,
        timestamp: new Date().toLocaleString()
      },
      ...history
    ]);
  };

  const handleCustom = () => {
    if (!customSituation.trim()) return;
    // Demo AI response. Replace with OpenAI call if desired.
    const fakeAI = {
      situation: customSituation,
      type: "Custom",
      aiAction: "AI suggests: Assign a cross-functional task force, set short feedback loops, and track KPIs every week.",
      rationale: "AI projects 12% higher project success rate when using agile feedback loops. Cross-functional teams cut communication delays by 40%.",
      followUp: "Update board and department heads at each major milestone.",
      risk: "Moderate"
    };
    setSelected(null);
    setAiCustom(fakeAI);
    setHistory([
      {
        sector,
        ...fakeAI,
        timestamp: new Date().toLocaleString()
      },
      ...history
    ]);
  };

  const handleCopy = (action) => {
    navigator.clipboard.writeText(action);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const situations = ACTION_LIBRARY[sector];

  return (
    <div style={{
      maxWidth: 1120, margin: '0 auto', padding: 24, borderRadius: 27,
      background: "rgba(40,62,81,0.98)", boxShadow: "0 8px 34px #FFD70029"
    }}>
      <h2 style={{ color: "#FFD700", fontSize: 31, fontWeight: 900, marginBottom: 9 }}>
        <FaRobot style={{ marginBottom: -7, fontSize: 29 }} />
        AI Next Action Engine
      </h2>
      <div style={{ color: "#FFD700cc", fontWeight: 600, marginBottom: 22 }}>
        Get AI-recommended board-level next actions for any scenario in every department. History, risk, rationale, and board-ready exports built-in.
      </div>

      {/* Sector Selector */}
      <div style={{ display: "flex", gap: 13, marginBottom: 13, flexWrap: 'wrap' }}>
        {SECTORS.map(s => (
          <button
            key={s.key}
            onClick={() => {
              setSector(s.key);
              setSituation("");
              setSelected(null);
              setAiCustom(null);
            }}
            style={{
              background: sector === s.key ? "#FFD700" : "#222d38",
              color: sector === s.key ? "#222" : "#FFD700",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: sector === s.key ? "0 2px 12px #FFD70055" : "none",
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              cursor: "pointer"
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Preset Situations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 19 }}>
        <div style={{ fontWeight: 800, color: "#27ef7d", fontSize: 17, marginBottom: 3 }}>
          Board/ops situation (AI auto-action on click):
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))",
          gap: 12
        }}>
          {situations.map((s, idx) => (
            <motion.div
              key={s.situation + idx}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              style={{
                background: "#232E3B",
                borderRadius: 10,
                padding: "13px 13px",
                minHeight: 90,
                cursor: "pointer",
                boxShadow: selected && selected.situation === s.situation ? "0 2px 15px #FFD70055" : "0 1px 7px #232e3b66",
                border: selected && selected.situation === s.situation ? "3px solid #FFD700" : "2px solid #FFD70033",
                transition: "border .13s"
              }}
              onClick={() => handleSelect(s)}
            >
              <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 16, marginBottom: 2 }}>{s.situation}</div>
              <div style={{ color: "#FFD700bb", fontSize: 14, fontWeight: 700, marginBottom: 1 }}>
                Type: <span style={{ color: "#27ef7d" }}>{s.type}</span>
              </div>
              <div style={{
                fontWeight: 800,
                color: RISK_COLOR[s.risk] || "#aaa",
                fontSize: 13
              }}>
                Risk Level: {s.risk}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom Situation */}
      <div style={{ marginTop: 11, background: "#202D36", borderRadius: 11, padding: 14 }}>
        <div style={{ fontWeight: 800, color: "#A3E635", fontSize: 17, marginBottom: 7 }}>
          Or type a custom board/ops scenario:
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <input
            placeholder="e.g. Major data breach, new investor proposal"
            value={customSituation}
            onChange={e => setCustomSituation(e.target.value)}
            style={{
              padding: "8px 12px", borderRadius: 6, border: "none", minWidth: 180, fontSize: 15, flex: 3
            }}
          />
          <button
            onClick={handleCustom}
            style={{
              background: "#FFD700", color: "#222", border: "none", borderRadius: 7,
              padding: "8px 23px", fontWeight: 900, fontSize: 16, cursor: "pointer"
            }}
          >
            AI Action
          </button>
        </div>
      </div>

      {/* Output Card */}
      <AnimatePresence>
        {(selected || aiCustom) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              marginTop: 25, background: "#222d38", borderRadius: 16, padding: 27, boxShadow: "0 2px 13px #FFD70029"
            }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#FFD700", marginBottom: 7, display: "flex", alignItems: "center" }}>
              <FaRobot style={{ marginRight: 7 }} /> AI Board Action Recommendation
            </div>
            <div style={{ fontSize: 15, marginBottom: 4 }}>
              <b>Situation:</b> {(selected && selected.situation) || (aiCustom && aiCustom.situation)}
            </div>
            <div style={{ color: "#27ef7d", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>
              <FaArrowRight style={{ marginRight: 4, marginBottom: -2 }} />
              {((selected && selected.aiAction) || (aiCustom && aiCustom.aiAction))}
              <button
                onClick={() => handleCopy((selected?.aiAction || aiCustom?.aiAction))}
                style={{
                  marginLeft: 10, background: "#FFD70022", color: "#FFD700", border: "none",
                  borderRadius: 4, padding: "2px 9px", fontWeight: 700, cursor: "pointer", fontSize: 15
                }}
              >
                <FaCopy style={{ marginRight: 2, fontSize: 13 }} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ color: "#FFD700bb", fontSize: 14, marginBottom: 4 }}>
              <b>Rationale:</b> {(selected && selected.rationale) || (aiCustom && aiCustom.rationale)}
            </div>
            <div style={{ color: "#A3E635", fontWeight: 700, fontSize: 14 }}>
              <b>Follow-up:</b> {(selected && selected.followUp) || (aiCustom && aiCustom.followUp)}
            </div>
            <div style={{
              marginTop: 9, color: RISK_COLOR[(selected && selected.risk) || (aiCustom && aiCustom.risk)],
              fontWeight: 800, fontSize: 15
            }}>
              Risk/Urgency: {(selected && selected.risk) || (aiCustom && aiCustom.risk)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action History */}
      {history.length > 0 && (
        <div style={{ marginTop: 24, background: "#181e23", borderRadius: 13, padding: 17 }}>
          <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18, marginBottom: 6, display: "flex", alignItems: "center" }}>
            <FaTable style={{ marginRight: 8 }} />
            AI-Recommended Board/Action History
          </div>
          <table style={{ width: "100%", fontSize: 14, borderRadius: 5 }}>
            <thead>
              <tr style={{ color: "#FFD700" }}>
                <th align="left" style={{ padding: "2px 7px" }}>Time</th>
                <th align="left" style={{ padding: "2px 7px" }}>Sector</th>
                <th align="left" style={{ padding: "2px 7px" }}>Situation</th>
                <th align="left" style={{ padding: "2px 7px" }}>AI Action</th>
                <th align="left" style={{ padding: "2px 7px" }}>Risk</th>
                <th align="left" style={{ padding: "2px 7px" }}>Export</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={h.timestamp + idx}>
                  <td style={{ padding: "2px 7px" }}>{h.timestamp}</td>
                  <td style={{ padding: "2px 7px" }}>{h.sector}</td>
                  <td style={{ padding: "2px 7px" }}>{h.situation}</td>
                  <td style={{ padding: "2px 7px" }}>{h.aiAction}</td>
                  <td style={{ padding: "2px 7px", color: RISK_COLOR[h.risk] || "#FFD700" }}>{h.risk}</td>
                  <td>
                    <button
                      onClick={() => handleCopy(h.aiAction)}
                      style={{ background: "none", border: "none", color: "#FFD700", cursor: "pointer" }}
                      title="Copy to clipboard"
                    >
                      <FaCopy />
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
        <FaExclamationTriangle style={{ marginRight: 7 }} />
        This engine is designed for elite clubs/boards: AI recommendations are rationale-backed, board-action-ready, and built for instant export or board minutes.
      </div>
    </div>
  );
}
