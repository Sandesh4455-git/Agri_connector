// src/pages/Dealer/DealerSuppliers.jsx
// Responsive version — works on mobile, tablet, desktop

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search, Star, MapPin, Phone, Mail, MessageSquare, ShoppingBag,
  RefreshCw, Package, TrendingUp, Users, IndianRupee,
  Filter, CheckCircle, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

const cropEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('wheat'))                       return '🌾';
  if (n.includes('rice'))                        return '🍚';
  if (n.includes('tomato'))                      return '🍅';
  if (n.includes('potato'))                      return '🥔';
  if (n.includes('onion'))                       return '🧅';
  if (n.includes('cotton'))                      return '🧵';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('sugarcane'))                   return '🎋';
  if (n.includes('soybean'))                     return '🫘';
  if (n.includes('mango'))                       return '🥭';
  return '🌱';
};

const RESPONSIVE_CSS = `
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ds-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .ds-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .ds-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .ds-filter-bar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 14px 16px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 10px rgba(0,0,0,.06);
    margin-bottom: 16px;
  }

  .ds-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 14px;
  }

  .ds-card-actions {
    padding: 12px 20px;
    display: flex;
    gap: 8px;
    margin-top: auto;
  }

  /* Tablet */
  @media (max-width: 900px) {
    .ds-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .ds-cards-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  }

  /* Mobile */
  @media (max-width: 480px) {
    .ds-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .ds-header { flex-direction: column; }
    .ds-header-actions { width: 100%; }
    .ds-header-actions > button { flex: 1; justify-content: center; }
    .ds-cards-grid { grid-template-columns: 1fr; }
    .ds-filter-bar { flex-direction: column; }
    .ds-filter-bar > div { width: 100%; }
    .ds-filter-bar select { width: 100%; }
    .ds-card-actions { flex-direction: column; }
    .ds-card-actions > a { width: 100%; text-align: center; justify-content: center; }
  }
`;

