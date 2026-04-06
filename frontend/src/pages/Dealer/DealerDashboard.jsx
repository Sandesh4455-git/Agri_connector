// DealerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import ChatBot from '../../components/Chatbot/ChatBot';
import {
  ShoppingCart, Users, IndianRupee, Handshake,
  ArrowRight, MessageCircle, X, RefreshCw, AlertCircle,
} from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser  = () => {
  try { return JSON.parse(localStorage.getItem('agri_connect_user') || '{}'); }
  catch { return {}; }
};

const cropEmoji = (name = '') => {
  const n = (name || '').toLowerCase();
  if (n.includes('wheat'))                       return '🌾';
  if (n.includes('rice'))                        return '🍚';
  if (n.includes('tomato'))                      return '🍅';
  if (n.includes('potato'))                      return '🥔';
  if (n.includes('onion'))                       return '🧅';
  if (n.includes('cotton'))                      return '🧵';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('sugarcane'))                   return '🎋';
  if (n.includes('soybean'))                     return '🫘';
  return '🌱';
};

const dealStatusConfig = {
  ACTIVE:    { color: '#2563eb', bg: '#dbeafe', label: 'Active'    },
  COMPLETED: { color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2', label: 'Cancelled' },
  PENDING:   { color: '#d97706', bg: '#fef3c7', label: 'Pending'   },
};

const DealerDashboard = () => {
  const { t } = useLanguage();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const user = getUser();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [reqRes, dealRes, payRes] = await Promise.all([
        fetch(`${API}/requests/dealer`,       { headers }),
        fetch(`${API}/deals/dealer`,          { headers }),
        fetch(`${API}/payments/transactions`, { headers }),
      ]);
      const [reqData, dealData, payData] = await Promise.all([
        reqRes.json(), dealRes.json(), payRes.json(),
      ]);

      const requests     = reqData.success  ? (reqData.data  || []) : [];
      const deals        = dealData.success ? (dealData.data || []) : [];
      const transactions = payData.success  ? (payData.data  || []) : [];

      const totalOrders    = requests.length;
      const activeDeals    = deals.filter(d => (d.status || '').toUpperCase() === 'ACTIVE').length;
      const completedDeals = deals.filter(d => (d.status || '').toUpperCase() === 'COMPLETED').length;
      const totalSpent     = transactions
        .filter(tx => tx.status === 'COMPLETED' && tx.fromUsername === user.username)
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      const farmerSet = new Set();
      deals.forEach(d => { const fn = d.farmer?.username || d.farmerUsername; if (fn) farmerSet.add(fn); });
      requests.forEach(r => { const fn = r.farmer?.username; if (fn) farmerSet.add(fn); });

      const recentDeals = [...deals]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(d => ({
          id: d.id, crop: d.crop?.name || d.cropName || 'Crop',
          farmer: d.farmer?.username || d.farmerUsername || '—',
          amount: d.totalAmount || 0, status: (d.status || 'ACTIVE').toUpperCase(),
          quantity: d.quantity, unit: d.unit,
        }));

      const farmerDeals = {};
      deals.forEach(d => {
        const fn = d.farmer?.username || d.farmerUsername;
        if (!fn) return;
        if (!farmerDeals[fn]) farmerDeals[fn] = { name: fn, deals: 0, crops: new Set(), revenue: 0 };
        farmerDeals[fn].deals++;
        const crop = d.crop?.name || d.cropName;
        if (crop) farmerDeals[fn].crops.add(crop);
        farmerDeals[fn].revenue += d.totalAmount || 0;
      });
      const topSuppliers = Object.values(farmerDeals)
        .sort((a, b) => b.deals - a.deals).slice(0, 4)
        .map(s => ({ ...s, crops: [...s.crops].join(', ') }));

      const pendingRequests = requests.filter(r =>
        r.status === 'PENDING' || r.status === 'NEGOTIATING'
      ).length;

      setData({ totalOrders, activeDeals, completedDeals, totalSpent, farmerCount: farmerSet.size, recentDeals, topSuppliers, pendingRequests });
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally { setLoading(false); }
  };

  if (loading) return (
    <main style={{ flex: 1, padding: 'clamp(12px,3vw,24px)', background: 'linear-gradient(135deg,#f8fafc 0%,#eff6ff 100%)', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 13 }}>Loading dashboard...</p>
      </div>
    </main>
  );

  const stats = [
    { title: t.totalRequests,   value: data.totalOrders,                               icon: ShoppingCart, color: '#2563eb', bg: '#dbeafe' },
    { title: t.activeSuppliers, value: data.farmerCount,                               icon: Users,        color: '#7c3aed', bg: '#ede9fe' },
    { title: t.totalSpent,      value: `₹${data.totalSpent.toLocaleString('en-IN')}`,  icon: IndianRupee,  color: '#16a34a', bg: '#dcfce7' },
    { title: t.activeDeals,     value: data.activeDeals,                               icon: Handshake,    color: '#d97706', bg: '#fef3c7' },
  ];

  const quickActions = [
    { title: t.browseMarketplace, desc: t.findQualityCrops,    link: '/dealer/marketplace', gradient: 'linear-gradient(135deg,#1d4ed8,#2563eb)', emoji: '🛒' },
    { title: t.myOrders,          desc: t.trackManageOrders,   link: '/dealer/orders',      gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)', emoji: '🤝' },
    { title: t.analytics,         desc: t.viewBusinessInsights, link: '/dealer/analytics',  gradient: 'linear-gradient(135deg,#059669,#16a34a)', emoji: '📊' },
  ];

  return (
    <main style={{ flex: 1, padding: 'clamp(12px,3vw,24px)', background: 'linear-gradient(135deg,#f8fafc 0%,#eff6ff 100%)', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .dd-stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }
        .dd-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-bottom: 16px;
        }
        .dd-quick-stats {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        .dd-actions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .dd-quick-stats { grid-template-columns: repeat(3,1fr); }
          .dd-actions-grid { grid-template-columns: repeat(3,1fr); }
        }
        @media (min-width: 768px) {
          .dd-stat-grid { grid-template-columns: repeat(4,1fr); gap: 14px; }
          .dd-main-grid { grid-template-columns: 2fr 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>{t.dealerDashboard}</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            {t.welcomeback}, <strong style={{ color: '#1d4ed8' }}>{user.name || user.username}</strong>! {t.welcomeDealerOverview}
          </p>
        </div>
        <button onClick={fetchDashboard}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <RefreshCw size={13} /> {t.refresh}
        </button>
      </div>

      {/* Pending Alert */}
      {data.pendingRequests > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <AlertCircle size={16} color="#d97706" />
          <p style={{ fontSize: 12, color: '#92400e', margin: 0, fontWeight: 600 }}>
            {data.pendingRequests} {t.pending} {data.pendingRequests > 1 ? 'requests' : 'request'} —&nbsp;
            <Link to="/dealer/orders" style={{ color: '#d97706', textDecoration: 'underline' }}>{t.viewAll} →</Link>
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="dd-stat-grid">
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.title}</p>
              <p style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, color: s.color, margin: 0, wordBreak: 'break-all' }}>{s.value}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="dd-main-grid">
        {/* Recent Deals */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{t.recentOrders}</h2>
            <Link to="/dealer/orders" style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              {t.viewAll} <ArrowRight size={12} />
            </Link>
          </div>
          {data.recentDeals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#9ca3af' }}>
              <p style={{ fontSize: 32, margin: '0 0 7px' }}>🤝</p>
              <p style={{ fontSize: 13, margin: 0 }}>{t.noDealsFound}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {data.recentDeals.map((deal, i) => {
                const sc = dealStatusConfig[deal.status] || dealStatusConfig.ACTIVE;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: '#f9fafb', borderRadius: 11, border: '1px solid #f3f4f6' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {cropEmoji(deal.crop)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{deal.crop}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 7, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>
                        {t.farmer}: <strong style={{ color: '#6b7280' }}>{deal.farmer}</strong>
                      </p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0, flexShrink: 0 }}>
                      ₹{(deal.amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Suppliers */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>{t.topSuppliers}</h2>
          {data.topSuppliers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#9ca3af' }}>
              <p style={{ fontSize: 32, margin: '0 0 7px' }}>👨‍🌾</p>
              <p style={{ fontSize: 13, margin: 0 }}>No suppliers yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.topSuppliers.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: '#f9fafb', borderRadius: 11, border: '1px solid #f3f4f6' }}>
                  <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {(s.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{s.name}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.crops || 'Various crops'} • {s.deals} {t.deals}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', margin: 0, flexShrink: 0 }}>
                    ₹{(s.revenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link to="/dealer/suppliers" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12, padding: '9px', background: '#eff6ff', color: '#2563eb', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            <Users size={13} /> {t.viewAllSuppliers}
          </Link>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="dd-quick-stats">
        {[
          { label: t.completedDeals,   value: data.completedDeals,  icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
          { label: t.pendingRequests1, value: data.pendingRequests, icon: '⏳', color: '#d97706', bg: '#fffbeb' },
          { label: t.totalSuppliers,   value: data.farmerCount,     icon: '👨‍🌾', color: '#7c3aed', bg: '#fdf4ff' },
        ].map((item, i) => (
          <div key={i} style={{ background: item.bg, borderRadius: 14, border: `1px solid ${item.color}22`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: 10, color: item.color, margin: '0 0 3px', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</p>
              <p style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dd-actions-grid">
        {quickActions.map((q, i) => (
          <div key={i} style={{ background: q.gradient, borderRadius: 14, padding: '18px', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,.15)' }}>
            <p style={{ fontSize: 26, margin: '0 0 8px' }}>{q.emoji}</p>
            <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 5px' }}>{q.title}</h3>
            <p style={{ fontSize: 12, margin: '0 0 14px', opacity: 0.85 }}>{q.desc}</p>
            <Link to={q.link} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,.2)', color: 'white', borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,.3)' }}>
              {t.viewAll} →
            </Link>
          </div>
        ))}
      </div>

      {/* Chatbot */}
      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: 20, right: 12, zIndex: 50, width: 'calc(100vw - 24px)', maxWidth: 360 }}>
          <button onClick={() => setIsChatOpen(false)}
            style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
          <ChatBot userType="dealer" language="english" />
        </div>
      )}

      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)}
          style={{ position: 'fixed', bottom: 20, right: 16, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,.4)', zIndex: 40 }}>
          <MessageCircle size={20} />
        </button>
      )}
    </main>
  );
};

export default DealerDashboard;