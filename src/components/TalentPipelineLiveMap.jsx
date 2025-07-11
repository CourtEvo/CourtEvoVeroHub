import React, { useState } from "react";
import { FaUserGraduate, FaMapMarkerAlt, FaCrown, FaArrowRight, FaArrowLeft, FaFilter, FaFilePdf, FaFileCsv, FaPlus, FaChartBar, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import html2pdf from "html2pdf.js";
import { CSVLink } from "react-csv";
import "./TalentPipelineLiveMap.css";

// --- Demo region, prospect, and move data (mocked)
const REGIONS = [
  { id: "zagreb", name: "Zagreb", coords: [250, 200] },
  { id: "split", name: "Split", coords: [410, 430] },
  { id: "rijeka", name: "Rijeka", coords: [120, 190] },
  { id: "osijek", name: "Osijek", coords: [520, 120] },
  { id: "ljubljana", name: "Ljubljana", coords: [40, 85] }
];
const STAGES = ["FUNdamentals", "Learn to Train", "Train to Train", "Train to Compete", "Train to Win"];
const POSITIONS = ["Guard", "Wing", "Forward", "Center"];
const CLUBS = ["Cedevita Junior", "Split", "Rijeka Basket", "Osijek Blue", "Cibona", "Olimpija"];

// --- Prospects, now with eventType, previousRegion for flow lines
const PROSPECTS = [
  { id: 1, name: "Ivan Horvat", age: 14, club: "Cedevita Junior", region: "zagreb", previousRegion: "split", stage: "Learn to Train", position: "Guard", lastMove: "2025-04-10", eventType: "Call-up" },
  { id: 2, name: "Marko Pavić", age: 17, club: "Split", region: "split", previousRegion: "rijeka", stage: "Train to Compete", position: "Forward", lastMove: "2025-02-20", eventType: "Transfer" },
  { id: 3, name: "Toni Kovač", age: 15, club: "Rijeka Basket", region: "rijeka", previousRegion: "osijek", stage: "Train to Train", position: "Wing", lastMove: "2025-05-01", eventType: "Drop" },
  { id: 4, name: "Dino Perić", age: 13, club: "Osijek Blue", region: "osijek", previousRegion: "osijek", stage: "FUNdamentals", position: "Guard", lastMove: "2025-03-10", eventType: "Call-up" },
  { id: 5, name: "Luka Novak", age: 19, club: "Cibona", region: "zagreb", previousRegion: "zagreb", stage: "Train to Win", position: "Center", lastMove: "2025-06-10", eventType: "Contract" },
  { id: 6, name: "Gregor Savic", age: 18, club: "Olimpija", region: "ljubljana", previousRegion: "split", stage: "Train to Win", position: "Forward", lastMove: "2025-01-15", eventType: "Call-up" }
];

// --- Talent event ticker
const TICKER_EVENTS = [
  { text: "Ivan Horvat called up to U15 Croatia!", type: "Call-up" },
  { text: "Marko Pavić transferred to Split.", type: "Transfer" },
  { text: "Toni Kovač dropped from pipeline.", type: "Drop" },
  { text: "Luka Novak signed pro contract!", type: "Contract" }
];

// --- Helper colors
function getRegionColor(region) {
  if (region === "zagreb") return "#FFD700";
  if (region === "split") return "#e94057";
  if (region === "rijeka") return "#27ef7d";
  if (region === "osijek") return "#00B4D8";
  if (region === "ljubljana") return "#A3E635";
  return "#fff";
}
function getEventColor(type) {
  if (type === "Call-up") return "#27ef7d";
  if (type === "Transfer") return "#FFD700";
  if (type === "Drop") return "#e94057";
  if (type === "Contract") return "#00B4D8";
  return "#FFD700";
}

// --- Filter logic
function prospectFilter(p, filters) {
  return (
    (filters.stage ? p.stage === filters.stage : true) &&
    (filters.club ? p.club === filters.club : true) &&
    (filters.position ? p.position === filters.position : true)
  );
}

// --- "AI" prediction for next move
function predictNextMove(p) {
  if (p.stage === "Train to Win") return "Likely pro contract (3mo)";
  if (p.stage === "Train to Compete") return "Possible national call-up (12mo)";
  if (p.stage === "FUNdamentals") return "Focus: skill base/retention";
  if (p.eventType === "Drop") return "Risk: needs review";
  return "Progressing";
}

// --- CSV export per region
function prospectsToCSV(regionId) {
  return PROSPECTS.filter(p => p.region === regionId).map(p => ({
    Name: p.name,
    Age: p.age,
    Club: p.club,
    Stage: p.stage,
    Position: p.position,
    "Last Move": p.lastMove,
    "Next Move": predictNextMove(p)
  }));
}

export default function TalentPipelineLiveMap() {
  const [filters, setFilters] = useState({ stage: "", club: "", position: "" });
  const [hoverRegion, setHoverRegion] = useState(null);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [prospects, setProspects] = useState(PROSPECTS);
  const [form, setForm] = useState({
    name: "", age: "", club: CLUBS[0], region: REGIONS[0].id, stage: STAGES[0], position: POSITIONS[0], lastMove: "", eventType: "Call-up", previousRegion: REGIONS[0].id
  });

  // --- Region stats/gaps
  const regionStats = REGIONS.map(region => {
    const count = prospects.filter(p => p.region === region.id && prospectFilter(p, filters)).length;
    return { ...region, count };
  });
  const gaps = regionStats.filter(r => r.count === 0);

  // --- Ticker animation (auto-advance)
  React.useEffect(() => {
    const t = setInterval(() => setTickerIndex(i => (i + 1) % TICKER_EVENTS.length), 4400);
    return () => clearInterval(t);
  }, []);

  // --- Region chart for modal
  function regionChartData(regionId) {
    const filtered = prospects.filter(p => p.region === regionId);
    return {
      stages: STAGES.map(s => ({
        stage: s,
        count: filtered.filter(p => p.stage === s).length
      })),
      positions: POSITIONS.map(pos => ({
        position: pos,
        count: filtered.filter(p => p.position === pos).length
      }))
    };
  }

  // --- PDF export: full/region
  function handleExportPDF(regionId = null) {
    let el;
    if (!regionId) el = document.getElementById("talent-pipeline-map-root");
    else el = document.getElementById(`region-modal-root-${regionId}`);
    if (el) html2pdf().from(el).set({ margin: 0.3, filename: (regionId ? `TalentRegion_${regionId}` : "TalentPipelineLiveMap") + ".pdf" }).save();
  }

  // --- Add Prospect logic
  function handleAddProspect(e) {
    e.preventDefault();
    setProspects(ps => [
      ...ps,
      { ...form, id: Date.now(), lastMove: form.lastMove || new Date().toISOString().slice(0, 10) }
    ]);
    setShowAdd(false);
    setForm({ name: "", age: "", club: CLUBS[0], region: REGIONS[0].id, stage: STAGES[0], position: POSITIONS[0], lastMove: "", eventType: "Call-up", previousRegion: REGIONS[0].id });
  }

  // --- Flows: edges between previous/current region
  const flows = prospects
    .filter(p => p.previousRegion && p.region && p.previousRegion !== p.region)
    .map(p => {
      const from = REGIONS.find(r => r.id === p.previousRegion);
      const to = REGIONS.find(r => r.id === p.region);
      if (!from || !to) return null;
      return { from, to, color: getRegionColor(p.region), prospect: p };
    }).filter(Boolean);

  return (
    <div id="talent-pipeline-map-root" className="talent-pipeline-map" style={{
      background: "linear-gradient(120deg, #181E23 0%, #232a2e 100%)",
      borderRadius: 22,
      boxShadow: "0 10px 46px #FFD70024",
      padding: 36,
      minHeight: 1050,
      maxWidth: 1260,
      margin: "0 auto",
      color: "#fff",
      position: "relative"
    }}>
      {/* --- Ticker --- */}
      <motion.div
        key={tickerIndex}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="talent-ticker"
        style={{
          marginBottom: 16,
          fontWeight: 900,
          fontSize: 18,
          background: "#232d38",
          borderRadius: 12,
          padding: "10px 18px",
          color: getEventColor(TICKER_EVENTS[tickerIndex].type),
          boxShadow: "0 2px 8px #FFD70033",
          letterSpacing: 0.5
        }}>
        {TICKER_EVENTS[tickerIndex].type === "Call-up" && <FaSignInAlt style={{ marginRight: 7 }} />}
        {TICKER_EVENTS[tickerIndex].type === "Transfer" && <FaArrowRight style={{ marginRight: 7 }} />}
        {TICKER_EVENTS[tickerIndex].type === "Drop" && <FaArrowLeft style={{ marginRight: 7 }} />}
        {TICKER_EVENTS[tickerIndex].type === "Contract" && <FaCrown style={{ marginRight: 7 }} />}
        {TICKER_EVENTS[tickerIndex].text}
      </motion.div>

      {/* --- Filter Bar --- */}
      <div className="talent-filters-bar" style={{ display: "flex", alignItems: "center", marginBottom: 19, position: "sticky", top: 0, zIndex: 5, background: "linear-gradient(90deg,#232a2e 66%,#222b3a 100%)", paddingBottom: 9 }}>
        <button
          onClick={() => setShowFilter(f => !f)}
          style={{
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 7,
            padding: "7px 22px",
            fontWeight: 900,
            fontSize: 16,
            boxShadow: "0 2px 18px #FFD70033",
            marginRight: 15,
            cursor: "pointer"
          }}
        >
          <FaFilter style={{ marginBottom: -4, marginRight: 8 }} />
          {showFilter ? "Hide Filters" : "Show Filters"}
        </button>
        <button
          onClick={handleExportPDF}
          style={{
            background: "#27ef7d",
            color: "#232a2e",
            border: "none",
            borderRadius: 7,
            padding: "7px 22px",
            fontWeight: 900,
            fontSize: 16,
            boxShadow: "0 2px 18px #27ef7d33",
            marginRight: 15,
            cursor: "pointer"
          }}>
          <FaFilePdf style={{ marginBottom: -4, marginRight: 8 }} />
          Export PDF
        </button>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "#A3E635",
            color: "#232a2e",
            border: "none",
            borderRadius: 7,
            padding: "7px 22px",
            fontWeight: 900,
            fontSize: 16,
            boxShadow: "0 2px 18px #A3E63533",
            marginRight: 8,
            cursor: "pointer"
          }}>
          <FaPlus style={{ marginBottom: -4, marginRight: 8 }} />
          Add Prospect
        </button>
        {gaps.length > 0 && (
          <span style={{ color: "#e94057", fontWeight: 900, marginLeft: 15, fontSize: 17 }}>
            <FaArrowLeft style={{ marginBottom: -4, marginRight: 6 }} />
            Gap: {gaps.map(r => r.name).join(", ")}
          </span>
        )}
      </div>

      {/* --- Filters --- */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="talent-filters-wrap"
            style={{ marginBottom: 19, background: "#181e23", borderRadius: 9, padding: 17, display: "flex", gap: 22 }}>
            <div>
              <label style={{ color: "#FFD700", fontWeight: 700 }}>Stage<br />
                <select
                  value={filters.stage}
                  onChange={e => setFilters(f => ({ ...f, stage: e.target.value }))}
                  style={{ borderRadius: 7, fontWeight: 700, padding: "6px 12px", marginTop: 5 }}>
                  <option value="">All</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div>
              <label style={{ color: "#FFD700", fontWeight: 700 }}>Club<br />
                <select
                  value={filters.club}
                  onChange={e => setFilters(f => ({ ...f, club: e.target.value }))}
                  style={{ borderRadius: 7, fontWeight: 700, padding: "6px 12px", marginTop: 5 }}>
                  <option value="">All</option>
                  {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div>
              <label style={{ color: "#FFD700", fontWeight: 700 }}>Position<br />
                <select
                  value={filters.position}
                  onChange={e => setFilters(f => ({ ...f, position: e.target.value }))}
                  style={{ borderRadius: 7, fontWeight: 700, padding: "6px 12px", marginTop: 5 }}>
                  <option value="">All</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SVG Map Layer --- */}
      <div style={{
        background: "#222c",
        borderRadius: 20,
        marginBottom: 25,
        position: "relative",
        overflow: "hidden",
        minHeight: 470,
        maxWidth: 900,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <svg width={900} height={520} style={{ display: "block" }}>
          {/* Draw animated flow lines */}
          {flows.map((f, idx) => {
            const [x1, y1] = f.from.coords;
            const [x2, y2] = f.to.coords;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - 40;
            return (
              <motion.path
                key={idx}
                d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
                fill="none"
                stroke={f.color}
                strokeWidth={6}
                strokeDasharray="7 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: idx * 0.18 }}
                style={{ opacity: 0.44 }}
              />
            );
          })}
          {/* Draw regions as hotspots */}
          {REGIONS.map(region => (
            <motion.circle
              key={region.id}
              cx={region.coords[0]}
              cy={region.coords[1]}
              r={hoverRegion === region.id ? 54 : 45}
              fill={getRegionColor(region.id)}
              fillOpacity={hoverRegion === region.id ? 0.37 : 0.19}
              stroke="#FFD700"
              strokeWidth={hoverRegion === region.id ? 8 : 3}
              style={{ cursor: "pointer", transition: "all 0.22s" }}
              onMouseEnter={() => setHoverRegion(region.id)}
              onMouseLeave={() => setHoverRegion(null)}
              onClick={() => setShowRegionModal(region.id)}
              whileHover={{ scale: 1.08 }}
            />
          ))}
          {/* Club icons */}
          {REGIONS.map(region => (
            <motion.g
              key={region.id + "_icon"}
              animate={{ scale: hoverRegion === region.id ? 1.18 : 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <FaMapMarkerAlt
                style={{
                  color: getRegionColor(region.id),
                  fontSize: hoverRegion === region.id ? 41 : 31,
                  position: "absolute",
                  left: region.coords[0] - 15,
                  top: region.coords[1] - 29
                }}
              />
            </motion.g>
          ))}
          {/* Prospects */}
          {prospects.filter(p => prospectFilter(p, filters)).map((p, i) => {
            const region = REGIONS.find(r => r.id === p.region);
            if (!region) return null;
            const angle = (i * 2 * Math.PI) / prospects.length + (hoverRegion === region.id ? 0.1 : 0);
            const r = 80 + (hoverRegion === region.id ? 16 : 0);
            const x = region.coords[0] + r * Math.cos(angle);
            const y = region.coords[1] + r * Math.sin(angle);
            return (
              <motion.circle
                key={p.id}
                cx={x}
                cy={y}
                r={hoverRegion === region.id ? 22 : 16}
                fill={getRegionColor(region.id)}
                fillOpacity={0.92}
                stroke="#232a2e"
                strokeWidth={4}
                whileHover={{ scale: 1.19 }}
                onClick={() => setSelectedProspect(p)}
                style={{ cursor: "pointer" }}
                animate={{ r: hoverRegion === region.id ? 22 : 16 }}
                transition={{ duration: 0.2 }}
              />
            );
          })}
        </svg>
        {/* Club stats overlay (region hover) */}
        <AnimatePresence>
          {hoverRegion && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              style={{
                position: "absolute",
                left: REGIONS.find(r => r.id === hoverRegion).coords[0] + 55,
                top: REGIONS.find(r => r.id === hoverRegion).coords[1] - 78,
                background: "#181e2399",
                color: "#FFD700",
                borderRadius: 15,
                fontWeight: 900,
                padding: "19px 30px",
                zIndex: 12,
                boxShadow: "0 2px 22px #FFD70044",
                fontSize: 20
              }}
            >
              <div>
                {REGIONS.find(r => r.id === hoverRegion).name}:{" "}
                <span style={{ color: "#27ef7d", fontWeight: 900 }}>
                  {regionStats.find(r => r.id === hoverRegion).count}
                </span>{" "}
                prospects
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#fff" }}>
                Clubs: {prospects.filter(p => p.region === hoverRegion).map(p => p.club).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
              </div>
              <button
                style={{
                  marginTop: 14, background: "#FFD700", color: "#232a2e", fontWeight: 800,
                  border: "none", borderRadius: 6, fontSize: 15, padding: "5px 19px", cursor: "pointer"
                }}
                onClick={() => setShowRegionModal(hoverRegion)}>
                <FaChartBar style={{ marginBottom: -2, marginRight: 7 }} /> Region Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Prospect Cards --- */}
      <div style={{
        display: "flex",
        gap: 25,
        flexWrap: "wrap",
        marginBottom: 30,
        justifyContent: "center"
      }}>
        {prospects.filter(p => prospectFilter(p, filters)).map((p, i) => (
          <motion.div
            key={p.id}
            className="talent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            whileHover={{ scale: 1.13 }}
            style={{
              background: `linear-gradient(120deg, ${getRegionColor(p.region)}33 0%, #232a2e 100%)`,
              color: "#FFD700",
              borderRadius: 15,
              boxShadow: "0 7px 22px #FFD70018",
              fontWeight: 900,
              padding: "19px 33px",
              fontSize: 20,
              minWidth: 210,
              maxWidth: 290,
              cursor: "pointer",
              border: `2.3px solid ${getRegionColor(p.region)}`,
              position: "relative"
            }}
            onClick={() => setSelectedProspect(p)}
          >
            <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 3 }}>{p.name}</div>
            <div style={{ color: "#27ef7d", fontWeight: 700 }}>{p.club}</div>
            <div style={{ color: "#fff", fontWeight: 700, margin: "2px 0" }}>Stage: <span style={{ color: "#FFD700" }}>{p.stage}</span></div>
            <div style={{ color: "#fff", fontWeight: 600 }}>Age: <span style={{ color: "#FFD700" }}>{p.age}</span> | Pos: <span style={{ color: "#FFD700" }}>{p.position}</span></div>
            <div style={{ color: "#FFD700aa", fontWeight: 500, fontSize: 14 }}>
              Last Move: {p.lastMove}
            </div>
            <div style={{
              position: "absolute",
              top: 13,
              right: 22,
              fontSize: 22,
              color: "#fff"
            }}>
              <FaCrown />
            </div>
            <div style={{
              marginTop: 10,
              color: "#A3E635",
              fontWeight: 800,
              fontSize: 15,
              textShadow: "0 1px 6px #232a2e"
            }}>
              {predictNextMove(p)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Prospect Modal --- */}
      <AnimatePresence>
        {selectedProspect && (
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 90 }}
            style={{
              position: "fixed",
              left: 0, top: 0, right: 0, bottom: 0,
              zIndex: 99,
              background: "rgba(24,28,38,0.99)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <div style={{
              background: "#232a2e",
              borderRadius: 20,
              padding: 38,
              minWidth: 340,
              boxShadow: "0 8px 32px #FFD70044",
              color: "#FFD700",
              maxWidth: 440
            }}>
              <h3 style={{ fontWeight: 900, fontSize: 28, marginBottom: 13 }}>
                <FaUserGraduate style={{ marginRight: 7 }} />
                {selectedProspect.name}
              </h3>
              <div style={{ fontWeight: 700, color: "#27ef7d", marginBottom: 4 }}>
                {selectedProspect.club}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Stage:</b> {selectedProspect.stage}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Age:</b> {selectedProspect.age}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Position:</b> {selectedProspect.position}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Last Move:</b> {selectedProspect.lastMove}
              </div>
              <div style={{ marginBottom: 8, color: "#A3E635", fontWeight: 800 }}>
                Next: {predictNextMove(selectedProspect)}
              </div>
              <button
                onClick={() => setSelectedProspect(null)}
                style={{
                  marginTop: 18,
                  background: "#FFD700",
                  color: "#232a2e",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 800,
                  fontSize: 17,
                  padding: "7px 22px",
                  cursor: "pointer"
                }}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Region Modal --- */}
      <AnimatePresence>
        {showRegionModal && (() => {
          const region = REGIONS.find(r => r.id === showRegionModal);
          const { stages, positions } = regionChartData(showRegionModal);
          return (
            <motion.div
              initial={{ opacity: 0, y: 120 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 120 }}
              style={{
                position: "fixed",
                left: 0, top: 0, right: 0, bottom: 0,
                zIndex: 99,
                background: "rgba(24,28,38,0.98)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
              <div id={`region-modal-root-${region.id}`} style={{
                background: "#181e23",
                borderRadius: 22,
                padding: 36,
                minWidth: 380,
                boxShadow: "0 8px 44px #FFD70077",
                color: "#FFD700",
                maxWidth: 600
              }}>
                <h3 style={{ fontWeight: 900, fontSize: 26, marginBottom: 19 }}>
                  {region.name} — Drilldown
                </h3>
                <div style={{ fontWeight: 800, color: "#27ef7d", marginBottom: 13 }}>
                  Total Prospects: {regionStats.find(r => r.id === region.id).count}
                </div>
                {/* Stage Distribution Chart (Horizontal Bar) */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: "#FFD700", fontWeight: 800, marginBottom: 5 }}>By Stage</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", minHeight: 65 }}>
                    {stages.map(s =>
                      <div key={s.stage} style={{
                        background: "#FFD70055",
                        width: 56,
                        height: `${13 + s.count * 22}px`,
                        borderRadius: 7,
                        marginRight: 2,
                        textAlign: "center",
                        color: "#FFD700",
                        fontWeight: 900
                      }}>
                        <div style={{ fontSize: 20, color: "#27ef7d", marginBottom: -7 }}>{s.count}</div>
                        <div style={{ fontSize: 13, color: "#FFD700", marginBottom: 2 }}>{s.stage.split(" ").map(x => x[0]).join("")}</div>
                      </div>
                    )}
                  </div>
                </div>
                {/* By Position Chart */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: "#FFD700", fontWeight: 800, marginBottom: 5 }}>By Position</div>
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-end", minHeight: 50 }}>
                    {positions.map(pos =>
                      <div key={pos.position} style={{
                        background: "#27ef7d44",
                        width: 56,
                        height: `${13 + pos.count * 19}px`,
                        borderRadius: 7,
                        marginRight: 2,
                        textAlign: "center",
                        color: "#27ef7d",
                        fontWeight: 900
                      }}>
                        <div style={{ fontSize: 19, color: "#FFD700", marginBottom: -7 }}>{pos.count}</div>
                        <div style={{ fontSize: 13, color: "#27ef7d", marginBottom: 2 }}>{pos.position.slice(0, 3)}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleExportPDF(region.id)}
                    style={{
                      background: "#FFD700", color: "#232a2e", fontWeight: 900, fontSize: 16,
                      border: "none", borderRadius: 7, padding: "8px 21px", cursor: "pointer"
                    }}>
                    <FaFilePdf style={{ marginRight: 7 }} /> Export PDF
                  </button>
                  <CSVLink
                    data={prospectsToCSV(region.id)}
                    filename={`TalentRegion_${region.id}_${region.name}.csv`}
                    style={{
                      background: "#27ef7d", color: "#232a2e", fontWeight: 900, fontSize: 16,
                      border: "none", borderRadius: 7, padding: "8px 21px", cursor: "pointer", textDecoration: "none"
                    }}>
                    <FaFileCsv style={{ marginRight: 7 }} /> Export CSV
                  </CSVLink>
                  <button
                    onClick={() => setShowRegionModal(null)}
                    style={{
                      background: "#e94057", color: "#fff", fontWeight: 900, fontSize: 16,
                      border: "none", borderRadius: 7, padding: "8px 21px", cursor: "pointer"
                    }}>
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* --- Add Prospect Modal --- */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 70 }}
            style={{
              position: "fixed",
              left: 0, top: 0, right: 0, bottom: 0,
              zIndex: 90,
              background: "rgba(24,28,38,0.97)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <form onSubmit={handleAddProspect} className="talent-add-form" style={{
              background: "#232d38",
              borderRadius: 19,
              padding: 38,
              minWidth: 330,
              boxShadow: "0 8px 32px #FFD70033",
              color: "#FFD700",
              maxWidth: 430
            }}>
              <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 14 }}>Add Prospect</h3>
              <div style={{ marginBottom: 11 }}>
                <label>Name<br />
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }} />
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Age<br />
                  <input required type="number" min="10" max="21" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }} />
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Club<br />
                  <select required value={form.club} onChange={e => setForm(f => ({ ...f, club: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }}>
                    {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Region<br />
                  <select required value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }}>
                    {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Stage<br />
                  <select required value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Position<br />
                  <select required value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }}>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Event Type<br />
                  <select required value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }}>
                    <option>Call-up</option>
                    <option>Transfer</option>
                    <option>Drop</option>
                    <option>Contract</option>
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Previous Region<br />
                  <select required value={form.previousRegion} onChange={e => setForm(f => ({ ...f, previousRegion: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }}>
                    {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 11 }}>
                <label>Last Move Date<br />
                  <input type="date" value={form.lastMove} onChange={e => setForm(f => ({ ...f, lastMove: e.target.value }))} style={{ width: "100%", borderRadius: 7, padding: 8, fontSize: 16 }} />
                </label>
              </div>
              <div style={{ display: "flex", gap: 13, marginTop: 17 }}>
                <button
                  type="submit"
                  style={{
                    background: "#FFD700",
                    color: "#232a2e",
                    fontWeight: 900,
                    fontSize: 17,
                    border: "none",
                    borderRadius: 7,
                    padding: "7px 20px",
                    cursor: "pointer"
                  }}>
                  Add Prospect
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  style={{
                    background: "#e94057",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 17,
                    border: "none",
                    borderRadius: 7,
                    padding: "7px 20px",
                    cursor: "pointer"
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ color: "#FFD70099", fontSize: 14, marginTop: 32, textAlign: "center" }}>
        CourtEvo Vero™ — Next-level pipeline analytics. No table, no chart, just pure visual insight.
      </div>
    </div>
  );
}
