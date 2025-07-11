// src/components/ResourceDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, ReferenceLine
} from 'recharts';
import {
  FaDownload, FaFileCsv, FaSyncAlt, FaEye, FaEyeSlash,
  FaFilter, FaExclamationTriangle, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const CSV_FILENAME = '/data/ResourceDashboard.csv';
const COLORS = {
  Salaries: '#FFD700',
  Facility: '#1de682',
  Equipment: '#57a0ff',
  Events: '#ff6b6b',
  Travel: '#ffb347',
  Other: '#a890fe'
};
const DEMO = [
  { resource: 'Salaries', planned: 35000, actual: 34800 },
  { resource: 'Facility', planned: 12000, actual: 14000 },
  { resource: 'Equipment', planned: 7000, actual: 6700 },
  { resource: 'Events', planned: 5000, actual: 8200 },
  { resource: 'Travel', planned: 9000, actual: 7000 },
  { resource: 'Other', planned: 3000, actual: 1900 }
];

// Utility: compute per-resource efficiency
const efficiency = (planned, actual) =>
  planned ? Math.round((actual / planned) * 100) : 0;

export default function ResourceDashboard() {
  const [data, setData] = useState([]);
  const [shown, setShown] = useState(Object.keys(COLORS));
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [effFilter, setEffFilter] = useState([0, 200]);
  const chartRef = useRef();

  // Data loading
  useEffect(() => {
    setLoading(true);
    Papa.parse(CSV_FILENAME, {
      download: true, header: true, dynamicTyping: true,
      complete: ({ data: rows }) => {
        const cleaned = rows
          .filter(r => r.resource && r.planned && r.actual)
          .map(r => ({
            resource: r.resource,
            planned: +r.planned,
            actual: +r.actual
          }));
        cleaned.length ? init(cleaned) : demo();
      },
      error: demo
    });
    // eslint-disable-next-line
  }, []);

  function init(rows) {
    setData(rows);
    setShown(rows.map(r => r.resource));
    analyze(rows);
    setLoading(false);
  }
  function demo() {
    setError('⚠️ CSV load failed; demo data shown.');
    init(DEMO);
  }

  // Boardroom summary
  function analyze(rows) {
    let pSum = 0, aSum = 0, banners = [], eff = {}, bigOver = {v:-1,r:""}, bigUnder={v:9999,r:""}, absGap = {d:0, r:""};
    rows.forEach(r => {
      pSum += r.planned; aSum += r.actual;
      const pct = efficiency(r.planned, r.actual);
      eff[r.resource] = pct;
      const gap = r.actual - r.planned;
      if (pct > 120 && pct > bigOver.v) bigOver = {v:pct, r:r.resource};
      if (pct < 70 && pct < bigUnder.v) bigUnder = {v:pct, r:r.resource};
      if (Math.abs(gap) > Math.abs(absGap.d)) absGap = {d:gap, r:r.resource};
      if (pct > 120) banners.push(`Critical overspend: ${r.resource} (${pct}%)`);
      if (pct < 70)  banners.push(`Critical underspend: ${r.resource} (${pct}%)`);
    });
    setAlerts(banners);
    setSummary({
      plannedSum: pSum,
      actualSum: aSum,
      efficiency: pSum ? Math.round(aSum / pSum * 100) : 0,
      largestGap: `${absGap.r} (€${Math.abs(absGap.d)})`,
      effMap: eff,
      bigOver,
      bigUnder,
      filteredCount: rows.length
    });
  }

  // Filtering
  const quickPick = (range) => {
    if (range === 'ALL') setEffFilter([0, 200]);
    if (range === 'EFFICIENT') setEffFilter([90, 110]);
    if (range === 'OVER') setEffFilter([111, 200]);
    if (range === 'UNDER') setEffFilter([0, 89]);
  };

  // Toggle resource
  const toggle = (r) =>
    setShown(s =>
      s.includes(r) ? s.filter(x => x !== r) : [...s, r]
    );

  // Filtered data for chart
  const filtered = data
    .filter(d => shown.includes(d.resource))
    .filter(d => {
      const pct = summary.effMap?.[d.resource] || 0;
      return pct >= effFilter[0] && pct <= effFilter[1];
    });

  // Export, template, reload handlers
  const handleExport = async () => {
    if (!chartRef.current) return;
    const c = await html2canvas(chartRef.current, { backgroundColor: '#232a2e', scale: 2 });
    const link = document.createElement('a');
    link.download = 'ResourceDashboard.png';
    link.href = c.toDataURL();
    link.click();
  };
  const handleCsv = () => {
    const csv = [['Resource','Planned','Actual'], ...data.map(r => [r.resource, r.planned, r.actual])];
    const blob = new Blob([csv.map(r=>r.join(',')).join('\n')], { type: 'text/csv' });
    const l = document.createElement('a');
    l.download = 'ResourceDashboard.csv';
    l.href = URL.createObjectURL(blob);
    l.click();
  };
  const handleTemplate = () => {
    const tmpl = ['resource,planned,actual','Salaries,40000,38500','Facility,12000,11000']
      .concat(Object.keys(COLORS).slice(2).map(r=>`${r},0,0`))
      .join('\n');
    const b = new Blob([tmpl], { type: 'text/csv' });
    const l = document.createElement('a');
    l.download = 'ResourceDashboardTemplate.csv';
    l.href = URL.createObjectURL(b);
    l.click();
  };

  // Style for resource toggles (heatmap legend)
  const legendBox = c => ({
    background: c, color:'#222', fontWeight:700,
    borderRadius:8, minWidth:74, border:'none',
    boxShadow:'0 1px 6px #0003', margin: '0 2px',
    padding:'6px 13px', cursor:'pointer'
  });

  // Boardroom mini-widget style
  const kpiStyle = {
    background:'#181e23',
    color:'#FFD700', borderRadius:12,
    padding:'9px 23px', minWidth:155,
    marginRight: 18, display:'flex',
    flexDirection:'column', alignItems:'center', fontWeight:700
  };

  // Tooltip formatter: shows €gap, deviation
  const tooltipFormatter = (val, name, {payload}) => {
    if (name === "Actual") {
      const gap = payload.actual - payload.planned;
      const pct = efficiency(payload.planned, payload.actual);
      return [`€${val} (${gap>=0?'+':'-'}€${Math.abs(gap)})`, `Actual (${pct}%)`];
    }
    return [`€${val}`,"Planned"];
  };

  return (
    <div style={{
      background: '#232a2e', padding: 36, borderRadius: 24,
      maxWidth: 1300, margin: '34px auto', boxShadow: '0 8px 38px #FFD70023'
    }}>
      {/* Header & Quick Actions */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10
      }}>
        <h2 style={{ color:'#FFD700', margin:0, fontWeight:900, letterSpacing:2, fontSize:29 }}>
          Resource Finance Dashboard
        </h2>
        <div style={{ display:'flex', gap:14 }}>
          <button onClick={handleExport} title="Export as PNG"><FaDownload /></button>
          <button onClick={handleCsv} title="Export CSV"><FaFileCsv /></button>
          <button onClick={handleTemplate} title="Download Template"><FaFileCsv style={{ color: "#1de682" }} /></button>
          <button onClick={()=>window.location.reload()} title="Reload"><FaSyncAlt /></button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{display:'flex', gap:13, margin:'22px 0 16px 0', flexWrap:'wrap', alignItems:'center'}}>
        <div style={kpiStyle}>
          <span style={{fontSize:16}}>TOTAL PLANNED</span>
          <span style={{fontSize:27, color:'#FFD700'}}>{summary.plannedSum ? `€${summary.plannedSum}` : '—'}</span>
        </div>
        <div style={kpiStyle}>
          <span style={{fontSize:16}}>TOTAL ACTUAL</span>
          <span style={{fontSize:27, color:'#1de682'}}>{summary.actualSum ? `€${summary.actualSum}` : '—'}</span>
        </div>
        <div style={kpiStyle}>
          <span style={{fontSize:16}}>EFFICIENCY</span>
          <span style={{fontSize:27, color:'#FFD700'}}>{summary.efficiency ? `${summary.efficiency}%` : '—'}</span>
        </div>
        <div style={kpiStyle}>
          <span style={{fontSize:15}}>BIGGEST OVERSHOOT</span>
          <span style={{fontSize:19, color:'#ff6b6b'}}>
            {summary.bigOver?.r ? `${summary.bigOver.r} (${summary.bigOver.v}%)` : '—'}
          </span>
        </div>
        <div style={kpiStyle}>
          <span style={{fontSize:15}}>BIGGEST UNDERSPEND</span>
          <span style={{fontSize:19, color:'#57a0ff'}}>
            {summary.bigUnder?.r ? `${summary.bigUnder.r} (${summary.bigUnder.v}%)` : '—'}
          </span>
        </div>
      </div>

      {/* Alert banner */}
      {alerts.length > 0 && (
        <div style={{
          background:'#ff6b6b22', color:'#ff6b6b', fontWeight:800,
          borderRadius:10, padding:14, marginBottom:14, fontSize:17, display:'flex', alignItems:'center'
        }}>
          <FaExclamationTriangle style={{marginRight:10, fontSize:21}}/>
          {alerts.map((a,i)=><span key={i}>{a}{i<alerts.length-1 && " | "}</span>)}
        </div>
      )}

      {/* Efficiency Range and Toggles */}
      <div style={{
        display:'flex', alignItems:'center', flexWrap:'wrap',
        gap:20, marginBottom:10, justifyContent:'space-between'
      }}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <FaFilter />
          <span style={{color:'#FFD700', fontWeight:700, fontSize:16}}>Efficiency %</span>
          <button onClick={()=>quickPick('ALL')} style={legendBox('#FFD700')}>All</button>
          <button onClick={()=>quickPick('EFFICIENT')} style={legendBox('#1de682')}>90–110%</button>
          <button onClick={()=>quickPick('OVER')} style={legendBox('#ff6b6b')}>Over</button>
          <button onClick={()=>quickPick('UNDER')} style={legendBox('#57a0ff')}>Under</button>
          <FaChevronLeft />
          <input
            type="number" value={effFilter[0]} min={0} max={200}
            onChange={e=>setEffFilter([+e.target.value, effFilter[1]])}
            style={{width:46, borderRadius:6, border:'none', marginLeft:2}}
          />–
          <input
            type="number" value={effFilter[1]} min={0} max={200}
            onChange={e=>setEffFilter([effFilter[0], +e.target.value])}
            style={{width:46, borderRadius:6, border:'none'}}
          />
          <FaChevronRight />
        </div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {Object.keys(COLORS).map(r=>(
            <button key={r} onClick={()=>toggle(r)}
              style={{
                ...legendBox(COLORS[r]),
                color: shown.includes(r) ? '#232a2e' : '#FFD700',
                border: shown.includes(r) ? '2px solid #1de682' : '2px solid #FFD700',
                opacity: shown.includes(r) ? 1 : 0.6
              }}>
              {shown.includes(r) ? <FaEye/> : <FaEyeSlash/>} {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div ref={chartRef} style={{
        background:'#181e23', padding:16, borderRadius:14, height:470, boxShadow:'0 2px 12px #FFD70022'
      }}>
        {loading ? (
          <div style={{
            margin:'70px auto', border:'5px solid #444',
            borderTop:'5px solid #FFD700', width:58, height:58,
            borderRadius:'50%', animation:'spin 1.1s linear infinite'
          }}/>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid stroke="#2a353b" />
              <XAxis dataKey="resource" stroke="#FFD700" fontSize={15} />
              <YAxis stroke="#FFD700" fontSize={15} />
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={{ background:'#232a2e', border:'1.6px solid #FFD700' }}
                labelStyle={{ color:'#FFD700', fontWeight:700 }}
                itemStyle={{ color:'#fff' }}
              />
              <Legend wrapperStyle={{ color:'#FFD700' }} />
              <ReferenceLine y={100} stroke="#1de682" label="100%" strokeDasharray="3 3" />
              <Bar dataKey="planned" fill="#FFD700" name="Planned">
                <LabelList dataKey="planned" position="top" fill="#FFD700" />
              </Bar>
              <Bar dataKey="actual" fill="#1de682" name="Actual">
                <LabelList dataKey="actual" position="top" fill="#1de682" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini Heatmap Legend */}
      <div style={{marginTop:22, textAlign:'center'}}>
        <span style={{color:'#FFD700', fontWeight:700}}>Legend: </span>
        <span style={legendBox('#1de682')}>Efficient</span>
        <span style={legendBox('#FFD700')}>Planned</span>
        <span style={legendBox('#ff6b6b')}>Over</span>
        <span style={legendBox('#57a0ff')}>Under</span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button[title] {
          background:#333; color:#FFD700; border:none; padding:7px 10px;
          border-radius:7px; cursor:pointer; font-size:19px;
          margin:0 2px; box-shadow:0 1px 7px #FFD70023;
        }
        button[title]:hover { background:#FFD700; color:#232a2e; }
      `}</style>
    </div>
  );
}
