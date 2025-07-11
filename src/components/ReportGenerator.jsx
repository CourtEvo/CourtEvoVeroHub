import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FaFileExport, FaRobot } from "react-icons/fa";
import ClubOperationalEfficiencyModel from "./ClubOperationalEfficiencyModel"; // or any other dashboard

const ReportGenerator = () => {
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "CourtEvoVero_BoardPack_" + new Date().toISOString().slice(0,10)
  });

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: 30 }}>
      <h2 style={{ color: "#FFD700", fontWeight: 800, fontSize: 32 }}><FaFileExport style={{ marginRight: 12 }} /> Board Pack / Report Generator</h2>
      <div style={{ margin: "19px 0" }}>
        <button onClick={handlePrint} style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900,
          border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 18, cursor: "pointer"
        }}>
          Export Current View as PDF
        </button>
      </div>
      <div ref={printRef}>
        {/* Embed whatever dashboard or filtered section you want to export */}
        <ClubOperationalEfficiencyModel />
      </div>
      <div style={{ marginTop: 26, background: "#181e23", color: "#FFD700", padding: 18, borderRadius: 12 }}>
        <FaRobot style={{ marginRight: 8 }} /> <b>AI Commentary:</b> "Monitor Staffing and Compliance in Q3; export Board Pack with KPI attachments."
      </div>
    </div>
  );
};
export default ReportGenerator;
