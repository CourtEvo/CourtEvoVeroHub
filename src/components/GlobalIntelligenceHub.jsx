import React, { useState } from "react";
import { FaGlobeEurope, FaChartLine, FaExchangeAlt, FaLightbulb, FaMapMarkedAlt, FaArrowUp, FaRocket,
     FaExclamationTriangle, FaSearch, } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveRadar } from "@nivo/radar";
import { motion, AnimatePresence } from "framer-motion";
import "./GlobalIntelligenceHub.css";

// --- Demo data (replace with backend/API later)
const CLUBS = [
  { name: "Real Madrid", country: "Spain", finance: 97, fans: 3800000, digital: 91, trophies: 38, intlDeals: 17 },
  { name: "Partizan", country: "Serbia", finance: 67, fans: 480000, digital: 63, trophies: 20, intlDeals: 7 },
  { name: "Zalgiris", country: "Lithuania", finance: 55, fans: 122000, digital: 57, trophies: 18, intlDeals: 8 },
  { name: "Monaco", country: "Monaco", finance: 52, fans: 67000, digital: 62, trophies: 4, intlDeals: 4 },
  { name: "Cibona", country: "Croatia", finance: 22, fans: 27000, digital: 37, trophies: 16, intlDeals: 3 }
];

// Benchmarks by club (for bar/radar)
const BENCHMARKS = [
  { club: "Real Madrid", Finance: 97, Digital: 91, Fanbase: 96, Performance: 98 },
  { club: "Partizan", Finance: 67, Digital: 63, Fanbase: 62, Performance: 81 },
  { club: "Zalgiris", Finance: 55, Digital: 57, Fanbase: 53, Performance: 79 },
  { club: "Monaco", Finance: 52, Digital: 62, Fanbase: 43, Performance: 72 },
  { club: "Cibona", Finance: 22, Digital: 37, Fanbase: 19, Performance: 68 }
];

// Opportunity Radar: new cross-border events/markets
const OPPORTUNITIES = [
  { region: "Nordics", type: "Fan Growth", impact: 8.2, trend: "Up", detail: "Untapped youth market; digital campaigns recommended." },
  { region: "Italy", type: "Event Partnerships", impact: 7.4, trend: "Stable", detail: "Several Serie A clubs open for cross-league tournaments." },
  { region: "Greece", type: "Sponsorship", impact: 5.9, trend: "Up", detail: "New fintech sponsors entering basketball." },
  { region: "Germany", type: "Digital Collab", impact: 7.9, trend: "Up", detail: "eSports/basketball crossover growing." }
];

// Risk Map
const RISKS = [
  { geo: "Eastern Europe", type: "Political", severity: 8, desc: "Instability may disrupt league operations" },
  { geo: "Italy", type: "Financial", severity: 4, desc: "Some clubs facing debt, but league is stable" },
  { geo: "UK", type: "Market", severity: 6, desc: "Basketball popularity volatile" },
  { geo: "France", type: "Legal", severity: 3, desc: "Recent changes to athlete work permits" }
];

// Global deal flow (pipeline)
const DEALS = [
  { club: "Real Madrid", partner: "Nike", value: 2.2, status: "Closed", type: "Sponsorship", geo: "USA" },
  { club: "Zalgiris", partner: "Go3", value: 0.7, status: "Active", type: "Media Rights", geo: "Lithuania" },
  { club: "Partizan", partner: "Adidas", value: 0.4, status: "Negotiating", type: "Kit", geo: "Serbia" },
  { club: "Cibona", partner: "Erste", value: 0.3, status: "Lost", type: "Sponsorship", geo: "Croatia" }
];

// Radar chart prep
const RADAR_DATA = BENCHMARKS.map(b => ({
  club: b.club,
  Finance: b.Finance,
  Digital: b.Digital,
  Fanbase: b.Fanbase,
  Performance: b.Performance
}));
const RADAR_KEYS = ["Finance", "Digital", "Fanbase", "Performance"];

