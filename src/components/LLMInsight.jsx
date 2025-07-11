import React, { useState } from 'react';
import axios from 'axios';

const makePrompt = ({ seasonTrends, costEfficiency, playerStats, marketTrends }) => {
  // Summarize key info for the AI (customize this as you wish)
  return `
You are an expert basketball consultant. 
Analyze this club's data and generate 3 actionable strategic priorities, each with a reason:
- Recent retention rates: ${seasonTrends.map(s => `${s.year}: ${s.Retention}%`).join(', ')}
- Cost per win: ${costEfficiency.map(c => `${c.club}: €${c.costPerWin}`).join(', ')}
- Player stats: ${playerStats.map(p => `${p.name}: ${p.PPG} PPG`).join(', ')}
- Market trend enrollments: ${marketTrends.map(m => `${m.year}: ${m.enrollments}`).join(', ')}
Respond in a clear, professional tone.
  `;
};

const LLMInsight = ({ seasonTrends, costEfficiency, playerStats, marketTrends }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setInsight('');
    setLoading(true);
    try {
      const prompt = makePrompt({ seasonTrends, costEfficiency, playerStats, marketTrends });
      const res = await axios.post('http://localhost:5000/api/ai-insights', { prompt });
      setInsight(res.data.insight.trim());
    } catch (err) {
      setInsight("AI service failed—try again or check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: 32, marginBottom: 32 }}>
      <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 24, marginBottom: 12 }}>
        LLM-Generated Boardroom Insights <span role="img" aria-label="rocket">🚀</span>
      </h3>
      <button
        onClick={handleGenerate}
        style={{
          background: "#FFD700",
          color: "#222",
          fontWeight: 700,
          border: "none",
          borderRadius: 7,
          padding: "7px 16px",
          fontSize: 17,
          cursor: "pointer",
          boxShadow: "0 2px 8px #FFD70033",
          marginBottom: 12,
          minWidth: 160
        }}>
        {loading ? "Generating..." : "Generate with AI"}
      </button>
      {insight && (
        <div style={{
          background: 'rgba(255,255,255,0.09)',
          color: '#FFD700',
          borderRadius: 10,
          padding: 20,
          fontSize: 18,
          fontWeight: 500,
          marginTop: 12,
          whiteSpace: 'pre-line'
        }}>
          {insight}
        </div>
      )}
    </section>
  );
};

export default LLMInsight;
