// src/components/StrategicAlignmentDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import MainCardWrapper from './MainCardWrapper';
import AlertsBanner from './AlertsBanner';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { FaDownload, FaFileCsv, FaSyncAlt } from 'react-icons/fa';
import './StrategicAlignmentDashboard.css';

const CSV_FILENAME = '/data/StrategicPlanMetrics.csv';

export default function StrategicAlignmentDashboard() {
  const [data, setData] = useState([]);
  const [allMetrics, setAllMetrics] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    Papa.parse(CSV_FILENAME, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: ({ data: rows }) => {
        const cleaned = rows
          .filter(r => r.metric && typeof r.current === 'number' && typeof r.target === 'number')
          .map(r => ({
            metric: r.metric,
            current: r.current,
            target: r.target
          }));
        if (cleaned.length === 0) {
          fallbackToMock();
        } else {
          setData(cleaned);
          setAllMetrics(cleaned.map(r => r.metric));
          setSelectedMetrics(cleaned.map(r => r.metric));
          computeAlerts(cleaned);
          setLoading(false);
        }
      },
      error: fallbackToMock
    });
    // eslint-disable-next-line
  }, []);

  function fallbackToMock() {
    setError('Failed to load CSV, loading default metrics.');
    const mock = [
      { metric: 'Participation', current: 70, target: 85 },
      { metric: 'Retention', current: 55, target: 75 },
      { metric: 'ElitePathway', current: 40, target: 60 },
    ];
    setData(mock);
    setAllMetrics(mock.map(r => r.metric));
    setSelectedMetrics(mock.map(r => r.metric));
    computeAlerts(mock);
    setLoading(false);
  }

  function computeAlerts(dataset) {
    const gapAlerts = dataset
      .filter(d => d.target - d.current > 10)
      .map(d => `${d.metric}: ${d.current}% vs ${d.target}%`);
    setAlerts(gapAlerts);
  }

  const toggleMetric = metric => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const toggleAll = () => {
    setSelectedMetrics(selectedMetrics.length === allMetrics.length ? [] : allMetrics);
  };

  const filteredData = selectedMetrics.length
    ? data.filter(d => selectedMetrics.includes(d.metric))
    : [];

  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: '#232a2e', scale: 2 });
    const link = document.createElement('a');
    link.download = 'StrategicAlignment.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadCSV = () => {
    const rows = filteredData.length ? filteredData : data;
    const csv = [
      ['Metric', 'Current', 'Target'],
      ...rows.map(r => [r.metric, r.current, r.target])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = 'StrategicAlignment.csv';
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
            .filter(r => r.metric && typeof r.current === 'number' && typeof r.target === 'number')
            .map(r => ({
              metric: r.metric,
              current: r.current,
              target: r.target
            }));
          if (cleaned.length === 0) {
            fallbackToMock();
          } else {
            setData(cleaned);
            setAllMetrics(cleaned.map(r => r.metric));
            setSelectedMetrics(cleaned.map(r => r.metric));
            computeAlerts(cleaned);
            setLoading(false);
          }
        },
        error: fallbackToMock
      });
    }, 800);
  };

  return (
    <MainCardWrapper>
      <div className="sad-header">
        <h2>Strategic Alignment</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="icon-btn" title="Export PNG" onClick={handleDownloadPNG}><FaDownload /></button>
          <button className="icon-btn" title="Export CSV" onClick={handleDownloadCSV}><FaFileCsv /></button>
          <button className="icon-btn" title="Reload" onClick={handleReload}><FaSyncAlt /></button>
        </div>
      </div>
      <div style={{ color: "#1de682", fontSize: 15, marginBottom: 7 }}>
        Compare club KPIs with strategic targets. Boardroom-Ready export.
      </div>
      {error && <div className="error">{error}</div>}
      {alerts.length > 0 && <AlertsBanner messages={alerts} />}

      {loading ? (
        <div className="sad-spinner" />
      ) : data.length === 0 ? (
        <div style={{ color: '#FFD700', fontSize: 16 }}>No metrics available.</div>
      ) : (
        <>
          <div className="toggle-bar" tabIndex={0} aria-label="Metric selector">
            <label className="metric-toggle select-all">
              <input
                type="checkbox"
                checked={selectedMetrics.length === allMetrics.length}
                onChange={toggleAll}
              />
              <span style={{ fontWeight: 700 }}>Select All</span>
            </label>
            {allMetrics.map(metric => (
              <label key={metric} className="metric-toggle">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric)}
                  onChange={() => toggleMetric(metric)}
                />
                {metric}
              </label>
            ))}
          </div>

          <div ref={chartRef} className="chart-container fadein">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={filteredData.length ? filteredData : data} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid stroke="#1de68233" />
                <PolarAngleAxis dataKey="metric" stroke="#FFD700" />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#fff' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#FFD700"
                  fill="#FFD700"
                  fillOpacity={0.35}
                  animationDuration={900}
                  isAnimationActive
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#1de682"
                  fill="#1de682"
                  fillOpacity={0.18}
                  animationDuration={1000}
                  isAnimationActive
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ color: '#fff', fontSize: 14 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#232a2e', borderColor: '#1de682' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#FFD700' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </MainCardWrapper>
  );
}