export default function GlobalIntelligenceHub() {
  const [search, setSearch] = useState("");
  const [aiPanel, setAIPanel] = useState(true);

  // Search clubs
  const filteredClubs = CLUBS.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase())
  );

  // AI Analyst Demo: returns top trend and global watch-out
  function getAIInsight() {
    let trend = OPPORTUNITIES.find(o => o.trend === "Up");
    let risk = RISKS.sort((a, b) => b.severity - a.severity)[0];
    return {
      trend: `Major upward trend in ${trend.region} (${trend.type}): ${trend.detail}`,
      risk: `Most severe risk is ${risk.type} in ${risk.geo}: ${risk.desc}`
    };
  }
  const aiInsight = getAIInsight();

  return (
    <div className="gih-hub" style={{ background: "linear-gradient(115deg,#171d21 0%,#1e2937 100%)", borderRadius: 27, padding: 45, color: "#fff", minHeight: 1350, boxShadow: "0 3px 45px #FFD70033", maxWidth: 1600, margin: "0 auto" }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 36, color: "#FFD700", letterSpacing: 1, marginBottom: 0, display: "flex", alignItems: "center" }}>
            <FaGlobeEurope style={{ marginRight: 13, fontSize: 35 }} />
            Global Intelligence Hub
          </h2>
          <div style={{ color: "#FFD70099", fontWeight: 700, fontSize: 18 }}>World basketball benchmarking, risks, deals, and opportunity—CourtEvo Vero.</div>
        </div>
        <button className="gih-ai-btn" onClick={() => setAIPanel(v => !v)}>
          <FaLightbulb style={{ marginRight: 7, fontSize: 18 }} />
          {aiPanel ? "Hide AI Analyst" : "Show AI Analyst"}
        </button>
      </div>
      {aiPanel && (
        <motion.div className="gih-ai-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <FaLightbulb style={{ fontSize: 23, color: "#FFD700", marginRight: 10 }} />
          <span style={{ fontWeight: 900, color: "#FFD700" }}>AI Global Analyst:</span>
          <div style={{ fontWeight: 800, marginTop: 4 }}>{aiInsight.trend}</div>
          <div style={{ fontWeight: 700, color: "#e94057", marginTop: 3 }}>{aiInsight.risk}</div>
        </motion.div>
      )}

      {/* Club Explorer/Search */}
      <div className="gih-section" style={{ marginBottom: 42 }}>
        <div className="gih-section-title"><FaSearch style={{ marginRight: 7 }} /> Global Club Explorer</div>
        <input
          value={search}
          placeholder="Search by club/country..."
          onChange={e => setSearch(e.target.value)}
          className="gih-club-search"
        />
        <table className="gih-club-table">
          <thead>
            <tr>
              <th>Club</th>
              <th>Country</th>
              <th>Finance</th>
              <th>Fans</th>
              <th>Digital</th>
              <th>Trophies</th>
              <th>Intl. Deals</th>
            </tr>
          </thead>
          <tbody>
            {filteredClubs.map(c => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.country}</td>
                <td style={{ color: c.finance > 80 ? "#27ef7d" : c.finance > 50 ? "#FFD700" : "#e94057", fontWeight: 900 }}>{c.finance}</td>
                <td>{c.fans.toLocaleString()}</td>
                <td style={{ color: c.digital > 80 ? "#27ef7d" : c.digital > 60 ? "#FFD700" : "#e94057", fontWeight: 900 }}>{c.digital}</td>
                <td>{c.trophies}</td>
                <td>{c.intlDeals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Radar Benchmarks */}
      <div className="gih-section" style={{ marginBottom: 36 }}>
        <div className="gih-section-title"><FaChartLine style={{ marginRight: 7 }} /> Club Benchmark Radar</div>
        <div style={{ height: 340, background: "#222b3c", borderRadius: 13, padding: 10 }}>
          <ResponsiveRadar
            data={RADAR_DATA}
            keys={RADAR_KEYS}
            indexBy="club"
            maxValue="auto"
            margin={{ top: 65, right: 100, bottom: 65, left: 100 }}
            curve="linearClosed"
            borderWidth={2}
            gridLevels={5}
            gridShape="linear"
            gridLabelOffset={36}
            enableDots={true}
            dotSize={11}
            dotColor={{ theme: "background" }}
            dotBorderWidth={3}
            dotBorderColor={{ from: "color" }}
            colors={["#FFD700", "#27ef7d", "#00B4D8", "#e94057"]}
            blendMode="multiply"
            motionConfig="gentle"
            theme={{
              textColor: "#FFD700",
              axis: { ticks: { text: { fill: "#FFD700" } }, legend: { text: { fill: "#FFD700" } } }
            }}
            legends={[
              {
                anchor: "top-left",
                direction: "column",
                translateX: -60,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: "#FFD700"
              }
            ]}
          />
        </div>
      </div>

      {/* Opportunity Radar */}
      <div className="gih-section" style={{ marginBottom: 36 }}>
        <div className="gih-section-title"><FaArrowUp style={{ marginRight: 7 }} /> Opportunity Radar</div>
        <table className="gih-opportunity-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Type</th>
              <th>Impact</th>
              <th>Trend</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {OPPORTUNITIES.map((o, i) => (
              <tr key={i}>
                <td>{o.region}</td>
                <td>{o.type}</td>
                <td style={{ fontWeight: 900, color: "#FFD700" }}>{o.impact}</td>
                <td style={{ color: o.trend === "Up" ? "#27ef7d" : "#FFD700" }}>{o.trend}</td>
                <td>{o.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Map */}
      <div className="gih-section" style={{ marginBottom: 36 }}>
        <div className="gih-section-title"><FaExclamationTriangle style={{ marginRight: 7 }} /> Strategic Risk Map</div>
        <table className="gih-risk-table">
          <thead>
            <tr>
              <th>Geo</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {RISKS.map((r, i) => (
              <tr key={i}>
                <td>{r.geo}</td>
                <td>{r.type}</td>
                <td style={{ color: r.severity > 7 ? "#e94057" : r.severity > 4 ? "#FFD700" : "#27ef7d", fontWeight: 900 }}>{r.severity}</td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deal Flow Pipeline */}
      <div className="gih-section" style={{ marginBottom: 36 }}>
        <div className="gih-section-title"><FaExchangeAlt style={{ marginRight: 7 }} /> International Deal Flow</div>
        <table className="gih-deal-table">
          <thead>
            <tr>
              <th>Club</th>
              <th>Partner</th>
              <th>Value (€M)</th>
              <th>Status</th>
              <th>Type</th>
              <th>Geo</th>
            </tr>
          </thead>
          <tbody>
            {DEALS.map((d, i) => (
              <tr key={i}>
                <td>{d.club}</td>
                <td>{d.partner}</td>
                <td style={{ fontWeight: 900 }}>{d.value}</td>
                <td style={{ color: d.status === "Closed" ? "#27ef7d" : d.status === "Active" ? "#FFD700" : d.status === "Negotiating" ? "#00B4D8" : "#e94057", fontWeight: 900 }}>{d.status}</td>
                <td>{d.type}</td>
                <td>{d.geo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", color: "#FFD70099", fontWeight: 900, fontSize: 15, marginTop: 32 }}>
        CourtEvo Vero™ Global Intelligence. Where your world advantage begins.
      </div>
    </div>
  );
}
