import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FaUserTie, FaUser, FaStar, FaUserPlus, FaSitemap, FaPlus, FaTrash, FaEdit, FaEnvelope, FaPhone, FaHistory
} from 'react-icons/fa';

// Unique ID helper
const uuid = () => Math.random().toString(36).slice(2);

const starterOrg = [
  {
    id: uuid(),
    label: "Director of Basketball Ops",
    icon: "tie",
    color: "#253149",
    details: { name: "Ana Director", email: "ana@club.com", phone: "+385-555-001", profile: "" },
    children: [
      {
        id: uuid(),
        label: "Head Coach",
        icon: "star",
        color: "#145e13",
        details: { name: "Marko Head", email: "marko@club.com", phone: "+385-555-002", profile: "" },
        children: [
          {
            id: uuid(),
            label: "Assistant Coach 1",
            icon: "user",
            color: "#2377c4",
            details: { name: "Ivan Asst 1", email: "ivan@club.com", phone: "+385-555-003", profile: "" },
            children: []
          },
          {
            id: uuid(),
            label: "Assistant Coach 2",
            icon: "user",
            color: "#2377c4",
            details: { name: "Sara Asst 2", email: "sara@club.com", phone: "+385-555-004", profile: "" },
            children: []
          }
        ]
      },
      {
        id: uuid(),
        label: "Performance/Medical Lead",
        icon: "sitemap",
        color: "#ad1335",
        details: { name: "Luka Perf", email: "luka@club.com", phone: "+385-555-005", profile: "" },
        children: [
          {
            id: uuid(),
            label: "Strength Coach",
            icon: "userplus",
            color: "#f2a900",
            details: { name: "Mia Strength", email: "mia@club.com", phone: "+385-555-006", profile: "" },
            children: []
          },
          {
            id: uuid(),
            label: "Physio",
            icon: "userplus",
            color: "#9d3df2",
            details: { name: "Tomislav Physio", email: "tomislav@club.com", phone: "+385-555-007", profile: "" },
            children: []
          }
        ]
      }
    ]
  }
];

const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function getIcon(type, color) {
  switch (type) {
    case "tie": return <FaUserTie color={color} />;
    case "star": return <FaStar color={color} />;
    case "user": return <FaUser color={color} />;
    case "userplus": return <FaUserPlus color={color} />;
    case "sitemap": return <FaSitemap color={color} />;
    default: return <FaUser color={color} />;
  }
}

const contrastText = bg =>
  ["#253149", "#145e13", "#ad1335", "#2377c4"].includes(bg) ? "#fff" : "#222";

function updateNode(tree, id, cb) {
  return tree.map(node =>
    node.id === id
      ? cb(node)
      : node.children
        ? { ...node, children: updateNode(node.children, id, cb) }
        : node
  );
}
function removeNode(tree, id) {
  return tree.filter(node =>
    node.id !== id
  ).map(node => ({
    ...node,
    children: node.children ? removeNode(node.children, id) : []
  }));
}

