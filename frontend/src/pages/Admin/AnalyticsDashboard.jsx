import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, Handshake, CreditCard, RefreshCw, Sprout } from 'lucide-react';

const API = 'http://localhost:8080/api/admin';
const getToken = () => localStorage.getItem('agri_connect_token');
const COLORS = ['#16a34a','#2563eb','#d97706','#9333ea','#e11d48','#0ea5e9'];

const AnalyticsDashboard = () => {
  const [data,    setData]    = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`${API}/analytics`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API}/stats`,     { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const [aData, sData] = await Promise.all([aRes.json(), sRes.json()]);
      if (aData.success) setData(aData.data);
      if (sData.success) setStats(sData.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const kpiCards = stats ? [
    { label:'Total Users',    value:stats.totalUsers,    icon:Users,     bg:'#eff6ff', color:'#2563eb' },
    { label:'Total Revenue',  value:`₹${Number(stats.totalRevenue||0).toLocaleString('en-IN')}`, icon:TrendingUp, bg:'#f0fdf4', color:'#16a34a' },
    { label:'Total Deals',    value:stats.totalDeals,    icon:Handshake, bg:'#fef3c7', color:'#d97706' },
    { label:'Total Payments', value:stats.totalPayments, icon:CreditCard,bg:'#fdf4ff', color:'#9333ea' },
    { label:'Total Crops',    value:stats.totalCrops,    icon:Sprout,    bg:'#fff1f2', color:'#e11d48' },
    { label:'Active Schemes', value:stats.activeSchemes||0, icon:TrendingUp, bg:'#ecfdf5', color:'#059669' },
  ] : [];

  const roleData = stats ? [
    { name:'Farmers',   count:stats.totalFarmers,        fill:'#16a34a' },
    { name:'Dealers',   count:stats.totalDealers,        fill:'#2563eb' },
    { name:'Customers', count:stats.totalCustomers || 0, fill:'#9333ea' },
  ] : [];

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        * { box-sizing: border-box; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (min-width: 480px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 768px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        }
        @media (min-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(6, 1fr); }
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (min-width: 768px) {
          .charts-grid { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
        }

        .ana-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 6px rgba(0,0,0,.05);
          padding: 18px;
        }

        .pay-status-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .page-header { align-items: center; }
          .kpi-grid { margin-bottom: 24px; }
        }
        @media (min-width: 768px) {
          div[style*="padding: '16px'"] { padding: 24px; }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: '#111827', margin: 0 }}>Analytics Dashboard</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Real-time platform insights</p>
        </div>
        <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            {kpiCards.map((c, i) => (
              <div key={i} className="ana-card" style={{ padding: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <c.icon size={17} color={c.color} />
                </div>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.label}</p>
                <p style={{ fontSize: 'clamp(17px, 3vw, 22px)', fontWeight: 800, color: '#111827', margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            {/* User Role Bar */}
            <div className="ana-card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>👥 User Role Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={roleData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Users" radius={[6,6,0,0]}>
                    {roleData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Crop Category Pie */}
            <div className="ana-card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>🌾 Crop Categories</h3>
              {data?.cropDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.cropDistribution}
                      cx="50%" cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(data.cropDistribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#9ca3af', fontSize: 13 }}>
                  No crop data yet
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          {data?.paymentStatus && (
            <div className="ana-card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>💳 Payment Status Breakdown</h3>
              <div className="pay-status-grid">
                {Object.entries(data.paymentStatus).map(([status, count]) => {
                  const colors = {
                    COMPLETED: { bg: '#dcfce7', color: '#16a34a' },
                    PENDING:   { bg: '#fef3c7', color: '#d97706' },
                    FAILED:    { bg: '#fee2e2', color: '#dc2626' },
                  };
                  const c = colors[status] || { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <div key={status} style={{ padding: '12px 18px', borderRadius: 12, background: c.bg, border: `1px solid ${c.bg}`, minWidth: 110 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: c.color, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{status}</p>
                      <p style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 800, color: c.color, margin: 0 }}>{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 