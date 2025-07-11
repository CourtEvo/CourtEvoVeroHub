import React, { useState } from "react";
import {
  FaLock, FaUnlock, FaImage, FaFileContract, FaVideo, FaUsers, FaExclamationTriangle, FaEuroSign, FaFileExport, FaCalendarAlt, FaClipboardCheck, FaUpload, FaPlus, FaEdit, FaTrash, FaSearch, FaUserTie, FaBolt, FaHandshake, FaCheckCircle, FaShareAlt
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DEFAULT_ASSETS = [
  {
    id: 1, type: "Logo", name: "Main Club Logo", owner: "Club Board", sharedWith: ["Nike"], rights: "Full", status: "Sponsor Use OK", expiry: "2026-12-31",
    usage: ["2024-06-01: Used in media day", "2024-06-12: Sent to sponsor"], legal: [{ event: "Approved", date: "2024-01-10" }], risk: "", commercial: "Ready", notes: "No current legal issues"
  },
  {
    id: 2, type: "Image", name: "Athlete Portrait - Ivan Radic", owner: "Agent", sharedWith: ["Club"], rights: "Time-limited", status: "Legal Review", expiry: "2024-07-01",
    usage: ["2024-05-30: Used in sponsor proposal"], legal: [{ event: "License expiring soon", date: "2024-06-20" }], risk: "Expiry in 14 days", commercial: "Sponsor Potential", notes: "Need new contract with agent"
  },
  {
    id: 3, type: "Video", name: "Promo - Youth Academy", owner: "Club Board", sharedWith: ["Media Partner"], rights: "Full", status: "Boardroom Ready", expiry: "2027-02-10",
    usage: ["2024-06-11: Used for community campaign"], legal: [{ event: "Approved", date: "2024-02-05" }], risk: "", commercial: "Untapped", notes: "New version in edit"
  },
  {
    id: 4, type: "Contract", name: "Sponsor Rights Pack 2025", owner: "Legal", sharedWith: ["Sponsor"], rights: "Full", status: "Sponsor Use OK", expiry: "2025-12-31",
    usage: ["2024-06-10: Sent to legal"], legal: [{ event: "Board approved", date: "2024-06-12" }], risk: "", commercial: "Active", notes: ""
  }
];

const STATUS_COLOR = {
  "Sponsor Use OK": "#1de682",
  "Boardroom Ready": "#FFD700",
  "Legal Review": "#FFD700",
  "Expired": "#ff4848"
};

const COMMERCIAL_BADGE = {
  "Ready": "#1de682",
  "Sponsor Potential": "#FFD700",
  "Active": "#1de682",
  "Untapped": "#FFD700"
};

function aiRisk(asset) {
  if (asset.risk) return `⚠️ ${asset.risk}`;
  if (asset.expiry && new Date(asset.expiry) < new Date()) return "⚠️ Expired";
  if (asset.status === "Legal Review") return "Needs legal clearance";
  return "";
}
function aiCommercial(asset) {
  if (asset.commercial === "Sponsor Potential" || asset.commercial === "Untapped") return "Activate in sponsor decks/campaigns.";
  if (asset.commercial === "Ready" || asset.commercial === "Active") return "In use. Monitor for overexposure.";
  return "";
}

// Timeline SVG for asset
function AssetTimeline({ usage = [], legal = [], expiry }) {
  let events = [
    ...legal.map(ev => ({ date: ev.date, type: "Legal", txt: ev.event })),
    ...usage.map(u => {
      let [date, txt] = u.split(": ");
      return { date, type: "Usage", txt };
    })
  ];
  if (expiry) events.push({ date: expiry, type: "Expiry", txt: "Expiry" });
  events = events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <svg width={260} height={48}>
      {events.map((e, i) => (
        <g key={i}>
          <circle cx={34 + i * 38} cy={24} r={11} fill={e.type === "Legal" ? "#FFD700" : e.type === "Usage" ? "#1de682" : "#ff4848"} />
          <text x={34 + i * 38} y={30} fill="#232a2e" fontWeight={800} fontSize={11} textAnchor="middle">{e.type[0]}</text>
          <text x={34 + i * 38} y={44} fill="#FFD700" fontWeight={500} fontSize={10} textAnchor="middle">{e.date.slice(5)}</text>
        </g>
      ))}
    </svg>
  );
}

