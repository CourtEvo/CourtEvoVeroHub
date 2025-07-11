import React from "react";
import { FaChartPie, FaTrophy, FaArrowUpRight, FaExclamationTriangle } from "react-icons/fa";

// Demo peer data (replace with real club data in production)
const myClub = {
  name: "Your Club",
  kpis: {
    "Athlete Retention": 0.92,
    "Talent Promotion": 0.34,
    "Player Wellness": 0.88,
    "Coach Education": 0.91,
    "Cost Per Win": 3500,
    "Compliance": 0.99
  }
};
const peers = [
  {
    name: "Peer A",
    kpis: {
      "Athlete Retention": 0.85,
      "Talent Promotion": 0.29,
      "Player Wellness": 0.74,
      "Coach Education": 0.87,
      "Cost Per Win": 3200,
      "Compliance": 0.97
    }
  },
  {
    name: "Peer B",
    kpis: {
      "Athlete Retention": 0.95,
      "Talent Promotion": 0.41,
      "Player Wellness": 0.81,
      "Coach Education": 0.85,
      "Cost Per Win": 4700,
      "Compliance": 1.0
    }
  },
  {
    name: "Peer C",
    kpis: {
      "Athlete Retention": 0.89,
      "Talent Promotion": 0.38,
      "Player Wellness": 0.79,
      "Coach Education": 0.93,
      "Cost Per Win": 3800,
      "Compliance": 0.98
    }
  }
];

const KPI_LABELS = [
  "Athlete Retention", "Talent Promotion", "Player Wellness", "Coach Education", "Cost Per Win", "Compliance"
];

