import React, { useState, useEffect } from "react";
import "./SponsorshipValueAnalytics.css";
import { FaDownload, FaExclamationTriangle, FaEnvelope, FaBell, FaUser, FaFilePdf, FaFileCsv, FaInfoCircle } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { CSVLink } from "react-csv";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { ResponsiveLine } from "@nivo/line";
import moment from "moment";

// --- Bulletproof Nivo Heatmap helper
function getHeatmapDataAndKeys(rawData, rawKeys, fallbackKeyList) {
  const keys = Array.isArray(rawKeys) && rawKeys.length ? rawKeys : fallbackKeyList;
  const data = Array.isArray(rawData) && rawData.length
    ? rawData.map(row => {
        const fullRow = { ...row };
        keys.forEach(k => {
          if (!(k in fullRow)) fullRow[k] = null;
        });
        return fullRow;
      })
    : [
        keys.reduce((acc, k) => ({ ...acc, [k]: null }), { asset: "No Data" })
      ];
  return [data, keys];
}

// --- Demo asset price benchmarks
const assetBenchmarks = [
  { asset: "LED Board", avgPrice: 7500 },
  { asset: "Social Media Post", avgPrice: 1500 },
  { asset: "Jersey Branding", avgPrice: 12000 },
  { asset: "Website Banner", avgPrice: 2500 },
  { asset: "Arena Signage", avgPrice: 6000 },
];

// --- Demo partners & activations
const partnerData = [
  {
    id: 1,
    partner: "Nike",
    assets: [
      { asset: "LED Board", committed: 8000, delivered: 8000, activation: "Game Night LED", ROI: 2.1, kpi: "Awareness", spark: 92, status: "On Track", docs: ["contract_nike.pdf"], aiSummary: "Excellent value; leverage digital more." }
    ],
    contact: { name: "Ana Smith", email: "ana@nike.com", phone: "+385 99 1234 123", renewal: "2026-06-01" },
    health: { commitment: 1, delivery: 1, activation: 1, roi: 2.1, risk: "Low" },
    feedback: [5, 5, 5]
  },
  {
    id: 2,
    partner: "T-Mobile",
    assets: [
      { asset: "Social Media Post", committed: 1600, delivered: 1400, activation: "Player IG Live", ROI: 1.7, kpi: "Engagement", spark: 71, status: "Slight Delay", docs: [], aiSummary: "Boost real-time posts to maximize reach." }
    ],
    contact: { name: "Zoran Kovač", email: "zoran@t-mobile.com", phone: "+385 91 4567 789", renewal: "2025-12-01" },
    health: { commitment: 0.88, delivery: 0.87, activation: 0.90, roi: 1.7, risk: "Medium" },
    feedback: [4, 3, 4]
  },
  {
    id: 3,
    partner: "Panasonic",
    assets: [
      { asset: "Arena Signage", committed: 6000, delivered: 5400, activation: "Courtside Placement", ROI: 1.3, kpi: "Brand Recall", spark: 64, status: "At Risk", docs: [], aiSummary: "Low delivery; prioritize meetings." }
    ],
    contact: { name: "Mario Lukić", email: "mario@panasonic.com", phone: "+385 98 3245 222", renewal: "2026-01-10" },
    health: { commitment: 0.92, delivery: 0.8, activation: 0.83, roi: 1.3, risk: "High" },
    feedback: [3, 4, 2]
  },
];

// --- Demo Gantt (impact timeline) data
const ganttData = [
  { partner: "Nike", asset: "LED Board", start: "2025-06-15", end: "2025-06-21", status: "Done" },
  { partner: "T-Mobile", asset: "Social Media Post", start: "2025-06-20", end: "2025-06-23", status: "Upcoming" },
  { partner: "Panasonic", asset: "Arena Signage", start: "2025-06-10", end: "2025-06-17", status: "Delayed" },
];

// --- KPI Spark Data (for trend lines)
const kpiTrends = [
  { id: "Nike", data: [{ x: "Q1", y: 80 }, { x: "Q2", y: 92 }] },
  { id: "T-Mobile", data: [{ x: "Q1", y: 65 }, { x: "Q2", y: 71 }] },
  { id: "Panasonic", data: [{ x: "Q1", y: 58 }, { x: "Q2", y: 64 }] },
];

