import React, { useState } from "react";
import { FaChartBar, FaUsers, FaEuroSign, FaCrown, FaChartLine, FaBullseye, FaPlus, FaCheckCircle, FaExclamationTriangle, FaEdit, FaTrash, FaSave, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { CSVLink } from "react-csv";
import html2pdf from "html2pdf.js";
import moment from "moment";
import "./ClubStrategicGrowthDashboard.css";

// --- Demo Boardroom KPIs
const initialKPIs = [
  { area: "Finance", value: 73, trend: [67, 71, 69, 73], goal: 85, unit: "Score" },
  { area: "Talent", value: 62, trend: [55, 58, 60, 62], goal: 75, unit: "Score" },
  { area: "Operations", value: 85, trend: [81, 83, 84, 85], goal: 90, unit: "Score" },
  { area: "Community", value: 58, trend: [53, 54, 57, 58], goal: 70, unit: "Score" }
];

// --- Demo Club Growth Roadmap Timeline (Gantt)
const initialMilestones = [
  { id: 1, name: "Launch Youth Academy", start: "2025-07-01", end: "2025-12-01", status: "In Progress", owner: "Ops" },
  { id: 2, name: "Secure New Title Sponsor", start: "2025-08-15", end: "2025-10-15", status: "Planned", owner: "Finance" },
  { id: 3, name: "Talent Pipeline Program", start: "2025-09-01", end: "2026-02-01", status: "In Progress", owner: "Talent" },
  { id: 4, name: "Community Clinics", start: "2025-10-01", end: "2026-01-10", status: "Planned", owner: "Community" }
];

// --- Demo Club Goals/Initiatives
const initialGoals = [
  { id: 1, title: "Increase Net Revenue by 10%", owner: "Finance", deadline: "2025-12-31", status: "On Track" },
  { id: 2, title: "Win U18 Regional Title", owner: "Talent", deadline: "2026-05-15", status: "At Risk" },
  { id: 3, title: "Digitalize Ticket Sales", owner: "Operations", deadline: "2025-09-01", status: "Complete" },
  { id: 4, title: "Host Community Open Day", owner: "Community", deadline: "2025-08-20", status: "On Track" }
];

export default function ClubStrategicGrowthDashboard() {
  const [KPIs, setKPIs] = useState(initialKPIs);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [goals, setGoals] = useState(initialGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", owner: "Finance", deadline: "", status: "On Track" });

  // CSV Export
  const csvHeaders = [
    { label: "Title", key: "title" },
    { label: "Owner", key: "owner" },
    { label: "Deadline", key: "deadline" },
    { label: "Status", key: "status" }
  ];

  // PDF Export
  function handleExportPDF() {
    const el = document.getElementById("club-growth-dashboard-root");
    if (el) html2pdf().from(el).set({ margin: 0.4, filename: "ClubStrategicGrowthDashboard.pdf" }).save();
  }

  // Add goal logic
  function handleGoalFormChange(e) {
    const { name, value } = e.target;
    setGoalForm(g => ({ ...g, [name]: value }));
  }
  function handleAddGoal(e) {
    e.preventDefault();
    if (!goalForm.title || !goalForm.deadline) return;
    setGoals(g => [
      ...g,
      { ...goalForm, id: Date.now() }
    ]);
    setShowAddGoal(false);
    setGoalForm({ title: "", owner: "Finance", deadline: "", status: "On Track" });
  }
  function handleDeleteGoal(id) {
    if (window.confirm("Delete goal?")) setGoals(g => g.filter(x => x.id !== id));
  }

  // Milestone bar color logic
  function getOwnerColor(owner) {
    if (owner === "Finance") return "#FFD700";
    if (owner === "Talent") return "#27ef7d";
    if (owner === "Operations") return "#00B4D8";
    if (owner === "Community") return "#e94057";
    return "#fff";
  }
  // --- KPI trend data for Nivo line
  const kpiTrendData = KPIs.map(kpi => ({
    id: kpi.area,
    data: [
      { x: "Q1", y: kpi.trend[0] },
      { x: "Q2", y: kpi.trend[1] },
      { x: "Q3", y: kpi.trend[2] },
      { x: "Q4", y: kpi.trend[3] }
    ]
  }));

  return (
    <div id="club-growth-dashboard-root" style={{
      background: "linear-gradient(130deg,#232a2e 0%,#222b3a 100%)",
      borderRadius: 16,
      boxShadow: "0 4px 32px #FFD70044",
      padding: 32,
      minHeight: 1200,
      color: "#fff"
    }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 36, letterSpacing: 2, marginBottom: 11 }}>
        <FaChartBar style={{ marginBottom: -9, marginRight: 8 }} />
        CLUB STRATEGIC GROWTH COCKPIT
      </h2>
      <div style={{ color: "#FFD700aa", fontWeight: 700, marginBottom: 28, fontSize: 19 }}>
        Board-level KPIs, initiatives, and growth—CourtEvo Vero elite cockpit for basketball clubs.
      </div>

      {/* --- KPIs Wall --- */}
      <div style={{ display: "flex", gap: 22, marginBottom: 26, flexWrap: "wrap" }}>
        {KPIs.map(kpi => (
          <div key={kpi.area} style={{
            flex: 1,
            minWidth: 220,
            background: "#232d38",
            borderRadius: 14,
            boxShadow: "0 2px 16px #FFD70022",
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start"
          }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: getOwnerColor(kpi.area), marginBottom: 5 }}>
              {kpi.area} <FaBullseye style={{ marginLeft: 5 }} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 37, color: "#FFD700" }}>
              {kpi.value}
              <span style={{ fontSize: 17, color: "#FFD700bb", fontWeight: 700, marginLeft: 7 }}>{kpi.unit}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#27ef7d" }}>
              Goal: {kpi.goal}
            </div>
            <div style={{ marginTop: 7, width: "100%", height: 42 }}>
              <ResponsiveLine
                data={[{
                  id: kpi.area,
                  data: [
                    { x: "Q1", y: kpi.trend[0] },
                    { x: "Q2", y: kpi.trend[1] },
                    { x: "Q3", y: kpi.trend[2] },
                    { x: "Q4", y: kpi.trend[3] }
                  ]
                }]}
                margin={{ top: 8, right: 20, bottom: 16, left: 28 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
                axisLeft={null}
                axisBottom={null}
                colors={[getOwnerColor(kpi.area)]}
                pointSize={7}
                pointBorderWidth={3}
                pointBorderColor={{ from: "serieColor" }}
                enableGridX={false}
                enableGridY={false}
                enablePoints={true}
                useMesh={true}
                theme={{
                  axis: { ticks: { text: { fill: "#fff", fontWeight: 800 } } }
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- Club Growth Roadmap Timeline (Gantt style) --- */}
      <div style={{ background: "#232d38", borderRadius: 13, padding: 20, marginBottom: 28 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Growth Roadmap Timeline</h3>
        <div style={{ width: "100%", overflowX: "auto", minHeight: 80 }}>
          {milestones.map(m => (
            <div key={m.id} style={{
              background: getOwnerColor(m.owner),
              color: "#232a2e",
              borderRadius: 9,
              display: "inline-block",
              fontWeight: 800,
              fontSize: 17,
              padding: "5px 17px",
              marginRight: 18,
              marginBottom: 8
            }}>
              <FaChartLine style={{ marginRight: 6 }} />
              {m.name} <span style={{ fontSize: 15, fontWeight: 700 }}>({m.owner})</span> &rarr; {moment(m.start).format("YYYY-MM-DD")} – {moment(m.end).format("YYYY-MM-DD")}
              <span style={{
                marginLeft: 12,
                color: m.status === "In Progress" ? "#27ef7d" : m.status === "Planned" ? "#FFD700" : "#e94057",
                fontWeight: 900
              }}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Initiatives/Goals Table --- */}
      <div style={{ background: "#232d38", borderRadius: 13, padding: 20, marginBottom: 33 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 22, marginBottom: 0 }}>
            Club Goals & Initiatives
          </h3>
          <div>
            <button
              onClick={() => setShowAddGoal(true)}
              style={{
                background: "#27ef7d", color: "#232a2e", fontWeight: 900, fontSize: 16,
                border: "none", borderRadius: 7, padding: "7px 16px", marginRight: 10, cursor: "pointer"
              }}>
              <FaPlus style={{ marginBottom: -3, marginRight: 7 }} /> Add
            </button>
            <button
              onClick={handleExportPDF}
              style={{
                background: "#FFD700", color: "#232a2e", fontWeight: 900, fontSize: 16,
                border: "none", borderRadius: 7, padding: "7px 16px", marginRight: 10, cursor: "pointer"
              }}>
              <FaFilePdf style={{ marginBottom: -3, marginRight: 7 }} /> Export PDF
            </button>
            <CSVLink
              data={goals}
              headers={csvHeaders}
              filename={`Club_Strategic_Goals_${moment().format("YYYYMMDD")}.csv`}
              style={{
                background: "#00B4D8", color: "#fff", fontWeight: 900, fontSize: 16,
                border: "none", borderRadius: 7, padding: "7px 16px", textDecoration: "none"
              }}>
              <FaFileCsv style={{ marginBottom: -3, marginRight: 7 }} /> Export CSV
            </CSVLink>
          </div>
        </div>
        <table style={{ width: "100%", background: "#fff1", borderRadius: 9, fontWeight: 800 }}>
          <thead>
            <tr style={{ color: "#FFD700", fontWeight: 900, fontSize: 16 }}>
              <th>Goal/Initiative</th>
              <th>Owner</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map(g => (
              <tr key={g.id} style={{ color: "#fff", background: "#FFD70009", fontWeight: 700 }}>
                <td>{g.title}</td>
                <td>
                  <span style={{ color: getOwnerColor(g.owner), fontWeight: 900 }}>{g.owner}</span>
                </td>
                <td>{moment(g.deadline).format("YYYY-MM-DD")}</td>
                <td>
                  {g.status === "On Track" && <span style={{ color: "#27ef7d" }}><FaCheckCircle /> {g.status}</span>}
                  {g.status === "Complete" && <span style={{ color: "#FFD700" }}><FaCheckCircle /> {g.status}</span>}
                  {g.status === "At Risk" && <span style={{ color: "#e94057" }}><FaExclamationTriangle /> {g.status}</span>}
                </td>
                <td>
                  <button onClick={() => handleDeleteGoal(g.id)}
                    style={{
                      background: "#e94057", color: "#fff", border: "none", borderRadius: 7,
                      fontWeight: 900, padding: "2px 12px", fontSize: 15, cursor: "pointer"
                    }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- KPI Trend Overview (All Areas) --- */}
      <div style={{ background: "#232d38", borderRadius: 13, padding: 20, marginBottom: 26 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 21, marginBottom: 7 }}>KPI Trends by Pillar</h3>
        <div style={{ height: 220 }}>
          <ResponsiveLine
            data={kpiTrendData}
            margin={{ top: 30, right: 60, bottom: 50, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: 100, stacked: false, reverse: false }}
            axisLeft={{
              tickSize: 7, tickPadding: 7, tickRotation: 0,
              legend: "Score", legendOffset: -36, legendPosition: "middle",
              legendTextColor: "#fff", tickTextColor: "#fff"
            }}
            axisBottom={{
              tickSize: 7, tickPadding: 7, tickRotation: 0,
              legend: "Quarter", legendOffset: 35, legendPosition: "middle",
              legendTextColor: "#fff", tickTextColor: "#fff"
            }}
            theme={{
              axis: {
                ticks: { text: { fill: "#fff", fontWeight: 700 } },
                legend: { text: { fill: "#fff", fontWeight: 900, fontSize: 16 } }
              }
            }}
            colors={["#FFD700", "#27ef7d", "#00B4D8", "#e94057"]}
            pointSize={12}
            pointBorderWidth={3}
            pointBorderColor={{ from: "serieColor" }}
            enableGridX={false}
            enableGridY={true}
            enablePoints={true}
            useMesh={true}
            tooltip={({ point }) => (
              <div style={{ background: "#232a2e", color: "#FFD700", padding: "7px 15px", borderRadius: 7, fontWeight: 800, fontSize: 15, border: "1.5px solid #FFD700" }}>
                <b>{point.serieId} {point.data.x}:</b> {point.data.y}
              </div>
            )}
          />
        </div>
      </div>

      {/* --- Add Goal Modal --- */}
      {showAddGoal && (
        <div style={{
          position: "fixed", left: 0, top: 0, right: 0, bottom: 0, zIndex: 99,
          background: "rgba(30,32,40,0.97)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <form
            onSubmit={handleAddGoal}
            style={{
              background: "#232d38",
              borderRadius: 16,
              padding: 34,
              minWidth: 360,
              boxShadow: "0 8px 32px #FFD70033",
              color: "#FFD700"
            }}>
            <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 14 }}>Add Club Goal/Initiative</h3>
            <div style={{ marginBottom: 10 }}>
              <label>Title<br />
                <input name="title" value={goalForm.title} onChange={handleGoalFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Owner<br />
                <select name="owner" value={goalForm.owner} onChange={handleGoalFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }}>
                  <option value="Finance">Finance</option>
                  <option value="Talent">Talent</option>
                  <option value="Operations">Operations</option>
                  <option value="Community">Community</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Deadline<br />
                <input name="deadline" type="date" value={goalForm.deadline} onChange={handleGoalFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Status<br />
                <select name="status" value={goalForm.status} onChange={handleGoalFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }}>
                  <option value="On Track">On Track</option>
                  <option value="Complete">Complete</option>
                  <option value="At Risk">At Risk</option>
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: 15, marginTop: 7 }}>
              <button type="submit" style={{
                background: "#FFD700", color: "#232a2e", fontWeight: 900, fontSize: 17,
                border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer"
              }}>Add Goal</button>
              <button type="button" style={{
                background: "#e94057", color: "#fff", fontWeight: 900, fontSize: 17,
                border: "none", borderRadius: 7, padding: "9px 22px", cursor: "pointer"
              }} onClick={() => setShowAddGoal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ color: "#FFD70099", fontSize: 14, marginTop: 28, textAlign: "center" }}>
        CourtEvo Vero™ — Elite, actionable strategic growth cockpit for basketball clubs. Boardroom ready.
      </div>
    </div>
  );
}
