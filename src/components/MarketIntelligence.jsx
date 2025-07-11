import React from 'react';
import TalentFlowChart from './TalentFlowChart';
import MarketTrendsChart from './MarketTrendsChart';

const MarketIntelligence = () => (
  <section>
    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 28, color: '#FFD700' }}>
      Market Intelligence Dashboard
    </h2>
    <TalentFlowChart />
    <MarketTrendsChart />
    {/* Add Risk/Opportunity cards or heatmaps here as you expand */}
    <div style={{
      marginTop: 30,
      padding: 18,
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 14,
      color: '#FFD700',
      fontSize: 18,
      fontWeight: 600
    }}>
      <span role="img" aria-label="lightbulb">💡</span>
      <span style={{ marginLeft: 12 }}>
        <b>Strategic Insight:</b> CourtEvo Vero recommends targeting U14-U16 retention and leveraging recent funding growth for program expansion in 2025.
      </span>
    </div>
  </section>
);

export default MarketIntelligence;
