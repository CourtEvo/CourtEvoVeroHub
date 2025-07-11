import React from "react";
import { FaUserTie, FaCheckCircle, FaBolt } from "react-icons/fa";

// Sample pathway roles (Point Guard, Big, Wing, Coach, etc.)
const pathways = [
  { role: "Point Guard", focus: "Decision making, leadership, P&R", achieved: true },
  { role: "Big", focus: "Rim protection, finishing, screening", achieved: false },
  { role: "Wing", focus: "3&D, cutting, versatile defense", achieved: true },
  { role: "Coach", focus: "Game model, teaching, periodization", achieved: false }
];

export default function DynamicRoleRoadmap() {
  return (
    <div style={{
      padding: 36, borderRadius: 36, background: "linear-gradient(120deg, #181e23 80%, #232a2e 100%)",
      boxShadow: "0 8px 48px #181e2330", color: "#fff", minHeight: 480
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <FaUserTie color="#FFD700" size={38} />
        <h1 style={{ fontWeight: 900, fontSize: 32, color: "#FFD700", letterSpacing: 1 }}>
          Dynamic Role-Based Roadmap
        </h1>
      </div>
      <div style={{ fontSize: 18, marginBottom: 22, color: "#FFD700" }}>
        Each player or coach gets a personalized, living roadmap. <span style={{ color: "#1de682", fontWeight: 700 }}>CourtEvo Vero Development Engine</span>
      </div>
      <table style={{
        width: "100%", background: "#23292f", borderRadius: 16, boxShadow: "0 2px 12px #FFD70011",
        borderCollapse: "separate", borderSpacing: 0
      }}>
        <thead>
          <tr style={{ background: "#FFD70011", color: "#FFD700", fontWeight: 900 }}>
            <th style={{ padding: 13, borderRadius: "16px 0 0 0" }}>Role</th>
            <th style={{ padding: 13 }}>Development Focus</th>
            <th style={{ padding: 13, borderRadius: "0 16px 0 0" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {pathways.map((p, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? "#232a2e" : "#181e23", color: "#fff", fontWeight: 600
            }}>
              <td style={{ padding: 13, color: "#FFD700", fontWeight:700 }}>{p.role}</td>
              <td style={{ padding: 13, color: "#1de682" }}>{p.focus}</td>
              <td style={{ padding: 13 }}>
                {p.achieved
                  ? <span style={{ color: "#1de682", fontWeight:700 }}><FaCheckCircle /> Complete</span>
                  : <span style={{ color: "#FFD700", fontWeight:700 }}><FaBolt /> In Progress</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
        marginTop: 24, background: "#FFD70022", borderRadius: 13, padding: 18, color: "#FFD700", display: "flex", alignItems: "center", gap: 12
      }}>
        <FaUserTie color="#FFD700" />
        <span>
          Enrich this roadmap with your Excel role pathway data or let coaches/athletes set and track live goals per CourtEvo Vero standards.
        </span>
      </div>
    </div>
  );
}
