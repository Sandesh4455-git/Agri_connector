//customerDashboard
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, CreditCard, Heart, Star,
  TrendingUp, ArrowRight, RefreshCw, MapPin,
  Clock, CheckCircle, XCircle, Loader2, Search,
  Bell, ChevronRight, Wheat, Sprout
} from 'lucide-react';

const API = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser  = () => {
  try { return JSON.parse(localStorage.getItem('agri_connect_user') || '{}'); }
  catch { return {}; }
};

const cropEmoji = (name = '') => {
  const n = (name || '').toLowerCase();
  if (n.includes('wheat'))     return '🌾';
  if (n.includes('rice'))      return '🍚';
  if (n.includes('tomato'))    return '🍅';
  if (n.includes('potato'))    return '🥔';
  if (n.includes('onion'))     return '🧅';
  if (n.includes('cotton'))    return '🧵';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('soybean'))   return '🫘';
  if (n.includes('mango'))     return '🥭';
  if (n.includes('banana'))    return '🍌';
  if (n.includes('grapes'))    return '🍇';
  return '🌱';
};

const CustomerDashboard = () => {
  const { t } = useLanguage();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [cropsRes, reqRes, payRes] = await Promise.all([
        fetch(`${API}/crops/available`, { headers }),
        fetch(`${API}/requests/customer`, { headers }).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API}/payments/transactions`, { headers }).catch(() => ({ json: () => ({ success: false }) })),
      ]);
      const [cropsData, reqData, payData] = await Promise.all([
        cropsRes.json(),
        reqRes.json ? reqRes.json() : { success: false },
        payRes.json ? payRes.json() : { success: false },
      ]);

      const crops    = cropsData.success ? (cropsData.data || []).slice(0, 8) : [];
      const requests = reqData.success   ? (reqData.data  || []) : [];
      const payments = payData.success   ? (payData.data  || []) : [];

      const totalOrders     = requests.length;
      const pendingOrders   = requests.filter(r => r.status === 'PENDING' || r.status === 'NEGOTIATING').length;
      const completedOrders = requests.filter(r => r.status === 'ACCEPTED' || r.status === 'COMPLETED').length;
      const totalSpent      = payments
        .filter(p => p.status === 'COMPLETED' && p.fromUsername === user.username)
        .reduce((s, p) => s + (p.amount || 0), 0);

      const recentRequests = [...requests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

      setData({ crops, totalOrders, pendingOrders, completedOrders, totalSpent, recentRequests });
    } catch (e) {
      console.error(e);
      setData({ crops: [], totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalSpent: 0, recentRequests: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafdf7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 44, height: 44, border: '3px solid #bbf7d0', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14, fontFamily: 'system-ui' }}>Loading your dashboard...</p>
    </div>
  );

  const statusConfig = {
    PENDING:     { color: '#d97706', bg: '#fef9c3', label: 'Pending',     dot: '#f59e0b' },
    NEGOTIATING: { color: '#7c3aed', bg: '#f3e8ff', label: 'Negotiating', dot: '#a855f7' },
    ACCEPTED:    { color: '#16a34a', bg: '#dcfce7', label: 'Accepted',    dot: '#22c55e' },
    REJECTED:    { color: '#dc2626', bg: '#fee2e2', label: 'Rejected',    dot: '#ef4444' },
    COMPLETED:   { color: '#16a34a', bg: '#dcfce7', label: 'Completed',   dot: '#22c55e' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafdf7', fontFamily: "'Nunito', system-ui, sans-serif", padding: '16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        .cust-card { animation: fadeUp .4s ease forwards; opacity: 0; }
        .cust-card:nth-child(1){animation-delay:.05s}
        .cust-card:nth-child(2){animation-delay:.1s}
        .cust-card:nth-child(3){animation-delay:.15s}
        .cust-card:nth-child(4){animation-delay:.2s}
        @media (hover: hover) {
          .crop-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.1) !important; }
          .quick-link:hover { transform: scale(1.02); }
        }
        .crop-card { transition: all .2s ease; }
        .quick-link { transition: all .15s ease; }

        /* Stats grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
        }

        /* Quick actions grid */
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .quick-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .quick-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }

        /* Bottom two-column layout */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .bottom-grid { grid-template-columns: 1fr; }
        }

        /* Header */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dash-title {
          font-size: clamp(18px, 5vw, 26px);
          font-weight: 900;
          color: #14532d;
          margin: 0;
        }

        /* Stat card inner */
        .stat-card-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        @media (max-width: 400px) {
          .stat-card-inner { flex-direction: column; align-items: flex-start; gap: 8px; }
          .stat-icon { align-self: flex-end; }
        }

        /* Stat value font scaling */
        .stat-value {
          font-size: clamp(18px, 4vw, 24px);
          font-weight: 900;
          margin: 0;
        }

        /* Quick link text */
        .quick-link-text {
          font-size: clamp(12px, 3vw, 14px);
          font-weight: 800;
        }

        /* Summary strip */
        .summary-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .summary-nums {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 26 }}>👋</span>
            <h1 className="dash-title">
              Welcome, {user.name?.split(' ')[0] || 'Customer'}!
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {t.freshProduce} 🌾
          </p>
        </div>
        <button onClick={fetchDashboard}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { label: t.totalOrders,  value: data.totalOrders,     icon: ShoppingBag, color: '#16a34a', bg: 'linear-gradient(135deg,#bbf7d0,#dcfce7)', border: '#86efac' },
          { label: t.pending,      value: data.pendingOrders,   icon: Clock,       color: '#d97706', bg: 'linear-gradient(135deg,#fef9c3,#fef3c7)', border: '#fcd34d' },
          { label: t.completed,    value: data.completedOrders, icon: CheckCircle, color: '#2563eb', bg: 'linear-gradient(135deg,#dbeafe,#eff6ff)',  border: '#93c5fd' },
          { label: t.totalSpent,   value: `₹${data.totalSpent.toLocaleString('en-IN')}`, icon: CreditCard, color: '#7c3aed', bg: 'linear-gradient(135deg,#f3e8ff,#ede9fe)', border: '#c4b5fd' },
        ].map((st, i) => (
          <div key={i} className="cust-card"
            style={{ background: st.bg, borderRadius: 16, border: `1.5px solid ${st.border}`, padding: '14px 16px' }}>
            <div className="stat-card-inner">
              <div>
                <p style={{ fontSize: 10, color: st.color, margin: '0 0 4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', opacity: .8 }}>{st.label}</p>
                <p className="stat-value" style={{ color: st.color }}>{st.value}</p>
              </div>
              <div className="stat-icon" style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <st.icon size={20} color={st.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="quick-grid">
        {[
          { label: t.browseProducts, to: '/customer/browse',      bg: 'linear-gradient(135deg,#16a34a,#15803d)', shadow: 'rgba(22,163,74,.3)' },
          { label: t.myOrders,       to: '/customer/orders',       bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', shadow: 'rgba(37,99,235,.3)' },
          { label: t.transactions,   to: '/customer/transactions', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', shadow: 'rgba(124,58,237,.3)' },
          { label: t.myProfile,      to: '/customer/profile',      bg: 'linear-gradient(135deg,#d97706,#b45309)', shadow: 'rgba(217,119,6,.3)' },
        ].map((q, i) => (
          <Link key={i} to={q.to} className="quick-link"
            style={{ background: q.bg, borderRadius: 14, padding: '13px 14px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 6px 20px ${q.shadow}`, gap: 8 }}>
            <span className="quick-link-text">{q.label}</span>
            <ChevronRight size={15} style={{ flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="bottom-grid">

        {/* ── Fresh Crops ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #e5e7eb', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#14532d', margin: 0 }}>🌾 {t.freshCrops}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{t.directFarmers}</p>
            </div>
            <Link to="/customer/browse" style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              {t.viewAll} <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.crops.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: 36, margin: '0 0 8px' }}>🌾</p>
                <p style={{ fontSize: 14 }}>{t.noCrops}</p>
              </div>
            ) : data.crops.slice(0, 5).map((crop, i) => (
              <div key={i} className="crop-card"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fffe', borderRadius: 14, border: '1.5px solid #d1fae5', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {cropEmoji(crop.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#14532d', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{crop.name}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                    <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
                    {crop.city || 'India'} • {crop.quantity} {crop.unit}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 900, color: '#16a34a', margin: '0 0 2px' }}>₹{crop.pricePerUnit}/kg</p>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>Available</span>
                </div>
              </div>
            ))}
          </div>

          <Link to="/customer/browse"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '12px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 14px rgba(22,163,74,.3)' }}>
            🛒 {t.browseAllProducts}
          </Link>
        </div>

        {/* ── Recent Orders ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #e5e7eb', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#14532d', margin: 0 }}>📋 {t.recentOrders}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{t.latestRequests}</p>
            </div>
            <Link to="/customer/orders" style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              {t.viewAll} <ArrowRight size={12} />
            </Link>
          </div>

          {data.recentRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🛒</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>{t.noOrder}</p>
              <p style={{ fontSize: 13, margin: '0 0 16px' }}>{t.browseproductrequest}</p>
              <Link to="/customer/browse"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                🌾 {t.browseNow}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recentRequests.map((req, i) => {
                const sc = statusConfig[req.status] || statusConfig.PENDING;
                const cropName = req.crop?.name || req.cropName || 'Crop';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fafafa', borderRadius: 14, border: '1px solid #f3f4f6' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {cropEmoji(cropName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{cropName}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block', marginRight: 4 }} />
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.quantity} {req.unit} • ₹{req.offeredPrice}/{req.unit}
                        {req.counterPrice && <span style={{ color: '#7c3aed' }}> → ₹{req.counterPrice}</span>}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#111827', margin: '0 0 2px' }}>
                        ₹{((req.counterPrice || req.offeredPrice) * req.quantity).toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {data.recentRequests.length > 0 && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, border: '1px solid #bbf7d0' }}>
              <div className="summary-strip">
                <div className="summary-nums">
                  <div>
                    <p style={{ fontSize: 10, color: '#15803d', margin: '0 0 2px', fontWeight: 700 }}>TOTAL SPENT</p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: '#14532d', margin: 0 }}>₹{data.totalSpent.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#15803d', margin: '0 0 2px', fontWeight: 700 }}>COMPLETED</p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: '#14532d', margin: 0 }}>{data.completedOrders}</p>
                  </div>
                </div>
                <Link to="/customer/orders"
                  style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  View All <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;