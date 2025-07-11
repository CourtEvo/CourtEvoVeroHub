import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import { FaClipboardCheck, FaCheckCircle, FaExclamationTriangle, FaDownload, FaRobot, FaUpload } from "react-icons/fa";
import jsPDF from "jspdf";
import "./LTADComplianceCockpit.css";

const LTAD_PHASES = [
  { key: "FUNdamentals", age: "U10", req: { sessions: 2, coachCert: "Level 1" } },
  { key: "Learn to Train", age: "U12", req: { sessions: 3, coachCert: "Level 1" } },
  { key: "Train to Train", age: "U14", req: { sessions: 4, coachCert: "Level 2" } },
  { key: "Train to Compete", age: "U16", req: { sessions: 5, coachCert: "Level 2+" } },
  { key: "Train to Win", age: "U18", req: { sessions: 6, coachCert: "Elite/Pro" } }
];
const DEMO_CLUB = {
  U10: { sessions: 2, coachCert: "Level 1", SSG: 60, microSkill: 20, microSSG: 50, microComp: 30 },
  U12: { sessions: 2, coachCert: "Level 1", SSG: 50, microSkill: 30, microSSG: 45, microComp: 25 },
  U14: { sessions: 4, coachCert: "Level 1", SSG: 70, microSkill: 18, microSSG: 52, microComp: 30 },
  U16: { sessions: 4, coachCert: "Level 2", SSG: 60, microSkill: 17, microSSG: 51, microComp: 32 },
  U18: { sessions: 6, coachCert: "Elite/Pro", SSG: 80, microSkill: 14, microSSG: 51, microComp: 35 }
};
const COMPLIANCE_THRESHOLDS = { sessions: 1, coachCert: 1, SSG: 55 };

function checkPhaseCompliance(phase, clubData) {
  const c = clubData[phase.age];
  if (!c) return "red";
  let score = 0;
  if (c.sessions >= phase.req.sessions) score++;
  if (c.coachCert === phase.req.coachCert || c.coachCert === "Elite/Pro") score++;
  if ((c.SSG||0) >= COMPLIANCE_THRESHOLDS.SSG) score++;
  if (score === 3) return "gold";
  if (score === 2) return "yellow";
  if (score === 1) return "orange";
  return "red";
}
function phaseStatusText(status) {
  if (status === "gold") return "Compliant";
  if (status === "yellow") return "Minor Gaps";
  if (status === "orange") return "Partial/At Risk";
  return "Non-Compliant";
}
const statusColors = {
  gold: "#FFD700", yellow: "#f2a900", orange: "#fa8c2e", red: "#f35650"
};

