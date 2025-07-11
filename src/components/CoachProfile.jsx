import React from "react";
import { FaUserTie, FaChartLine } from "react-icons/fa";

const CoachProfile = () => (
  <div style={{ maxWidth: 700, margin: "0 auto", padding: 30 }}>
    <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 30 }}><FaUserTie style={{ marginRight: 10 }} /> Coach 360 Profile</h2>
    {/* Insert full profile: photo, stats, feedback, logs, actions, KPIs */}
    <div style={{ background: "#232a2e", color: "#fff", borderRadius: 10, padding: 22, marginTop: 22 }}>
      <b>Name:</b> Ivan Ivanović<br />
      <b>Role:</b> U16 Head Coach<br />
      <b>Session Logs:</b> 41<br />
      <b>Player Feedback:</b> 4.7 / 5.0<br />
      <b>Current Initiatives:</b> "Youth Skills Academy", "Transition to U18"
    </div>
    <div style={{ marginTop: 18, color: "#FFD700" }}>
      <FaChartLine /> <b>KPI Performance:</b> 93% (Year to Date)
    </div>
  </div>
);
export default CoachProfile;
