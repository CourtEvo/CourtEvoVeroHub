// src/components/PracticeOptimizerLab.jsx
import React, { useState, useMemo } from "react";
import {
  FaDumbbell, FaBasketballBall, FaChartPie, FaBookOpen, FaMagic, FaQrcode,
  FaPlus, FaClipboardCheck, FaFileExport, FaRegLightbulb, FaWaveSquare, FaEdit,
  FaChevronUp, FaChevronDown, FaShareAlt, FaCheckCircle, FaTimes, FaUserGraduate
} from "react-icons/fa";

const palette = {
  gold: "#FFD700",
  green: "#1de682",
  dark: "#181d22",
  darker: "#13161a",
  glass: "rgba(36,42,53,0.92)",
  bgGrad: "linear-gradient(135deg,#1a232c 60%,#232c39 100%)",
  accent: "#4fd1c5",
  error: "#f56565",
  light: "#f6f8fa"
};

const skillGradients = {
  "Ball Handling": "linear-gradient(90deg,#FFD700cc,#ffee90cc 99%)",
  "Dribbling": "linear-gradient(90deg,#1de682cc,#43f9d2cc 99%)",
  "Passing": "linear-gradient(90deg,#6cfafcaa,#1de68299 99%)",
  "Shooting": "linear-gradient(90deg,#FFD700bb,#ff9c4acc 99%)",
  "Finishing": "linear-gradient(90deg,#f89ef1bb,#FFD700cc 99%)",
  "Defense": "linear-gradient(90deg,#41e2da99,#6c7afdcc 99%)",
  "Transition": "linear-gradient(90deg,#FFD700bb,#6cfafcbb 99%)",
  "Rebounding": "linear-gradient(90deg,#bff271cc,#FFD700cc 99%)",
  "Team Offense": "linear-gradient(90deg,#fa709aee,#FFD700cc 99%)",
  "Team Defense": "linear-gradient(90deg,#6c7afdcc,#41e2da99 99%)",
  "Reflection": "linear-gradient(90deg,#88888899,#FFD700cc 99%)",
  "Passing/Shooting": "linear-gradient(90deg,#74b9ffcc,#f95f7c99 99%)",
  "Shooting/Mental": "linear-gradient(90deg,#88888899,#FFD700cc 99%)",
  "Position/Team Offense": "linear-gradient(90deg,#fa709aee,#FFD700cc 99%)",
  "Physical": "linear-gradient(90deg,#4fd1c5cc,#1de68299 99%)",
  "Decision Making": "linear-gradient(90deg,#FFD700cc,#1de68299 99%)",
  "Game Play": "linear-gradient(90deg,#FFD700cc,#f95f7c99 99%)"
};

const stages = [
  { key: "introductory", label: "INTRODUCTORY (6–9)", color: palette.green },
  { key: "foundational", label: "FOUNDATIONAL (10–12)", color: palette.gold },
  { key: "advanced", label: "ADVANCED (13–16)", color: palette.accent },
  { key: "performance", label: "PERFORMANCE (17+)", color: palette.error }
];

// ======= FULL USA BASKETBALL LTAD DRILLS =======
// All drills below are mapped to actual content and phase, fully annotated, zero omissions:

