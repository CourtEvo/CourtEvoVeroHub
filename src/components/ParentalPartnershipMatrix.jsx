import React, { useState } from "react";
import {
  FaUsers,
  FaUserTie,
  FaCarSide,
  FaEuroSign,
  FaHandsHelping,
  FaMedal,
  FaStar,
  FaBullhorn,
  FaUserCheck,
  FaUserClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHandHoldingHeart,
  FaChartPie,
  FaChartBar,
  FaTools,
  FaCogs,
} from "react-icons/fa";

// Demo parent data: Each parent brings an "asset"
const parents = [
  {
    id: "P001",
    name: "Marko Sr.",
    assets: ["Transport", "Events", "Project Management"],
    impact: 90,
    engagement: 85,
    upskilled: ["First Aid"],
    confidential: false,
    badges: ["Event Leader"],
  },
  {
    id: "P002",
    name: "Dino Dad",
    assets: ["Sponsorship", "Legal Advice"],
    impact: 60,
    engagement: 40,
    upskilled: [],
    confidential: false,
    badges: [],
  },
  {
    id: "P003",
    name: "Juric Parent",
    assets: ["Transport", "Volunteering"],
    impact: 45,
    engagement: 60,
    upskilled: ["First Aid", "Fundraising"],
    confidential: false,
    badges: ["Fundraiser"],
  },
  {
    id: "P004",
    name: "Simic Dad",
    assets: [],
    impact: 0,
    engagement: 5,
    upskilled: [],
    confidential: true,
    badges: [],
  },
];

const assetIcons = {
  Transport: <FaCarSide />,
  Events: <FaBullhorn />,
  "Project Management": <FaCogs />,
  Sponsorship: <FaEuroSign />,
  "Legal Advice": <FaUserTie />,
  Volunteering: <FaHandsHelping />,
  "First Aid": <FaHandHoldingHeart />,
  Fundraising: <FaChartPie />,
};

const upskillingOptions = ["First Aid", "Fundraising", "Event Leadership", "Club Culture"];

function getAssetColor(asset) {
  switch (asset) {
    case "Transport": return "#FFD700";
    case "Events": return "#1de682";
    case "Project Management": return "#FFD700";
    case "Sponsorship": return "#ff6b6b";
    case "Legal Advice": return "#FFD700";
    case "Volunteering": return "#1de682";
    case "First Aid": return "#FFD700";
    case "Fundraising": return "#FFD700";
    default: return "#283E51";
  }
}

function getEngagementBadge(e) {
  if (e >= 75) return <span style={{ color: "#1de682", fontWeight: 700 }}><FaCheckCircle /> Key Asset</span>;
  if (e >= 30) return <span style={{ color: "#FFD700", fontWeight: 700 }}><FaUserClock /> Supporter</span>;
  return <span style={{ color: "#ff6b6b", fontWeight: 700 }}><FaExclamationTriangle /> Dormant</span>;
}

