import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8080/api/admin';
const getToken = () => localStorage.getItem('agri_connect_token');
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const MarketPriceManagement = () => {
  const [prices,  setPrices]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (text, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/market-prices`, { headers: H() });
      const d = await r.json();
      if (d.success) setPrices(d.data || []);
      else showToast(d.message || 'Load failed', false);
    } catch { showToast('Network error', false); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ crop: '', category: 'Grain', currentPrice: '', change: '0', trend: 'stable', unit: 'quintal', market: '', region: '', demand: 'medium', prediction: '' });
    setModal(true);
  };
  const openEdit = (p) => { setForm({ ...p, price: p.currentPrice }); setModal(true); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const isEdit = !!form.id;
      const payload = { ...form, price: form.currentPrice || form.price };
      const r = await fetch(isEdit ? `${API}/market-prices/${form.id}` : `${API}/market-prices`, {
        method: isEdit ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(payload)
      });
      const d = await r.json();
      if (d.success) { showToast(isEdit ? 'Updated!' : 'Added!'); setModal(false); load(); }
      else showToast(d.message, false);
    } catch { showToast('Save failed', false); }
    finally { setSaving(false); }
  };

  const del = async (id, crop) => {
    if (!window.confirm(`Delete ${crop} price entry?`)) return;
    const r = await fetch(`${API}/market-prices/${id}`, { method: 'DELETE', headers: H() });
    const d = await r.json();
    if (d.success) { showToast('Deleted'); setPrices(prev => prev.filter(p => p.id !== id)); }
    else showToast(d.message, false);
  };

  const trendIcon  = t => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️';
  const trendColor = t => t === 'up' ? '#16a34a' : t === 'down' ? '#dc2626' : '#6b7280';
  const demandBg   = d => d === 'high' ? { bg: '#dcfce7', c: '#16a34a' } : d === 'low' ? { bg: '#fee2e2', c: '#dc2626' } : { bg: '#fef9c3', c: '#a16207' };

  const filtered = prices.filter(p =>
    (p.crop   || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.market || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.region || '').toLowerCase().includes(search.toLowerCase())
  );

  const F = ({ label, k, type = 'text', opts }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={lbl}>{label}</label>
      {opts ? (
        <select value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inputS}>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k] !== undefined ? form[k] : ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inputS} />
      )}
    </div>
  );

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fi { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }

        /* ── Header ── */
        .mpm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .mpm-header-btns { display: flex; gap: 8px; flex-shrink: 0; }

        /* ── TABLE view (≥ 600px) ── */
        .mpm-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: white;
        }
        .mpm-table-wrap::-webkit-scrollbar { height: 4px; }
        .mpm-table-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
        .mpm-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
        .mpm-table thead tr { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
        .mpm-table th { padding: 11px 13px; text-align: left; font-weight: 700; color: #374151; font-size: 12px; white-space: nowrap; }
        .mpm-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background .15s; }
        .mpm-table tbody tr:nth-child(even) td { background: #fafafa; }
        .mpm-table tbody tr:hover td { background: #f9fafb; }
        .mpm-table td { padding: 11px 13px; }

        /* ── CARD view (< 600px) ── */
        .mpm-cards { display: flex; flex-direction: column; gap: 10px; }
        .mpm-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          padding: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
          animation: fi .2s;
        }
        .mpm-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 10px;
          gap: 8px;
        }
        .mpm-card-crop { font-size: 15px; font-weight: 800; color: #111; }
        .mpm-card-cat  { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .mpm-card-price { font-size: 17px; font-weight: 800; color: #059669; text-align: right; }
        .mpm-card-unit  { font-size: 10px; color: #9ca3af; }
        .mpm-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 10px;
          margin-bottom: 12px;
        }
        .mpm-card-field label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .04em; display: block; margin-bottom: 2px; }
        .mpm-card-field span  { font-size: 12px; color: #374151; }
        .mpm-card-actions { display: flex; gap: 8px; }
        .mpm-badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }

        /* ── Responsive switch ── */
        .mpm-table-wrap { display: block; }
        .mpm-cards      { display: none; }
        @media (max-width: 599px) {
          .mpm-table-wrap { display: none; }
          .mpm-cards      { display: flex; }
        }

        /* ── Modal form grid ── */
        .form-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 480px) { .form-grid { grid-template-columns: 1fr 1fr; gap: 0 12px; } }

        /* ── Modal inner ── */
        .modal-inner {
          background: white;
          border-radius: 18px;
          padding: 20px 16px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,.3);
        }
        @media (min-width: 480px) { .modal-inner { padding: 28px; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: toast.ok ? '#dcfce7' : '#fee2e2', color: toast.ok ? '#15803d' : '#dc2626', border: `1.5px solid ${toast.ok ? '#86efac' : '#fca5a5'}`, animation: 'fi .2s', boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.ok ? '✅' : '❌'} {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="mpm-header">
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(17px, 4vw, 22px)', fontWeight: 800, color: '#111' }}>📊 Market Price Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{prices.length} price entries</p>
        </div>
        <div className="mpm-header-btns">
          <button onClick={load} style={btnSec}>🔄 Refresh</button>
          <button onClick={openAdd} style={btnPri}>+ Add Price</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>🔍</span>
        <input
          placeholder="Search crop, market, region..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', minWidth: 0 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, lineHeight: 1 }}>×</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <p style={{ fontSize: 30, margin: '0 0 8px' }}>📊</p>
          <p style={{ fontWeight: 700, margin: '0 0 4px', color: '#374151' }}>No price entries yet</p>
          <p style={{ fontSize: 12, margin: 0 }}>Click "+ Add Price" to get started</p>
        </div>
      ) : (
        <>
          {/* ── TABLE (≥ 600px) ── */}
          <div className="mpm-table-wrap">
            <table className="mpm-table">
              <thead>
                <tr>
                  {['Crop','Category','Price/Quintal','Change','Trend','Market','Region','Demand','Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const dc = demandBg(p.demand);
                  const changeVal = p.change || 0;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{p.crop}</td>
                      <td style={{ color: '#6b7280' }}>{p.category || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
                        ₹{p.currentPrice ? Number(p.currentPrice).toLocaleString('en-IN') : '—'}/{p.unit || 'q'}
                      </td>
                      <td style={{ fontWeight: 700, color: changeVal >= 0 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                        {changeVal >= 0 ? '+' : ''}{changeVal}%
                      </td>
                      <td style={{ color: trendColor(p.trend), whiteSpace: 'nowrap' }}>{trendIcon(p.trend)} {p.trend || '—'}</td>
                      <td style={{ color: '#374151' }}>{p.market || '—'}</td>
                      <td style={{ color: '#6b7280' }}>{p.region || '—'}</td>
                      <td>
                        <span className="mpm-badge" style={{ background: dc.bg, color: dc.c }}>{p.demand || '—'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ padding: '5px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️</button>
                          <button onClick={() => del(p.id, p.crop)} style={{ padding: '5px 10px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── CARDS (< 600px) ── */}
          <div className="mpm-cards">
            {filtered.map((p) => {
              const dc = demandBg(p.demand);
              const changeVal = p.change || 0;
              return (
                <div key={p.id} className="mpm-card">
                  <div className="mpm-card-top">
                    <div>
                      <div className="mpm-card-crop">{p.crop}</div>
                      <div className="mpm-card-cat">{p.category || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mpm-card-price">
                        ₹{p.currentPrice ? Number(p.currentPrice).toLocaleString('en-IN') : '—'}
                      </div>
                      <div className="mpm-card-unit">per {p.unit || 'quintal'}</div>
                    </div>
                  </div>

                  <div className="mpm-card-grid">
                    <div className="mpm-card-field">
                      <label>Change</label>
                      <span style={{ color: changeVal >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        {changeVal >= 0 ? '+' : ''}{changeVal}%
                      </span>
                    </div>
                    <div className="mpm-card-field">
                      <label>Trend</label>
                      <span style={{ color: trendColor(p.trend) }}>{trendIcon(p.trend)} {p.trend || '—'}</span>
                    </div>
                    <div className="mpm-card-field">
                      <label>Market</label>
                      <span>{p.market || '—'}</span>
                    </div>
                    <div className="mpm-card-field">
                      <label>Region</label>
                      <span>{p.region || '—'}</span>
                    </div>
                    <div className="mpm-card-field">
                      <label>Demand</label>
                      <span className="mpm-badge" style={{ background: dc.bg, color: dc.c }}>{p.demand || '—'}</span>
                    </div>
                  </div>

                  <div className="mpm-card-actions">
                    <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
                    <button onClick={() => del(p.id, p.crop)} style={{ flex: 1, padding: '8px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🗑️ Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, overflowY: 'auto' }}>
          <div className="modal-inner">
            <h2 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 800 }}>
              {form.id ? '✏️ Edit Price' : '➕ Add Market Price'}
            </h2>
            <form onSubmit={save}>
              <div className="form-grid">
                <F label="Crop Name *" k="crop" />
                <F label="Category" k="category" opts={[
                  { v: 'Grain',     l: '🌾 Grain'     },
                  { v: 'Vegetable', l: '🥦 Vegetable' },
                  { v: 'Fruit',     l: '🍎 Fruit'     },
                  { v: 'Spice',     l: '🌶 Spice'     },
                  { v: 'Pulse',     l: '🫘 Pulse'     },
                  { v: 'Other',     l: '📦 Other'     },
                ]} />
                <F label="Current Price (₹) *" k="currentPrice" type="number" />
                <F label="Price Change (%)" k="change" type="number" />
                <F label="Unit" k="unit" opts={[
                  { v: 'quintal', l: 'Quintal' },
                  { v: 'kg',      l: 'Kg'      },
                  { v: 'ton',     l: 'Ton'     },
                  { v: 'dozen',   l: 'Dozen'   },
                ]} />
                <F label="Trend" k="trend" opts={[
                  { v: 'up',     l: '📈 Up'     },
                  { v: 'down',   l: '📉 Down'   },
                  { v: 'stable', l: '➡️ Stable' },
                ]} />
                <F label="Market/Mandi *" k="market" />
                <F label="Region/State"  k="region" />
                <F label="Demand" k="demand" opts={[
                  { v: 'high',   l: '🔥 High'   },
                  { v: 'medium', l: '🟡 Medium' },
                  { v: 'low',    l: '❄️ Low'    },
                ]} />
                <F label="Prediction" k="prediction" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: 11, background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, background: 'linear-gradient(135deg,#059669,#10b981)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1, fontSize: 14 }}>
                  {saving ? 'Saving...' : form.id ? 'Update' : 'Add Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const btnPri = { padding: '9px 16px', background: 'linear-gradient(135deg,#059669,#10b981)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnSec = { padding: '9px 14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' };
const lbl    = { fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4 };
const inputS = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: 'system-ui, sans-serif', transition: 'border-color .2s' };

export default MarketPriceManagement;