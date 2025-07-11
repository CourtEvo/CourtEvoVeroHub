import React, { useState, useCallback } from "react";
import {
  FaUserTie,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaEdit,
  FaArrowRight,
  FaLightbulb,
  FaBolt,
} from "react-icons/fa";
import "./OperationalRoleClarityCockpit.css";

const demoData = [
  {
    area: "Organizational Structure",
    checklist: [
      "Club has a documented org chart",
      "All roles and responsibilities are current and visible",
    ],
    roles: [
      { name: "Director of Ops", raci: "A/R" },
      { name: "GM", raci: "C/I" },
      { name: "Head Coach", raci: "C/I" },
    ],
    efficiency: 5,
  },
  {
    area: "Youth Development Pathway",
    checklist: [
      "Club follows LTAD/ADM or equivalent",
      "Player progression mapped",
    ],
    roles: [
      { name: "Technical Director", raci: "A/R" },
      { name: "Youth Coord.", raci: "R" },
      { name: "Coaches", raci: "C/I" },
    ],
    efficiency: 3,
  },
  {
    area: "Financial & Resource Management",
    checklist: [
      "Annual budget reviewed",
      "Diversified revenue streams in place",
    ],
    roles: [
      { name: "Finance Dir", raci: "A/R" },
      { name: "Treasurer", raci: "R" },
      { name: "Sponsor Mgr", raci: "C/I" },
    ],
    efficiency: 2,
  },
  {
    area: "Coach Development & Integration",
    checklist: [
      "Annual coach education",
      "Tiered coach plan (Foundation-Performance-High Perf.)",
    ],
    roles: [
      { name: "Coach Dev Lead", raci: "A/R" },
      { name: "Head Coach", raci: "R" },
      { name: "Mentors", raci: "C/I" },
    ],
    efficiency: 4,
  },
  {
    area: "Marketing & Community Engagement",
    checklist: [
      "Active digital presence",
      "Outreach to schools/community",
    ],
    roles: [
      { name: "Marketing Mgr", raci: "A/R" },
      { name: "Community Coord", raci: "R" },
      { name: "Staff", raci: "C/I" },
    ],
    efficiency: 5,
  },
];

// Helper: efficiency color
const efficiencyColor = (score) => {
  if (score >= 5) return "#1de682";
  if (score >= 4) return "#FFD700";
  if (score >= 2) return "#f87c37";
  return "#e84855";
};

// Detect role conflicts (multiple A or none)
function detectConflicts(roles) {
  const aCount = roles.filter((r) => r.raci.includes("A")).length;
  return aCount === 0 || aCount > 1;
}

// AI Coach suggestion logic
function aiSuggest(area, roles, efficiency) {
  if (efficiency <= 2)
    return `Efficiency is low. Reassign 'A' to avoid overload.`;
  if (detectConflicts(roles))
    return `Resolve 'A' role: assign one clear Accountable per function.`;
  return "Structure optimal. Maintain regular review.";
}

export default function OperationalRoleClarityCockpit() {
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState(false);

  // Drag & drop simulation state (DEMO ONLY)
  const [draggedRole, setDraggedRole] = useState(null);
  const [data, setData] = useState(demoData);

  // Filter by search
  const filtered = data.filter((item) =>
    item.area.toLowerCase().includes(search.toLowerCase())
  );

  // Drag start
  const onDragStart = useCallback(
    (roleIdx, areaIdx) => setDraggedRole({ roleIdx, areaIdx }),
    []
  );

  // Drop handler (simulation: just alert)
  const onDrop = useCallback(
    (targetRoleIdx, targetAreaIdx) => {
      if (
        draggedRole &&
        (draggedRole.roleIdx !== targetRoleIdx ||
          draggedRole.areaIdx !== targetAreaIdx)
      ) {
        alert(
          `In full version, role "${data[draggedRole.areaIdx].roles[draggedRole.roleIdx].name}" could be reassigned here.`
        );
      }
      setDraggedRole(null);
    },
    [draggedRole, data]
  );

  // Edit Mode handler (future: enable editing RACI)
  const handleEditToggle = () => setEdit((e) => !e);

  return (
    <div className="orcc-main">
      <div className="orcc-header">
        <FaUserTie size={32} style={{ color: "#FFD700", marginRight: 10 }} />
        <div>
          <h2>Operational Role Clarity Cockpit</h2>
          <div className="orcc-subtitle">
            <FaCheckCircle style={{ color: "#1de682", marginRight: 6 }} />
            Instantly visualize accountability, risk & efficiency across all key club operations
          </div>
        </div>
      </div>

      <div className="orcc-searchbar">
        <FaSearch size={18} />
        <input
          type="text"
          placeholder="Search by operational area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleEditToggle}>
          <FaEdit /> {edit ? "Stop Editing" : "Edit Mode"}
        </button>
      </div>

      <div className="orcc-table">
        <div className="orcc-thead">
          <div className="orcc-th">Operational Area</div>
          <div className="orcc-th">Checklist Items</div>
          <div className="orcc-th">Key Roles & RACI</div>
          <div className="orcc-th">Efficiency</div>
          <div className="orcc-th">Alerts</div>
          <div className="orcc-th">AI Coach</div>
        </div>
        {filtered.map((row, areaIdx) => (
          <div
            className={`orcc-trow${detectConflicts(row.roles) ? " orcc-trow-alert" : ""}`}
            key={row.area}
          >
            <div className="orcc-td orcc-area">{row.area}</div>
            <div className="orcc-td">
              <ul>
                {row.checklist.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="orcc-td">
              <ul className="orcc-rolelist">
                {row.roles.map((r, roleIdx) => (
                  <li
                    key={roleIdx}
                    draggable={edit}
                    onDragStart={() => onDragStart(roleIdx, areaIdx)}
                    onDrop={() => onDrop(roleIdx, areaIdx)}
                    onDragOver={edit ? (e) => e.preventDefault() : undefined}
                    className={edit ? "orcc-draggable" : ""}
                  >
                    <FaUserTie style={{ marginRight: 4, color: "#FFD700" }} />
                    <span className="orcc-rolename">{r.name}</span>
                    <span className="orcc-raci">{r.raci}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="orcc-td">
              <div
                className="orcc-efficiency"
                style={{
                  background: efficiencyColor(row.efficiency),
                  color: "#232a2e",
                }}
              >
                {row.efficiency}/5
              </div>
            </div>
            <div className="orcc-td">
              {detectConflicts(row.roles) ? (
                <span className="orcc-alert">
                  <FaExclamationTriangle style={{ color: "#FFD700" }} />
                  RACI Conflict
                </span>
              ) : row.efficiency <= 2 ? (
                <span className="orcc-alert" style={{ color: "#e84855" }}>
                  <FaExclamationTriangle /> Low Score
                </span>
              ) : (
                <span style={{ color: "#1de682" }}>OK</span>
              )}
            </div>
            <div className="orcc-td orcc-ai-coach">
              <FaLightbulb style={{ color: "#1de682", marginRight: 5 }} />
              <span>{aiSuggest(row.area, row.roles, row.efficiency)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="orcc-footer">
        <FaBolt />
        <span>
          Board-ready: drag & drop roles (demo), live RACI alerts, and AI coach cards. PDF export & audit log coming next.
        </span>
      </div>
    </div>
  );
}
