import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaHandshake, FaUserShield, FaRegHeart, FaAward, FaUsers, FaLeaf, FaRegStar, FaGlobe, FaMedal, FaTrophy, FaCrown, FaStar } from "react-icons/fa";

// All traits, unchanged
const TRAITS = [
  {
    key: "respect",
    label: "Respect",
    description: "Treats teammates, coaches, officials, and opponents with dignity. Handles conflict maturely.",
    icon: <FaHandshake size={24} color="#FFD700" />
  },
  {
    key: "integrity",
    label: "Integrity",
    description: "Is honest, follows rules, and admits mistakes. 'Does the right thing' even when no one is watching.",
    icon: <FaUserShield size={24} color="#1de682" />
  },
  {
    key: "accountability",
    label: "Accountability",
    description: "Takes responsibility for actions and learning. Accepts feedback and owns outcomes.",
    icon: <FaAward size={24} color="#FFD700" />
  },
  {
    key: "fairplay",
    label: "Fair Play",
    description: "Plays by the spirit and letter of the rules. Never cheats, dives, or 'bends' the game.",
    icon: <FaRegHeart size={24} color="#1de682" />
  },
  {
    key: "teamspirit",
    label: "Team Spirit",
    description: "Supports teammates, values the group over self, celebrates others’ success.",
    icon: <FaUsers size={24} color="#FFD700" />
  },
  {
    key: "resilience",
    label: "Resilience",
    description: "Bounces back from setbacks, stays positive, responds well to pressure or loss.",
    icon: <FaLeaf size={24} color="#1de682" />
  },
  {
    key: "leadership",
    label: "Leadership",
    description: "Sets the tone, models behavior, inspires and holds others to high standards.",
    icon: <FaRegStar size={24} color="#FFD700" />
  },
  {
    key: "socialresp",
    label: "Social Responsibility",
    description: "Respects differences, helps the community, upholds club values off the court.",
    icon: <FaGlobe size={24} color="#1de682" />
  }
];

const INITIAL_STATE = TRAITS.map(() => ({
  score: 0,
  notes: ""
}));

function complianceMeter(score) {
  if (score >= 4.5) return { label: "ELITE CULTURE", color: "#1de682" };
  if (score >= 3.5) return { label: "STRONG", color: "#FFD700" };
  if (score >= 2.5) return { label: "MIXED", color: "#FFA500" };
  return { label: "RISK", color: "#e24242" };
}

function getRecommendations(answers) {
  return answers
    .map((a, idx) => ({ ...a, label: TRAITS[idx].label, description: TRAITS[idx].description }))
    .filter((a) => a.score < 3)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(
      (a) =>
        `• ${a.label}: ${a.score}/5. ${a.description} — Key priority for growth.`
    );
}

