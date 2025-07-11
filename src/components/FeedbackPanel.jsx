import React, { useState } from "react";
import { FaCommentDots, FaPlus, FaTimes, FaCheckCircle, FaFlag } from "react-icons/fa";

export default function FeedbackPanel({ section = "General", comments = [], onAdd, onRemove }) {
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
    <div>
      <button
        className="fixed top-1/2 left-0 z-50 bg-[#FFD700] text-black p-2 rounded-r-xl font-bold shadow-lg"
        style={{ transform: "translateY(-50%)" }}
        onClick={() => setOpen(v => !v)}
      >
        <FaCommentDots size={24} />
      </button>
      {open && (
        <div className="fixed top-0 left-0 h-full w-[340px] bg-[#23292fae] shadow-2xl z-50 p-5 flex flex-col border-r-4 border-[#FFD700]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-xl text-[#FFD700]">Feedback & Comments</span>
            <button onClick={() => setOpen(false)} className="text-[#FFD700] text-2xl"><FaTimes /></button>
          </div>
          <div className="mb-3 flex flex-col gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Leave feedback for: ${section}`}
              className="w-full p-2 rounded bg-[#181e23] text-white border border-[#FFD700] min-h-[64px]"
            />
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#FFD700]">Priority:</span>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-[#FFD700] text-[#222] rounded p-1 font-bold">
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
          <div className="flex-1 overflow-y-auto">
            {comments.length === 0 && <div className="text-[#FFD70099] italic">No comments yet.</div>}
            {comments.map((c, i) => (
              <div key={i} className="mb-3 bg-[#181e23dd] rounded-lg p-3 shadow">
                <div className="flex items-center gap-2 mb-1">
                  {c.priority === "flag" && <FaFlag color="#FFD700" />}
                  {c.priority === "critical" && <FaFlag color="#e24242" />}
                  {c.priority === "info" && <FaCheckCircle color="#1de682" />}
                  <span className="font-bold text-[#FFD700]">{c.by}</span>
                  <span className="ml-auto text-xs text-[#1de682]">{c.timestamp}</span>
                  <button onClick={() => onRemove(i)} className="ml-3 text-[#FFD700] hover:text-[#e24242] text-xl"><FaTimes /></button>
                </div>
                <div className="text-white">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
