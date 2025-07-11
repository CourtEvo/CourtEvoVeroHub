import React, { useState, useRef, useEffect } from "react";
import {
  FaPaperPlane, FaUserCircle, FaStar, FaFlag, FaPaperclip, FaFilePdf,
  FaImage, FaFileExcel, FaFileWord, FaPoll, FaChartBar, FaCheck, FaTimes, FaMagic
} from "react-icons/fa";

// Detects file type for icon
function getFileIcon(name = "") {
  if (name.endsWith(".pdf")) return <FaFilePdf color="#e24242" />;
  if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return <FaImage color="#1de682" />;
  if (name.match(/\.(xlsx|xls|csv)$/i)) return <FaFileExcel color="#217346" />;
  if (name.match(/\.(docx|doc)$/i)) return <FaFileWord color="#185abd" />;
  return <FaPaperclip />;
}

// Simple mock AI summary function
function summarize(messages) {
  let pinned = messages.filter(m => m.pinned);
  let actions = messages.filter(m => m.action);
  let polls = messages.filter(m => m.poll);
  return (
    `Summary: ${pinned.length ? "Key messages have been pinned. " : ""}
    ${actions.length ? actions.length + " action(s) flagged. " : ""}
    ${polls.length ? "There have been " + polls.length + " poll(s)." : ""}
    Total messages: ${messages.length}.`
  );
}

