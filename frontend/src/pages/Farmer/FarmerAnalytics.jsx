import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Package,
  Users, RefreshCw, Download, Loader2, BarChart3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('agri_connect_user') || '{}');
    return user.username || '';
  } catch { return ''; }
};

// ── Inline SVG Bar Chart ──────────────────────────────────────────────────────
const BarChart = ({ data, color = '#15803d', maxVal }) => {
  const max = maxVal || Math.max(...data.map(d => d.value), 1);
  const H = 100;
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${data.length * 44} ${H + 30}`}
        style={{ width: '100%', minWidth: data.length * 44, height: 140 }}
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const barH = (d.value / max) * H;
          const x = i * 44 + 8;
          const y = H - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={28} height={barH} rx={4}
                fill={`url(#grad-${i})`} opacity={0.9} />
              <defs>
                <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <text x={x + 14} y={H + 16} textAnchor="middle"
                fontSize="10" fill="#9ca3af" fontFamily="system-ui">{d.label}</text>
              <text x={x + 14} y={y - 4} textAnchor="middle"
                fontSize="9" fill={color} fontFamily="system-ui" fontWeight="700">
                {d.value > 999 ? `${(d.value / 1000).toFixed(0)}k` : d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Mini Donut Chart ──────────────────────────────────────────────────────────
const DonutChart = ({ segments }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -90;
  const R = 40, cx = 55, cy = 55;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const start = angle;
    angle += pct * 360;
    const largeArc = pct > 0.5 ? 1 : 0;
    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + R * Math.cos(toRad(start));
    const y1 = cy + R * Math.sin(toRad(start));
    const x2 = cx + R * Math.cos(toRad(angle - 0.5));
    const y2 = cy + R * Math.sin(toRad(angle - 0.5));
    return { ...seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`, pct };
  });
  return (
    <svg viewBox="0 0 110 110" style={{ width: 100, height: 100 }}>
      {arcs.map((arc, i) => <path key={i} d={arc.d} fill={arc.color} opacity={0.88} />)}
      <circle cx={cx} cy={cy} r={24} fill="white" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9"
        fontWeight="700" fill="#374151" fontFamily="system-ui">Revenue</text>
    </svg>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const FarmerAnalytics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [toast, setToast] = useState(null);

  const showMsg = (text, type = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchAll(); }, [timeRange]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const username = getUser();

      const [cropsRes, dealsRes, paymentsRes] = await Promise.all([
        fetch(`${API}/crops/my`, { headers }),
        fetch(`${API}/deals/farmer`, { headers }),
        fetch(`${API}/payments/transactions`, { headers }),
      ]);

      const [crops, deals, payments] = await Promise.all([
        cropsRes.json(), dealsRes.json(), paymentsRes.json()
      ]);

      const cropList = crops.success ? (crops.data || []) : [];
      const dealList = deals.success ? (deals.data || []) : [];
      const paymentList = payments.success ? (payments.data || []) : [];

      const received = paymentList.filter(p =>
        p.status === 'COMPLETED' && p.toUsername === username
      );
      const totalRevenue = received.reduce((s, p) => s + (p.amount || 0), 0);
      const completedDeals = dealList.filter(d => d.status === 'COMPLETED').length;
      const activeDeals = dealList.filter(d => d.status === 'ACTIVE').length;

      const cropRevMap = {};
      received.forEach(p => {
        const name = p.cropName || 'Other';
        cropRevMap[name] = (cropRevMap[name] || 0) + p.amount;
      });
      const topCrops = Object.entries(cropRevMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, rev]) => ({ name, revenue: rev }));

      const now = new Date();
      const monthlyRev = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const label = d.toLocaleString('en-IN', { month: 'short' });
        const total = received
          .filter(p => {
            const pd = new Date(p.completedAt || p.createdAt);
            return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
          })
          .reduce((s, p) => s + (p.amount || 0), 0);
        return { label, value: total };
      });

      const statusMap = {};
      dealList.forEach(d => { statusMap[d.status] = (statusMap[d.status] || 0) + 1; });
      const dealColors = { ACTIVE: '#16a34a', COMPLETED: '#2563eb', PENDING: '#d97706', CANCELLED: '#dc2626' };
      const dealSegments = Object.entries(statusMap).map(([k, v]) => ({
        label: k, value: v, color: dealColors[k] || '#9ca3af'
      }));

      setData({
        totalRevenue, cropList, dealList,
        completedDeals, activeDeals,
        totalCrops: cropList.length,
        totalPayments: received.length,
        topCrops, monthlyRev, dealSegments,
        pendingAmount: paymentList
          .filter(p => p.status === 'PENDING' && p.toUsername === username)
          .reduce((s, p) => s + (p.amount || 0), 0),
      });

    } catch (e) {
      console.error('Analytics fetch error:', e);
      showMsg('❌ Could not load analytics data', 'error');
      setData({
        totalRevenue: 0, completedDeals: 0, activeDeals: 0,
        totalCrops: 0, totalPayments: 0, pendingAmount: 0,
        topCrops: [],
        monthlyRev: [
          { label: 'Oct', value: 0 }, { label: 'Nov', value: 0 },
          { label: 'Dec', value: 0 }, { label: 'Jan', value: 0 },
          { label: 'Feb', value: 0 }, { label: 'Mar', value: 0 },
        ],
        dealSegments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', `Rs.${data.totalRevenue}`],
      ['Completed Deals', data.completedDeals],
      ['Active Deals', data.activeDeals],
      ['Total Crops Listed', data.totalCrops],
      ['Payments Received', data.totalPayments],
      ['Pending Amount', `Rs.${data.pendingAmount}`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'farmer-analytics.csv'; a.click();
  };

  const S = {
    page: {
      flex: 1,
      padding: '12px',
      background: 'linear-gradient(135deg,#f0fdf4,#f8fafc)',
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: 'system-ui,sans-serif',
    },
    card: {
      background: 'white',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
      padding: 16,
    },
    btn: (bg, color, border) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '8px 12px',
      background: bg,
      color,
      border: border || 'none',
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }),
  };

  const statCards = data ? [
    { label: t.totalRevenue, value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, change: '+12%', icon: DollarSign, color: '#15803d', bg: '#dcfce7' },
    { label: t.completedDeals, value: data.completedDeals, change: '+8%', icon: Package, color: '#2563eb', bg: '#dbeafe' },
    { label: t.activeDeals, value: data.activeDeals, change: '+5%', icon: Users, color: '#d97706', bg: '#fef3c7' },
    { label: t.myCrops, value: data.totalCrops, change: 'Live', icon: BarChart3, color: '#7c3aed', bg: '#ede9fe' },
  ] : [];

  if (loading) return (
    <main style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #dcfce7', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }

        .analytics-stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .analytics-charts-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .analytics-bottom-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .analytics-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .analytics-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .analytics-header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        @media (min-width: 640px) {
          main[data-analytics] { padding: 16px; }
          .analytics-stat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .analytics-summary-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .analytics-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        @media (min-width: 768px) {
          main[data-analytics] { padding: 20px 16px; }
          .analytics-stat-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .analytics-charts-row {
            grid-template-columns: 1fr 1fr;
          }
          .analytics-bottom-row {
            grid-template-columns: 1fr 2fr;
          }
        }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'white', border: '1.5px solid #fca5a5', color: '#dc2626', boxShadow: '0 8px 30px rgba(0,0,0,.1)', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700, color: '#14532d', margin: 0, fontFamily: 'Georgia,serif' }}>{t.businessAnalytics}</h1>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{t.realTimeInsights}</p>
        </div>
        <div className="analytics-header-actions">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            style={{ padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 12, outline: 'none', background: 'white', cursor: 'pointer' }}
          >
            <option value="week">Last Week</option>
            <option value="month">{t.lastMonth}</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button onClick={fetchAll} style={S.btn('white', '#16a34a', '1px solid #d1fae5')}>
            <RefreshCw size={13} />{t.refresh}
          </button>
          <button onClick={exportCSV} style={S.btn('linear-gradient(135deg,#15803d,#059669)', 'white')}>
            <Download size={13} />{t.exportCSV}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="analytics-stat-grid">
        {statCards.map((st, i) => (
          <div key={i} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <st.icon size={16} color={st.color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={11} />{st.change}
              </span>
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</p>
            <p style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 800, color: '#111827', margin: 0, wordBreak: 'break-all' }}>{st.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-row">
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>📊 {t.monthlySpending}</h3>
            <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{t.last6Months}</span>
          </div>
          <BarChart data={data.monthlyRev} color="#15803d" />
          <div style={{ marginTop: 8, padding: '6px 10px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
            Total: ₹{(data.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>🌾 {t.topCropsPurchased}</h3>
          {data.topCrops?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.topCrops.map((crop, i) => {
                const max = data.topCrops[0]?.revenue || 1;
                const pct = (crop.revenue / max) * 100;
                const colors = ['#15803d', '#2563eb', '#d97706', '#7c3aed', '#dc2626'];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{crop.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: colors[i % 5] }}>₹{(crop.revenue).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[i % 5], borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 12 }}>
              Complete some deals to see crop revenue breakdown
            </div>
          )}
        </div>
      </div>

      {/* Deal Distribution + Insights */}
      <div className="analytics-bottom-row">
        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>📈 {t.requestStatus}</h3>
          {data.dealSegments?.length > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DonutChart segments={data.dealSegments} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {data.dealSegments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: seg.color }} />
                      <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>{seg.label.toLowerCase()}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{seg.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 12 }}>No deal data yet</div>
          )}
        </div>

        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>💡 {t.businessInsights}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { emoji: '📈', title: data.topCrops?.[0] ? `${data.topCrops[0].name} is your top earner` : 'Complete deals to track crop performance', sub: data.topCrops?.[0] ? `₹${data.topCrops[0].revenue.toLocaleString('en-IN')} earned so far` : 'Revenue will appear once payments are received', bg: '#f0fdf4', border: '#bbf7d0', color: '#14532d' },
              { emoji: '🤝', title: `${data.activeDeals} active deal${data.activeDeals !== 1 ? 's' : ''} in progress`, sub: data.activeDeals > 0 ? 'Follow up with dealers to close them' : 'List more crops to attract dealers', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
              { emoji: '💰', title: data.pendingAmount > 0 ? `₹${(data.pendingAmount).toLocaleString('en-IN')} pending payment` : 'All payments received!', sub: data.pendingAmount > 0 ? 'Follow up with dealers for pending amounts' : 'Great job! Your payment record is clean', bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
              { emoji: '🌱', title: `${data.totalCrops} crop${data.totalCrops !== 1 ? 's' : ''} listed on marketplace`, sub: data.totalCrops < 3 ? 'Add more crops to increase visibility' : 'Good variety! Keep listings updated', bg: '#f5f3ff', border: '#ddd6fe', color: '#5b21b6' },
            ].map((item, i) => (
              <div key={i} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: item.color, margin: '0 0 2px' }}>{item.emoji} {item.title}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div style={{ ...S.card, marginTop: 12, background: 'linear-gradient(135deg,#15803d,#059669)', border: 'none' }}>
        <div className="analytics-summary-grid">
          {[
            { label: t.totalRevenue, value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}` },
            { label: t.dealsCompleted, value: data.completedDeals },
            { label: t.moneyReceived, value: data.totalPayments },
            { label: t.pendingPayments, value: `₹${(data.pendingAmount || 0).toLocaleString('en-IN')}` },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', color: 'white', padding: '4px 0' }}>
              <p style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 800, margin: '0 0 3px', wordBreak: 'break-all' }}>{item.value}</p>
              <p style={{ fontSize: 10, opacity: 0.8, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FarmerAnalytics;