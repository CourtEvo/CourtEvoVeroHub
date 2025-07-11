import React, { useState } from "react";
import { FaStar, FaCheckCircle, FaExternalLinkAlt, FaTimes, FaLightbulb, FaUserTie, FaFlag, FaCalendarAlt, FaChartBar, FaUserShield, FaChevronDown, FaChevronUp } from "react-icons/fa";

// --- Example “AI” next best actions, brand palette, extra details ---
const NEXT_BEST = [
  {
    title: "Approve Overdue Policy",
    desc: "Medical Records Upload Policy overdue. Board approval required.",
    jump: "#",
    type: "compliance",
    area: "Compliance",
    urgency: "high",
    insight: "Prompt approval prevents legal bottlenecks during the competitive season."
  },
  {
    title: "Budget Amendment Vote",
    desc: "Board vote on Budget Amendment in 7 days. Ensure all board members are prepared.",
    jump: "#",
    type: "finance",
    area: "Finance",
    urgency: "medium",
    insight: "Board split predicted—distribute agenda and financial summary before Friday."
  },
  {
    title: "Assign Volunteer to Full-Time",
    desc: "Volunteer Juric is eligible for full-time. Board assignment recommended.",
    jump: "#",
    type: "hr",
    area: "Staffing",
    urgency: "medium",
    insight: "Fast-track decision could resolve two open youth team roles."
  },
  {
    title: "Q3 Board Meeting Prep",
    desc: "Q3 Board Meeting: finalize board pack, clarify open actions.",
    jump: "#",
    type: "meeting",
    area: "Governance",
    urgency: "low",
    insight: "Early agenda sharing increases meeting engagement by 27% (per last two cycles)."
  },
  {
    title: "Review Coach CPD",
    desc: "Coach CPD log incomplete (4 coaches). Remind before compliance deadline.",
    jump: "#",
    type: "coaching",
    area: "Coaching",
    urgency: "medium",
    insight: "Clubs with >90% CPD see 16% more player retention."
  }
];

const STATUS_COLORS = {
  high: "#FFD700",      // Gold (for “urgent”)
  medium: "#1de682",    // Emerald (for “action needed”)
  low: "#7fa1ff"        // Soft blue (for “FYI”)
};
const ICONS = {
  compliance: <FaUserShield />,
  finance: <FaChartBar />,
  hr: <FaUserTie />,
  meeting: <FaCalendarAlt />,
  coaching: <FaFlag />
};

const MINI_TIMELINE = [
  { date: "2024-07-06", summary: "New CPD deadline posted" },
  { date: "2024-07-05", summary: "Budget amendment draft sent" },
  { date: "2024-07-04", summary: "Medical policy flagged as overdue" }
];

const INSPIRATION_QUOTES = [
  "Great boards are built on preparation, candor, and action.",
  "Success is when preparation meets opportunity. — Seneca",
  "Board discipline is the competitive edge in modern sport.",
  "You can't manage what you can't measure—especially in governance.",
  "Elite performance is just the right action at the right moment."
];