const DealerSuppliers = () => {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [toast, setToast]         = useState(null);

  const showMsg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };

      const [dealRes, reqRes] = await Promise.all([
        fetch(`${API}/deals/dealer`,    { headers }),
        fetch(`${API}/requests/dealer`, { headers }),
      ]);

      const [dealData, reqData] = await Promise.all([
        dealRes.ok ? dealRes.json() : { success: false, data: [] },
        reqRes.ok  ? reqRes.json()  : { success: false, data: [] },
      ]);

      const deals    = dealData.success ? (dealData.data || []) : [];
      const requests = reqData.success  ? (reqData.data  || []) : [];

      const farmerMap = {};

      deals.forEach(d => {
        const username = d.farmer?.username || d.farmerUsername;
        const name     = d.farmer?.name || username;
        if (!username) return;

        if (!farmerMap[username]) {
          farmerMap[username] = {
            username,
            name:     name || username,
            location: d.farmer?.city || d.farmer?.location || 'India',
            phone:    d.farmer?.phone || '',
            email:    d.farmer?.email || '',
            crops:    new Set(),
            deals:    0,
            revenue:  0,
          };
        }
        farmerMap[username].deals++;
        farmerMap[username].revenue += d.totalAmount || 0;
        const crop = d.crop?.name || d.cropName;
        if (crop) farmerMap[username].crops.add(crop);
      });

      requests.forEach(r => {
        const username = r.farmer?.username;
        const name     = r.farmer?.name || username;
        if (!username) return;

        if (!farmerMap[username]) {
          farmerMap[username] = {
            username,
            name:     name || username,
            location: r.farmer?.city || 'India',
            phone:    r.farmer?.phone || '',
            email:    r.farmer?.email || '',
            crops:    new Set(),
            deals:    0,
            revenue:  0,
          };
        }
        const crop = r.crop?.name || r.cropName;
        if (crop) farmerMap[username].crops.add(crop);
      });

      const supplierList = Object.values(farmerMap).map(f => ({
        ...f,
        crops:       [...f.crops],
        status:      f.deals > 0 ? 'active' : 'pending',
        rating:      f.deals >= 3 ? 4.8 : f.deals >= 1 ? 4.5 : 4.0,
        reliability: f.deals >= 3 ? '98%' : f.deals >= 1 ? '95%' : '90%',
        totalOrders: f.deals,
        totalValue:  `₹${f.revenue.toLocaleString('en-IN')}`,
      }));

      setSuppliers(supplierList);
    } catch (e) {
      console.error(e);
      showMsg('❌ Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.crops.some(c => c.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = suppliers.reduce((sum, f) => sum + f.revenue, 0);
  const totalDeals   = suppliers.reduce((sum, f) => sum + f.deals, 0);
  const activeCount  = suppliers.filter(s => s.status === 'active').length;

  const S = {
    page:  { flex: 1, padding: '20px 16px', background: 'linear-gradient(135deg,#f8fafc,#eff6ff)', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' },
    card:  { background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,.06)', padding: 20 },
    input: { padding: '9px 12px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: 'white', width: '100%', boxSizing: 'border-box' },
    btn:   (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: bg, color, border: border || 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }),
  };

  if (loading) return (
    <main style={S.page}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading suppliers...</p>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <style>{RESPONSIVE_CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 200, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'white', border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`, color: toast.type === 'success' ? '#15803d' : '#dc2626', boxShadow: '0 8px 30px rgba(0,0,0,.1)', maxWidth: 'calc(100vw - 40px)' }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="ds-header">
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
            👨‍🌾 {t?.mySuppliers || 'My Suppliers'}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            {t?.manageSuppliers || 'Farmers you have deals or requests with'}
          </p>
        </div>
        <div className="ds-header-actions">
          <button onClick={fetchSuppliers} style={S.btn('white', '#374151', '1px solid #e5e7eb')}>
            <RefreshCw size={14} /> {t?.refresh || 'Refresh'}
          </button>
          <button style={S.btn('linear-gradient(135deg,#4f46e5,#7c3aed)', 'white')}>
            <UserPlus size={14} /> {t?.addNewSupplier || 'Add Supplier'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ds-stats-grid">
        {[
          { label: t?.totalSuppliers || 'Total Suppliers', value: suppliers.length,                            color: '#2563eb', bg: '#dbeafe', Icon: Users       },
          { label: t?.active         || 'Active',          value: activeCount,                                 color: '#16a34a', bg: '#dcfce7', Icon: TrendingUp   },
          { label: t?.totalOrders    || 'Total Deals',     value: totalDeals,                                  color: '#d97706', bg: '#fef3c7', Icon: Package      },
          { label: t?.totalValue     || 'Total Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`,  color: '#7c3aed', bg: '#ede9fe', Icon: IndianRupee },
        ].map((st, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 14px', boxShadow: '0 2px 8px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase' }}>{st.label}</p>
              <p style={{ fontSize: 'clamp(16px,3.5vw,22px)', fontWeight: 800, color: st.color, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.value}</p>
            </div>
            <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <st.Icon size={20} color={st.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="ds-filter-bar">
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 150 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            style={S.input}
            placeholder={t?.searchSuppliers || 'Search by name, location, crop...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: 'white', cursor: 'pointer', minWidth: 120 }}
        >
          <option value="all">{t?.allStatus || 'All Status'}</option>
          <option value="active">{t?.active || 'Active'}</option>
          <option value="pending">{t?.inactive || 'Pending'}</option>
        </select>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !loading && (
        <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>🤝</p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>
            {suppliers.length === 0
              ? (t?.noSuppliersYet || 'No suppliers yet')
              : (t?.noMatchingSuppliers || 'No matching suppliers')}
          </h3>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>
            {suppliers.length === 0
              ? (t?.goToMarketplace || 'Send crop requests from the Marketplace!')
              : (t?.clearSearch || 'Try clearing your search')}
          </p>
          <Link
            to="/dealer/marketplace"
            style={{ ...S.btn('#dbeafe', '#1d4ed8'), textDecoration: 'none' }}
          >
            🛒 {t?.goToMarketplace || 'Go to Marketplace'}
          </Link>
        </div>
      )}

      {/* Supplier Cards Grid */}
      {filtered.length > 0 && (
        <div className="ds-cards-grid">
          {filtered.map(supplier => (
            <div key={supplier.username} style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* Card Header */}
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 50, height: 50, minWidth: 50, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800 }}>
                      {(supplier.name || supplier.username).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                        {supplier.name || supplier.username}
                      </h3>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>@{supplier.username}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: supplier.status === 'active' ? '#dcfce7' : '#f3f4f6', color: supplier.status === 'active' ? '#15803d' : '#6b7280', whiteSpace: 'nowrap' }}>
                    {supplier.status === 'active' ? `✅ ${t?.active || 'Active'}` : `⏳ ${t?.inactive || 'Pending'}`}
                  </span>
                </div>

                {/* Rating + Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        color={i < Math.floor(supplier.rating) ? '#f59e0b' : '#e5e7eb'}
                        fill={i < Math.floor(supplier.rating) ? '#f59e0b' : 'none'}
                      />
                    ))}
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginLeft: 4 }}>{supplier.rating}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
                    <MapPin size={12} /> {supplier.location}
                  </div>
                </div>
              </div>

              {/* Contact row */}
              {(supplier.phone || supplier.email) && (
                <div style={{ padding: '10px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {supplier.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                      <Phone size={12} color="#6b7280" /> {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', minWidth: 0 }}>
                      <Mail size={12} color="#6b7280" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{supplier.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Crops */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>
                  {t?.mainCrops || 'Crops'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {supplier.crops.length > 0
                    ? supplier.crops.map((crop, i) => (
                        <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
                          {cropEmoji(crop)} {crop}
                        </span>
                      ))
                    : <span style={{ fontSize: 12, color: '#9ca3af' }}>No crops yet</span>}
                </div>
              </div>

              {/* Stats */}
              <div style={{ padding: '12px 20px', background: '#f9fafb', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderBottom: '1px solid #f3f4f6' }}>
                {[
                  { label: t?.totalOrders || 'Deals',       value: supplier.totalOrders },
                  { label: t?.totalValue  || 'Revenue',      value: supplier.totalValue  },
                  { label: t?.reliability || 'Reliability',  value: supplier.reliability },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'clamp(12px,3vw,15px)', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>{item.value}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Reliability bar */}
              <div style={{ padding: '10px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: supplier.reliability, background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap' }}>{supplier.reliability}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="ds-card-actions">
                <Link
                  to="/dealer/marketplace"
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <ShoppingBag size={13} /> {t?.orderNow || 'Order Now'}
                </Link>
                <Link
                  to="/dealer/orders"
                  style={{ flex: 1, padding: '10px', background: '#f5f3ff', color: '#4f46e5', border: '1px solid #c4b5fd', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <MessageSquare size={13} /> {t?.contact || 'View Deals'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default DealerSuppliers;