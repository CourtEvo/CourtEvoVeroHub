import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { FaChild, FaUserGraduate, FaUserTie, FaChartLine, FaMedal, FaChalkboardTeacher, FaStar, FaCrown } from 'react-icons/fa';

// Pathway data for players
const PLAYER_STAGES = [
  {
    label: "U10 Foundation",
    icon: <FaChild color="#FFD700" />,
    color: "#FFD700",
    description: "Physical literacy, fun, basic skills. Focus: coordination, enjoyment, teamwork.",
    recommended: ["Basic dribbling", "Jump stops", "Fun competitions"]
  },
  {
    label: "U12 Fundamentals",
    icon: <FaStar color="#27ef7d" />,
    color: "#27ef7d",
    description: "Core skills development, basic offensive/defensive principles.",
    recommended: ["Layups both hands", "Basic passing", "Spacing concepts"]
  },
  {
    label: "U14 Learn to Train",
    icon: <FaChartLine color="#48b5ff" />,
    color: "#48b5ff",
    description: "Skill variety, intro to team tactics, agility.",
    recommended: ["Help defense", "Advanced footwork", "On-ball screens"]
  },
  {
    label: "U16 Train to Train",
    icon: <FaUserGraduate color="#e94057" />,
    color: "#e94057",
    description: "Intensified skill, mental development, position basics.",
    recommended: ["Read & react", "Intro to strength", "Competitive mindset"]
  },
  {
    label: "U18/Junior",
    icon: <FaMedal color="#a064fe" />,
    color: "#a064fe",
    description: "Performance focus, leadership, advanced team play.",
    recommended: ["Game film", "Role specialization", "Physical preparation"]
  },
  {
    label: "Senior/Pro",
    icon: <FaCrown color="#ffa500" />,
    color: "#ffa500",
    description: "Peak performance, tactical mastery, leadership, next-level prep.",
    recommended: ["Individual plans", "Leadership", "Transition planning"]
  }
];

// Pathway data for coaches
const COACH_STAGES = [
  {
    label: "Assistant (Youth)",
    icon: <FaChild color="#FFD700" />,
    color: "#FFD700",
    description: "Entry-level. Supporting head coach, learning basics, facilitating fun sessions.",
    recommended: ["Shadow head coach", "Run warmups", "Learn basic drills"]
  },
  {
    label: "Head Coach (Youth)",
    icon: <FaChalkboardTeacher color="#27ef7d" />,
    color: "#27ef7d",
    description: "Lead training, basic team management, introduce competition.",
    recommended: ["Design practice plans", "Communicate with parents", "Basic game coaching"]
  },
  {
    label: "Development Coach",
    icon: <FaChartLine color="#48b5ff" />,
    color: "#48b5ff",
    description: "Advanced drill design, develop individuals, manage games.",
    recommended: ["Individual skills programs", "Video review", "Lead games"]
  },
  {
    label: "Senior Coach",
    icon: <FaUserTie color="#e94057" />,
    color: "#e94057",
    description: "Lead top teams, advanced tactics, club mentorship.",
    recommended: ["System implementation", "Mentor juniors", "Advanced scouting"]
  },
  {
    label: "Director/Technical Lead",
    icon: <FaCrown color="#a064fe" />,
    color: "#a064fe",
    description: "Strategic vision, mentor all coaches, develop club curriculum.",
    recommended: ["Coach clinics", "Annual program review", "Innovate club pathway"]
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const PathwayBuilder = () => {
  const [mode, setMode] = useState('Player'); // or 'Coach'
  const [currentStage, setCurrentStage] = useState(0);
  const sectionRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `CourtEvoVero_Pathway_${mode}_${new Date().toISOString().slice(0,10)}`
  });

  const STAGES = mode === 'Player' ? PLAYER_STAGES : COACH_STAGES;

  return (
    <div style={{
      width: '100%',
      maxWidth: 1000,
      margin: '0 auto',
      padding: 0,
    }}>
      <motion.section
        ref={sectionRef}
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
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <button
            style={{
              background: mode === 'Player' ? "#FFD700" : "rgba(255,255,255,0.07)",
              color: mode === 'Player' ? "#222" : "#FFD700",
              marginRight: 8, borderRadius: 5, padding: "8px 18px", fontWeight: 700, border: 'none', cursor: 'pointer'
            }}
            onClick={() => { setMode('Player'); setCurrentStage(0); }}
          >Player Pathway</button>
          <button
            style={{
              background: mode === 'Coach' ? "#FFD700" : "rgba(255,255,255,0.07)",
              color: mode === 'Coach' ? "#222" : "#FFD700",
              borderRadius: 5, padding: "8px 18px", fontWeight: 700, border: 'none', cursor: 'pointer'
            }}
            onClick={() => { setMode('Coach'); setCurrentStage(0); }}
          >Coach Pathway</button>
        </div>
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
          Development Pathway Builder
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 22,
          flexWrap: 'wrap'
        }}>
          {STAGES.map((stage, idx) => (
            <button
              key={stage.label}
              onClick={() => setCurrentStage(idx)}
              style={{
                background: idx === currentStage ? stage.color : "rgba(255,255,255,0.07)",
                color: idx === currentStage ? "#222" : stage.color,
                border: 'none',
                borderRadius: 7,
                padding: '11px 20px',
                fontWeight: 700,
                fontSize: 17,
                marginRight: 2,
                boxShadow: idx === currentStage ? `0 2px 12px ${stage.color}66` : '',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.18s, color 0.18s'
              }}
            >
              {stage.icon}
              {stage.label}
            </button>
          ))}
        </div>
        <motion.div
          key={currentStage + mode}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: STAGES[currentStage].color + '33',
            borderRadius: 16,
            padding: "32px 36px",
            marginBottom: 14,
            boxShadow: `0 2px 8px ${STAGES[currentStage].color}55`
          }}
        >
          <div style={{ color: '#222', fontWeight: 800, fontSize: 24, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            {STAGES[currentStage].icon}
            {STAGES[currentStage].label}
          </div>
          <div style={{ color: '#222', fontSize: 17, marginBottom: 14 }}>
            {STAGES[currentStage].description}
          </div>
          <div>
            <b style={{ color: '#222' }}>Recommended Focus:</b>
            <ul style={{ color: '#283E51', fontWeight: 600, fontSize: 16 }}>
              {STAGES[currentStage].recommended.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 18 }}>
            <span style={{ color: STAGES[currentStage].color, fontWeight: 700, fontSize: 16 }}>
              {currentStage < STAGES.length - 1
                ? `Next Step: ${STAGES[currentStage + 1].label}`
                : 'This is the final stage—prepare for the next transition!'}
            </span>
          </div>
        </motion.div>
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
              marginBottom: 10
            }}>
            Export Pathway (PDF)
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, color: "#FFD700bb" }}>
          Select a stage to see focus and recommendations. Export to PDF for meetings or development reviews.
        </div>
      </motion.section>
    </div>
  );
};

export default PathwayBuilder;
