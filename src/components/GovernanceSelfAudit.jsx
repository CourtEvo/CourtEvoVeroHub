import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCommentDots } from "react-icons/fa";

const QUESTIONS = [
  {
    category: "Structure & Oversight",
    items: [
      "Clear division of board and executive duties",
      "Active, transparent meeting records (minutes, votes)",
      "Annual review of club/federation statutes"
    ]
  },
  {
    category: "Strategy & Planning",
    items: [
      "Formal, documented strategic plan",
      "Regular progress review against KPIs",
      "Risk register reviewed at least twice a year"
    ]
  },
  {
    category: "Financial Governance",
    items: [
      "Budget approved annually by board",
      "All significant spendings pre-approved",
      "Independent annual audit performed"
    ]
  },
  {
    category: "Stakeholder Engagement",
    items: [
      "Members/parents can raise concerns formally",
      "Regular communication to stakeholders (newsletter/email)",
      "Code of conduct enforced for all staff/volunteers"
    ]
  }
];

const OPTIONS = [
  { label: "Fully Achieved", value: 2, icon: <FaCheckCircle color="#27ef7d" /> },
  { label: "Partially", value: 1, icon: <FaExclamationTriangle color="#FFD700" /> },
  { label: "No/Not Documented", value: 0, icon: <FaTimesCircle color="#e94057" /> }
];

const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const LS_KEY = "CourtEvoVero_GovAudit";