const OrgChartVisualizer = () => {
  const [org, setOrg] = useState(starterOrg);
  const [editing, setEditing] = useState(null); // node id
  const [editDetails, setEditDetails] = useState({});
  const [showHistory, setShowHistory] = useState(null); // node id
  const [history, setHistory] = useState({});
  const chartRef = useRef();
  const now = () => new Date().toLocaleString();

  const handlePrint = useReactToPrint({
    content: () => chartRef.current,
    documentTitle: `CourtEvoVero_OrgChart_${new Date().toISOString().slice(0, 10)}`
  });

  // Add new role as child
  const handleAdd = parentId => {
    const newNode = {
      id: uuid(),
      label: "New Role",
      icon: "userplus",
      color: "#f2a900",
      details: { name: "", email: "", phone: "", profile: "" },
      children: []
    };
    setOrg(updateNode(org, parentId, node => ({
      ...node,
      children: [
        ...node.children,
        newNode
      ]
    })));
    setHistory(h => ({
      ...h,
      [newNode.id]: [
        { type: 'created', by: 'admin', at: now(), changes: { label: "New Role" } }
      ]
    }));
  };

  // Remove role
  const handleRemove = nodeId => {
    setOrg(removeNode(org, nodeId));
    setHistory(h => ({
      ...h,
      [nodeId]: [
        ...(h[nodeId] || []),
        { type: 'removed', by: 'admin', at: now(), changes: null }
      ]
    }));
  };

  // Edit details modal
  const handleEdit = node => {
    setEditing(node.id);
    setEditDetails({ ...node.details, label: node.label, icon: node.icon, color: node.color });
  };
  const handleSaveEdit = nodeId => {
    setOrg(updateNode(org, nodeId, node => ({
      ...node,
      label: editDetails.label,
      icon: editDetails.icon,
      color: editDetails.color,
      details: { ...editDetails }
    })));
    setHistory(h => ({
      ...h,
      [nodeId]: [
        ...(h[nodeId] || []),
        { type: 'edited', by: 'admin', at: now(), changes: { ...editDetails } }
      ]
    }));
    setEditing(null);
    setEditDetails({});
  };

  // Drag-and-drop (reparenting only, no reordering at same level for simplicity)
  const onDragEnd = result => {
    if (!result.destination) return;
    const sourceId = result.draggableId;
    const destId = result.destination.droppableId;
    if (sourceId === destId) return;
    let dragged;
    function recursiveRemove(tree) {
      return tree.reduce((acc, node) => {
        if (node.id === sourceId) {
          dragged = node;
          return acc;
        }
        const children = node.children ? recursiveRemove(node.children) : [];
        return [...acc, { ...node, children }];
      }, []);
    }
    let tempOrg = recursiveRemove(org);
    setOrg(updateNode(tempOrg, destId, node => ({
      ...node,
      children: [...node.children, { ...dragged }]
    })));
    setHistory(h => ({
      ...h,
      [sourceId]: [
        ...(h[sourceId] || []),
        { type: 'reparented', by: 'admin', at: now(), changes: { newParent: destId } }
      ]
    }));
  };

  // Render node + children
  function renderNode(node, level = 0) {
    return (
      <Droppable droppableId={node.id} key={node.id}>
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ minWidth: 180 }}>
            <Draggable draggableId={node.id} index={0} key={node.id}>
              {dragProvided => (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 + level * 0.09 }}
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  {...dragProvided.dragHandleProps}
                  style={{
                    ...dragProvided.draggableProps.style,
                    border: `4px solid ${node.color}`,
                    borderRadius: 15,
                    background: node.color,
                    color: contrastText(node.color),
                    padding: '18px 16px 13px 16px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 19,
                    margin: "0 auto 18px auto",
                    boxShadow: `0 3px 12px #2226`,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{getIcon(node.icon, contrastText(node.color))}</span>
                    {editing === node.id ? (
                      <input
                        value={editDetails.label}
                        onChange={e => setEditDetails(d => ({ ...d, label: e.target.value }))}
                        style={{
                          fontWeight: 800,
                          fontSize: 19,
                          border: 'none',
                          borderRadius: 5,
                          padding: '4px 10px',
                          background: '#fff',
                          color: '#222'
                        }}
                      />
                    ) : (
                      <span>{node.label}</span>
                    )}
                  </div>
                  {/* Custom details */}
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    <div>
                      {editing === node.id ? (
                        <>
                          <input
                            value={editDetails.name}
                            onChange={e => setEditDetails(d => ({ ...d, name: e.target.value }))}
                            placeholder="Name"
                            style={{ borderRadius: 4, border: 'none', padding: 3, marginBottom: 3 }}
                          />
                          <input
                            value={editDetails.email}
                            onChange={e => setEditDetails(d => ({ ...d, email: e.target.value }))}
                            placeholder="Email"
                            style={{ borderRadius: 4, border: 'none', padding: 3, marginBottom: 3, marginLeft: 6 }}
                          />
                          <input
                            value={editDetails.phone}
                            onChange={e => setEditDetails(d => ({ ...d, phone: e.target.value }))}
                            placeholder="Phone"
                            style={{ borderRadius: 4, border: 'none', padding: 3, marginBottom: 3, marginLeft: 6 }}
                          />
                        </>
                      ) : (
                        <>
                          <b>{node.details.name}</b>
                          <div style={{ fontSize: 12, marginTop: 2 }}>
                            <FaEnvelope style={{ fontSize: 11, marginRight: 3 }} />{node.details.email}
                          </div>
                          <div style={{ fontSize: 12 }}>
                            <FaPhone style={{ fontSize: 11, marginRight: 3 }} />{node.details.phone}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{
                    display: 'flex', gap: 9, marginTop: 7, justifyContent: 'center'
                  }}>
                    {editing === node.id ? (
                      <button
                        onClick={() => handleSaveEdit(node.id)}
                        style={{
                          background: "#27ef7d",
                          color: "#222",
                          border: "none",
                          borderRadius: 5,
                          fontWeight: 700,
                          padding: "3px 10px",
                          cursor: "pointer"
                        }}>Save</button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(node)}
                          style={{
                            background: "#FFD700",
                            color: "#222",
                            border: "none",
                            borderRadius: 5,
                            fontWeight: 700,
                            padding: "3px 10px",
                            cursor: "pointer"
                          }} title="Edit"
                        ><FaEdit /></button>
                        <button
                          onClick={() => handleAdd(node.id)}
                          style={{
                            background: "#27ef7d",
                            color: "#222",
                            border: "none",
                            borderRadius: 5,
                            fontWeight: 700,
                            padding: "3px 10px",
                            cursor: "pointer"
                          }} title="Add child"
                        ><FaPlus /></button>
                        <button
                          onClick={() => setShowHistory(node.id)}
                          style={{
                            background: "#48b5ff",
                            color: "#222",
                            border: "none",
                            borderRadius: 5,
                            fontWeight: 700,
                            padding: "3px 10px",
                            cursor: "pointer"
                          }}
                          title="View History"
                        ><FaHistory /></button>
                        {level !== 0 && (
                          <button
                            onClick={() => handleRemove(node.id)}
                            style={{
                              background: "#e94057",
                              color: "#fff",
                              border: "none",
                              borderRadius: 5,
                              fontWeight: 700,
                              padding: "3px 10px",
                              cursor: "pointer"
                            }} title="Remove"
                          ><FaTrash /></button>
                        )}
                      </>
                    )}
                  </div>
                  {provided.placeholder}
                  {/* Connectors */}
                  {node.children && node.children.length > 0 && (
                    <div style={{
                      width: "100%",
                      height: 18,
                      borderLeft: `3px solid ${node.color}`,
                      margin: "0 auto"
                    }} />
                  )}
                  {/* Children */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: 19,
                    marginTop: node.children && node.children.length > 0 ? 10 : 0,
                    flexWrap: 'wrap'
                  }}>
                    {node.children && node.children.map(child =>
                      renderNode(child, level + 1)
                    )}
                  </div>
                </motion.div>
              )}
            </Draggable>
          </div>
        )}
      </Droppable>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 1250, margin: '0 auto' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <motion.section
          ref={chartRef}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
          style={{
            background: "rgba(255,255,255,0.10)",
            borderRadius: 20,
            padding: 36,
            marginTop: 38,
            marginBottom: 36,
            boxShadow: "0 2px 16px #FFD70044"
          }}
        >
          <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 14, textAlign: 'center' }}>
            Club/Academy Org Chart Visualizer
          </h2>
          <div style={{
            overflowX: 'auto',
            paddingBottom: 22
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minWidth: 650,
              marginTop: 22
            }}>
              {org.map(node => renderNode(node))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
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
              Export Org Chart (PDF)
            </button>
          </div>
          <div style={{ color: "#FFD700cc", fontWeight: 500, textAlign: 'center', marginTop: 9 }}>
            Drag any node to reparent it. Edit, add or remove roles. View and audit all changes—real time.
          </div>
        </motion.section>
      </DragDropContext>

      {/* Role history modal */}
      {showHistory && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.87)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", color: "#222", padding: 30, borderRadius: 15, minWidth: 300, maxWidth: 460
          }}>
            <h3 style={{ color: "#FFD700", fontSize: 21 }}>Change Log for Role</h3>
            <ul style={{ fontSize: 15, marginBottom: 12, maxHeight: 280, overflowY: "auto" }}>
              {(history[showHistory] || []).map((h, i) => (
                <li key={i} style={{ marginBottom: 7 }}>
                  <b>{h.type.charAt(0).toUpperCase() + h.type.slice(1)}</b> by {h.by} at {h.at}
                  {h.changes && <div style={{ fontSize: 13, color: "#555" }}>
                    Changes: {Object.entries(h.changes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </div>}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowHistory(null)}
              style={{
                background: "#FFD700", color: "#222", border: "none", borderRadius: 6,
                padding: "5px 14px", fontWeight: 700, fontSize: 16, marginTop: 4
              }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChartVisualizer;
