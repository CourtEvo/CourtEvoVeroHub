import React, { useState, useRef } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaCalendarAlt, FaUserTie, FaChartPie, FaFilePdf, FaTasks, FaUpload, FaUsers, FaFilter } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';

const COMPLIANCE_AREAS = [
  { id: 1, name: 'Player Data Privacy', sector: 'Legal', owner: 'Operations', deadline: '2025-07-01', status: 'Compliant', doc: 'privacy_policy.pdf', risk: 'Low', board: true },
  { id: 2, name: 'Child Safeguarding', sector: 'Sport', owner: 'Welfare', deadline: '2025-06-30', status: 'Action Needed', doc: '', risk: 'High', board: true },
  { id: 3, name: 'Coach Certification', sector: 'HR', owner: 'Coaching', deadline: '2025-08-15', status: 'Partially Compliant', doc: 'certificates_list.xlsx', risk: 'Medium', board: false },
  { id: 4, name: 'Financial Transparency', sector: 'Finance', owner: 'CFO', deadline: '2025-07-10', status: 'Overdue', doc: '', risk: 'High', board: true },
  { id: 5, name: 'GDPR Consent', sector: 'Legal', owner: 'Legal', deadline: '2025-07-01', status: 'Compliant', doc: 'gdpr_consents.pdf', risk: 'Low', board: false },
  { id: 6, name: 'Safeguarding Officer Training', sector: 'HR', owner: 'Welfare', deadline: '2025-09-01', status: 'Action Needed', doc: '', risk: 'High', board: false },
  { id: 7, name: 'Facility Safety Audit', sector: 'Operations', owner: 'Facility', deadline: '2025-08-01', status: 'Compliant', doc: 'safety_audit.pdf', risk: 'Low', board: false },
  { id: 8, name: 'Sponsorship Compliance', sector: 'Business', owner: 'Commercial', deadline: '2025-07-20', status: 'Compliant', doc: 'sponsorship_policy.pdf', risk: 'Low', board: true },
  { id: 9, name: 'Staff Vetting', sector: 'HR', owner: 'HR', deadline: '2025-07-10', status: 'Partially Compliant', doc: '', risk: 'Medium', board: false },
  // Add more areas...
];

const STATUS_COLORS = {
  'Compliant': '#27ef7d',
  'Partially Compliant': '#ffd700',
  'Action Needed': '#ffac36',
  'Overdue': '#e94057'
};

const RISK_ICONS = {
  'High': <FaExclamationTriangle style={{ color: '#e94057' }} title="High risk" />,
  'Medium': <FaExclamationTriangle style={{ color: '#ffd700' }} title="Medium risk" />,
  'Low': <FaCheckCircle style={{ color: '#27ef7d' }} title="Low risk" />,
};

const SECTORS = [...new Set(COMPLIANCE_AREAS.map(c => c.sector))];

const getStatusIcon = status => {
  switch (status) {
    case 'Compliant': return <FaCheckCircle style={{ color: STATUS_COLORS[status], fontSize: 18 }} />;
    case 'Partially Compliant': return <FaChartPie style={{ color: STATUS_COLORS[status], fontSize: 18 }} />;
    case 'Action Needed': return <FaTasks style={{ color: STATUS_COLORS[status], fontSize: 18 }} />;
    case 'Overdue': return <FaExclamationTriangle style={{ color: STATUS_COLORS[status], fontSize: 18 }} />;
    default: return null;
  }
};

