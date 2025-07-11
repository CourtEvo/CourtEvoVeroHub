import React from "react";
import { FaGlobeEurope } from "react-icons/fa";

const LanguageSettings = () => (
  <div style={{ padding: 30 }}>
    <h2><FaGlobeEurope style={{marginRight: 8}} /> Language & Region Settings</h2>
    <p>Select language: <select><option>English</option><option>Croatian</option><option>Spanish</option></select></p>
    <p>More advanced localization will be added soon.</p>
  </div>
);

export default LanguageSettings;