// --- Heatmap data for ROI by asset/partner
const roiHeatMapData = [
  { asset: "LED Board", Nike: 2.1, "T-Mobile": null, Panasonic: null },
  { asset: "Social Media Post", Nike: null, "T-Mobile": 1.7, Panasonic: null },
  { asset: "Arena Signage", Nike: null, "T-Mobile": null, Panasonic: 1.3 },
];

// --- AI/Notifications logic
const activationDueSoon = Array.isArray(ganttData)
  ? ganttData.filter(g =>
      moment(g.end).isBefore(moment().add(7, "days")) &&
      g.status !== "Done"
    )
  : [];

// Feedback scores, 1–5 for NPS calculation
const avgNPS = Array.isArray(partnerData) && partnerData.length
  ? (
      partnerData
        .map(p => Array.isArray(p.feedback)
          ? p.feedback.reduce((a, b) => a + b, 0) / p.feedback.length
          : 0
        )
        .reduce((a, b) => a + b, 0) / partnerData.length
    ).toFixed(2)
  : 0;

// --- Report PDF export
const handleExportPDF = () => {
  const el = document.getElementById("sponsorship-analytics-root");
  if (el) html2pdf().from(el).set({ margin: 0.4, filename: "SponsorshipAnalytics.pdf" }).save();
};

// --- CSV export
const csvHeaders = [
  { label: "Partner", key: "partner" },
  { label: "Asset", key: "asset" },
  { label: "Committed", key: "committed" },
  { label: "Delivered", key: "delivered" },
  { label: "ROI (x)", key: "ROI" },
  { label: "Activation", key: "activation" },
  { label: "KPI", key: "kpi" },
  { label: "KPI Spark", key: "spark" },
  { label: "AI Summary", key: "aiSummary" },
];
const csvData = Array.isArray(partnerData)
  ? partnerData.flatMap(p =>
      Array.isArray(p.assets)
        ? p.assets.map(a => ({
            partner: p.partner,
            ...a,
          }))
        : []
    )
  : [];

