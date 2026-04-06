// src/pages/Farmer/FarmerMarketPrices.jsx
import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:8080/api/market-prices';

const STATES = [
  'Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh',
  'Madhya Pradesh', 'Rajasthan', 'Karnataka', 'Andhra Pradesh',
  'Tamil Nadu', 'West Bengal', 'Bihar'
];

export default function FarmerMarketPrices() {
  const [records, setRecords]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [state, setState]             = useState('Maharashtra');
  const [sortBy, setSortBy]           = useState('modal_desc');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}?state=${encodeURIComponent(state)}&limit=200`);
      const json = await res.json();
      const data = json.records || [];
      setRecords(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setError('Failed to load market prices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    let data = [...records];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        (r.Commodity || '').toLowerCase().includes(q) ||
        (r.Market    || '').toLowerCase().includes(q) ||
        (r.Variety   || '').toLowerCase().includes(q) ||
        (r.District  || '').toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const aV = parseFloat(a.Modal_Price) || 0;
      const bV = parseFloat(b.Modal_Price) || 0;
      return sortBy === 'modal_desc' ? bV - aV : aV - bV;
    });
    setFiltered(data);
  }, [records, search, sortBy]);

  const uniqueCrops   = [...new Set(filtered.map(r => r.Commodity).filter(Boolean))].length;
  const uniqueMarkets = [...new Set(filtered.map(r => r.Market).filter(Boolean))].length;
  const avgModal = filtered.length
    ? Math.round(filtered.reduce((s, r) => s + (parseFloat(r.Modal_Price) || 0), 0) / filtered.length)
    : 0;
  const highestPrice = filtered.length
    ? Math.max(...filtered.map(r => parseFloat(r.Modal_Price) || 0))
    : 0;

  const exportCSV = () => {
    const headers = ['State','District','Market','Commodity','Variety','Grade','Min Price','Max Price','Modal Price','Date'];
    const rows = filtered.map(r => [
      r.State, r.District, r.Market, r.Commodity, r.Variety, r.Grade,
      r.Min_Price, r.Max_Price, r.Modal_Price, r.Arrival_Date
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `market-prices-${state}.csv`;
    a.click();
  };

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .mp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .mp-header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .mp-stats-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 640px) {
          .mp-stats-row {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .mp-filter-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .mp-search {
          flex: 1;
          min-width: 160px;
          padding: 9px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13px;
          outline: none;
        }
        .mp-select {
          padding: 9px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13px;
          outline: none;
          background: white;
          cursor: pointer;
        }
        .mp-table-wrap {
          overflow-x: auto;
          border-radius: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          border: 1px solid #e5e7eb;
          -webkit-overflow-scrolling: touch;
        }
        .mp-stat-card {
          background: white;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          border: 1px solid #f0f0f0;
        }
      `}</style>

      {/* Header */}
      <div className="mp-header">
        <div>
          <div style={S.title}>📊 Market Prices</div>
          <div style={S.subtitle}>Live APMC mandi prices across India</div>
          {lastUpdated && <div style={S.updated}>🕐 Last updated: {lastUpdated} • Source: AGMARKNET / data.gov.in</div>}
        </div>
        <div className="mp-header-actions">
          <div style={S.liveBadge}>🟢 Live</div>
          <button onClick={fetchData} style={S.refreshBtn} disabled={loading}>
            {loading ? '⏳' : '🔄'} <span style={{ display: 'none' }}>Refresh</span>
            <span>{loading ? 'Loading…' : 'Refresh'}</span>
          </button>
          <button onClick={exportCSV} style={S.exportBtn} disabled={!filtered.length}>
            📥 CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mp-stats-row">
        {[
          { icon: '🌾', label: 'Crops Tracked', value: uniqueCrops },
          { icon: '📍', label: 'Markets',        value: uniqueMarkets },
          { icon: '📈', label: 'Avg Modal',      value: `₹${avgModal.toLocaleString()}` },
          { icon: '🏆', label: 'Highest',        value: `₹${highestPrice.toLocaleString()}` },
        ].map((s, i) => (
          <div key={i} className="mp-stat-card">
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={S.statValue}>{s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mp-filter-row">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search crop, market, district..."
          className="mp-search"
        />
        <select value={state} onChange={e => setState(e.target.value)} className="mp-select">
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="mp-select">
          <option value="modal_desc">Price ↓</option>
          <option value="modal_asc">Price ↑</option>
        </select>
        <span style={S.recordCount}>{filtered.length} records</span>
      </div>

      {/* Error */}
      {error && <div style={S.error}>⚠️ {error}</div>}

      {/* Loading */}
      {loading && (
        <div style={S.center}>
          <div style={S.spinner} />
          <div style={{ color: '#6b7280', marginTop: 12, fontSize: 13 }}>Loading market prices…</div>
        </div>
      )}

      {/* No data */}
      {!loading && !error && filtered.length === 0 && (
        <div style={S.center}>
          <div style={{ fontSize: 44 }}>🌾</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 8 }}>No data found</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Try changing state or search filter</div>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="mp-table-wrap">
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                {['Commodity', 'Variety', 'Grade', 'District', 'Market', 'Min ₹', 'Max ₹', 'Modal ₹', 'Date'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const modal = parseFloat(r.Modal_Price) || 0;
                const min   = parseFloat(r.Min_Price)   || 0;
                const max   = parseFloat(r.Max_Price)   || 0;
                const trend = modal >= (min + max) / 2 ? '↑' : '↓';
                const trendColor = trend === '↑' ? '#16a34a' : '#dc2626';
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ ...S.td, fontWeight: 700, color: '#1a4a08' }}>{r.Commodity || '-'}</td>
                    <td style={S.td}>{r.Variety  || '-'}</td>
                    <td style={S.td}>{r.Grade    || '-'}</td>
                    <td style={S.td}>{r.District || '-'}</td>
                    <td style={S.td}>{r.Market   || '-'}</td>
                    <td style={{ ...S.td, color: '#2563eb' }}>₹{min.toLocaleString()}</td>
                    <td style={{ ...S.td, color: '#dc2626' }}>₹{max.toLocaleString()}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>
                      <span style={{ color: trendColor }}>{trend}</span> ₹{modal.toLocaleString()}
                    </td>
                    <td style={{ ...S.td, color: '#6b7280', fontSize: 11 }}>{r.Arrival_Date || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const S = {
  page:        { padding: 'clamp(12px, 3vw, 24px)', fontFamily: 'system-ui, sans-serif', maxWidth: 1400, boxSizing: 'border-box', width: '100%' },
  title:       { fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#1a4a08' },
  subtitle:    { fontSize: 13, color: '#6b7280', marginTop: 2 },
  updated:     { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  liveBadge:   { background: '#dcfce7', color: '#16a34a', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  refreshBtn:  { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 },
  exportBtn:   { background: '#1a4a08', color: 'white', border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  statValue:   { fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: '#1a4a08' },
  statLabel:   { fontSize: 11, color: '#6b7280', marginTop: 2 },
  recordCount: { fontSize: 12, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' },
  error:       { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13 },
  center:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', color: '#6b7280' },
  spinner:     { width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead:       { background: '#f0fdf4' },
  th:          { padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#1a4a08', borderBottom: '2px solid #d1fae5', whiteSpace: 'nowrap', fontSize: 12 },
  td:          { padding: '10px 14px', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontSize: 12 },
};