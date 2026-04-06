import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Sprout, Store, TrendingUp, CreditCard,
  Handshake, RefreshCw, ArrowUpRight,
  AlertTriangle, Eye,
  UserCheck, Package, FileSpreadsheet, Menu, X
} from 'lucide-react';

const API = 'http://localhost:8080/api/admin';
const getToken = () => localStorage.getItem('agri_connect_token');

const sparkData = {
  users:    [3,5,4,7,6,9,11],
  farmers:  [2,3,3,5,4,6,6],
  dealers:  [1,1,2,2,3,3,3],
  crops:    [4,6,5,8,7,11,11],
  deals:    [1,2,2,3,3,3,3],
  payments: [8,12,10,18,15,24,31],
  revenue:  [500,800,700,1200,900,1800,2384],
};

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444'];
const MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const revenueData = MONTHS.map((m, i) => ({
  month: m,
  revenue: [18000,22000,19000,28000,25000,31000,27000,23840][i],
  deals:   [8,11,9,15,13,16,14,3][i],
}));
const userGrowthData = MONTHS.map((m, i) => ({
  month: m,
  farmers: [3,4,4,6,5,8,6,11][i],
  dealers: [1,1,1,2,2,2,3,3][i],
  customers:[1,2,2,3,2,4,3,11][i],
}));

