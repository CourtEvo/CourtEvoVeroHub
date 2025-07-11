import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';

// Example skill list—customize based on your frameworks!
const SKILLS = [
  { category: 'Physical', items: ['Agility', 'Balance', 'Coordination', 'Speed', 'Strength'] },
  { category: 'Technical', items: ['Dribbling', 'Passing', 'Shooting', 'Defensive stance', 'Rebounding'] },
  { category: 'Cognitive', items: ['Game sense', 'Decision making', 'Situational awareness'] },
  { category: 'Psychological', items: ['Confidence', 'Focus', 'Coachability', 'Resilience'] }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EvaluationChecklist = () => {
  const [checked, setChecked] = useState({});
  const checklistRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => checklistRef.current,
    documentTitle: `CourtEvoVero_EvaluationChecklist_${new Date().toISOString().slice(0,10)}`
  });

  // Progress
  const total = SKILLS.reduce((sum, cat) => sum + cat.items.length, 0);
  const completed = Object.values(checked).filter(v => v).length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div style={{
      width: '100%',
      maxWidth: 700,
      margin: '0 auto',
      padding: 0,
    }}>
      <motion.section
        ref={checklistRef}
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
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 12 }}>
          Player Self-Evaluation Checklist
        </h2>
        <div style={{
          marginBottom: 16,
          color: percent === 100 ? "#27ef7d" : "#FFD700",
          fontWeight: 600
        }}>
          Progress: {completed} / {total} ({percent}%)
          <div style={{
            background: "#FFD70022",
            borderRadius: 8,
            height: 12,
            marginTop: 8,
            overflow: "hidden"
          }}>
            <div style={{
              background: percent === 100 ? "#27ef7d" : "#FFD700",
              height: "100%",
              width: `${percent}%`,
              transition: "width 0.4s"
            }} />
          </div>
        </div>
        {SKILLS.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
            style={{
              marginBottom: 20,
              padding: "16px 22px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              boxShadow: "0 2px 8px #FFD70011"
            }}
          >
            <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 19 }}>{cat.category}</h3>
            <ul style={{ fontSize: 16, marginLeft: 20, color: "#fff" }}>
              {cat.items.map(item => (
                <li key={item} style={{ marginBottom: 7 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!checked[`${cat.category}_${item}`]}
                      onChange={() =>
                        setChecked(prev => ({
                          ...prev,
                          [`${cat.category}_${item}`]: !prev[`${cat.category}_${item}`]
                        }))
                      }
                      style={{ marginRight: 12, accentColor: "#FFD700", width: 18, height: 18 }}
                    />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <div style={{
          marginTop: 16,
          color: percent === 100 ? "#27ef7d" : "#FFD700",
          fontWeight: 600
        }}>
          {percent === 100
            ? "Checklist Complete! Great work—ready for the next level."
            : "Keep progressing. Complete every skill for elite performance!"}
        </div>
      </motion.section>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
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
          Export Checklist (PDF)
        </button>
      </div>
    </div>
  );
};

export default EvaluationChecklist;
