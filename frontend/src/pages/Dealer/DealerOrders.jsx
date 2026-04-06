// src/pages/Dealer/DealerOrders.jsx
// Responsive version — works on mobile, tablet, desktop

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search, RefreshCw, Loader2, Send, CheckCircle,
  XCircle, MessageSquare, Download, CreditCard,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

const cropEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('wheat'))                        return '🌾';
  if (n.includes('rice'))                         return '🍚';
  if (n.includes('tomato'))                       return '🍅';
  if (n.includes('potato'))                       return '🥔';
  if (n.includes('cotton'))                       return '🧵';
  if (n.includes('onion'))                        return '🧅';
  if (n.includes('corn') || n.includes('maize'))  return '🌽';
  if (n.includes('sugarcane'))                    return '🎋';
  if (n.includes('soybean'))                      return '🫘';
  return '🌱';
};

// ─────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING:     { color: '#d97706', bg: '#fef3c7', label: 'Pending',     icon: '⏳' },
  ACCEPTED:    { color: '#16a34a', bg: '#dcfce7', label: 'Accepted',    icon: '✅' },
  REJECTED:    { color: '#dc2626', bg: '#fee2e2', label: 'Rejected',    icon: '❌' },
  NEGOTIATING: { color: '#7c3aed', bg: '#ede9fe', label: 'Negotiating', icon: '💬' },
};

// ─────────────────────────────────────────────────────────────
// RESPONSIVE STYLES (injected once)
// ─────────────────────────────────────────────────────────────

const RESPONSIVE_CSS = `
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .do-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .do-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .do-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 18px;
  }
  .do-stat-card {
    background: white;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }

  .do-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    background: white;
    padding: 4px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    width: fit-content;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }

  .do-filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 12px 16px;
    background: white;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 6px rgba(0,0,0,.06);
    margin-bottom: 14px;
  }
  .do-filter-buttons { display: flex; gap: 6px; flex-wrap: wrap; }

  .do-neg-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .do-neg-actions > button { flex: 1; min-width: 100px; justify-content: center; }

  .do-price-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .do-bottom-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 20px;
  }

  /* Tablet */
  @media (max-width: 768px) {
    .do-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .do-bottom-grid { grid-template-columns: repeat(2, 1fr); }
    .do-tabs { width: 100%; }
    .do-tabs > button { flex: 1; }
  }

  /* Mobile */
  @media (max-width: 480px) {
    .do-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .do-stat-card { padding: 10px 12px; }
    .do-stat-card .stat-icon { display: none; }
    .do-bottom-grid { grid-template-columns: 1fr; }
    .do-header { flex-direction: column; }
    .do-header-actions { width: 100%; }
    .do-header-actions > button { flex: 1; justify-content: center; }
    .do-neg-actions > button { flex: 1 0 calc(50% - 4px); }
    .do-filter-bar { flex-direction: column; align-items: stretch; }
    .do-filter-buttons { justify-content: flex-start; }
  }
`;

// ─────────────────────────────────────────────────────────────
// COUNTER OFFER MODAL
// ─────────────────────────────────────────────────────────────

