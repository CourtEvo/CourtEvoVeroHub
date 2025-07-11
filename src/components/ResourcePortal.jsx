import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaBookOpen, FaFileUpload, FaSearch, FaUserGraduate, FaChartLine, FaCertificate, FaDownload, FaFileExport, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// DEMO DATA
const LIBRARY = [
  { id: 1, title: "Basketball Fundamentals PDF", type: "Document", url: "#", tags: ["coach", "player"], uploaded: "2024-06-10" },
  { id: 2, title: "Offensive Sets Video", type: "Video", url: "#", tags: ["coach"], uploaded: "2024-05-22" },
  { id: 3, title: "Club Handbook", type: "Document", url: "#", tags: ["parent"], uploaded: "2024-06-01" },
  { id: 4, title: "Warm-up Routine", type: "Video", url: "#", tags: ["athlete"], uploaded: "2024-05-10" }
];

const MODULES = [
  { id: 1, name: "Child Protection", completed: true },
  { id: 2, name: "LTAD System Basics", completed: false },
  { id: 3, name: "Modern Game Analytics", completed: false }
];

const COACH_CPD = [
  { name: "Ana", cert: "FIBA Youth", expires: "2025-04-30", uploaded: true, risk: "green" },
  { name: "Luka", cert: "First Aid", expires: "2024-07-01", uploaded: true, risk: "yellow" },
  { name: "Ivan", cert: "Pro License", expires: "2026-11-15", uploaded: false, risk: "red" }
];

