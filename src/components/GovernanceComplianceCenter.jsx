import React, { useState } from "react";
import { FaShieldAlt, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaGavel, FaClipboardList, FaClipboardCheck, FaBalanceScale, FaChartBar, FaUpload, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";

// Fake compliance registry (extend as needed)
const COMPLIANCE_CHECKS = [
  {
    id: 1,
    area: "Anti-Doping",
    status: "Compliant",
    lastAudit: "2024-04-02",
    nextDue: "2025-04-01",
    responsible: "Head Physio",
    documents: ["anti-doping.pdf"]
  },
  {
    id: 2,
    area: "Safeguarding",
    status: "Non-Compliant",
    lastAudit: "2023-12-15",
    nextDue: "2024-12-15",
    responsible: "Sport Director",
    documents: []
  },
  {
    id: 3,
    area: "Data Privacy",
    status: "Critical Alert",
    lastAudit: "2024-03-17",
    nextDue: "2024-07-01",
    responsible: "Data Protection Officer",
    documents: ["gdpr-review.xlsx", "privacy-policy.pdf"]
  },
  {
    id: 4,
    area: "Financial Reporting",
    status: "Compliant",
    lastAudit: "2024-01-30",
    nextDue: "2025-01-30",
    responsible: "Finance Manager",
    documents: ["annual-finance2024.pdf"]
  },
  {
    id: 5,
    area: "League Registration",
    status: "Warning",
    lastAudit: "2024-05-10",
    nextDue: "2024-08-01",
    responsible: "Secretary",
    documents: []
  }
];

const STATUS_COLOR = {
  "Compliant": "#27ef7d",
  "Non-Compliant": "#FFD700",
  "Warning": "#f39c12",
  "Critical Alert": "#e94057"
};

const STATUS_ICON = {
  "Compliant": <FaCheckCircle color="#27ef7d" />,
  "Non-Compliant": <FaExclamationTriangle color="#FFD700" />,
  "Warning": <FaExclamationCircle color="#f39c12" />,
  "Critical Alert": <FaExclamationCircle color="#e94057" />
};

const FAKE_GUIDANCE = {
  "Anti-Doping": "Review all anti-doping certificates and training for the new season. AI: Recommend quarterly spot checks.",
  "Safeguarding": "Non-compliance: Board must address policy gaps, ensure all coaches complete background check in 30 days.",
  "Data Privacy": "Critical: Immediate GDPR policy update required, audit all athlete/parent data sharing consents.",
  "Financial Reporting": "On track. AI: Suggest upgrading to automated finance reporting to cut errors.",
  "League Registration": "Warning: Documents pending. Resubmit forms before July 15 to avoid league sanction."
};

export default function GovernanceComplianceCenter() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const filtered = COMPLIANCE_CHECKS.filter(c =>
    c.area.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: 26, borderRadius: 24, background: "rgba(40,62,81,0.96)", boxShadow: "0 8px 24px #FFD70018" }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 30, marginBottom: 10 }}>
        <FaShieldAlt style={{ marginBottom: -7, fontSize: 29 }} /> Compliance & Governance Center
      </h2>
      <div style={{ color: "#FFD700cc", fontWeight: 600, marginBottom: 20 }}>
        Real-time club/federation compliance status. Board-level alerts, due dates, documents, and AI guidance built-in.
      </div>

      {/* Search/filter */}
      <input
        style={{ width: 340, padding: 7, borderRadius: 7, border: "none", fontSize: 16, marginBottom: 14 }}
        placeholder="Search area, status or person..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <table style={{ width: "100%", borderRadius: 7, marginBottom: 18, background: "#222d38" }}>
        <thead>
          <tr style={{ color: "#FFD700", fontWeight: 800 }}>
            <th>Area</th>
            <th>Status</th>
            <th>Last Audit</th>
            <th>Next Due</th>
            <th>Responsible</th>
            <th>Docs</th>
            <th>AI Guidance</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, idx) => (
            <tr
              key={c.id}
              style={{
                background: selected?.id === c.id ? "#FFD70011" : idx % 2 === 0 ? "#283e51" : "#222d38",
                cursor: "pointer"
              }}
              onClick={() => setSelected(c)}
            >
              <td style={{ padding: "8px 0", fontWeight: 700 }}>{c.area}</td>
              <td style={{ color: STATUS_COLOR[c.status], fontWeight: 800, textAlign: "center" }}>{STATUS_ICON[c.status]} {c.status}</td>
              <td>{c.lastAudit}</td>
              <td style={{ fontWeight: 600 }}>{c.nextDue}</td>
              <td>{c.responsible}</td>
              <td>
                {c.documents.length > 0
                  ? c.documents.map(d =>
                    <span key={d} style={{
                      display: "inline-block", marginRight: 5, color: "#27ef7d",
                      border: "1px solid #27ef7d99", borderRadius: 4, padding: "2px 7px", fontSize: 13
                    }}>
                      <FaDownload style={{ marginRight: 2 }} /> {d}
                    </span>)
                  : <span style={{ color: "#FFD70055" }}>None</span>}
              </td>
              <td>
                <motion.button
                  style={{
                    background: "#FFD700",
                    color: "#222",
                    fontWeight: 800,
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontSize: 15
                  }}
                  whileHover={{ scale: 1.09 }}
                  onClick={e => { e.stopPropagation(); alert(FAKE_GUIDANCE[c.area] || "Review board protocols."); }}
                  title="AI Guidance"
                >
                  <FaGavel style={{ marginBottom: -3, marginRight: 4 }} />
                  Board/AI
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          style={{
            background: "#181e23", padding: 23, borderRadius: 13, marginTop: 14,
            color: "#FFD700bb", fontWeight: 600, boxShadow: "0 2px 9px #FFD70011"
          }}>
          <h3 style={{ color: "#FFD700", fontWeight: 900 }}>
            {STATUS_ICON[selected.status]} {selected.area} — {selected.status}
          </h3>
          <div>Responsible: <b>{selected.responsible}</b></div>
          <div>Last Audit: {selected.lastAudit} | Next Due: {selected.nextDue}</div>
          <div style={{ marginTop: 7 }}>
            <b>AI Board/Compliance Guidance:</b>
            <div style={{ color: "#27ef7d", fontWeight: 800 }}>{FAKE_GUIDANCE[selected.area]}</div>
          </div>
          {selected.documents.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Attached Documents:</b> {selected.documents.join(", ")}
            </div>
          )}
        </motion.div>
      )}

      {/* Upload - demo */}
      <div style={{ marginTop: 21 }}>
        <label style={{ fontWeight: 700, color: "#FFD700" }}>
          <FaUpload style={{ marginBottom: -2, marginRight: 5 }} />
          Attach new compliance doc:
        </label>
        <input type="file" onChange={e => setUploadFile(e.target.files[0])} style={{ marginLeft: 7 }} />
        <button
          style={{
            marginLeft: 10, background: "#27ef7d", color: "#222",
            fontWeight: 800, border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer"
          }}
          onClick={() => { setUploadFile(null); alert("Doc uploaded (demo only)"); }}
          disabled={!uploadFile}
        >
          Upload
        </button>
        {uploadFile && <span style={{ marginLeft: 13, color: "#FFD700bb" }}>{uploadFile.name}</span>}
      </div>
      <div style={{ marginTop: 20, color: "#FFD70088", textAlign: "center" }}>
        Board-level compliance oversight, due date alerts, AI guidance and evidence — all in one module.
      </div>
    </div>
  );
}