function handleExportCSV(answers) {
  const rows = [
    ["Trait", "Score", "Notes"],
    ...answers.map((a, idx) => [TRAITS[idx].label, a.score, a.notes.replace(/(\r\n|\n|\r)/gm, " ")]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_EthicsCharacter_${new Date().toISOString().slice(0,10)}.csv`);
}

function handleExportPDF(answers, total, compliance, recommendations) {
  const content = [
    `CourtEvo Vero Ethics & Character Self-Assessment | ${new Date().toLocaleDateString()}`,
    "-------------------------------------",
    ...answers.map(
      (a, idx) =>
        `${TRAITS[idx].label}: ${a.score}/5\nNotes: ${a.notes ? a.notes : "N/A"}\n`
    ),
    "-------------------------------------",
    `Total Score: ${total.toFixed(2)}/5 - Status: ${compliance.label}`,
    "",
    "Top Priorities for Growth:",
    ...recommendations,
    "",
    "Powered by CourtEvo Vero | BE REAL. BE VERO."
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_EthicsCharacter_${new Date().toISOString().slice(0,10)}.txt`);
}

function DiagnosticRadarChart({ answers }) {
  const data = TRAITS.map((t, i) => ({
    trait: t.label,
    Score: answers[i]?.score ?? 0,
    Standard: 4,
  }));
  return (
    <div className="rounded-3xl shadow-2xl bg-[#181e23] p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="trait" tick={{ fill: "#FFD700", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar
            name="Your Score"
            dataKey="Score"
            stroke="#FFD700"
            fill="#FFD700"
            fillOpacity={0.45}
          />
          <Radar
            name="CourtEvo Vero Standard"
            dataKey="Standard"
            stroke="#1de682"
            fill="#1de682"
            fillOpacity={0.12}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gamified progress bar
const ProgressBar = ({ value }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-1">
      <span>0%</span>
      <span>100%</span>
    </div>
    <div className="w-full h-6 bg-[#22272d] rounded-full shadow-inner flex items-center relative overflow-hidden">
      <div
        className="transition-all duration-500"
        style={{
          height: "100%",
          width: `${value}%`,
          background: `linear-gradient(90deg,#FFD700 0%,#1de682 100%)`,
          borderRadius: "inherit",
          boxShadow: "0 1px 8px 0 #0003"
        }}
      />
      <span
        className="absolute right-4 text-md font-bold"
        style={{ color: "#FFD700", textShadow: "0 1px 8px #0008" }}
      >
        {Math.round(value)}%
      </span>
    </div>
  </div>
);

// Badge unlock display (gamified)
const LevelBadge = ({ level }) => {
  if (level === "bronze")
    return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#c89d53] to-[#FFD700] text-black shadow border-2 border-[#FFD70099] animate-pulse mr-2"><FaMedal className="mr-1" /> Bronze</span>;
  if (level === "silver")
    return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#b5bac2] to-[#e7e7e7] text-black shadow border-2 border-[#b5bac2] animate-pulse mr-2"><FaTrophy className="mr-1" /> Silver</span>;
  if (level === "gold")
    return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#FFD700] to-[#ffef7c] text-black shadow border-2 border-[#FFD700] animate-pulse mr-2"><FaCrown className="mr-1" /> Gold</span>;
  if (level === "elite")
    return <span className="inline-flex items-center px-3 py-1 rounded-xl font-black bg-gradient-to-br from-[#1de682] to-[#FFD700] text-black shadow-lg border-2 border-[#1de682] animate-bounce mr-2"><FaStar className="mr-1" /> ELITE CULTURE!</span>;
  return null;
};

// Mini badge for each trait
const Badge = ({ unlocked, label }) => (
  <span
    className={
      "inline-block mx-1 px-2 py-1 rounded-xl text-sm font-bold " +
      (unlocked
        ? "bg-gradient-to-br from-[#FFD700] to-[#1de682] text-black animate-pulse shadow-md border-2 border-[#FFD70099]"
        : "bg-[#23292f] text-[#FFD70099] opacity-50 border-2 border-[#333]")
    }
    style={{
      minWidth: 65,
      transition: "all 0.16s",
    }}
    title={unlocked ? "Unlocked!" : "Score 4+ to unlock"}
  >
    {unlocked ? "🏅 " : "🔒 "} {label}
  </span>
);

// Team Leaderboard
function Leaderboard({ players, setPlayers }) {
  // Sort by score descending, then name
  const sorted = [...players]
    .map(p => ({
      ...p,
      avg: p.scores.length ? p.scores.reduce((a, b) => a + b, 0) / p.scores.length : 0
    }))
    .sort((a, b) => b.avg - a.avg || a.name.localeCompare(b.name));

  const handleScoreChange = (playerIdx, traitIdx, value) => {
    const newPlayers = [...players];
    newPlayers[playerIdx].scores[traitIdx] = Number(value);
    setPlayers(newPlayers);
  };

  const handleNameChange = (idx, value) => {
    const newPlayers = [...players];
    newPlayers[idx].name = value;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    setPlayers([...players, { name: "", scores: Array(TRAITS.length).fill(0) }]);
  };

  const removePlayer = (idx) => {
    setPlayers(players.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-[#181e23e8] rounded-2xl shadow-xl p-6 mb-12 border-l-8 border-[#1de682]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-black" style={{ color: "#1de682" }}>Team Ethics Leaderboard</div>
        <button onClick={addPlayer} className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Player</button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2 pr-2">Name</th>
              {TRAITS.map(t => <th key={t.key} className="py-2 px-1">{t.label}</th>)}
              <th className="py-2 px-2">AVG</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => (
              <tr key={idx} className={idx === 0 ? "bg-[#FFD70033]" : ""}>
                <td className="font-bold pr-2">{idx + 1}</td>
                <td className="pr-2">
                  <input
                    className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-24"
                    value={p.name}
                    onChange={e => handleNameChange(players.findIndex(q => q === p), e.target.value)}
                    placeholder="Player"
                  />
                </td>
                {TRAITS.map((t, tIdx) =>
                  <td key={t.key} className="px-1">
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={p.scores[tIdx]}
                      onChange={e => handleScoreChange(players.findIndex(q => q === p), tIdx, e.target.value)}
                      className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                    />
                  </td>
                )}
                <td className="px-2 font-bold">{p.avg.toFixed(2)}</td>
                <td>
                  <button onClick={() => removePlayer(players.findIndex(q => q === p))}
                    className="text-[#e24242] font-black px-2">×</button>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center py-4 text-gray-500">
                  Add players to see team culture rankings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-400 mt-2">Ranking is by average ethics score. Editable live.</div>
    </div>
  );
}

export default function EthicsCharacterBuilder() {
  const [answers, setAnswers] = useState(INITIAL_STATE);
  const [players, setPlayers] = useState([
    // Demo data. Remove if you want blank by default
    { name: "Player 1", scores: [4, 5, 4, 4, 5, 4, 4, 5] },
    { name: "Player 2", scores: [2, 3, 3, 3, 4, 2, 2, 4] }
  ]);

  const total = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
  const compliance = complianceMeter(total);
  const recommendations = getRecommendations(answers);

  // Gamified stats
  const completedCount = answers.filter(a => a.score > 0).length;
  const eliteCount = answers.filter(a => a.score >= 4).length;
  const percent = (completedCount / answers.length) * 100;
  const allElite = eliteCount === answers.length;

  // Progress unlock logic
  let level = null;
  if (eliteCount === answers.length) level = "elite";
  else if (eliteCount >= 6) level = "gold";
  else if (eliteCount >= 4) level = "silver";
  else if (eliteCount >= 2) level = "bronze";

  return (
    <div
      className="max-w-5xl mx-auto py-10 px-3"
      style={{ fontFamily: "Segoe UI, sans-serif", color: "#fff" }}
    >
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="bg-[#181e23cc] rounded-2xl p-3 shadow-lg flex items-center">
          <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 60, borderRadius: 12, boxShadow: "0 2px 12px #FFD70033" }} />
        </div>
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700" }}>
            Ethics & Character<br /><span className="text-[#1de682]">Builder</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-1 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
      </div>

      {/* Unlocks */}
      <div className="flex items-center gap-2 mb-4">
        {level && <LevelBadge level={level} />}
        <div>
          {eliteCount} / {TRAITS.length} traits at 4+ (“Elite”)
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl mb-7 px-6 py-5" style={{
        background: "linear-gradient(90deg, #1e2a35cc 75%, #22292Fcc 100%)",
        border: "1.5px solid #FFD70055"
      }}>
        <div className="text-lg font-bold mb-1">How to use:</div>
        <div className="text-[#e1eaff]">Rate each character trait from <b>0</b> (Not Present) to <b>5</b> (Elite/Model). Add notes or examples if you wish. Use analytics and export for board, coaching, or personal review.</div>
      </div>

      {/* Gamified Progress Bar & Badges */}
      <div className="mb-7">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2">
            <div className="font-semibold text-base text-[#FFD700] mb-2">Ethics Progress</div>
            <ProgressBar value={percent} />
          </div>
          <div className="w-full md:w-1/2 flex flex-wrap items-center justify-end mt-2 md:mt-0">
            {TRAITS.map((t, i) =>
              <Badge key={t.key} unlocked={answers[i].score >= 4} label={t.label} />
            )}
          </div>
        </div>
        {allElite && (
          <div className="w-full text-center mt-4 animate-bounce">
            <span className="text-2xl font-black text-[#1de682]">
              <FaStar size={28} className="inline-block mb-1 mr-1" />
              ELITE CULTURE!
            </span>
          </div>
        )}
      </div>

      {/* Traits */}
      <div className="grid gap-7">
        {TRAITS.map((trait, idx) => (
          <div key={trait.key}
            className="relative p-6 bg-[#181e23e8] rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 border-l-8 border-[#FFD70033] hover:border-[#1de682] transition-all duration-200"
            style={{
              backdropFilter: "blur(4px)",
            }}
          >
            {/* Icon area */}
            <div className="flex flex-col items-center justify-start">
              <div className="mb-2">{trait.icon}</div>
              <div className="h-12 border-l-2 border-dashed border-[#FFD70044] hidden md:block" />
            </div>
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-lg tracking-wide mb-1" style={{ color: "#FFD700" }}>{trait.label}</div>
              <div className="text-sm text-gray-400 mb-2">{trait.description}</div>
              <div className="flex gap-2 items-center mt-2 mb-1">
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={answers[idx].score}
                  onChange={e => {
                    const updated = [...answers];
                    updated[idx].score = Number(e.target.value);
                    setAnswers(updated);
                  }}
                  style={{ width: 150 }}
                  className="accent-[#FFD700] focus:accent-[#1de682] transition-all"
                />
                {[0, 1, 2, 3, 4, 5].map(val => (
                  <span
                    key={val}
                    className={answers[idx].score === val
                      ? "font-extrabold text-[#FFD700] scale-110"
                      : "text-gray-500"}
                    style={{ fontSize: 19, marginLeft: 2, marginRight: 2, transition: "all 0.12s" }}
                  >{val}</span>
                ))}
              </div>
              <textarea
                placeholder="Add notes, examples, actions, or improvement plans…"
                className="w-full mt-2 p-3 rounded-lg bg-[#1a222d] text-white text-base shadow-inner outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-[#242c36]"
                style={{ minHeight: 50, transition: "background 0.15s" }}
                value={answers[idx].notes}
                onChange={e => {
                  const updated = [...answers];
                  updated[idx].notes = e.target.value;
                  setAnswers(updated);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Meter */}
      <div className="my-14 grid md:grid-cols-2 gap-10">
        <div>
          <div className="font-extrabold text-xl mb-4" style={{ color: "#FFD700" }}>Character Analytics</div>
          <DiagnosticRadarChart answers={answers} />
        </div>
        <div>
          <div className="font-extrabold text-xl mb-3" style={{ color: "#FFD700" }}>Ethical Culture Meter</div>
          <div className="mb-3">
            <ProgressBar value={(total / 5) * 100} />
          </div>
          <div className="text-3xl mb-2 mt-2">
            <span style={{ color: compliance.color }}>{total.toFixed(2)}/5</span> <span className="text-base opacity-70">average score</span>
          </div>
          <div className="mb-3 text-lg font-bold text-[#FFD700]">Top Priorities for Growth</div>
          <ul className="list-disc ml-6 mb-4">
            {recommendations.length === 0 ? (
              <li className="text-[#1de682] font-bold">No critical risks flagged. Culture is strong.</li>
            ) : (
              recommendations.map((r, i) => <li key={i} className="text-[#FFA500]">{r}</li>)
            )}
          </ul>
          <div className="font-semibold mb-2">Export Results:</div>
          <div className="flex gap-3 mb-2">
            <button
              className="px-4 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
              onClick={() => handleExportCSV(answers)}
            >
              Export CSV
            </button>
            <button
              className="px-4 py-2 bg-[#1de682] text-black rounded-xl font-bold shadow hover:scale-105 transition"
              onClick={() =>
                handleExportPDF(answers, total, compliance, recommendations)
              }
            >
              Export PDF
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">Exports are branded and boardroom-ready</div>
        </div>
      </div>

      {/* Team Leaderboard */}
      <Leaderboard players={players} setPlayers={setPlayers} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 38, borderRadius: 9, boxShadow: "0 2px 10px #FFD70022" }} />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-lg">COURTEVO VERO</div>
        </div>
        <div className="text-base text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