// Helper: Radar chart mock (SVG)
function RadarChart({ myKPIs, peerA, peerB, peerC }) {
  // Normalize (except for Cost Per Win: lower is better, invert scale)
  const maxes = {
    "Athlete Retention": 1,
    "Talent Promotion": 0.5,
    "Player Wellness": 1,
    "Coach Education": 1,
    "Cost Per Win": 5000,
    "Compliance": 1
  };
  const invert = { "Cost Per Win": true };
  const points = arr => arr.map((v, i) => {
    const r = invert[KPI_LABELS[i]]
      ? 1 - v / maxes[KPI_LABELS[i]]
      : v / maxes[KPI_LABELS[i]];
    const angle = (Math.PI * 2 * i) / arr.length - Math.PI / 2;
    return [
      110 + Math.cos(angle) * r * 95,
      110 + Math.sin(angle) * r * 95
    ];
  });
  // My club = gold, Peer A = blue, Peer B = green, Peer C = gray
  const allPoints = [
    { pts: points(KPI_LABELS.map(k => myKPIs[k])), color: "#FFD70044", stroke: "#FFD700" },
    { pts: points(KPI_LABELS.map(k => peerA[k])), color: "#4688ff22", stroke: "#4688ff" },
    { pts: points(KPI_LABELS.map(k => peerB[k])), color: "#1de68222", stroke: "#1de682" },
    { pts: points(KPI_LABELS.map(k => peerC[k])), color: "#bbb9" , stroke: "#888" }
  ];

  return (
    <svg width="220" height="220" style={{ background: "#181e23", borderRadius: "50%", boxShadow: "0 1px 10px #FFD70033", margin: "20px 0 14px 0" }}>
      {/* Axes */}
      {KPI_LABELS.map((k, i) => {
        const angle = (Math.PI * 2 * i) / KPI_LABELS.length - Math.PI / 2;
        return (
          <line
            key={k}
            x1={110}
            y1={110}
            x2={110 + Math.cos(angle) * 95}
            y2={110 + Math.sin(angle) * 95}
            stroke="#444"
            strokeWidth="1"
          />
        );
      })}
      {/* Club polygons */}
      {allPoints.map((obj, idx) => (
        <polygon
          key={idx}
          points={obj.pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill={obj.color}
          stroke={obj.stroke}
          strokeWidth="3"
        />
      ))}
      {/* Axis labels */}
      {KPI_LABELS.map((k, i) => {
        const angle = (Math.PI * 2 * i) / KPI_LABELS.length - Math.PI / 2;
        return (
          <text
            key={k}
            x={110 + Math.cos(angle) * 112}
            y={110 + Math.sin(angle) * 112}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="11"
            fill="#FFD700"
            style={{ fontWeight: 700 }}
          >{k}</text>
        );
      })}
    </svg>
  );
}

// Boardroom summary: where you lead/lag
function getSummary(myKPIs, peers) {
  let best = [], worst = [];
  KPI_LABELS.forEach(k => {
    // For Cost Per Win: lower is better
    const invert = k === "Cost Per Win";
    const myV = myKPIs[k];
    const peerVals = peers.map(p => p.kpis[k]);
    const rank = invert
      ? [myV, ...peerVals].sort((a, b) => a - b)
      : [myV, ...peerVals].sort((a, b) => b - a);
    if (rank[0] === myV) best.push(k);
    if (rank[rank.length - 1] === myV) worst.push(k);
  });
  return { best, worst };
}

export default function PeerClubComparison() {
  const { best, worst } = getSummary(myClub.kpis, peers);

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Peer Club Comparison <FaChartPie style={{ marginLeft: 10, color: "#1de682", fontSize: 24, verticalAlign: -2 }} />
      </h2>
      <div style={{ display: "flex", gap: 34, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <RadarChart
          myKPIs={myClub.kpis}
          peerA={peers[0].kpis}
          peerB={peers[1].kpis}
          peerC={peers[2].kpis}
        />
        <div style={{ flex: 1, minWidth: 290 }}>
          <div style={{
            background: "#232a2e",
            borderRadius: 12,
            padding: "20px 28px",
            boxShadow: "0 2px 14px #FFD70022"
          }}>
            <FaTrophy style={{ color: "#FFD700", fontSize: 19, verticalAlign: -3, marginRight: 6 }} />
            <b>Areas of Strength:</b>{" "}
            <span style={{ color: "#1de682", fontWeight: 700 }}>
              {best.length ? best.join(", ") : "None"}
            </span>
            <br />
            <FaExclamationTriangle style={{ color: "#FFD700", fontSize: 15, verticalAlign: -2, marginRight: 6, marginTop: 12 }} />
            <b>Improvement Needed:</b>{" "}
            <span style={{ color: "#FFD700", fontWeight: 700 }}>
              {worst.length ? worst.join(", ") : "None"}
            </span>
            <br />
            <div style={{ marginTop: 18, color: "#fff", fontSize: 14 }}>
              <b>Boardroom Summary:</b>
              <ul style={{ marginTop: 5, marginLeft: 16 }}>
                {best.map(k =>
                  <li key={k} style={{ color: "#1de682" }}>
                    {k}: Leading among peers—showcase to sponsors and parents.
                  </li>
                )}
                {worst.map(k =>
                  <li key={k} style={{ color: "#FFD700" }}>
                    {k}: <b>Below peer average—focus improvement efforts here.</b>
                  </li>
                )}
                {!best.length && !worst.length && (
                  <li>All metrics at peer average. Continue steady improvement.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "#232a2e",
        borderRadius: 14,
        padding: "25px 34px",
        marginTop: 18,
        boxShadow: "0 2px 16px #FFD70022"
      }}>
        <h3 style={{ color: "#FFD700", fontSize: 18, marginBottom: 12 }}>
          KPI Comparison Table
        </h3>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>KPI</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Your Club</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Peer A</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Peer B</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Peer C</th>
            </tr>
          </thead>
          <tbody>
            {KPI_LABELS.map((k, idx) => (
              <tr key={k} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td style={{ padding: "7px 6px", color: "#FFD700", fontWeight: 700 }}>{k}</td>
                <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 900, color: "#FFD700" }}>{myClub.kpis[k] instanceof Number || typeof myClub.kpis[k] === "number" ? (k === "Cost Per Win" ? `€${myClub.kpis[k].toLocaleString()}` : (myClub.kpis[k]*100).toFixed(0) + "%") : myClub.kpis[k]}</td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>{peers[0].kpis[k] instanceof Number || typeof peers[0].kpis[k] === "number" ? (k === "Cost Per Win" ? `€${peers[0].kpis[k].toLocaleString()}` : (peers[0].kpis[k]*100).toFixed(0) + "%") : peers[0].kpis[k]}</td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>{peers[1].kpis[k] instanceof Number || typeof peers[1].kpis[k] === "number" ? (k === "Cost Per Win" ? `€${peers[1].kpis[k].toLocaleString()}` : (peers[1].kpis[k]*100).toFixed(0) + "%") : peers[1].kpis[k]}</td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>{peers[2].kpis[k] instanceof Number || typeof peers[2].kpis[k] === "number" ? (k === "Cost Per Win" ? `€${peers[2].kpis[k].toLocaleString()}` : (peers[2].kpis[k]*100).toFixed(0) + "%") : peers[2].kpis[k]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
