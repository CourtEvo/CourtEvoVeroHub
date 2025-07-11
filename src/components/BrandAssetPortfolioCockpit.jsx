import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { FaStar, FaLightbulb, FaExclamationTriangle, FaClipboardList, FaDownload, FaRobot, FaChartBar, FaCrown, FaFlag } from "react-icons/fa";
import jsPDF from "jspdf";
import "./BrandAssetPortfolioCockpit.css";

// --- Brand/IP Asset Data ---
const ASSETS = [
  { id: 1, name: "Main Logo", type: "Brand", owner: "Board", status: "active", value: 67000, revenue: 30000, partner: "Nike", expiry: "2027", activation: 95, risk: "low", notes: "" },
  { id: 2, name: "Kit Design", type: "IP", owner: "CMO", status: "active", value: 22000, revenue: 11500, partner: "Adidas", expiry: "2025", activation: 78, risk: "low", notes: "" },
  { id: 3, name: "Club App", type: "Digital", owner: "IT Lead", status: "under activation", value: 29000, revenue: 0, partner: "Meta", expiry: "2028", activation: 40, risk: "medium", notes: "" },
  { id: 4, name: "Mascot", type: "Property", owner: "CMO", status: "at risk", value: 8000, revenue: 400, partner: "", expiry: "2024", activation: 22, risk: "high", notes: "Inactive for 2 years." },
  { id: 5, name: "E-Sports Brand", type: "Brand", owner: "Board", status: "opportunity", value: 12500, revenue: 0, partner: "", expiry: "", activation: 0, risk: "low", notes: "" },
  { id: 6, name: "Annual Tournament", type: "Event", owner: "Events", status: "active", value: 28000, revenue: 7600, partner: "Erste Bank", expiry: "2026", activation: 73, risk: "medium", notes: "" }
];

// --- Asset Types for Analytics ---
const ASSET_TYPES = [...new Set(ASSETS.map(a=>a.type))];

// --- Risk color coding ---
const riskColor = r =>
  r === "high" ? "#f35650" : r === "medium" ? "#FFD700" : "#35b378";

const statusColor = s =>
  s === "active" ? "#35b378" : s === "under activation" ? "#FFD700" :
  s === "opportunity" ? "#1de682" : s === "at risk" ? "#f35650" : "#b7bec9";