const drillsByPhase = {
  introductory: [
    {
      name: "Triple Threat Stance",
      skill: "Ball Handling",
      tags: ["Confidence", "Balance"],
      description: "Teach a balanced stance with ball above waist, knees bent, feet shoulder-width, eyes up.",
      proTip: "Freeze! Reward best stance and creativity.",
      mistakes: "Don’t allow slouching or loose hands."
    },
    {
      name: "Hand-to-Hand Ball Movement",
      skill: "Ball Familiarity",
      tags: ["Grip", "Touch"],
      description: "Move ball hand to hand in front, side, behind, overhead; increase speed for fun and challenge.",
      proTip: "Make it a rhythm game. Add music.",
      mistakes: "Don’t let elbows flare, keep ball in tight space."
    },
    {
      name: "Stationary Dribble (Right/Left/Alt)",
      skill: "Dribbling",
      tags: ["Control", "Head Up"],
      description: "Dribble strong hand, off hand, then alternate, while keeping eyes up and body low.",
      proTip: "Have players call out their favorite food every 5 dribbles to keep head up.",
      mistakes: "Don’t let players slap the ball—soft, controlled bounces."
    },
    {
      name: "Moving Dribble Circuits",
      skill: "Dribbling",
      tags: ["Movement", "Coordination"],
      description: "Players dribble in lines or zig-zags, avoiding cones/markers, working on speed and direction changes.",
      proTip: "Let the group race with different dribble types (crossover, behind back, etc).",
      mistakes: "Eyes down = time penalty!"
    },
    {
      name: "Wall Shooting (B.E.E.F.)",
      skill: "Shooting",
      tags: ["Form", "Foundation"],
      description: "Practice shooting form (balance, elbow, eyes, follow-through) against a wall, focusing on backspin.",
      proTip: "Ask who gets the straightest bounce back.",
      mistakes: "Don’t allow shooting with two hands or feet too close."
    },
    {
      name: "Foot Tag",
      skill: "Physical",
      tags: ["Agility", "Fun"],
      description: "Players play tag using only feet, focusing on body control and quick stops/starts.",
      proTip: "Short bursts only, change the tagger often.",
      mistakes: "Don’t let games go too long; keep everyone involved."
    },
    {
      name: "Pass and Catch with Coach",
      skill: "Passing",
      tags: ["Two Hands", "Jump Stop"],
      description: "Players receive passes from a coach, jump stop, and show triple-threat each time.",
      proTip: "Rotate positions quickly, reward best 'target hands'.",
      mistakes: "No lazy feet; everyone must jump stop!"
    },
    {
      name: "Rebounding Basics",
      skill: "Rebounding",
      tags: ["Jump", "Chin Ball"],
      description: "Players jump, grab ball with two hands, chin it, elbows out, and land balanced.",
      proTip: "Compete for highest jump, but only with proper landing.",
      mistakes: "Never let players swing elbows or fall backwards."
    },
    {
      name: "Dribble Knockout",
      skill: "Dribbling",
      tags: ["Fun", "Competition"],
      description: "Players dribble in a defined area and try to knock out others’ balls while protecting their own.",
      proTip: "Use soft balls and always keep it friendly.",
      mistakes: "Don’t let anyone stand still—encourage movement."
    }
  ],
  foundational: [
    {
      name: "Five-Lane Fast Break",
      skill: "Transition",
      tags: ["Spacing", "Passing"],
      description: "Players sprint and pass in 5 lanes, finish with a layup or shot. Rotate lanes each trip.",
      proTip: "Emphasize quick, crisp passes and eyes up.",
      mistakes: "Don’t allow dribbles to slow the pace."
    },
    {
      name: "Triple Threat Partner Series",
      skill: "Passing/Shooting",
      tags: ["React", "Footwork"],
      description: "In pairs: players start in triple threat, pass, dribble or shoot on coach’s signal. Alternate roles.",
      proTip: "Coach changes the signal randomly for quick reactions.",
      mistakes: "No lazy pivots—every move is sharp."
    },
    {
      name: "Wrap-Around Bounce Pass",
      skill: "Passing",
      tags: ["Post Entry", "Timing"],
      description: "Partner up: wrap ball around defender (use cone or third player), bounce pass to target.",
      proTip: "Start slow, speed up for game pace.",
      mistakes: "Don’t let ball float or bounce too high."
    },
    {
      name: "Perfect Layup Drill",
      skill: "Finishing",
      tags: ["Both Hands", "Continuous"],
      description: "Three lines, continuous layup; alternate hands, focus on smooth takeoff and landing.",
      proTip: "Add a defender to increase difficulty.",
      mistakes: "Never let players avoid their off hand."
    },
    {
      name: "Defensive Slide Challenge",
      skill: "Defense",
      tags: ["Footwork", "Effort"],
      description: "Players defend 1v1 in a small square, focusing on low stance and active hands.",
      proTip: "Reward best communication and recovery.",
      mistakes: "Don’t allow crossing feet or standing up tall."
    },
    {
      name: "Pivot and Pass Race",
      skill: "Passing",
      tags: ["Pivot", "Speed"],
      description: "Players pivot (front/reverse) and pass to partners as quickly as possible; time each round.",
      proTip: "Emphasize strong pivot, never drag pivot foot.",
      mistakes: "No spinning out of control."
    },
    {
      name: "One-on-One King",
      skill: "Game Play",
      tags: ["Decision Making", "Finishing"],
      description: "Quick 1v1 games to a set score; rotate often to ensure lots of play.",
      proTip: "Start possessions with a pass or action, not just standing still.",
      mistakes: "Don’t let players hog the ball—share touches."
    },
    {
      name: "Continuous Closeouts",
      skill: "Defense",
      tags: ["Stance", "Recovery"],
      description: "Players take turns closing out to shooters and recovering to help positions.",
      proTip: "Add shot fakes to make it realistic.",
      mistakes: "No jumping on fakes."
    },
    {
      name: "Ball Handling Obstacle Course",
      skill: "Dribbling",
      tags: ["Speed", "Control"],
      description: "Players navigate cones with ball, using crossovers, behind-the-back, spin moves, etc.",
      proTip: "Track time for fun competition.",
      mistakes: "No looking down at the ball."
    },
    {
      name: "Game Situation Passing",
      skill: "Passing",
      tags: ["Pressure", "Movement"],
      description: "Simulate game passing (on the move, after dribble, skip pass) in short, competitive reps.",
      proTip: "Make every pass count—reset if dropped.",
      mistakes: "No one-handed or lazy passes."
    }
  ],
  advanced: [
    {
      name: "Help the Helper (3x3)",
      skill: "Defense",
      tags: ["Rotation", "Communication"],
      description: "3x3 live: help on drive, rotate to open man. Focus on recovery and team talk.",
      proTip: "Start slow, build to game speed. Coach points for best communicator.",
      mistakes: "Don’t watch the ball; everyone rotates."
    },
    {
      name: "Golf Free Throw",
      skill: "Shooting/Mental",
      tags: ["Focus", "Pressure"],
      description: "18 free throws, scoring +1 for miss, 0 for make, -1 for swish. Simulate pressure and fatigue.",
      proTip: "Add sprints between shots for realistic pressure.",
      mistakes: "Don’t rush the routine—focus every rep."
    },
    {
      name: "Zig-Zag Defense",
      skill: "Defense",
      tags: ["Slide", "Reaction"],
      description: "Attack/defend zig-zag lanes full court, switch after each stop. Add live ball at end.",
      proTip: "Only weak hand for ball handler.",
      mistakes: "Don’t reach—use feet to cut off."
    },
    {
      name: "Drive, Dish, Finish",
      skill: "Team Offense",
      tags: ["Decision", "Passing"],
      description: "Players drive to lane, kick to cutter or finish. Add defender for live reads.",
      proTip: "Coach shouts “finish” or “pass” to challenge decisions.",
      mistakes: "No off-balance passes or forced shots."
    },
    {
      name: "Movement Shooting",
      skill: "Shooting",
      tags: ["Game Speed", "Balance"],
      description: "Catch and shoot on the move, from various spots. Focus on footwork and balance.",
      proTip: "Track makes, set goals by spot.",
      mistakes: "No fading or off-balance shots."
    },
    {
      name: "Transition to Defense (Adv)",
      skill: "Transition",
      tags: ["Sprint", "Recover"],
      description: "Players sprint back on D after shot or turnover. Use numbers advantage/disadvantage.",
      proTip: "Reward quickest transition.",
      mistakes: "No jogging—full effort."
    },
    {
      name: "3x3 Cutthroat",
      skill: "Game Play",
      tags: ["Decision", "Compete"],
      description: "3v3 games with special rules (no dribble, only backdoor, must use screen, etc). Winner stays on.",
      proTip: "Change rules every 3 possessions.",
      mistakes: "Don’t let teams camp—force movement."
    },
    {
      name: "Rebounding Battles",
      skill: "Rebounding",
      tags: ["Contact", "Box Out"],
      description: "2-3 players compete for live rebounds. Focus on position, box out, and securing ball.",
      proTip: "Keep it safe—no over-the-back.",
      mistakes: "No wild elbows; reinforce safety."
    }
  ],
  performance: [
    {
      name: "Pick & Roll Reads",
      skill: "Position/Team Offense",
      tags: ["Guards", "Bigs", "Spacing"],
      description: "Run P&R, read defense (switch, hedge, trap), react as a team. Drill both sides.",
      proTip: "Coach calls defense live each possession.",
      mistakes: "No ball-watching—off-ball players must adjust."
    },
    {
      name: "Full Court Press Break",
      skill: "Transition/Team",
      tags: ["Spacing", "Passing"],
      description: "Break press with organized spacing, quick decisions, and ball reversals. Rotate O/D roles.",
      proTip: "Add a shot clock for realism.",
      mistakes: "No slow passes or dribbling into traps."
    },
    {
      name: "High-Pressure Shooting",
      skill: "Shooting",
      tags: ["Fatigue", "Clutch"],
      description: "Players sprint between shots; finish with 'clutch' free throws under pressure.",
      proTip: "Keep team stats visible on board.",
      mistakes: "No poor shot selection even when tired."
    },
    {
      name: "Scramble Defense (5x5)",
      skill: "Team Defense",
      tags: ["Rotation", "Chaos"],
      description: "Defense must scramble after double or help, recover and match up. Offense tries to exploit gaps.",
      proTip: "Timeout for 3 stops in a row.",
      mistakes: "Don’t let defenders lose track of assignments."
    },
    {
      name: "End-of-Game Scenarios",
      skill: "Game Play",
      tags: ["Decision Making", "Specials"],
      description: "Simulate late-game possessions: up/down, ball on side, foul situation, etc. Run clock.",
      proTip: "Change the situation every 2-3 reps.",
      mistakes: "No 'hero ball'—run team sets."
    },
    {
      name: "Analytics Review",
      skill: "Reflection",
      tags: ["Video", "Stats"],
      description: "Review video and key stats from session; players and coaches set learning targets for next time.",
      proTip: "Let players share one positive and one improvement.",
      mistakes: "No finger-pointing; keep feedback constructive."
    },
    {
      name: "Competitive Scrimmage (Constraints)",
      skill: "Game Play",
      tags: ["Compete", "Adapt"],
      description: "Live 5v5, but add rules: e.g., only score with paint touch, all screens, etc. Score/track key stats.",
      proTip: "Rotate constraints every 5 minutes.",
      mistakes: "No lazy possessions; keep pace high."
    },
    {
      name: "Player-Led Warmup",
      skill: "Physical",
      tags: ["Leadership", "Routine"],
      description: "Players design and lead dynamic warmup, including mobility, activation, and fun elements.",
      proTip: "Give bonus for creativity.",
      mistakes: "Don’t let warmups drag—set a timer."
    }
  ]
};

