import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const INIT_TASKS = [
  { id: 1, task: 'Organize U12 Tryouts', owner: 'Coach Ana', deadline: '2025-07-10', status: 'Planned', progress: 0, comments: [] },
  { id: 2, task: 'Launch Summer Camp', owner: 'Director Marko', deadline: '2025-08-01', status: 'In Progress', progress: 45, comments: [] },
  { id: 3, task: 'Sponsor Outreach', owner: 'Board', deadline: '2025-06-25', status: 'Planned', progress: 0, comments: [] },
];

const STATUS_COLORS = {
  'Planned': '#FFD700',
  'In Progress': '#48b5ff',
  'Completed': '#27ef7d'
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const TaskTracker = () => {
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [newTask, setNewTask] = useState({ task: '', owner: '', deadline: '', status: 'Planned', progress: 0, comments: [] });
  const [filter, setFilter] = useState('All');
  const [commentInput, setCommentInput] = useState({});
  const boardRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => boardRef.current,
    documentTitle: `CourtEvoVero_TaskBoard_${new Date().toISOString().slice(0,10)}`
  });

  // Drag and Drop reorder
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  };

  const handleAdd = e => {
    e.preventDefault();
    if (!newTask.task || !newTask.owner || !newTask.deadline) return;
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({ task: '', owner: '', deadline: '', status: 'Planned', progress: 0, comments: [] });
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks =>
      tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const addComment = (id) => {
    if (!commentInput[id]) return;
    setTasks(tasks =>
      tasks.map(t =>
        t.id === id
          ? { ...t, comments: [...t.comments, { text: commentInput[id], date: new Date().toLocaleString() }] }
          : t
      )
    );
    setCommentInput({ ...commentInput, [id]: '' });
  };

  // Filtered view
  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <motion.section
        ref={boardRef}
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
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 20 }}>
          Club Task Tracker
        </h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Task"
            value={newTask.task}
            onChange={e => setNewTask({ ...newTask, task: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none', width: 180 }}
            required
          />
          <input
            type="text"
            placeholder="Owner"
            value={newTask.owner}
            onChange={e => setNewTask({ ...newTask, owner: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none', width: 120 }}
            required
          />
          <input
            type="date"
            value={newTask.deadline}
            onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none', width: 140 }}
            required
          />
          <select
            value={newTask.status}
            onChange={e => setNewTask({ ...newTask, status: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none', width: 130 }}
          >
            <option>Planned</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <button
            type="submit"
            style={{
              background: "#FFD700",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 18px",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #FFD70033"
            }}>
            + Add Task
          </button>
        </form>
        <div style={{ marginBottom: 12, display: 'flex', gap: 18, alignItems: 'center' }}>
          <span style={{ color: '#FFD700', fontWeight: 600 }}>Filter:</span>
          {['All', 'Planned', 'In Progress', 'Completed'].map(stat => (
            <button
              key={stat}
              onClick={() => setFilter(stat)}
              style={{
                background: filter === stat ? '#FFD700' : 'transparent',
                color: filter === stat ? '#222' : '#FFD700',
                border: '1px solid #FFD70055',
                borderRadius: 5,
                padding: '5px 13px',
                marginRight: 3,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {stat}
            </button>
          ))}
        </div>
        <div style={{
          overflowX: 'auto',
          borderRadius: 10,
          boxShadow: "0 2px 8px #FFD70022"
        }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <table
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ width: '100%', color: '#fff', borderSpacing: 0 }}
                >
                  <thead>
                    <tr style={{ background: "#FFD70022" }}>
                      <th style={{ padding: 10, textAlign: "left" }}>Task</th>
                      <th style={{ padding: 10 }}>Owner</th>
                      <th style={{ padding: 10 }}>Deadline</th>
                      <th style={{ padding: 10 }}>Status</th>
                      <th style={{ padding: 10 }}>Progress</th>
                      <th style={{ padding: 10 }}>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((t, idx) => (
                      <Draggable key={t.id} draggableId={t.id.toString()} index={idx}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: t.status === 'Completed' ? "#27ef7d22"
                                : t.status === 'In Progress' ? "#48b5ff22"
                                : "#FFD70011",
                              borderLeft: snapshot.isDragging ? '6px solid #FFD700' : '6px solid transparent',
                              ...provided.draggableProps.style
                            }}
                          >
                            <td style={{ padding: 10 }}>{t.task}</td>
                            <td style={{ padding: 10 }}>{t.owner}</td>
                            <td style={{ padding: 10 }}>
                              <input
                                type="date"
                                value={t.deadline}
                                onChange={e => updateTask(t.id, 'deadline', e.target.value)}
                                style={{ background: 'transparent', color: '#fff', border: 'none' }}
                              />
                            </td>
                            <td style={{ padding: 10 }}>
                              <select
                                value={t.status}
                                onChange={e => updateTask(t.id, 'status', e.target.value)}
                                style={{
                                  background: 'transparent',
                                  color: STATUS_COLORS[t.status],
                                  fontWeight: 700,
                                  border: 'none'
                                }}
                              >
                                <option value="Planned">Planned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                            <td style={{ padding: 10, minWidth: 140 }}>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={t.progress}
                                onChange={e => updateTask(t.id, 'progress', Number(e.target.value))}
                                style={{ accentColor: STATUS_COLORS[t.status], width: 70 }}
                              />
                              <span style={{ marginLeft: 8 }}>{t.progress}%</span>
                            </td>
                            <td style={{ padding: 10, minWidth: 200 }}>
                              <div style={{ maxHeight: 60, overflowY: 'auto', marginBottom: 7 }}>
                                {t.comments.map((c, cidx) => (
                                  <div key={cidx} style={{ color: "#FFD700", fontSize: 14, marginBottom: 2 }}>
                                    <b>{c.date}:</b> {c.text}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 5 }}>
                                <input
                                  type="text"
                                  placeholder="Add comment"
                                  value={commentInput[t.id] || ''}
                                  onChange={e => setCommentInput({ ...commentInput, [t.id]: e.target.value })}
                                  style={{ padding: 4, borderRadius: 6, border: 'none', width: 110, fontSize: 14 }}
                                />
                                <button
                                  onClick={() => addComment(t.id)}
                                  style={{
                                    background: "#FFD700",
                                    color: "#222",
                                    border: "none",
                                    borderRadius: 4,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    padding: "4px 8px",
                                    cursor: "pointer"
                                  }}
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div style={{ marginTop: 16, color: '#FFD700', fontWeight: 500 }}>
          Drag &amp; drop to reorder. Filter, comment, and track progress live.
        </div>
      </motion.section>
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
            marginBottom: 12
          }}>
          Export Task Board (PDF)
        </button>
      </div>
    </div>
  );
};

export default TaskTracker;
