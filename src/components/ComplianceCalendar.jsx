import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { FaRegClock, FaCheckCircle } from "react-icons/fa";

const INIT = [
  { id: 1, date: "2025-07-15", event: "Annual General Meeting", status: "Upcoming" },
  { id: 2, date: "2025-09-30", event: "Audit Report Due", status: "Upcoming" },
  { id: 3, date: "2025-10-01", event: "License Renewal Submission", status: "Upcoming" }
];

const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const ComplianceCalendar = () => {
  const [cal, setCal] = useState(INIT);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: "", event: "", status: "Upcoming" });
  const calRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => calRef.current,
    documentTitle: `CourtEvoVero_ComplianceCalendar_${new Date().toISOString().slice(0, 10)}`
  });

  const addEntry = e => {
    e.preventDefault();
    setCal([{ ...form, id: Date.now() }, ...cal]);
    setAdding(false);
    setForm({ date: "", event: "", status: "Upcoming" });
  };

  return (
    <div style={{ width: "100%", maxWidth: 780, margin: "0 auto", padding: 0 }}>
      <motion.section
        ref={calRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
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
          Compliance Calendar
        </h2>
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "#27ef7d",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 22px",
              fontSize: 17,
              cursor: "pointer"
            }}>
            + Add Event
          </button>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 18 }}>
          <table style={{ width: "100%", borderSpacing: 0, color: "#fff" }}>
            <thead>
              <tr style={{ background: "#FFD70022" }}>
                <th style={{ padding: 9 }}>Date</th>
                <th>Event</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cal.map(e => (
                <tr key={e.id}
                  style={{
                    background: e.status === "Completed" ? "#27ef7d22" : "#FFD70022"
                  }}>
                  <td style={{ padding: 8 }}>{e.date}</td>
                  <td style={{ padding: 8 }}>{e.event}</td>
                  <td style={{ padding: 8, fontWeight: 600 }}>
                    {e.status === "Completed" ? <FaCheckCircle color="#27ef7d" /> : <FaRegClock color="#FFD700" />}
                    {e.status}
                  </td>
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
            Export Calendar (PDF)
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
              background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 340
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>New Compliance Event</h3>
            <label>Date:<br />
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} required />
            </label>
            <label>Event:<br />
              <input type="text" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }} required />
            </label>
            <label>Status:<br />
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 7 }}>
                <option>Upcoming</option>
                <option>Completed</option>
              </select>
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

export default ComplianceCalendar;
