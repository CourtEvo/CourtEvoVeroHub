import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { FaHeartbeat, FaCheckCircle, FaExclamationTriangle, FaClock, FaArrowRight, FaDownload, FaNotesMedical, FaUserMd } from "react-icons/fa";
import jsPDF from "jspdf";
import "./InjuryRecoveryCockpit.css";

// --- MOCK DATA (Replace with Excel/Sheet loader for real use) ---
const ATHLETES = [
  {
    id: "A001",
    name: "Luka Nović",
    team: "U18",
    injuryHistory: [
      { date: "2023-12-12", type: "Ankle Sprain", cleared: "2024-01-05", recurrence: false },
      { date: "2024-06-01", type: "Hamstring Strain", cleared: null, recurrence: false }
    ],
    current: {
      injury: "Hamstring Strain",
      injuryDate: "2024-06-01",
      rehabStage: 2, // 0 = acute, 1 = rehab, 2 = sport-specific, 3 = cleared
      expectedReturn: "2024-07-01",
      clearance: {
        medical: false,
        physio: false,
        coach: false,
        wellness: false
      },
      notes: "Progressing to running drills, moderate pain."
    }
  },
  {
    id: "A002",
    name: "Ivan Radić",
    team: "U19",
    injuryHistory: [
      { date: "2024-01-11", type: "Finger Fracture", cleared: "2024-02-01", recurrence: false }
    ],
    current: null // healthy
  }
];

const STAGES = ["Acute", "Rehab", "Sport-Specific", "Cleared"];

function stageColor(idx, curr) {
  if (idx < curr) return "#35b378";
  if (idx === curr) return "#FFD700";
  return "#b7bec9";
}

function statusBadge(a) {
  if (!a.current) return <span className="irc-badge irc-ok"><FaCheckCircle/> CLEARED</span>;
  const { clearance, expectedReturn } = a.current;
  const today = new Date();
  const expected = new Date(expectedReturn);
  if (Object.values(clearance).every(v=>v)) return <span className="irc-badge irc-ok"><FaCheckCircle/> CLEARED</span>;
  if (today > expected) return <span className="irc-badge irc-risk"><FaExclamationTriangle/> DELAYED</span>;
  if (a.injuryHistory && a.injuryHistory.some(h=>h.recurrence)) return <span className="irc-badge irc-warn"><FaExclamationTriangle/> RECURRENCE RISK</span>;
  return <span className="irc-badge irc-injured"><FaHeartbeat/> INJURED</span>;
}