export default function AINextBestActionPopover() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(Array(NEXT_BEST.length).fill(false));
  const [filter, setFilter] = useState("");
  const [expand, setExpand] = useState(Array(NEXT_BEST.length).fill(false));
  const [showTimeline, setShowTimeline] = useState(false);
  const quote = INSPIRATION_QUOTES[Math.floor((new Date().getMinutes() + new Date().getDate()) % INSPIRATION_QUOTES.length)];

  // Mini-diagnostic: pulse color (no “red”)
  const pulse =
    NEXT_BEST.some((a, i) => a.urgency === "high" && !done[i])
      ? "gold"
      : NEXT_BEST.some((a, i) => a.urgency === "medium" && !done[i])
        ? "emerald"
        : "blue";

  const pulseMsg =
    pulse === "gold"
      ? "PRIORITY: Board action required"
      : pulse === "emerald"
        ? "Follow-up recommended"
        : "No urgent board tasks";

  // Area filter (unique list)
  const AREAS = Array.from(new Set(NEXT_BEST.map(a => a.area)));

  // Filtered list
  const filteredBest = NEXT_BEST.filter(
    (a, i) =>
      (!filter || a.area === filter) && !done[i]
  );

  // Popover positioning: always visible (max bottom/right)
  // For demo: fixed 35px from bottom, 40px from right, max height 85vh, scrollable
  return (
    <>
      {/* --- Floating Widget: Star badge, never covers popover --- */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed",
          bottom: 35,
          right: 40,
          zIndex: 200,
          background: "#232a2e",
          color: "#FFD700",
          border: "2.5px solid #FFD700",
          borderRadius: 24,
          boxShadow: "0 3px 28px #232a2e88",
          padding: "13px 28px",
          fontWeight: 900,
          fontSize: 21,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          transition: "background 0.18s"
        }}
        title="AI Concierge: Next Boardroom Action"
      >
        <FaStar style={{ marginRight: 13, fontSize: 27, color: "#FFD700" }} />
        AI Concierge
        <span style={{ marginLeft: 14, fontSize: 16, fontWeight: 800 }}>
          ●
        </span>
      </div>
      {open && (
        <div style={{
          position: "fixed",
          bottom: 100,
          right: 40,
          zIndex: 201,
          background: "#232a2e",
          color: "#FFD700",
          border: "2.5px solid #FFD700",
          borderRadius: 22,
          boxShadow: "0 6px 32px #232a2e99",
          minWidth: 400,
          maxWidth: 440,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "34px 28px 18px 28px",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            fontSize: 24,
            fontWeight: 900,
            marginBottom: 10
          }}>
            <FaStar style={{ color: "#FFD700", fontSize: 28, marginRight: 4 }} />
            Boardroom Concierge
            <button onClick={() => setOpen(false)} style={{
              background: "transparent",
              color: "#FFD700",
              border: "none",
              fontSize: 24,
              marginLeft: "auto",
              cursor: "pointer"
            }}><FaTimes /></button>
          </div>
          {/* Board Pulse */}
          <div style={{
            background: pulse === "gold" ? "#FFD700" : pulse === "emerald" ? "#1de682" : "#7fa1ff",
            color: "#232a2e",
            borderRadius: 11,
            padding: "9px 14px",
            fontWeight: 900,
            fontSize: 15,
            marginBottom: 12,
            letterSpacing: 0.4
          }}>
            {pulseMsg}
          </div>
          {/* Mini-diagnostic/Quote */}
          <div style={{
            background: "#181e23",
            borderRadius: 9,
            fontStyle: "italic",
            padding: "7px 14px",
            color: "#FFD700bb",
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 10
          }}>
            {quote}
          </div>
          {/* Area Filter */}
          <div style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ color: "#FFD700", fontWeight: 800, marginRight: 6 }}>Filter:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{
              background: "#fff",
              color: "#232a2e",
              border: "1.5px solid #FFD700",
              borderRadius: 7,
              fontWeight: 700,
              fontSize: 14,
              padding: "5px 8px"
            }}>
              <option value="">All Areas</option>
              {AREAS.map(area => <option key={area}>{area}</option>)}
            </select>
            <button onClick={() => setShowTimeline(t => !t)} style={{
              background: "#FFD700",
              color: "#232a2e",
              border: "none",
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 13,
              padding: "5px 14px",
              marginLeft: 10,
              cursor: "pointer"
            }}>
              {showTimeline ? <><FaChevronUp /> Hide Timeline</> : <><FaChevronDown /> Show Timeline</>}
            </button>
          </div>
          {/* Mini Timeline */}
          {showTimeline && (
            <div style={{
              background: "#181e23",
              borderRadius: 9,
              padding: "7px 12px",
              fontSize: 14,
              marginBottom: 12,
              color: "#1de682"
            }}>
              <b>Recent Boardroom Events:</b>
              <ul style={{ margin: 0, padding: "7px 0 0 17px" }}>
                {MINI_TIMELINE.map((t, idx) => (
                  <li key={idx}>{t.date}: {t.summary}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Recommendations List */}
          <div>
            {filteredBest.length === 0 && (
              <div style={{
                background: "#181e23", color: "#FFD700", fontWeight: 700,
                borderRadius: 9, padding: "14px 0", textAlign: "center"
              }}>
                All board priorities resolved. No outstanding actions!
              </div>
            )}
            {filteredBest.map((item, idx) => (
              <div key={idx} style={{
                background: STATUS_COLORS[item.urgency] + "33",
                color: "#FFD700",
                borderRadius: 12,
                marginBottom: 13,
                padding: "14px 12px 12px 13px",
                boxShadow: "0 1px 12px #FFD70010"
              }}>
                <div style={{
                  fontWeight: 800, fontSize: 18, marginBottom: 2,
                  color: STATUS_COLORS[item.urgency]
                }}>
                  {ICONS[item.type]} {item.title}
                </div>
                <div style={{ fontSize: 15, marginBottom: 7, color: "#FFD700" }}>
                  {item.desc}
                </div>
                <div style={{
                  fontSize: 13, marginBottom: 7, color: "#1de682", fontStyle: "italic", cursor: "pointer"
                }}
                  title="Show boardroom insight"
                  onClick={() => setExpand(arr => arr.map((v, i) => i === idx ? !v : v))}
                >
                  <FaLightbulb style={{ marginRight: 4, fontSize: 14, verticalAlign: -2 }} />
                  AI Insight
                  {expand[idx] ? <FaChevronUp style={{ marginLeft: 3 }} /> : <FaChevronDown style={{ marginLeft: 3 }} />}
                </div>
                {expand[idx] && (
                  <div style={{
                    background: "#232a2e",
                    color: "#FFD700cc",
                    borderRadius: 9,
                    padding: "8px 13px",
                    fontSize: 13,
                    marginBottom: 4,
                    boxShadow: "0 1px 7px #FFD70010"
                  }}>
                    {item.insight}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <a href={item.jump} style={{
                    background: "#1de682",
                    color: "#232a2e",
                    fontWeight: 900,
                    borderRadius: 8,
                    padding: "6px 15px",
                    textDecoration: "none",
                    fontSize: 15
                  }}>
                    <FaExternalLinkAlt style={{ marginRight: 5 }} /> Jump to module
                  </a>
                  <button
                    style={{
                      background: done[idx] ? "#7fa1ff" : "#FFD700",
                      color: "#232a2e",
                      borderRadius: 8,
                      padding: "6px 15px",
                      fontWeight: 900,
                      fontSize: 15,
                      border: "none",
                      cursor: "pointer"
                    }}
                    onClick={() => setDone(arr => arr.map((v, i) => i === idx ? true : v))}
                    disabled={done[idx]}
                  >
                    {done[idx] ? <><FaCheckCircle style={{ marginRight: 4 }} />Done</> : "Mark as Done"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 15,
            fontSize: 13,
            color: "#FFD700bb"
          }}>
            <FaLightbulb style={{ marginRight: 7, verticalAlign: -2 }} />
            <b>Tip:</b> “Next Best Actions” are real-time, board-validated and tuned for CourtEvo Vero consulting value.
          </div>
        </div>
      )}
    </>
  );
}