const TAGS = ["coach", "player", "parent", "athlete"];
const fadeIn = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const ResourcePortal = () => {
  const sectionRef = useRef();
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const [uploadModal, setUploadModal] = useState(false);
  const [newFile, setNewFile] = useState({ title: "", type: "Document", tags: [], url: "" });

  // Print/export
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `ResourcePortal_${new Date().toISOString().slice(0, 10)}`
  });

  // Library filter/search
  const filtered = LIBRARY.filter(
    f =>
      (!filterTag || f.tags.includes(filterTag)) &&
      (search === "" || f.title.toLowerCase().includes(search.toLowerCase()))
  );

  // Upload handler (demo - no backend)
  function handleUpload(e) {
    e.preventDefault();
    // Here, you'd POST to a backend or update local state.
    setUploadModal(false);
    setNewFile({ title: "", type: "Document", tags: [], url: "" });
    alert("File uploaded (demo)");
  }

  // Module tracker progress
  const percentComplete = Math.round(100 * MODULES.filter(m => m.completed).length / MODULES.length);

  return (
    <div style={{ width: "100%", maxWidth: 1020, margin: "0 auto" }}>
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
        <div style={{ fontSize: 27, color: "#FFD700", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <FaBookOpen /> Education & Resource Portal
          <button onClick={handlePrint} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "7px 18px", marginLeft: "auto" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} /> Export PDF
          </button>
        </div>
        {/* Resource library */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 25 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaFileUpload /> Club Library
            <button onClick={() => setUploadModal(true)} style={{ background: "#27ef7d", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, fontSize: 15, padding: "5px 14px", marginLeft: "auto" }}>
              <FaFileUpload /> Upload
            </button>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 7 }}>
            <span>Filter:</span>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => setFilterTag(tag)} style={{
                background: filterTag === tag ? "#FFD700" : "#333",
                color: filterTag === tag ? "#222" : "#FFD700",
                border: "none", borderRadius: 5, padding: "2px 11px", fontWeight: 700, fontSize: 14
              }}>{tag}</button>
            ))}
            <button onClick={() => setFilterTag("")} style={{
              background: "#232344", color: "#fff", border: "none", borderRadius: 5, padding: "2px 11px", fontWeight: 700, fontSize: 14
            }}>Clear</button>
            <FaSearch style={{ marginLeft: 20 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ borderRadius: 5, padding: "3px 10px", fontSize: 14, marginLeft: 5 }} />
          </div>
          <table style={{ width: "100%", background: "#FFD70009", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ background: "#222", color: "#FFD700" }}>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Tags</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(file => (
                <tr key={file.id} style={{
                  color: "#fff", background: file.type === "Video" ? "#1a1d24" : "#fff1", fontWeight: 600
                }}>
                  <td>{file.title}</td>
                  <td>{file.type}</td>
                  <td>{file.tags.join(", ")}</td>
                  <td>{file.uploaded}</td>
                  <td>
                    <a href={file.url} target="_blank" rel="noreferrer" style={{ color: "#27ef7d", fontWeight: 700 }}><FaDownload /> Download</a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#FFD700", padding: 10 }}>No resources found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Upload Modal */}
        {uploadModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "#0009", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999
          }}>
            <form onSubmit={handleUpload} style={{ background: "#232344", borderRadius: 12, padding: 30, minWidth: 320, color: "#FFD700" }}>
              <h3 style={{ fontWeight: 700, fontSize: 21, marginBottom: 12 }}><FaFileUpload /> Upload Resource</h3>
              <input required placeholder="Title" value={newFile.title} onChange={e => setNewFile(f => ({ ...f, title: e.target.value }))} style={{ width: "100%", marginBottom: 10, fontSize: 15, borderRadius: 5 }} />
              <select value={newFile.type} onChange={e => setNewFile(f => ({ ...f, type: e.target.value }))} style={{ width: "100%", marginBottom: 10, fontSize: 15, borderRadius: 5 }}>
                <option value="Document">Document</option>
                <option value="Video">Video</option>
              </select>
              <input required placeholder="URL (upload or paste link)" value={newFile.url} onChange={e => setNewFile(f => ({ ...f, url: e.target.value }))} style={{ width: "100%", marginBottom: 10, fontSize: 15, borderRadius: 5 }} />
              <div style={{ marginBottom: 10 }}>
                <span style={{ marginRight: 8 }}>Tags:</span>
                {TAGS.map(tag => (
                  <label key={tag} style={{ marginRight: 8 }}>
                    <input type="checkbox" checked={newFile.tags.includes(tag)} onChange={e =>
                      setNewFile(f =>
                        e.target.checked
                          ? { ...f, tags: [...f.tags, tag] }
                          : { ...f, tags: f.tags.filter(t => t !== tag) }
                      )} />
                    {tag}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, padding: "5px 17px", fontWeight: 700 }}>Upload</button>
                <button type="button" onClick={() => setUploadModal(false)} style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 7, padding: "5px 17px", fontWeight: 700 }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Self-paced Education Modules */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 25 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaChartLine /> Learning Modules
            <span style={{
              marginLeft: "auto", background: "#FFD70033", borderRadius: 6, padding: "4px 15px", color: "#FFD700", fontWeight: 700
            }}>{percentComplete}% Complete</span>
          </div>
          <div style={{ marginBottom: 11, height: 11, background: "#222", borderRadius: 8 }}>
            <div style={{ width: `${percentComplete}%`, background: "#27ef7d", height: "100%", borderRadius: 8, transition: "width 0.5s" }} />
          </div>
          <table style={{ width: "100%", background: "#FFD70009", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ background: "#222", color: "#FFD700" }}>
              <tr>
                <th>Module</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map(mod => (
                <tr key={mod.id}>
                  <td>{mod.name}</td>
                  <td>
                    {mod.completed
                      ? <span style={{ color: "#27ef7d", fontWeight: 700 }}><FaCheckCircle /> Completed</span>
                      : <span style={{ color: "#FFD700", fontWeight: 700 }}><FaExclamationTriangle /> In Progress</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coach CPD Tracker */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 5 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaUserGraduate /> Coach CPD & Certification
          </div>
          <table style={{ width: "100%", background: "#FFD70009", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ background: "#222", color: "#FFD700" }}>
              <tr>
                <th>Coach</th>
                <th>Certification</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Upload</th>
              </tr>
            </thead>
            <tbody>
              {COACH_CPD.map(coach => (
                <tr key={coach.name} style={{
                  color: coach.risk === "green" ? "#27ef7d"
                    : coach.risk === "yellow" ? "#FFD700"
                    : "#e94057",
                  fontWeight: 600
                }}>
                  <td>{coach.name}</td>
                  <td>{coach.cert}</td>
                  <td>{coach.expires}</td>
                  <td>
                    {coach.risk === "green" ? <FaCheckCircle /> : coach.risk === "yellow" ? <FaExclamationTriangle /> : <FaExclamationTriangle />}
                  </td>
                  <td>
                    <button style={{
                      background: coach.uploaded ? "#27ef7d" : "#FFD700", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, padding: "4px 12px"
                    }}>{coach.uploaded ? <FaCheckCircle /> : <FaFileUpload />}{coach.uploaded ? " Uploaded" : " Upload"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};

export default ResourcePortal;
