import React, { useState, useEffect } from 'react';
import {
  CreditCard, RefreshCw, Download, ArrowDownLeft, Filter,
  Loader2, TrendingUp, Truck, Search, List, Handshake, X, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser  = () => {
  try { return JSON.parse(localStorage.getItem('agri_connect_user') || '{}').username || ''; }
  catch { return ''; }
};

const PAY_STATUS = {
  COMPLETED: { color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
  PENDING:   { color: '#d97706', bg: '#fef3c7', label: 'Pending'   },
  FAILED:    { color: '#dc2626', bg: '#fee2e2', label: 'Failed'     },
  REFUNDED:  { color: '#6b7280', bg: '#f3f4f6', label: 'Refunded'  },
};

const DEAL_STATUS = {
  COMPLETED: { color: '#16a34a', bg: '#dcfce7' },
  ACTIVE:    { color: '#2563eb', bg: '#dbeafe' },
  PENDING:   { color: '#d97706', bg: '#fef3c7' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
};

const CROP_EMOJI = { Wheat:'🌾', Tomato:'🍅', Rice:'🍚', Cotton:'🧵', Potato:'🥔', Maize:'🌽', Soybean:'🫘', Sugarcane:'🎋', Onion:'🧅' };

const getCropEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('wheat'))     return '🌾';
  if (n.includes('rice'))      return '🍚';
  if (n.includes('tomato'))    return '🍅';
  if (n.includes('potato'))    return '🥔';
  if (n.includes('cotton'))    return '🧵';
  if (n.includes('onion'))     return '🧅';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('soybean'))   return '🫘';
  return CROP_EMOJI[name] || '🌿';
};

// ── Responsive styles ─────────────────────────────────────────
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile, isTablet };
};

