import React, { useState } from "react";
import { FaRocket, FaSearch, FaCheckCircle, FaExclamationTriangle, FaPlus, FaDownload, FaCopy, FaBarcode, FaEye, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { AnimatePresence, motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import { QRCodeSVG } from "qrcode.react";
import "./BlockchainTalentVerification.css";

// DEMO DATA (from your csv-style structure)
const ALL_PLAYERS = [
  {
    playerId: "FIBA2025345",
    player: "Ivan Ivic",
    club: "Cibona",
    agent: "Ivan Brkic",
    records: [
      { type: "Transfer", ref: "EuroLeague", hash: "0x583A4...de9a", date: "2025-04-02", signers: ["Cibona", "EuroLeague"], status: "Verified", aiRisk: 1, notes: "" },
      { type: "Contract", ref: "2025/26", hash: "0x2ad9f...09b7", date: "2025-05-01", signers: ["Cibona", "Player"], status: "Verified", aiRisk: 2, notes: "" },
      { type: "Endorsement", ref: "Nike", hash: "0x1234c...f000", date: "2025-06-11", signers: ["Nike", "Player"], status: "Pending", aiRisk: 4, notes: "Pending signature" }
    ]
  },
  {
    playerId: "FIBA2061202",
    player: "Petar Peric",
    club: "Cedevita",
    agent: "Petar Vukovic",
    records: [
      { type: "Milestone", ref: "ABA MVP", hash: "0x81ef9...3d47", date: "2025-06-18", signers: ["ABA", "Player"], status: "Verified", aiRisk: 1, notes: "" }
    ]
  },
  {
    playerId: "FIBA2011673",
    player: "Mike Smith",
    club: "Zadar",
    agent: "Sven Krnic",
    records: [
      { type: "Contract", ref: "2024/25", hash: "0xabc14...8e5d", date: "2025-03-15", signers: ["Zadar", "Player"], status: "Flagged", aiRisk: 7, notes: "Possible duplicate" }
    ]
  }
];

// --- Helpers
const STATUS_COLOR = { Verified: "#27ef7d", Pending: "#FFD700", Flagged: "#e94057" };
const RISK_BAR_COLOR = ['#27ef7d', '#FFD700', '#e94057', '#e94057', '#e94057', '#FFD700', '#27ef7d'];

function flattenRecords(players) {
  return players.flatMap(p =>
    p.records.map(r => ({
      ...r,
      player: p.player,
      playerId: p.playerId,
      club: p.club,
      agent: p.agent
    }))
  );
}

export default function BlockchainTalentVerification() {
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newEntry, setNewEntry] = useState({ player: "", playerId: "", club: "", agent: "", type: "Transfer", ref: "", signer1: "", signer2: "" });
  const [selected, setSelected] = useState(null); // record-level
  const [passport, setPassport] = useState(null); // player-level
  const [auditExpand, setAuditExpand] = useState(false);

  // Filter records by search
  const records = flattenRecords(ALL_PLAYERS).filter(
    r =>
      r.player.toLowerCase().includes(search.toLowerCase()) ||
      r.playerId.toLowerCase().includes(search.toLowerCase()) ||
      r.club.toLowerCase().includes(search.toLowerCase()) ||
      r.agent.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.hash.toLowerCase().includes(search.toLowerCase())
  );

  // Add new record
  function handleAdd() {
    if (!newEntry.player || !newEntry.club) return;
    let playerObj = ALL_PLAYERS.find(p => p.playerId === newEntry.playerId);
    const record = {
      type: newEntry.type,
      ref: newEntry.ref,
      hash: "0x" + Math.random().toString(16).slice(2, 10) + "...abcd",
      date: new Date().toISOString().slice(0, 10),
      signers: [newEntry.signer1, newEntry.signer2].filter(Boolean),
      status: "Pending",
      aiRisk: 3,
      notes: "Awaiting signatures"
    };
    if (playerObj) {
      playerObj.records.unshift(record);
    } else {
      ALL_PLAYERS.unshift({
        player: newEntry.player,
        playerId: newEntry.playerId || "FIBA" + Math.floor(Math.random() * 9999999),
        club: newEntry.club,
        agent: newEntry.agent,
        records: [record]
      });
    }
    setAddMode(false);
    setNewEntry({ player: "", playerId: "", club: "", agent: "", type: "Transfer", ref: "", signer1: "", signer2: "" });
  }

  // PDF Talent Passport Export
  const handleExportPDF = (player) => {
    setTimeout(() => {
      const el = document.getElementById("btv-passport");
      if (el) html2pdf().from(el).set({ margin: 0.4, filename: `TalentPassport_${player.player}.pdf` }).save();
    }, 130);
  };

  // Risk Analytics Data
  const riskBars = ALL_PLAYERS.map(p => ({
    player: p.player,
    risk: Math.max(...p.records.map(r => r.aiRisk))
  }));

  return (
    <div className="btv-main">
      <div className="btv-header">
        <FaRocket style={{ color: "#27ef7d", fontSize: 30, marginRight: 10 }} />
        <div>
          <div className="btv-title">Blockchain Talent Verification</div>
          <div className="btv-desc">World’s first: Every contract, endorsement, and milestone. Immutable. Shareable. Trusted.</div>
        </div>
        <button className="btv-add-btn" onClick={() => setAddMode(true)}><FaPlus style={{ marginRight: 7 }} />Verify Talent</button>
      </div>
      <div className="btv-meta">
        <div>Total Records: <b>{records.length}</b></div>
        <div>
          <FaFilePdf style={{ color: "#FFD700", marginRight: 5 }} />
          <FaFileCsv style={{ color: "#27ef7d", marginRight: 5 }} />
        </div>
      </div>
      <div className="btv-filter-bar">
        <FaSearch />
        <input className="btv-search" value={search} placeholder="Search name, club, FIBA ID, hash, event…" onChange={e => setSearch(e.target.value)} />
        <div style={{ marginLeft: "auto" }}>
          <button className="btv-table-open" style={{ background: "#00B4D8", color: "#fff" }} onClick={() => setPassport(null)}>All Talent Passports</button>
        </div>
      </div>
      {/* Risk Bar */}
      <div style={{ height: 120, margin: "14px 0 30px 0", background: "#222c", borderRadius: 13, padding: 10 }}>
        <ResponsiveBar
          data={riskBars}
          keys={["risk"]}
          indexBy="player"
          margin={{ top: 30, right: 40, bottom: 35, left: 55 }}
          colors={({ data }) => data.risk >= 6 ? "#e94057" : data.risk >= 3 ? "#FFD700" : "#27ef7d"}
          axisBottom={{ tickSize: 8, tickPadding: 7, tickRotation: 0, legend: "", legendOffset: 22, legendPosition: "middle" }}
          axisLeft={{ tickSize: 7, tickPadding: 5, tickRotation: 0, legend: "AI Risk", legendOffset: -38, legendPosition: "middle" }}
          labelSkipWidth={14}
          labelSkipHeight={12}
          labelTextColor="#fff"
          enableGridY
        />
      </div>

      {/* Table */}
      <div className="btv-table">
        <div className="btv-table-header">
          <span>Player</span>
          <span>FIBA ID</span>
          <span>Club</span>
          <span>Agent</span>
          <span>Type</span>
          <span>Reference</span>
          <span>Date</span>
          <span>Status</span>
          <span>AI Risk</span>
          <span>Open</span>
          <span>Passport</span>
        </div>
        {records.map((r, idx) => (
          <motion.div className="btv-table-row" key={idx} whileHover={{ scale: 1.01, boxShadow: "0 2px 22px #FFD70033" }}>
            <span style={{ fontWeight: 900, color: "#FFD700" }}>{r.player}</span>
            <span>{r.playerId}</span>
            <span>{r.club}</span>
            <span>{r.agent}</span>
            <span>{r.type}</span>
            <span>{r.ref}</span>
            <span>{r.date}</span>
            <span>
              <span className="btv-chip" style={{ background: STATUS_COLOR[r.status], color: r.status === "Flagged" ? "#fff" : "#222" }}>{r.status}</span>
            </span>
            <span>
              <span style={{ color: r.aiRisk >= 6 ? "#e94057" : r.aiRisk >= 3 ? "#FFD700" : "#27ef7d", fontWeight: 800 }}>{r.aiRisk}</span>
            </span>
            <span>
              <button className="btv-table-open" onClick={() => setSelected(r)}><FaEye /></button>
            </span>
            <span>
              <button className="btv-table-open" style={{ background: "#FFD700", color: "#232a2e" }} onClick={() => setPassport(r.playerId)}>Passport</button>
            </span>
          </motion.div>
        ))}
        {records.length === 0 && <div style={{ color: "#FFD700", padding: 32, fontWeight: 900 }}>No records found.</div>}
      </div>

      {/* Modal: Add */}
      <AnimatePresence>
        {addMode && (
          <motion.div className="btv-modal"
            initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ duration: 0.34 }}>
            <div className="btv-modal-title"><FaPlus style={{ marginRight: 8 }} />Verify Talent</div>
            <input placeholder="Player Name" value={newEntry.player} onChange={e => setNewEntry({ ...newEntry, player: e.target.value })} />
            <input placeholder="FIBA Player ID" value={newEntry.playerId} onChange={e => setNewEntry({ ...newEntry, playerId: e.target.value })} />
            <input placeholder="Club" value={newEntry.club} onChange={e => setNewEntry({ ...newEntry, club: e.target.value })} />
            <input placeholder="Agent" value={newEntry.agent} onChange={e => setNewEntry({ ...newEntry, agent: e.target.value })} />
            <select value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
              <option>Transfer</option>
              <option>Milestone</option>
              <option>Endorsement</option>
              <option>Contract</option>
            </select>
            <input placeholder="Reference (contract, event…)" value={newEntry.ref} onChange={e => setNewEntry({ ...newEntry, ref: e.target.value })} />
            <input placeholder="Signer 1" value={newEntry.signer1} onChange={e => setNewEntry({ ...newEntry, signer1: e.target.value })} />
            <input placeholder="Signer 2" value={newEntry.signer2} onChange={e => setNewEntry({ ...newEntry, signer2: e.target.value })} />
            <div style={{ marginTop: 14 }}>
              <button className="btv-add-btn" onClick={handleAdd}><FaCheckCircle style={{ marginRight: 6 }} /> Add Verification</button>
              <button className="btv-cancel-btn" onClick={() => setAddMode(false)}><span style={{ marginRight: 6 }}>✕</span> Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Detail (record) */}
      <AnimatePresence>
        {selected && (
          <motion.div className="btv-modal"
            initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ duration: 0.33 }}>
            <div className="btv-modal-title"><FaBarcode style={{ marginRight: 9 }} />Verification Detail</div>
            <div className="btv-detail-row"><b>Player:</b> {selected.player}</div>
            <div className="btv-detail-row"><b>FIBA ID:</b> {selected.playerId}</div>
            <div className="btv-detail-row"><b>Club:</b> {selected.club}</div>
            <div className="btv-detail-row"><b>Agent:</b> {selected.agent}</div>
            <div className="btv-detail-row"><b>Type:</b> {selected.type}</div>
            <div className="btv-detail-row"><b>Reference:</b> {selected.ref}</div>
            <div className="btv-detail-row"><b>Status:</b> <span className="btv-chip" style={{ background: STATUS_COLOR[selected.status], color: selected.status === "Flagged" ? "#fff" : "#222" }}>{selected.status}</span></div>
            <div className="btv-detail-row"><b>Date:</b> {selected.date}</div>
            <div className="btv-detail-row"><b>Hash:</b> <span style={{ fontSize: 14, fontFamily: "monospace", color: "#27ef7d" }}>{selected.hash}</span> <button className="btv-table-open" onClick={() => { navigator.clipboard.writeText(selected.hash); }}>Copy</button></div>
            <div className="btv-detail-row"><b>Signers:</b> {selected.signers.join(", ")}</div>
            {selected.notes && <div className="btv-detail-row" style={{ color: "#FFD700" }}><FaExclamationTriangle style={{ marginRight: 6 }} /> {selected.notes}</div>}
            <div style={{ marginTop: 18 }}>
              <button className="btv-cancel-btn" onClick={() => setSelected(null)}><span style={{ marginRight: 7 }}>✕</span> Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Talent Passport */}
      <AnimatePresence>
        {passport && (
          <motion.div className="btv-modal" id="btv-passport"
            initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ duration: 0.34 }}>
            <div className="btv-modal-title"><FaBarcode style={{ marginRight: 9 }} />Talent Passport</div>
            {ALL_PLAYERS.filter(p => p.playerId === passport).map(player => (
              <div key={player.playerId}>
                <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 22 }}>{player.player}</div>
                <div>FIBA ID: <b>{player.playerId}</b></div>
                <div>Current Club: <b>{player.club}</b></div>
                <div>Agent: <b>{player.agent}</b></div>
                <div style={{ margin: "12px 0" }}>
                  <QRCodeSVG value={player.playerId} size={78} fgColor="#232a2e" bgColor="#FFD700" />
                </div>
                <div><b>Full Blockchain Timeline:</b></div>
                <div style={{ marginTop: 9 }}>
                  {player.records.map((rec, idx) => (
                    <div key={idx} className="btv-audit-card">
                      <b>{rec.date}:</b> {rec.type} ({rec.ref}) — <span style={{ fontFamily: "monospace", color: "#27ef7d" }}>{rec.hash}</span>
                      <div>Status: <span className="btv-chip" style={{ background: STATUS_COLOR[rec.status], color: rec.status === "Flagged" ? "#fff" : "#222" }}>{rec.status}</span>
                        {" "}AI Risk: <span style={{ color: rec.aiRisk >= 6 ? "#e94057" : rec.aiRisk >= 3 ? "#FFD700" : "#27ef7d" }}>{rec.aiRisk}</span>
                      </div>
                      <div>Signers: {rec.signers.join(", ")}</div>
                      {rec.notes && <div style={{ color: "#FFD700", fontWeight: 700 }}>{rec.notes}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 22 }}>
                  <button className="btv-table-open" style={{ background: "#FFD700", color: "#232a2e" }} onClick={() => handleExportPDF(player)}><FaFilePdf style={{ marginRight: 7 }} /> Export PDF</button>
                  <button className="btv-cancel-btn" style={{ marginLeft: 8 }} onClick={() => setPassport(null)}>Close</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
