import React, { useState } from 'react';
import { FaMoneyBillWave, FaChartBar, FaBolt, FaPlus, FaFileExport, FaSave, FaArrowRight, FaRegCopy, FaBasketballBall, FaTrophy, FaUsers, FaTv, FaCalendarAlt, FaLightbulb, FaFilter, FaGlobe, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import './SponsorshipValueProjectionEngine.css';

// ------------- BENCHMARKS: ONLY BASKETBALL --------------
const BENCHMARKS = [
  { asset: "Jersey Front", avgValue: 42000, min: 25000, max: 60000, cpm: 5, reach: "TV+Arena", segment: "Pro Team", digital: false },
  { asset: "Jersey Back", avgValue: 15000, min: 9000, max: 20000, cpm: 2.8, reach: "TV+Arena", segment: "Pro Team", digital: false },
  { asset: "Shorts Logo", avgValue: 5000, min: 2500, max: 9000, cpm: 1.1, reach: "Arena", segment: "Pro Team", digital: false },
  { asset: "Training Kit Logo", avgValue: 6200, min: 2800, max: 9500, cpm: 1.3, reach: "Training", segment: "Academy/Youth", digital: false },
  { asset: "Event Title Rights", avgValue: 14500, min: 9000, max: 23000, cpm: 4.1, reach: "Event/TV", segment: "Events", digital: false },
  { asset: "VIP Lounge Naming", avgValue: 12000, min: 7000, max: 21000, cpm: 4.7, reach: "Hospitality", segment: "Business/Events", digital: false },
  { asset: "Digital Content Series", avgValue: 7000, min: 4000, max: 14000, cpm: 3.2, reach: "Digital", segment: "Digital", digital: true },
  { asset: "Website Banner", avgValue: 5500, min: 2500, max: 9000, cpm: 1.2, reach: "Digital", segment: "Digital", digital: true },
  { asset: "Social Media Integration", avgValue: 8500, min: 3000, max: 17000, cpm: 2.4, reach: "Digital", segment: "Digital", digital: true },
  { asset: "Match Ball Rights", avgValue: 10000, min: 7000, max: 18000, cpm: 3.8, reach: "TV+Arena", segment: "Pro Team", digital: false },
  { asset: "Basket Stanchion Pads", avgValue: 4800, min: 2200, max: 7300, cpm: 1.9, reach: "Arena", segment: "Arena", digital: false },
  { asset: "Floor Stickers", avgValue: 9000, min: 4000, max: 14000, cpm: 2.5, reach: "Arena", segment: "Arena", digital: false },
  { asset: "Coaches’ Attire", avgValue: 4400, min: 2100, max: 7600, cpm: 1.2, reach: "Bench+Media", segment: "Pro Team", digital: false },
  { asset: "Youth Clinic Branding", avgValue: 3800, min: 1800, max: 6500, cpm: 1.0, reach: "Youth", segment: "Academy/Youth", digital: false },
  { asset: "Summer Camp Sponsor", avgValue: 8000, min: 3500, max: 14500, cpm: 2.2, reach: "Youth", segment: "Academy/Youth", digital: false },
  { asset: "Scoreboard Animation", avgValue: 4200, min: 1500, max: 7000, cpm: 0.9, reach: "Arena", segment: "Arena", digital: false },
  { asset: "Player of the Game Presenting Sponsor", avgValue: 3200, min: 900, max: 5400, cpm: 0.7, reach: "Arena+Digital", segment: "Events", digital: true },
];

const SEGMENTS = [
  "All", "Pro Team", "Academy/Youth", "Arena", "Events", "Business/Events", "Digital"
];

const BASE_ASSETS = BENCHMARKS.map(b => ({
  name: b.asset,
  value: b.avgValue,
  description: '',
  units: 1,
  cpm: b.cpm,
  reach: b.reach,
  custom: false,
  segment: b.segment,
  impressions: b.digital ? 180000 : 30000,
  engagement: b.digital ? 2800 : 0,
  ctr: b.digital ? 0.019 : 0,
  growth: 6,
  digital: !!b.digital,
}));

function currency(x) {
  return '€' + Number(x).toLocaleString();
}

// Simple inline bar for trend (no chart libs required)
function TrendMiniBar({ values, color = "#27ef7d" }) {
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", alignItems: "end", height: 18, width: 60, gap: 2 }}>
      {values.map((v, i) => (
        <div key={i}
          style={{
            height: (v / max) * 18 + 2,
            width: 8,
            background: color,
            borderRadius: 3
          }} />
      ))}
    </div>
  );
}