export default function BrandAssetPortfolioCockpit() {
  const [assetId, setAssetId] = useState(null);
  const [assetNotes, setAssetNotes] = useState({});
  const [aiOpen, setAiOpen] = useState(false);

  // --- Asset for modal drilldown ---
  const asset = ASSETS.find(a => a.id === assetId);

  // --- Value heatmap/bar analytics ---
  const assetBarData = ASSETS.map(a=>({
    name: a.name,
    value: a.value,
    activation: a.activation,
    revenue: a.revenue,
    risk: a.risk
  }));

  // --- Asset value by type (Nivo bar) ---
  const byType = ASSET_TYPES.map(type => ({
    type,
    total: ASSETS.filter(a=>a.type===type).reduce((s,a)=>s+a.value,0)
  }));

  // --- PDF Export ---
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,18,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CourtEvo Vero Brand & Asset Portfolio", 13, 13);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 134, 13);
    doc.setTextColor(35,42,46);
    doc.setFontSize(11);
    let y = 24;
    doc.text(`Asset Portfolio (${ASSETS.length}):`, 13, y); y += 7;
    ASSETS.forEach((a,i)=>{
      doc.setFillColor(riskColor(a.risk));
      doc.rect(13, y-4, 3, 9, "F");
      doc.text(`${a.name} (${a.type}): ${a.status} | Owner: ${a.owner} | Value: €${a.value} | Activation: ${a.activation}%`, 18, y+2);
      y += 8;
      if (y > 265) { y=18; doc.addPage(); }
    });
    y += 8;
    doc.setTextColor(120,120,120);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 13, 285);
    doc.save("Brand_Asset_Portfolio.pdf");
  }

  // --- AI Copilot Logic ---
  function aiCopilot() {
    let recs = [];
    const lowest = ASSETS.reduce((min, a)=>a.activation<min.activation?a:min,ASSETS[0]);
    if (lowest.activation < 40) recs.push(`Most under-activated: ${lowest.name}. Board: plan activation campaign.`);
    if (ASSETS.some(a=>a.status==="at risk")) recs.push("One or more assets at risk. Immediate attention needed.");
    if (ASSETS.some(a=>a.status==="opportunity")) recs.push("New brand opportunity: board should assign owner and launch.");
    if (!recs.length) recs.push("All assets fully active and no urgent risks. Consider launching new asset.");
    return recs;
  }

  return (
    <div className="bap-root">
      <div className="bap-header-row">
        <div className="bap-title">
          <FaClipboardList style={{color:"#FFD700",marginRight:13}}/>Brand & Asset Portfolio Cockpit
        </div>
        <div className="bap-header-actions">
          <button className="bap-btn" onClick={exportPDF}><FaDownload/> PDF</button>
        </div>
      </div>
      {/* AI Copilot */}
      <div className="bap-ai-copilot" onClick={()=>setAiOpen(v=>!v)}>
        <FaRobot/> {aiCopilot()[0]}
        {aiOpen && (
          <div className="bap-ai-modal">
            <b>AI Copilot:</b>
            <ul>
              {aiCopilot().map((line,i)=><li key={i}>{line}</li>)}
            </ul>
          </div>
        )}
      </div>
      {/* Asset Analytics */}
      <div className="bap-asset-analytics">
        <div className="bap-asset-bar-title"><FaChartBar/> Asset Value by Type</div>
        <div style={{height:160, width:340, margin:"0 0 8px 0"}}>
          <ResponsiveBar
            data={byType}
            keys={["total"]}
            indexBy="type"
            margin={{ top: 13, right: 17, bottom: 36, left: 44 }}
            padding={0.28}
            groupMode="grouped"
            colors={["#FFD700"]}
            axisBottom={{tickRotation:-17,legend:"Type",legendOffset:29}}
            axisLeft={{tickSize:6,legend:"Value (€)",legendOffset:-27}}
            borderRadius={6}
            enableLabel={false}
            theme={{
              axis:{ticks:{text:{fill:"#FFD700"}}},
              grid:{line:{stroke:"#232a2e88",strokeDasharray:"3 3"}}
            }}
            height={160}
          />
        </div>
      </div>
      {/* Asset Table */}
      <div className="bap-asset-table-section">
        <div className="bap-asset-table-title"><FaStar style={{marginRight:8}}/>Assets</div>
        <table className="bap-asset-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Value (€)</th>
              <th>Activation %</th>
              <th>Partner</th>
              <th>Revenue (€)</th>
              <th>Risk</th>
              <th>Expiry</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(a=>(
              <tr key={a.id} className={`bap-row-status-${a.status.replace(/\s+/g,"")}`}>
                <td>{a.name}</td>
                <td>{a.type}</td>
                <td>{a.owner}</td>
                <td style={{color:statusColor(a.status),fontWeight:900}}>{a.status.toUpperCase()}</td>
                <td>{a.value}</td>
                <td>
                  <div className="bap-activation-bar">
                    <div className="bap-activation-inner" style={{width:a.activation+"%",background:riskColor(a.risk)}}/>
                    <span className="bap-activation-label">{a.activation}%</span>
                  </div>
                </td>
                <td>{a.partner}</td>
                <td>{a.revenue}</td>
                <td style={{color:riskColor(a.risk),fontWeight:900}}>{a.risk.toUpperCase()}</td>
                <td>{a.expiry}</td>
                <td>
                  <button className="bap-info-btn" onClick={()=>setAssetId(a.id)}><FaFlag/></button>
                  {a.status==="at risk" && <FaExclamationTriangle style={{color:"#f35650",marginLeft:4}}/>}
                  {a.status==="opportunity" && <FaLightbulb style={{color:"#FFD700",marginLeft:4}}/>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Drilldown Modal */}
      {asset && (
        <div className="bap-modal-overlay" onClick={()=>setAssetId(null)}>
          <div className="bap-modal" onClick={e=>e.stopPropagation()}>
            <div className="bap-modal-title">
              <FaFlag style={{marginRight:7}}/>{asset.name} ({asset.type})
            </div>
            <div className="bap-modal-section">
              <b>Status:</b> <span style={{color:statusColor(asset.status),fontWeight:900}}>{asset.status.toUpperCase()}</span>
              {asset.status==="at risk" && <span style={{color:"#f35650",marginLeft:7}}><FaExclamationTriangle/> AT RISK</span>}
            </div>
            <div className="bap-modal-section">
              <b>Owner:</b> {asset.owner}
              {asset.partner && <> | <b>Partner:</b> {asset.partner}</>}
            </div>
            <div className="bap-modal-section">
              <b>Value:</b> €{asset.value} | <b>Revenue:</b> €{asset.revenue}
            </div>
            <div className="bap-modal-section">
              <b>Activation:</b>
              <div className="bap-activation-bar" style={{width:210}}>
                <div className="bap-activation-inner" style={{width:asset.activation+"%",background:riskColor(asset.risk)}}/>
                <span className="bap-activation-label">{asset.activation}%</span>
              </div>
            </div>
            <div className="bap-modal-section">
              <b>Risk:</b> <span style={{color:riskColor(asset.risk)}}>{asset.risk.toUpperCase()}</span>
              {asset.expiry && <> | <b>Expiry:</b> {asset.expiry}</>}
            </div>
            <div className="bap-modal-section">
              <b>Boardroom Notepad:</b>
              <textarea
                className="bap-modal-notes"
                placeholder="Key actions, commercial notes, legal status, ideas..."
                value={assetNotes[asset.id]||asset.notes||""}
                onChange={e=>setAssetNotes(n=>({...n, [asset.id]:e.target.value}))}
                style={{marginTop:6, width:"99%"}}
              />
            </div>
            <button className="bap-btn" onClick={()=>setAssetId(null)} style={{marginTop:13}}>Close</button>
          </div>
        </div>
      )}
      <div className="bap-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