const CounterModal = ({ request, onClose, onSuccess }) => {
  const [price,   setPrice]   = useState(request.counterPrice || request.offeredPrice || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!price) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/requests/${request.id}/dealer-counter?newPrice=${price}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) { onSuccess('✅ Counter offer sent!'); onClose(); }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>💬 Send Counter Offer</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            {cropEmoji(request.crop?.name)} <strong>{request.crop?.name}</strong> •
            Farmer's counter: <strong style={{ color: '#7c3aed' }}>₹{request.counterPrice}/{request.unit}</strong>
          </p>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}>
            YOUR NEW OFFER (₹/{request.unit})
          </label>
          <input
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Enter price..."
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={onClose}
              style={{ flex: 1, minWidth: 100, padding: '11px', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, minWidth: 100, padding: '11px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
              Send Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAY NOW MODAL
// ─────────────────────────────────────────────────────────────

const PayNowModal = ({ deal, onClose, onSuccess }) => {
  const [payLoading, setPayLoading] = useState(false);

  const cropName    = deal.crop?.name || deal.cropName || 'Crop';
  const farmerUser  = deal.farmer?.username || deal.farmerUsername || '';
  const amount      = deal.totalAmount || 0;
  const qty         = deal.quantity    || 0;
  const unit        = deal.unit        || 'kg';
  const agreedPrice = deal.agreedPrice || deal.price || 0;

  const handleOnline = async () => {
    setPayLoading(true);
    try {
      const res  = await fetch(`${API}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          toUsername: farmerUser, amount, cropName,
          quantity: qty, unit, description: `Payment for ${cropName} deal #${deal.id}`,
        }),
      });
      const data = await res.json();
      if (!data.success) { onSuccess('❌ ' + data.message, 'error'); setPayLoading(false); return; }

      const { txnId, productInfo, merchantKey, hash, payuUrl, surl, furl } = data.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuUrl;
      const fields = {
        key: merchantKey, txnid: txnId, amount: data.data.amount.toString(),
        productinfo: productInfo, firstname: 'AgriConnect',
        email: 'noreply@agriconnect.com', phone: '9999999999', surl, furl, hash,
      };
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      onSuccess('❌ Something went wrong', 'error');
      setPayLoading(false);
    }
  };

  const handleCash = async () => {
    setPayLoading(true);
    try {
      const res  = await fetch(`${API}/payments/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          toUsername: farmerUser, amount, cropName,
          quantity: qty, unit, description: `Cash for ${cropName} deal #${deal.id}`,
        }),
      });
      const data = await res.json();
      if (data.success) { onSuccess('✅ Cash payment recorded!'); onClose(); }
      else onSuccess('❌ ' + data.message, 'error');
    } catch { onSuccess('❌ Something went wrong', 'error'); }
    finally { setPayLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,#f0fdf4,#fff)' }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#14532d' }}>💳 Pay for Deal</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9ca3af' }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 32 }}>{cropEmoji(cropName)}</span>
              <div style={{ flex: 1, minWidth: 120 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#14532d', margin: '0 0 2px' }}>{cropName}</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                  To: <strong>{farmerUser}</strong> • {qty} {unit} @ ₹{agreedPrice}/{unit}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Total Amount</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', margin: 0 }}>₹{amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#1d4ed8' }}>
            💳 Online payment redirects to <strong>PayU</strong> — UPI, Card, Net Banking, Wallets supported
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onClose}
              style={{ flex: 1, minWidth: 80, padding: '12px', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Cancel
            </button>
            <button onClick={handleCash} disabled={payLoading}
              style={{ flex: 1, minWidth: 80, padding: '12px', background: '#f0fdf4', color: '#15803d', border: '1.5px solid #86efac', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {payLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : '💵'} Cash
            </button>
            <button onClick={handleOnline} disabled={payLoading}
              style={{ flex: 1, minWidth: 80, padding: '12px', background: 'linear-gradient(135deg,#15803d,#059669)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {payLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={13} />} Pay Online
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

const DealerOrders = () => {
  const { t } = useLanguage();

  const [requests,      setRequests]      = useState([]);
  const [deals,         setDeals]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState('requests');
  const [filter,        setFilter]        = useState('ALL');
  const [search,        setSearch]        = useState('');
  const [toast,         setToast]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [counterModal,  setCounterModal]  = useState(null);
  const [payModal,      setPayModal]      = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [reqRes, dealRes] = await Promise.all([
        fetch(`${API}/requests/dealer`, { headers }),
        fetch(`${API}/deals/dealer`,    { headers }),
      ]);
      const [reqData, dealData] = await Promise.all([reqRes.json(), dealRes.json()]);
      if (reqData.success)  setRequests(reqData.data  || []);
      if (dealData.success) setDeals(dealData.data    || []);
    } catch {
      showMsg('❌ Data load करता आली नाही', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async (id) => {
    setActionLoading(id + '_accept');
    try {
      const res  = await fetch(`${API}/requests/${id}/dealer-accept`, {
        method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) { showMsg('✅ Counter accepted! Deal created.'); fetchAll(); }
      else showMsg('❌ ' + data.message, 'error');
    } catch { showMsg('❌ Error', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id) => {
    setActionLoading(id + '_cancel');
    try {
      const res  = await fetch(`${API}/requests/${id}/dealer-cancel`, {
        method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) { showMsg('Request cancelled'); fetchAll(); }
    } catch {}
    finally { setActionLoading(null); }
  };

  const exportCSV = () => {
    const header = ['ID', 'Crop', 'Farmer', 'Qty', 'Unit', 'Offered Price', 'Counter Price', 'Status', 'Date'];
    const rows   = requests.map(r => [
      r.id, r.crop?.name || '-', r.farmer?.username || '-',
      r.quantity, r.unit, r.offeredPrice, r.counterPrice || '-',
      r.status, new Date(r.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'dealer-requests.csv';
    a.click();
  };

  const filteredReqs = requests.filter(r => {
    const matchFilter = filter === 'ALL' || r.status === filter;
    const matchSearch = !search
      || (r.crop?.name     || '').toLowerCase().includes(search.toLowerCase())
      || (r.farmer?.username || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredDeals = deals.filter(d =>
    !search
    || (d.crop?.name || d.cropName || '').toLowerCase().includes(search.toLowerCase())
    || (d.farmerUsername || '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount     = requests.filter(r => r.status === 'PENDING').length;
  const negotiatingCount = requests.filter(r => r.status === 'NEGOTIATING').length;
  const acceptedCount    = requests.filter(r => r.status === 'ACCEPTED').length;
  const activeDeals      = deals.filter(d => (d.status || '').toUpperCase() === 'ACTIVE').length;

  const S = {
    page:  { flex: 1, padding: '20px 16px', background: 'linear-gradient(135deg,#f8fafc,#eff6ff)', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'system-ui,sans-serif' },
    card:  { background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,.06)', padding: 18 },
    btn:   (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: bg, color, border: border || 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }),
    input: { padding: '9px 12px 9px 34px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: 'white', width: '100%', boxSizing: 'border-box' },
  };

  if (loading) return (
    <main style={S.page}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <style>{RESPONSIVE_CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 200, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'white', border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`, color: toast.type === 'success' ? '#15803d' : '#dc2626', boxShadow: '0 8px 30px rgba(0,0,0,.12)', maxWidth: 'calc(100vw - 40px)' }}>
          {toast.text}
        </div>
      )}

      {/* Modals */}
      {counterModal && (
        <CounterModal
          request={counterModal}
          onClose={() => setCounterModal(null)}
          onSuccess={(m) => { showMsg(m); fetchAll(); }}
        />
      )}
      {payModal && (
        <PayNowModal
          deal={payModal}
          onClose={() => setPayModal(null)}
          onSuccess={(m, type) => { showMsg(m, type); fetchAll(); }}
        />
      )}

      {/* Header */}
      <div className="do-header">
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
            {t.purchaseOrders || 'My Requests & Deals'}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            {t.trackManageOrders || 'Track sent requests and negotiate with farmers'}
          </p>
        </div>
        <div className="do-header-actions">
          <button onClick={fetchAll}  style={S.btn('white', '#374151', '1px solid #e5e7eb')}>
            <RefreshCw size={14} /> {t.refresh || 'Refresh'}
          </button>
          <button onClick={exportCSV} style={S.btn('#eff6ff', '#2563eb', '1px solid #bfdbfe')}>
            <Download size={14} /> {t.exportOrders || 'Export'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="do-stats-grid">
        {[
          { label: t.pending      || 'Pending',      value: pendingCount,     color: '#d97706', bg: '#fef3c7', icon: '⏳' },
          { label: t.negotiating  || 'Negotiating',  value: negotiatingCount, color: '#7c3aed', bg: '#ede9fe', icon: '💬' },
          { label: t.accepted     || 'Accepted',     value: acceptedCount,    color: '#16a34a', bg: '#dcfce7', icon: '✅' },
          { label: t.activeDeals  || 'Active Deals', value: activeDeals,      color: '#2563eb', bg: '#dbeafe', icon: '🤝' },
        ].map((s, i) => (
          <div key={i} className="do-stat-card">
            <div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
            <div className="stat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="do-tabs">
        {[
          { key: 'requests', label: `📋 ${t.myRequests || 'Requests'}`, count: requests.length },
          { key: 'deals',    label: `🤝 ${t.deals      || 'Deals'}`,    count: deals.length    },
        ].map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: tab === tb.key ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : 'transparent', color: tab === tb.key ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {tb.label}
            <span style={{ fontSize: 11, background: tab === tb.key ? 'rgba(255,255,255,.25)' : '#e5e7eb', color: tab === tb.key ? 'white' : '#9ca3af', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
              {tb.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="do-filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            style={S.input}
            placeholder={t.searchOrders || 'Search by crop or farmer...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {tab === 'requests' && (
          <div className="do-filter-buttons">
            {['ALL', 'PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#dbeafe' : '#f9fafb', color: filter === f ? '#1d4ed8' : '#6b7280', outline: filter === f ? '1.5px solid #93c5fd' : 'none', whiteSpace: 'nowrap' }}>
                {f === 'ALL' ? (t.all || 'All') : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── REQUESTS TAB ── */}
      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredReqs.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: 48 }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>📋</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
                {t.noRequestsFound || 'No requests found'}
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                {t.goToMarketplace || 'Go to Marketplace to send requests to farmers'}
              </p>
            </div>
          ) : filteredReqs.map(req => {
            const sc         = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            const isNeg      = req.status === 'NEGOTIATING';
            const isPending  = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const cropName   = req.crop?.name || 'Crop';
            const farmerName = req.farmer?.username || req.farmer?.name || '—';

            return (
              <div key={req.id} style={{ ...S.card, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {cropEmoji(cropName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{cropName}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>
                      {t.farmer || 'Farmer'}: <strong style={{ color: '#374151' }}>{farmerName}</strong> •
                      {req.quantity} {req.unit} •
                      <span style={{ color: '#9ca3af', marginLeft: 4 }}>
                        {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </p>
                    <div className="do-price-row">
                      <div>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>{t.yourOffer || 'Your Offer'}</p>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', margin: 0 }}>₹{req.offeredPrice}/{req.unit}</p>
                      </div>
                      {req.counterPrice && (
                        <div>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Farmer's Counter</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#7c3aed', margin: 0 }}>₹{req.counterPrice}/{req.unit}</p>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>{t.totalValue || 'Total Value'}</p>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#15803d', margin: 0 }}>
                          ₹{((req.counterPrice || req.offeredPrice) * req.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    {req.message && (
                      <div style={{ marginTop: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#6b7280', border: '1px solid #e5e7eb' }}>
                        💬 {req.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* NEGOTIATING */}
                {isNeg && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fdf4ff', borderRadius: 10, border: '1px solid #e9d5ff' }}>
                    <p style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700, margin: '0 0 8px' }}>
                      💬 Farmer ने counter offer पाठवला: <strong>₹{req.counterPrice}/{req.unit}</strong>
                    </p>
                    <div className="do-neg-actions">
                      <button onClick={() => handleAcceptCounter(req.id)} disabled={actionLoading === req.id + '_accept'}
                        style={{ flex: 1, minWidth: 100, padding: '9px 12px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {actionLoading === req.id + '_accept' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                        Accept ₹{req.counterPrice}
                      </button>
                      <button onClick={() => setCounterModal(req)}
                        style={{ flex: 1, minWidth: 100, padding: '9px 12px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <MessageSquare size={13} /> {t.counterOffer || 'Counter Offer'}
                      </button>
                      <button onClick={() => handleCancel(req.id)} disabled={actionLoading === req.id + '_cancel'}
                        style={{ flex: 1, minWidth: 80, padding: '9px 12px', background: 'white', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <XCircle size={13} /> {t.cancel || 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* PENDING */}
                {isPending && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160, padding: '8px 12px', background: '#fef3c7', borderRadius: 9, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                      ⏳ Farmer च्या response ची वाट पाहत आहे...
                    </div>
                    <button onClick={() => handleCancel(req.id)} disabled={actionLoading === req.id + '_cancel'}
                      style={{ padding: '8px 14px', background: 'white', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <XCircle size={13} /> {t.cancel || 'Cancel'}
                    </button>
                  </div>
                )}

                {/* ACCEPTED */}
                {isAccepted && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#dcfce7', borderRadius: 9, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                    ✅ Request accepted! Deal created — "Deals" tab मध्ये बघा.
                  </div>
                )}

                {/* REJECTED */}
                {req.status === 'REJECTED' && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#fee2e2', borderRadius: 9, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                    ❌ Request rejected by farmer.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DEALS TAB ── */}
      {tab === 'deals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredDeals.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: 48 }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🤝</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
                {t.noDealsYet || 'No deals yet'}
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                Farmer ने request accept केल्यावर deal create होईल
              </p>
            </div>
          ) : filteredDeals.map(deal => {
            const cropName = deal.crop?.name || deal.cropName || 'Crop';
            const status   = (deal.status || 'ACTIVE').toUpperCase();
            const sc = status === 'COMPLETED'
              ? { color: '#16a34a', bg: '#dcfce7', label: t.completed  || 'Completed' }
              : status === 'CANCELLED'
              ? { color: '#dc2626', bg: '#fee2e2', label: t.cancelled  || 'Cancelled' }
              : { color: '#2563eb', bg: '#dbeafe', label: t.active     || 'Active'    };

            const isPaid   = deal.paymentStatus === 'PAID' || deal.paymentStatus === 'paid';
            const isActive = status === 'ACTIVE';

            return (
              <div key={deal.id} style={{ ...S.card, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {cropEmoji(cropName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{cropName}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: isPaid ? '#dcfce7' : '#fef3c7', color: isPaid ? '#16a34a' : '#d97706' }}>
                        {isPaid ? '✅ Paid' : `⏳ ${t.paymentPending || 'Payment Pending'}`}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                      {t.farmer || 'Farmer'}: <strong>{deal.farmer?.username || deal.farmerUsername || '—'}</strong> •
                      {deal.quantity} {deal.unit} • ₹{deal.agreedPrice || deal.price}/{deal.unit}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                      ₹{(deal.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                    {isActive && !isPaid && (
                      <button onClick={() => setPayModal(deal)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'linear-gradient(135deg,#15803d,#059669)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        <CreditCard size={13} /> {t.payNow || 'Pay Now'}
                      </button>
                    )}
                    {isPaid && (
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✅ {t.paymentDone || 'Payment Done'}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Quick Actions */}
      <div className="do-bottom-grid">
        {[
          {
            title: `${t.needHelp || 'Need Help'}?`,
            desc:  t.contactSupportText || 'Contact our support team for assistance',
            btn:   t.contactSupport || 'Contact Support',
            gradient: 'linear-gradient(135deg,#059669,#15803d)',
          },
          {
            title: t.exportData || 'Export Data',
            desc:  t.downloadReports || 'Download your order reports as CSV',
            btn:   t.exportOrders || 'Export Orders',
            gradient: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
            onClick: exportCSV,
          },
          {
            title: t.orderSummary || 'Order Summary',
            desc:  `${t.totalRequests || 'Total Requests'}: ${requests.length} | ${t.activeDeals || 'Active Deals'}: ${activeDeals}`,
            btn:   t.refresh || 'Refresh',
            gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            onClick: fetchAll,
          },
        ].map((q, i) => (
          <div key={i} style={{ background: q.gradient, borderRadius: 16, padding: 22, color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,.15)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 8px' }}>{q.title}</h3>
            <p style={{ fontSize: 12, opacity: 0.85, margin: '0 0 16px' }}>{q.desc}</p>
            <button onClick={q.onClick}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {i === 1 && <Download size={14} />} {q.btn}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default DealerOrders;