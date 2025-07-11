// src/components/FamilyCommunityPulse.jsx

import React, { useState } from "react";
import {
  FaUsers,
  FaStar,
  FaHeart,
  FaExclamationTriangle,
  FaUserCheck,
  FaHandsHelping,
  FaDownload,
  FaShareAlt,
  FaChartLine,
  FaClipboardCheck,
  FaTable,
  FaCheckCircle,
  FaBullhorn,
  FaLightbulb,
  FaTrophy,
  FaCalendarAlt,
} from "react-icons/fa";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

// Mock Data: MALE ONLY
const engagementData = [
  {
    athlete: "Ivan Markovic",
    squad: "U10 Boys",
    family: "Markovic",
    attendance: 93,
    volunteering: 2,
    survey: 4.7,
    recommend: [9, 9, 10, 9, 10], // 0-10 scale, trend
    events: ["Game vs Split", "Open House", "Family BBQ"],
    pulse: [4.3, 4.1, 4.6, 4.7, 4.4],
    risk: false,
  },
  {
    athlete: "Marko Vukovic",
    squad: "U12 Boys",
    family: "Vukovic",
    attendance: 71,
    volunteering: 0,
    survey: 3.2,
    recommend: [6, 7, 6, 6, 6],
    events: ["Game vs Zadar", "Family BBQ"],
    pulse: [3.7, 3.3, 3.1, 3.2, 3.0],
    risk: true,
  },
  {
    athlete: "Dino Ilic",
    squad: "U14 Boys",
    family: "Ilic",
    attendance: 84,
    volunteering: 1,
    survey: 4.1,
    recommend: [8, 8, 7, 8, 8],
    events: ["Game vs Cedevita", "Open House"],
    pulse: [4.0, 4.1, 4.2, 4.1, 4.1],
    risk: false,
  },
  {
    athlete: "Luka Juric",
    squad: "U12 Boys",
    family: "Juric",
    attendance: 56,
    volunteering: 0,
    survey: 2.8,
    recommend: [4, 5, 4, 4, 5],
    events: ["Game vs Zadar"],
    pulse: [3.0, 2.9, 2.7, 2.8, 2.8],
    risk: true,
  },
  // ...add more
];

// All squads for heatmap (male only)
const squads = [...new Set(engagementData.map((d) => d.squad))];

// Demo events calendar (last 2 months, for heatmap)
const eventsList = [
  "Game vs Split",
  "Game vs Zadar",
  "Game vs Cedevita",
  "Open House",
  "Family BBQ",
  "Parent Meeting",
];

const boardRoles = [
  "President",
  "Community Manager",
  "Parent Liaison",
  "Squad Lead",
  "Board Member",
];

// Action log storage
const defaultActionLog = {};