// ── Deal Detail Modal ─────────────────────────────────────────
const DealDetailModal = ({ deal, transactions, onClose }) => {
  const dealPayments = transactions.filter(t =>
    (t.cropName || '').toLowerCase() === (deal.crop || '').toLowerCase() &&
    (t.fromUsername === deal.dealerUsername || t.fromUsername === deal.dealerName)
  );
  const totalPaid = dealPayments.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + (t.amount || 0), 0);
  const isPaid    = totalPaid >= (deal.totalAmount || 0) * 0.99;
  const cropEmoji = getCropEmoji(deal.crop || '');

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16, backdropFilter:'blur(4px)' }}>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:500, boxShadow:'0 20px 60px rgba(0,0,0,.25)', maxHeight:'88vh', overflowY:'auto' }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(135deg,#f0fdf4,#fff)', borderRadius:'20px 20px 0 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:26 }}>{cropEmoji}</span>
            <div>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#14532d', margin:0 }}>{deal.crop}</h2>
              <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Deal #{deal.id}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'#9ca3af', padding:4 }}>×</button>
        </div>

        <div style={{ padding:'16px 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { label:'Dealer',       value: deal.dealerName || deal.dealer || '—' },
              { label:'Status',       value: (deal.status || '').toLowerCase()      },
              { label:'Quantity',     value: `${deal.quantity} ${deal.unit}`        },
              { label:'Agreed Price', value: `₹${deal.price || deal.agreedPrice || 0}/${deal.unit}` },
              { label:'Total Amount', value: `₹${(deal.totalAmount||0).toLocaleString('en-IN')}`, highlight: true },
              { label:'Amount Paid',  value: `₹${totalPaid.toLocaleString('en-IN')}`, highlight: true, green: true },
            ].map((item, i) => (
              <div key={i} style={{ background:item.highlight?'#f0fdf4':'#f9fafb', borderRadius:10, padding:'10px 12px', border:`1px solid ${item.highlight?'#bbf7d0':'#e5e7eb'}` }}>
                <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 3px', fontWeight:700, textTransform:'uppercase' }}>{item.label}</p>
                <p style={{ fontSize:14, fontWeight:800, color:item.green?'#16a34a':'#111827', margin:0, wordBreak:'break-word' }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div style={{ padding:'12px 14px', borderRadius:12, marginBottom:16, background:isPaid?'#dcfce7':'#fef3c7', border:`1px solid ${isPaid?'#86efac':'#fcd34d'}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>{isPaid ? '✅' : '⏳'}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color:isPaid?'#15803d':'#92400e', margin:0 }}>
                  {isPaid ? 'Payment Received!' : 'Waiting for Payment'}
                </p>
                <p style={{ fontSize:12, color:isPaid?'#16a34a':'#b45309', margin:0 }}>
                  {isPaid
                    ? `Dealer has paid ₹${totalPaid.toLocaleString('en-IN')}`
                    : `₹${(deal.totalAmount - totalPaid).toLocaleString('en-IN')} pending`}
                </p>
              </div>
            </div>
          </div>

          <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 10px' }}>💳 Payment History</p>
          {dealPayments.length === 0 ? (
            <div style={{ textAlign:'center', padding:24, background:'#f9fafb', borderRadius:12, fontSize:13, color:'#9ca3af' }}>
              No payments received yet
            </div>
          ) : dealPayments.map((t, i) => {
            const sc = PAY_STATUS[t.status] || PAY_STATUS.PENDING;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#f9fafb', borderRadius:10, marginBottom:8, border:'1px solid #e5e7eb' }}>
                <div style={{ width:34, height:34, borderRadius:10, background:sc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {cropEmoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{t.paymentMethod || 'Payment'}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:8, background:sc.bg, color:sc.color }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>
                    {t.fromUsername} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : ''}
                  </p>
                </div>
                <p style={{ fontSize:15, fontWeight:800, color:'#16a34a', margin:0, flexShrink:0 }}>+₹{(t.amount||0).toLocaleString('en-IN')}</p>
              </div>
            );
          })}

          <button onClick={onClose} style={{ width:'100%', marginTop:14, padding:'12px', background:'linear-gradient(135deg,#15803d,#059669)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg, icon: Icon }) => (
  <div style={{ background:'white', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 6px rgba(0,0,0,.05)', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
    <div style={{ minWidth:0 }}>
      <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 4px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</p>
      <p style={{ fontSize:18, fontWeight:800, color, margin:0, wordBreak:'break-word' }}>{value}</p>
    </div>
    <div style={{ width:40, height:40, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:8 }}>
      <Icon size={18} color={color}/>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────
const FarmerPayments = () => {
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const [tab, setTab]               = useState('deals');
  const [transactions, setTxns]     = useState([]);
  const [deals, setDeals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [txnFilter, setTxnFilter]   = useState('ALL');
  const [dealFilter, setDealFilter] = useState('all');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [dealDetailModal, setDealDetailModal] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [toast, setToast]           = useState(null);
  const [payForm, setPayForm]       = useState({
    toUsername:'', amount:'', cropName:'', quantity:'', unit:'kg', description:''
  });

  useEffect(() => {
    fetchAll();
    const p = new URLSearchParams(window.location.search);
    if (p.get('status') === 'success') msg('✅ Payment successful!', 'success');
    if (p.get('status') === 'failed')  msg('❌ Payment failed', 'error');
  }, []);

  const msg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const txRes  = await fetch(`${API}/payments/transactions`, { headers });
      const txData = await txRes.json();
      if (txData.success) setTxns(txData.data || []);

      const res  = await fetch(`${API}/deals/farmer`, { headers });
      if (res.status !== 403 && res.status !== 401) {
        const data = await res.json();
        if (data.success) {
          const normalized = (data.data || []).map(d => ({
            ...d,
            crop:           typeof d.crop==='object' && d.crop ? d.crop.name       : (d.crop||''),
            farmerName:     typeof d.farmer==='object' && d.farmer ? d.farmer.name : (d.farmerName||''),
            dealerName:     typeof d.dealer==='object' && d.dealer ? d.dealer.name : (d.dealerName||d.dealer||''),
            dealerUsername: typeof d.dealer==='object' && d.dealer ? d.dealer.username : null,
            quantity:       d.quantity ?? null,
            unit:           d.unit ?? null,
            price:          d.price ?? d.pricePerUnit ?? null,
          }));
          setDeals(normalized);
        }
      }
    } catch { msg('❌ Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    if (!payForm.toUsername || !payForm.amount || !payForm.cropName) {
      msg('❌ Farmer username, crop name and amount are required', 'error');
      return false;
    }
    return true;
  };

  const handleOnlinePayment = async () => {
    if (!validateForm()) return;
    setPayLoading(true);
    try {
      const res = await fetch(`${API}/payments/create-order`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({
          toUsername:payForm.toUsername, amount:parseFloat(payForm.amount),
          cropName:payForm.cropName, quantity:parseFloat(payForm.quantity)||1,
          unit:payForm.unit, description:payForm.description||`Payment for ${payForm.cropName}`,
        })
      });
      const data = await res.json();
      if (!data.success) { msg('❌ '+data.message,'error'); setPayLoading(false); return; }
      const { txnId, amount, productInfo, merchantKey, hash, payuUrl, surl, furl } = data.data;
      const form = document.createElement('form');
      form.method='POST'; form.action=payuUrl;
      const fields = { key:merchantKey, txnid:txnId, amount:amount.toString(), productinfo:productInfo, firstname:'AgriConnect', email:'noreply@agriconnect.com', phone:'9999999999', surl, furl, hash };
      Object.entries(fields).forEach(([name,value]) => {
        const input = document.createElement('input');
        input.type='hidden'; input.name=name; input.value=value;
        form.appendChild(input);
      });
      document.body.appendChild(form); form.submit();
    } catch { msg('❌ Something went wrong','error'); setPayLoading(false); }
  };

  const handleCash = async () => {
    if (!validateForm()) return;
    setPayLoading(true);
    try {
      const res = await fetch(`${API}/payments/cash`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({
          toUsername:payForm.toUsername, amount:parseFloat(payForm.amount),
          cropName:payForm.cropName, quantity:parseFloat(payForm.quantity)||1,
          unit:payForm.unit, description:payForm.description||`Cash for ${payForm.cropName}`,
        })
      });
      const data = await res.json();
      if (data.success) {
        msg('✅ Cash payment recorded!');
        setShowModal(false);
        setPayForm({ toUsername:'', amount:'', cropName:'', quantity:'', unit:'kg', description:'' });
        fetchAll();
      } else msg('❌ '+data.message,'error');
    } catch { msg('❌ Something went wrong','error'); }
    finally { setPayLoading(false); }
  };

  const exportCSV = () => {
    const header = ['Date','Invoice','Crop','Amount','Method','Status','From','To'];
    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleDateString('en-IN'),
      t.invoiceNumber||'-', t.cropName||'-', '₹'+t.amount,
      t.paymentMethod||'-', t.status, t.fromUsername, t.toUsername,
    ]);
    const csv = [header,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = 'transactions.csv'; a.click();
  };

  const username      = getUser();
  const filteredTxns  = transactions.filter(t => txnFilter==='ALL' ? true : t.status===txnFilter);
  const filteredDeals = deals.filter(d => {
    const matchSearch = !search
      || (d.crop||'').toLowerCase().includes(search.toLowerCase())
      || (d.dealerName||'').toLowerCase().includes(search.toLowerCase());
    const matchFilter = dealFilter==='all' || (d.status||'').toLowerCase()===dealFilter;
    return matchSearch && matchFilter;
  });

  const totalReceived  = transactions.filter(t=>t.status==='COMPLETED'&&t.toUsername===username).reduce((s,t)=>s+(t.amount||0),0);
  const activeDeals    = deals.filter(d=>(d.status||'').toUpperCase()==='ACTIVE').length;
  const completedDeals = deals.filter(d=>(d.status||'').toUpperCase()==='COMPLETED').length;
  const dealRevenue    = deals.filter(d=>(d.status||'').toUpperCase()==='COMPLETED').reduce((s,d)=>s+(d.totalAmount||0),0);

  const S = {
    page: {
      flex:1,
      padding: isMobile ? '14px 12px' : '20px 16px',
      background:'linear-gradient(135deg,#f0fdf4,#f8fafc)',
      minHeight:'100vh',
      boxSizing:'border-box',
      fontFamily:'system-ui,sans-serif'
    },
    card: { background:'white', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.05)', padding: isMobile ? 14 : 18 },
    btn: (bg,color,border)=>({
      display:'flex', alignItems:'center', gap:6,
      padding: isMobile ? '8px 12px' : '9px 16px',
      background:bg, color, border:border||'none', borderRadius:10,
      fontSize: isMobile ? 12 : 13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'
    }),
    input: { width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:14, outline:'none', boxSizing:'border-box' },
    label: { fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', display:'block', marginBottom:5 },
  };

  if (loading) return (
    <main style={S.page}>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
        <div style={{ width:40, height:40, border:'3px solid #dcfce7', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <style>{`
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        .deal-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.1)!important}
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:16, right:16, left: isMobile ? 16 : 'auto', zIndex:200, padding:'12px 18px', borderRadius:12, fontSize:13, fontWeight:600, background:'white', border:`1.5px solid ${toast.type==='success'?'#86efac':'#fca5a5'}`, color:toast.type==='success'?'#15803d':'#dc2626', boxShadow:'0 8px 30px rgba(0,0,0,.12)' }}>
          {toast.text}
        </div>
      )}

      {dealDetailModal && (
        <DealDetailModal deal={dealDetailModal} transactions={transactions} onClose={() => setDealDetailModal(null)} />
      )}

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:'#14532d', margin:0 }}>{t.dealsAndPayments}</h1>
          <p style={{ fontSize:12, color:'#6b7280', margin:'4px 0 0' }}>{t.manageYourDealsAndTrackAllTransactions}</p>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <button onClick={fetchAll}               style={S.btn('white','#16a34a','1px solid #d1fae5')}><RefreshCw size={13}/>{!isMobile && t.refresh}</button>
          <button onClick={exportCSV}              style={S.btn('#f0fdf4','#15803d','1px solid #86efac')}><Download size={13}/>{!isMobile && t.export}</button>
          <button onClick={()=>setShowModal(true)} style={S.btn('linear-gradient(135deg,#15803d,#059669)','white')}><CreditCard size={13}/>{isMobile ? 'Pay' : t.makePayment}</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        <StatCard label={t.totalTransactions}  value={transactions.length}                          color="#374151" bg="#f3f4f6" icon={List}        />
        <StatCard label={t.moneyReceived}      value={`₹${totalReceived.toLocaleString('en-IN')}`} color="#16a34a" bg="#dcfce7" icon={ArrowDownLeft}/>
        <StatCard label={t.activeDeals}        value={activeDeals}                                  color="#2563eb" bg="#dbeafe" icon={Handshake}   />
        <StatCard label={t.dealRevenue}        value={`₹${dealRevenue.toLocaleString('en-IN')}`}   color="#d97706" bg="#fef3c7" icon={TrendingUp}  />
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:4, marginBottom:14, background:'white', padding:4, borderRadius:12, border:'1px solid #e5e7eb', width:'fit-content', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
        {[
          { key:'deals',    label:`🤝 ${t.myDeals}`,  count:deals.length        },
          { key:'payments', label:`💳 ${t.payments}`,  count:transactions.length },
        ].map(tab_item => (
          <button key={tab_item.key} onClick={()=>{ setTab(tab_item.key); setSearch(''); }}
            style={{ padding: isMobile ? '7px 14px' : '8px 20px', borderRadius:9, border:'none', fontSize: isMobile ? 12 : 13, fontWeight:700, cursor:'pointer', background:tab===tab_item.key?'linear-gradient(135deg,#15803d,#059669)':'transparent', color:tab===tab_item.key?'white':'#6b7280', display:'flex', alignItems:'center', gap:6 }}>
            {tab_item.label}
            <span style={{ fontSize:11, background:tab===tab_item.key?'rgba(255,255,255,.25)':'#e5e7eb', color:tab===tab_item.key?'white':'#9ca3af', padding:'1px 7px', borderRadius:10, fontWeight:700 }}>{tab_item.count}</span>
          </button>
        ))}
      </div>

      {/* ═══ DEALS TAB ═══ */}
      {tab==='deals' && (
        <>
          <div style={{ ...S.card, marginBottom:12, padding:'12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <div style={{ position:'relative', flex:1, minWidth: isMobile ? '100%' : 200 }}>
                <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}/>
                <input placeholder={t.searchByCropOrDealer} value={search} onChange={e=>setSearch(e.target.value)}
                  style={{ ...S.input, paddingLeft:32, fontSize:13 }}/>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', width: isMobile ? '100%' : 'auto' }}>
                {['all','active','pending','completed','cancelled'].map(f=>(
                  <button key={f} onClick={()=>setDealFilter(f)}
                    style={{ padding:'5px 10px', borderRadius:20, border:'none', fontSize:11, fontWeight:600, cursor:'pointer', background:dealFilter===f?'#dcfce7':'#f9fafb', color:dealFilter===f?'#15803d':'#6b7280', outline:dealFilter===f?'1.5px solid #86efac':'none' }}>
                    {f === 'all' ? t.all : f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
              <span style={{ fontSize:12, color:'#9ca3af', marginLeft:'auto', display: isMobile ? 'none' : 'block' }}>{filteredDeals.length} {t.deals}</span>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filteredDeals.length === 0 ? (
              <div style={{ ...S.card, textAlign:'center', padding:40 }}>
                <p style={{ fontSize:36, margin:'0 0 10px' }}>🤝</p>
                <p style={{ fontSize:14, color:'#374151', fontWeight:700, margin:'0 0 4px' }}>{t.noDealsFound}</p>
                <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{t.tryAdjustingYourFilters}</p>
              </div>
            ) : filteredDeals.map(deal => {
              const st = DEAL_STATUS[(deal.status||'PENDING').toUpperCase()] || DEAL_STATUS.PENDING;
              const emoji = getCropEmoji(deal.crop || '');
              const paidForDeal = transactions.filter(t =>
                t.status==='COMPLETED' &&
                (t.cropName||'').toLowerCase()===(deal.crop||'').toLowerCase() &&
                (t.fromUsername===deal.dealerUsername || t.fromUsername===deal.dealerName)
              ).reduce((s,t)=>s+(t.amount||0),0);
              const isPaid = deal.totalAmount > 0 && paidForDeal >= deal.totalAmount * 0.99;

              return (
                <div key={deal.id} className="deal-card"
                  onClick={() => setDealDetailModal(deal)}
                  style={{ ...S.card, display:'flex', alignItems:'center', gap:12, padding: isMobile ? '12px 14px' : '14px 18px', cursor:'pointer', transition:'box-shadow .15s' }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{deal.crop}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:st.bg, color:st.color }}>{(deal.status||'').toLowerCase()}</span>
                      {!isMobile && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:isPaid?'#dcfce7':'#fef3c7', color:isPaid?'#16a34a':'#d97706' }}>
                        {isPaid ? '✅ Paid' : '⏳ Pending'}
                      </span>}
                    </div>
                    <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 2px' }}>
                      With <strong style={{ color:'#374151' }}>{deal.dealerName||deal.dealer||'Dealer'}</strong>
                    </p>
                    <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>
                      {deal.quantity} {deal.unit}{deal.price && ` • ₹${deal.price}/${deal.unit}`}
                    </p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize: isMobile ? 15 : 18, fontWeight:800, color:'#111827', margin:'0 0 3px' }}>₹{(deal.totalAmount||0).toLocaleString('en-IN')}</p>
                    {!isMobile && <span style={{ fontSize:11, color:'#9ca3af' }}>Click to view →</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {deals.length > 0 && (
            <div style={{ ...S.card, marginTop:12, display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Completion Rate', value:`${Math.round((completedDeals/deals.length)*100)}%`, color:'#16a34a', pct:(completedDeals/deals.length)*100 },
                { label:'Avg Deal Size',   value:`₹${Math.round(deals.reduce((s,d)=>s+(d.totalAmount||0),0)/deals.length).toLocaleString('en-IN')}`, color:'#2563eb', pct:60 },
                { label:'Active Deals',    value:`${activeDeals} running`, color:'#d97706', pct:deals.length?(activeDeals/deals.length)*100:0 },
              ].map((item,i)=>(
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#6b7280', fontWeight:600 }}>{item.label}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:item.color }}>{item.value}</span>
                  </div>
                  <div style={{ height:6, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:4, transition:'width 1s ease' }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ PAYMENTS TAB ═══ */}
      {tab==='payments' && (
        <>
          <div style={{ ...S.card, marginBottom:12, padding:'12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <Filter size={13} color="#9ca3af"/>
              {['ALL','COMPLETED','PENDING','FAILED'].map(f=>(
                <button key={f} onClick={()=>setTxnFilter(f)}
                  style={{ padding:'5px 12px', borderRadius:20, border:'none', fontSize:11, fontWeight:600, cursor:'pointer', background:txnFilter===f?'#dcfce7':'#f9fafb', color:txnFilter===f?'#15803d':'#6b7280', outline:txnFilter===f?'1.5px solid #86efac':'none' }}>
                  {f==='ALL'?'All':f.charAt(0)+f.slice(1).toLowerCase()}
                </button>
              ))}
              <span style={{ marginLeft:'auto', fontSize:11, color:'#9ca3af' }}>{filteredTxns.length} {t.transactions}</span>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filteredTxns.length === 0 ? (
              <div style={{ ...S.card, textAlign:'center', padding:40 }}>
                <p style={{ fontSize:36, margin:'0 0 10px' }}>💳</p>
                <p style={{ fontSize:14, color:'#374151', fontWeight:700, margin:'0 0 4px' }}>{t.noTransactionsFound}</p>
                <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{t.noPaymentHistory}</p>
              </div>
            ) : filteredTxns.map(tx => {
              const sc = PAY_STATUS[tx.status] || PAY_STATUS.PENDING;
              const isIncoming = tx.toUsername === username;
              const emoji = getCropEmoji(tx.cropName || '');
              return (
                <div key={tx.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:12, padding: isMobile ? '12px 14px' : '14px 18px' }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:isIncoming?'#dcfce7':'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>
                    {emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{tx.cropName||'Payment'}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:10, background:sc.bg, color:sc.color }}>{sc.label}</span>
                      {!isMobile && tx.paymentMethod && <span style={{ fontSize:10, color:'#6b7280', background:'#f3f4f6', padding:'2px 7px', borderRadius:10 }}>{tx.paymentMethod.replace('_',' ')}</span>}
                    </div>
                    <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 2px' }}>
                      <strong>{tx.fromUsername}</strong> → <strong>{tx.toUsername}</strong>
                    </p>
                    <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : ''}
                    </p>
                  </div>
                  <p style={{ fontSize: isMobile ? 15 : 18, fontWeight:800, color:isIncoming?'#16a34a':'#374151', margin:0, flexShrink:0 }}>
                    {isIncoming?'+':'-'}₹{(tx.amount||0).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MAKE PAYMENT MODAL */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent:'center', zIndex:100, padding: isMobile ? 0 : 16, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'white', borderRadius: isMobile ? '20px 20px 0 0' : 20, width:'100%', maxWidth: isMobile ? '100%' : 460, boxShadow:'0 20px 60px rgba(0,0,0,.2)', maxHeight: isMobile ? '92vh' : '90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #f3f4f6', position:'sticky', top:0, background:'white', borderRadius: isMobile ? '20px 20px 0 0' : '20px 20px 0 0' }}>
              <span style={{ fontWeight:800, fontSize:15, color:'#111827' }}>💳 {t.makePayment}</span>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'#9ca3af', lineHeight:1, padding:4 }}>×</button>
            </div>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={S.label}>{t.dealer} Username *</label>
                  <input style={S.input} placeholder="e.g. mrunal_dealer" value={payForm.toUsername} onChange={e=>setPayForm({...payForm,toUsername:e.target.value})}/>
                </div>
                <div>
                  <label style={S.label}>{t.crop} *</label>
                  <input style={S.input} placeholder="e.g. Wheat" value={payForm.cropName} onChange={e=>setPayForm({...payForm,cropName:e.target.value})}/>
                </div>
                <div>
                  <label style={S.label}>{t.amount} (₹) *</label>
                  <input style={S.input} type="number" placeholder="0.00" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})}/>
                </div>
                <div>
                  <label style={S.label}>{t.mostQuantity}</label>
                  <input style={S.input} type="number" placeholder="100" value={payForm.quantity} onChange={e=>setPayForm({...payForm,quantity:e.target.value})}/>
                </div>
                <div>
                  <label style={S.label}>{t.variety}</label>
                  <select style={S.input} value={payForm.unit} onChange={e=>setPayForm({...payForm,unit:e.target.value})}>
                    {['kg','quintal','ton','litre','piece'].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={S.label}>{t.orderDetails}</label>
                  <input style={S.input} placeholder="Payment for..." value={payForm.description} onChange={e=>setPayForm({...payForm,description:e.target.value})}/>
                </div>
              </div>
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 12px', marginBottom:14, fontSize:12, color:'#15803d' }}>
                💳 Online payment via <strong>PayU</strong> — UPI, Card, Net Banking supported
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>setShowModal(false)} style={{ ...S.btn('white','#6b7280','1.5px solid #e5e7eb'), flex:1, justifyContent:'center' }}>{t.cancelled}</button>
                <button onClick={handleCash} disabled={payLoading} style={{ ...S.btn('#f0fdf4','#15803d','1.5px solid #86efac'), flex:1, justifyContent:'center' }}>
                  {payLoading ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : '💵'} Cash
                </button>
                <button onClick={handleOnlinePayment} disabled={payLoading} style={{ ...S.btn('linear-gradient(135deg,#15803d,#059669)','white'), flex:1, justifyContent:'center' }}>
                  {payLoading ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <CreditCard size={13}/>} Online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FarmerPayments;