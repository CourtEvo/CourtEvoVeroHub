import React, { useState, useRef } from "react";
import { FaCommentDots, FaFlag, FaCheckCircle, FaExclamationTriangle, FaPlus, FaTimes, FaCamera, FaChevronDown, 
         FaChevronUp, FaClock, FaUndo, FaBell } from "react-icons/fa";

// --- AlertsBanner (rich, color-coded) ---
function AlertsBanner({ alerts }) {
  if (!alerts.length) return null;
  return (
    <div className="mb-4">
      <div className="font-bold text-[#FFD700] text-base mb-2 flex items-center gap-2"><FaBell />Alerts</div>
      {alerts.map((a, i) => (
        <div key={i}
          className="flex items-center gap-2 px-3 py-2 rounded-lg shadow font-bold mb-2"
          style={{
            background: a.type === "critical"
              ? "linear-gradient(90deg,#e24242 85%,#FFD700 100%)"
              : a.type === "warning"
                ? "linear-gradient(90deg,#FFD700 80%,#1de682 100%)"
                : "linear-gradient(90deg,#1de682 80%,#FFD700 100%)",
            color: a.type === "critical" ? "#fff" : "#23292f"
          }}
        >
          {a.type === "critical" && <FaExclamationTriangle size={17} />}
          {a.type === "warning" && <FaFlag size={17} />}
          {a.type === "info" && <FaCheckCircle size={17} />}
          <span>{a.text}</span>
        </div>
      ))}
    </div>
  );
}

// --- FeedbackPanel (modern, minimal) ---
function FeedbackPanel({ section, comments, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("none");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd({
      section,
      text,
      priority,
      timestamp: new Date().toLocaleString(),
      by: "Stakeholder"
    });
    setText("");
    setPriority("none");
  };

  return (
    <div className="mb-6">
      <button
        className="bg-[#FFD700] text-black px-4 py-1 rounded-lg font-bold shadow-lg flex items-center gap-2 mb-2"
        onClick={() => setOpen(v => !v)}
      >
        <FaCommentDots />Feedback
      </button>
      {open && (
        <div className="bg-[#181e23] rounded-2xl shadow p-3 mb-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Leave feedback for: ${section}`}
            className="w-full p-2 rounded bg-[#23292f] text-white border border-[#FFD700] min-h-[56px]"
          />
          <div className="flex items-center gap-2 mt-2">
            <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-[#FFD700] text-[#23292f] rounded p-1 font-bold">
              <option value="none">None</option>
              <option value="info">Info</option>
              <option value="flag">Flag</option>
              <option value="critical">Critical</option>
            </select>
            <button
              className="ml-auto bg-[#FFD700] text-[#23292f] px-3 py-1 rounded-lg font-bold hover:scale-105"
              onClick={handleAdd}
            >
              <FaPlus /> Add
            </button>
          </div>
        </div>
      )}
      <div className="overflow-y-auto max-h-[170px] pr-2">
        {comments.length === 0 && <div className="text-[#FFD70099] italic">No comments yet.</div>}
        {comments.map((c, i) => (
          <div key={i} className="mb-3 bg-[#23292faa] rounded-lg p-2 shadow flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              {c.priority === "flag" && <FaFlag color="#FFD700" />}
              {c.priority === "critical" && <FaFlag color="#e24242" />}
              {c.priority === "info" && <FaCheckCircle color="#1de682" />}
              <span className="font-bold text-[#FFD700]">{c.by}</span>
              <span className="ml-auto text-xs text-[#1de682]">{c.timestamp}</span>
              <button onClick={() => onRemove(i)} className="ml-2 text-[#FFD700] hover:text-[#e24242] text-xl"><FaTimes /></button>
            </div>
            <div className="text-white">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ScenarioSnapshots (timeline/history, minimal for sidebar) ---
function ScenarioSnapshots({ state, onRestore }) {
  const [snapshots, setSnapshots] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    setSnapshots([
      ...snapshots,
      {
        timestamp: new Date().toLocaleString(),
        state: JSON.parse(JSON.stringify(state))
      }
    ]);
  };

  return (
    <div className="mb-8">
      <button
        className="bg-[#1de682] text-black px-4 py-1 rounded-lg font-bold shadow flex items-center gap-2 mb-2"
        onClick={() => setOpen(v => !v)}
      >
        <FaCamera /> Snapshots {open ? <FaChevronDown /> : <FaChevronUp />}
      </button>
      {open && (
        <div className="bg-[#181e23] rounded-2xl shadow-xl p-3 mb-2">
          <button
            className="mb-2 bg-[#FFD700] text-black px-3 py-1 rounded-xl font-bold flex items-center gap-2 w-full"
            onClick={handleSave}
          >
            <FaCamera /> Save Current Snapshot
          </button>
          {snapshots.length === 0 && (
            <div className="text-[#FFD700] italic">No snapshots yet.</div>
          )}
          {snapshots.slice().reverse().map((snap, i) => (
            <div key={i} className="mb-2 bg-[#23292faa] rounded-lg p-2 shadow">
              <div className="flex items-center gap-2 mb-1 text-[#FFD700]">
                <FaClock /> {snap.timestamp}
                <button className="ml-auto text-[#1de682] hover:text-[#FFD700]" onClick={() => onRestore(snap.state)}>
                  <FaUndo /> Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Main OrgSidebarChatRoom (now “Boardroom Tools”) =====
export default function OrgSidebarChatRoom({
  alerts = [],
  scenarioState = {},
  onRestoreSnapshot = () => {},
  comments = [],
  onAddComment = () => {},
  onRemoveComment = () => {},
}) {
  return (
    <div style={{
      width: "100%",
      minWidth: 320,
      background: "#23292f",
      borderLeft: "4px solid #FFD700",
      boxShadow: "0 0 32px #181e2350",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      zIndex: 20,
      padding: "22px 16px 10px 16px"
    }}>
      <div className="mb-5">
        <span className="font-extrabold text-2xl text-[#FFD700]">Boardroom Tools</span>
      </div>
      <AlertsBanner alerts={alerts} />
      <ScenarioSnapshots state={scenarioState} onRestore={onRestoreSnapshot} />
      <FeedbackPanel
        section="Boardroom"
        comments={comments}
        onAdd={onAddComment}
        onRemove={onRemoveComment}
      />
      {/* Add more widgets/controls here as needed */}
      <div className="flex-1"></div>
      <div className="mt-auto text-xs text-[#1de682] italic text-center">© {new Date().getFullYear()} CourtEvo Vero</div>
    </div>
  );
}