export default function ComplianceAutomation() {
  const [areas, setAreas] = useState(COMPLIANCE_AREAS);
  const [filter, setFilter] = useState({ sector: 'All', board: 'All', status: 'All', risk: 'All' });
  const [auditTrail, setAuditTrail] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [action, setAction] = useState({ id: null, msg: '' });
  const dashboardRef = useRef();

  // --- AI Compliance Advisor ---
  const aiAdvice = [
    ...areas.filter(a => a.status === 'Overdue' || a.status === 'Action Needed')
      .map(a => ({
        msg: `Area "${a.name}" requires urgent action (${a.status}). Assign to ${a.owner} and set resolution deadline.`,
        risk: a.risk
      })),
    ...areas.filter(a => a.status === 'Partially Compliant')
      .map(a => ({
        msg: `Partial compliance detected in "${a.name}". Run a self-audit and upload missing documentation.`,
        risk: a.risk
      }))
  ];
  // Simulate more AI actions if wanted
  if (areas.some(a => a.risk === 'High' && (a.status !== 'Compliant'))) {
    aiAdvice.push({
      msg: 'Multiple HIGH RISK items are pending. Recommend urgent board review and external audit.',
      risk: 'High'
    });
  }

  // --- Filters ---
  let filtered = areas;
  if (filter.sector !== 'All') filtered = filtered.filter(a => a.sector === filter.sector);
  if (filter.board !== 'All') filtered = filtered.filter(a => a.board === (filter.board === 'Yes'));
  if (filter.status !== 'All') filtered = filtered.filter(a => a.status === filter.status);
  if (filter.risk !== 'All') filtered = filtered.filter(a => a.risk === filter.risk);

  // --- Download PDF ---
  const handleDownloadPDF = () => {
    html2pdf().from(dashboardRef.current).save('ComplianceDashboard.pdf');
  };
  // --- Print ---
  const handlePrint = useReactToPrint({
    content: () => dashboardRef.current,
    documentTitle: `ComplianceDashboard_${new Date().toISOString().slice(0,10)}`
  });

  // --- Upload Document (mock) ---
  const handleDocUpload = (areaId, file) => {
    setAreas(areas.map(a =>
      a.id === areaId ? { ...a, doc: file.name } : a
    ));
    setAuditTrail(trail => [...trail, {
      timestamp: new Date().toLocaleString(),
      event: `Uploaded doc for "${areas.find(a => a.id === areaId).name}": ${file.name}`
    }]);
  };

  // --- Mark as Resolved (action) ---
  const handleResolve = id => {
    setAreas(areas.map(a =>
      a.id === id ? { ...a, status: 'Compliant', risk: 'Low' } : a
    ));
    setAuditTrail(trail => [...trail, {
      timestamp: new Date().toLocaleString(),
      event: `Marked "${areas.find(a => a.id === id).name}" as compliant`
    }]);
  };

  // --- Self-assessment survey (mock) ---
  const handleSelfAssessment = id => {
    setAuditTrail(trail => [...trail, {
      timestamp: new Date().toLocaleString(),
      event: `Ran self-assessment for "${areas.find(a => a.id === id).name}"`
    }]);
    setAreas(areas.map(a =>
      a.id === id ? { ...a, status: 'Partially Compliant' } : a
    ));
  };

  return (
    <div style={{ maxWidth: 1250, margin: '0 auto', padding: '0 16px' }}>
      <div ref={dashboardRef} style={{
        background: 'rgba(32,40,58,0.95)',
        borderRadius: 20,
        boxShadow: '0 3px 32px #FFD70044',
        marginTop: 32,
        marginBottom: 38,
        padding: 36
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 29, letterSpacing: 2 }}>
            Compliance Automation & Board Governance Center
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handlePrint} style={{
              background: '#FFD700', color: '#232', borderRadius: 7, border: 'none',
              fontWeight: 800, padding: '9px 17px', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 12px #FFD70033'
            }}>
              Print
            </button>
            <button onClick={handleDownloadPDF} style={{
              background: '#27ef7d', color: '#232', borderRadius: 7, border: 'none',
              fontWeight: 800, padding: '9px 17px', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 12px #27ef7d33'
            }}>
              <FaFilePdf style={{ marginBottom: -3, marginRight: 6 }} />
              PDF
            </button>
            <button onClick={() => setShowAI(s => !s)} style={{
              background: '#485563', color: '#FFD700', borderRadius: 7, border: 'none',
              fontWeight: 700, padding: '9px 17px', fontSize: 15, cursor: 'pointer'
            }}>
              AI Advisor
            </button>
          </div>
        </div>

        {/* Board/Management filter */}
        <div style={{ marginBottom: 10 }}>
          <FaFilter style={{ color: "#FFD700", marginRight: 7 }} />
          <b style={{ color: "#FFD700" }}>Filter by:</b>
          <select value={filter.sector} onChange={e => setFilter(f => ({ ...f, sector: e.target.value }))} style={{ margin: '0 6px', padding: '3px 11px', borderRadius: 5 }}>
            <option>All</option>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{ margin: '0 6px', padding: '3px 11px', borderRadius: 5 }}>
            <option>All</option>
            <option>Compliant</option>
            <option>Partially Compliant</option>
            <option>Action Needed</option>
            <option>Overdue</option>
          </select>
          <select value={filter.risk} onChange={e => setFilter(f => ({ ...f, risk: e.target.value }))} style={{ margin: '0 6px', padding: '3px 11px', borderRadius: 5 }}>
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select value={filter.board} onChange={e => setFilter(f => ({ ...f, board: e.target.value }))} style={{ margin: '0 6px', padding: '3px 11px', borderRadius: 5 }}>
            <option value="All">All Roles</option>
            <option value="Yes">Board/Exec Only</option>
            <option value="No">Operational</option>
          </select>
        </div>

        {/* Compliance Progress Visuals */}
        <div style={{
          display: 'flex',
          gap: 18,
          margin: '18px 0 28px 0',
          flexWrap: 'wrap'
        }}>
          {/* Compliance Ring */}
          <div style={{ minWidth: 170, textAlign: 'center' }}>
            <svg width="115" height="115">
              <circle cx="57" cy="57" r="50" fill="none" stroke="#444b5f" strokeWidth="13" />
              <circle
                cx="57"
                cy="57"
                r="50"
                fill="none"
                stroke="#27ef7d"
                strokeWidth="13"
                strokeDasharray={`${Math.round(2 * Math.PI * 50 * (areas.filter(a => a.status === 'Compliant').length / areas.length))} ${Math.round(2 * Math.PI * 50 * (1 - areas.filter(a => a.status === 'Compliant').length / areas.length))}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.7s' }}
              />
            </svg>
            <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 15, marginTop: 5 }}>
              {Math.round(areas.filter(a => a.status === 'Compliant').length / areas.length * 100)}% compliant
            </div>
          </div>
          {/* Overdue */}
          <div style={{
            minWidth: 170,
            textAlign: 'center',
            color: '#e94057',
            background: '#ffd70011',
            borderRadius: 13,
            padding: '10px 9px'
          }}>
            <FaExclamationTriangle style={{ fontSize: 30, color: '#e94057' }} />
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              {areas.filter(a => a.status === 'Overdue').length} Overdue
            </div>
          </div>
          {/* High Risk */}
          <div style={{
            minWidth: 170,
            textAlign: 'center',
            color: '#e94057',
            background: '#e9405733',
            borderRadius: 13,
            padding: '10px 9px'
          }}>
            <FaExclamationTriangle style={{ fontSize: 28, color: '#e94057' }} />
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {areas.filter(a => a.risk === 'High').length} High Risk
            </div>
          </div>
        </div>

        {/* Compliance Table */}
        <div style={{
          overflowX: 'auto',
          borderRadius: 13,
          background: '#232733cc',
          boxShadow: '0 1px 10px #FFD70011',
          padding: '5px 2px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, color: '#fff' }}>
            <thead>
              <tr style={{ background: '#FFD70022' }}>
                <th style={{ padding: '10px 8px' }}>Area</th>
                <th>Sector</th>
                <th>Owner</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{
                  background: a.status === 'Overdue' ? '#e9405733' : a.status === 'Action Needed' ? '#ffd70019' : 'transparent',
                  borderBottom: '1px solid #313a48'
                }}>
                  <td style={{ fontWeight: 700, color: '#FFD700', padding: '7px 8px' }}>
                    {getStatusIcon(a.status)} &nbsp;{a.name}
                  </td>
                  <td>{a.sector}</td>
                  <td><FaUserTie style={{ marginBottom: -2, marginRight: 3 }} /> {a.owner}</td>
                  <td>
                    <FaCalendarAlt style={{ marginBottom: -2, marginRight: 2 }} />
                    {a.deadline}
                  </td>
                  <td style={{ color: STATUS_COLORS[a.status], fontWeight: 800 }}>{a.status}</td>
                  <td>{RISK_ICONS[a.risk]} {a.risk}</td>
                  <td>
                    {a.doc
                      ? <a href={`/${a.doc}`} target="_blank" rel="noopener noreferrer" style={{ color: '#27ef7d', fontWeight: 700 }}>
                        {a.doc.split('.').pop().toUpperCase()}
                        <FaFilePdf style={{ marginLeft: 5, fontSize: 15, verticalAlign: 'middle' }} />
                      </a>
                      : <span style={{ color: '#e94057', fontWeight: 600 }}>Missing</span>
                    }
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      id={`upload-${a.id}`}
                      onChange={e => handleDocUpload(a.id, e.target.files[0])}
                    />
                    <label htmlFor={`upload-${a.id}`} style={{ marginLeft: 9, cursor: 'pointer', color: '#FFD700' }}>
                      <FaUpload style={{ marginBottom: -2, marginRight: 3 }} /> Upload
                    </label>
                  </td>
                  <td>
                    <button onClick={() => handleResolve(a.id)} style={{
                      background: '#27ef7d', color: '#222', border: 'none', borderRadius: 5, padding: '5px 14px', fontWeight: 800, marginRight: 4, cursor: 'pointer'
                    }}>
                      Resolve
                    </button>
                    <button onClick={() => handleSelfAssessment(a.id)} style={{
                      background: '#ffd700', color: '#222', border: 'none', borderRadius: 5, padding: '5px 13px', fontWeight: 700, marginRight: 4, cursor: 'pointer'
                    }}>
                      Self-Check
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ color: '#FFD70099', textAlign: 'center', padding: 22 }}>
                    No items match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Board/AI Advice */}
        {showAI && (
          <div style={{
            marginTop: 24,
            background: '#ffd70022',
            borderRadius: 12,
            padding: '20px 24px',
            color: '#232',
            fontWeight: 700,
            fontSize: 17
          }}>
            <div style={{ color: '#e94057', fontSize: 20, marginBottom: 9 }}>AI Advisor & Action Center</div>
            <ul>
              {aiAdvice.length === 0 && <li>All compliance areas look solid right now.</li>}
              {aiAdvice.map((a, idx) => (
                <li key={idx} style={{ marginBottom: 6, color: a.risk === 'High' ? '#e94057' : '#313' }}>
                  {a.msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Audit Trail */}
        <div style={{
          marginTop: 29,
          background: '#222836cc',
          borderRadius: 9,
          padding: 15,
          color: '#ffd700',
          fontSize: 14
        }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 7 }}>
            <FaUsers style={{ marginBottom: -2, marginRight: 5, fontSize: 17 }} />
            Audit Trail & Change Log
          </div>
          {auditTrail.length === 0 && <div style={{ color: '#FFD70099' }}>No recent compliance actions.</div>}
          <ul>
            {auditTrail.slice().reverse().map((e, idx) => (
              <li key={idx} style={{ color: '#FFD700cc', marginBottom: 3 }}>{e.timestamp} — {e.event}</li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ margin: '24px 0 24px 0', textAlign: 'center', color: '#FFD70088', fontSize: 13 }}>
        CourtEvo Vero | Compliance Center • Data is for internal governance demo only.
      </div>
    </div>
  );
}
