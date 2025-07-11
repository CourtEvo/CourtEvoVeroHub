import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';


// Baseline data for THIS club (customizable for each client)
const base = {
  coaches: 10,
  training: 6,    // hours/week
  ratio: 1.0,     // practice-to-game
  marketing: 2000, // EUR/month
  diagnostics: {
    "Athlete Dev": 8.5,
    "Coaching": 9.0,
    "Operations": 7.8,
    "Retention": 8.1,
    "Community": 7.5
  }
};

// Proprietary modeling function: returns projected diagnostics based on scenario
function projectDiagnostics({coaches, training, ratio, marketing}) {
  return {
    "Athlete Dev": +(base.diagnostics["Athlete Dev"] + 0.08 * (training - base.training) + 0.03 * (coaches - base.coaches)).toFixed(2),
    "Coaching": +(base.diagnostics["Coaching"] + 0.07 * (coaches - base.coaches) + 0.01 * (marketing - base.marketing)/1000).toFixed(2),
    "Operations": +(base.diagnostics["Operations"] + 0.04 * (ratio - base.ratio) + 0.01 * (coaches - base.coaches)).toFixed(2),
    "Retention": +(base.diagnostics["Retention"] + 0.12 * (training - base.training) + 0.07 * (coaches - base.coaches)).toFixed(2),
    "Community": +(base.diagnostics["Community"] + 0.02 * (marketing - base.marketing)/1000).toFixed(2)
  };
}

const ScenarioBuilder = React.forwardRef((props, ref) => {
  // Sliders: real-time modeling
  const [coaches, setCoaches] = useState(base.coaches);
  const [training, setTraining] = useState(base.training);
  const [ratio, setRatio] = useState(base.ratio);
  const [marketing, setMarketing] = useState(base.marketing);

  const projected = projectDiagnostics({coaches, training, ratio, marketing});
  const currentData = Object.keys(base.diagnostics).map(area => ({
    area,
    score: base.diagnostics[area]
  }));
  const projectedData = Object.keys(projected).map(area => ({
    area,
    score: Math.max(0, Math.min(10, projected[area]))
  }));

  return (
    <section style={{ marginTop: 32 }} ref={ref}>
      <h2 style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#FFD700',
        marginBottom: 22
      }}>Multi-Factor Scenario Builder</h2>

      <div style={{
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 2px 12px #FFD70022',
        maxWidth: 670,
        margin: '0 auto 32px auto'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
          <label style={{fontWeight:600}}>Certified Coaches:</label>
          <input type="range" min={6} max={18} value={coaches} onChange={e => setCoaches(Number(e.target.value))} />
          <span style={{fontWeight:700, fontSize:18, minWidth:32, textAlign:'right'}}>{coaches}</span>

          <label style={{fontWeight:600}}>Training Hours/Week:</label>
          <input type="range" min={2} max={12} value={training} onChange={e => setTraining(Number(e.target.value))} />
          <span style={{fontWeight:700, fontSize:18, minWidth:32, textAlign:'right'}}>{training}</span>

          <label style={{fontWeight:600}}>Practice-to-Game Ratio:</label>
          <input type="range" min={0.7} max={2.0} step={0.1} value={ratio} onChange={e => setRatio(Number(e.target.value))} />
          <span style={{fontWeight:700, fontSize:18, minWidth:32, textAlign:'right'}}>{ratio.toFixed(1)}</span>

          <label style={{fontWeight:600}}>Marketing Spend (EUR):</label>
          <input type="range" min={1000} max={8000} step={500} value={marketing} onChange={e => setMarketing(Number(e.target.value))} />
          <span style={{fontWeight:700, fontSize:18, minWidth:64, textAlign:'right'}}>{marketing} €</span>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        padding: 18,
        marginBottom: 32
      }}>
        <h3 style={{color:'#FFD700',fontSize:22,marginBottom:12}}>Current vs Projected Diagnostic Radar</h3>
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="area" tick={{ fill: '#fff', fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#FFD700', fontWeight: 500 }} />
            <Radar name="Current" dataKey="score" stroke="#FFD700" fill="#FFD700" fillOpacity={0.30} />
            <Radar name="Projected" dataKey="score" data={projectedData} stroke="#27ef7d" fill="#27ef7d" fillOpacity={0.15} />
            <Tooltip
              contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
              itemStyle={{ color: "#FFD700" }}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{fontSize:15,marginTop:12,color:"#FFD700cc"}}>
          <strong>Legend:</strong> <span style={{color:'#FFD700'}}>Gold</span>=Current, <span style={{color:'#27ef7d'}}>Green</span>=Projected.<br/>
          10 = Global Elite, 7–9 = On Track, &lt;7 = At Risk.
        </div>
      </div>
    </section>
  );
});

export default ScenarioBuilder;
