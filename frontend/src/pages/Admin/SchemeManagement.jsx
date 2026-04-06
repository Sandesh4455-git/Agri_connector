import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8080/api/admin';
const getToken = () => localStorage.getItem('agri_connect_token');
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const SchemeManagement = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, ok = true) => { setToast({ text, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/schemes`, { headers: H() });
      const d = await r.json();
      if (d.success) setSchemes(d.data || []);
      else showToast(d.message || 'Load failed', false);
    } catch { showToast('Network error', false); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ name: '', description: '', category: 'income', eligibility: 'All farmers', budget: '', endDate: '', status: 'active', officialLink: '' });
    setModal(true);
  };

  const openEdit = (s) => {
    setForm({
      id: s.id,
      name: s.title || s.name || '',
      description: s.description || '',
      category: s.category || 'income',
      eligibility: s.eligibility || '',
      budget: s.subsidy || s.budget || '',
      endDate: s.deadline || s.endDate || '',
      status: s.status || 'active',
      officialLink: s.officialLink || '',
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const isEdit = !!form.id;
      const payload = {
        name: form.name, title: form.name,
        description: form.description, category: form.category,
        eligibility: form.eligibility,
        budget: form.budget, subsidy: form.budget,
        endDate: form.endDate, deadline: form.endDate,
        status: form.status, officialLink: form.officialLink,
      };
      const r = await fetch(isEdit ? `${API}/schemes/${form.id}` : `${API}/schemes`, {
        method: isEdit ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(payload)
      });
      const d = await r.json();
      if (d.success) { showToast(isEdit ? 'Updated!' : 'Created!'); setModal(false); load(); }
      else showToast(d.message, false);
    } catch { showToast('Save failed', false); }
    finally { setSaving(false); }
  };

  const del = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const r = await fetch(`${API}/schemes/${id}`, { method: 'DELETE', headers: H() });
    const d = await r.json();
    if (d.success) { showToast('Deleted'); setSchemes(prev => prev.filter(s => s.id !== id)); }
    else showToast(d.message, false);
  };

  const getTitle    = s => s.title || s.name || '—';
  const getBudget   = s => s.subsidy || s.budget || '—';
  const getDeadline = s => s.deadline || s.endDate || '—';

  const filtered = schemes.filter(s =>
    getTitle(s).toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const catColors = {
    income: { bg: '#eff6ff', c: '#2563eb' }, crop: { bg: '#f0fdf4', c: '#16a34a' },
    irrigation: { bg: '#ecfeff', c: '#0891b2' }, insurance: { bg: '#fef9c3', c: '#a16207' },
    subsidy: { bg: '#f3e8ff', c: '#7c3aed' }, loan: { bg: '#fff7ed', c: '#ea580c' },
    general: { bg: '#f9fafb', c: '#374151' }
  };
  const getCatColor = cat => catColors[cat] || catColors.general;

  const inp = (label, k, type = 'text', opts, full) => (
    <div style={{ marginBottom: 12, gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={lbl}>{label}</label>
      {opts ? (
        <select value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inputS}>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} rows={3} style={{ ...inputS, resize: 'vertical' }} />
      ) : (
        <input type={type} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inputS} />
      )}
    </div>
  );

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        * { box-sizing: border-box; }

        .sch-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        @media (min-width: 480px) {
          .sch-header { align-items: center; }
        }

        .sch-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 540px) {
          .sch-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .sch-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .sch-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 480px) {
          .sch-form-grid { grid-template-columns: 1fr 1fr; gap: 0 12px; }
        }

        .modal-inner {
          background: white;
          border-radius: 18px;
          padding: 22px 18px;
          width: 100%;
          max-width: 540px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,.3);
        }
        @media (min-width: 580px) {
          .modal-inner { padding: 28px; }
        }

        @media (min-width: 768px) {
          .sch-page { padding: 24px !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: toast.ok ? '#dcfce7' : '#fee2e2', color: toast.ok ? '#15803d' : '#dc2626', border: `1.5px solid ${toast.ok ? '#86efac' : '#fca5a5'}`, animation: 'fi .2s', boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.ok ? '✅' : '❌'} {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="sch-header">
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(17px, 4vw, 22px)', fontWeight: 800, color: '#111' }}>📋 Scheme Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{schemes.length} total schemes</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={btnSec}>🔄 Refresh</button>
          <button onClick={openAdd} style={btnPri}>+ Add Scheme</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>🔍</span>
        <input
          placeholder="Search by name, description, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, minWidth: 0, background: 'transparent' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 40, margin: '0 0 12px' }}>📋</p>
          <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>No schemes found</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Click "+ Add Scheme" to create the first one</p>
        </div>
      ) : (
        <div className="sch-grid">
          {filtered.map(s => {
            const cc = getCatColor(s.category);
            return (
              <div key={s.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111', flex: 1, lineHeight: 1.3 }}>{getTitle(s)}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: 20, background: s.status === 'active' ? '#dcfce7' : '#fee2e2', color: s.status === 'active' ? '#16a34a' : '#dc2626', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {s.status === 'active' ? '🟢 Active' : '🔴 Closed'}
                  </span>
                </div>

                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280', lineHeight: 1.5, flex: 1 }}>
                  {(s.description || '').length > 100 ? s.description.slice(0, 100) + '...' : s.description || '—'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f9fafb', borderRadius: 10, padding: 10, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>📂 Category</p>
                    <span style={{ padding: '2px 7px', borderRadius: 20, background: cc.bg, color: cc.c, fontSize: 10, fontWeight: 700 }}>{s.category || '—'}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>💰 Subsidy</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0 }}>{getBudget(s)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>👤 Eligibility</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0 }}>{s.eligibility || '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>📅 Deadline</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0 }}>{getDeadline(s)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(s)} style={{ flex: 1, padding: '8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
                  <button onClick={() => del(s.id, getTitle(s))} style={{ flex: 1, padding: '8px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, overflowY: 'auto' }}>
          <div className="modal-inner">
            <h2 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 800 }}>{form.id ? '✏️ Edit Scheme' : '➕ Add Government Scheme'}</h2>
            <form onSubmit={save}>
              <div style={{ gridColumn: '1 / -1', marginBottom: 12 }}>
                <label style={lbl}>Scheme Name *</label>
                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. PM-KISAN, PM Fasal Bima" style={inputS} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Description *</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required style={{ ...inputS, resize: 'vertical' }} />
              </div>
              <div className="sch-form-grid">
                {inp('Category', 'category', '', [
                  { v: 'income', l: '💵 Income Support' }, { v: 'crop', l: '🌾 Crop Support' },
                  { v: 'irrigation', l: '💧 Irrigation' }, { v: 'insurance', l: '🛡 Insurance' },
                  { v: 'subsidy', l: '💰 Subsidy' }, { v: 'loan', l: '🏦 Loan' }, { v: 'general', l: '📋 General' },
                ])}
                {inp('Status', 'status', '', [{ v: 'active', l: '🟢 Active' }, { v: 'closed', l: '🔴 Closed' }])}
                {inp('Subsidy / Budget', 'budget')}
                {inp('Deadline', 'endDate', 'date')}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Eligibility</label>
                <input value={form.eligibility || ''} onChange={e => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. All landholding farmers" style={inputS} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Official Link</label>
                <input value={form.officialLink || ''} onChange={e => setForm({ ...form, officialLink: e.target.value })} placeholder="https://..." type="url" style={inputS} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '11px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1, fontSize: 14 }}>
                  {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const btnPri = { padding: '8px 16px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnSec = { padding: '8px 14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' };
const lbl = { fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4 };
const inputS = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: 'system-ui,sans-serif' };

export default SchemeManagement;