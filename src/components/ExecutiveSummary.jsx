import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const ExecutiveSummary = ({
  kpis = [],
  insights = [],
  recommendations = []
}) => {
  const summaryRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => summaryRef.current,
    documentTitle: `CourtEvoVero_ExecutiveSummary_${new Date().toISOString().slice(0,10)}`
  });

  return (
    <section ref={summaryRef} style={{
      background: "rgba(255,255,255,0.10)",
      borderRadius: 20,
      padding: 36,
      marginTop: 40,
      marginBottom: 36,
      boxShadow: "0 2px 16px #FFD70044"
    }}>
      <motion.h2
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.1, duration: 0.7 }}
        style={{ color: "#FFD700", fontSize: 32, fontWeight: 700, marginBottom: 20 }}
      >
        Executive Summary
      </motion.h2>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{ marginBottom: 24 }}
      >
        <h3 style={{ color: "#FFD700", fontSize: 22, fontWeight: 600 }}>Key KPIs</h3>
        <ul style={{ color: "#fff", fontSize: 18, marginLeft: 18 }}>
          {(Array.isArray(kpis) ? kpis : []).map((k, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
              style={{ marginBottom: 8 }}
            >
              <span style={{ fontWeight: 700 }}>
                {k.label}
                <span
                  style={{
                    textDecoration: 'underline dotted',
                    color: '#FFD700',
                    marginLeft: 7,
                    cursor: 'help'
                  }}
                  title={k.tooltip}
                >?</span>
              </span>
              : <span style={{ color: "#27ef7d" }}>{k.value}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.3, duration: 0.7 }}
        style={{ marginBottom: 24 }}
      >
        <h3 style={{ color: "#FFD700", fontSize: 22, fontWeight: 600 }}>AI-Driven Insights</h3>
        <ul style={{ color: "#fff", fontSize: 17, marginLeft: 18 }}>
          {(Array.isArray(insights) ? insights : []).map((i, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              style={{ marginBottom: 8 }}
            >
              {i}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        <h3 style={{ color: "#FFD700", fontSize: 22, fontWeight: 600 }}>Action Priorities</h3>
        <ul style={{ color: "#FFD700", fontSize: 17, marginLeft: 18 }}>
          {(Array.isArray(recommendations) ? recommendations : []).map((r, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
              style={{ marginBottom: 8 }}
            >
              {r}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div style={{ marginTop: 24 }}>
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
          }}>
          Export Performance Book (PDF)
        </button>
      </div>
    </section>
  );
};

export default ExecutiveSummary;