const Spark = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
        fill={`url(#sg-${color})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
          {p.name}: {p.name?.toLowerCase().includes('rev') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [sRes, uRes, cRes, pRes] = await Promise.all([
        fetch(`${API}/stats`,    { headers }),
        fetch(`${API}/users`,    { headers }),
        fetch(`${API}/crops`,    { headers }),
        fetch(`${API}/payments`, { headers }),
      ]);
      const [s, u, c, p] = await Promise.all([sRes.json(), uRes.json(), cRes.json(), pRes.json()]);
      if (s.success) setStats(s.data);
      if (u.success) setUsers(u.data || []);
      if (c.success) setCrops(c.data || []);
      if (p.success) setPayments(p.data || []);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const exportToExcel = () => {
    setExporting(true);
    try {
      const hdrs = ['#','Txn ID','From','To','Crop','Qty','Unit','Amount','Method','Status','Date'];
      const rows = payments.slice().reverse().map((p, i) => [
        i + 1, p.payuTxnId || ('#' + p.id), p.fromUsername || '-', p.toUsername || '-',
        p.cropName || '-', p.quantity || '-', p.unit || '-', p.amount || 0,
        p.paymentMethod || '-', p.status || '-',
        p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '-',
      ]);
      const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const stuck = payments.filter(p => p.status === 'PENDING');
      const stuckAmt = stuck.reduce((s, p) => s + (p.amount || 0), 0);
      const comp = payments.filter(p => p.status === 'COMPLETED');
      const compAmt = comp.reduce((s, p) => s + (p.amount || 0), 0);
      const esc = v => { const s = String(v); return s.includes(',') || s.includes('"') ? ('"' + s.replace(/"/g, '""') + '"') : s; };
      const csv = [
        ['AgriConnect Payment Reconciliation Report'],
        ['Generated: ' + new Date().toLocaleString('en-IN')],
        [],
        hdrs, ...rows, [],
        ['SUMMARY'], ['Total Payments', payments.length], ['Total Amount (Rs)', total],
        ['Completed', comp.length, '', compAmt], ['Stuck/Pending', stuck.length, '', stuckAmt],
        ['Failed', payments.filter(p => p.status === 'FAILED').length],
      ].map(r => r.map(esc).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'AgriConnect_Payments_' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch(e) { console.error(e); } finally { setExporting(false); }
  };

  const blockedUsers  = users.filter(u => !u.verified).length;
  const activeUsers   = users.filter(u => u.verified).length;
  const completedPay  = payments.filter(p => p.status === 'COMPLETED').length;
  const failedPay     = payments.filter(p => p.status === 'FAILED').length;
  const availableCrops = crops.filter(c => c.available).length;

  const roleData = [
    { name: 'Farmers',   value: stats?.totalFarmers  || 0 },
    { name: 'Dealers',   value: stats?.totalDealers  || 0 },
    { name: 'Customers', value: users.filter(u => u.role === 'customer').length },
    { name: 'Admins',    value: users.filter(u => u.role === 'admin').length },
  ].filter(d => d.value > 0);

  const payStatusData = [
    { name: 'Completed', value: completedPay },
    { name: 'Pending',   value: payments.filter(p => p.status === 'PENDING').length },
    { name: 'Failed',    value: failedPay },
  ].filter(d => d.value > 0);

  const statCards = stats ? [
    { label: 'Total Users',    value: stats.totalUsers,    icon: Users,      color: '#3b82f6', spark: sparkData.users    },
    { label: 'Farmers',        value: stats.totalFarmers,  icon: Sprout,     color: '#22c55e', spark: sparkData.farmers  },
    { label: 'Dealers',        value: stats.totalDealers,  icon: Store,      color: '#f59e0b', spark: sparkData.dealers  },
    { label: 'Total Crops',    value: stats.totalCrops,    icon: Package,    color: '#a855f7', spark: sparkData.crops    },
    { label: 'Total Deals',    value: stats.totalDeals,    icon: Handshake,  color: '#ec4899', spark: sparkData.deals    },
    { label: 'Total Payments', value: stats.totalPayments, icon: CreditCard, color: '#06b6d4', spark: sparkData.payments },
    { label: 'Total Revenue',  value: `₹${Number(stats.totalRevenue||0).toLocaleString('en-IN')}`, icon: TrendingUp, color: '#22c55e', spark: sparkData.revenue },
    { label: 'Active Users',   value: activeUsers, icon: UserCheck, color: '#10b981', spark: sparkData.users },
  ] : [];

  const badge = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 20,
    background: `${color}22`, color, fontSize: 11, fontWeight: 700
  });

  const card = {
    background: '#0d1b2e',
    border: '1px solid #1e3a5f',
    borderRadius: 16
  };

  const tabs = ['overview', 'users', 'crops', 'payments'];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060d1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #1e3a5f', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#060d1f', color: '#e2e8f0', fontFamily: "'DM Sans', system-ui, sans-serif", padding: '16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .dash-card{animation:fadeUp .4s ease forwards;opacity:0}
        .dash-card:nth-child(1){animation-delay:.05s}
        .dash-card:nth-child(2){animation-delay:.1s}
        .dash-card:nth-child(3){animation-delay:.15s}
        .dash-card:nth-child(4){animation-delay:.2s}
        .dash-card:nth-child(5){animation-delay:.25s}
        .dash-card:nth-child(6){animation-delay:.3s}
        .dash-card:nth-child(7){animation-delay:.35s}
        .dash-card:nth-child(8){animation-delay:.4s}
        .stat-card:hover{border-color:#2d5a8e!important;transform:translateY(-2px);transition:all .2s}
        .action-btn:hover{opacity:.85;transform:scale(.98)}
        tr:hover td{background:rgba(255,255,255,0.02)!important}
        
        /* ── Responsive Grid ── */
        .stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .chart-row{display:grid;grid-template-columns:1fr;gap:16px}
        .pie-row{display:grid;grid-template-columns:1fr;gap:16px}
        .recent-row{display:grid;grid-template-columns:1fr;gap:16px}
        .crop-grid{display:grid;grid-template-columns:repeat(1,1fr);gap:12px}
        .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .tab-scroll::-webkit-scrollbar{display:none}
        
        @media(min-width:480px){
          .stat-grid{grid-template-columns:repeat(2,1fr)}
          .crop-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(min-width:768px){
          .stat-grid{grid-template-columns:repeat(3,1fr);gap:14px}
          .chart-row{grid-template-columns:1fr 1fr}
          .pie-row{grid-template-columns:1fr 1fr 1fr}
          .recent-row{grid-template-columns:1fr 1fr}
          .crop-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(min-width:1024px){
          .stat-grid{grid-template-columns:repeat(4,1fr)}
          .crop-grid{grid-template-columns:repeat(3,1fr)}
        }
        @media(min-width:1280px){
          .stat-grid{grid-template-columns:repeat(4,1fr)}
        }
        
        .page-pad{padding:16px}
        @media(min-width:768px){.page-pad{padding:24px}}
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Live</span>
          </div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 28px)', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-.02em' }}>
            Admin Control Center
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
            AgriConnect · {lastUpdated || '—'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {blockedUsers > 0 && (
            <div style={{ ...badge('#f59e0b'), padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> {blockedUsers}
            </div>
          )}
          <button onClick={fetchAll}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: '#0d1b2e', border: '1px solid #1e3a5f', borderRadius: 10, color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            <RefreshCw size={13} />
            <span style={{ display: 'none' }} className="show-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Tabs (scrollable on mobile) ── */}
      <div className="tab-scroll" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: '#0d1b2e', border: '1px solid #1e3a5f', borderRadius: 12, padding: 4, width: 'max-content', minWidth: '100%' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize', transition: 'all .2s', whiteSpace: 'nowrap',
                background: activeTab === tab ? '#1e3a5f' : 'transparent',
                color: activeTab === tab ? '#60a5fa' : '#64748b' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            {statCards.map((st, i) => (
              <div key={i} className="dash-card stat-card"
                style={{ ...card, padding: 16, cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${st.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <st.icon size={16} color={st.color} />
                  </div>
                  <ArrowUpRight size={13} color="#22c55e" />
                </div>
                <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{st.label}</p>
                <p style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px', fontFamily: "'DM Mono', monospace" }}>{st.value ?? '—'}</p>
                <Spark data={st.spark} color={st.color} />
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="chart-row" style={{ marginBottom: 16 }}>
            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 600 }}>REVENUE TREND</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '2px 0 0', fontFamily: "'DM Mono', monospace" }}>
                    ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <span style={badge('#22c55e')}>↑ Live</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={45} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ ...card, padding: 18 }}>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 600 }}>USER GROWTH</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '2px 0 0', fontFamily: "'DM Mono', monospace" }}>
                  {stats?.totalUsers || 0} Total
                </p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                  <Bar dataKey="farmers"   name="Farmers"   fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="dealers"   name="Dealers"   fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="customers" name="Customers" fill="#a855f7" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie charts + Quick Actions */}
          <div className="pie-row" style={{ marginBottom: 16 }}>
            <div style={{ ...card, padding: 18 }}>
              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>USER DISTRIBUTION</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                    {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {roleData.map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                    {d.name}: {d.value}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: 18 }}>
              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>PAYMENT STATUS</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={payStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                    {payStatusData.map((_, i) => <Cell key={i} fill={['#22c55e','#f59e0b','#ef4444'][i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {payStatusData.map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: ['#22c55e','#f59e0b','#ef4444'][i], display: 'inline-block' }} />
                    {d.name}: {d.value}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: 18 }}>
              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>QUICK ACTIONS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: '👥 Manage Users',  path: '/admin/users',     color: '#3b82f6' },
                  { label: '🌾 View Crops',    path: '/admin/crops',     color: '#22c55e' },
                  { label: '💳 Payments',      path: '/admin/payments',  color: '#a855f7' },
                  { label: '📋 Schemes',       path: '/admin/schemes',   color: '#f59e0b' },
                  { label: '📈 Analytics',     path: '/admin/analytics', color: '#06b6d4' },
                  { label: '⚙️ Settings',      path: '/admin/settings',  color: '#64748b' },
                ].map((item, i) => (
                  <button key={i} onClick={() => navigate(item.path)} className="action-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: `${item.color}12`, border: `1px solid ${item.color}30`, borderRadius: 10, color: item.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users & Crops */}
          <div className="recent-row">
            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, margin: 0 }}>RECENT USERS</p>
                <button onClick={() => navigate('/admin/users')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All <Eye size={11} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {users.slice(-6).reverse().map((u, i) => {
                  const roleColors = { farmer: '#22c55e', dealer: '#f59e0b', customer: '#a855f7', admin: '#3b82f6' };
                  const rc = roleColors[u.role] || '#64748b';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: '#060d1f', borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${rc}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: rc, flexShrink: 0 }}>
                        {(u.name || 'U')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                        <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>@{u.username}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        <span style={badge(rc)}>{u.role}</span>
                        <span style={{ fontSize: 9, color: u.verified ? '#22c55e' : '#ef4444' }}>
                          {u.verified ? '● Active' : '● Blocked'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {users.length === 0 && <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 16 }}>No users yet</p>}
              </div>
            </div>

            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, margin: 0 }}>RECENT CROPS</p>
                <button onClick={() => navigate('/admin/crops')} style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All <Eye size={11} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {crops.slice(-6).reverse().map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: '#060d1f', borderRadius: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#22c55e22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌾</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{c.quantity} {c.unit}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', margin: 0, fontFamily: "'DM Mono', monospace" }}>₹{c.pricePerUnit}/kg</p>
                      <span style={{ ...badge(c.available ? '#22c55e' : '#64748b'), fontSize: 9 }}>{c.available ? 'Available' : 'Sold'}</span>
                    </div>
                  </div>
                ))}
                {crops.length === 0 && <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 16 }}>No crops yet</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════ USERS TAB ══════════ */}
      {activeTab === 'users' && (
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>All Users</p>
              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{users.length} total · {activeUsers} active · {blockedUsers} blocked</p>
            </div>
            <button onClick={() => navigate('/admin/users')} style={{ padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 9, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Full Management →
            </button>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                  {['#','Name','Username','Phone','City','Role','Status'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rc = { farmer:'#22c55e', dealer:'#f59e0b', customer:'#a855f7', admin:'#3b82f6' }[u.role] || '#64748b';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #0f1e30' }}>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#64748b' }}>{i+1}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap' }}>{u.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#64748b' }}>@{u.username}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#64748b' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#64748b' }}>{u.city || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><span style={badge(rc)}>{u.role}</span></td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 10, color: u.verified ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {u.verified ? '● Active' : '● Blocked'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ CROPS TAB ══════════ */}
      {activeTab === 'crops' && (
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>All Crops</p>
              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{crops.length} total · {availableCrops} available</p>
            </div>
          </div>
          <div className="crop-grid">
            {crops.map((c, i) => (
              <div key={i} style={{ background: '#060d1f', border: '1px solid #1e3a5f', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 24 }}>🌾</div>
                  <span style={{ ...badge(c.available ? '#22c55e' : '#64748b'), fontSize: 10 }}>{c.available ? 'Available' : 'Sold'}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 3px' }}>{c.name}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>{c.category || 'General'} · {c.city || '—'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.quantity} {c.unit}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', fontFamily: "'DM Mono', monospace" }}>₹{c.pricePerUnit}/kg</span>
                </div>
              </div>
            ))}
            {crops.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: 32, gridColumn: '1/-1' }}>No crops in database</p>}
          </div>
        </div>
      )}

      {/* ══════════ PAYMENTS TAB ══════════ */}
      {activeTab === 'payments' && (
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>All Payments</p>
              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{payments.length} total · {completedPay} completed · {failedPay} failed</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={exportToExcel} disabled={exporting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  background: exporting ? '#374151' : 'linear-gradient(135deg,#16a34a,#15803d)',
                  border: 'none', borderRadius: 9, color: 'white', fontSize: 12, fontWeight: 700,
                  cursor: exporting ? 'not-allowed' : 'pointer' }}>
                {exporting
                  ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Exporting...</>
                  : <><FileSpreadsheet size={13} /> Export</>}
              </button>
              <button onClick={() => navigate('/admin/payments')} style={{ padding: '7px 14px', background: '#a855f7', border: 'none', borderRadius: 9, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Full Report →
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                  {['ID','From','To','Amount','Crop','Method','Status','Date'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.slice().reverse().map((p, i) => {
                  const sc = { COMPLETED: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444', REFUNDED: '#a855f7' }[p.status] || '#64748b';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #0f1e30' }}>
                      <td style={{ padding: '10px 12px', fontSize: 10, color: '#64748b', fontFamily: "'DM Mono', monospace" }}>#{p.id}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.fromUsername || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.toUsername || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#22c55e', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>₹{p.amount?.toLocaleString('en-IN') || 0}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.cropName || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 10, color: '#64748b' }}>{p.paymentMethod || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><span style={badge(sc)}>{p.status}</span></td>
                      <td style={{ padding: '10px 12px', fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {payments.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>No payments yet</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;