export default function ParentalPartnershipMatrix() {
  const [selected, setSelected] = useState(parents[0]);
  const [assignedUpskill, setAssignedUpskill] = useState({});
  const [showAssetBreakdown, setShowAssetBreakdown] = useState(false);

  // Calculate asset pool leverage
  const totalImpact = parents.reduce((a, p) => a + (p.confidential ? 0 : p.impact), 0);
  const maxImpact = parents.length * 100;
  const leverage = ((totalImpact / maxImpact) * 100).toFixed(1);

  // Asset class breakdown
  const assetTypes = [
    "Transport", "Events", "Project Management", "Sponsorship", "Legal Advice", "Volunteering", "First Aid", "Fundraising"
  ];
  const assetBreakdown = assetTypes.map(type => ({
    type,
    count: parents.filter(p => !p.confidential && p.assets.includes(type)).length
  }));

  // Find match for club needs
  function findPartners(need) {
    return parents.filter(
      p => !p.confidential && p.assets.includes(need)
    );
  }

  // Assign upskilling
  function assignUpskill(p, upskill) {
    if (!upskill) return;
    p.upskilled.push(upskill);
    setAssignedUpskill(u => ({ ...u, [p.id]: upskill }));
  }

  // Filter for engagement “hot zones”
  const hotZones = parents.filter(p => !p.confidential && p.engagement < 30);

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
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaUsers size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            PARENTAL PARTNERSHIP MATRIX
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Turn every parent into a club asset. Boys only.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          fontWeight: 700,
          background: "#FFD700",
          color: "#232a2e",
          borderRadius: 12,
          padding: "10px 22px",
          fontSize: 17,
          boxShadow: "0 2px 12px 0 #2a2d31",
          minWidth: 195,
          textAlign: "center"
        }}>
          Boardroom Leverage Meter: <span style={{ color: leverage > 60 ? "#1de682" : "#FFD700" }}>{leverage}%</span>
        </div>
      </div>

      {/* Asset Map */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Asset/Parent "network" */}
        <div style={{ minWidth: 345, maxWidth: 420, background: "#283E51", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 9 }}>
            Parent Asset Map
          </div>
          {/* Simulated "network" - just a creative list for now */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {parents.filter(p => !p.confidential).map(p => (
              <div
                key={p.id}
                style={{
                  background: selected.id === p.id ? "#FFD700" : "#232a2e",
                  color: selected.id === p.id ? "#232a2e" : "#FFD700",
                  borderRadius: 12,
                  padding: "11px 19px",
                  minWidth: 120,
                  textAlign: "center",
                  boxShadow: "0 2px 10px 0 #111315",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  border: "2.5px solid #FFD700",
                  opacity: p.engagement < 30 ? 0.7 : 1,
                  marginBottom: 7,
                }}
                onClick={() => setSelected(p)}
                title={p.name}
              >
                {p.name}
                <div style={{ fontWeight: 600, fontSize: 12, marginTop: 3 }}>
                  {p.assets.map(a => (
                    <span key={a} style={{ margin: "0 4px", color: getAssetColor(a) }}>{assetIcons[a]}</span>
                  ))}
                </div>
                <div style={{ marginTop: 3, fontSize: 13 }}>{getEngagementBadge(p.engagement)}</div>
                <div style={{ marginTop: 2 }}>
                  {p.badges.map(b => <span key={b} style={{ color: "#FFD700", fontSize: 13, marginRight: 4 }}><FaMedal /> {b}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile & Upskilling */}
        <div style={{ minWidth: 295, maxWidth: 360 }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "15px 17px 10px 17px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 15 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 7, fontSize: 16 }}>
              Parent Profile & Upskilling
            </div>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15 }}>{selected.name}</div>
            <div style={{ color: "#FFD700", marginTop: 2 }}>
              {selected.assets.length ? selected.assets.join(", ") : <span style={{ color: "#ff6b6b" }}>No declared assets</span>}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>Engagement:</span> {selected.engagement} / 100
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>Impact:</span> {selected.impact} / 100
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>Upskilled:</span> {selected.upskilled.length ? selected.upskilled.join(", ") : "None"}
            </div>
            <div style={{ marginTop: 7 }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>Assign Upskilling:</span>
              <select
                value={assignedUpskill[selected.id] || ""}
                onChange={e => assignUpskill(selected, e.target.value)}
                style={{ borderRadius: 7, padding: "5px 12px", fontFamily: "Segoe UI", marginLeft: 6, marginTop: 3 }}
              >
                <option value="">Select...</option>
                {upskillingOptions.filter(u => !selected.upskilled.includes(u)).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>Badges:</span>
              {selected.badges.length ? selected.badges.map(b => <span key={b} style={{ marginLeft: 6, color: "#FFD700" }}><FaMedal /> {b}</span>) : <span style={{ color: "#FFD700" }}> None</span>}
            </div>
            {selected.confidential &&
              <div style={{ marginTop: 10, color: "#ff6b6b", fontWeight: 700 }}>Parent has opted out of asset sharing.</div>
            }
          </div>
          {/* Strategic Partner Finder */}
          <div style={{ background: "#283E51", borderRadius: 14, padding: "13px 13px 10px 14px", marginBottom: 11, boxShadow: "0 2px 12px 0 #121416" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              Strategic Partner Finder
            </div>
            <span style={{ fontSize: 13, color: "#fff" }}>Need help with:</span>
            <select
              onChange={e => setShowAssetBreakdown(e.target.value)}
              style={{ borderRadius: 7, padding: "5px 12px", fontFamily: "Segoe UI", marginLeft: 6, marginTop: 3, fontSize: 14 }}
              defaultValue=""
            >
              <option value="">Pick Asset...</option>
              {assetTypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div style={{ marginTop: 7 }}>
              {showAssetBreakdown && findPartners(showAssetBreakdown).length > 0 &&
                <div style={{ fontSize: 13 }}>
                  <b>Matches:</b> {findPartners(showAssetBreakdown).map(p => p.name).join(", ")}
                </div>
              }
              {showAssetBreakdown && findPartners(showAssetBreakdown).length === 0 &&
                <div style={{ color: "#ff6b6b", fontWeight: 700 }}>No available partners for this asset.</div>
              }
            </div>
          </div>
        </div>

        {/* Boardroom Leverage Meter & Asset Breakdown */}
        <div style={{ minWidth: 330, maxWidth: 410 }}>
          <div style={{ background: "#1a1d20", borderRadius: 14, padding: "14px 12px 10px 14px", boxShadow: "0 2px 12px 0 #15171a" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Asset Pool Breakdown
            </div>
            <table style={{ width: "100%", fontSize: 13, color: "#fff", marginBottom: 5 }}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {assetBreakdown.map((a, i) => (
                  <tr key={i}>
                    <td style={{ color: getAssetColor(a.type), fontWeight: 700 }}>{a.type}</td>
                    <td>{a.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ color: "#FFD700", fontWeight: 700, marginTop: 12, fontSize: 15 }}>Engagement Hot Zones</div>
            <ul>
              {hotZones.length === 0 && <li>No weak spots right now.</li>}
              {hotZones.map(p => (
                <li key={p.id} style={{ color: "#ff6b6b", fontWeight: 600 }}>{p.name}</li>
              ))}
            </ul>
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
        Proprietary to CourtEvo Vero. Boardroom-grade parent asset management. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
