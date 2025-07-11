import React, { useState } from "react";
import { FaClipboardList, FaFileExport, FaDownload, FaCrown, FaHistory, FaRocket, FaChartBar, FaFlag, FaUserTie, FaUserShield, FaBookOpen, FaCheckCircle, FaExclamationTriangle, FaExternalLinkAlt, FaPen, FaPollH } from "react-icons/fa";

// -- DEMO BOARD MEMBERS & Poll --
const BOARD = ["President", "Finance Director", "Technical Director", "Club Secretary"];

const DEMO = {
  clubName: "Basketball Club Evo",
  date: "2024-07-07",
  kpis: [
    { label: "Projects Complete", value: "67%", color: "#1de682" },
    { label: "Urgent Board Items", value: "3", color: "#FFD700" },
    { label: "Policy Reviews Pending", value: "1", color: "#e82e2e" },
    { label: "Open Roadmap Milestones", value: "4", color: "#FFD700" }
  ],
  urgent: [
    { module: "Accelerator Roadmap", item: "Academy Registration Digitalization", due: "2024-07-01", action: "Review", url: "#" },
    { module: "Policy & Compliance", item: "Medical Records Upload Policy", due: "2024-07-05", action: "Approve", url: "#" }
  ],
  analytics: [
    { module: "Volunteer Pipeline", stat: "12 active, 3 ready for hire" },
    { module: "Coach CPD", stat: "85% CPD complete, 4 logs overdue" },
    { module: "Innovation Board", stat: "7 new ideas, 2 in final review" },
    { module: "Data Privacy", stat: "100% audit complete, no incidents" },
    { module: "Boardroom Diagnostic", stat: "Last SWOT: 'Leadership' area improved" }
  ],
  files: [
    { name: "Full Roadmap Export", url: "#", icon: <FaRocket /> },
    { name: "Compliance Summary", url: "#", icon: <FaUserShield /> },
    { name: "Volunteer Pipeline", url: "#", icon: <FaUserTie /> },
    { name: "CPD Status Export", url: "#", icon: <FaBookOpen /> },
    { name: "Diagnostic Report", url: "#", icon: <FaChartBar /> }
  ],
  actions: [
    { type: "Decision Required", item: "Approve New Sponsorship Model", module: "Innovation Board", url: "#" },
    { type: "Board Review", item: "Coach Promotion Policy", module: "Policy & Compliance", url: "#" },
    { type: "Assign", item: "Volunteer Juric to Full-Time", module: "Volunteer Pipeline", url: "#" }
  ],
  wins: [
    "New digital registration system launched on time.",
    "Two new sponsors signed.",
    "Player health compliance at 100%."
  ],
  risks: [
    "Academy registration overdue.",
    "CPD logs incomplete for 4 coaches.",
    "Pending board review on club diagnostic."
  ]
};