export default function LTADComplianceCockpit() {
  const [clubData, setClubData] = useState(DEMO_CLUB);
  const [drillPhase, setDrillPhase] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [complianceHistory, setComplianceHistory] = useState([
    // Demo 12-month trend
    { date: '2023-08', U10: "yellow", U12: "yellow", U14: "orange", U16: "red", U18: "yellow" },
    { date: '2023-10', U10: "gold", U12: "yellow", U14: "orange", U16: "yellow", U18: "yellow" },
    { date: '2023-12', U10: "gold", U12: "yellow", U14: "yellow", U16: "yellow", U18: "gold" },
    { date: '2024-02', U10: "gold", U12: "gold", U14: "yellow", U16: "yellow", U18: "gold" },
    { date: '2024-04', U10: "gold", U12: "yellow", U14: "yellow", U16: "yellow", U18: "gold" },
    { date: '2024-06', U10: "gold", U12: "gold", U14: "yellow", U16: "yellow", U18: "gold" }
  ]);
  const [phaseNotes, setPhaseNotes] = useState({});

  // Compliance for this club
  const complianceData = LTAD_PHASES.map(phase => ({
    phase: phase.key,
    compliance: checkPhaseCompliance(phase, clubData),
    sessions: clubData[phase.age]?.sessions || 0,
    coachCert: clubData[phase.age]?.coachCert || "",
    SSG: clubData[phase.age]?.SSG || 0,
    microSkill: clubData[phase.age]?.microSkill || 0,
    microSSG: clubData[phase.age]?.microSSG || 0,
    microComp: clubData[phase.age]?.microComp || 0
  }));

  const score = complianceData.reduce((a,c)=>
    a+(c.compliance==="gold"?3:c.compliance==="yellow"?2:c.compliance==="orange"?1:0)
  ,0);
  const maxScore = 3 * LTAD_PHASES.length;
  const percent = Math.round(100*score/maxScore);

  // Radar data
  const radarData = LTAD_PHASES.map(p=>({
    phase: p.key,
    compliance: 3 - ["gold","yellow","orange","red"].indexOf(checkPhaseCompliance(p, clubData))
  }));

  // Alerts
  const alerts = complianceData.filter(c=>["red","orange"].includes(c.compliance));

  // PDF Export
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,18,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("CourtEvo Vero LTAD Compliance Boardroom Report", 13, 13);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 125, 13);
    doc.setTextColor(35,42,46);
    doc.setFontSize(12);
    let y = 24;
    doc.text(`Overall Compliance: ${percent}%`, 13, y); y+=8;
    complianceData.forEach((c, i) => {
      doc.setFontSize(11);
      doc.setFillColor(statusColors[c.compliance]);
      doc.rect(13, y-4, 3, 9, "F");
      doc.text(`${c.phase}: ${phaseStatusText(c.compliance)} | Sessions: ${c.sessions} | Coach: ${c.coachCert} | SSG%: ${c.SSG}`, 18, y+2);
      y+=9;
      if (y>270) { y=20; doc.addPage(); }
    });
    y+=9;
    doc.setTextColor(120,120,120);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 13, 285);
    doc.save("LTAD_Compliance_Report.pdf");
  }

  // Import (simulated autofill)
  function handleImport(e) {
    e.preventDefault();
    // Simulate an "import" — instant autofill
    setClubData({
      U10: { sessions: 2, coachCert: "Level 1", SSG: 65, microSkill: 21, microSSG: 49, microComp: 30 },
      U12: { sessions: 3, coachCert: "Level 1", SSG: 60, microSkill: 26, microSSG: 48, microComp: 26 },
      U14: { sessions: 4, coachCert: "Level 2", SSG: 76, microSkill: 16, microSSG: 53, microComp: 31 },
      U16: { sessions: 5, coachCert: "Level 2+", SSG: 73, microSkill: 13, microSSG: 53, microComp: 34 },
      U18: { sessions: 6, coachCert: "Elite/Pro", SSG: 82, microSkill: 12, microSSG: 53, microComp: 35 }
    });
  }

  // Smart AI recs
  function smartAction(phaseKey, phase, data) {
    const c = data[phase.age];
    let rec = [];
    if (!c) return "No data.";
    if (c.sessions < phase.req.sessions)
      rec.push(`+${phase.req.sessions-c.sessions} sessions/week`);
    if (c.coachCert !== phase.req.coachCert && phase.req.coachCert !== "Elite/Pro")
      rec.push(`Upgrade coach to ${phase.req.coachCert}`);
    if ((c.SSG||0) < COMPLIANCE_THRESHOLDS.SSG)
      rec.push(`Raise SSG% to ${COMPLIANCE_THRESHOLDS.SSG}+`);
    if ((c.microSkill||0) < 15)
      rec.push(`Increase skill work in microcycle`);
    if (rec.length === 0) return "Maintain standard.";
    return rec.join("; ");
  }

  return (
    <div className="ltad-root">
      <div className="ltad-header-row">
        <div className="ltad-title">
          <FaClipboardCheck style={{color:"#FFD700",marginRight:12}}/>LTAD Compliance Cockpit
        </div>
        <div className="ltad-header-actions">
          <label className="ltad-import-label" title="Import Excel/CSV demo">
            <FaUpload/> <input type="file" onChange={handleImport} className="ltad-import-file"/> Import Data
          </label>
          <button className="ltad-btn" onClick={exportPDF}><FaDownload/> PDF</button>
        </div>
      </div>
      {/* Compliance trendline */}
      <div className="ltad-trend-row">
        <div className="ltad-trend-title">Compliance Progression (Last 12 Months)</div>
        <ResponsiveBar
          data={LTAD_PHASES.map(phase => ({
            phase: phase.key,
            ...Object.fromEntries(complianceHistory.map(h=>[h.date, 4-["gold","yellow","orange","red"].indexOf(h[phase.age])]))
          }))}
          keys={complianceHistory.map(h=>h.date)}
          indexBy="phase"
          groupMode="grouped"
          colors={d=>{
            if (d.value===4) return "#FFD700";
            if (d.value===3) return "#f2a900";
            if (d.value===2) return "#fa8c2e";
            return "#f35650";
          }}
          margin={{top:12,right:24,bottom:36,left:40}}
          axisBottom={{tickRotation:-23,legend:"LTAD Phase",legendOffset:28}}
          axisLeft={{tickSize:6,legend:"Compliance",legendOffset:-20}}
          borderRadius={7}
          enableLabel={false}
          theme={{
            axis:{ticks:{text:{fill:"#FFD700"}}},
            grid:{line:{stroke:"#232a2e88",strokeDasharray:"3 3"}}
          }}
          height={120}
        />
      </div>
      {/* Risk Radar */}
      <div className="ltad-risk-radar">
        <div className="ltad-risk-title">Compliance Risk Radar</div>
        <ResponsiveRadar
          data={radarData}
          keys={["compliance"]}
          indexBy="phase"
          maxValue={3}
          curve="linearClosed"
          margin={{top:18,right:54,bottom:18,left:54}}
          gridLevels={4}
          gridShape="circular"
          colors={{ scheme: "set2" }}
          fillOpacity={0.35}
          borderWidth={3}
          theme={{
            axis: { ticks: { text: { fill: "#FFD700" } } },
            grid: { line: { stroke: "#FFD70022" } },
            dots: { text: { fill: "#FFD700" } }
          }}
          dotSize={9}
          dotColor="#FFD700"
          blendMode="multiply"
          motionConfig="wobbly"
          isInteractive={false}
          height={185}
        />
      </div>
      {/* Alerts/Warnings */}
      {alerts.length > 0 && (
        <div className="ltad-alerts">
          {alerts.map(c=>
            <div className={`ltad-alert ltad-alert-${c.compliance}`} key={c.phase}>
              <FaExclamationTriangle/> <b>{c.phase}:</b> {phaseStatusText(c.compliance)}
            </div>
          )}
        </div>
      )}
      {/* Gold badge */}
      {complianceData.every(c=>c.compliance==="gold") && (
        <div className="ltad-gold-badge">
          <img src="/court-evo-vero-gold-badge.svg" alt="Gold Compliance" style={{height:42,verticalAlign:"middle",marginRight:11}} />
          <span>COURTEVO VERO GOLD COMPLIANCE</span>
        </div>
      )}
      {/* Copilot */}
      <div className="ltad-ai-copilot" onClick={()=>setAiOpen(v=>!v)}>
        <FaRobot/> {complianceData.every(c=>c.compliance==="gold")
          ? "All phases gold. Elite! Export badge to club site."
          : "See phase-specific action steps."}
        {aiOpen && (
          <div className="ltad-ai-modal">
            <b>AI Copilot Actions:</b>
            <ul>
              {LTAD_PHASES.map((phase,i)=>
                <li key={i}><b>{phase.key}:</b> {smartAction(phase.key, phase, clubData)}</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {/* Compliance Table */}
      <div className="ltad-compliance-table">
        <table>
          <thead>
            <tr>
              <th>LTAD Phase</th>
              <th>Age</th>
              <th>Sessions/Wk</th>
              <th>Coach Cert</th>
              <th>Game-Based %</th>
              <th>Practice Ratio<br/><span style={{fontWeight:400}}>Skill/SSG/Comp</span></th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {LTAD_PHASES.map((phase,i)=>{
              const c = complianceData[i];
              return (
                <tr key={phase.key} className={`ltad-phase-${c.compliance}`}>
                  <td>{phase.key}</td>
                  <td>{phase.age}</td>
                  <td>
                    <input
                      type="number"
                      className="ltad-edit"
                      value={clubData[phase.age]?.sessions||""}
                      min="0"
                      max="10"
                      onChange={e=>setClubData(cd=>({...cd,[phase.age]:{...cd[phase.age],sessions:Number(e.target.value)}}))}
                    />
                  </td>
                  <td>
                    <select
                      className="ltad-edit"
                      value={clubData[phase.age]?.coachCert||""}
                      onChange={e=>setClubData(cd=>({...cd,[phase.age]:{...cd[phase.age],coachCert:e.target.value}}))}
                    >
                      <option>Level 1</option>
                      <option>Level 2</option>
                      <option>Level 2+</option>
                      <option>Elite/Pro</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="ltad-edit"
                      value={clubData[phase.age]?.SSG||""}
                      min="0"
                      max="100"
                      onChange={e=>setClubData(cd=>({...cd,[phase.age]:{...cd[phase.age],SSG:Number(e.target.value)}}))}
                    />%
                  </td>
                  <td>
                    <span className="ltad-ratio-group">
                      <input type="number" min="0" max="100"
                        value={clubData[phase.age]?.microSkill||""}
                        onChange={e=>setClubData(cd=>({...cd,[phase.age]:{...cd[phase.age],microSkill:Number(e.target.value)}}))}
                        className="ltad-edit"
                        style={{width:38}} />/
                      <input type="number" min="0" max="100"
                        value={clubData[phase.age]?.microSSG||""}
                        onChange={e=>setClubData(cd=>({...cd,[phase.age]:{...cd[phase.age],microSSG:Number(e.target.value)}}))}
                        className="ltad-edit"
                        style={{width:38}} />/
                      <input type="number" min="0" max="100"
                        value={clubData[phase.age]?.microComp||""}
                        onChange={e=>setClubData(cd=>({...cd,[phase.age]:{...cd[phase.age],microComp:Number(e.target.value)}}))}
                        className="ltad-edit"
                        style={{width:38}} />
                    </span>
                  </td>
                  <td>
                    <span className="ltad-phase-status" style={{color:statusColors[c.compliance]}}>
                      {c.compliance === "gold" && <FaCheckCircle/>}
                      {["yellow","orange","red"].includes(c.compliance) && <FaExclamationTriangle/>}
                      &nbsp;{phaseStatusText(c.compliance)}
                    </span>
                  </td>
                  <td>
                    <button className="ltad-btn-small" onClick={()=>setDrillPhase(phase.key)}>
                      Details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Drilldown Modal */}
      {drillPhase && (
        <div className="ltad-modal-overlay" onClick={()=>setDrillPhase(null)}>
          <div className="ltad-modal" onClick={e=>e.stopPropagation()}>
            <div className="ltad-modal-title">
              {drillPhase} Compliance Drilldown
            </div>
            <div className="ltad-modal-body">
              {(()=>{
                const phase = LTAD_PHASES.find(p=>p.key===drillPhase);
                const c = clubData[phase.age]||{};
                return (
                  <>
                    <div><b>Required Sessions/Wk:</b> {phase.req.sessions}</div>
                    <div><b>Required Coach Cert:</b> {phase.req.coachCert}</div>
                    <div><b>Min. Game-Based %:</b> {COMPLIANCE_THRESHOLDS.SSG}%</div>
                    <hr/>
                    <div><b>Your Data:</b></div>
                    <div>Sessions: {c.sessions||0}</div>
                    <div>Coach Cert: {c.coachCert||"-"}</div>
                    <div>Game-Based: {c.SSG||0}%</div>
                    <div>Practice Ratio (Skill/SSG/Comp): {c.microSkill||0}/{c.microSSG||0}/{c.microComp||0}</div>
                    <hr/>
                    <div>
                      <b>Compliance Status:</b> <span style={{color:statusColors[checkPhaseCompliance(phase,clubData)]}}>
                        {phaseStatusText(checkPhaseCompliance(phase,clubData))}
                      </span>
                    </div>
                    <div className="ltad-action-rec">
                      <b>AI Recommendations:</b> {smartAction(drillPhase, phase, clubData)}
                    </div>
                    <div>
                      <b>Boardroom Notepad:</b>
                      <textarea
                        value={phaseNotes[drillPhase]||""}
                        onChange={e=>setPhaseNotes(n=>({...n,[drillPhase]:e.target.value}))}
                        className="ltad-phase-notepad"
                        placeholder="Boardroom notes, action steps..."
                        style={{marginTop:7, width:"99%"}}
                      />
                    </div>
                  </>
                )
              })()}
            </div>
            <button className="ltad-btn" onClick={()=>setDrillPhase(null)}>Close</button>
          </div>
        </div>
      )}
      <div className="ltad-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
