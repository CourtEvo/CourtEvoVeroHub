import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useReactToPrint } from "react-to-print";
import { FaHeartbeat, FaBrain, FaUsers, FaHandHoldingHeart, FaLightbulb, FaTrophy, FaFileExport } from "react-icons/fa";

// Example team/club data (real app: fetch or load from Excel/DB)
const TEAMS = [
  {
    id: "u14", name: "U14",
    players: [
      {
        id: "luka", name: "Luka Ivic", age: 14, position: "PG", team: "U14",
        radar: [
          { aspect: "Physical", value: 78 },
          { aspect: "Technical", value: 80 },
          { aspect: "Tactical", value: 66 },
          { aspect: "Mental", value: 73 },
          { aspect: "Emotional", value: 62 },
          { aspect: "Social", value: 85 }
        ],
        milestones: [
          { area: "Emotional", achieved: false, label: "Handles pressure in close games" },
          { area: "Technical", achieved: true, label: "Can finish both hands, both sides" },
          { area: "Social", achieved: true, label: "Builds positive team chemistry" },
          { area: "Mental", achieved: false, label: "Maintains focus after mistake" }
        ]
      },
      {
        id: "Ivan", name: "Ivan Petrović", age: 13, position: "SG", team: "U14",
        radar: [
          { aspect: "Physical", value: 71 },
          { aspect: "Technical", value: 83 },
          { aspect: "Tactical", value: 71 },
          { aspect: "Mental", value: 79 },
          { aspect: "Emotional", value: 82 },
          { aspect: "Social", value: 72 }
        ],
        milestones: [
          { area: "Emotional", achieved: true, label: "Handles pressure in close games" },
          { area: "Technical", achieved: true, label: "Can finish both hands, both sides" },
          { area: "Social", achieved: true, label: "Builds positive team chemistry" },
          { area: "Mental", achieved: true, label: "Maintains focus after mistake" }
        ]
      }
    ]
  },
  {
    id: "u16", name: "U16",
    players: [
      {
        id: "ivo", name: "Ivo Grgić", age: 15, position: "SF", team: "U16",
        radar: [
          { aspect: "Physical", value: 82 },
          { aspect: "Technical", value: 77 },
          { aspect: "Tactical", value: 79 },
          { aspect: "Mental", value: 81 },
          { aspect: "Emotional", value: 69 },
          { aspect: "Social", value: 86 }
        ],
        milestones: [
          { area: "Emotional", achieved: false, label: "Handles pressure in close games" },
          { area: "Technical", achieved: true, label: "Can finish both hands, both sides" },
          { area: "Social", achieved: false, label: "Builds positive team chemistry" },
          { area: "Mental", achieved: true, label: "Maintains focus after mistake" }
        ]
      }
    ]
  }
];

const aspectIcons = {
  Physical: <FaHeartbeat color="#FFD700" />,
  Technical: <FaTrophy color="#27ef7d" />,
  Tactical: <FaLightbulb color="#48b5ff" />,
  Mental: <FaBrain color="#a064fe" />,
  Emotional: <FaHandHoldingHeart color="#FFD700" />,
  Social: <FaUsers color="#27ef7d" />
};

const fadeIn = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

function getAverageRadar(players) {
  const aspects = ["Physical", "Technical", "Tactical", "Mental", "Emotional", "Social"];
  return aspects.map(aspect => {
    const sum = players.reduce((acc, p) =>
      acc + (p.radar.find(r => r.aspect === aspect)?.value || 0), 0
    );
    return { aspect, value: Math.round(sum / players.length) };
  });
}