const DigitalAssetIPManagementSuite = () => {
  const [assets, setAssets] = useState([...DEFAULT_ASSETS]);
  const [addMode, setAddMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [log, setLog] = useState([{ txt: "Asset audit complete. Ivan Radic image needs license renewal.", by: "AI", date: "2024-06-13" }]);
  const [logText, setLogText] = useState("");
  const [exporting, setExporting] = useState(false);

  // CRUD
  const addAsset = (asset = null) => {
    if (asset) {
      setAssets([...assets, { ...asset, id: assets.length ? Math.max(...assets.map(a => a.id)) + 1 : 1 }]);
    } else {
      setAssets([...assets, { ...newAsset, id: assets.length ? Math.max(...assets.map(a => a.id)) + 1 : 1 }]);
      setAddMode(false);
    }
    setNewAsset({ ...DEFAULT_ASSETS[0], name: "", file: "", usage: [], legal: [], risk: "", notes: "" });
  };
  const removeAsset = id => setAssets(assets.filter(a => a.id !== id));
  const addUsage = (id, use) => setAssets(assets.map(a => a.id === id ? { ...a, usage: [...a.usage, use] } : a));
  const [newAsset, setNewAsset] = useState({ ...DEFAULT_ASSETS[0], name: "", file: "", usage: [], legal: [], risk: "", notes: "" });

  // Bulk add (simulate)
  const handleBulkUpload = () => {
    // In demo, just add 2 sample assets
    addAsset({
      type: "Video", name: "Coach Introduction", owner: "Board", sharedWith: ["Media"], rights: "Full", status: "Legal Review", expiry: "2025-01-01",
      usage: [], legal: [{ event: "Submitted", date: "2024-06-15" }], risk: "", commercial: "Untapped", notes: "New upload"
    });
    addAsset({
      type: "Image", name: "Academy Banner", owner: "Media Dept", sharedWith: ["Sponsors"], rights: "Full", status: "Sponsor Use OK", expiry: "2026-08-20",
      usage: [], legal: [{ event: "Approved", date: "2024-06-10" }], risk: "", commercial: "Sponsor Potential", notes: "For 2025 sponsor pack"
    });
    setBulkMode(false);
  };

  // Export
  const exportAssets = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2100);
  };

  // Smart filtering
  const filteredAssets = assets.filter(a => {
    if (!filter) return true;
    return (
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.type.toLowerCase().includes(filter.toLowerCase()) ||
      a.status.toLowerCase().includes(filter.toLowerCase()) ||
      a.commercial.toLowerCase().includes(filter.toLowerCase()) ||
      (a.owner && a.owner.toLowerCase().includes(filter.toLowerCase())) ||
      (a.risk && a.risk.toLowerCase().includes(filter.toLowerCase()))
    );
  });

  // Alerts
  const expiringSoon = assets.filter(a => a.expiry && (new Date(a.expiry) - new Date() < 1000 * 60 * 60 * 24 * 30) && (new Date(a.expiry) - new Date() > 0)).length;
  const legalRisk = assets.filter(a => a.status === "Legal Review" || aiRisk(a)).length;
  const sponsorReady = assets.filter(a => a.commercial === "Sponsor Potential" || a.commercial === "Untapped").length;

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 30,
      padding: 33, boxShadow: "0 8px 64px #FFD70055", maxWidth: 1850, margin: "0 auto"
    }}>
      {/* Alerts center */}
      <div style={{ display: "flex", gap: 30, marginBottom: 12 }}>
        <div style={{
          background: "#FFD70022", borderRadius: 16, padding: "9px 23px", color: "#FFD700", fontWeight: 800, fontSize: 17
        }}>
          <FaCalendarAlt /> Expiring soon: {expiringSoon}
        </div>
        <div style={{
          background: "#ff484822", borderRadius: 16, padding: "9px 23px", color: "#ff4848", fontWeight: 800, fontSize: 17
        }}>
          <FaExclamationTriangle /> At legal risk: {legalRisk}
        </div>
        <div style={{
          background: "#1de68222", borderRadius: 16, padding: "9px 23px", color: "#1de682", fontWeight: 800, fontSize: 17
        }}>
          <FaHandshake /> Sponsor opportunity: {sponsorReady}
        </div>
      </div>
      {/* Dashboard header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
        <FaLock size={38} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 33, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Digital Asset & IP Management Suite
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 800, borderRadius: 17,
          padding: '8px 28px', fontSize: 18, marginLeft: 18, boxShadow: '0 2px 10px #FFD70044'
        }}>
          CourtEvo Vero | IP Vault
        </span>
        <button onClick={exportAssets} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 17, padding: "11px 26px", marginLeft: 13
        }}>
          <FaFileExport style={{ marginRight: 8 }} /> Export PDF/CSV
        </button>
      </div>
      {/* Smart search */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 19 }}>
        <FaSearch style={{ color: "#FFD700", fontSize: 21 }} />
        <input value={filter} placeholder="Filter by name, type, status, owner, risk..." onChange={e => setFilter(e.target.value)} style={inputStyleFull} />
        <button onClick={() => setBulkMode(true)} style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 15, padding: "9px 23px", fontSize: 17
        }}>
          <FaUpload style={{ marginRight: 6 }} /> Bulk Upload
        </button>
      </div>
      {/* Asset grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 24, marginBottom: 27
      }}>
        {filteredAssets.map((a, i) => (
          <div key={a.id} style={{
            background: "#232a2e", borderRadius: 18, boxShadow: "0 2px 18px #FFD70022",
            padding: 22, position: "relative", border: `3px solid ${STATUS_COLOR[a.status] || "#FFD700"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {a.type === "Logo" && <FaImage size={27} color="#FFD700" />}
              {a.type === "Image" && <FaUsers size={27} color="#1de682" />}
              {a.type === "Video" && <FaVideo size={27} color="#FFD700" />}
              {a.type === "Contract" && <FaFileContract size={27} color="#1de682" />}
              <b style={{ fontSize: 20, color: "#fff" }}>{a.name}</b>
              <span style={{
                background: STATUS_COLOR[a.status], color: "#232a2e", fontWeight: 800,
                borderRadius: 8, padding: '3px 13px', fontSize: 13, marginLeft: 7
              }}>{a.status}</span>
            </div>
            <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 800 }}>
              <FaUserTie /> {a.owner}
            </div>
            <div style={{ marginTop: 7, color: "#1de682", fontWeight: 800, fontSize: 14 }}>
              <FaShareAlt /> {a.sharedWith?.join(", ")}
            </div>
            <div style={{ marginTop: 7, color: "#FFD700" }}>
              Rights: <b>{a.rights}</b>
            </div>
            <div style={{ marginTop: 7, color: COMMERCIAL_BADGE[a.commercial], fontWeight: 700 }}>
              <FaEuroSign style={{ marginRight: 4 }} /> {a.commercial}
            </div>
            <div style={{ fontSize: 13, color: "#FFD700" }}>
              Expiry: <FaCalendarAlt style={{ marginLeft: 2, marginRight: 2 }} /> {a.expiry || "N/A"}
            </div>
            <div style={{ fontSize: 13, color: "#FFD700" }}>{aiRisk(a)}</div>
            <div style={{ fontSize: 13, color: "#FFD70099" }}>{a.notes}</div>
            {/* Timeline */}
            <div style={{ marginTop: 9 }}><AssetTimeline usage={a.usage} legal={a.legal} expiry={a.expiry} /></div>
            <div style={{ marginTop: 10 }}>
              <button onClick={() => setSelected(a.id)} style={{
                ...btnStyle, background: "#FFD700", color: "#232a2e"
              }}>
                <FaClipboardCheck style={{ marginRight: 5 }} /> Details
              </button>
              <button onClick={() => removeAsset(a.id)} style={{
                ...btnStyle, background: "#ff4848", color: "#fff"
              }}>
                <FaTrash style={{ marginRight: 5 }} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Asset detail drawer */}
      {selected && (() => {
        const a = assets.find(x => x.id === selected);
        if (!a) return null;
        return (
          <div style={{
            background: "#232a2e", borderRadius: 22, boxShadow: "0 4px 48px #FFD70033",
            padding: 33, marginBottom: 25, display: "flex", gap: 35
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                {a.type === "Logo" && <FaImage style={{ fontSize: 38, color: "#FFD700" }} />}
                {a.type === "Image" && <FaUsers style={{ fontSize: 38, color: "#1de682" }} />}
                {a.type === "Video" && <FaVideo style={{ fontSize: 38, color: "#FFD700" }} />}
                {a.type === "Contract" && <FaFileContract style={{ fontSize: 38, color: "#1de682" }} />}
                <span style={{ fontWeight: 900, fontSize: 26, color: "#fff" }}>{a.name}</span>
                <span style={{
                  background: STATUS_COLOR[a.status], color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '5px 13px', fontSize: 17, marginLeft: 12
                }}>
                  {a.status}
                </span>
              </div>
              <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 800 }}>
                <FaUserTie /> {a.owner}
              </div>
              <div style={{ marginTop: 7, color: "#1de682", fontWeight: 800, fontSize: 14 }}>
                <FaShareAlt /> {a.sharedWith?.join(", ")}
              </div>
              <div style={{ marginTop: 7, color: "#FFD700" }}>
                Rights: <b>{a.rights}</b>
              </div>
              <div style={{ marginTop: 7, color: COMMERCIAL_BADGE[a.commercial], fontWeight: 700 }}>
                <FaEuroSign style={{ marginRight: 6 }} /> {a.commercial}
              </div>
              <div style={{ marginTop: 7, color: "#FFD700" }}>
                Expiry: {a.expiry || "N/A"}
              </div>
              <div style={{ marginTop: 7, color: "#FFD700" }}>
                {aiRisk(a)}
              </div>
              <div style={{ marginTop: 7, color: "#FFD700" }}>
                {aiCommercial(a)}
              </div>
              {/* Timeline */}
              <div style={{ marginTop: 13 }}>
                <AssetTimeline usage={a.usage} legal={a.legal} expiry={a.expiry} />
              </div>
              <div style={{ marginTop: 12 }}>
                <b>Usage Timeline:</b>
                <ul>
                  {(a.usage || []).map((e, j) =>
                    <li key={j}><FaCalendarAlt style={{ color: "#FFD700", marginRight: 4 }} /> {e}</li>
                  )}
                </ul>
                <button
                  onClick={() => {
                    let use = prompt("Describe new usage (e.g. '2024-06-15: Used in sponsor deck'):");
                    if (use) addUsage(a.id, use);
                  }}
                  style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 15, marginTop: 3 }}>
                  <FaPlus /> Add Usage
                </button>
              </div>
              <div style={{ marginTop: 13 }}>
                <b>Legal Events:</b>
                <ul>
                  {(a.legal || []).map((ev, j) =>
                    <li key={j}><FaClipboardCheck style={{ color: "#FFD700", marginRight: 4 }} /> {ev.event} ({ev.date})</li>
                  )}
                </ul>
              </div>
              <div style={{ marginTop: 13 }}>
                <b>Notes:</b> <span style={{ color: "#fff" }}>{a.notes}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{
                ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 18, marginTop: 17
              }}>
                Close
              </button>
            </div>
            {/* Rights/Risk Map (mini-table) */}
            <div style={{
              flex: 1, background: "#FFD70011", borderRadius: 18, padding: 22, marginLeft: 20
            }}>
              <b style={{ color: "#FFD700", fontSize: 18 }}>Rights Map & Commercial Radar</b>
              <table style={{ width: "98%", marginTop: 14, fontSize: 15 }}>
                <thead>
                  <tr>
                    <th>Holder</th>
                    <th>Rights</th>
                    <th>Shared With</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{a.owner}</td>
                    <td>{a.rights}</td>
                    <td>{a.sharedWith?.join(", ")}</td>
                    <td style={{ color: STATUS_COLOR[a.status], fontWeight: 700 }}>{a.status}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 18, color: "#FFD700", fontWeight: 700 }}>
                {aiCommercial(a)}
              </div>
            </div>
          </div>
        );
      })()}
      {/* Add/bulk asset */}
      <button onClick={() => setAddMode(a => !a)} style={{
        position: "fixed", bottom: 80, borderLeft: 100, background: "#FFD700", color: "#232a2e",
        border: "none", borderRadius: 35, width: 64, height: 64, fontWeight: 900, fontSize: 35, boxShadow: "0 2px 22px #FFD70044", zIndex: 40
      }}>
        <FaPlus />
      </button>
      <button onClick={() => setBulkMode(true)} style={{
        position: "fixed", bottom: 20, borderLeft: 39, background: "#FFD700", color: "#232a2e",
        border: "none", borderRadius: 35, width: 64, height: 64, fontWeight: 900, fontSize: 33, boxShadow: "0 2px 22px #FFD70044", zIndex: 40
      }}>
        <FaUpload />
      </button>
      {addMode &&
        <div style={{
          position: "fixed", bottom: 120, right: 102, background: "#232a2e", borderRadius: 17,
          boxShadow: "0 8px 36px #FFD70044", padding: 28, zIndex: 1000
        }}>
          <h3 style={{ color: "#FFD700", marginTop: 0 }}>Add Asset</h3>
          <select value={newAsset.type} onChange={e => setNewAsset({ ...newAsset, type: e.target.value })} style={inputStyleMini}>
            <option>Logo</option><option>Image</option><option>Video</option><option>Contract</option>
          </select>
          <input value={newAsset.name} placeholder="Asset Name" onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} style={inputStyle} />
          <input value={newAsset.owner} placeholder="Rights Holder" onChange={e => setNewAsset({ ...newAsset, owner: e.target.value })} style={inputStyleMini} />
          <input value={newAsset.file} placeholder="File Path/URL" onChange={e => setNewAsset({ ...newAsset, file: e.target.value })} style={inputStyleMini} />
          <select value={newAsset.status} onChange={e => setNewAsset({ ...newAsset, status: e.target.value })} style={inputStyleMini}>
            <option>Legal Review</option><option>Boardroom Ready</option><option>Sponsor Use OK</option><option>Expired</option>
          </select>
          <input value={newAsset.expiry} placeholder="Expiry (YYYY-MM-DD)" onChange={e => setNewAsset({ ...newAsset, expiry: e.target.value })} style={inputStyleMini} />
          <input value={newAsset.rights} placeholder="Rights (Full/Time-limited)" onChange={e => setNewAsset({ ...newAsset, rights: e.target.value })} style={inputStyleMini} />
          <input value={newAsset.sharedWith} placeholder="Shared With (comma separated)" onChange={e => setNewAsset({ ...newAsset, sharedWith: e.target.value.split(",") })} style={inputStyleMini} />
          <select value={newAsset.commercial} onChange={e => setNewAsset({ ...newAsset, commercial: e.target.value })} style={inputStyleMini}>
            <option>Ready</option><option>Sponsor Potential</option><option>Active</option><option>Untapped</option>
          </select>
          <input value={newAsset.notes} placeholder="Notes" onChange={e => setNewAsset({ ...newAsset, notes: e.target.value })} style={inputStyle} />
          <button onClick={() => addAsset()} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 13 }}>
            <FaPlus /> Add
          </button>
        </div>
      }
      {bulkMode &&
        <div style={{
          position: "fixed", bottom: 120, right: 42, background: "#232a2e", borderRadius: 17,
          boxShadow: "0 8px 36px #FFD70044", padding: 28, zIndex: 1000
        }}>
          <h3 style={{ color: "#FFD700", marginTop: 0 }}>Bulk Upload</h3>
          <p style={{ color: "#FFD70099" }}>Simulates drag & drop of multiple files (in demo, adds 2 new assets).</p>
          <button onClick={handleBulkUpload} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>
            <FaUpload style={{ marginRight: 6 }} /> Upload
          </button>
          <button onClick={() => setBulkMode(false)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", marginLeft: 13 }}>
            Cancel
          </button>
        </div>
      }
      {/* Boardroom log */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "24px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}><FaClipboardCheck style={{ marginRight: 7 }} /> Asset Boardroom Log</b>
        <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 15, marginBottom: 8 }}>
          {log.map((c, i) =>
            <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span></div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={logText} placeholder="Add log or note..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
          <button onClick={() => {
            setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]); setLogText("");
          }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, width: 120
};
const inputStyleFull = {
  ...inputStyle, width: 240
};
const inputStyleMini = {
  ...inputStyle, width: 86, fontSize: 14
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "8px 15px", marginRight: 6, cursor: "pointer"
};

export default DigitalAssetIPManagementSuite;
