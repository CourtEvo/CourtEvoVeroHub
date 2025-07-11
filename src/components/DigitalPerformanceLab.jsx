import React, { useState } from "react";
import {
  FaCloudDownloadAlt, FaServer, FaWifi, FaChartLine, FaMicrochip, FaRobot,
  FaTachometerAlt, FaPlug, FaTools, FaDownload, FaBolt, FaCheckCircle, FaExclamationCircle
} from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { motion, AnimatePresence } from "framer-motion";
import "./DigitalPerformanceLab.css";

// --- DEMO DATA
const LAB_SYSTEMS = [
  { system: "Athlete Tracking", status: "Online", dataPoints: 82345, lastUpdate: "2025-06-18", type: "Wearable IoT", coverage: 93, kpi: "Load Mgmt.", insight: "95%+ coverage; auto-sync enabled" },
  { system: "Facility WiFi", status: "Online", dataPoints: 54200, lastUpdate: "2025-06-18", type: "Network", coverage: 100, kpi: "Bandwidth", insight: "New 6GHz router deployed" },
  { system: "Force Plates", status: "Offline", dataPoints: 0, lastUpdate: "2025-06-17", type: "Sensor", coverage: 0, kpi: "Power Test", insight: "Pending repair: delivery in 3 days" },
  { system: "Video Analysis", status: "Online", dataPoints: 4559, lastUpdate: "2025-06-18", type: "AI/ML", coverage: 100, kpi: "Auto Tag", insight: "AI model retrained Q2/2025" },
  { system: "Heart Rate", status: "Online", dataPoints: 15210, lastUpdate: "2025-06-18", type: "Wearable IoT", coverage: 85, kpi: "Recovery", insight: "Resting HR drop: 2.5% vs. Q1" },
];

const DIGITAL_TRENDS = [
  { id: "Online Systems", color: "#FFD700", data: [{ x: "2022", y: 3 }, { x: "2023", y: 4 }, { x: "2024", y: 6 }, { x: "2025", y: 8 }] },
  { id: "Data Points (k)", color: "#27ef7d", data: [{ x: "2022", y: 120 }, { x: "2023", y: 191 }, { x: "2024", y: 320 }, { x: "2025", y: 420 }] },
  { id: "Coverage (%)", color: "#e94057", data: [{ x: "2022", y: 63 }, { x: "2023", y: 79 }, { x: "2024", y: 88 }, { x: "2025", y: 93 }] }
];

const INCIDENTS = [
  { date: "2025-06-17", system: "Force Plates", incident: "Connection Loss", status: "Unresolved", severity: "High" },
  { date: "2025-05-22", system: "Heart Rate", incident: "Wearable Battery Issue", status: "Resolved", severity: "Low" }
];

const DIGITAL_READINESS = [
  { name: "IoT Coverage", value: 93, goal: 98 },
  { name: "Data Integrity", value: 98, goal: 100 },
  { name: "System Uptime", value: 99.3, goal: 99.8 },
  { name: "User Adoption", value: 91, goal: 95 },
];