function InjuryRecoveryCockpit() {
  const [idx, setIdx] = useState(0);
  const [showPDF, setShowPDF] = useState(false);

  const athlete = ATHLETES[idx];
  const curr = athlete.current;
  const latestHistory = athlete.injuryHistory[athlete.injuryHistory.length-1] || {};

  // Club-wide bar chart: recovery phases count
  const stageCounts = Array(4).fill(0);
  ATHLETES.forEach(a => {
    if (a.current) stageCounts[a.current.rehabStage]++;
  });
  const barData = STAGES.map((s,i)=>({stage: s, count: stageCounts[i]}));

  // PDF export (for compliance/board/medical)
  function exportPDF() {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Injury & Return-to-Play", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 10;
    doc.setTextColor(255,255,255);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
    y += 9;
    doc.setTextColor(35,42,46);
    doc.setFontSize(15);
    doc.text(`${athlete.name} (${athlete.team})`, 12, y);
    y += 7;
    doc.setFontSize(11);
    doc.text(`Athlete ID: ${athlete.id}`, 12, y);
    y += 6;
    doc.setDrawColor(220,220,220);
    doc.line(11, y, 199, y);

    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(35,42,46);
    doc.text("Current Injury/Status:", 12, y);
    y += 5.5;
    if (curr) {
      doc.setFontSize(11);
      doc.text(`Injury: ${curr.injury}  |  Injury Date: ${curr.injuryDate}`, 12, y);
      y += 5;
      doc.text(`Rehab Stage: ${STAGES[curr.rehabStage]}  |  Expected Return: ${curr.expectedReturn}`, 12, y);
      y += 5;
      doc.text(`Notes: ${curr.notes}`, 12, y);
      y += 6;
      doc.text("Clearance Checklist:", 12, y);
      y += 5;
      ["medical","physio","coach","wellness"].forEach((c,i)=>{
        let stat = curr.clearance[c] ? "✓ Cleared" : "✗ Pending";
        let clr = curr.clearance[c] ? [53,179,120] : [243,86,80];
        doc.setTextColor(...clr);
        doc.text(`- ${c.charAt(0).toUpperCase()+c.slice(1)}: ${stat}`, 14, y+i*5);
      });
      y += 22;
    } else {
      doc.text("No current injury (cleared).", 12, y);
      y += 6;
    }

    doc.setTextColor(35,42,46);
    doc.setFontSize(12);
    doc.text("Injury History:", 12, y);
    y += 6;
    doc.setFontSize(10);
    athlete.injuryHistory.forEach((h,i)=>{
      doc.text(`${h.date}: ${h.type}${h.cleared?` (cleared ${h.cleared})`:""}${h.recurrence?" [recurrence]":""}`, 14, y+i*5);
    });

    y += 5*athlete.injuryHistory.length + 6;
    doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, y);
    doc.save(`${athlete.name}_Injury_Recovery.pdf`);
  }

  // Compliance progress
  const complianceSteps = [
    { key: "medical", label: "Medical", icon: <FaUserMd/> },
    { key: "physio", label: "Physio", icon: <FaNotesMedical/> },
    { key: "coach", label: "Coach", icon: <FaCheckCircle/> },
    { key: "wellness", label: "Wellness", icon: <FaHeartbeat/> }
  ];

  return (
    <div className="irc-main">
      <div className="irc-head-row">
        <h2><FaHeartbeat style={{color:"#FFD700",marginRight:11}}/>Injury Recovery Cockpit</h2>
        <button className="irc-pdf-btn" onClick={exportPDF}><FaDownload/> Export PDF</button>
      </div>
      <div className="irc-athlete-row">
        <label>Select Athlete: </label>
        <select value={idx} onChange={e=>setIdx(Number(e.target.value))}>
          {ATHLETES.map((a,i)=>(
            <option value={i} key={a.id}>{a.name} ({a.team})</option>
          ))}
        </select>
        {statusBadge(athlete)}
      </div>
      <div className="irc-status-card">
        {curr ? (
          <>
            <div className="irc-injury-label">
              <b>Injury:</b> {curr.injury} &nbsp; | &nbsp; <b>Since:</b> {curr.injuryDate}
            </div>
            <div className="irc-stages-bar">
              {STAGES.map((s,i)=>(
                <div
                  key={i}
                  className="irc-stage"
                  style={{
                    background: stageColor(i, curr.rehabStage),
                    color: i===curr.rehabStage ? "#232a2e" : "#fff"
                  }}
                >
                  {s} {i<3 && <FaArrowRight style={{margin:"0 5px",color:"#FFD700"}}/>}
                </div>
              ))}
            </div>
            <div className="irc-expected-return">
              <FaClock/> Expected Return: <b>{curr.expectedReturn}</b>
            </div>
            <div className="irc-clearance-row">
              {complianceSteps.map((step,i)=>
                <span
                  key={i}
                  className={`irc-clearance-step ${curr.clearance[step.key] ? "irc-step-cleared" : "irc-step-pending"}`}
                  title={curr.clearance[step.key] ? "Cleared" : "Pending"}
                >
                  {step.icon} {step.label}
                </span>
              )}
            </div>
            <div className="irc-protocol-notes">
              <b>Rehab/Protocol Notes:</b>
              <div>{curr.notes}</div>
            </div>
          </>
        ) : (
          <div className="irc-injury-label"><FaCheckCircle style={{color:"#35b378"}}/> Athlete is healthy and cleared for full activity.</div>
        )}
      </div>

      <div className="irc-history-card">
        <h4>Injury History</h4>
        <ul>
          {athlete.injuryHistory.map((h,i)=>
            <li key={i}>
              {h.date}: {h.type}
              {h.cleared && <span className="irc-cleared-date"> (Cleared {h.cleared})</span>}
              {h.recurrence && <span className="irc-recur-badge">Recurrence</span>}
            </li>
          )}
        </ul>
      </div>

      <div className="irc-compliance-bar">
        <h4>Club Recovery Status</h4>
        <div className="irc-bar-container">
          <ResponsiveBar
            data={barData}
            keys={["count"]}
            indexBy="stage"
            margin={{top: 12, right: 18, bottom: 32, left: 30}}
            padding={0.32}
            colors={["#FFD700"]}
            axisBottom={{tickSize:6, tickRotation: -13, legend:"Stage", legendOffset:22, legendPosition:"middle"}}
            axisLeft={{tickSize:6, legend:"Athletes", legendOffset:-22, legendPosition:"middle"}}
            labelSkipWidth={100}
            labelSkipHeight={12}
            theme={{
              axis: { ticks: { text: { fill: "#FFD700" } } },
              grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
            }}
            height={145}
            enableLabel={true}
            labelTextColor="#232a2e"
            isInteractive={false}
          />
        </div>
      </div>
      <div className="irc-tagline">
        BE REAL. BE VERO.
      </div>
    </div>
  );
}

export default InjuryRecoveryCockpit;
