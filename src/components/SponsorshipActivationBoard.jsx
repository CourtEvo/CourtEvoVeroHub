import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaUserCircle, FaFileUpload, FaLink, FaComments, FaRobot, FaExclamationTriangle, FaTrophy, FaBullseye } from "react-icons/fa";
import "./SponsorshipActivationBoard.css";

// Example staff pool
const STAFF = [
  "Marko Proleta", "Ana Novak", "Jakov Jurić", "Ivan Petar", "Client (Club) Rep", "External Agency"
];

// AI suggestions and overlap warnings (demo logic)
const aiSuggestions = [
  {
    suggestion: "Consider bundling 'Social Media Takeover' with 'Game Day Sponsor Booth' for synergy.",
    icon: <FaRobot color="#FFD700" />,
  },
  {
    suggestion: "Risk: 'Community Clinic' and 'School Visit' overlap in audience. Avoid scheduling same week.",
    icon: <FaExclamationTriangle color="#e94057" />,
  },
  {
    suggestion: "Activation 'VIP Dinner' lacks photo evidence. Upload for full sponsor value.",
    icon: <FaFileUpload color="#27ef7d" />,
  },
];

// Custom value calculation (example formula)
function calculateValue(activation) {
  // Fake formula: (reach x engagement x asset factor) / 1000
  return (
    Math.round(
      (Number(activation.reach || 1) *
        Number(activation.engagement || 1) *
        (activation.assetValue ? Number(activation.assetValue) : 1)) / 1000
    ) || 0
  );
}

// Initial data
const initialData = {
  Pipeline: [
    {
      id: "1",
      title: "Halftime Contest",
      sponsor: "Nike",
      assetValue: 2500,
      reach: 3000,
      engagement: 1200,
      owners: ["Marko Proleta"],
      attachments: [],
      comments: [],
      status: "Pipeline",
      urgency: "medium",
    },
    {
      id: "2",
      title: "Community Clinic",
      sponsor: "Decathlon",
      assetValue: 1800,
      reach: 2000,
      engagement: 1500,
      owners: ["Ana Novak"],
      attachments: [],
      comments: [],
      status: "Pipeline",
      urgency: "high",
    },
    {
      id: "3",
      title: "School Visit",
      sponsor: "Hrvatski Telekom",
      assetValue: 1400,
      reach: 1800,
      engagement: 900,
      owners: ["Ivan Petar"],
      attachments: [],
      comments: [],
      status: "Pipeline",
      urgency: "medium",
    },
    {
      id: "4",
      title: "VIP Dinner",
      sponsor: "Miele",
      assetValue: 4000,
      reach: 1200,
      engagement: 700,
      owners: ["Jakov Jurić"],
      attachments: [],
      comments: [],
      status: "Pipeline",
      urgency: "low",
    },
  ],
  Activated: [
    {
      id: "5",
      title: "Game Day Sponsor Booth",
      sponsor: "Adidas",
      assetValue: 3500,
      reach: 3500,
      engagement: 1800,
      owners: ["Client (Club) Rep"],
      attachments: ["https://example.com/photo.jpg"],
      comments: ["Activation launched. Booth set up complete."],
      status: "Activated",
      urgency: "high",
    },
    {
      id: "6",
      title: "Social Media Takeover",
      sponsor: "Red Bull",
      assetValue: 1200,
      reach: 6000,
      engagement: 2200,
      owners: ["External Agency"],
      attachments: ["https://instagram.com/sponsor-activation"],
      comments: ["Sponsor approved creative. Launch scheduled for Friday."],
      status: "Activated",
      urgency: "medium",
    },
  ],
  Completed: [
    {
      id: "7",
      title: "Player Meet & Greet",
      sponsor: "Nike",
      assetValue: 1800,
      reach: 2200,
      engagement: 2100,
      owners: ["Marko Proleta"],
      attachments: ["https://example.com/event-photo.jpg"],
      comments: ["Completed. Excellent sponsor feedback."],
      status: "Completed",
      urgency: "low",
    },
    {
      id: "8",
      title: "Sponsor Video Integration",
      sponsor: "Coca-Cola",
      assetValue: 1000,
      reach: 9000,
      engagement: 900,
      owners: ["Ana Novak"],
      attachments: [],
      comments: ["Final edit sent to sponsor. Awaiting sign-off."],
      status: "Completed",
      urgency: "medium",
    },
  ],
};