export default function BoardPackGenerator() {
  // e-signature state & poll
  const [signatures, setSignatures] = useState(BOARD.map(() => false));
  const [preMeeting, setPreMeeting] = useState("");
  const [postMeeting, setPostMeeting] = useState("");
  const [poll, setPoll] = useState(BOARD.map(() => null));

  // Impact score: auto calc (KPI avg - overdue/urgent penalty)
  const kpiNum = DEMO.kpis.map(k => Number(k.value.replace("%", "")));
  const avgKPI = Math.round(kpiNum.reduce((a, b) => a + b, 0) / kpiNum.length);
  const penalty = DEMO.urgent.length * 7 + DEMO.actions.length * 4;
  const impactScore = Math.max(0, Math.round(avgKPI - penalty));
  const readiness = impactScore > 75 ? "green" : impactScore > 55 ? "yellow" : "red";

  function handleSign(idx) {
    setSignatures(arr => arr.map((v, i) => i === idx ? true : v));
  }
  function handlePoll(idx, val) {
    setPoll(arr => arr.map((v, i) => i === idx ? val : v));
  }
  function printPack() {
    window.print();
  }
  function exportCSV() {
    let csv = [
      ["Club", DEMO.clubName],
      ["Date", DEMO.date], [],
      ["KPIs:"]
    ];
    DEMO.kpis.forEach(k => csv.push([k.label, k.value]));
    csv.push([]);
    csv.push(["Urgent/Overdue:"]);
    DEMO.urgent.forEach(u => csv.push([u.module, u.item, u.due, u.action]));
    csv.push([]);
    csv.push(["Analytics:"]);
    DEMO.analytics.forEach(a => csv.push([a.module, a.stat]));
    csv.push([]);
    csv.push(["Action Items:"]);
    DEMO.actions.forEach(a => csv.push([a.type, a.item, a.module]));
    csv.push([]);
    csv.push(["Board Wins:"]);
    DEMO.wins.forEach(w => csv.push([w]));
    csv.push([]);
    csv.push(["Board Risks:"]);
    DEMO.risks.forEach(r => csv.push([r]));
    csv.push([]);
    csv.push(["Pre-Meeting Priorities:", preMeeting]);
    csv.push(["Post-Meeting Outcomes:", postMeeting]);
    csv.push([]);
    csv.push(["Signatures:"]);
    BOARD.forEach((m, idx) => csv.push([m, signatures[idx] ? "Signed" : "Pending"]));
    csv.push([]);
    csv.push(["Poll Results:"]);
    BOARD.forEach((m, idx) => csv.push([m, poll[idx] == null ? "Not Answered" : poll[idx] ? "Yes" : "No"]));
    csv.push([]);
    csv.push(["Attached Files:"]);
    DEMO.files.forEach(f => csv.push([f.name]));
    // Export logic
    const blob = new Blob([csv.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "board_pack.csv";
    a.click();
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1150,
      margin: "0 auto"
    }}>
      <div style={{ height: 8, borderRadius: 5, margin: "0 0 28px 0", background: "linear-gradient(90deg, #FFD700 28%, #1de682 100%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 11 }}>
        <FaClipboardList style={{ fontSize: 32, color: "#FFD700", marginRight: 14 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>Board Pack Generator</h2>
        <span style={{
          background: readiness === "green" ? "#1de682" : readiness === "yellow" ? "#FFD700" : "#e82e2e",
          color: "#232a2e",
          fontWeight: 900,
          borderRadius: 12,
          padding: "9px 23px",
          marginLeft: 20,
          fontSize: 18
        }}>
          Board Readiness: {impactScore}%
        </span>
      </div>
      <div style={{ fontSize: 16, background: "#232a2e", borderRadius: 13, padding: "11px 19px", color: "#FFD700cc", marginBottom: 22 }}>
        <FaFlag style={{ marginRight: 8, verticalAlign: -2 }} />
        <b>Full agenda, action items, e-sign, poll, and PDF—board-ready in a click.</b>
      </div>
      {/* --- Quick Actions --- */}
      <div style={{ display: "flex", gap: 16, margin: "10px 0 25px 0", flexWrap: "wrap" }}>
        <button style={btnStyle} onClick={printPack}><FaFileExport style={{ marginRight: 8, fontSize: 17 }} /> Print / PDF</button>
        <button style={btnStyle} onClick={exportCSV}><FaDownload style={{ marginRight: 8, fontSize: 17 }} /> Export CSV</button>
      </div>
      {/* --- Pre/Post Meeting Notes --- */}
      <div style={{ display: "flex", gap: 22, margin: "9px 0 20px 0" }}>
        <div style={noteBox}>
          <FaPen style={{ marginRight: 8, color: "#1de682" }} />
          <b>Pre-Meeting Priorities:</b>
          <textarea value={preMeeting} onChange={e => setPreMeeting(e.target.value)} style={taStyle} placeholder="Add priorities..." />
        </div>
        <div style={noteBox}>
          <FaPen style={{ marginRight: 8, color: "#FFD700" }} />
          <b>Post-Meeting Outcomes:</b>
          <textarea value={postMeeting} onChange={e => setPostMeeting(e.target.value)} style={taStyle} placeholder="Add outcomes..." />
        </div>
      </div>
      {/* --- Agenda --- */}
      <div style={{
        background: "#232a2e",
        borderRadius: 14,
        padding: "15px 20px",
        margin: "10px 0 12px 0",
        color: "#FFD700"
      }}>
        <FaClipboardList style={{ marginRight: 7, fontSize: 20 }} />
        <span style={{ fontSize: 21, fontWeight: 900 }}>Meeting Agenda (auto-generated)</span>
        <ul style={{ margin: 0, marginTop: 7, padding: 0, listStyle: "none", fontSize: 17 }}>
          <li><b>1. Club KPIs & Progress</b></li>
          <li><b>2. Urgent/Overdue Items</b> (Roadmap, Policy, etc.)</li>
          <li><b>3. Analytics & Reports</b></li>
          <li><b>4. Board Decisions & Action Items</b></li>
          <li><b>5. Top 3 Wins / Top 3 Risks</b></li>
          <li><b>6. Board e-Sign & Poll</b></li>
          <li><b>7. Attachments & Exports</b></li>
        </ul>
      </div>
      {/* KPIs */}
      <div style={{ display: "flex", gap: 22, marginBottom: 18, flexWrap: "wrap" }}>
        {DEMO.kpis.map((k, i) => (
          <div key={i} style={{
            background: "#181e23",
            color: k.color,
            fontWeight: 900,
            borderRadius: 13,
            padding: "18px 21px 10px 21px",
            fontSize: 26,
            minWidth: 190,
            boxShadow: "0 2px 12px #FFD70015"
          }}>
            <span style={{ fontSize: 15, color: "#FFD70099" }}>{k.label}</span><br />
            <span style={{ fontSize: 27 }}>{k.value}</span>
          </div>
        ))}
      </div>
      {/* Urgent/Overdue Section */}
      <div style={{
        background: "#e82e2e22",
        color: "#FFD700",
        fontWeight: 900,
        fontSize: 18,
        borderRadius: 16,
        marginBottom: 20,
        padding: "15px 18px"
      }}>
        <FaExclamationTriangle style={{ fontSize: 21, marginRight: 8, color: "#FFD700" }} />
        <span style={{ fontSize: 21 }}>URGENT / OVERDUE:</span>
        <ul style={{ margin: 0, marginTop: 5, padding: 0, listStyle: "none" }}>
          {DEMO.urgent.map((u, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              <FaFlag style={{ color: "#FFD700", marginRight: 7 }} />
              <b>{u.module}:</b> {u.item} <span style={{ color: "#FFD70099" }}>({u.due})</span>
              <a href={u.url} style={{ color: "#1de682", marginLeft: 10 }}><FaExternalLinkAlt /> Jump to module</a>
            </li>
          ))}
        </ul>
      </div>
      {/* Analytics Panel */}
      <div style={{
        background: "#232a2e",
        borderRadius: 13,
        padding: "14px 17px",
        margin: "14px 0 15px 0",
        color: "#FFD700"
      }}>
        <FaChartBar style={{ fontSize: 19, marginRight: 7, color: "#FFD700" }} />
        <span style={{ fontSize: 19, fontWeight: 900, color: "#1de682" }}>Analytics & Summaries:</span>
        <ul style={{ margin: 0, marginTop: 6, padding: 0, listStyle: "none" }}>
          {DEMO.analytics.map((a, idx) => (
            <li key={idx} style={{ marginBottom: 3 }}>
              <FaCheckCircle style={{ color: "#FFD700", marginRight: 9 }} />
              <b>{a.module}:</b> {a.stat}
            </li>
          ))}
        </ul>
      </div>
      {/* Action Items / Decisions */}
      <div style={{
        background: "#232a2e",
        borderRadius: 13,
        padding: "14px 17px",
        margin: "14px 0 18px 0",
        color: "#FFD700"
      }}>
        <FaCrown style={{ fontSize: 18, marginRight: 7, color: "#FFD700" }} />
        <span style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>Action Items / Decisions:</span>
        <ul style={{ margin: 0, marginTop: 6, padding: 0, listStyle: "none" }}>
          {DEMO.actions.map((a, idx) => (
            <li key={idx} style={{ marginBottom: 3 }}>
              <FaExclamationTriangle style={{ color: a.type === "Decision Required" ? "#FFD700" : "#1de682", marginRight: 9 }} />
              <b>{a.type}:</b> {a.item}
              <span style={{ color: "#FFD700aa" }}> ({a.module})</span>
              <a href={a.url} style={{ color: "#1de682", marginLeft: 10 }}><FaExternalLinkAlt /> Jump</a>
            </li>
          ))}
        </ul>
      </div>
      {/* Top 3 Wins / Risks */}
      <div style={{ display: "flex", gap: 20, margin: "11px 0 12px 0" }}>
        <div style={diagBox}>
          <b>Top 3 Wins</b>
          <ul style={{ margin: 0, marginTop: 7, padding: 0, listStyle: "none", color: "#1de682" }}>
            {DEMO.wins.map((w, i) => <li key={i}><FaCheckCircle style={{ marginRight: 5 }} />{w}</li>)}
          </ul>
        </div>
        <div style={diagBox}>
          <b>Top 3 Risks</b>
          <ul style={{ margin: 0, marginTop: 7, padding: 0, listStyle: "none", color: "#FFD700" }}>
            {DEMO.risks.map((r, i) => <li key={i}><FaExclamationTriangle style={{ marginRight: 5 }} />{r}</li>)}
          </ul>
        </div>
      </div>
      {/* Board e-sign-off section */}
      <div style={{
        background: "#232a2e",
        borderRadius: 14,
        margin: "15px 0 14px 0",
        padding: "14px 16px"
      }}>
        <span style={{ fontSize: 17, fontWeight: 900, color: "#FFD700", marginRight: 13 }}><FaCheckCircle /> Board e-sign-off:</span>
        {BOARD.map((m, idx) => (
          <span key={m} style={{ marginLeft: 16 }}>
            {m}:{" "}
            {signatures[idx]
              ? <span style={{ color: "#1de682", fontWeight: 900 }}>Signed <FaCheckCircle /></span>
              : <button style={signBtn} onClick={() => handleSign(idx)}>Sign</button>
            }
          </span>
        ))}
      </div>
      {/* Pulse Poll */}
      <div style={{
        background: "#232a2e",
        borderRadius: 14,
        margin: "13px 0 15px 0",
        padding: "14px 16px"
      }}>
        <FaPollH style={{ marginRight: 10, color: "#FFD700", fontSize: 17 }} />
        <span style={{ fontWeight: 900 }}>Board Pulse Poll: “Are we on track?”</span>
        {BOARD.map((m, idx) => (
          <span key={m} style={{ marginLeft: 20 }}>
            {m}:{" "}
            {poll[idx] == null
              ? <>
                  <button style={yesBtn} onClick={() => handlePoll(idx, true)}>Yes</button>
                  <button style={noBtn} onClick={() => handlePoll(idx, false)}>No</button>
                </>
              : poll[idx]
                ? <span style={{ color: "#1de682", fontWeight: 900 }}>Yes</span>
                : <span style={{ color: "#e82e2e", fontWeight: 900 }}>No</span>
            }
          </span>
        ))}
      </div>
      {/* Board Docs */}
      <div style={{
        background: "#232a2e",
        color: "#FFD700",
        fontWeight: 900,
        borderRadius: 13,
        marginBottom: 18,
        padding: "14px 17px",
        display: "flex",
        flexWrap: "wrap",
        gap: 18,
        alignItems: "center"
      }}>
        <FaDownload style={{ fontSize: 20, marginRight: 11, color: "#FFD700" }} />
        <span style={{ fontSize: 18 }}>Board Documents:</span>
        {DEMO.files.map((doc, idx) => (
          <a key={idx} href={doc.url} style={{
            color: "#1de682",
            background: "#181e23",
            padding: "7px 16px",
            borderRadius: 9,
            fontWeight: 800,
            fontSize: 15,
            textDecoration: "none",
            marginLeft: 10,
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: "0 1px 10px #1de68211"
          }}>{doc.icon} {doc.name}</a>
        ))}
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "12px 14px",
        fontWeight: 700,
        fontSize: 15,
        marginTop: 17
      }}>
        <FaClipboardList style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Tip:</b> Print, export, or attach this summary to your next board meeting or sponsor presentation.
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 15,
  padding: "7px 18px",
  cursor: "pointer"
};
const noteBox = {
  background: "#232a2e",
  borderRadius: 13,
  padding: "13px 17px",
  color: "#FFD700",
  flex: 1
};
const taStyle = {
  width: "100%",
  height: 60,
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 700,
  marginTop: 8,
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  padding: 6,
  resize: "vertical"
};
const diagBox = {
  background: "#181e23",
  borderRadius: 12,
  padding: "15px 20px",
  flex: 1,
  minWidth: 200
};
const signBtn = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 6,
  fontWeight: 800,
  padding: "3px 12px",
  marginLeft: 7,
  fontSize: 15,
  cursor: "pointer"
};
const yesBtn = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 15,
  padding: "3px 13px",
  marginLeft: 6,
  cursor: "pointer"
};
const noBtn = {
  background: "#e82e2e",
  color: "#FFD700",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 15,
  padding: "3px 13px",
  marginLeft: 3,
  cursor: "pointer"
};