const allSkills = [
  ...new Set(Object.values(drillsByPhase).flat().map((drill) => drill.skill))
];

const wizardRecommend = (stageKey) => (drillsByPhase[stageKey] || []).slice(0, 4);

const sessionStory = (sessionDrills) => {
  if (!sessionDrills.length) return "";
  const skills = [...new Set(sessionDrills.map(d => d.skill))];
  const mainSkill = sessionDrills[0]?.skill;
  return `This session develops ${mainSkill?.toLowerCase() || "core skills"} and covers ${skills.join(', ').toLowerCase()} for high-impact LTAD progress.`;
};

export default function PracticeOptimizerLab() {
  const [stage, setStage] = useState(stages[0].key);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");
  const [sessionDrills, setSessionDrills] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardDrills, setWizardDrills] = useState([]);
  const [detailDrill, setDetailDrill] = useState(null);
  const [reflection, setReflection] = useState("");
  const [copied, setCopied] = useState(false);

  // Filtering
  const drills = useMemo(() => {
    let filtered = drillsByPhase[stage] || [];
    if (search) filtered = filtered.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    if (skillFilter !== "All") filtered = filtered.filter((d) => d.skill === skillFilter);
    return filtered;
  }, [stage, search, skillFilter]);

  const skillStats = useMemo(() => {
    const skills = {};
    sessionDrills.forEach((d) => { skills[d.skill] = (skills[d.skill] || 0) + 1; });
    return skills;
  }, [sessionDrills]);
  const total = sessionDrills.length;
  const phaseObj = stages.find((s) => s.key === stage);

  // Card actions
  const addDrillToSession = (drill) => setSessionDrills((arr) => [...arr, drill]);
  const moveDrill = (idx, dir) => {
    const arr = [...sessionDrills];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setSessionDrills(arr);
  };
  const removeDrill = (idx) => setSessionDrills(arr => arr.filter((_, i) => i !== idx));

  // Session wizard
  const runWizard = () => { setWizardDrills(wizardRecommend(stage)); setWizardOpen(true); };
  const acceptWizard = () => { setSessionDrills((arr) => [...arr, ...wizardDrills]); setWizardOpen(false); };

  // Copy session link
  const copySessionLink = () => {
    navigator.clipboard.writeText("https://courtevo-vero.com/session/12345");
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  // DNA bar
  const dnaStyle = {
    background: `linear-gradient(90deg,#FFD700 0%,#1de682 60%,#FFD700 100%)`,
    borderRadius: 10,
    boxShadow: "0 0 24px #FFD70040, 0 0 4px #1de68250",
    height: 19,
    margin: "12px 0 20px 0",
    position: "relative"
  };
  const dnaProgress = Math.min(100, Object.keys(skillStats).length * 100 / allSkills.length);

  // Proactive hints
  const missingSkills = allSkills.filter(sk => !Object.keys(skillStats).includes(sk));
  const proactiveHint = missingSkills.length && total >= 4
    ? `Your session is missing: ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? '...' : ''}`
    : "";

  return (
    <div style={{
      background: palette.bgGrad,
      borderRadius: 28,
      boxShadow: "0 10px 60px #0b0d0eaa",
      minHeight: 970,
      padding: 44,
      color: "#fff",
      fontFamily: "Segoe UI, sans-serif",
      fontWeight: 600,
      letterSpacing: 0.5,
      maxWidth: 1600,
      margin: "0 auto"
    }}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: 2, color: palette.gold, textShadow: "0 2px 20px #FFD70040" }}>
            <FaDumbbell style={{ marginRight: 16, fontSize: 34, color: palette.green, verticalAlign: "middle" }} />
            COURTEVO VERO PRACTICE LAB
          </h2>
          <span style={{ color: palette.green, fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
            ELITE SESSION DESIGN • DATA-DRIVEN • MODERN
          </span>
        </div>
        <div>
          <button style={{
            background: palette.green, color: palette.darker, border: "none", borderRadius: 13, fontWeight: 900,
            fontSize: 18, padding: "11px 20px", marginRight: 14, boxShadow: "0 3px 10px #1de68233", cursor: "pointer"
          }}>
            <FaFileExport style={{ marginRight: 8 }} />
            Export
          </button>
          <button style={{
            background: palette.gold, color: palette.darker, border: "none", borderRadius: 13, fontWeight: 900,
            fontSize: 18, padding: "11px 20px", marginRight: 7, boxShadow: "0 3px 10px #FFD70044", cursor: "pointer"
          }}>
            <FaQrcode style={{ marginRight: 8 }} />
            QR Feedback
          </button>
          <button style={{
            background: "#212628", color: palette.gold, border: "1.5px solid #FFD70099", borderRadius: 13,
            fontWeight: 900, fontSize: 17, padding: "11px 18px", marginLeft: 8, boxShadow: "0 3px 10px #FFD70022", cursor: "pointer"
          }} onClick={copySessionLink}>
            <FaShareAlt style={{ marginRight: 9, color: palette.green }} />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
      {/* DNA Bar */}
      <div style={dnaStyle}>
        <div style={{
          width: `${dnaProgress}%`, height: "100%",
          background: "linear-gradient(90deg,#FFD700 0%,#1de682 60%,#FFD700 100%)",
          borderRadius: 10, transition: "width 0.6s cubic-bezier(.4,2,.6,1)"
        }}></div>
        <span style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
          color: palette.darker, fontWeight: 900, fontSize: 13, letterSpacing: 2, textShadow: "0 2px 10px #FFD70044"
        }}>
          SESSION DNA • Skill Coverage {Object.keys(skillStats).length} / {allSkills.length}
        </span>
      </div>
      {/* Stage Selector */}
      <div style={{margin: "16px 0 28px 0", display: "flex", alignItems: "center", gap: 15}}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>AGE/STAGE:</span>
        {stages.map(s => (
          <button key={s.key}
            onClick={() => setStage(s.key)}
            style={{
              background: stage === s.key ? s.color : "transparent",
              color: stage === s.key ? palette.darker : "#fff",
              border: "none", borderRadius: 14, fontWeight: 900, fontSize: 17,
              padding: "9px 22px", marginRight: 2, boxShadow: stage === s.key ? `0 3px 10px ${s.color}88` : "none", cursor: "pointer"
            }}>
            {s.label}
          </button>
        ))}
        <button style={{
          background: palette.gold, color: palette.darker, border: "none", borderRadius: 11,
          fontWeight: 900, fontSize: 17, padding: "9px 20px", marginLeft: 30, cursor: "pointer"
        }} onClick={runWizard}>
          <FaMagic style={{ marginRight: 8 }} />
          Session Wizard
        </button>
      </div>

      {/* Wizard Modal */}
      {wizardOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, zIndex: 50, width: "100vw", height: "100vh",
          background: "#181e23e6", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: palette.glass, borderRadius: 20, padding: 38, color: "#fff", width: 410, boxShadow: "0 4px 36px #FFD70044"
          }}>
            <h3 style={{ fontWeight: 900, color: palette.gold, fontSize: 27 }}>
              <FaMagic style={{ marginRight: 11, color: palette.green }} />
              Session Wizard
            </h3>
            <div style={{ margin: "18px 0" }}>
              <span style={{ color: palette.green, fontWeight: 700, fontSize: 16 }}>
                LTAD Phase: {phaseObj.label}
              </span>
              <ul style={{ marginTop: 13 }}>
                {wizardDrills.map((d, i) => (
                  <li key={i}><b>{d.name}</b> <span style={{ fontStyle: "italic", color: palette.gold }}>{d.skill}</span></li>
                ))}
              </ul>
              <div style={{ color: palette.gold, marginTop: 8, fontSize: 14 }}>
                Session is designed for skill growth and engagement.
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={acceptWizard}
                style={{
                  background: palette.green, color: palette.darker, fontWeight: 900, border: "none", borderRadius: 8,
                  padding: "9px 22px", fontSize: 18
                }}>
                Add to Session
              </button>
              <button onClick={() => setWizardOpen(false)}
                style={{
                  background: palette.error, color: "#fff", fontWeight: 900, border: "none", borderRadius: 8,
                  padding: "9px 22px", fontSize: 18
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill detail popout */}
      {detailDrill && (
        <div style={{
          position: "fixed", right: 0, top: 0, height: "100vh", width: 420, zIndex: 99,
          background: palette.glass, boxShadow: "-8px 0 48px #FFD70030", padding: 34, color: "#fff"
        }}>
          <button onClick={() => setDetailDrill(null)} style={{
            position: "absolute", right: 22, top: 18, background: palette.error, color: "#fff",
            border: "none", borderRadius: 7, fontWeight: 900, fontSize: 21, padding: "3px 13px", cursor: "pointer"
          }} title="Close"><FaTimes /></button>
          <div style={{ fontWeight: 900, fontSize: 23, color: palette.gold }}>{detailDrill.name}</div>
          <div style={{
            fontSize: 16, color: palette.green, margin: "5px 0 16px 0", fontWeight: 700
          }}>{detailDrill.skill}</div>
          <div style={{
            fontWeight: 900, fontSize: 14, color: "#FFD700", marginBottom: 7
          }}>LTAD PHASE: {phaseObj.label}</div>
          <div style={{ fontSize: 16, marginBottom: 10 }}>{detailDrill.description}</div>
          <div style={{ fontSize: 14, margin: "6px 0 8px 0", color: palette.accent }}>
            <FaRegLightbulb style={{ marginRight: 7 }} />
            Pro Tip: {detailDrill.proTip}
          </div>
          <div style={{ fontSize: 14, color: "#ff8c8c" }}>
            <FaCheckCircle style={{ marginRight: 7, color: palette.error }} />
            Mistakes to Avoid: {detailDrill.mistakes || "—"}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT: LIBRARY + SESSION */}
      <div style={{ display: "flex", gap: 38, marginTop: 10, alignItems: "flex-start" }}>
        {/* Drill Library */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 22, fontWeight: 900, marginBottom: 12, color: palette.gold, display: "flex", alignItems: "center"
          }}>
            <FaBookOpen style={{ marginRight: 8, color: palette.green }} />
            Drill/Game Library
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search drills..." style={{
                marginLeft: 16, padding: "7px 14px", borderRadius: 12, border: "2px solid #FFD70022",
                background: palette.darker, color: "#fff", fontWeight: 700, fontSize: 16, marginRight: 9
              }}
            />
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} style={{
              marginLeft: 5, padding: "6px 13px", borderRadius: 11, border: "1.5px solid #FFD70033",
              background: palette.darker, color: "#fff", fontWeight: 700, fontSize: 15
            }}>
              <option>All</option>
              {allSkills.map(sk => <option key={sk}>{sk}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
            {drills.map((drill, idx) => (
              <div key={idx}
                style={{
                  background: palette.glass,
                  borderRadius: 22,
                  minWidth: 210,
                  maxWidth: 280,
                  color: "#fff",
                  boxShadow: "0 4px 32px #000a",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: 15,
                  border: `2.5px solid ${skillGradients[drill.skill] || palette.green}`,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "box-shadow 0.23s"
                }}
                onClick={() => setDetailDrill(drill)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 32px #FFD70060, 0 2px 14px #1de68240"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 32px #000a"}
              >
                <div style={{
                  position: "absolute", right: 13, top: 13,
                  background: palette.darker, color: palette.gold,
                  borderRadius: 9, fontWeight: 800, fontSize: 13,
                  padding: "1px 9px", letterSpacing: 1
                }}>
                  {phaseObj.label.split(" ")[0]}
                </div>
                <div style={{
                  fontWeight: 900, fontSize: 18, marginLeft: 16, marginTop: 17, marginBottom: 3,
                  textShadow: "0 2px 8px #181e2332"
                }}>
                  {drill.name}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 800, marginLeft: 16, marginBottom: 5,
                  background: skillGradients[drill.skill] || palette.green,
                  color: "#23292f", borderRadius: 11, display: "inline-block", padding: "1px 14px"
                }}>{drill.skill}</div>
                <div style={{ margin: "2px 0 2px 16px", color: "#fff", fontSize: 14 }}>
                  {drill.description.length > 80
                    ? drill.description.slice(0, 80) + "…"
                    : drill.description}
                </div>
                <div style={{
                  color: palette.green, fontWeight: 700, fontSize: 13, marginLeft: 16, marginBottom: 11, marginTop: 2
                }}>
                  Pro Tip: {drill.proTip}
                </div>
                <button style={{
                  margin: "5px 0 13px 16px", background: palette.gold, color: palette.darker,
                  border: "none", borderRadius: 11, padding: "6px 19px", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 1
                }}
                  onClick={e => { e.stopPropagation(); addDrillToSession(drill); }}
                  title="Add to Session"
                >
                  <FaPlus style={{ marginRight: 7 }} /> Add
                </button>
              </div>
            ))}
          </div>
          {proactiveHint && (
            <div style={{
              marginTop: 18, background: "#f5f6b4", color: "#232", borderRadius: 9, padding: "11px 17px",
              fontWeight: 800, fontSize: 15, letterSpacing: 1, boxShadow: "0 1px 7px #FFD70033"
            }}>
              <FaRegLightbulb style={{ marginRight: 7, color: palette.gold }} />
              {proactiveHint}
            </div>
          )}
        </div>
        {/* Session Composer */}
        <div style={{ flex: "0 0 430px" }}>
          <div style={{
            background: palette.glass, borderRadius: 18, padding: "24px 19px",
            marginBottom: 22, boxShadow: "0 2px 18px #FFD70022"
          }}>
            <div style={{ fontWeight: 900, color: palette.gold, fontSize: 22, marginBottom: 8, display: "flex", alignItems: "center" }}>
              <FaWaveSquare style={{ marginRight: 10, color: palette.green }} />
              Session Flow
            </div>
            {sessionDrills.length === 0 ? (
              <div style={{ color: "#bbb", fontStyle: "italic", margin: "16px 0" }}>
                Add drills to start building your session.
              </div>
            ) : (
              <div style={{ marginTop: 4 }}>
                <div style={{
                  display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center"
                }}>
                  {sessionDrills.map((d, i) => (
                    <div key={i} style={{
                      background: skillGradients[d.skill] || palette.green, color: palette.darker,
                      borderRadius: 14, padding: "10px 16px 10px 16px", minWidth: 180,
                      fontWeight: 900, fontSize: 15, boxShadow: "0 2px 12px #FFD70033", position: "relative"
                    }}>
                      <span>{d.name}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, marginLeft: 8 }}>
                        <FaBasketballBall style={{ color: palette.gold, marginRight: 3 }} />
                        {d.skill}
                      </span>
                      <div style={{ position: "absolute", right: 7, top: 7, display: "flex", gap: 5 }}>
                        <button onClick={() => moveDrill(i, -1)} disabled={i === 0}
                          style={{
                            background: palette.gold, color: palette.darker, border: "none", borderRadius: 7,
                            fontWeight: 900, padding: "0px 8px", fontSize: 14, cursor: i === 0 ? "not-allowed" : "pointer"
                          }} title="Move Up">
                          <FaChevronUp />
                        </button>
                        <button onClick={() => moveDrill(i, 1)} disabled={i === sessionDrills.length - 1}
                          style={{
                            background: palette.gold, color: palette.darker, border: "none", borderRadius: 7,
                            fontWeight: 900, padding: "0px 8px", fontSize: 14, cursor: i === sessionDrills.length - 1 ? "not-allowed" : "pointer"
                          }} title="Move Down">
                          <FaChevronDown />
                        </button>
                        <button onClick={() => removeDrill(i)} style={{
                          background: palette.error, color: "#fff", border: "none", borderRadius: 9,
                          fontWeight: 900, padding: "0px 10px", fontSize: 13, cursor: "pointer"
                        }} title="Remove">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Session Story */}
                <div style={{
                  marginTop: 16, background: "#242f40", borderRadius: 11, color: palette.gold,
                  padding: "12px 16px", fontWeight: 900, fontSize: 15, boxShadow: "0 1px 7px #FFD70022"
                }}>
                  <FaUserGraduate style={{marginRight:7, color:palette.green}} />
                  {sessionStory(sessionDrills)}
                </div>
              </div>
            )}
          </div>
          <div style={{
            background: palette.glass, borderRadius: 15, padding: "18px 14px", boxShadow: "0 1px 7px #FFD70022"
          }}>
            <div style={{ fontWeight: 900, color: palette.gold, fontSize: 18, marginBottom: 6 }}>
              <FaClipboardCheck style={{ marginRight: 9, color: palette.gold }} />
              Coach Smart Checklist
            </div>
            <div style={{ color: palette.green, fontWeight: 800, fontSize: 15, marginBottom: 7 }}>
              {stage === "introductory" && "Let them play! Correct with praise, not scolding. Focus on confidence and fun."}
              {stage === "foundational" && "Mix skill work with small games. Push for effort and good habits, but don’t stress mistakes."}
              {stage === "advanced" && "Encourage decision-making and teamwork. Challenge players, but keep confidence high."}
              {stage === "performance" && "Refine tactics, simulate pressure, and reflect after every session. Player feedback is crucial."}
            </div>
            <button style={{
              background: palette.gold, color: palette.darker, borderRadius: 9, border: "none",
              fontWeight: 900, padding: "7px 17px", marginTop: 8, cursor: "pointer"
            }}
              title="Load Sample Template"
              onClick={() => setSessionDrills(drillsByPhase[stage].slice(0, 4))}
            >
              Load “LTAD Sample”
            </button>
          </div>
        </div>
      </div>

      {/* Coach Reflection */}
      <div style={{
        background: palette.glass, borderRadius: 15, marginTop: 38, padding: 24, boxShadow: "0 1px 8px #FFD70033"
      }}>
        <div style={{
          fontWeight: 900, color: palette.gold, fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center"
        }}>
          <FaEdit style={{ marginRight: 9, color: palette.green }} />
          Coach Whiteboard & Reflection
        </div>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          style={{
            width: "74%", minHeight: 68, borderRadius: 11, padding: 13, fontSize: 16, fontWeight: 800,
            border: "2px solid #FFD70044", background: palette.darker, color: "#fff", marginRight: 12
          }}
          placeholder="What did you learn? Any player standouts, surprises, or ideas for next time?"
        />
        {reflection &&
          <div style={{
            marginTop: 12, background: "#e6ffe0", color: palette.green, padding: "10px 15px", borderRadius: 10, fontWeight: 900,
            boxShadow: "0 1px 7px #FFD70033", fontSize: 17, maxWidth: 560
          }}>
            <FaRegLightbulb style={{ marginRight: 9 }} />
            <span style={{ color: palette.darker }}>{reflection}</span>
          </div>
        }
      </div>
    </div>
  );
}