export default function BoardroomChatSidebar() {
  const [messages, setMessages] = useState([
    {
      by: "Admin",
      text: "Welcome to the Boardroom Chat! All stakeholders and staff are invited to comment live.",
      ts: new Date().toLocaleTimeString(),
      pinned: true,
      action: false,
      attachments: []
    }
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [aiSummary, setAiSummary] = useState(null);
  const chatEndRef = useRef();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiSummary]);

  // --- Message Actions ---
  const send = () => {
    if (!input.trim() && !file && !showPoll) return;
    let msg = {
      by: "You",
      text: input,
      ts: new Date().toLocaleTimeString(),
      pinned: false,
      action: false,
      attachments: [],
      poll: null
    };
    // Attach file if present
    if (file) {
      msg.attachments = [file];
      setFile(null);
    }
    // Poll
    if (showPoll) {
      msg.text = "[Poll]";
      msg.poll = pollOptions
        .filter(opt => opt.trim())
        .map(opt => ({ text: opt, votes: 0 }));
      setShowPoll(false);
      setPollOptions(["", ""]);
    }
    setMessages([...messages, msg]);
    setInput("");
  };

  const pinMessage = (i) => {
    setMessages(messages.map((m, idx) =>
      idx === i ? { ...m, pinned: !m.pinned } : m
    ));
  };

  const flagAction = (i) => {
    setMessages(messages.map((m, idx) =>
      idx === i ? { ...m, action: !m.action } : m
    ));
  };

  const votePoll = (msgIdx, optIdx) => {
    setMessages(messages.map((msg, i) => {
      if (i !== msgIdx || !msg.poll) return msg;
      return {
        ...msg,
        poll: msg.poll.map((opt, oi) =>
          oi === optIdx ? { ...opt, votes: opt.votes + 1 } : opt
        )
      };
    }));
  };

  // File upload handler
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFile({
      name: f.name,
      url,
      type: f.type,
      size: f.size
    });
  };

  // Poll logic
  const handlePollChange = (i, val) => {
    setPollOptions(pollOptions.map((opt, idx) => idx === i ? val : opt));
  };

  // AI Summary (simulated)
  const handleAiSummary = () => {
    setAiSummary(summarize(messages));
    setTimeout(() => setAiSummary(null), 9000);
  };

  // --- UI ---
  // Pinned at top, others below
  const pinned = messages.filter(m => m.pinned);
  const others = messages.filter(m => !m.pinned);

  return (
    <div style={{
      width: 370,
      minWidth: 370,
      height: '100vh',
      background: 'linear-gradient(135deg, #181e23 60%, #232a2e 100%)',
      borderLeft: '4px solid #FFD700',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 32px #181e2350',
      borderTopRightRadius: 28,
      borderBottomRightRadius: 28,
      zIndex: 100,
      position: 'sticky',
      top: 0
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 0 18px 0',
        borderBottom: '2px solid #FFD700',
        textAlign: 'center',
        background: 'rgba(24,36,51,0.97)',
        borderTopRightRadius: 28
      }}>
        <img src="/logo.png" alt="CourtEvo Vero" style={{
          width: 44, marginBottom: 10, borderRadius: 9, boxShadow: "0 1px 8px #FFD70077"
        }} />
        <div style={{ color: '#FFD700', fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>
          Boardroom Chat
        </div>
        <button
          onClick={handleAiSummary}
          title="AI Boardroom Summary"
          style={{
            marginTop: 11,
            background: "#FFD700",
            color: "#232a2e",
            fontWeight: 800,
            fontSize: 15,
            borderRadius: 11,
            border: "none",
            padding: "7px 22px",
            cursor: "pointer",
            boxShadow: "0 1px 7px #FFD70044"
          }}>
          <FaMagic style={{ marginRight: 8 }} />
          AI Summary
        </button>
        {aiSummary && (
          <div style={{
            background: "#23292f",
            color: "#FFD700",
            marginTop: 12,
            padding: "9px 15px",
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 15
          }}>
            {aiSummary}
          </div>
        )}
      </div>
      {/* Messages */}
      <div style={{ flex: 1, padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Pinned messages */}
        {pinned.length > 0 && <div style={{ marginBottom: 11 }}>
          <div style={{ fontWeight: 700, color: '#FFD700', marginBottom: 5, fontSize: 14, letterSpacing: 1 }}>Pinned</div>
          {pinned.map((msg, idx) => (
            <MessageBubble
              key={"pin-" + idx}
              msg={msg}
              idx={messages.indexOf(msg)}
              pinMessage={pinMessage}
              flagAction={flagAction}
              votePoll={votePoll}
            />
          ))}
        </div>}
        {/* Other messages */}
        {others.map((msg, idx) => (
          <MessageBubble
            key={"msg-" + idx}
            msg={msg}
            idx={messages.indexOf(msg)}
            pinMessage={pinMessage}
            flagAction={flagAction}
            votePoll={votePoll}
          />
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Input */}
      <div style={{
        padding: 18,
        borderTop: '2px solid #FFD700',
        background: '#23292f',
        borderBottomRightRadius: 28
      }}>
        {/* Poll creator */}
        {showPoll ? (
          <form style={{ display: "flex", flexDirection: "column", gap: 9 }}
            onSubmit={e => { e.preventDefault(); send(); }}>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}>Create Poll:</div>
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={e => handlePollChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                style={{
                  marginBottom: 3,
                  padding: '7px 11px',
                  borderRadius: 8,
                  border: '2px solid #FFD700',
                  fontSize: 14,
                  color: '#FFD700',
                  background: '#181e23',
                  fontWeight: 600
                }}
                required={i < 2}
              />
            ))}
            <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
              <button
                style={{
                  background: '#FFD700',
                  color: '#23292f',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
                type="submit"
              ><FaCheck /> Post Poll</button>
              <button
                style={{
                  background: '#e24242',
                  color: '#fff',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
                type="button"
                onClick={() => setShowPoll(false)}
              ><FaTimes /> Cancel</button>
            </div>
          </form>
        ) : (
          <form
            style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            onSubmit={e => { e.preventDefault(); send(); }}>
            {/* File upload */}
            <label title="Attach file" style={{
              background: file ? "#1de682" : "#FFD700",
              color: "#23292f",
              borderRadius: 9,
              fontWeight: 900,
              fontSize: 18,
              padding: '7px 10px',
              cursor: 'pointer',
              marginRight: 7
            }}>
              <FaPaperclip />
              <input type="file" style={{ display: "none" }} onChange={handleFile} />
            </label>
            {/* Poll */}
            <button
              type="button"
              onClick={() => setShowPoll(true)}
              title="Create poll"
              style={{
                background: "#FFD700",
                color: "#23292f",
                borderRadius: 9,
                fontWeight: 900,
                fontSize: 18,
                padding: '7px 10px',
                cursor: 'pointer',
                border: "none"
              }}>
              <FaPoll />
            </button>
            {/* Input */}
            <input
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 11,
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
            <button
              style={{
                background: '#FFD700',
                color: '#23292f',
                padding: '8px 17px',
                border: 'none',
                borderRadius: 11,
                fontWeight: 900,
                fontSize: 17,
                cursor: 'pointer',
                transition: '0.13s'
              }}
              type="submit"
              title="Send"
            >
              <FaPaperPlane />
            </button>
          </form>
        )}
        {/* Show attached file preview */}
        {file && (
          <div style={{
            background: "#23292f",
            border: "2px solid #1de682",
            borderRadius: 8,
            marginTop: 7,
            padding: "7px 11px",
            color: "#1de682",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 9
          }}>
            {getFileIcon(file.name)}
            <span>{file.name}</span>
            <button onClick={() => setFile(null)} style={{
              background: "#e24242",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "3px 8px",
              marginLeft: 7,
              cursor: "pointer"
            }}><FaTimes /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Message bubble as modular component ---
function MessageBubble({ msg, idx, pinMessage, flagAction, votePoll }) {
  return (
    <div
      style={{
        background: msg.pinned ? 'rgba(255,215,0,0.10)' : 'rgba(28,36,51,0.88)',
        borderRadius: 12,
        marginBottom: 13,
        boxShadow: msg.pinned ? '0 2px 10px #FFD70044' : undefined,
        padding: 12,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 13,
        borderLeft: msg.pinned ? '5px solid #FFD700' : msg.action ? '5px solid #e24242' : '5px solid transparent',
        position: "relative"
      }}
    >
      <FaUserCircle size={30} color={msg.by === "Admin" ? "#FFD700" : "#1de682"} style={{ marginTop: 1 }} />
      <div style={{ width: "100%" }}>
        <div style={{ fontWeight: 700, color: msg.by === "Admin" ? '#FFD700' : '#1de682', fontSize: 15 }}>
          {msg.by}
          <span style={{ marginLeft: 9, fontWeight: 500, fontSize: 12, color: '#FFD700bb' }}>{msg.ts}</span>
        </div>
        <div style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>{msg.text}</div>
        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div style={{ marginTop: 7, display: "flex", gap: 11, flexWrap: "wrap" }}>
            {msg.attachments.map((f, i) => (
              <a href={f.url} key={i} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, color: "#FFD700", fontWeight: 600, textDecoration: "underline" }}>
                {getFileIcon(f.name)} {f.name}
              </a>
            ))}
          </div>
        )}
        {/* Poll */}
        {msg.poll && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Poll:</div>
            {msg.poll.map((opt, optIdx) => (
              <button
                key={optIdx}
                onClick={() => votePoll(idx, optIdx)}
                style={{
                  background: "#FFD700",
                  color: "#23292f",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "6px 14px",
                  marginRight: 8,
                  cursor: "pointer",
                  marginBottom: 3,
                  boxShadow: "0 1px 3px #FFD70055"
                }}>
                {opt.text} ({opt.votes})
              </button>
            ))}
          </div>
        )}
        {/* Pin/flag controls */}
        <div style={{
          position: "absolute",
          right: 12,
          top: 9,
          display: "flex",
          gap: 5
        }}>
          <FaStar
            style={{
              color: msg.pinned ? "#FFD700" : "#888",
              cursor: "pointer",
              fontSize: 18
            }}
            title="Pin"
            onClick={() => pinMessage(idx)}
          />
          <FaFlag
            style={{
              color: msg.action ? "#e24242" : "#888",
              cursor: "pointer",
              fontSize: 18
            }}
            title="Flag as action"
            onClick={() => flagAction(idx)}
          />
        </div>
      </div>
    </div>
  );
}