export default function DigitalPerformanceLab() {
  const [trendType, setTrendType] = useState("Online Systems");
  const [showDetails, setShowDetails] = useState(null);

  // --- CHART COLORS for XY axis/labels
  const axisColor = "#FFD700cc";
  const labelColor = "#27ef7d";

  return (
    <div className="dpl-main">
      <div className="dpl-header">
        <FaCloudDownloadAlt style={{ color: "#FFD700", fontSize: 36, marginRight: 16 }} />
        <div>
          <div className="dpl-title">Digital Infrastructure & Performance Lab</div>
          <div className="dpl-desc">Your cockpit for live digital systems, wearables, analytics & innovation in elite basketball.</div>
        </div>
      </div>

      {/* --- Systems Grid --- */}
      <div className="dpl-section-title">Connected Systems</div>
      <div className="dpl-systems-grid">
        {LAB_SYSTEMS.map(sys => (
          <motion.div
            key={sys.system}
            className="dpl-system-card"
            style={{
              borderColor: sys.status === "Online" ? "#27ef7d" : "#e94057",
              boxShadow: sys.status === "Online" ? "0 2px 12px #27ef7d33" : "0 2px 12px #e9405733"
            }}
            whileHover={{ scale: 1.045, boxShadow: "0 6px 30px #FFD70033" }}
            onClick={() => setShowDetails(sys)}
          >
            <div className="dpl-system-top">
              <span className="dpl-system-label">{sys.system}</span>
              <span className={`dpl-system-status ${sys.status.toLowerCase()}`}>{sys.status}</span>
            </div>
            <div className="dpl-system-icons">
              <FaServer /> <FaWifi /> <FaChartLine /> <FaMicrochip /> <FaRobot />
            </div>
            <div className="dpl-system-info">
              <span>Type: <b>{sys.type}</b></span>
              <span>Coverage: <b>{sys.coverage}%</b></span>
            </div>
            <div className="dpl-system-data">
              <div>Data: <b>{sys.dataPoints.toLocaleString()}</b></div>
              <div>KPI: <b>{sys.kpi}</b></div>
              <div>Last: <b>{sys.lastUpdate}</b></div>
            </div>
            <div className="dpl-system-insight">{sys.insight}</div>
          </motion.div>
        ))}
      </div>

      {/* --- Micro-Insight Readiness KPIs --- */}
      <div className="dpl-section-title">Digital Readiness Scoreboard</div>
      <div className="dpl-readiness-row">
        {DIGITAL_READINESS.map(kpi => (
          <div className="dpl-readiness-card" key={kpi.name}>
            <div className="dpl-readiness-label">{kpi.name}</div>
            <div className="dpl-readiness-bar">
              <div className="dpl-readiness-bar-fill" style={{
                width: `${kpi.value}%`,
                background: kpi.value >= kpi.goal * 0.98 ? "linear-gradient(90deg,#27ef7d,#FFD700 90%)" : "#FFD700",
              }} />
              <span className="dpl-readiness-text">{kpi.value}%</span>
            </div>
            <div className="dpl-readiness-goal">Goal: {kpi.goal}%</div>
          </div>
        ))}
      </div>

      {/* --- Digitalization Trends --- */}
      <div className="dpl-section-title">Digitalization Trends</div>
      <div className="dpl-trends-tabs">
        {DIGITAL_TRENDS.map(t => (
          <button
            key={t.id}
            className={`dpl-tab-btn ${trendType === t.id ? "active" : ""}`}
            onClick={() => setTrendType(t.id)}
          >{t.id}</button>
        ))}
      </div>
      <div style={{ height: 240, background: "#232b38", borderRadius: 13, padding: 16 }}>
        <ResponsiveLine
          data={DIGITAL_TRENDS.filter(t => t.id === trendType)}
          margin={{ top: 18, right: 30, bottom: 34, left: 48 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          axisLeft={{
            tickSize: 7, tickPadding: 6, tickRotation: 0,
            legend: trendType, legendOffset: -34, legendPosition: "middle",
            tickValues: 5,
            tickColor: axisColor,
            legendTextColor: axisColor,
            style: { fill: axisColor }
          }}
          axisBottom={{
            tickSize: 7, tickPadding: 5, tickRotation: 0,
            legend: "Year", legendOffset: 28, legendPosition: "middle",
            tickColor: axisColor,
            legendTextColor: axisColor,
            style: { fill: axisColor }
          }}
          theme={{
            axis: {
              ticks: {
                text: { fill: axisColor, fontWeight: 700, fontSize: 17 }
              },
              legend: { text: { fill: axisColor } }
            },
            labels: { text: { fill: labelColor, fontWeight: 900, fontSize: 18 } },
            grid: { line: { stroke: "#FFD70022" } }
          }}
          colors={[DIGITAL_TRENDS.find(t => t.id === trendType)?.color || "#FFD700"]}
          pointSize={13}
          pointBorderWidth={4}
          pointBorderColor={{ from: "serieColor" }}
          enableGridX={false}
          enableGridY={true}
          labelTextColor="#FFD700"
          curve="monotoneX"
        />
      </div>

      {/* --- Incident Log (with Callout) --- */}
      <div className="dpl-section-title">Incident Log & AI Alerts</div>
      <div className="dpl-incident-feed">
        {INCIDENTS.map(inc => (
          <div
            key={inc.date + inc.system}
            className={`dpl-incident-card ${inc.severity === "High" ? "high" : "low"}`}
          >
            <div className="dpl-incident-top">
              {inc.severity === "High"
                ? <FaExclamationCircle color="#e94057" style={{ marginRight: 8, fontSize: 20 }} />
                : <FaCheckCircle color="#27ef7d" style={{ marginRight: 8, fontSize: 20 }} />}
              <div>
                <b>{inc.system}</b>
                <span style={{ marginLeft: 10, color: "#FFD700" }}>{inc.date}</span>
              </div>
            </div>
            <div className="dpl-incident-body">{inc.incident}</div>
            <div className="dpl-incident-status">
              <span>Status: <b style={{ color: inc.status === "Resolved" ? "#27ef7d" : "#FFD700" }}>{inc.status}</b></span>
              <span className="dpl-incident-severity">Severity: <b>{inc.severity}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* --- System Details Modal --- */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="dpl-modal"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.23 }}
          >
            <h3 className="dpl-modal-title"><FaPlug style={{ marginRight: 9 }} /> {showDetails.system} Details</h3>
            <div><b>Status:</b> <span style={{ color: showDetails.status === "Online" ? "#27ef7d" : "#e94057" }}>{showDetails.status}</span></div>
            <div><b>Type:</b> {showDetails.type}</div>
            <div><b>Data Points:</b> {showDetails.dataPoints.toLocaleString()}</div>
            <div><b>KPI:</b> {showDetails.kpi}</div>
            <div><b>Coverage:</b> {showDetails.coverage}%</div>
            <div><b>Last Update:</b> {showDetails.lastUpdate}</div>
            <div style={{ marginTop: 13 }}><b>Insight:</b> <span style={{ color: "#FFD700" }}>{showDetails.insight}</span></div>
            <button className="dpl-close-btn" onClick={() => setShowDetails(null)}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="dpl-download-btn"><FaDownload style={{ marginRight: 8 }} />Export Data</button>
    </div>
  );
}
