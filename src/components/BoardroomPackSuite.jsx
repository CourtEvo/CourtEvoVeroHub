import React, { useState, useRef } from "react";
import {
  FaFilePdf, FaFilePowerpoint, FaChevronDown, FaChevronUp, FaCheckCircle, FaClipboardList, FaCrown, FaRegLightbulb, FaPen, FaTrash, FaUserCheck, FaUpload, FaHistory, FaArrowsAlt, FaExclamationTriangle, FaUserShield, FaLink
} from "react-icons/fa";
import "./BoardroomPackSuite.css";

const MODULES = [
  { key: "ClubHealthDashboard", label: "Club Health Dashboard", risk: false },
  { key: "DecisionLogElite", label: "Boardroom Decision Log", risk: true },
  { key: "AthleteProgressDashboard", label: "Athlete Progress Dashboard", risk: false },
  { key: "CoachCPDTracker", label: "Coach CPD Tracker", risk: false },
  { key: "SensitivePeriodsTracker", label: "Sensitive Periods Tracker", risk: true },
  { key: "EthicsCharacterBuilder", label: "Ethics & Culture Tracker", risk: false },
  { key: "ResourceGapAnalyzer", label: "Resource Gap Analyzer", risk: false }
];
const DEFAULT_HIGHLIGHTS = [
  "No compliance breaches detected this period.",
  "2 high-risk decisions pending review.",
  "Elite athlete promotion readiness above 90%.",
  "All coaches CPD-compliant this quarter."
];
const DEFAULT_SIGNATORIES = [
  { name: "Marko Proleta", role: "President", signed: false },
  { name: "Ivana Grgić", role: "GM", signed: false }
];