export default function FamilyCommunityPulse() {
  const [selected, setSelected] = useState(engagementData[0]);
  const [assignments, setAssignments] = useState({});
  const [squadFilter, setSquadFilter] = useState(""); // for heatmap click
  const [actionLog, setActionLog] = useState(defaultActionLog);

  // Leaderboard: weighted by attendance+volunteering+survey+recommend
  const leaderboard = [...engagementData]
    .filter((d) => !squadFilter || d.squad === squadFilter)
    .sort(
      (a, b) =>
        b.attendance +
        b.volunteering * 10 +
        b.survey * 12 +
        avgArr(b.recommend) * 7 -
        (a.attendance + a.volunteering * 10 + a.survey * 12 + avgArr(a.recommend) * 7)
    );

  // At risk: survey<3.5 or risk=true or recommend<7
  const atRiskFamilies = engagementData.filter(
    (f) => f.risk || f.survey < 3.5 || avgArr(f.recommend) < 7
  );

  // Event attendance by family/event for heatmap
  const eventHeatmap = eventsList.map((evt) => ({
    event: evt,
    families: engagementData
      .filter((d) => d.events.includes(evt))
      .map((d) => d.family),
  }));

  // Squad engagement heatmap: avg score per squad
  function squadEngagementScore(sq) {
    const squadFamilies = engagementData.filter((f) => f.squad === sq);
    if (!squadFamilies.length) return 0;
    return (
      squadFamilies.reduce(
        (acc, d) =>
          acc +
          (d.attendance + d.volunteering * 10 + d.survey * 10 + avgArr(d.recommend) * 5) /
            4,
        0
      ) / squadFamilies.length
    );
  }

  // Avg engagement for club
  const avgEngagement =
    leaderboard.reduce(
      (acc, d) =>
        acc +
        (d.attendance + d.volunteering * 10 + d.survey * 10 + avgArr(d.recommend) * 5) /
          4,
      0
    ) / leaderboard.length;

  // Sponsor “Gold Standard” threshold: all engagement >85
  const goldStandard =
    leaderboard.every(
      (d) =>
        d.attendance > 85 && d.survey > 4.0 && avgArr(d.recommend) > 8
    );

  // Boardroom alerts
  const alerts = [
    {
      type: "at-risk",
      label: "At-Risk Families",
      count: atRiskFamilies.length,
      icon: <FaExclamationTriangle color="#ff6b6b" />,
      color: "#ff6b6b",
    },
    {
      type: "squad",
      label: "Low Engagement Squads",
      count: squads.filter((sq) => squadEngagementScore(sq) < 70).length,
      icon: <FaTable color="#FFD700" />,
      color: "#FFD700",
    },
    {
      type: "volunteer",
      label: "No Volunteering Families",
      count: engagementData.filter((f) => f.volunteering === 0).length,
      icon: <FaHandsHelping color="#1de682" />,
      color: "#1de682",
    },
  ];

  // Action assign
  function assignAction(family, action) {
    const now = new Date();
    setActionLog((log) => ({
      ...log,
      [family]:
        (log[family] || []).concat([
          {
            action,
            assignedTo: assignments[family] || "-",
            date: now.toISOString().split("T")[0],
            status: "Pending",
          },
        ]),
    }));
  }

  // “Next best action” for at-risk (AI panel)
  function nextBestAction(fam) {
    if (fam.volunteering === 0) return "Invite to club volunteering initiative";
    if (fam.attendance < 70) return "Personal invite to next event";
    if (fam.survey < 3.5) return "Community manager check-in call";
    if (avgArr(fam.recommend) < 7) return "Offer parent feedback meeting";
    return "Send club thank-you message";
  }

  // Utility
  function avgArr(arr) {
    if (!arr.length) return 0;
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  }

  // Filtered leaderboard for squad
  const leaderboardSquad =
    squadFilter === ""
      ? leaderboard
      : leaderboard.filter((d) => d.squad === squadFilter);

  return (
    <div
      style={{
        background: "#232a2e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        borderRadius: "24px",
        padding: "38px 28px 18px 28px",
        boxShadow: "0 6px 32px 0 #1a1d20",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaUsers size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 1,
              marginBottom: 4,
              color: "#FFD700",
            }}
          >
            FAMILY & COMMUNITY ENGAGEMENT PULSE
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Quantitative, boardroom-grade loyalty and risk management for male athletes’ families.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            marginRight: 10,
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={() => window.print()}
        >
          <FaDownload style={{ marginRight: 7 }} />
          Export Board Deck
        </button>
        <button
          style={{
            background: "#1de682",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
        >
          <FaShareAlt style={{ marginRight: 7 }} />
          Share Report
        </button>
      </div>

      {/* Sponsor Report Card */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 10 }}>
        <div style={{
          background: "#FFD700",
          color: "#232a2e",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 170,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaStar style={{ marginRight: 7 }} />
          Engaged Families: {Math.round((leaderboard.filter(f => f.attendance > 85).length / leaderboard.length) * 100)}%
        </div>
        <div style={{
          background: "#1de682",
          color: "#232a2e",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 170,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaCalendarAlt style={{ marginRight: 7 }} />
          Avg Event Attendance: {Math.round(leaderboard.reduce((acc, d) => acc + d.attendance, 0) / leaderboard.length)}%
        </div>
        <div style={{
          background: "#283E51",
          color: "#FFD700",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 170,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaHeart style={{ marginRight: 7 }} />
          Avg Recommend: {(leaderboard.reduce((acc, d) => acc + Number(avgArr(d.recommend)), 0) / leaderboard.length).toFixed(1)}
        </div>
        {goldStandard && (
          <div style={{
            background: "#FFD700",
            color: "#232a2e",
            fontWeight: 800,
            borderRadius: 14,
            padding: "13px 26px",
            fontSize: 18,
            marginLeft: 14,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 18px 0 #FFD70077"
          }}>
            <FaTrophy style={{ marginRight: 11, fontSize: 22 }} />
            Gold Standard Community
          </div>
        )}
      </div>

      {/* Boardroom Pulse Alerts */}
      <div style={{ display: "flex", gap: 18, marginBottom: 10 }}>
        {alerts.map(a => (
          <div
            key={a.type}
            style={{
              background: a.color,
              color: a.color === "#FFD700" ? "#232a2e" : "#fff",
              fontWeight: 700,
              borderRadius: 12,
              padding: "10px 18px",
              minWidth: 135,
              textAlign: "center",
              cursor: "pointer",
              opacity: a.count === 0 ? 0.4 : 1,
              boxShadow: "0 2px 10px 0 #1a1d2060"
            }}
            onClick={() => {
              if (a.type === "at-risk") setSquadFilter("");
              if (a.type === "squad") setSquadFilter(""); // could filter leaderboard for low-engagement squads
              if (a.type === "volunteer") setSquadFilter(""); // could filter for no-volunteering
            }}
          >
            {a.icon} {a.label}: {a.count}
          </div>
        ))}
      </div>

      {/* Engagement Heatmap (by squad, color-coded) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 5, fontSize: 16 }}>Squad Engagement Heatmap</div>
        <div style={{ display: "flex", gap: 16 }}>
          {squads.map((sq) => {
            const score = squadEngagementScore(sq);
            let color = "#ff6b6b";
            if (score >= 85) color = "#FFD700";
            else if (score >= 70) color = "#1de682";
            return (
              <div
                key={sq}
                style={{
                  background: color,
                  color: color === "#FFD700" ? "#232a2e" : "#fff",
                  fontWeight: 700,
                  padding: "12px 22px",
                  borderRadius: 10,
                  minWidth: 120,
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px 0 #232a2e60"
                }}
                onClick={() => setSquadFilter(sqFilter => sqFilter === sq ? "" : sq)}
                title="Click to filter"
              >
                {sq}
                <div style={{ fontWeight: 800, fontSize: 20, marginTop: 3 }}>{Math.round(score)}</div>
              </div>
            );
          })}
        </div>
        {squadFilter && (
          <div style={{ color: "#FFD700", marginTop: 7, fontWeight: 700 }}>
            <FaBullhorn style={{ marginRight: 6 }} /> Filtering for {squadFilter}
          </div>
        )}
      </div>

      {/* Event Attendance Heatmap */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 5, fontSize: 16 }}>
          Event Attendance Heatmap
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          {eventHeatmap.map(e => (
            <div
              key={e.event}
              style={{
                background: e.families.length > 2 ? "#FFD700" : e.families.length === 2 ? "#1de682" : "#ff6b6b",
                color: e.families.length > 1 ? "#232a2e" : "#fff",
                borderRadius: 8,
                fontWeight: 700,
                padding: "7px 13px",
                minWidth: 90,
                textAlign: "center",
              }}
              title={e.families.join(", ") || "No families"}
            >
              {e.event}
              <div style={{ fontWeight: 800, fontSize: 16 }}>{e.families.length}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {/* Left: Family/athlete card + recommend score/trend */}
        <div
          style={{
            background: "#283E51",
            borderRadius: 24,
            padding: 22,
            minWidth: 330,
            maxWidth: 380,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 19, marginBottom: 8 }}>
            {selected.athlete} • {selected.squad}
          </div>
          <div style={{ color: "#1de682", fontWeight: 600, marginBottom: 8 }}>
            Family: {selected.family}
          </div>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 3 }}>Engagement Scores</div>
          <div style={{ fontSize: 15, marginBottom: 7 }}>
            <FaStar color="#FFD700" /> Attendance: <b>{selected.attendance}%</b>
            <br />
            <FaHandsHelping color="#1de682" /> Volunteering: <b>{selected.volunteering} events</b>
            <br />
            <FaHeart color="#ff6b6b" /> Survey: <b>{selected.survey.toFixed(1)}/5</b>
          </div>
          <div style={{ marginTop: 5, fontWeight: 700, color: "#FFD700" }}>Recommend Score</div>
          <ResponsiveContainer width="100%" height={45}>
            <LineChart data={selected.recommend.map((y, i) => ({ x: i + 1, y }))}>
              <Line type="monotone" dataKey="y" stroke="#FFD700" strokeWidth={2} dot={true} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontWeight: 700, color: "#FFD700" }}>
            Current: <span style={{ color: "#1de682" }}>{avgArr(selected.recommend)}</span> / 10
          </div>
          <div style={{ marginTop: 4, color: "#FFD700", fontWeight: 700 }}>Pulse Trend</div>
          <ResponsiveContainer width="100%" height={45}>
            <LineChart data={selected.pulse.map((y, i) => ({ x: i + 1, y }))}>
              <Line type="monotone" dataKey="y" stroke="#FFD700" strokeWidth={2} dot={true} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
          {selected.risk || selected.survey < 3.5 || avgArr(selected.recommend) < 7 ? (
            <div style={{ background: "#ff6b6b", color: "#fff", fontWeight: 700, borderRadius: 8, padding: "7px 11px", marginTop: 10, display: "flex", alignItems: "center" }}>
              <FaExclamationTriangle style={{ marginRight: 8 }} />
              ALERT: Engagement at Risk
            </div>
          ) : (
            <div style={{ background: "#1de682", color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: "7px 11px", marginTop: 10, display: "flex", alignItems: "center" }}>
              <FaUserCheck style={{ marginRight: 8 }} />
              Healthy: Highly Engaged
            </div>
          )}

          {/* Recent events attended */}
          <div style={{ marginTop: 15 }}>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>Events Attended:</span>
            <ul style={{ fontSize: 15, margin: "6px 0 0 12px", color: "#fff" }}>
              {selected.events.map(ev => (
                <li key={ev}>{ev}</li>
              ))}
            </ul>
          </div>

          {/* Assign action & action log */}
          <div style={{ marginTop: 18, fontWeight: 700, color: "#FFD700" }}>Assign Action:</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={assignments[selected.family] || ""}
              onChange={e => setAssignments(a => ({ ...a, [selected.family]: e.target.value }))}
              style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginTop: 6 }}
            >
              <option value="">Assign...</option>
              {boardRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              style={{
                background: "#FFD700",
                color: "#232a2e",
                borderRadius: 7,
                padding: "7px 12px",
                fontWeight: 700,
                border: "none",
                marginTop: 6,
                cursor: "pointer",
              }}
              onClick={() => assignAction(selected.family, nextBestAction(selected))}
            >
              <FaClipboardCheck style={{ marginRight: 6 }} />
              Log Action
            </button>
          </div>
          {/* Action log table */}
          {actionLog[selected.family] && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, color: "#FFD700" }}>Action Log</div>
              <table style={{ width: "100%", fontSize: 14, color: "#fff", marginTop: 4 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Action</th>
                    <th>Assigned</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {actionLog[selected.family].map((a, i) => (
                    <tr key={i}>
                      <td>{a.action}</td>
                      <td>{a.assignedTo}</td>
                      <td>{a.status}</td>
                      <td>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Middle: Leaderboard (filtered by squad if selected) */}
        <div
          style={{
            background: "#1a1d20",
            borderRadius: 22,
            minWidth: 340,
            maxWidth: 420,
            padding: 30,
            boxShadow: "0 2px 12px 0 #121416",
          }}
        >
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18, marginBottom: 11, textAlign: "center" }}>
            Family Engagement Leaderboard
            {squadFilter && (
              <span style={{ fontSize: 14, color: "#1de682", marginLeft: 10 }}>
                ({squadFilter} only)
              </span>
            )}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 14, fontFamily: "Segoe UI", marginBottom: 5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #485563" }}>
                <th style={{ textAlign: "left", padding: 4 }}>Athlete</th>
                <th>Squad</th>
                <th>Attendance</th>
                <th>Volunteer</th>
                <th>Survey</th>
                <th>Recommend</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leaderboardSquad.map((f) => (
                <tr key={f.athlete} style={{ borderBottom: "1px solid #283E51", background: selected.athlete === f.athlete ? "#232a2e" : "none" }}>
                  <td style={{ color: "#FFD700", fontWeight: 600 }}>{f.athlete}</td>
                  <td style={{ color: "#1de682", textAlign: "center" }}>{f.squad}</td>
                  <td style={{ textAlign: "center" }}>{f.attendance}%</td>
                  <td style={{ textAlign: "center" }}>{f.volunteering}</td>
                  <td style={{ textAlign: "center" }}>{f.survey.toFixed(1)}</td>
                  <td style={{ textAlign: "center" }}>{avgArr(f.recommend)}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FFD700",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelected(f)}
                      title="View"
                    >
                      <FaClipboardCheck />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: At-Risk Families & Next Best Actions */}
        <div
          style={{
            background: "#232a2e",
            borderRadius: 18,
            padding: "18px 10px 8px 10px",
            minWidth: 270,
            maxWidth: 350,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 9,
              textAlign: "center",
            }}
          >
            At-Risk Families (Boys)
          </div>
          <ul style={{ color: "#fff", fontWeight: 600, fontSize: 15, paddingLeft: 14, minHeight: 55 }}>
            {atRiskFamilies.length === 0 && <li>None this period</li>}
            {atRiskFamilies.map((f) => (
              <li key={f.athlete} style={{ marginBottom: 9 }}>
                <FaExclamationTriangle color="#ff6b6b" style={{ marginRight: 8 }} />
                {f.family} ({f.athlete}, {f.squad})
                <div style={{ marginLeft: 18, color: "#FFD700", fontWeight: 700, fontSize: 14 }}>
                  <FaLightbulb style={{ marginRight: 6 }} />
                  {nextBestAction(f)}
                </div>
              </li>
            ))}
          </ul>
          <div style={{
            color: "#FFD700", marginTop: 10, fontWeight: 700, textAlign: "center"
          }}>
            <FaHeart color="#FFD700" style={{ marginRight: 5 }} />
            Avg Recommend: {(leaderboard.reduce((acc, d) => acc + Number(avgArr(d.recommend)), 0) / leaderboard.length).toFixed(1)}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          fontSize: 14,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Proprietary to CourtEvo Vero. Family engagement analytics, boys only. <span style={{ color: "#FFD700", fontWeight: 700 }}>BE REAL. BE VERO.</span>
      </div>
    </div>
  );
}

// Utility at bottom
function avgArr(arr) {
  if (!arr.length) return 0;
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}