export default function SponsorshipValueAnalytics() {
  // --- All hooks at the top!
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showContact, setShowContact] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scenario, setScenario] = useState({ asset: "LED Board", newValue: 10000, partner: "Nike" });
  const [scenarioResult, setScenarioResult] = useState(null);

  // --- 100% bulletproof Nivo Heatmap data
  const fallbackPartners = ["Nike", "T-Mobile", "Panasonic"];
  const [safeHeatmapData, safeHeatmapKeys] = getHeatmapDataAndKeys(
    roiHeatMapData,
    Array.isArray(partnerData) ? partnerData.map(p => p.partner) : [],
    fallbackPartners
  );

  // --- AI Scenario logic
  function runScenario() {
    const targetPartner = Array.isArray(partnerData)
      ? partnerData.find(p => p.partner === scenario.partner)
      : null;
    if (!targetPartner) return setScenarioResult("Partner not found.");
    const asset = Array.isArray(targetPartner.assets)
      ? targetPartner.assets.find(a => a.asset === scenario.asset)
      : null;
    if (!asset) return setScenarioResult("Asset not found for this partner.");
    const baseROI = asset.ROI;
    const baseVal = asset.committed;
    const delta = scenario.newValue - baseVal;
    const projectedROI = (baseROI * (1 + delta / baseVal)).toFixed(2);
    setScenarioResult(
      `If you raise the committed value for ${scenario.partner}'s ${scenario.asset} to €${scenario.newValue}, projected ROI becomes ${projectedROI}x.`
    );
  }

  // --- Notifications for activations due
  useEffect(() => {
    if (Array.isArray(activationDueSoon) && activationDueSoon.length) {
      activationDueSoon.forEach(act => {
        // Uncomment for real use: alert(`[NOTIFICATION] Activation for ${act.partner} - ${act.asset} is due on ${act.end}!`);
      });
    }
  }, []);

  // --- GUARD: Never crash, always return valid UI!
  if (!Array.isArray(safeHeatmapData) || !Array.isArray(safeHeatmapKeys)) {
    return <div style={{ color: "#FFD700", padding: 30 }}>Loading…</div>;
  }

  return (
    <div id="sponsorship-analytics-root" className="sponsorship-analytics" style={{
      background: "linear-gradient(130deg,#222b3c 0%,#3b4252 100%)",
      borderRadius: 16,
      boxShadow: "0 4px 32px #FFD70044",
      padding: 32,
      minHeight: 1250,
      color: "#fff",
      position: "relative"
    }}>
      {/* AI Board Alerts & Report Export */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#FFD700", fontWeight: 800, fontSize: 33, letterSpacing: 1, marginBottom: 7 }}>Partner Value Table</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Array.isArray(partnerData) && partnerData.map(p =>
              <div key={p.partner} style={{
                background: p.health.risk === "High" ? "#e94057bb" : p.health.risk === "Medium" ? "#FFD700cc" : "#27ef7dcc",
                color: p.health.risk === "High" ? "#fff" : "#222",
                borderRadius: 9,
                boxShadow: "0 2px 8px #181e2325",
                fontWeight: 700,
                padding: "12px 24px",
                marginBottom: 6,
                display: "flex",
                alignItems: "center"
              }}>
                <FaUser style={{ marginRight: 8, fontSize: 22 }} />
                {p.partner}
                <span style={{ marginLeft: 10, fontWeight: 700, fontSize: 15, color: "#fff", background: "#222a", padding: "2px 9px", borderRadius: 7 }}>
                  Health: {p.health.risk}
                </span>
                <span style={{ marginLeft: 12, color: "#FFD700", fontSize: 15 }}>ROI: {p.health.roi}x</span>
                <span style={{ marginLeft: 12, color: "#fff" }} title={`Contact: ${p.contact.name}`}>
                  <FaEnvelope style={{ marginRight: 5 }} />
                  <button
                    style={{
                      background: "#FFD700",
                      color: "#222",
                      border: "none",
                      borderRadius: 4,
                      padding: "2px 7px",
                      fontWeight: 700,
                      marginLeft: 3,
                      cursor: "pointer"
                    }}
                    onClick={() => setShowContact(p.partner)}
                  >Contact</button>
                </span>
                <span style={{ marginLeft: 12 }}>
                  <FaBell style={{ color: "#FFD700", marginBottom: -2, marginRight: 3 }} />
                  Renewal: {moment(p.contact.renewal).format("YYYY-MM-DD")}
                </span>
              </div>
            )}
          </div>
          {/* Table */}
          <table className="partner-value-table" style={{
            width: "100%",
            background: "#222c",
            borderRadius: 13,
            boxShadow: "0 2px 8px #FFD70033",
            marginTop: 9,
            marginBottom: 23,
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr style={{ background: "#FFD700cc", color: "#222", fontWeight: 900, fontSize: 17 }}>
                <th>Partner</th>
                <th>Assets</th>
                <th>Committed (€)</th>
                <th>Delivered (€)</th>
                <th>ROI (x)</th>
                <th>Activation</th>
                <th>KPI Spark</th>
                <th>AI Summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(partnerData) && partnerData.flatMap(p =>
                Array.isArray(p.assets) && p.assets.map((a, i) => (
                  <tr key={`${p.partner}-${a.asset}-${i}`} style={{
                    background: "#fff2",
                    color: "#fff",
                    fontWeight: 600,
                    borderBottom: "1px solid #FFD70033"
                  }}>
                    <td>{p.partner}</td>
                    <td>{a.asset}</td>
                    <td>{a.committed}</td>
                    <td>{a.delivered}</td>
                    <td>{a.ROI}</td>
                    <td>{a.activation}</td>
                    <td>
                      <span style={{ cursor: "pointer", color: "#FFD700", textDecoration: "underline" }}
                        onClick={() => setSelectedKPI({ ...a, partner: p.partner })}>
                        {a.spark}
                      </span>
                    </td>
                    <td>
                      <FaInfoCircle style={{ color: "#FFD700", marginRight: 4 }} />
                      {a.aiSummary}
                    </td>
                    <td>
                      <button onClick={() => setShowFeedback(p.partner)}
                        style={{
                          background: "#FFD700",
                          color: "#222",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: 6,
                          padding: "2px 9px",
                          marginRight: 4,
                          cursor: "pointer"
                        }}>
                        Feedback
                      </button>
                      <button
                        style={{
                          background: "#27ef7d",
                          color: "#222",
                          fontWeight: 700,
                          border: "none",
                          borderRadius: 6,
                          padding: "2px 9px",
                          cursor: "pointer"
                        }}
                        onClick={() => setShowContact(p.partner)}
                      >Contact</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "right" }}>
          <button onClick={handleExportPDF}
            style={{
              background: "#FFD700",
              color: "#222",
              border: "none",
              borderRadius: 7,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 2px 10px #FFD70044",
              marginRight: 12,
              cursor: "pointer"
            }}>
            <FaFilePdf style={{ marginRight: 8 }} /> Export PDF
          </button>
          <CSVLink data={csvData} headers={csvHeaders}
            filename={`CourtEvoVero_SponsorshipAnalytics_${moment().format("YYYYMMDD")}.csv`}
            style={{
              background: "#27ef7d",
              color: "#222",
              border: "none",
              borderRadius: 7,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 2px 10px #27ef7d44",
              textDecoration: "none"
            }}>
            <FaFileCsv style={{ marginRight: 8 }} /> Export CSV
          </CSVLink>
        </div>
      </div>

      {/* --- AI-Powered Alerts --- */}
      <div style={{ marginBottom: 23 }}>
        {Array.isArray(activationDueSoon) && activationDueSoon.length > 0 && (
          <div style={{
            background: "#FFD70033",
            color: "#FFD700",
            borderRadius: 8,
            padding: "12px 20px",
            fontWeight: 700,
            fontSize: 17,
            marginBottom: 13,
            display: "flex",
            alignItems: "center",
            gap: 18
          }}>
            <FaExclamationTriangle style={{ color: "#e94057", marginRight: 8, fontSize: 28 }} />
            <span>
              {activationDueSoon.map(act =>
                <span key={act.partner + act.asset} style={{ marginRight: 22 }}>
                  <b>{act.partner}</b> activation <b>{act.asset}</b> due on {act.end}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* --- Asset Benchmark Tab --- */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 700, fontSize: 25, marginTop: 18, marginBottom: 10 }}>Asset Price Benchmarks</h3>
        <table style={{ width: "70%", background: "#222c", borderRadius: 8, color: "#FFD700", fontWeight: 700 }}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Market Average Price (€)</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(assetBenchmarks) && assetBenchmarks.map(b =>
              <tr key={b.asset}>
                <td>{b.asset}</td>
                <td>{b.avgPrice}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- KPI Trend Sparkline --- */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 700, fontSize: 23, marginTop: 6, marginBottom: 4 }}>Partner KPI Trends</h3>
        <div style={{ height: 200, background: "#222c", borderRadius: 10, padding: 10 }}>
          <ResponsiveLine
            data={kpiTrends}
            margin={{ top: 10, right: 40, bottom: 40, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
            axisLeft={{ tickSize: 7, tickPadding: 5, tickRotation: 0, legend: "KPI", legendOffset: -40, legendPosition: "middle" }}
            axisBottom={{ tickSize: 7, tickPadding: 5, tickRotation: 0, legend: "Quarter", legendOffset: 34, legendPosition: "middle" }}
            colors={["#FFD700", "#27ef7d", "#e94057"]}
            pointSize={9}
            pointBorderWidth={3}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            enableGridX={false}
            enableGridY={true}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 80,
                translateY: 0,
                itemsSpacing: 8,
                itemDirection: "left-to-right",
                itemWidth: 90,
                itemHeight: 20,
                symbolSize: 18,
                symbolShape: "circle",
                itemTextColor: "#FFD700"
              }
            ]}
          />
        </div>
      </div>

      {/* --- Heatmap ROI --- */}
      
      {/* --- Gantt/Impact Timeline --- */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 700, fontSize: 23, marginBottom: 8 }}>Activation Timeline</h3>
        <div style={{ minHeight: 140, background: "#222c", borderRadius: 10, padding: 12 }}>
          {Array.isArray(ganttData) && ganttData.map((g, idx) =>
            <div key={idx} style={{
              display: "flex", alignItems: "center", marginBottom: 7, gap: 10
            }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>{g.partner}</span>
              <span>{g.asset}</span>
              <span>
                <b>{g.status}</b>
                <span style={{
                  marginLeft: 8,
                  color: g.status === "Done" ? "#27ef7d" : g.status === "Upcoming" ? "#FFD700" : "#e94057"
                }}>
                  ●
                </span>
              </span>
              <span>
                {moment(g.start).format("YYYY-MM-DD")} → {moment(g.end).format("YYYY-MM-DD")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- Sponsor Health Score --- */}
      <div style={{ marginBottom: 38 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 700, fontSize: 22, marginBottom: 9 }}>Sponsor Health Score</h3>
        <div style={{ display: "flex", gap: 13 }}>
          {Array.isArray(partnerData) && partnerData.map(p =>
            <div key={p.partner} style={{
              background: "#FFD70033",
              color: "#FFD700",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 17,
              padding: "10px 18px"
            }}>
              {p.partner}:
              <span style={{ color: "#27ef7d", marginLeft: 8 }}>ROI {p.health.roi}x</span> |
              <span style={{ color: "#FFD700", marginLeft: 8 }}>Delivery {(p.health.delivery * 100).toFixed(0)}%</span> |
              <span style={{ color: "#FFD700", marginLeft: 8 }}>Activation {(p.health.activation * 100).toFixed(0)}%</span> |
              <span style={{ color: p.health.risk === "High" ? "#e94057" : p.health.risk === "Medium" ? "#FFD700" : "#27ef7d", marginLeft: 8 }}>{p.health.risk} Risk</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Scenario/Forecast Engine --- */}
      <div style={{ marginBottom: 35, background: "#222c", borderRadius: 10, padding: 15 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 700, fontSize: 21 }}>Scenario/Forecast Engine</h3>
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <select value={scenario.partner} onChange={e => setScenario({ ...scenario, partner: e.target.value })}>
            {Array.isArray(partnerData) && partnerData.map(p => <option key={p.partner} value={p.partner}>{p.partner}</option>)}
          </select>
          <select value={scenario.asset} onChange={e => setScenario({ ...scenario, asset: e.target.value })}>
            {Array.isArray(assetBenchmarks) && assetBenchmarks.map(a => <option key={a.asset} value={a.asset}>{a.asset}</option>)}
          </select>
          <input
            type="number"
            value={scenario.newValue}
            min={0}
            style={{ width: 120, borderRadius: 6, border: "1px solid #FFD700", marginLeft: 6, padding: 5 }}
            onChange={e => setScenario({ ...scenario, newValue: Number(e.target.value) })}
          />
          <button
            onClick={runScenario}
            style={{
              background: "#FFD700",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 6,
              padding: "5px 18px",
              marginLeft: 6,
              cursor: "pointer"
            }}
          >
            Forecast
          </button>
          <span style={{ color: "#27ef7d", marginLeft: 16 }}>
            {scenarioResult}
          </span>
        </div>
      </div>

      {/* --- Sponsor Feedback/NPS --- */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 700, fontSize: 22, marginBottom: 7 }}>Sponsor Feedback Loop (NPS)</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {Array.isArray(partnerData) && partnerData.map(p =>
            <div key={p.partner} style={{
              background: "#FFD70022",
              color: "#FFD700",
              borderRadius: 8,
              padding: "7px 18px",
              fontWeight: 800
            }}>
              {p.partner}: <span style={{ color: "#27ef7d", marginLeft: 7 }}>{Array.isArray(p.feedback) ? (p.feedback.reduce((a, b) => a + b, 0) / p.feedback.length).toFixed(1) : "--"}/5</span>
            </div>
          )}
          <span style={{ color: "#FFD700", fontWeight: 800, marginLeft: 20 }}>Avg. NPS: {avgNPS}/5</span>
        </div>
      </div>

      {/* --- Drilldown KPI/Contact/Feedback Sidebars --- */}
      {selectedKPI && (
        <div style={{
          position: "fixed", right: 0, top: 0, bottom: 0, width: 400,
          background: "#222b3c", color: "#FFD700", boxShadow: "-2px 0 24px #FFD70044",
          zIndex: 50, padding: 32
        }}>
          <h3 style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, marginBottom: 13 }}>KPI Drilldown: {selectedKPI.partner} - {selectedKPI.asset}</h3>
          <p><b>Activation:</b> {selectedKPI.activation}</p>
          <p><b>KPI:</b> {selectedKPI.kpi}</p>
          <p><b>ROI:</b> {selectedKPI.ROI}x</p>
          <div style={{ marginTop: 20 }}>
            <b>AI Summary:</b>
            <div style={{ color: "#27ef7d", fontWeight: 700, marginTop: 6 }}>{selectedKPI.aiSummary}</div>
          </div>
          <div style={{ marginTop: 18 }}>
            <b>Supporting Docs:</b>
            <ul>
              {selectedKPI.docs && selectedKPI.docs.length > 0
                ? selectedKPI.docs.map(d => <li key={d}><a href={`/${d}`} style={{ color: "#FFD700" }}>{d}</a></li>)
                : <li>No docs.</li>
              }
            </ul>
          </div>
          <button
            onClick={() => setSelectedKPI(null)}
            style={{
              marginTop: 24,
              background: "#FFD700",
              color: "#222",
              border: "none",
              borderRadius: 6,
              padding: "7px 22px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer"
            }}>Close</button>
        </div>
      )}

      {showContact && (() => {
        const p = Array.isArray(partnerData)
          ? partnerData.find(x => x.partner === showContact)
          : null;
        return p && (
          <div style={{
            position: "fixed", right: 0, top: 0, bottom: 0, width: 400,
            background: "#222b3c", color: "#FFD700", boxShadow: "-2px 0 24px #FFD70044",
            zIndex: 50, padding: 32
          }}>
            <h3 style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, marginBottom: 13 }}>
              Contact: {p.partner}
            </h3>
            <div style={{ fontWeight: 800 }}>
              <FaUser style={{ marginRight: 8 }} /> {p.contact.name}<br />
              <b>Email:</b> {p.contact.email}<br />
              <b>Phone:</b> {p.contact.phone}<br />
              <b>Renewal:</b> {moment(p.contact.renewal).format("YYYY-MM-DD")}
            </div>
            <button
              onClick={() => setShowContact(null)}
              style={{
                marginTop: 24,
                background: "#FFD700",
                color: "#222",
                border: "none",
                borderRadius: 6,
                padding: "7px 22px",
                fontWeight: 700,
                fontSize: 17,
                cursor: "pointer"
              }}>Close</button>
          </div>
        )
      })()}

      {showFeedback && (() => {
        const p = Array.isArray(partnerData)
          ? partnerData.find(x => x.partner === showFeedback)
          : null;
        return p && (
          <div style={{
            position: "fixed", right: 0, top: 0, bottom: 0, width: 400,
            background: "#222b3c", color: "#FFD700", boxShadow: "-2px 0 24px #FFD70044",
            zIndex: 50, padding: 32
          }}>
            <h3 style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, marginBottom: 13 }}>
              Feedback: {p.partner}
            </h3>
            <div>
              <b>Last Feedback Scores:</b>
              <div style={{ fontWeight: 700, marginTop: 7, fontSize: 19 }}>
                {Array.isArray(p.feedback)
                  ? p.feedback.map((s, i) => <span key={i} style={{ marginRight: 8 }}>{s}/5</span>)
                  : "No feedback"}
              </div>
              <button
                onClick={() => setShowFeedback(null)}
                style={{
                  marginTop: 24,
                  background: "#FFD700",
                  color: "#222",
                  border: "none",
                  borderRadius: 6,
                  padding: "7px 22px",
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: "pointer"
                }}>Close</button>
            </div>
          </div>
        )
      })()}
    </div>
  );
}
