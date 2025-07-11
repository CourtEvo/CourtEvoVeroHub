import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaFileExport, FaUser, FaLink, FaClipboardList, FaCheck, FaClone, FaSave, FaClock } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

const COACHES = [
  { id: "marko", name: "Coach Marko", team: "U12" },
  { id: "luka", name: "Coach Luka", team: "U14" }
];

const BLOCK_TYPES = [
  { key: "WarmUp", label: "Warm-up", color: "#27ef7d" },
  { key: "Main", label: "Main Activity", color: "#FFD700" },
  { key: "Skill", label: "Skill", color: "#48b5ff" },
  { key: "Game", label: "Game Play", color: "#a064fe" },
  { key: "Conditioning", label: "Conditioning", color: "#e94057" },
  { key: "Review", label: "Review", color: "#fff" },
  { key: "Custom", label: "Custom", color: "#bbb" }
];

const defaultBlocks = () => [
  { id: "b1", type: "WarmUp", minutes: 10, focus: "Movement prep", points: "Mobility, coordination", link: "" },
  { id: "b2", type: "Skill", minutes: 15, focus: "Ball handling", points: "Both hands, low stance", link: "" },
  { id: "b3", type: "Main", minutes: 25, focus: "1v1 and 2v2", points: "Space, timing, communication", link: "" },
  { id: "b4", type: "Game", minutes: 20, focus: "Scrimmage", points: "Apply skills under pressure", link: "" },
  { id: "b5", type: "Review", minutes: 5, focus: "Q&A, cool-down", points: "Check for understanding", link: "" }
];

