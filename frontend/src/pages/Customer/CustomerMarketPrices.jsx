// src/pages/Customer/CustomerMarketPrices.jsx
import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:8080/api/market-prices';

const STATES = [
  'Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh',
  'Madhya Pradesh', 'Rajasthan', 'Karnataka', 'Andhra Pradesh',
  'Tamil Nadu', 'West Bengal', 'Bihar'
];
const S = {
  page: {
    padding: '20px',
    background: '#f9fafb',
    minHeight: '100vh'
  }
};

export default function CustomerMarketPrices() {
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
        @keyframes spin { to { transform: rotate(360deg) } }

        /* Stats grid */
        .mp-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }
        @media (max-width: 900px) {
          .mp-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .mp-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
        }

        /* Filter row */
        .mp-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          align-items: center;
        }
        .mp-search {
          flex: 1 1 180px;
          min-width: 0;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
        }
        .mp-select {
          flex: 1 1 130px;
          min-width: 0;
          padding: 10px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          background: white;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .mp-select { flex: 1 1 100%; }
        }

        /* Header */
        .mp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .mp-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .mp-title {
          font-size: clamp(18px, 5vw, 24px);
          font-weight: 800;
          color: #1a4a08;
        }

        /* Stat card */
        .mp-stat-card {
          background: white;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          border: 1px solid #f0f0f0;
        }
        .mp-stat-value {
          font-size: clamp(16px, 3vw, 22px);
          font-weight: 800;
          color: #1a4a08;
        }

        /* Table */
        .mp-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          border: 1px solid #e5e7eb;
        }

        /* Mobile card view */
        .mp-cards {
          display: none;
          flex-direction: column;
          gap: 10px;
        }
        .mp-row-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 14px;
        }
        @media (max-width: 640px) {
          .mp-table-wrap { display: none; }
          .mp-cards { display: flex; }
        }

        /* Refresh / export buttons */
        .mp-refresh-btn {
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 8px 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .mp-export-btn {
          background: #1a4a08;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .mp-export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .mp-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div className="mp-header">
        <div>
          <div className="mp-title">📊 Market Prices</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>Live APMC mandi prices across India</div>
          {lastUpdated && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              🕐 Last updated: {lastUpdated} • Source: AGMARKNET / data.gov.in
            </div>
          )}
        </div>
        <div className="mp-actions">
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
            🟢 Live
          </div>
          <button onClick={fetchData} className="mp-refresh-btn" disabled={loading}>
            {loading ? '⏳ Loading…' : '🔄 Refresh'}
          </button>
          <button onClick={exportCSV} className="mp-export-btn" disabled={!filtered.length}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mp-stats">
        {[
          { icon: '🌾', label: 'Total Crops Tracked', value: uniqueCrops },
          { icon: '📍', label: 'Markets',              value: uniqueMarkets },
          { icon: '📈', label: 'Avg Modal Price',      value: `₹${avgModal.toLocaleString()}` },
          { icon: '🏆', label: 'Highest Price',        value: `₹${highestPrice.toLocaleString()}` },
        ].map((s, i) => (
          <div key={i} className="mp-stat-card">
            <span style={{ fontSize: 26, flexShrink: 0 }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div className="mp-stat-value">{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mp-filters">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search crop, variety, market, district..."
          className="mp-search"
        />
        <select value={state} onChange={e => setState(e.target.value)} className="mp-select">
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="mp-select">
          <option value="modal_desc">Modal Price ↓</option>
          <option value="modal_asc">Modal Price ↑</option>
        </select>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {filtered.length} records
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#6b7280', marginTop: 12 }}>Loading market prices…</div>
        </div>
      )}

      {/* No data */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <div style={{ fontSize: 48 }}>🌾</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 8 }}>No data found</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Try changing state or search filter</div>
        </div>
      )}

      {/* ── Desktop Table ── */}
      {!loading && filtered.length > 0 && (
        <div className="mp-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f0fdf4' }}>
                {['Commodity','Variety','Grade','District','Market','Min ₹','Max ₹','Modal ₹','Date'].map(h => (
                  <th key={h} style={{ padding: '13px 14px', textAlign: 'left', fontWeight: 700, color: '#1a4a08', borderBottom: '2px solid #d1fae5', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
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
                const td = { padding: '11px 14px', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' };
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ ...td, fontWeight: 700, color: '#1a4a08' }}>{r.Commodity || '-'}</td>
                    <td style={td}>{r.Variety  || '-'}</td>
                    <td style={td}>{r.Grade    || '-'}</td>
                    <td style={td}>{r.District || '-'}</td>
                    <td style={td}>{r.Market   || '-'}</td>
                    <td style={{ ...td, color: '#2563eb' }}>₹{min.toLocaleString()}</td>
                    <td style={{ ...td, color: '#dc2626' }}>₹{max.toLocaleString()}</td>
                    <td style={{ ...td, fontWeight: 700 }}>
                      <span style={{ color: trendColor }}>{trend}</span> ₹{modal.toLocaleString()}
                    </td>
                    <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>{r.Arrival_Date || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile Cards (shown below 640px instead of table) ── */}
      {!loading && filtered.length > 0 && (
        <div className="mp-cards">
          {filtered.map((r, i) => {
            const modal = parseFloat(r.Modal_Price) || 0;
            const min   = parseFloat(r.Min_Price)   || 0;
            const max   = parseFloat(r.Max_Price)   || 0;
            const trend = modal >= (min + max) / 2 ? '↑' : '↓';
            const trendColor = trend === '↑' ? '#16a34a' : '#dc2626';
            return (
              <div key={i} className="mp-row-card">
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#1a4a08' }}>{r.Commodity || '-'}</span>
                    {r.Variety && r.Variety !== '-' && (
                      <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 6 }}>{r.Variety}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: trendColor }}>
                    {trend} ₹{modal.toLocaleString()}
                  </span>
                </div>
                {/* Details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: '#6b7280' }}>
                  {r.Market   && <span>📍 {r.Market}</span>}
                  {r.District && <span>🗺 {r.District}</span>}
                  {r.Grade    && r.Grade !== '-' && <span>Grade: {r.Grade}</span>}
                  {r.Arrival_Date && <span>📅 {r.Arrival_Date}</span>}
                </div>
                {/* Price strip */}
                <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>MIN</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>₹{min.toLocaleString()}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>MODAL</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: trendColor }}>{trend} ₹{modal.toLocaleString()}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>MAX</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>₹{max.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}