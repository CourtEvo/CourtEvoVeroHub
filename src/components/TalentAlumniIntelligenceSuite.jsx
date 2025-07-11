import React, { useState } from "react";
import {
  FaUserTie, FaArrowRight, FaMedal, FaStar, FaEnvelope, FaLightbulb, FaMapMarkerAlt,
  FaCheckCircle, FaUsers, FaSortAmountDown, FaBolt, FaChartLine
} from "react-icons/fa";
import "./TalentAlumniIntelligenceSuite.css";

// --- Demo Data: extended with pipeline stages and more events ---
const pipelineStages = ["U12", "U14", "U16", "U18", "Pro", "NCAA", "Alumni"];
const pipeline = [
  {
    name: "Marko Kovač",
    startYear: 2016,
    currentStage: "Pro",
    status: "Graduated",
    exitYear: 2022,
    club: "Cibona U18",
    level: "Pro",
    timeline: [
      { year: 2016, stage: "U12", highlight: "" },
      { year: 2017, stage: "U14", highlight: "MVP U14 League" },
      { year: 2019, stage: "U16", highlight: "" },
      { year: 2022, stage: "Pro", highlight: "League Debut" }
    ]
  },
  {
    name: "Ivan Perić",
    startYear: 2018,
    currentStage: "U18",
    status: "Active",
    exitYear: null,
    club: "Cedevita",
    level: "",
    timeline: [
      { year: 2018, stage: "U14", highlight: "" },
      { year: 2022, stage: "U18", highlight: "" }
    ]
  },
  {
    name: "Luka Bašić",
    startYear: 2019,
    currentStage: "NCAA",
    status: "Graduated",
    exitYear: 2022,
    club: "NCAA College",
    level: "NCAA",
    timeline: [
      { year: 2019, stage: "U16", highlight: "" },
      { year: 2022, stage: "NCAA", highlight: "NCAA Scholarship" }
    ]
  },
  {
    name: "Petar Petrović",
    startYear: 2021,
    currentStage: "U14",
    status: "Active",
    exitYear: null,
    club: "CourtEvo U14",
    level: "",
    timeline: [
      { year: 2021, stage: "U12", highlight: "" },
      { year: 2024, stage: "U14", highlight: "" }
    ]
  }
];

const alumni = [
  {
    name: "Marko Kovač",
    yearsActive: "2016-2022",
    teams: "U12-U18",
    clubRole: "Cibona U18",
    location: "Croatia",
    email: "marko@email.com",
    mentor: true
  },
  {
    name: "Luka Bašić",
    yearsActive: "2019-2022",
    teams: "U16-U18",
    clubRole: "NCAA College",
    location: "USA",
    email: "luka@email.com",
    mentor: true
  }
];

const engagements = [
  {
    name: "Marko Kovač",
    date: "2023-12-01",
    event: "Alumni Game",
    role: "Played",
    notes: "Mentored U16 guards"
  },
  {
    name: "Luka Bašić",
    date: "2024-01-15",
    event: "Guest Talk",
    role: "Speaker",
    notes: "Presented on NCAA transition"
  },
  {
    name: "Marko Kovač",
    date: "2024-06-01",
    event: "Mentor Session",
    role: "Mentor",
    notes: "1-on-1 with U14 prospect"
  }
];

const kpis = [
  { label: "Active Alumni", value: 2, icon: <FaUsers /> },
  { label: "Mentors Engaged", value: 2, icon: <FaCheckCircle /> },
  { label: "Pro Level Alumni", value: 1, icon: <FaStar /> },
  { label: "Recent Promotions", value: 1, icon: <FaMedal /> },
  { label: "Total Events", value: 3, icon: <FaArrowRight /> }
];

// --- Utility ---
function getPipelineByStage(stage) {
  return pipeline.filter((p) => p.currentStage === stage);
}

function engagementScore(name) {
  // Demo: count + mentor boost
  const base = engagements.filter((e) => e.name === name).length;
  const mentor = alumni.find((a) => a.name === name && a.mentor) ? 1 : 0;
  return base * 2 + mentor * 3;
}