// AI "Sponsor Story" generator
function sponsorStory(segment, total, digitalValue, growth, assets) {
  switch (segment) {
    case "Pro Team":
      return `Leverage national TV and arena exposure with flagship jersey, court, and VIP assets: current value ${currency(total)}. Projected YoY uplift of ${growth}% ensures multi-year sponsor growth and story.`;
    case "Academy/Youth":
      return `Build grassroots loyalty via youth clinics, camps, and junior team exposure: package value ${currency(total)} with ${currency(digitalValue)} in digital activation.`;
    case "Arena":
      return `Control the in-arena experience with floor, stanchion, and scoreboard rights—max value for fans and partners: ${currency(total)}.`;
    case "Events":
      return `Deliver exclusive event visibility—title rights, MVP, and activation days—for rapid engagement and media impact: ${currency(total)}.`;
    case "Business/Events":
      return `Hospitality and C-level value: VIP lounges, event dinners, and network assets at ${currency(total)}—targeting new partnerships and B2B growth.`;
    case "Digital":
      return `Target digital-first partners: ${currency(total)} in digital series, banners, and social media—${assets.reduce((sum, a) => sum + (a.impressions || 0), 0).toLocaleString()} impressions forecast.`;
    default:
      return "Build your package for an instant, board-ready story.";
  }
}