const GovernanceSelfAudit = () => {
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState({});
  const [showComment, setShowComment] = useState(null); // key of question
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState("");
  const [signed, setSigned] = useState(null);
  const auditRef = useRef();

  // Auto-save to local storage
  useEffect(() => {
    const ls = window.localStorage.getItem(LS_KEY);
    if (ls) {
      const parsed = JSON.parse(ls);
      setAnswers(parsed.answers || {});
      setComments(parsed.comments || {});
      setSigned(parsed.signed || null);
      setSignature(parsed.signature || "");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify({ answers, comments, signed, signature })
    );
  }, [answers, comments, signed, signature]);

  const handlePrint = useReactToPrint({
    content: () => auditRef.current,
    documentTitle: `CourtEvoVero_GovernanceAudit_${new Date().toISOString().slice(0, 10)}`
  });

  // Calculate summary score
  const total = QUESTIONS.reduce((t, q) => t + q.items.length, 0);
  const score = Object.values(answers).reduce((s, v) => s + Number(v), 0);
  const percent = Math.round((score / (total * 2)) * 100);

  // Traffic light
  let scoreColor = "#FFD700";
  if (percent >= 80) scoreColor = "#27ef7d";
  else if (percent < 50) scoreColor = "#e94057";

  // Priority actions (auto-generated)
  const actions = [];
  QUESTIONS.forEach((q) =>
    q.items.forEach((item, idx) => {
      const key = `${q.category}_${idx}`;
      if (!answers[key] || answers[key] < 2)
        actions.push(`Improve: ${item}`);
    })
  );

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: 0 }}>
      <motion.section
        ref={auditRef}
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
          Governance/Board Self-Audit
        </h2>
        <div style={{
          marginBottom: 16,
          color: scoreColor,
          fontWeight: 700,
          fontSize: 20
        }}>
          Score: {score} / {total * 2} ({percent}%)
          <span style={{
            background: scoreColor,
            display: "inline-block",
            marginLeft: 10,
            width: 32,
            height: 20,
            borderRadius: 6,
            verticalAlign: "middle"
          }}></span>
        </div>
        {QUESTIONS.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.11, duration: 0.6 }}
            style={{
              marginBottom: 20,
              padding: "18px 22px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.07)",
              boxShadow: "0 2px 8px #FFD70011"
            }}
          >
            <h3 style={{ color: "#FFD700", fontWeight: 600, fontSize: 19 }}>{cat.category}</h3>
            <ul style={{ fontSize: 16, marginLeft: 18, color: "#fff" }}>
              {cat.items.map((item, idx) => {
                const key = `${cat.category}_${idx}`;
                return (
                  <li key={item} style={{ marginBottom: 10 }}>
                    {item}
                    <span style={{ marginLeft: 14 }}>
                      {OPTIONS.map((opt) => (
                        <label key={opt.label} style={{ marginRight: 8 }}>
                          <input
                            type="radio"
                            name={key}
                            value={opt.value}
                            checked={answers[key] == opt.value}
                            onChange={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [key]: opt.value
                              }))
                            }
                            style={{ marginRight: 5, accentColor: opt.value === 2 ? "#27ef7d" : opt.value === 1 ? "#FFD700" : "#e94057" }}
                          />
                          {opt.icon} {opt.label}
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowComment(key)}
                        style={{
                          background: "transparent",
                          color: "#FFD700",
                          marginLeft: 6,
                          border: "none",
                          fontSize: 17,
                          verticalAlign: "middle",
                          cursor: "pointer"
                        }}
                        title="Add comment"
                      >
                        <FaCommentDots />
                      </button>
                    </span>
                    {comments[key] && (
                      <div style={{
                        background: "#FFD70022",
                        color: "#222",
                        fontSize: 14,
                        borderRadius: 7,
                        marginTop: 5,
                        padding: "4px 10px",
                        maxWidth: 420
                      }}>
                        <b>Comment:</b> {comments[key]}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
        <div style={{
          marginTop: 14,
          color: "#FFD700",
          fontWeight: 600,
          fontSize: 18
        }}>
          Priority Actions:
        </div>
        <ul style={{ color: "#FFD700", fontSize: 16 }}>
          {actions.length === 0 ? (
            <li>All areas fully achieved. Board performance is elite!</li>
          ) : actions.map((act, i) => <li key={i}>{act}</li>)}
        </ul>
        <div style={{ marginTop: 32, marginBottom: 12, textAlign: "center" }}>
          <button
            onClick={() => setSigning(true)}
            disabled={!!signed}
            style={{
              background: "#27ef7d",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 22px",
              fontSize: 18,
              cursor: signed ? "not-allowed" : "pointer",
              opacity: signed ? 0.8 : 1
            }}
          >
            {signed ? `Signed by ${signed.name} on ${signed.date}` : "Sign & Lock Audit"}
          </button>
        </div>
      </motion.section>
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
          Export Self-Audit (PDF)
        </button>
      </div>

      {/* Comment Modal */}
      {showComment && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.86)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 340
          }}>
            <h3 style={{ color: "#FFD700", fontSize: 19 }}>Comment for Board Audit</h3>
            <textarea
              value={comments[showComment] || ""}
              onChange={e => setComments(c => ({ ...c, [showComment]: e.target.value }))}
              rows={5}
              style={{ width: "100%", fontSize: 16, borderRadius: 8, padding: 10, marginBottom: 9 }}
              placeholder="Type confidential note or evidence here..."
            />
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowComment(null)}
                style={{
                  background: "#FFD700", color: "#222", border: "none", borderRadius: 6,
                  padding: "5px 14px", fontWeight: 700, fontSize: 16, marginTop: 4
                }}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {signing && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.82)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", color: "#222", padding: 28, borderRadius: 15, minWidth: 340
          }}>
            <h3 style={{ color: "#FFD700", fontSize: 19 }}>Sign & Lock Audit</h3>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder="Your full name"
              style={{ width: "100%", fontSize: 17, padding: 9, borderRadius: 7, marginBottom: 11 }}
              disabled={!!signed}
            />
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => {
                  setSigned({ name: signature, date: new Date().toLocaleString() });
                  setSigning(false);
                }}
                disabled={!signature}
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}
              >Sign</button>
              <button
                onClick={() => setSigning(false)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginLeft: 7
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceSelfAudit;