const columns = ["Pipeline", "Activated", "Completed"];
const urgencyColor = { low: "#27ef7d", medium: "#FFD700", high: "#e94057" };

export default function SponsorshipActivationBoard() {
  const [data, setData] = useState(initialData);
  const [newActivation, setNewActivation] = useState({
    title: "",
    sponsor: "",
    assetValue: "",
    reach: "",
    engagement: "",
    owners: [],
    attachments: [],
    comments: [],
    status: "Pipeline",
    urgency: "medium",
  });
  const [activeTab, setActiveTab] = useState("Pipeline");
  const [commentText, setCommentText] = useState({});
  const [uploadFile, setUploadFile] = useState({});

  // Drag & drop logic
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceCol = [...data[source.droppableId]];
    const destCol = [...data[destination.droppableId]];
    const [removed] = sourceCol.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, removed);
      setData({ ...data, [source.droppableId]: sourceCol });
    } else {
      removed.status = destination.droppableId;
      destCol.splice(destination.index, 0, removed);
      setData({
        ...data,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      });
    }
  };

  // Add activation
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newActivation.title || !newActivation.sponsor) return;
    setData((prev) => ({
      ...prev,
      [newActivation.status]: [
        ...prev[newActivation.status],
        { ...newActivation, id: Date.now().toString() },
      ],
    }));
    setNewActivation({
      title: "",
      sponsor: "",
      assetValue: "",
      reach: "",
      engagement: "",
      owners: [],
      attachments: [],
      comments: [],
      status: "Pipeline",
      urgency: "medium",
    });
  };

  // Add comment
  const handleAddComment = (col, id) => {
    if (!commentText[id]) return;
    setData((prev) => ({
      ...prev,
      [col]: prev[col].map((a) =>
        a.id === id
          ? { ...a, comments: [...(a.comments || []), commentText[id]] }
          : a
      ),
    }));
    setCommentText((prev) => ({ ...prev, [id]: "" }));
  };

  // Handle file/link upload
  const handleAttach = (col, id, type, value) => {
    if (!value) return;
    setData((prev) => ({
      ...prev,
      [col]: prev[col].map((a) =>
        a.id === id
          ? { ...a, attachments: [...(a.attachments || []), value] }
          : a
      ),
    }));
    setUploadFile((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="activation-board" style={{ maxWidth: 1350, margin: "0 auto", padding: 0 }}>
      <h2 style={{
        color: "#FFD700", fontWeight: 900, fontSize: 32, margin: "18px 0 8px 0",
        textAlign: "left", letterSpacing: 1.1
      }}>
        Sponsorship & Partnership Activation Board
      </h2>
      {/* AI/Alerts/Next Best */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 19, alignItems: "center" }}>
        {aiSuggestions.map((s, i) => (
          <div key={i}
            style={{
              background: "#283E51",
              color: "#FFD700",
              padding: "11px 19px",
              borderRadius: 16,
              boxShadow: "0 2px 18px #FFD70033",
              fontWeight: 700,
              fontSize: 16,
              display: "flex", alignItems: "center", gap: 10
            }}>
            <span>{s.icon}</span> {s.suggestion}
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div style={{
        display: "flex", gap: 22, marginBottom: 10, borderBottom: "2px solid #FFD70077"
      }}>
        {columns.map((col) => (
          <button key={col}
            style={{
              background: activeTab === col ? "#FFD700" : "transparent",
              color: activeTab === col ? "#222" : "#FFD700",
              border: "none",
              borderRadius: "18px 18px 0 0",
              fontWeight: 900,
              fontSize: 18,
              padding: "9px 33px 8px 33px",
              boxShadow: activeTab === col ? "0 2px 14px #FFD70044" : "none",
              borderBottom: activeTab === col ? "4px solid #FFD700" : "4px solid transparent",
              cursor: "pointer"
            }}
            onClick={() => setActiveTab(col)}
          >{col}</button>
        ))}
      </div>
      {/* Add new activation */}
      <form onSubmit={handleAdd}
        style={{
          display: "flex", gap: 9, alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap"
        }}>
        <input
          placeholder="Activation Title"
          value={newActivation.title}
          onChange={e => setNewActivation(n => ({ ...n, title: e.target.value }))}
          required
          style={{ width: 170 }}
        />
        <input
          placeholder="Sponsor Name"
          value={newActivation.sponsor}
          onChange={e => setNewActivation(n => ({ ...n, sponsor: e.target.value }))}
          required
          style={{ width: 130 }}
        />
        <input
          type="number"
          placeholder="Asset Value (€)"
          value={newActivation.assetValue}
          onChange={e => setNewActivation(n => ({ ...n, assetValue: e.target.value }))}
          min={0}
          style={{ width: 120 }}
        />
        <input
          type="number"
          placeholder="Estimated Reach"
          value={newActivation.reach}
          onChange={e => setNewActivation(n => ({ ...n, reach: e.target.value }))}
          min={0}
          style={{ width: 120 }}
        />
        <input
          type="number"
          placeholder="Engagement"
          value={newActivation.engagement}
          onChange={e => setNewActivation(n => ({ ...n, engagement: e.target.value }))}
          min={0}
          style={{ width: 120 }}
        />
        <select
          multiple
          value={newActivation.owners}
          onChange={e =>
            setNewActivation(n => ({
              ...n,
              owners: Array.from(e.target.selectedOptions, o => o.value)
            }))
          }
          style={{ minWidth: 120, height: 38, padding: 4 }}
        >
          {STAFF.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={newActivation.urgency}
          onChange={e => setNewActivation(n => ({ ...n, urgency: e.target.value }))}
          style={{ width: 90 }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          style={{
            background: "#FFD700",
            color: "#222",
            fontWeight: 900,
            padding: "9px 19px",
            border: "none",
            borderRadius: 11,
            fontSize: 17,
            boxShadow: "0 2px 8px #FFD70033",
            cursor: "pointer"
          }}
        >+ Add Activation</button>
      </form>
      {/* Board - Drag and drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(330px, 1fr))",
          gap: 33,
          marginTop: 10
        }}>
          {columns.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: "#283E51",
                    borderRadius: 18,
                    minHeight: 520,
                    padding: "14px 11px 20px 11px",
                    boxShadow: "0 2px 19px #FFD70022"
                  }}
                >
                  <div style={{
                    fontWeight: 800,
                    color: "#FFD700",
                    fontSize: 21,
                    letterSpacing: 1.1,
                    marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    {col === "Pipeline" && <FaBullseye color="#FFD700" />}
                    {col === "Activated" && <FaTrophy color="#27ef7d" />}
                    {col === "Completed" && <FaTrophy color="#1de682" />}
                    {col}
                  </div>
                  {data[col].map((a, idx) => (
                    <Draggable key={a.id} draggableId={a.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: "#212e43",
                            borderLeft: `7px solid ${urgencyColor[a.urgency]}`,
                            borderRadius: 16,
                            padding: "15px 15px 7px 18px",
                            marginBottom: 18,
                            boxShadow: snapshot.isDragging ? "0 4px 22px #FFD70099" : "0 2px 12px #FFD70022",
                            transition: "box-shadow 0.18s"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 18, marginBottom: 2 }}>
                                {a.title} <span style={{ fontSize: 14, color: "#27ef7d" }}>({a.sponsor})</span>
                              </div>
                              <div style={{ fontSize: 15, color: "#27ef7d" }}>
                                Asset: €{a.assetValue} | Reach: {a.reach} | Engagement: {a.engagement}
                              </div>
                              <div style={{ fontSize: 15, marginTop: 2 }}>
                                <span style={{
                                  fontWeight: 800, color: urgencyColor[a.urgency]
                                }}>{a.urgency.toUpperCase()}</span>
                                <span style={{ marginLeft: 11, fontWeight: 700, color: "#FFD700" }}>
                                  Sponsor Value: <span style={{ color: "#27ef7d" }}>{calculateValue(a)}</span>
                                </span>
                              </div>
                              <div style={{ fontSize: 15, color: "#FFD700", marginTop: 4 }}>
                                Owners: {a.owners?.map(o =>
                                  <span key={o} style={{
                                    background: "#283E51", borderRadius: 7,
                                    padding: "2px 11px", marginRight: 6, color: "#27ef7d", fontWeight: 700
                                  }}><FaUserCircle style={{ marginRight: 5 }} />{o}</span>
                                )}
                              </div>
                            </div>
                            <div style={{ minWidth: 86, textAlign: "right" }}>
                              <div style={{ marginBottom: 4 }}>
                                {/* File/link upload */}
                                <input
                                  type="text"
                                  placeholder="Attach link"
                                  value={uploadFile[a.id] || ""}
                                  onChange={e => setUploadFile(f => ({ ...f, [a.id]: e.target.value }))}
                                  style={{
                                    width: 84, fontSize: 13, marginBottom: 2,
                                    border: "1px solid #27ef7d", borderRadius: 4, padding: "2px 4px"
                                  }}
                                />
                                <button
                                  onClick={() => handleAttach(col, a.id, "link", uploadFile[a.id])}
                                  style={{
                                    background: "#27ef7d", color: "#222", border: "none",
                                    borderRadius: 6, fontWeight: 700, padding: "3px 8px", marginLeft: 4,
                                    cursor: "pointer", fontSize: 14
                                  }}>
                                  <FaLink />
                                </button>
                              </div>
                              <div>
                                {a.attachments?.map((at, i) =>
                                  <a key={i} href={at} target="_blank" rel="noopener noreferrer" style={{
                                    display: "block", color: "#FFD700", fontSize: 13,
                                    textDecoration: "underline", marginBottom: 3, wordBreak: "break-all"
                                  }}>
                                    <FaFileUpload style={{ marginRight: 4 }} /> Evidence
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Comments */}
                          <div style={{
                            marginTop: 9,
                            background: "#283E51",
                            borderRadius: 9,
                            padding: "6px 9px"
                          }}>
                            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 14, marginBottom: 3 }}>
                              <FaComments style={{ marginRight: 7, marginBottom: -2 }} />Updates
                            </div>
                            <ul style={{ color: "#fff", fontSize: 14, marginBottom: 5 }}>
                              {a.comments?.map((c, ci) =>
                                <li key={ci}>{c}</li>
                              )}
                            </ul>
                            <form onSubmit={e => { e.preventDefault(); handleAddComment(col, a.id); }}>
                              <input
                                placeholder="Add comment/update"
                                value={commentText[a.id] || ""}
                                onChange={e => setCommentText(ct => ({ ...ct, [a.id]: e.target.value }))}
                                style={{
                                  width: "84%", marginRight: 6, border: "1px solid #FFD700", borderRadius: 4,
                                  fontSize: 14, padding: "2px 6px"
                                }}
                              />
                              <button
                                type="submit"
                                style={{
                                  background: "#FFD700", color: "#222", border: "none", borderRadius: 6,
                                  fontWeight: 800, padding: "2px 13px", fontSize: 13, cursor: "pointer"
                                }}
                              >+</button>
                            </form>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <div style={{
        color: "#FFD700bb", textAlign: "center", marginTop: 16, fontSize: 16, fontWeight: 600
      }}>
        Track, activate, and report every partner deliverable. Use as a boardroom war-room or demo for club sponsors.
      </div>
    </div>
  );
}
