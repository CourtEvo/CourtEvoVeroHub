import React, { useState } from "react";
import { FaCamera, FaClock, FaUndo, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function ScenarioSnapshots({ state, onRestore }) {
  const [snapshots, setSnapshots] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    setSnapshots([
      ...snapshots,
      {
        timestamp: new Date().toLocaleString(),
        state: JSON.parse(JSON.stringify(state)) // deep copy
      }
    ]);
  };

  return (
    <div className="fixed bottom-0 right-0 z-40 m-4">
      <button
        className="bg-[#FFD700] text-black px-4 py-2 rounded-t-2xl font-bold shadow-xl flex items-center gap-2"
        onClick={() => setOpen(v => !v)}
      >
        <FaCamera /> {open ? <FaChevronDown /> : <FaChevronUp />} Snapshots
      </button>
      {open && (
        <div className="bg-[#23292f] rounded-b-2xl shadow-xl p-5 w-[320px] max-h-[400px] overflow-y-auto">
          <button
            className="mb-4 bg-[#1de682] text-black px-3 py-1 rounded-xl font-bold hover:scale-105 flex items-center gap-2"
            onClick={handleSave}
          >
            <FaCamera /> Save Current Snapshot
          </button>
          <div>
            {snapshots.length === 0 && (
              <div className="text-[#FFD700] italic">No snapshots yet.</div>
            )}
            {snapshots.slice().reverse().map((snap, i) => (
              <div key={i} className="mb-4 bg-[#181e23cc] rounded-lg p-3 shadow">
                <div className="flex items-center gap-2 mb-1 text-[#FFD700]">
                  <FaClock /> {snap.timestamp}
                  <button className="ml-auto text-[#1de682] hover:text-[#FFD700]" onClick={() => onRestore(snap.state)}>
                    <FaUndo /> Restore
                  </button>
                </div>
                <div className="text-xs text-[#FFD700bb]">[State saved]</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
