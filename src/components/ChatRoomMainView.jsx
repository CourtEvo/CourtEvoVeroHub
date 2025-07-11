import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaUserCircle, FaPaperclip, FaStar, FaPoll, FaSearch, FaFileUpload, FaThumbtack } from "react-icons/fa";

export default function ChatroomMainView() {
  const [messages, setMessages] = useState([
    { by: "Admin", text: "Welcome to the Boardroom Chat Main View!", ts: new Date().toLocaleTimeString(), pinned: true }
  ]);
  const [input, setInput] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [files, setFiles] = useState([]);
  const chatEndRef = useRef();

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { by: "User", text: input, ts: new Date().toLocaleTimeString(), pinned: false }
    ]);
    setInput("");
  };

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files || []);
    setFiles([...files, ...uploaded]);
    setMessages([
      ...messages,
      { by: "User", text: `[File Uploaded: ${uploaded.map(f => f.name).join(", ")}]`, ts: new Date().toLocaleTimeString(), pinned: false }
    ]);
  };

  const handlePollSend = () => {
    setMessages([
      ...messages,
      {
        by: "User", ts: new Date().toLocaleTimeString(), pinned: false,
        text: `📊 Poll: ${pollQuestion} | Options: ${pollOptions.filter(opt => opt).join(", ")}`
      }
    ]);
    setShowPoll(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  return (
    <div style={{
      padding: 38,
      minHeight: '90vh',
      background: "linear-gradient(125deg, #202830 80%, #232a2e 100%)",
      borderRadius: 36,
      marginTop: 28,
      marginBottom: 28,
      boxShadow: "0 6px 36px #181e2344"
    }}>
      {/* HEADER */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 22 }}>
        <img src="/logo.png" alt="CourtEvo Vero" style={{ width: 42, borderRadius: 12, boxShadow: "0 2px 10px #FFD70077" }} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 28, color: "#FFD700" }}>Boardroom Chat – Main Room</div>
          <div style={{ fontStyle: 'italic', color: '#1de682', fontWeight: 700, marginTop: 1 }}>All-stakeholder collaboration • AI summary enabled</div>
        </div>
      </div>

      {/* Pinned messages */}
      <div style={{ marginBottom: 12 }}>
        {messages.filter(msg => msg.pinned).map((msg, idx) => (
          <div key={idx} style={{
            background: "rgba(255,215,0,0.19)",
            borderLeft: "7px solid #FFD700",
            borderRadius: 13,
            padding: 12,
            marginBottom: 6,
            boxShadow: "0 1px 12px #FFD70022",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <FaThumbtack color="#FFD700" /> <span style={{ fontWeight: 700 }}>{msg.text}</span>
          </div>
        ))}
      </div>

      {/* File uploads */}
      {files.length > 0 && (
        <div style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {files.map((file, i) => (
            <span key={i} style={{ background: "#23292f", color: "#FFD700", borderRadius: 8, padding: "3px 11px", fontWeight: 700, fontSize: 13 }}>
              <FaFileUpload style={{ marginRight: 5 }} /> {file.name}
            </span>
          ))}
        </div>
      )}

      {/* Main Chat */}
      <div style={{ maxHeight: 460, overflowY: "auto", background: "#202830f7", borderRadius: 16, padding: 20, marginBottom: 18 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              background: msg.pinned ? 'rgba(255,215,0,0.09)' : 'rgba(28,36,51,0.90)',
              borderRadius: 10,
              marginBottom: 13,
              padding: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              borderLeft: msg.pinned ? '4px solid #FFD700' : '4px solid transparent'
            }}
          >
            <FaUserCircle size={25} color={msg.by === "Admin" ? "#FFD700" : "#1de682"} />
            <div>
              <div style={{ fontWeight: 700, color: msg.by === "Admin" ? '#FFD700' : '#1de682', fontSize: 15 }}>
                {msg.by}
                <span style={{ marginLeft: 9, fontWeight: 500, fontSize: 11, color: '#FFD700bb' }}>{msg.ts}</span>
                {msg.pinned && <FaStar style={{ marginLeft: 6, color: "#FFD700" }} />}
              </div>
              <div style={{ color: '#fff', fontSize: 15 }}>{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Poll Creator */}
      {showPoll && (
        <div style={{ background: "#23292f", padding: 18, borderRadius: 14, marginBottom: 16, border: "2px solid #FFD700" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 9 }}>Create Poll</div>
          <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll question…" style={{ width: "100%", padding: 7, borderRadius: 7, marginBottom: 7 }} />
          {pollOptions.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
              <input value={opt} onChange={e => setPollOptions(opts => opts.map((o, idx) => idx === i ? e.target.value : o))} placeholder={`Option ${i + 1}`} style={{ flex: 1, padding: 6, borderRadius: 7 }} />
              <button onClick={() => setPollOptions(opts => opts.length > 2 ? opts.filter((_, idx) => idx !== i) : opts)} style={{ color: "#e24242", background: "none", border: "none", fontWeight: 700 }}>✕</button>
            </div>
          ))}
          <button onClick={() => setPollOptions([...pollOptions, ""])} style={{ color: "#1de682", marginBottom: 8, background: "none", border: "none", fontWeight: 700 }}>+ Add Option</button>
          <button onClick={handlePollSend} style={{ background: "#FFD700", color: "#23292f", border: "none", borderRadius: 7, padding: "7px 20px", fontWeight: 800, fontSize: 16 }}>Send Poll</button>
          <button onClick={() => setShowPoll(false)} style={{ color: "#FFD700", background: "none", border: "none", fontWeight: 800, marginLeft: 12 }}>Cancel</button>
        </div>
      )}

      {/* Input Area */}
      <form style={{ display: 'flex', gap: 8, marginTop: 2 }} onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          style={{
            flex: 1,
            padding: '12px 15px',
            borderRadius: 10,
            border: '2px solid #FFD700',
            fontSize: 15,
            color: '#fff',
            background: '#181e23',
            fontWeight: 600
          }}
          placeholder="Type message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <label style={{ cursor: "pointer", color: "#FFD700", display: "flex", alignItems: "center" }}>
          <FaPaperclip size={21} />
          <input type="file" multiple style={{ display: "none" }} onChange={handleFileUpload} />
        </label>
        <button
          style={{
            background: '#FFD700',
            color: '#23292f',
            padding: '8px 17px',
            border: 'none',
            borderRadius: 10,
            fontWeight: 900,
            fontSize: 17,
            cursor: 'pointer',
            transition: '0.13s'
          }}
          type="submit"
        >
          <FaPaperPlane />
        </button>
        <button
          type="button"
          onClick={() => setShowPoll(!showPoll)}
          style={{ background: "none", border: "none", color: "#1de682", fontWeight: 900, fontSize: 18, marginLeft: 4 }}
          title="Create Poll"
        >
          <FaPoll />
        </button>
      </form>

      {/* AI summary */}
      <div style={{
        background: "#181e2377",
        borderRadius: 12,
        marginTop: 22,
        padding: 12,
        boxShadow: "0 1px 10px #1de68222"
      }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 4 }}>AI Chatroom Summary</div>
        <div style={{ color: "#1de682", fontWeight: 700, fontSize: 15 }}>
          {messages.length < 4 ? "Not enough messages for summary yet." : "Live: Key themes detected, sentiment is positive. Next: Stakeholder decision on budget."}
        </div>
      </div>
    </div>
  );
}
