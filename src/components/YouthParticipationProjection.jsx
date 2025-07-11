import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import MainCardWrapper from './MainCardWrapper';
import AlertsBanner from './AlertsBanner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { FaDownload, FaFileCsv, FaSyncAlt, FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import './YouthParticipationProjection.css';

const CSV_FILENAME = '/data/YouthParticipationProjections.csv';

const SCENARIOS = [
  { key: 'conservative', label: 'Conservative', color: '#FFD700', icon: <FaExclamationTriangle /> },
  { key: 'baseline', label: 'Baseline', color: '#1de682', icon: <FaBullseye /> },
  { key: 'ambitious', label: 'Ambitious', color: '#57a0ff', icon: <FaBullseye /> }
];

export default function YouthParticipationProjection() {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  // Analytics infobox data
  const [summary, setSummary] = useState({ cagr: null, forecast: null, trend: null });

  useEffect(() => {
    setLoading(true);
    setError('');
    Papa.parse(CSV_FILENAME, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: ({ data: rows }) => {
        const cleaned = rows
          .filter(r => r.year && r.conservative && r.baseline && r.ambitious && r.target)
          .map(r => ({
            year: Number(r.year),
            conservative: Number(r.conservative),
            baseline: Number(r.baseline),
            ambitious: Number(r.ambitious),
            target: Number(r.target)
          }));
        if (cleaned.length === 0) {
          fallbackToMock();
        } else {
          setData(cleaned);
          computeAlertsAndSummary(cleaned, activeScenario);
          setLoading(false);
        }
      },
      error: fallbackToMock
    });
    // eslint-disable-next-line
  }, []);

  function fallbackToMock() {
    setError('Failed to load CSV, using default projections.');
    const mock = [
      { year: 2022, conservative: 74, baseline: 80, ambitious: 85, target: 78 },
      { year: 2023, conservative: 75, baseline: 82, ambitious: 90, target: 80 },
      { year: 2024, conservative: 73, baseline: 84, ambitious: 94, target: 82 },
      { year: 2025, conservative: 70, baseline: 87, ambitious: 98, target: 85 },
      { year: 2026, conservative: 68, baseline: 90, ambitious: 102, target: 88 },
    ];
    setData(mock);
    computeAlertsAndSummary(mock, activeScenario);
    setLoading(false);
  }

  function computeAlertsAndSummary(dataset, scenario) {
    // Alert if any projection dips below target or steep drop
    const warnings = [];
    for (let i = 0; i < dataset.length; ++i) {
      const row = dataset[i];
      if (row[scenario] < row.target) {
        warnings.push(`In ${row.year}: ${SCENARIOS.find(s=>s.key===scenario).label} projects ${row[scenario]} vs target ${row.target}`);
      }
    }
    setAlerts(warnings);

    // Calculate 5y CAGR for scenario
    const arr = dataset.map(d => d[scenario]).filter(Boolean);
    const years = dataset.map(d => d.year);
    if (arr.length > 1) {
      const cagr = Math.pow(arr[arr.length-1]/arr[0], 1/(arr.length-1)) - 1;
      const nextYear = years[years.length-1] + 1;
      const forecast = Math.round(arr[arr.length-1] * (1 + cagr));
      let trend = cagr > 0 ? 'UP' : (cagr < 0 ? 'DOWN' : 'FLAT');
      setSummary({
        cagr: (cagr*100).toFixed(1),
        forecast,
        trend
      });
    } else {
      setSummary({ cagr: null, forecast: null, trend: null });
    }
  }

  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: '#232a2e', scale: 2 });
    const link = document.createElement('a');
    link.download = 'YouthParticipationProjection.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadCSV = () => {
    const csv = [
      ['Year', ...SCENARIOS.map(s => s.label), 'Target'],
      ...data.map(r => [r.year, r.conservative, r.baseline, r.ambitious, r.target])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'YouthParticipationProjection.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // Provide club with a template to fill in projections
  const handleDownloadTemplate = () => {
    const template = [
      ['year,conservative,baseline,ambitious,target'],
      ['2023,70,80,85,78'],
      ['2024,71,81,87,80'],
      ['2025,72,83,90,83'],
      ['2026,73,85,95,86']
    ].join('\n');
    const blob = new Blob([template], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'YouthParticipationTemplate.csv';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleReload = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      Papa.parse(CSV_FILENAME, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: ({ data: rows }) => {
          const cleaned = rows
            .filter(r => r.year && r.conservative && r.baseline && r.ambitious && r.target)
            .map(r => ({
              year: Number(r.year),
              conservative: Number(r.conservative),
              baseline: Number(r.baseline),
              ambitious: Number(r.ambitious),
              target: Number(r.target)
            }));
          if (cleaned.length === 0) {
            fallbackToMock();
          } else {
            setData(cleaned);
            computeAlertsAndSummary(cleaned, activeScenario);
            setLoading(false);
          }
        },
        error: fallbackToMock
      });
    }, 800);
  };

  const handleScenario = scenario => {
    setActiveScenario(scenario);
    computeAlertsAndSummary(data, scenario);
  };

  // Branded risk/opportunity infobox
  const renderSummaryBox = () => (
    <div className={`ypp-infobox trend-${summary.trend?.toLowerCase() || 'flat'}`}>
      <div>
        <span className="ypp-infobox-label">CAGR</span>
        <span className="ypp-infobox-value">{summary.cagr}%</span>
      </div>
      <div>
        <span className="ypp-infobox-label">Next Year Forecast</span>
        <span className="ypp-infobox-value">{summary.forecast}</span>
      </div>
      <div>
        <span className="ypp-infobox-label">Trend</span>
        <span className="ypp-infobox-value">{summary.trend}</span>
      </div>
    </div>
  );

  return (
    <MainCardWrapper>
      <div className="ypp-header">
        <h2>Youth Participation Projection</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="icon-btn" title="Export PNG" onClick={handleDownloadPNG}><FaDownload /></button>
          <button className="icon-btn" title="Export CSV" onClick={handleDownloadCSV}><FaFileCsv /></button>
          <button className="icon-btn" title="Download Template" onClick={handleDownloadTemplate}><FaFileCsv style={{ color: "#FFD700" }} /></button>
          <button className="icon-btn" title="Reload" onClick={handleReload}><FaSyncAlt /></button>
        </div>
      </div>
      <div style={{ color: "#1de682", fontSize: 15, marginBottom: 7 }}>
        Project and benchmark youth participation for strategic planning. Use scenario toggles and download your own template.
      </div>
      {error && <div className="error">{error}</div>}
      {alerts.length > 0 && <AlertsBanner messages={alerts} />}
      <div className="ypp-scenarios">
        {SCENARIOS.map(s => (
          <button
            key={s.key}
            className={`ypp-scenario-btn${activeScenario === s.key ? ' active' : ''}`}
            style={{ borderColor: s.color, color: s.color, display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => handleScenario(s.key)}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
      {summary.cagr && renderSummaryBox()}
      <div ref={chartRef} className="chart-container fadein">
        {loading ? (
          <div className="sad-spinner" />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={data}>
              <CartesianGrid stroke="#1de68222" />
              <XAxis dataKey="year" stroke="#FFD700" fontSize={15} />
              <YAxis stroke="#FFD700" fontSize={15} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#232a2e', borderColor: '#FFD700' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#FFD700' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              {SCENARIOS.map(s => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={activeScenario === s.key ? 3.5 : 1.5}
                  dot={activeScenario === s.key}
                  activeDot={{ r: 8 }}
                  isAnimationActive
                />
              ))}
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#ff6b6b"
                strokeDasharray="5 4"
                dot={false}
              />
              <ReferenceLine y={80} label="Minimum" stroke="#FFD700" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </MainCardWrapper>
  );
}
