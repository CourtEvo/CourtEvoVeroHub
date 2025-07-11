import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

const STATUS = [
  { label: "Open", color: "#FFD700" },
  { label: "Mitigated", color: "#27ef7d" },
  { label: "Closed", color: "#ccc" }
];

const INIT = [
  {
    id: 1,
    description: "Potential sponsor default on 2025-26 payment",
    owner: "Board",
    impact: "High",
    mitigation: "Review sponsor financials, add backup sponsor",
    status: "Open",
    linkedDecision: ""
  }
];

const RiskRegister = () => {
  const [risks, setRisks] = useState(INIT);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    description: "", owner: "", impact: "", mitigation: "", status: "Open", linkedDecision: ""
  });
  const riskRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => riskRef.current,
    documentTitle: `CourtEvoVero_RiskRegister_${new Date().toISOString().slice(0, 10)}`
  });

  const addEntry = e => {
    e.preventDefault();
    setRisks([
      { ...form, id: Date.now() },
      ...risks
    ]);
    setAdding(false);
    setForm({ description: "", owner: "", impact: "", mitigation: "", status: "Open", linkedDecision: "" });
  };

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: 0 }}>
      <motion.section
        ref={riskRef}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 18 }}>
          Board Risk Register
        </h2>
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "#FFD700",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 22px",
              fontSize: 17,
              cursor: "pointer"
            }}>
            + Add Risk
          </button>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 18 }}>
          <table style={{ width: "100%", borderSpacing: 0, color: "#fff" }}>
            <thead>
              <tr style={{ background: "#FFD70022" }}>
                <th style={{ padding: 9 }}>Description</th>
                <th>Owner</th>
                <th>Impact</th>
                <th>Mitigation/Plan</th>
                <th>Status</th>
                <th>Linked Decision</th>
              </tr>
            </thead>
            <tbody>
              {risks.map(risk => (
                <tr key={risk.id}
                  style={{
                    background: risk.status === "Mitigated" ? "#27ef7d22" : risk.status === "Open" ? "#FFD70022" : "#cccccc22"
                  }}>
                  <td style={{ padding: 8 }}>{risk.description}</td>
                  <td style={{ padding: 8 }}>{risk.owner}</td>
                  <td style={{ padding: 8 }}>{risk.impact}</td>
                  <td style={{ padding: 8 }}>{risk.mitigation}</td>
                  <td style={{ padding: 8, fontWeight: 600, color: STATUS.find(s => s.label === risk.status)?.color }}>
                    {risk.status}
                  </td>
                  <td style={{ padding: 8 }}>{risk.linkedDecision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={handlePrint}
            style={{
              background: "#FFD700",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 18px",
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 8px #FFD70033",
              marginBottom: 12
            }}
          >
            Export Risk Register (PDF)
          </button>
        </div>
      </motion.section>
      {adding && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.92)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={addEntry}
            style={{
              background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 380
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>New Risk</h3>
            <label>Description:<br />
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} required />
            </label>
            <label>Owner:<br />
              <input type="text" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} required />
            </label>
            <label>Impact:<br />
              <input type="text" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} />
            </label>
            <label>Mitigation:<br />
              <input type="text" value={form.mitigation} onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} />
            </label>
            <label>Status:<br />
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }}>
                {STATUS.map(s => <option key={s.label}>{s.label}</option>)}
              </select>
            </label>
            <label>Linked Decision:<br />
              <input type="text" value={form.linkedDecision} onChange={e => setForm(f => ({ ...f, linkedDecision: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} />
            </label>
            <div style={{ textAlign: "right" }}>
              <button
                type="submit"
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>Save</button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginLeft: 7
                }}
              >Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RiskRegister;