const PlayerHolisticDashboard = () => {
  // Default: show first team and first player
  const [teamId, setTeamId] = useState(TEAMS[0].id);
  const selectedTeam = TEAMS.find(t => t.id === teamId);
  const [playerId, setPlayerId] = useState(selectedTeam.players[0].id);
  const player = selectedTeam.players.find(p => p.id === playerId);

  const averageRadar = getAverageRadar(selectedTeam.players);

  // Automated feedback ("next actions")
  const feedback = player.radar.map((item) => {
    if (item.value < 65) return `Focus on ${item.aspect}—below best-practice range.`;
    if (item.value < 75) return `Solid ${item.aspect}, but could strengthen further.`;
    return `${item.aspect} area is strong—maintain growth!`;
  });

  // At-risk detector
  const atRisk = player.radar.filter(a => a.value < 65).length > 0
    || player.milestones.filter(m => !m.achieved).length > 1;

  // PDF export
  const sectionRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `CourtEvoVero_Player360_${player.name.replace(" ", "_")}_${new Date().toISOString().slice(0,10)}`
  });

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      {/* Selectors */}
      <div style={{ display: "flex", gap: 22, alignItems: "center", marginTop: 33, marginBottom: -16 }}>
        <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>
          Team:
          <select
            value={teamId}
            onChange={e => {
              setTeamId(e.target.value);
              setPlayerId(TEAMS.find(t => t.id === e.target.value).players[0].id);
            }}
            style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}
          >
            {TEAMS.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>
          Player:
          <select
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
            style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}
          >
            {selectedTeam.players.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
        </label>
        <button
          onClick={handlePrint}
          style={{
            background: "#FFD700",
            color: "#222",
            fontWeight: 700,
            border: "none",
            borderRadius: 7,
            padding: "8px 18px",
            fontSize: 17,
            cursor: "pointer",
            boxShadow: "0 2px 8px #FFD70033"
          }}>
          <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} />
          Export Player Report (PDF)
        </button>
      </div>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 32,
          marginTop: 26,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 38, flexWrap: "wrap" }}>
          {/* Left: Player info and radar chart */}
          <div style={{ flex: 1, minWidth: 340 }}>
            <div style={{ fontSize: 25, color: "#FFD700", fontWeight: 700 }}>
              {player.name} <span style={{ color: "#fff", fontWeight: 400, fontSize: 19 }}>({player.position})</span>
            </div>
            <div style={{ color: "#FFD700", fontSize: 16, marginBottom: 11 }}>
              Age: {player.age} | Team: {player.team}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart
                cx="50%" cy="50%" outerRadius={110}
                data={player.radar}
              >
                <PolarGrid stroke="#FFD70022" />
                <PolarAngleAxis dataKey="aspect" tick={{ fill: "#FFD700", fontSize: 16, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} tick={{ fill: "#FFD70088", fontSize: 13 }} />
                <Radar
                  name="Holistic Profile"
                  dataKey="value"
                  stroke="#27ef7d"
                  fill="#27ef7d88"
                  fillOpacity={0.4}
                  dot
                />
                <Tooltip content={({ payload }) => (
                  payload && payload[0]
                    ? <div style={{ color: "#222", background: "#FFD700", padding: 7, borderRadius: 8 }}>
                        <b>{payload[0].payload.aspect}</b>: {payload[0].payload.value}
                      </div>
                    : null
                )} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Middle: Team average radar */}
          <div style={{
            flex: 1, minWidth: 320, maxWidth: 340,
            background: "#25314911", borderRadius: 14, padding: "17px 15px", marginTop: 10
          }}>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 20, marginBottom: 9 }}>
              Team/Club Average
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart
                cx="50%" cy="50%" outerRadius={75}
                data={averageRadar}
              >
                <PolarGrid stroke="#FFD70022" />
                <PolarAngleAxis dataKey="aspect" tick={{ fill: "#FFD700", fontSize: 14, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} tick={{ fill: "#FFD70088", fontSize: 11 }} />
                <Radar
                  name="Average"
                  dataKey="value"
                  stroke="#FFD700"
                  fill="#FFD70066"
                  fillOpacity={0.28}
                  dot
                />
                <Tooltip content={({ payload }) => (
                  payload && payload[0]
                    ? <div style={{ color: "#222", background: "#FFD700", padding: 5, borderRadius: 6 }}>
                        <b>{payload[0].payload.aspect}</b>: {payload[0].payload.value}
                      </div>
                    : null
                )} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Right: Checklist and feedback */}
          <div style={{
            flex: 1,
            minWidth: 250,
            background: "#25314911",
            borderRadius: 14,
            padding: "22px 15px",
            marginTop: 10
          }}>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 20, marginBottom: 12 }}>
              Development Checklist
            </div>
            <ul style={{ fontSize: 16, color: "#fff", marginLeft: 5 }}>
              {player.milestones.map(m =>
                <li key={m.label} style={{
                  marginBottom: 9,
                  textDecoration: m.achieved ? "none" : "underline",
                  color: m.achieved ? "#27ef7d" : "#FFD700"
                }}>
                  {aspectIcons[m.area]} {m.label} {m.achieved ? "✓" : ""}
                </li>
              )}
            </ul>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, margin: "22px 0 6px 0" }}>
              Feedback & Next Steps
            </div>
            <ul style={{ fontSize: 16, color: "#FFD700bb", marginLeft: 8 }}>
              {feedback.map((f, i) =>
                <li key={i}>{f}</li>
              )}
              {atRisk && (
                <li style={{ color: "#e94057", fontWeight: 700, marginTop: 9 }}>
                  At-risk: Player needs holistic support plan!
                </li>
              )}
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default PlayerHolisticDashboard;