const fadeIn = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const SessionPlanBuilder = () => {
  const [coachId, setCoachId] = useState(COACHES[0].id);

  // Multi-session: { [coachId]: [{id, name, blocks:[]}, ...] }
  const [allPlans, setAllPlans] = useState(
    Object.fromEntries(COACHES.map(c => [
      c.id,
      [{ id: "default", name: "Standard Plan", blocks: defaultBlocks() }]
    ]))
  );
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newBlock, setNewBlock] = useState({
    type: "Custom", minutes: 10, focus: "", points: "", link: ""
  });
  const [editIdx, setEditIdx] = useState(null);
  const [editBlock, setEditBlock] = useState({});
  const [renaming, setRenaming] = useState(null);
  const [planName, setPlanName] = useState("");
  const sectionRef = useRef();

  const coachPlans = allPlans[coachId];
  const session = coachPlans[activePlanIdx];
  const blocks = session.blocks;

  // Analytics
  const totalMinutes = blocks.reduce((sum, b) => sum + (Number(b.minutes) || 0), 0);
  const typeDist = blocks.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + (Number(b.minutes) || 0);
    return acc;
  }, {});
  const blockPresent = type => blocks.some(b => b.type === type);
  const overUnder = totalMinutes > 90 ? "Overplanned" : totalMinutes < 60 ? "Underplanned" : "Optimal";
  const essentialWarn = [
    !blockPresent("Game") && "No game block—add game-play for transfer!",
    !blockPresent("Skill") && "No skill block—fundamentals missing!"
  ].filter(Boolean);

  // Drag-drop
  function onDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(blocks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    updateBlocks(reordered);
  }
  function updateBlocks(newBlocks) {
    setAllPlans(ap => ({
      ...ap,
      [coachId]: ap[coachId].map((plan, i) =>
        i === activePlanIdx ? { ...plan, blocks: newBlocks } : plan
      )
    }));
  }

  // Add, delete, edit block
  function handleAddBlock() {
    updateBlocks([
      ...blocks,
      {
        ...newBlock,
        id: "b" + (Math.random() + "").slice(2, 8)
      }
    ]);
    setShowAdd(false);
    setNewBlock({ type: "Custom", minutes: 10, focus: "", points: "", link: "" });
  }
  function handleDelete(idx) {
    updateBlocks(blocks.filter((_, i) => i !== idx));
  }
  function handleEdit(idx) {
    setEditIdx(idx);
    setEditBlock({ ...blocks[idx] });
  }
  function handleEditSave(idx) {
    updateBlocks(blocks.map((b, i) => (i === idx ? editBlock : b)));
    setEditIdx(null);
    setEditBlock({});
  }

  // Multi-session
  function addSession() {
    setAllPlans(ap => ({
      ...ap,
      [coachId]: [
        ...ap[coachId],
        { id: "s" + Math.random().toString(36).slice(2, 7), name: "New Session", blocks: defaultBlocks() }
      ]
    }));
    setActivePlanIdx(coachPlans.length); // jump to new
  }
  function duplicateSession(idx) {
    const plan = coachPlans[idx];
    setAllPlans(ap => ({
      ...ap,
      [coachId]: [
        ...ap[coachId],
        {
          id: "s" + Math.random().toString(36).slice(2, 7),
          name: plan.name + " Copy",
          blocks: plan.blocks.map(b => ({ ...b, id: "b" + Math.random().toString(36).slice(2, 7) }))
        }
      ]
    }));
    setActivePlanIdx(coachPlans.length); // jump to new
  }
  function renameSession(idx) {
    setRenaming(idx);
    setPlanName(coachPlans[idx].name);
  }
  function saveRename(idx) {
    setAllPlans(ap => ({
      ...ap,
      [coachId]: ap[coachId].map((plan, i) =>
        i === idx ? { ...plan, name: planName } : plan
      )
    }));
    setRenaming(null);
  }
  function deleteSession(idx) {
    if (coachPlans.length === 1) return;
    setAllPlans(ap => ({
      ...ap,
      [coachId]: ap[coachId].filter((_, i) => i !== idx)
    }));
    setActivePlanIdx(idx > 0 ? idx - 1 : 0);
  }

  // PDF export
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `SessionPlan_${coachId}_${session.id}_${new Date().toISOString().slice(0, 10)}`
  });

  // Session-to-session comparison
  let prevBlocks = coachPlans[activePlanIdx - 1]?.blocks || null;
  let compStr = "";
  if (prevBlocks && prevBlocks.length) {
    const prevTotal = prevBlocks.reduce((s, b) => s + (Number(b.minutes) || 0), 0);
    compStr =
      totalMinutes > prevTotal
        ? `This session is ${totalMinutes - prevTotal} mins longer.`
        : totalMinutes < prevTotal
        ? `This session is ${prevTotal - totalMinutes} mins shorter.`
        : `Same total minutes as previous.`;
  }

  return (
    <div style={{ width: "100%", maxWidth: 940, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 27, color: "#FFD700", fontWeight: 700, marginBottom: 12 }}>
          Session Plan Builder
        </div>
        {/* Multi-session selector */}
        <div style={{ display: "flex", gap: 11, alignItems: "center", marginBottom: 17, flexWrap: "wrap" }}>
          <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>
            <FaUser style={{ marginBottom: -2, marginRight: 6 }} />
            For:
            <select
              value={coachId}
              onChange={e => { setCoachId(e.target.value); setActivePlanIdx(0); }}
              style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}>
              {COACHES.map(u => (
                <option value={u.id} key={u.id}>
                  {u.name} ({u.team})
                </option>
              ))}
            </select>
          </label>
          <FaClipboardList style={{ marginLeft: 12, marginRight: 7, color: "#FFD700" }} />
          <select
            value={activePlanIdx}
            onChange={e => setActivePlanIdx(Number(e.target.value))}
            style={{ fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "4px 10px" }}>
            {coachPlans.map((s, i) =>
              <option value={i} key={s.id}>{s.name}</option>
            )}
          </select>
          <button onClick={addSession} style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, padding: "4px 12px", fontWeight: 700, marginLeft: 4 }}><FaPlus /> New</button>
          <button onClick={() => duplicateSession(activePlanIdx)} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, padding: "4px 12px", fontWeight: 700, marginLeft: 4 }}><FaClone /> Copy</button>
          {coachPlans.length > 1 &&
            <button onClick={() => deleteSession(activePlanIdx)} style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 7, padding: "4px 12px", fontWeight: 700, marginLeft: 4 }}>Delete</button>
          }
          <button onClick={() => renameSession(activePlanIdx)} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, padding: "4px 12px", fontWeight: 700, marginLeft: 4 }}><FaSave /> Rename</button>
          <button onClick={handlePrint}
            style={{
              background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7,
              padding: "7px 18px", fontSize: 17, cursor: "pointer", marginLeft: 4
            }}
          >
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} />
            Export PDF
          </button>
        </div>
        {/* Rename modal */}
        {renaming !== null && (
          <div style={{ background: "#222d", padding: 12, borderRadius: 10, marginBottom: 17, width: "fit-content" }}>
            <form style={{ display: "inline" }} onSubmit={e => { e.preventDefault(); saveRename(renaming); }}>
              <input value={planName} onChange={e => setPlanName(e.target.value)} style={{ fontSize: 17, borderRadius: 5, marginRight: 7 }} />
              <button type="submit" style={{ background: "#27ef7d", border: "none", color: "#222", borderRadius: 5, fontWeight: 700, padding: "4px 9px" }}>Save</button>
              <button type="button" onClick={() => setRenaming(null)} style={{ background: "#e94057", border: "none", color: "#fff", borderRadius: 5, marginLeft: 3, fontWeight: 700, padding: "4px 9px" }}>Cancel</button>
            </form>
          </div>
        )}
        {/* Add Block Modal */}
        {showAdd && (
          <div style={{
            background: "#222d", padding: 12, borderRadius: 10, marginBottom: 19,
            display: "flex", alignItems: "center", gap: 13, width: "fit-content"
          }}>
            <select value={newBlock.type} onChange={e => setNewBlock(nb => ({ ...nb, type: e.target.value }))}
              style={{ fontSize: 15, borderRadius: 5 }}>
              {BLOCK_TYPES.map(b => <option value={b.key} key={b.key}>{b.label}</option>)}
            </select>
            <input
              type="number"
              value={newBlock.minutes}
              min={1}
              max={60}
              onChange={e => setNewBlock(nb => ({ ...nb, minutes: e.target.value }))}
              placeholder="Minutes"
              style={{ width: 65, fontSize: 15, borderRadius: 5 }}
            />
            <input
              type="text"
              placeholder="Focus"
              value={newBlock.focus}
              onChange={e => setNewBlock(nb => ({ ...nb, focus: e.target.value }))}
              style={{ width: 100, fontSize: 15, borderRadius: 5 }}
            />
            <input
              type="text"
              placeholder="Coaching Points"
              value={newBlock.points}
              onChange={e => setNewBlock(nb => ({ ...nb, points: e.target.value }))}
              style={{ width: 120, fontSize: 15, borderRadius: 5 }}
            />
            <input
              type="text"
              placeholder="Resource link"
              value={newBlock.link}
              onChange={e => setNewBlock(nb => ({ ...nb, link: e.target.value }))}
              style={{ width: 110, fontSize: 15, borderRadius: 5 }}
            />
            <button
              onClick={handleAddBlock}
              style={{ background: "#27ef7d", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 15, marginLeft: 7 }}>
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{ background: "#e94057", color: "#fff", fontWeight: 700, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 15, marginLeft: 7 }}>
              Cancel
            </button>
          </div>
        )}
        {/* DragDrop blocks */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="blocks" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ display: "flex", flexDirection: "column", gap: 11, minHeight: 190, marginBottom: 17 }}>
                {blocks.map((b, idx) => {
                  const blockType = BLOCK_TYPES.find(t => t.key === b.type) || BLOCK_TYPES[BLOCK_TYPES.length - 1];
                  return (
                    <Draggable draggableId={b.id} index={idx} key={b.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: blockType.color,
                            borderRadius: 12,
                            boxShadow: snapshot.isDragging ? "0 0 18px #FFD70055" : "0 2px 10px #0002",
                            opacity: snapshot.isDragging ? 0.89 : 1,
                            transition: "box-shadow 0.2s, opacity 0.2s",
                            padding: "13px 13px",
                            display: "flex",
                            alignItems: "center",
                            gap: 19,
                            ...provided.draggableProps.style
                          }}
                        >
                          <div style={{ width: 105, fontWeight: 700, fontSize: 18, color: "#222" }}>
                            {blockType.label}
                          </div>
                          {editIdx === idx ? (
                            <>
                              <input type="number" value={editBlock.minutes}
                                min={1} max={60}
                                onChange={e => setEditBlock(eb => ({ ...eb, minutes: e.target.value }))}
                                style={{ width: 55, borderRadius: 4, fontSize: 15 }} />
                              <input type="text" value={editBlock.focus}
                                onChange={e => setEditBlock(eb => ({ ...eb, focus: e.target.value }))}
                                placeholder="Focus"
                                style={{ width: 90, borderRadius: 4, fontSize: 15 }} />
                              <input type="text" value={editBlock.points}
                                onChange={e => setEditBlock(eb => ({ ...eb, points: e.target.value }))}
                                placeholder="Coaching Points"
                                style={{ width: 115, borderRadius: 4, fontSize: 15 }} />
                              <input type="text" value={editBlock.link}
                                onChange={e => setEditBlock(eb => ({ ...eb, link: e.target.value }))}
                                placeholder="Link"
                                style={{ width: 100, borderRadius: 4, fontSize: 15 }} />
                              <button onClick={() => handleEditSave(idx)}
                                style={{ background: "#27ef7d", border: "none", color: "#222", borderRadius: 5, fontWeight: 700, padding: "4px 9px" }}>
                                <FaCheck />
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ width: 50, color: "#222", fontWeight: 700, fontSize: 17 }}><FaClock /> {b.minutes}’</div>
                              <div style={{ width: 98, color: "#444", fontSize: 15 }}>{b.focus}</div>
                              <div style={{ width: 120, color: "#444", fontSize: 14 }}>{b.points}</div>
                              <div style={{ width: 80, color: "#444", fontSize: 14, wordBreak: "break-all" }}>
                                {b.link && <a href={b.link} target="_blank" rel="noreferrer"><FaLink style={{ color: "#FFD700" }} /></a>}
                              </div>
                              <button onClick={() => handleEdit(idx)}
                                style={{ background: "#FFD70033", color: "#222", border: "none", borderRadius: 5, fontWeight: 600, fontSize: 15, marginLeft: 3, cursor: "pointer" }}>Edit</button>
                            </>
                          )}
                          <button onClick={() => handleDelete(idx)}
                            style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "2px 8px", cursor: "pointer" }}>
                            <FaTrash style={{ marginBottom: -2, marginRight: 3 }} /> Delete
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {/* Analytics */}
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 10, marginTop: 15 }}>
          Session Analytics
        </div>
        <div style={{ color: "#27ef7d", fontSize: 15, marginBottom: 8 }}>
          Total minutes: <b>{totalMinutes}</b> | Plan status: <b>{overUnder}</b>
          {compStr && <> | <span style={{ color: "#FFD700" }}>{compStr}</span></>}
        </div>
        <div style={{ marginBottom: 7 }}>
          {BLOCK_TYPES.map(bt => {
            const minutes = typeDist[bt.key] || 0;
            const pct = totalMinutes ? Math.round(100 * minutes / totalMinutes) : 0;
            return (
              <span key={bt.key} style={{
                color: "#222", background: bt.color, fontWeight: 700,
                borderRadius: 7, padding: "2px 10px", marginRight: 11, fontSize: 15
              }}>
                {bt.label}: {minutes}’ ({pct}%)
              </span>
            );
          })}
        </div>
        {essentialWarn.length > 0 && (
          <div style={{ color: "#e94057", fontWeight: 700, marginBottom: 8 }}>
            {essentialWarn.map((w, i) => <div key={i}>{w}</div>)}
          </div>
        )}
        <div style={{ color: "#FFD700bb", fontSize: 15 }}>
          <b>Tip:</b> Balance skill/game/condition blocks. Over 90 minutes = likely too long for youth; below 60 minutes = check for missing fundamentals.
        </div>
      </motion.section>
    </div>
  );
};

export default SessionPlanBuilder;
