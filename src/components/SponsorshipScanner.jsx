import React, { useState } from "react";
import {
  FaMoneyBillWave, FaBullhorn, FaCheckCircle, FaRegClock, FaBolt, FaStar, FaFilePdf, FaCalendarAlt, FaChartBar
} from "react-icons/fa";

const initialAssets = [
  {
    asset: "Main Jersey Front",
    status: "sponsored",
    value: 15000,
    partner: "SmartTech d.o.o.",
    expiry: "2026-06-01",
    lastPitched: "2024-12-10",
    pitch: "Front-of-kit: maximum TV/streaming exposure; best for tech, finance, or retail.",
    category: "Physical",
    roi: "32,000 est. annual impressions"
  },
  {
    asset: "Court Sideline Banner",
    status: "open",
    value: 4000,
    partner: "",
    expiry: "",
    lastPitched: "2025-06-01",
    pitch: "High-visibility during every home game; strong value for local/regional brands.",
    category: "Physical",
    roi: "17,000 in-arena viewers/season"
  },
  {
    asset: "Website Homepage Banner",
    status: "sponsored",
    value: 2500,
    partner: "eBasketShop",
    expiry: "2025-10-15",
    lastPitched: "2024-10-01",
    pitch: "Banner ad, club’s top digital real estate; perfect for e-commerce, sports, or betting.",
    category: "Digital",
    roi: "42,000 website visitors/yr"
  },
  {
    asset: "Academy Newsletter",
    status: "open",
    value: 1800,
    partner: "",
    expiry: "",
    lastPitched: "2025-03-15",
    pitch: "Direct email to 600+ parents, alumni, and partners; educational or family brands ideal.",
    category: "Content",
    roi: "8,400 email opens/yr"
  },
  {
    asset: "Player Video Interview Series",
    status: "open",
    value: 2200,
    partner: "",
    expiry: "",
    lastPitched: "2025-01-23",
    pitch: "Co-branded video content shared to all social channels; great for youth-focused, lifestyle, or sports brands.",
    category: "Content",
    roi: "12,000 combined views/yr"
  }
];

// Category colors for visual distinction
const categoryColors = {
  Physical: "#FFD700",
  Digital: "#1de682",
  Content: "#46a6ff",
  Event: "#e8660b"
};

function getTopUntapped(assets) {
  return assets
    .filter(a => a.status === "open")
    .sort((a, b) => b.value - a.value)
    .slice(0, 2);
}