function statusColor(stage) {
  if (stage === "Pro" || stage === "NCAA") return "#FFD700";
  if (stage === "Alumni") return "#1de682";
  return "#fff";
}

// Conversion funnel demo
function calcFunnel(stage) {
  const idx = pipelineStages.indexOf(stage);
  if (idx < 1) return 0;
  const fromPrev = pipeline.filter(p => p.currentStage === pipelineStages[idx - 1]).length || 1;
  const here = pipeline.filter(p => p.currentStage === stage).length;
  return Math.round((here / fromPrev) * 100);
}

export default function TalentAlumniIntelligenceSuite() {
  const [showProfile, setShowProfile] = useState(null);
  const [alumniSort, setAlumniSort] = useState("score");

  // Alumni filter/sort
  let alumniList = alumni.map(a => ({
    ...a,
    score: engagementScore(a.name)
  }));
  if (alumniSort === "score") {
    alumniList = alumniList.sort((a, b) => b.score - a.score);
  } else if (alumniSort === "mentor") {
    alumniList = alumniList.filter(a => a.mentor);
  }

  // For AI panel
  const alumniLow = alumniList.find(a => a.score < 3);

  // Drag&Drop (demo: local state, no real move logic)
  const [dragged, setDragged] = useState(null);

  function handleDragStart(name, currStage) {
    setDragged({ name, currStage });
  }
  function handleDrop(stage) {
    if (dragged) {
      alert(
        `In live version, "${dragged.name}" would be moved to "${stage}". All stats update, timeline grows, and conversion funnel recalculates.`
      );
      setDragged(null);
    }
  }

  return (
    <div className="tai-main">
      <div className="tai-header">
        <h2>Talent & Alumni Intelligence Suite</h2>
        <div className="tai-subtitle">
          <FaUserTie style={{ marginRight: 8 }} /> Visualize, activate, and maximize your basketball talent pipeline & alumni network.
        </div>
      </div>

      {/* PIPELINE MAP – ENRICHED */}
      <div className="tai-section">
        <div className="tai-section-title">
          Talent Pipeline Swimlane
          <span style={{ fontWeight: 400, color: "#1de682", fontSize: 15, marginLeft: 16 }}>
            Drag & drop players between stages for instant status update (demo)
          </span>
        </div>
        <div className="tai-swimlane-wrap">
          {pipelineStages.map(stage => (
            <div
              className="tai-swimlane"
              key={stage}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage)}
            >
              <div className="tai-swimlane-title" style={{ color: statusColor(stage) }}>
                {stage}
              </div>
              <div className="tai-swimlane-metrics">
                <FaChartLine style={{ marginRight: 6, color: "#FFD700" }} />
                {getPipelineByStage(stage).length} / {calcFunnel(stage) || 0}% conversion
              </div>
              {getPipelineByStage(stage).map(p => (
                <div
                  className="tai-pipeline-card"
                  key={p.name}
                  draggable
                  onDragStart={() => handleDragStart(p.name, p.currentStage)}
                  style={{ borderLeft: `7px solid ${statusColor(stage)}` }}
                  onClick={() => setShowProfile(p)}
                >
                  <div className="tai-pipeline-name">
                    <FaUserTie style={{ color: "#FFD700", marginRight: 8 }} /> {p.name}
                  </div>
                  <div className="tai-pipeline-years">{p.startYear} - {p.exitYear || "Now"}</div>
                  <div className="tai-pipeline-status" style={{ color: statusColor(stage) }}>{p.status}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PROFILE MODAL – ENRICHED */}
      {showProfile && (
        <div className="tai-popup">
          <div className="tai-popup-content">
            <button className="tai-close" onClick={() => setShowProfile(null)}>×</button>
            <div className="tai-profile-title">
              <FaUserTie style={{ color: "#FFD700", marginRight: 9 }} />
              {showProfile.name}
            </div>
            <div className="tai-profile-club">{showProfile.club} ({showProfile.level || "N/A"})</div>
            <div className="tai-profile-timeline-title">Career Timeline</div>
            <ul className="tai-timeline-list">
              {showProfile.timeline.map((t, i) => (
                <li key={i}>
                  <span className="tai-timeline-year">{t.year}</span>
                  <span className="tai-timeline-stage">{t.stage}</span>
                  {t.highlight && (
                    <span className="tai-timeline-highlight">
                      <FaMedal style={{ color: "#FFD700", marginRight: 4 }} /> {t.highlight}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="tai-profile-timeline-title">Engagement Events</div>
            <ul className="tai-timeline-list">
              {engagements.filter(e => e.name === showProfile.name).map((e, i) => (
                <li key={i}>
                  <span className="tai-timeline-year">{e.date}</span>
                  <span className="tai-timeline-stage">{e.event} ({e.role})</span>
                  {e.notes && (
                    <span className="tai-timeline-highlight">
                      <FaLightbulb style={{ color: "#1de682", marginRight: 4 }} /> {e.notes}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Alumni Directory – ENRICHED */}
      <div className="tai-section">
        <div className="tai-section-title">
          Alumni Network Engine
          <span className="tai-alumni-filter">
            <FaSortAmountDown style={{ marginRight: 4 }} />
            <button onClick={() => setAlumniSort("score")}>By Engagement</button> |{" "}
            <button onClick={() => setAlumniSort("mentor")}>Mentors</button>
          </span>
        </div>
        <div className="tai-alumni-list">
          {alumniList.map((a) => (
            <div
              className="tai-alumni-card"
              key={a.name}
              style={{ borderColor: a.score >= 4 ? "#1de682" : "#FFD700" }}
            >
              <div className="tai-alumni-name">
                <FaUserTie style={{ marginRight: 7, color: a.score >= 4 ? "#1de682" : "#FFD700" }} />
                {a.name}
                {a.mentor && (
                  <span className="tai-mentor-tag">
                    <FaCheckCircle style={{ color: "#1de682", marginRight: 3 }} />
                    Mentor
                  </span>
                )}
              </div>
              <div className="tai-alumni-role">{a.clubRole}</div>
              <div className="tai-alumni-meta">
                <span><FaMapMarkerAlt style={{ marginRight: 3 }} /> {a.location}</span>
                <span><FaEnvelope style={{ marginLeft: 7, marginRight: 3 }} /> {a.email}</span>
              </div>
              <div className="tai-alumni-teams">{a.teams} ({a.yearsActive})</div>
              <div className="tai-alumni-score">Engagement: {a.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health & Funnel Microdashboard */}
      <div className="tai-section">
        <div className="tai-section-title">Pipeline Health & Conversion Funnel</div>
        <div className="tai-funnel-row">
          {pipelineStages.slice(1).map((stage, i) => (
            <div key={stage} className="tai-funnel-card">
              <span className="tai-funnel-label">{pipelineStages[i]} → {stage}</span>
              <span className="tai-funnel-val">{calcFunnel(stage) || 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Engagement Dashboard */}
      <div className="tai-section">
        <div className="tai-section-title">Pipeline Engagement Dashboard</div>
        <div className="tai-kpi-row">
          {kpis.map(k => (
            <div className="tai-kpi-card" key={k.label}>
              <div className="tai-kpi-icon">{k.icon}</div>
              <div className="tai-kpi-value">{k.value}</div>
              <div className="tai-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="tai-timeline">
          <div className="tai-timeline-title">Recent Alumni Events</div>
          <ul className="tai-timeline-list">
            {engagements.map((e, i) => (
              <li key={i}>
                <span className="tai-timeline-year">{e.date}</span>
                <span className="tai-timeline-stage">{e.event} ({e.role})</span>
                {e.notes && (
                  <span className="tai-timeline-highlight">
                    <FaLightbulb style={{ color: "#1de682", marginRight: 4 }} /> {e.notes}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Panel */}
      <div className="tai-section">
        <div className="tai-section-title">AI Next Best Action</div>
        <div className="tai-ai-panel">
          <FaBolt style={{ color: "#1de682", marginRight: 8 }} />
          <span>
            {alumniLow
              ? `Engagement for ${alumniLow.name} is cooling. Schedule a new event or assign mentoring.`
              : "All key alumni highly engaged. Keep leveraging for maximum club impact!"}
          </span>
        </div>
      </div>
    </div>
  );
}
