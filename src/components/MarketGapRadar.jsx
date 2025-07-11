import React from "react";
import { FaChartPie, FaFlagCheckered, FaCheckCircle, FaBolt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";

// SAMPLE DATA – Replace with backend/Excel import in production!
const METRICS = [
  { label: "Talent Pipeline", club: 83, market: 72, benchmark: 90 },
  { label: "Coach Quality", club: 91, market: 84, benchmark: 92 },
  { label: "Financial Health", club: 74, market: 81, benchmark: 85 },
  { label: "Parent Engagement", club: 79, market: 75, benchmark: 88 },
  { label: "Board Compliance", club: 92, market: 81, benchmark: 93 },
  { label: "Facilities", club: 70, market: 77, benchmark: 90 },
  { label: "Innovation", club: 62, market: 65, benchmark: 80 },
];

// Generate data for radar chart
const radarData = METRICS.map(m => ({
  metric: m.label,
  Club: m.club,
  Market: m.market,
  "World-Class": m.benchmark,
}));

function flagGap(club, benchmark) {
  const diff = club - benchmark;
  if (diff >= -3) return { flag: "ok", icon: <FaCheckCircle color="#1de682" /> };
  if (diff >= -12) return { flag: "warn", icon: <FaFlagCheckered color="#FFD700" /> };
  return { flag: "risk", icon: <FaBolt color="#e24242" /> };
}

function gapArrow(club, market) {
  return club > market
    ? <span style={{ color: "#1de682", marginLeft: 8 }}><FaArrowUp />+{club - market}</span>
    : <span style={{ color: "#e24242", marginLeft: 8 }}><FaArrowDown />{club - market}</span>;
}

export default function MarketGapRadar() {
  return (
    <div style={{
      padding: 36, borderRadius: 36,
      background: "linear-gradient(120deg, #232a2e 80%, #232a2e 100%)",
      boxShadow: "0 8px 48px #181e2330",
      color: "#fff",
      minHeight: 620
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <FaChartPie color="#FFD700" size={38} />
        <h1 style={{ fontWeight: 900, fontSize: 32, color: "#FFD700", letterSpacing: 1 }}>
          Market Gap Radar
        </h1>
      </div>
      <div style={{ fontSize: 18, marginBottom: 28, color: "#FFD700" }}>
        <b>Benchmark your club/academy instantly vs. the market and global best.</b>
        <br />
        <span style={{ color: "#1de682", fontWeight: 700 }}>Data-driven. Powered by CourtEvo Vero analytics.</span>
      </div>

      {/* Modern Radar Chart */}
      <div style={{
        maxWidth: 500, width: "100%", margin: "0 auto 34px auto",
        background: "#1a232b", borderRadius: 22, padding: 18, boxShadow: "0 1px 10px #FFD70033"
      }}>
        <ResponsiveContainer width="100%" height={390}>
          <RadarChart cx="50%" cy="50%" outerRadius="85%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 14 }} />
            <PolarRadiusAxis angle={30} domain={[50, 100]} tick={{ fill: "#fff" }} />
            <Radar name="Club" dataKey="Club" stroke="#FFD700" fill="#FFD700" fillOpacity={0.32} />
            <Radar name="Market" dataKey="Market" stroke="#1de682" fill="#1de682" fillOpacity={0.18} />
            <Radar name="World-Class" dataKey="World-Class" stroke="#e24242" fill="#e24242" fillOpacity={0.09} />
            <Tooltip contentStyle={{ background: "#222", color: "#FFD700", borderRadius: 10, border: "none" }}/>
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 10 }}>
          <span style={{ color: "#FFD700", fontWeight: 900 }}><span style={{
            display: "inline-block", width: 14, height: 14, borderRadius: 6, background: "#FFD700", marginRight: 5
          }} /> Your Club</span>
          <span style={{ color: "#1de682", fontWeight: 900 }}><span style={{
            display: "inline-block", width: 14, height: 14, borderRadius: 6, background: "#1de682", marginRight: 5
          }} /> Market Avg</span>
          <span style={{ color: "#e24242", fontWeight: 900 }}><span style={{
            display: "inline-block", width: 14, height: 14, borderRadius: 6, background: "#e24242", marginRight: 5
          }} /> World-Class</span>
        </div>
      </div>

      {/* Data Table */}
      <table style={{
        width: "100%", background: "#23292f", borderRadius: 16,
        boxShadow: "0 2px 12px #FFD70011", borderCollapse: "separate", borderSpacing: 0, marginBottom: 22
      }}>
        <thead>
          <tr style={{ background: "#FFD70011", color: "#FFD700", fontWeight: 900 }}>
            <th style={{ padding: 13, borderRadius: "16px 0 0 0" }}>Metric</th>
            <th style={{ padding: 13 }}>Your Club</th>
            <th style={{ padding: 13 }}>Market Avg</th>
            <th style={{ padding: 13 }}>Gap</th>
            <th style={{ padding: 13 }}>World-Class</th>
            <th style={{ padding: 13, borderRadius: "0 16px 0 0" }}>Flag</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map((m, i) => {
            const { flag, icon } = flagGap(m.club, m.benchmark);
            return (
              <tr key={i} style={{
                background: i % 2 === 0 ? "#232a2e" : "#181e23",
                color: "#fff", fontWeight: 600
              }}>
                <td style={{ padding: 13, color: "#FFD700", fontWeight: 700 }}>{m.label}</td>
                <td style={{ padding: 13, color: "#FFD700", fontWeight: 700 }}>{m.club}</td>
                <td style={{ padding: 13, color: "#1de682", fontWeight: 700 }}>{m.market}</td>
                <td style={{ padding: 13 }}>{gapArrow(m.club, m.market)}</td>
                <td style={{ padding: 13, color: "#e24242", fontWeight: 700 }}>{m.benchmark}</td>
                <td style={{ padding: 13 }}>{icon} <span style={{
                  color: flag === "ok" ? "#1de682" : (flag === "warn" ? "#FFD700" : "#e24242"),
                  fontWeight: 900
                }}>{flag.toUpperCase()}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Boardroom Insights */}
      <div style={{
        marginTop: 24, background: "#FFD70022", borderRadius: 13,
        padding: 18, color: "#FFD700", display: "flex", alignItems: "center", gap: 12, fontSize: 17
      }}>
        <FaFlagCheckered color="#FFD700" />
        <span>
          <b>Boardroom Focus:</b> Target <span style={{ color: "#e24242", fontWeight: 900 }}>RISK</span> and <span style={{ color: "#FFD700", fontWeight: 900 }}>WARN</span> metrics for next-season improvement. Leverage your strengths where you beat the market!
        </span>
      </div>
    </div>
  );
}
