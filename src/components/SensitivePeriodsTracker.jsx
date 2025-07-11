import React, { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { differenceInMonths, parseISO, format } from "date-fns";
import * as XLSX from "xlsx";
import { FaHeartbeat, FaRunning, FaDumbbell, FaBolt, FaCogs, FaCalendarCheck, FaPlus, FaEdit } from "react-icons/fa";

// LTAD windows (months from PHV)
const LTAD_WINDOWS = [
  { key: "Stamina", color: "#27ef7d", icon: <FaHeartbeat />, beforePHV: -24, afterPHV: 3, advice: "Aerobic training most effective now." },
  { key: "Strength", color: "#FFD700", icon: <FaDumbbell />, beforePHV: 0, afterPHV: 24, advice: "Strength and resistance—highest gains." },
  { key: "Speed", color: "#48b5ff", icon: <FaRunning />, beforePHV: -12, afterPHV: 12, advice: "Speed/agility—maximize in this phase." },
  { key: "Flexibility", color: "#a064fe", icon: <FaCogs />, beforePHV: -18, afterPHV: 18, advice: "Flexibility—injury prevention window." },
  { key: "Skill", color: "#e94057", icon: <FaBolt />, beforePHV: -18, afterPHV: 18, advice: "Skill learning fastest—focus on fundamentals." }
];

// DEMO data
const DEMO_PLAYERS = [
  {
    id: "luka",
    name: "Luka Ivic",
    dob: "2010-04-12",
    phvDate: "2024-03-01", // PHV date (auto or manual)
    heightHistory: [
      { date: "2023-03-01", height: 162 },
      { date: "2023-09-01", height: 166 },
      { date: "2024-03-01", height: 174 },
      { date: "2024-09-01", height: 179 }
    ]
  },
  {
    id: "ivan",
    name: "Ivan Marković",
    dob: "2011-01-25",
    phvDate: "",
    heightHistory: [
      { date: "2022-11-01", height: 155 },
      { date: "2023-05-01", height: 158 },
      { date: "2023-11-01", height: 161 },
      { date: "2024-05-01", height: 165 }
    ]
  }
];

function getPlayerAge(player, onDate) {
  const dob = parseISO(player.dob);
  const d = parseISO(onDate);
  return Math.floor(differenceInMonths(d, dob) / 12 * 10) / 10;
}
function getMonthsFromPHV(player, onDate, autoPHV = null) {
  const phvDate = player.phvDate || autoPHV || "";
  return phvDate ? differenceInMonths(parseISO(onDate), parseISO(phvDate)) : null;
}
function getCurrentWindows(player, todayStr, autoPHV = null) {
  const nowM = getMonthsFromPHV(player, todayStr, autoPHV);
  if (nowM === null) return [];
  return LTAD_WINDOWS.filter(w => nowM >= w.beforePHV && nowM <= w.afterPHV);
}

// Auto-calculate PHV: largest 6-month growth
function autoCalculatePHV(heightHistory) {
  if (!heightHistory || heightHistory.length < 3) return "";
  let maxGrowth = 0, phvIdx = 0;
  for (let i = 1; i < heightHistory.length; ++i) {
    const months = differenceInMonths(parseISO(heightHistory[i].date), parseISO(heightHistory[i - 1].date));
    if (months < 3) continue;
    const growth = (heightHistory[i].height - heightHistory[i - 1].height) / months * 6; // project per 6mo
    if (growth > maxGrowth) {
      maxGrowth = growth;
      phvIdx = i;
    }
  }
  return heightHistory[phvIdx]?.date || "";
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const SensitivePeriodsTracker = () => {
  const [players, setPlayers] = useState(DEMO_PLAYERS);
  const [playerId, setPlayerId] = useState(players[0].id);
  const player = players.find(p => p.id === playerId);

  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [growthForm, setGrowthForm] = useState({ date: "", height: "" });

  // Excel upload
  function handleGrowthImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Expect: Name | DOB | PHV Date | Date1 | Height1 | Date2 | Height2 | ...
      const parsed = [];
      for (let i = 1; i < rows.length; ++i) {
        const [name, dob, phvDate, ...rest] = rows[i];
        const heightHistory = [];
        for (let j = 0; j < rest.length; j += 2) {
          if (rest[j] && rest[j + 1]) {
            heightHistory.push({ date: rest[j], height: Number(rest[j + 1]) });
          }
        }
        parsed.push({
          id: name.toLowerCase().replace(/ /g, "_"),
          name,
          dob,
          phvDate: phvDate || "",
          heightHistory
        });
      }
      setPlayers(parsed);
      setPlayerId(parsed[0]?.id || "");
    };
    reader.readAsArrayBuffer(file);
  }

  // Add/Edit Growth Entry Modal
  function handleGrowthAdd(e) {
    e.preventDefault();
    if (!growthForm.date || !growthForm.height) return;
    setPlayers(pls => pls.map(p =>
      p.id !== playerId
        ? p
        : {
          ...p,
          heightHistory: [...(p.heightHistory || []), { date: growthForm.date, height: Number(growthForm.height) }]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        }
    ));
    setGrowthForm({ date: "", height: "" });
    setShowGrowthModal(false);
  }

  // Set PHV (manual override)
  function handlePHVSet(date) {
    setPlayers(pls => pls.map(p =>
      p.id !== playerId ? p : { ...p, phvDate: date }
    ));
  }

  // Data calculations
  const today = new Date().toISOString().slice(0, 10);
  const autoPHV = autoCalculatePHV(player.heightHistory);
  const phvDate = player.phvDate || autoPHV;
  const nowM = phvDate ? getMonthsFromPHV(player, today, autoPHV) : null;
  const currentWins = getCurrentWindows(player, today, autoPHV);

  // Alerts
  const lastHeightDate = player.heightHistory.length > 0
    ? player.heightHistory[player.heightHistory.length - 1].date
    : null;
  const monthsSinceLastHeight = lastHeightDate
    ? differenceInMonths(new Date(), parseISO(lastHeightDate))
    : 100;

  // Timeline/visualization setup
  const monthsSpan = 36;
  const dates = [];
  const phv = phvDate ? parseISO(phvDate) : new Date();
  for (let m = -monthsSpan; m <= monthsSpan; m += 3) {
    const d = new Date(phv);
    d.setMonth(phv.getMonth() + m);
    dates.push({
      label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      monthsFromPHV: m
    });
  }
  // Height chart for growth curve
  const heightData = player.heightHistory.map(h => ({
    ...h,
    monthsFromPHV: phvDate ? differenceInMonths(parseISO(h.date), parseISO(phvDate)) : null
  }));

  return (
    <div style={{ width: "100%", maxWidth: 970, margin: "0 auto" }}>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 29, color: "#FFD700", fontWeight: 700, marginBottom: 18 }}>
          Sensitive Periods Tracker
        </div>
        {/* Upload and selector */}
        <div style={{ marginBottom: 14, display: "flex", gap: 15, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".xlsx,.csv" onChange={handleGrowthImport} />
          <button
            onClick={() => setShowGrowthModal(true)}
            style={{ background: "#27ef7d", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 17, cursor: "pointer" }}>
            <FaPlus style={{ marginBottom: -2, marginRight: 5 }} />
            Add Growth Entry
          </button>
          <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>
            Player:
            <select
              value={playerId}
              onChange={e => setPlayerId(e.target.value)}
              style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}
            >
              {players.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
            </select>
          </label>
          <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 16 }}>
            Age: <span style={{ color: "#fff" }}>{getPlayerAge(player, today)}</span>
          </span>
          <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 16 }}>
            PHV: <span style={{ color: "#fff" }}>
              {phvDate ? phvDate : "—"}
              {(!player.phvDate && autoPHV) && <span style={{ color: "#27ef7d" }}> (auto)</span>}
              <button onClick={() => handlePHVSet(prompt("Enter PHV date (YYYY-MM-DD):", phvDate || today))} style={{
                background: "#FFD70033", color: "#222", marginLeft: 6, border: "none", borderRadius: 5, fontWeight: 600, fontSize: 14, cursor: "pointer"
              }} title="Set/Override PHV"><FaEdit /></button>
            </span>
          </span>
        </div>
        {/* Alerts */}
        {monthsSinceLastHeight > 12 && (
          <div style={{ color: "#e94057", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            ⚠️ Growth data is outdated! Please update athlete's measurements.
          </div>
        )}
        {(!player.phvDate && !autoPHV) && (
          <div style={{ color: "#e94057", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            ⚠️ PHV not detected—add more height data.
          </div>
        )}
        {currentWins.length > 1 && (
          <div style={{ color: "#FFD700", background: "#e9405722", fontWeight: 800, fontSize: 18, marginBottom: 7, padding: 7, borderRadius: 7 }}>
            ⚡️ Multiple sensitive periods active! Prioritize holistic training and extra monitoring.
          </div>
        )}
        <div style={{ margin: "18px 0 22px 0", color: "#FFD700", fontSize: 18, fontWeight: 700 }}>
          <FaCalendarCheck style={{ marginRight: 7 }} />
          {currentWins.length === 0
            ? "No sensitive window active now—focus on balanced training."
            : (
              <>
                Active Window{currentWins.length > 1 ? "s" : ""}:&nbsp;
                {currentWins.map(w => (
                  <span key={w.key} style={{ color: w.color, marginRight: 12 }}>
                    {w.icon} {w.key}
                  </span>
                ))}
              </>
            )}
        </div>
        {/* Elite feedback for each window */}
        {currentWins.length > 0 && (
          <div style={{ background: "#FFD70011", color: "#FFD700", fontSize: 15, fontWeight: 600, padding: 10, borderRadius: 10, marginBottom: 18 }}>
            {currentWins.map(win => (
              <div key={win.key} style={{ marginBottom: 6 }}>
                <span style={{ color: win.color }}>{win.icon} {win.key}:</span> {win.advice}
              </div>
            ))}
          </div>
        )}
        {/* Timeline */}
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 12 }}>
          Timeline: Sensitive Periods vs. PHV (Months from PHV)
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={dates.map(d => ({
            ...d,
            ...Object.fromEntries(LTAD_WINDOWS.map(win => [
              win.key,
              d.monthsFromPHV >= win.beforePHV && d.monthsFromPHV <= win.afterPHV ? 180 + 20 * LTAD_WINDOWS.indexOf(win) : null
            ]))
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthsFromPHV" type="number" ticks={[-36,-24,-12,0,12,24,36]}
              label={{ value: "Months from PHV", fill: "#FFD700", fontSize: 15, position: "insideBottom" }}
              domain={[-36,36]} />
            <YAxis hide domain={[0, 280]} />
            <Tooltip />
            {LTAD_WINDOWS.map((win, i) =>
              <Line
                key={win.key}
                type="monotone"
                dataKey={win.key}
                stroke={win.color}
                strokeWidth={6}
                dot={false}
                connectNulls
              />
            )}
            <ReferenceArea
              x1={nowM - 0.01}
              x2={nowM + 0.01}
              y1={0}
              y2={260}
              stroke="#e94057"
              strokeOpacity={1}
              label={{ value: "Now", position: "top", fill: "#e94057", fontWeight: 700, fontSize: 15 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Growth curve */}
        <div style={{ margin: "32px 0 0 0" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>Growth Curve</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={heightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthsFromPHV" ticks={[-36,-24,-12,0,12,24,36]}
                label={{ value: "Months from PHV", fill: "#FFD700", fontSize: 13, position: "insideBottom" }} />
              <YAxis label={{ value: "Height (cm)", fill: "#FFD700", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="height" stroke="#FFD700" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Growth history table */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 5 }}>Growth Data</div>
          <table style={{ width: "100%", color: "#FFD700", background: "#FFD70008", borderRadius: 7 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Height (cm)</th>
              </tr>
            </thead>
            <tbody>
              {player.heightHistory.map((h, i) => (
                <tr key={i} style={{ color: "#fff", fontSize: 15 }}>
                  <td>{format(parseISO(h.date), "yyyy-MM-dd")}</td>
                  <td>{h.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 32, color: "#FFD700aa", fontSize: 15, fontStyle: "italic" }}>
          * Sensitive periods based on LTAD. Ensure PHV and growth data are updated at least 2x per year for every athlete.
        </div>
      </motion.section>

      {/* Add/Edit Growth Modal */}
      {showGrowthModal && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.94)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={handleGrowthAdd}
            style={{
              background: "#fff", color: "#222", padding: 28, borderRadius: 15, minWidth: 320
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 20, marginBottom: 11 }}>Add Growth Entry</h3>
            <label>Date:
              <input type="date" value={growthForm.date} onChange={e => setGrowthForm(f => ({ ...f, date: e.target.value }))} style={{ marginLeft: 7, fontSize: 16, borderRadius: 5, marginBottom: 10 }} required />
            </label>
            <br />
            <label>Height (cm):
              <input type="number" value={growthForm.height} onChange={e => setGrowthForm(f => ({ ...f, height: e.target.value }))} style={{ marginLeft: 7, fontSize: 16, borderRadius: 5, marginBottom: 10 }} required />
            </label>
            <br />
            <div style={{ textAlign: "right", marginTop: 12 }}>
              <button type="submit"
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 7,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginRight: 7
                }}>Save</button>
              <button type="button" onClick={() => setShowGrowthModal(false)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 7,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SensitivePeriodsTracker;