export default function BoardroomPackSuite() {
  // State for section order (with custom)
  const [sections, setSections] = useState([
    ...MODULES.map(m => ({ ...m, type: "module" }))
  ]);
  const [selected, setSelected] = useState(sections.map(s => s.key));
  const [expanded, setExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [highlights, setHighlights] = useState([...DEFAULT_HIGHLIGHTS]);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [newHighlight, setNewHighlight] = useState("");
  const [logo, setLogo] = useState("/logo.png");
  const [heroVisual, setHeroVisual] = useState(null);
  const [preparedFor, setPreparedFor] = useState("Zagreb Youth Basketball Club");
  const [editingPreparedFor, setEditingPreparedFor] = useState(false);
  const [customSections, setCustomSections] = useState([]);
  const [newCustomSection, setNewCustomSection] = useState({ title: "", content: "" });
  const [dragIdx, setDragIdx] = useState(null);
  const [designMode, setDesignMode] = useState(true);
  const [signatories, setSignatories] = useState([...DEFAULT_SIGNATORIES]);
  const [packLog, setPackLog] = useState([]);
  const [secureLink, setSecureLink] = useState("");
  const fileInputRef = useRef();
  const visualInputRef = useRef();

  // Drag-and-drop handlers
  function onDragStart(idx) { setDragIdx(idx); }
  function onDrop(idx) {
    if (dragIdx === null || dragIdx === idx) return;
    let arr = [...sections];
    const [removed] = arr.splice(dragIdx, 1);
    arr.splice(idx, 0, removed);
    setSections(arr);
    setDragIdx(null);
  }
  function toggleModule(key) {
    setSelected(sel =>
      sel.includes(key) ? sel.filter(k => k !== key) : [...sel, key]
    );
  }
  function toggleExpand() { setExpanded(e => !e); }
  // PDF/PPTX export (simulated)
  function exportPack(type = "pdf") {
    if (!signatories.every(s => s.signed)) {
      alert("All required signatures must be collected before export.");
      return;
    }
    setDownloading(true);
    setTimeout(() => {
      const link = Math.random().toString(36).slice(2, 10).toUpperCase();
      setPackLog(logs => [
        {
          date: new Date().toLocaleString(),
          by: signatories.map(s => s.name).join(", "),
          modules: [...selected],
          type: type.toUpperCase(),
          link: `/secure-download/${link}`
        },
        ...logs
      ]);
      setSecureLink(`/secure-download/${link}`);
      alert(`Board pack ${type.toUpperCase()} exported!\n(Integrate with jsPDF, react-pdf, pptxgenjs, or server for production)`);
      setDownloading(false);
    }, 1600);
  }
  // AI summary logic (demo)
  function runAISummary() {
    setAiSummary(
      "AI Boardroom Summary:\n" +
      (selected.includes("DecisionLogElite")
        ? "- 2 open compliance issues require board action\n"
        : "") +
      (selected.includes("AthleteProgressDashboard")
        ? "- Athlete promotion potential exceeds club KPI\n"
        : "") +
      (selected.includes("CoachCPDTracker")
        ? "- All coaches are CPD-compliant; no overdue actions detected.\n"
        : "") +
      (selected.includes("SensitivePeriodsTracker")
        ? "- 1 athlete in a sensitive period (monitor closely).\n"
        : "") +
      (selected.includes("ResourceGapAnalyzer")
        ? "- Minor resource gaps flagged in U14 squad staffing.\n"
        : "") +
      "Pack assembled by CourtEvo Vero consulting for executive review."
    );
  }
  // Highlights edit
  function startEditHighlight(idx) { setEditingHighlight(idx); setNewHighlight(highlights[idx]); }
  function saveEditHighlight(idx) {
    setHighlights(hs => hs.map((h, i) => (i === idx ? newHighlight : h)));
    setEditingHighlight(null); setNewHighlight("");
  }
  function removeHighlight(idx) { setHighlights(hs => hs.filter((_, i) => i !== idx)); }
  function addHighlight() {
    if (newHighlight.trim() === "") return;
    setHighlights(hs => [...hs, newHighlight.trim()]);
    setNewHighlight("");
  }
  // Logo upload
  function handleLogoUpload(e) {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogo(url);
    }
  }
  // Hero visual upload
  function handleHeroVisualUpload(e) {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setHeroVisual(url);
    }
  }
  // Custom section
  function addCustomSection() {
    if (!newCustomSection.title.trim() || !newCustomSection.content.trim()) return;
    const section = { ...newCustomSection, key: `custom-${Date.now()}`, type: "custom" };
    setCustomSections(cs => [...cs, section]);
    setSections(ss => [...ss, section]);
    setNewCustomSection({ title: "", content: "" });
  }
  function removeCustomSection(idx) {
    setSections(ss => ss.filter(s => s.type !== "custom" || s.key !== customSections[idx].key));
    setCustomSections(cs => cs.filter((_, i) => i !== idx));
  }
  // Signatory signing
  function sign(idx) {
    setSignatories(sigs =>
      sigs.map((s, i) => i === idx ? { ...s, signed: !s.signed } : s)
    );
  }
  // Design/Preview mode
  function switchMode() { setDesignMode(m => !m); }
  // Risk alert panel (if selected modules have risk: true)
  const risks = sections
    .filter((s, i) => selected.includes(s.key) && s.risk)
    .map(s => s.label);

  // Table of contents page numbers
  function getTOCPage(idx) { return 3 + idx; } // 1=cover, 2=hero, 3=ToC, 4+=sections

  return (
    <div className="bps-root">
      {/* Risk Alerts */}
      {risks.length > 0 &&
        <div className="bps-risk-alert">
          <FaExclamationTriangle style={{ color: "#FF4444", marginRight: 9 }} />
          {risks.length === 1
            ? `Major risk detected in: ${risks[0]}`
            : `Risks flagged in: ${risks.join(", ")}`}
        </div>
      }
      {/* Mode toggle */}
      <div className="bps-mode-row">
        <button className={`bps-mode-btn${designMode ? " active" : ""}`} onClick={() => setDesignMode(true)}>
          Design Mode
        </button>
        <button className={`bps-mode-btn${!designMode ? " active" : ""}`} onClick={() => setDesignMode(false)}>
          Preview Mode
        </button>
      </div>
      {designMode ? (
        <>
          {/* Cover Page */}
          <div className="bps-cover">
            <div className="bps-logo-wrap">
              <img src={logo} alt="Club Logo" className="bps-logo" />
              <button className="bps-logo-upload-btn" onClick={() => fileInputRef.current.click()} title="Upload Logo">
                <FaUpload />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleLogoUpload}
              />
            </div>
            <div className="bps-club-title-edit-wrap">
              {editingPreparedFor ? (
                <input
                  className="bps-club-title-edit"
                  value={preparedFor}
                  onChange={e => setPreparedFor(e.target.value)}
                  onBlur={() => setEditingPreparedFor(false)}
                  autoFocus
                />
              ) : (
                <span className="bps-club-title" onClick={() => setEditingPreparedFor(true)}>
                  {preparedFor}
                </span>
              )}
            </div>
            <div className="bps-pack-title">BOARDROOM PACK</div>
            <div className="bps-pack-date">{new Date().toLocaleDateString()}</div>
            <div className="bps-signoff">Prepared by: <b>CourtEvo Vero Consulting</b></div>
            <div className="bps-watermark">Prepared by CourtEvo Vero – Elite Basketball Consulting</div>
          </div>
          {/* Hero Visual */}
          <div className="bps-hero-section">
            <div className="bps-hero-label">
              Executive Visual Highlight (optional infographic or chart)
              <button className="bps-hero-upload-btn" onClick={() => visualInputRef.current.click()}>
                <FaUpload />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={visualInputRef}
                style={{ display: "none" }}
                onChange={handleHeroVisualUpload}
              />
            </div>
            {heroVisual && (
              <div className="bps-hero-visual">
                <img src={heroVisual} alt="Hero Visual" />
              </div>
            )}
          </div>
          {/* Table of Contents */}
          <div className="bps-toc-section">
            <div className="bps-toc-head" onClick={toggleExpand}>
              <FaClipboardList style={{ marginRight: 7 }} />
              Table of Contents
              {expanded ? <FaChevronUp style={{ marginLeft: 7 }} /> : <FaChevronDown style={{ marginLeft: 7 }} />}
            </div>
            {expanded && (
              <ul className="bps-toc-list">
                <li><span className="bps-toc-index">1.</span>Cover Page <span className="bps-toc-page">1</span></li>
                <li><span className="bps-toc-index">2.</span>Executive Visual Highlight <span className="bps-toc-page">2</span></li>
                <li><span className="bps-toc-index">3.</span>Table of Contents <span className="bps-toc-page">3</span></li>
                {sections.filter(s => selected.includes(s.key)).map((s, i) =>
                  <li key={s.key}>
                    <span className="bps-toc-index">{i + 4}.</span>
                    {s.type === "custom" ? <i>{s.title}</i> : s.label}
                    <FaCheckCircle style={{ color: "#1de682", marginLeft: 6 }} />
                    <span className="bps-toc-page">{getTOCPage(i)}</span>
                  </li>
                )}
                <li>
                  <span className="bps-toc-index">{sections.filter(s => selected.includes(s.key)).length + 4}.</span>
                  Audit Trail Appendix <span className="bps-toc-page">{sections.filter(s => selected.includes(s.key)).length + 5}</span>
                </li>
              </ul>
            )}
          </div>
          {/* Highlights (editable) */}
          <div className="bps-summary-section">
            <div className="bps-summary-title">
              <FaCrown style={{ marginRight: 7 }} />
              Boardroom Highlights & Alerts
            </div>
            <ul className="bps-summary-list">
              {highlights.map((h, i) =>
                <li key={i} className="bps-summary-item">
                  {editingHighlight === i ? (
                    <>
                      <input
                        className="bps-highlight-edit"
                        value={newHighlight}
                        onChange={e => setNewHighlight(e.target.value)}
                        onBlur={() => saveEditHighlight(i)}
                        autoFocus
                      />
                      <button className="bps-highlight-save" onClick={() => saveEditHighlight(i)}>Save</button>
                    </>
                  ) : (
                    <>
                      {h}
                      <button className="bps-highlight-edit-btn" onClick={() => startEditHighlight(i)}>
                        <FaPen style={{ fontSize: 13, marginLeft: 6 }} />
                      </button>
                      <button className="bps-highlight-remove-btn" onClick={() => removeHighlight(i)}>
                        <FaTrash style={{ fontSize: 13, marginLeft: 3 }} />
                      </button>
                    </>
                  )}
                </li>
              )}
            </ul>
            <div className="bps-highlight-add-row">
              <input
                className="bps-highlight-add-input"
                placeholder="Add boardroom highlight…"
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addHighlight(); }}
              />
              <button className="bps-highlight-add-btn" onClick={addHighlight}>Add</button>
            </div>
            <button className="bps-ai-btn" onClick={runAISummary}>
              <FaRegLightbulb style={{ marginRight: 6 }} />
              AI Boardroom Summary
            </button>
            {aiSummary && (
              <div className="bps-ai-summary">
                <pre>{aiSummary}</pre>
              </div>
            )}
          </div>
          {/* Custom Section Add */}
          <div className="bps-custom-section-row">
            <div className="bps-custom-section-title">
              Add Custom Section
            </div>
            <input
              className="bps-custom-title"
              placeholder="Section title…"
              value={newCustomSection.title}
              onChange={e => setNewCustomSection(cs => ({ ...cs, title: e.target.value }))}
            />
            <textarea
              className="bps-custom-content"
              placeholder="Section content (rich text supported in PDF export)…"
              value={newCustomSection.content}
              onChange={e => setNewCustomSection(cs => ({ ...cs, content: e.target.value }))}
              rows={2}
            />
            <button className="bps-custom-add-btn" onClick={addCustomSection}>Add Section</button>
          </div>
          {/* Custom Section List */}
          {customSections.length > 0 && (
            <div className="bps-custom-section-list">
              {customSections.map((s, idx) =>
                <div key={s.key} className="bps-custom-section-card">
                  <div className="bps-custom-title"><i>{s.title}</i></div>
                  <div className="bps-custom-content">{s.content}</div>
                  <button className="bps-custom-remove-btn" onClick={() => removeCustomSection(idx)}><FaTrash /></button>
                </div>
              )}
            </div>
          )}
          {/* Section Order Drag-and-Drop */}
          <div className="bps-section-order-title">Arrange Sections (drag to reorder):</div>
          <ul className="bps-section-order-list">
            {sections.filter(s => selected.includes(s.key)).map((s, idx) =>
              <li
                key={s.key}
                className="bps-section-order-item"
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={() => onDrop(idx)}
              >
                <FaArrowsAlt className="bps-section-drag-icon" />
                {s.type === "custom" ? <i>{s.title}</i> : s.label}
              </li>
            )}
          </ul>
          {/* Module Selector */}
          <div className="bps-select-section">
            <div className="bps-select-head">Choose Dashboards/Reports to Include</div>
            <div className="bps-select-list">
              {MODULES.map(m =>
                <label className="bps-select-item" key={m.key}>
                  <input
                    type="checkbox"
                    checked={selected.includes(m.key)}
                    onChange={() => toggleModule(m.key)}
                  />
                  <span>{m.label}</span>
                </label>
              )}
            </div>
          </div>
          {/* Signature block (multi-signature) */}
          <div className="bps-signature-section">
            <div className="bps-signature-title">
              <FaUserShield style={{ marginRight: 8 }} />
              Boardroom Signatures
            </div>
            <ul className="bps-signatories-list">
              {signatories.map((s, idx) =>
                <li key={s.name}>
                  <span className="bps-signatory-name">{s.name} ({s.role})</span>
                  <button className={`bps-sign-btn${s.signed ? " signed" : ""}`} onClick={() => sign(idx)}>
                    {s.signed ? "Signed" : "Sign"}
                  </button>
                </li>
              )}
            </ul>
            {!signatories.every(s => s.signed) && (
              <span className="bps-signature-warning">All signatures required before export</span>
            )}
          </div>
          {/* Export Buttons */}
          <div className="bps-export-row">
            <button className="bps-export-btn" onClick={() => exportPack("pdf")} disabled={downloading || !signatories.every(s => s.signed)}>
              <FaFilePdf style={{ marginRight: 8 }} />
              {downloading ? "Exporting..." : "Export Board Pack PDF"}
            </button>
            <button className="bps-export-btn pptx" onClick={() => exportPack("pptx")} disabled={downloading || !signatories.every(s => s.signed)}>
              <FaFilePowerpoint style={{ marginRight: 8 }} />
              {downloading ? "Exporting..." : "Export as PowerPoint"}
            </button>
          </div>
          {secureLink && (
            <div className="bps-secure-link">
              <FaLink /> Secure download link: <span>{secureLink}</span>
            </div>
          )}
          {/* Audit Trail / Export Log */}
          <div className="bps-log-section">
            <div className="bps-log-title">
              <FaHistory style={{ marginRight: 8 }} />
              Board Pack Export Log
            </div>
            <ul className="bps-log-list">
              {packLog.length === 0 && <li>No packs exported yet.</li>}
              {packLog.map((log, i) => (
                <li key={i}>
                  <span className="bps-log-date">{log.date}:</span>
                  <span className="bps-log-signer">{log.by}</span>
                  <span className="bps-log-modules">{log.modules.length} modules ({log.type})</span>
                  <span className="bps-log-link"><a href={log.link} target="_blank" rel="noopener noreferrer">{log.link}</a></span>
                </li>
              ))}
            </ul>
            <div className="bps-log-appendix">
              <b>Note:</b> Audit log is auto-attached as appendix in every export.
            </div>
          </div>
        </>
      ) : (
        <div className="bps-preview">
          <div className="bps-preview-label">Boardroom Pack Preview (mockup)</div>
          <div className="bps-preview-cover">
            <img src={logo} alt="Club Logo" className="bps-preview-logo" />
            <div className="bps-preview-title">{preparedFor}</div>
            <div className="bps-preview-sub">Boardroom Pack by CourtEvo Vero Consulting</div>
            <div className="bps-preview-date">{new Date().toLocaleDateString()}</div>
          </div>
          {heroVisual && (
            <div className="bps-preview-hero">
              <img src={heroVisual} alt="Executive Visual" />
            </div>
          )}
          <div className="bps-preview-highlights">
            <b>Boardroom Highlights & Alerts:</b>
            <ul>
              {highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
          {sections.filter(s => selected.includes(s.key)).map((s, idx) =>
            <div className="bps-preview-section" key={s.key}>
              <b>{s.type === "custom" ? s.title : s.label}</b>
              <div style={{ fontStyle: s.type === "custom" ? "italic" : undefined }}>
                {s.type === "custom" ? s.content : <span>Module report content goes here…</span>}
              </div>
            </div>
          )}
          <div className="bps-preview-signatures">
            <b>Signatures:</b>
            <ul>
              {signatories.filter(s => s.signed).map(s => <li key={s.name}>{s.name} ({s.role})</li>)}
            </ul>
          </div>
          <div className="bps-preview-watermark">Prepared by CourtEvo Vero – Elite Basketball Consulting</div>
        </div>
      )}
      <div className="bps-footer">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>{preparedFor}</span>
        <span style={{ marginLeft: 14, color: "#FFD700" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}