export default function SponsorshipScanner() {
  const [assets, setAssets] = useState(initialAssets);

  const totalValue = assets.reduce((acc, a) => acc + (a.status === "sponsored" ? a.value : 0), 0);
  const openValue = assets.reduce((acc, a) => acc + (a.status === "open" ? a.value : 0), 0);
  const openAssets = assets.filter(a => a.status === "open");
  const soonToExpire = assets.filter(
    a => a.status === "sponsored" && a.expiry && (new Date(a.expiry) - new Date()) / (1000 * 60 * 60 * 24) < 120
  );
  const topUntapped = getTopUntapped(assets);

  // Dummy PDF/export handler
  const handleExport = () => {
    alert("Export to PDF coming soon! (Add real export for production)");
  };

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Sponsorship Opportunity Scanner <FaMoneyBillWave style={{ marginLeft: 10, fontSize: 24, color: "#1de682", verticalAlign: -2 }} />
        <button
          onClick={handleExport}
          style={{
            float: "right",
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 2px 8px #FFD70044",
            marginTop: 3,
            cursor: "pointer",
            transition: "background 0.18s"
          }}
        >
          <FaFilePdf style={{ marginRight: 8 }} /> Export PDF
        </button>
      </h2>

      <div style={{ display: "flex", gap: 32, marginBottom: 28, flexWrap: "wrap" }}>
        <BoardCard
          icon={<FaStar color="#FFD700" size={28} />}
          label="Total Sponsored Value"
          value={`€${totalValue.toLocaleString()}`}
          color="#FFD700"
        />
        <BoardCard
          icon={<FaBolt color="#1de682" size={28} />}
          label="Untapped Potential"
          value={`€${openValue.toLocaleString()}`}
          color="#1de682"
        />
        <BoardCard
          icon={<FaBullhorn color="#FFD700" size={28} />}
          label="Available Assets"
          value={openAssets.length}
          color="#FFD700"
        />
      </div>

      {/* Soon-to-expire sponsor warning */}
      {soonToExpire.length > 0 && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          borderRadius: 10,
          padding: "10px 20px",
          fontWeight: 700,
          marginBottom: 16,
          boxShadow: "0 3px 18px #e82e2e55",
          display: "flex",
          alignItems: "center",
          gap: 11
        }}>
          <FaCalendarAlt style={{ fontSize: 20 }} />
          <span>
            <b>Attention:</b> {soonToExpire.length} sponsorship(s) will expire in less than 4 months. Start renewal conversations now!
          </span>
        </div>
      )}

      {/* Top Untapped Opportunities */}
      <div style={{
        background: "#181e23",
        borderRadius: 12,
        padding: "17px 28px",
        marginBottom: 16,
        color: "#FFD700"
      }}>
        <FaBolt style={{ marginRight: 7 }} />
        <b>Top Untapped Opportunities:</b>
        <ul style={{ marginLeft: 18, color: "#fff", marginTop: 6 }}>
          {topUntapped.map((a, idx) => (
            <li key={idx} style={{ marginBottom: 5 }}>
              <span style={{
                color: categoryColors[a.category],
                fontWeight: 700,
                fontSize: 16,
                marginRight: 7
              }}>{a.asset}</span>
              <span style={{
                color: "#FFD700",
                fontSize: 14,
                marginRight: 9,
                fontWeight: 700
              }}>
                (€{a.value.toLocaleString()})
              </span>
              <span style={{
                background: "#21282c",
                color: "#fff",
                padding: "2px 9px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700
              }}>{a.category}</span>
              <span style={{ marginLeft: 16, color: "#1de682", fontWeight: 700 }}>
                ROI: {a.roi}
              </span>
              <span style={{
                marginLeft: 18,
                color: "#FFD700",
                fontWeight: 700,
                background: "#232a2e",
                borderRadius: 6,
                padding: "2px 10px",
                fontSize: 12
              }}>
                Last pitched: {a.lastPitched}
              </span>
              <div style={{
                marginTop: 5,
                fontSize: 13,
                color: "#FFD700"
              }}>
                <b>Pitch:</b> {a.pitch}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 40px",
        boxShadow: "0 2px 18px #FFD70015",
        marginBottom: 10
      }}>
        <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 12 }}>
          Asset Inventory & Pipeline
        </h3>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Category</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Value (€)</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Partner</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Expiry</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>ROI/Impression</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: a.status === "sponsored" ? "#1de682" : "#FFD700",
                fontWeight: a.status === "sponsored" ? 600 : 500
              }}>
                <td style={{ padding: "7px 6px" }}>{a.asset}</td>
                <td style={{ padding: "7px 6px", color: categoryColors[a.category], fontWeight: 800 }}>{a.category}</td>
                <td style={{ padding: "7px 6px" }}>
                  {a.status === "sponsored"
                    ? <><FaCheckCircle color="#1de682" style={{ marginRight: 6 }} /> Sponsored</>
                    : <><FaRegClock color="#FFD700" style={{ marginRight: 6 }} /> Open</>}
                </td>
                <td style={{ padding: "7px 6px" }}>{a.value}</td>
                <td style={{ padding: "7px 6px" }}>{a.partner || "-"}</td>
                <td style={{ padding: "7px 6px" }}>{a.expiry ? new Date(a.expiry).toLocaleDateString() : "-"}</td>
                <td style={{ padding: "7px 6px", color: "#1de682", fontWeight: 700 }}>{a.roi}</td>
                <td style={{ padding: "7px 6px" }}>
                  {a.status === "open"
                    ? <button style={{
                        background: "#FFD700",
                        color: "#232a2e",
                        border: "none",
                        borderRadius: 7,
                        fontWeight: 800,
                        fontSize: 14,
                        padding: "7px 18px",
                        cursor: "pointer"
                      }}>
                        Pitch to Sponsor
                      </button>
                    : <span style={{ color: "#aaa" }}>-</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "15px 24px",
        marginTop: 24,
        fontSize: 16,
        fontWeight: 700
      }}>
        <FaChartBar style={{ marginRight: 8, verticalAlign: -2 }} />
        Boardroom Ready: This module powers commercial meetings, real asset sales, and gives directors and partners a modern inventory overview with actionable insights.
      </div>
    </div>
  );
}

function BoardCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "#232a2e",
      borderRadius: 20,
      boxShadow: `0 3px 18px ${color}26`,
      padding: "24px 28px",
      minWidth: 200,
      display: "flex",
      alignItems: "center",
      gap: 19
    }}>
      {icon}
      <div>
        <div style={{ fontSize: 13, color, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  );
}