export default function SponsorshipValueProjectionEngine() {
  const [assets, setAssets] = useState(BASE_ASSETS);
  const [newAsset, setNewAsset] = useState({
    name: '', value: '', units: 1, cpm: '', description: '', reach: '', custom: true, segment: 'Pro Team',
    impressions: 0, engagement: 0, ctr: 0, growth: 6, digital: false
  });
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [compareIndex, setCompareIndex] = useState(null);
  const [trendYears] = useState([0, 1, 2, 3, 4]); // 5 years

  // Total value per segment
  const getSegmentValue = seg =>
    assets.filter(a => (a.segment || "Pro Team") === seg)
      .reduce((sum, a) => sum + (Number(a.value) * Number(a.units) || 0), 0);

  // Asset forecast trend: year-on-year growth per asset
  const assetTrend = (a) => {
    const vals = [];
    let base = Number(a.value) * Number(a.units) || 0;
    let growth = Number(a.growth) || 0;
    for (let y = 0; y < 5; y++) {
      vals.push(Math.round(base));
      base = base * (1 + growth / 100);
    }
    return vals;
  };

  // Value per segment
  const segmentValues = {};
  for (let seg of SEGMENTS) {
    if (seg === "All") continue;
    segmentValues[seg] = getSegmentValue(seg);
  }

  // Asset digital value (impressions * CTR * CPM/1000)
  function digitalValue(a) {
    if (!a.digital || !a.impressions || !a.cpm) return 0;
    return Math.round((a.impressions * a.ctr * a.cpm) / 1000);
  }

  // ROI calculator (asset value divided by cost, for now assume cost is 60% of value)
  function roi(a) {
    const v = Number(a.value) * Number(a.units) || 0;
    return v ? ((v / (v * 0.6)) * 100).toFixed(0) + "%" : "—";
  }

  // Filter
  const shownAssets = segmentFilter === "All"
    ? assets
    : assets.filter(a => (a.segment || "Pro Team") === segmentFilter);

  // Add asset
  function addAsset() {
    if (!newAsset.name) return;
    setAssets([...assets, { ...newAsset, custom: true }]);
    setNewAsset({
      name: '', value: '', units: 1, cpm: '', description: '', reach: '', custom: true, segment: 'Pro Team',
      impressions: 0, engagement: 0, ctr: 0, growth: 6, digital: false
    });
  }

  function setAssetValue(idx, field, val) {
    const upd = [...assets];
    upd[idx][field] = val;
    setAssets(upd);
  }

  function exportCSV() {
    const rows = [
      ['Asset', 'Units', 'Value/Unit (€)', 'Total (€)', 'CPM', 'Reach', 'Description', 'Segment', 'Impressions', 'Engagement', 'CTR', 'Growth %', 'Digital'],
      ...assets.map(a => [
        a.name, a.units, a.value, (a.value * a.units), a.cpm, a.reach, a.description, a.segment,
        a.impressions, a.engagement, a.ctr, a.growth, a.digital ? "Yes" : ""
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv' }), `SponsorshipValueProjection_${Date.now()}.csv`);
  }

  function exportPDF() {
    const element = document.getElementById("svp-pdf");
    html2pdf().set({ margin: 0.6, filename: 'SponsorshipValueProjection.pdf', html2canvas: { scale: 1.35 } }).from(element).save();
  }

  function saveScenario() {
    if (!scenarioName) return;
    setSavedScenarios([...savedScenarios, { name: scenarioName, assets: JSON.parse(JSON.stringify(assets)) }]);
    setScenarioName('');
  }

  function loadScenario(idx) {
    const sc = savedScenarios[idx];
    setAssets(JSON.parse(JSON.stringify(sc.assets)));
    setCompareIndex(idx);
  }

  // AI narrative (overall, plus per-segment sponsor stories)
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.value) * Number(a.units) || 0), 0);

  // For summary cards and comparison
  function kpiCards() {
    return (
      <div style={{ display: "flex", gap: 17, marginBottom: 21, marginTop: 14, flexWrap: "wrap" }}>
        {Object.entries(segmentValues).map(([seg, val]) =>
          <div key={seg} style={{
            background: "#232a3e",
            borderRadius: 12,
            boxShadow: "0 2px 13px #FFD70022",
            padding: "16px 24px",
            color: "#FFD700",
            fontWeight: 900,
            fontSize: 18,
            minWidth: 150,
            textAlign: "center"
          }}>
            {seg}
            <div style={{
              color: "#27ef7d",
              fontWeight: 700,
              fontSize: 22,
              marginTop: 7
            }}>{currency(val)}</div>
          </div>
        )}
      </div>
    );
  }

  // For side-by-side scenario compare
  function scenarioCompare() {
    if (compareIndex == null) return null;
    const curr = assets;
    const comp = savedScenarios[compareIndex]?.assets || [];
    if (!comp.length) return null;
    let currValue = curr.reduce((sum, a) => sum + (Number(a.value) * Number(a.units) || 0), 0);
    let compValue = comp.reduce((sum, a) => sum + (Number(a.value) * Number(a.units) || 0), 0);
    return (
      <div style={{
        background: "#263b54",
        color: "#FFD700",
        borderRadius: 13,
        margin: "20px 0",
        padding: "18px 14px",
        fontWeight: 800,
        fontSize: 16,
        display: "flex",
        flexDirection: "column",
        gap: 9
      }}>
        <div>
          <b>Current Proposal:</b> {currency(currValue)} &nbsp;&nbsp; <b>Compared To:</b> {currency(compValue)}
        </div>
        <div style={{ color: "#27ef7d", fontWeight: 700 }}>
          Difference: {currency(currValue - compValue)}
        </div>
        <button style={{ background: "#FFD700", color: "#283e51", fontWeight: 900, borderRadius: 6, border: "none", marginTop: 6, padding: "4px 13px", cursor: "pointer" }}
          onClick={() => setCompareIndex(null)}>Clear Compare</button>
      </div>
    );
  }

  // Column configuration
  const columns = [
    { label: 'Asset', field: 'name', width: 110 },
    { label: 'Segment', field: 'segment', width: 100 },
    { label: 'Units', field: 'units', width: 52, type: 'number' },
    { label: 'Value/Unit (€)', field: 'value', width: 95, type: 'number' },
    { label: 'Total (€)', width: 92, custom: (a) => currency((Number(a.value) * Number(a.units)) || 0) },
    { label: 'CPM', field: 'cpm', width: 56, type: 'number' },
    { label: 'Reach', field: 'reach', width: 70 },
    { label: 'Description', field: 'description', width: 125 },
    { label: 'Digital?', field: 'digital', width: 55, custom: a => a.digital ? "✔" : "" },
    { label: 'Impressions', field: 'impressions', width: 92, type: 'number' },
    { label: 'Engagement', field: 'engagement', width: 78, type: 'number' },
    { label: 'CTR', field: 'ctr', width: 52, type: 'number' },
    { label: 'Digital Value', width: 108, custom: digitalValue },
    { label: 'ROI', width: 64, custom: roi },
    { label: 'YoY Growth %', field: 'growth', width: 72, type: 'number' },
    { label: '5Y Trend', width: 68, custom: assetTrend }
  ];

  // Render
  return (
    <div style={{
      maxWidth: 1550,
      margin: "0 auto",
      padding: 0,
      background: "linear-gradient(135deg,#212438 0%,#21243a 80%,#2c3c51 100%)",
      borderRadius: 32,
      boxShadow: "0 3px 38px #FFD70022",
      marginTop: 44,
      marginBottom: 44,
    }}>
      <section id="svp-pdf" style={{
        padding: 44,
        borderRadius: 29,
        background: "linear-gradient(135deg,#23293b 0%,#263b54 100%)",
        boxShadow: "0 2px 28px #FFD70033"
      }}>
        <h2 style={{ color: "#FFD700", fontSize: 36, fontWeight: 800, marginBottom: 7 }}>
          Sponsorship Value Projection Engine
        </h2>
        <div style={{
          color: "#27ef7d",
          fontWeight: 800,
          marginBottom: 7,
          fontSize: 20
        }}>
          Instant Boardroom Asset Valuation, Scenario Builder, and Predictive Analytics for Basketball-Only Partnerships
        </div>
        {kpiCards()}
        <div style={{ display: "flex", gap: 12, margin: "15px 0 10px 0", alignItems: "center" }}>
          <FaFilter style={{ color: "#FFD700", marginRight: 6 }} />
          <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)} style={{
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 17,
            padding: "6px 13px",
            background: "#21243a",
            color: "#FFD700",
            border: "1px solid #FFD70066"
          }}>
            {SEGMENTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {scenarioCompare()}
        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 1380, fontSize: 16, background: "transparent", color: "#fff", borderRadius: 18 }}>
            <thead>
              <tr>
                <th style={{ background: "none" }}></th>
                {columns.map(col => (
                  <th key={col.label} style={{
                    width: col.width || 110,
                    fontWeight: 700,
                    background: "#FFD70018",
                    color: "#FFD700"
                  }}>{col.label}</th>
                ))}
                <th style={{ background: "none" }}></th>
                <th style={{ background: "none" }}></th>
              </tr>
            </thead>
            <tbody>
              {shownAssets.map((a, idx) => {
                const bm = BENCHMARKS.find(b => b.asset === a.name);
                return (
                  <tr key={idx} style={{ background: idx % 2 ? "#232a3e" : "#23293b" }}>
                    <td style={{ fontSize: 20, textAlign: "center", minWidth: 37 }}>
                      {bm ? <FaRegCopy title="Copy benchmark" /> : <FaBasketballBall color="#FFD700" />}
                    </td>
                    {columns.map(col => (
                      <td key={col.label}>
                        {col.field ? (
                          <input
                            type={col.type || "text"}
                            value={a[col.field]}
                            style={{ width: col.width - 8, borderRadius: 5, border: "1px solid #ffd70088", padding: "3px 5px", background: "#23293b", color: "#FFD700", fontWeight: 600 }}
                            onChange={e => setAssetValue(idx, col.field, e.target.value)}
                          />
                        ) : col.custom ? (
                          col.custom === assetTrend
                            ? <TrendMiniBar values={assetTrend(a)} />
                            : (typeof col.custom === "function" ? col.custom(a) : "")
                        ) : ""}
                      </td>
                    ))}
                    <td>
                      {bm && (
                        <button onClick={() => setAssetValue(idx, "name", bm.asset)}
                          style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 6, padding: "5px 9px", marginBottom: 2 }}>
                          <FaChartBar style={{ marginBottom: -2, marginRight: 2 }} /> BM
                        </button>
                      )}
                    </td>
                    <td>
                      <button onClick={() => setAssets(assets.filter((_, i) => i !== idx))}
                        style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontWeight: 700, fontSize: 17 }}>
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Add new asset row */}
              <tr style={{ background: "#FFD70018" }}>
                <td style={{ fontSize: 20, textAlign: "center" }}><FaPlus /></td>
                {columns.map(col => (
                  <td key={col.label}>
                    {col.field ? (
                      <input
                        type={col.type || "text"}
                        value={newAsset[col.field]}
                        style={{ width: col.width - 8, borderRadius: 5, border: "1px solid #ffd70088", padding: "3px 5px", background: "#21243a", color: "#FFD700", fontWeight: 600 }}
                        onChange={e => setNewAsset({ ...newAsset, [col.field]: e.target.value })}
                        placeholder={col.label}
                      />
                    ) : ""}
                  </td>
                ))}
                <td colSpan={2}>
                  <button onClick={addAsset} style={{
                    background: "#27ef7d", color: "#222", fontWeight: 800, borderRadius: 8, padding: "6px 22px", fontSize: 16, border: "none", marginLeft: 7
                  }}>
                    <FaPlus style={{ marginBottom: -2, marginRight: 2 }} /> Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Save, Export, etc */}
        <div style={{ margin: "32px 0 0 0", display: "flex", gap: 17, flexWrap: "wrap" }}>
          <input
            value={scenarioName}
            onChange={e => setScenarioName(e.target.value)}
            placeholder="Scenario name"
            style={{ borderRadius: 7, border: "1px solid #FFD70088", padding: "9px 15px", width: 180, fontWeight: 700, fontSize: 16 }}
          />
          <button onClick={saveScenario} style={{
            background: "#FFD700", color: "#222", fontWeight: 900, borderRadius: 8, padding: "10px 21px",
            fontSize: 17, border: "none", boxShadow: "0 1px 7px #FFD70033"
          }}><FaSave style={{ marginBottom: -3, marginRight: 7 }} />Save</button>
          <button onClick={exportCSV} style={{
            background: "#27ef7d", color: "#222", fontWeight: 700, borderRadius: 8, padding: "10px 20px",
            fontSize: 17, border: "none", boxShadow: "0 1px 7px #27ef7d33"
          }}><FaFileExport style={{ marginBottom: -3, marginRight: 7 }} />Export CSV</button>
          <button onClick={exportPDF} style={{
            background: "#263b54", color: "#FFD700", fontWeight: 700, borderRadius: 8, padding: "10px 20px",
            fontSize: 17, border: "none", boxShadow: "0 1px 7px #283e5133"
          }}><FaFileExport style={{ marginBottom: -3, marginRight: 7 }} />Export PDF</button>
        </div>

        {/* Scenario history and compare */}
        {savedScenarios.length > 0 && (
          <div style={{ marginTop: 33 }}>
            <div style={{ color: "#FFD700", fontWeight: 900, marginBottom: 7, fontSize: 17 }}>
              Previous Proposals/Scenarios:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
              {savedScenarios.map((sc, i) => (
                <button key={i} style={{
                  background: "#23293b",
                  color: "#FFD700",
                  fontWeight: 900,
                  borderRadius: 8,
                  padding: "8px 19px",
                  border: "none",
                  marginBottom: 7,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #FFD70018"
                }} onClick={() => loadScenario(i)}>
                  <FaBolt style={{ marginBottom: -3, marginRight: 7 }} />
                  {sc.name} ({currency(sc.assets.reduce((sum, a) => sum + (Number(a.value) * Number(a.units) || 0), 0))})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sponsor stories */}
        <div style={{ marginTop: 35, marginBottom: 12, borderTop: "1px solid #FFD70044", paddingTop: 22 }}>
          <h3 style={{ color: "#FFD700", fontSize: 21, fontWeight: 900, marginBottom: 7 }}>
            AI-Generated Sponsor Stories by Segment
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {SEGMENTS.filter(s => s !== "All").map(seg => (
              <div key={seg} style={{
                flex: "1 1 255px",
                minWidth: 215,
                background: "#21243a",
                color: "#FFD700",
                borderRadius: 11,
                padding: "15px 17px",
                fontWeight: 800,
                fontSize: 16,
                marginBottom: 7,
                boxShadow: "0 1px 7px #FFD70022"
              }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 5 }}>{seg}</div>
                {sponsorStory(seg, segmentValues[seg], assets.filter(a => (a.segment || "") === seg && a.digital).reduce((sum, a) => sum + digitalValue(a), 0),
                  assets.find(a => (a.segment || "") === seg)?.growth || 6, assets.filter(a => (a.segment || "") === seg)
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Boardroom summary */}
        <div style={{
          marginTop: 34,
          background: "linear-gradient(90deg,#263b54 0%,#21243a 100%)",
          borderRadius: 16,
          padding: 25,
          color: "#FFD700",
          fontWeight: 900,
          fontSize: 19,
          boxShadow: "0 2px 15px #FFD70018"
        }}>
          <FaArrowRight style={{ color: "#27ef7d", marginRight: 9 }} />
          Boardroom summary: Current proposal value: <span style={{ color: "#27ef7d" }}>{currency(totalValue)}</span>.
          By segment: {Object.entries(segmentValues).map(([seg, val]) => `${seg}: ${currency(val)}`).join(', ')}.
          Maximize <b>ROI</b>, build multi-year partnerships with YoY growth, and deploy digital assets for next-generation value. Compare with previous scenarios for instant validation. All analytics available for download (PDF/CSV).
        </div>
      </section>
    </div>
  );
}
