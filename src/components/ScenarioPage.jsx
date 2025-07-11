import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ScenarioBuilder from './ScenarioBuilder';

const ScenarioPage = () => {
  const scenarioRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => scenarioRef.current,
    documentTitle: `CourtEvoVero_Scenario_${new Date().toISOString().slice(0,10)}`
  });

  return (
    <section>
      <button onClick={handlePrint}
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
          marginBottom: 18,
          float: "right"
        }}>
        Download Scenario Report (PDF)
      </button>
      <div ref={scenarioRef}>
        <ScenarioBuilder />
      </div>
      <div style={{ clear: "both" }} />
    </section>
  );
};

export default ScenarioPage;
