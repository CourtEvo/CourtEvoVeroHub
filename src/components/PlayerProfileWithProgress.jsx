import React, { useState } from 'react';
import { FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Example user data (could be fetched from DB)
const users = [
  { id: 1, name: "Luka Peric", role: "Player", currentStage: 2 },
  { id: 2, name: "Ivan Novak", role: "Coach", currentStage: 1 },
];

// Pathway data (same as previous)
const PLAYER_STAGES = [
  { label: "U10 Foundation", icon: <FaUserCircle color="#FFD700" />, skills: ["Basic dribbling", "Jump stops", "Fun competitions"] },
  { label: "U12 Fundamentals", icon: <FaUserCircle color="#27ef7d" />, skills: ["Layups both hands", "Basic passing", "Spacing concepts"] },
  { label: "U14 Learn to Train", icon: <FaUserCircle color="#48b5ff" />, skills: ["Help defense", "Advanced footwork", "On-ball screens"] },
  { label: "U16 Train to Train", icon: <FaUserCircle color="#e94057" />, skills: ["Read & react", "Intro to strength", "Competitive mindset"] },
  { label: "U18/Junior", icon: <FaUserCircle color="#a064fe" />, skills: ["Game film", "Role specialization", "Physical preparation"] },
  { label: "Senior/Pro", icon: <FaUserCircle color="#ffa500" />, skills: ["Individual plans", "Leadership", "Transition planning"] }
];

const COACH_STAGES = [
  { label: "Assistant (Youth)", icon: <FaUserCircle color="#FFD700" />, skills: ["Shadow head coach", "Run warmups", "Learn basic drills"] },
  { label: "Head Coach (Youth)", icon: <FaUserCircle color="#27ef7d" />, skills: ["Design practice plans", "Communicate with parents", "Basic game coaching"] },
  { label: "Development Coach", icon: <FaUserCircle color="#48b5ff" />, skills: ["Individual skills programs", "Video review", "Lead games"] },
  { label: "Senior Coach", icon: <FaUserCircle color="#e94057" />, skills: ["System implementation", "Mentor juniors", "Advanced scouting"] },
  { label: "Director/Technical Lead", icon: <FaUserCircle color="#a064fe" />, skills: ["Coach clinics", "Annual program review", "Innovate club pathway"] }
];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const PlayerProfileWithProgress = () => {
  const [selected, setSelected] = useState(users[0]);
  const [progress, setProgress] = useState(() => {
    // Each user gets pathway length "completed stages" and skills (all unchecked)
    const data = {};
    users.forEach(u => {
      const stages = u.role === 'Player' ? PLAYER_STAGES : COACH_STAGES;
      data[u.id] = {
        completedStages: Array(stages.length).fill(false),
        skillChecks: stages.map(stage => stage.skills.map(() => false))
      };
    });
    // For demo: mark user's currentStage as completed
    users.forEach(u => {
      
      for (let i = 0; i <= u.currentStage; i++) {
        data[u.id].completedStages[i] = true;
        // Optionally: skills up to this stage as checked
        data[u.id].skillChecks[i] = data[u.id].skillChecks[i].map(() => true);
      }
    });
    return data;
  });

  const stages = selected.role === 'Player' ? PLAYER_STAGES : COACH_STAGES;

  // % complete
  const completed = progress[selected.id].completedStages.filter(Boolean).length;
  const percent = Math.round((completed / stages.length) * 100);

  // Handlers
  const toggleStage = idx => {
    setProgress(prev => ({
      ...prev,
      [selected.id]: {
        ...prev[selected.id],
        completedStages: prev[selected.id].completedStages.map((val, i) =>
          i === idx ? !val : val
        )
      }
    }));
  };

  const toggleSkill = (stageIdx, skillIdx) => {
    setProgress(prev => {
      const curr = prev[selected.id].skillChecks;
      const updated = curr.map((arr, i) =>
        i === stageIdx
          ? arr.map((val, j) => j === skillIdx ? !val : val)
          : arr
      );
      return {
        ...prev,
        [selected.id]: { ...prev[selected.id], skillChecks: updated }
      };
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: 820, margin: '0 auto', padding: 0 }}>
      <motion.section
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
        <div style={{ display: 'flex', gap: 26, alignItems: 'center', marginBottom: 18 }}>
          <FaUserCircle size={55} color="#FFD700" />
          <div>
            <b style={{ fontSize: 22, color: '#FFD700' }}>{selected.name}</b>
            <div style={{ color: "#fff", fontSize: 16 }}>{selected.role}</div>
            <div style={{
              marginTop: 8,
              color: percent === 100 ? "#27ef7d" : "#FFD700",
              fontWeight: 600,
              fontSize: 17
            }}>
              Pathway Progress: {completed} / {stages.length} ({percent}%)
              <div style={{
                background: "#FFD70022",
                borderRadius: 8,
                height: 12,
                marginTop: 5,
                width: 190,
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
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <label style={{ color: '#FFD700', fontWeight: 700 }}>
              Profile:&nbsp;
              <select
                value={selected.id}
                onChange={e => setSelected(users.find(u => u.id === Number(e.target.value)))}
                style={{ padding: 7, borderRadius: 5, fontWeight: 600, fontSize: 16, border: 'none' }}
              >
                {users.map(u => (
                  <option value={u.id} key={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {/* Pathway Progress */}
        <div>
          {stages.map((stage, idx) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + idx * 0.07, duration: 0.45 }}
              style={{
                marginBottom: 18,
                padding: "18px 18px 10px 18px",
                borderRadius: 13,
                background: progress[selected.id].completedStages[idx] ? "#27ef7d22" : "rgba(255,255,255,0.07)",
                borderLeft: `7px solid ${progress[selected.id].completedStages[idx] ? "#27ef7d" : "#FFD700"}`,
                boxShadow: "0 2px 6px #FFD70011"
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                <span style={{ fontSize: 21 }}>{stage.icon}</span>
                <span style={{
                  fontWeight: 700,
                  color: progress[selected.id].completedStages[idx] ? "#27ef7d" : "#FFD700",
                  fontSize: 18
                }}>
                  {stage.label}
                </span>
                <input
                  type="checkbox"
                  checked={progress[selected.id].completedStages[idx]}
                  onChange={() => toggleStage(idx)}
                  style={{
                    marginLeft: 14,
                    width: 22,
                    height: 22,
                    accentColor: progress[selected.id].completedStages[idx] ? "#27ef7d" : "#FFD700"
                  }}
                  title="Stage completed"
                />
                {progress[selected.id].completedStages[idx] && (
                  <FaCheckCircle color="#27ef7d" style={{ marginLeft: 4, fontSize: 19 }} />
                )}
              </div>
              <div style={{ color: '#fff', fontSize: 15, marginBottom: 5 }}>
                {stage.skills && stage.skills.length
                  ? "Required/Recommended Skills:"
                  : ""}
              </div>
              {stage.skills && (
                <ul style={{ fontSize: 15, color: "#FFD700", marginLeft: 17 }}>
                  {stage.skills.map((sk, skidx) => (
                    <li key={skidx} style={{ marginBottom: 4 }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={progress[selected.id].skillChecks[idx][skidx]}
                          onChange={() => toggleSkill(idx, skidx)}
                          style={{ marginRight: 9, accentColor: progress[selected.id].skillChecks[idx][skidx] ? "#27ef7d" : "#FFD700", width: 17, height: 17 }}
                        />
                        {sk}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
        <div style={{
          marginTop: 16,
          color: percent === 100 ? "#27ef7d" : "#FFD700",
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {percent === 100
            ? "Pathway Complete! This profile is ready for elite progression."
            : "Track stage and skill completion for personalized development."}
        </div>
      </motion.section>
    </div>
  );
};

export default PlayerProfileWithProgress;
