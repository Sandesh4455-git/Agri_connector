// src/pages/Dealer/DealerPayments.jsx
// Responsive version — works on mobile, tablet, desktop

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCard, RefreshCw, Download, ArrowUpRight, Filter, Loader2
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/payments';
const getToken = () => localStorage.getItem('agri_connect_token');

const statusConfig = {
  COMPLETED: { color: '#16a34a', bg: '#dcfce7', label: 'Completed' },
  PENDING:   { color: '#d97706', bg: '#fef3c7', label: 'Pending'   },
  FAILED:    { color: '#dc2626', bg: '#fee2e2', label: 'Failed'    },
  REFUNDED:  { color: '#6b7280', bg: '#f3f4f6', label: 'Refunded'  },
};

const RESPONSIVE_CSS = `
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .dp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .dp-header-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .dp-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .dp-filter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 12px 16px;
    margin-bottom: 14px;
  }

  .dp-modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }
  .dp-modal-full { grid-column: 1 / -1; }

  .dp-modal-btns {
    display: flex;
    gap: 8px;
  }

  /* Tablet */
  @media (max-width: 768px) {
    .dp-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* Mobile */
  @media (max-width: 480px) {
    .dp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .dp-header { flex-direction: column; }
    .dp-header-actions { width: 100%; }
    .dp-header-actions > button { flex: 1; justify-content: center; }
    .dp-modal-grid { grid-template-columns: 1fr; }
    .dp-modal-btns { flex-direction: column; }
    .dp-modal-btns > button { width: 100%; }
    .dp-filter-bar { flex-direction: column; align-items: stretch; }
    .dp-filter-bar > span { text-align: right; }
  }
`;

const DealerPayments = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('ALL');
  const [showModal, setShowModal]       = useState(false);
  const [payLoading, setPayLoading]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [payForm, setPayForm] = useState({
    toUsername: '', amount: '', cropName: '', quantity: '', unit: 'kg', description: ''
  });

  useEffect(() => {
    fetchTransactions();
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') msg('✅ Payment successful!', 'success');
    if (status === 'failed')  msg('❌ Payment failed or cancelled', 'error');
  }, []);

  const msg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setTransactions(data.data || []);
    } catch {
      msg('❌ Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
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
      const res = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          toUsername:  payForm.toUsername,
          amount:      parseFloat(payForm.amount),
          cropName:    payForm.cropName,
          quantity:    parseFloat(payForm.quantity) || 1,
          unit:        payForm.unit,
          description: payForm.description || `Payment for ${payForm.cropName}`,
        })
      });
      const data = await res.json();
      if (!data.success) { msg('❌ ' + data.message, 'error'); setPayLoading(false); return; }

      const { txnId, amount, productInfo, merchantKey, hash, payuUrl, surl, furl } = data.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuUrl;
      const fields = {
        key: merchantKey, txnid: txnId,
        amount: amount.toString(), productinfo: productInfo,
        firstname: 'AgriConnect', email: 'noreply@agriconnect.com',
        phone: '9999999999', surl, furl, hash,
      };
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      msg('❌ Something went wrong', 'error');
      setPayLoading(false);
    }
  };

  const handleCash = async () => {
    if (!validateForm()) return;
    setPayLoading(true);
    try {
      const res = await fetch(`${API_URL}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          toUsername:  payForm.toUsername,
          amount:      parseFloat(payForm.amount),
          cropName:    payForm.cropName,
          quantity:    parseFloat(payForm.quantity) || 1,
          unit:        payForm.unit,
          description: payForm.description || `Cash for ${payForm.cropName}`,
        })
      });
      const data = await res.json();
      if (data.success) {
        msg('✅ Cash payment recorded!');
        setShowModal(false);
        setPayForm({ toUsername: '', amount: '', cropName: '', quantity: '', unit: 'kg', description: '' });
        fetchTransactions();
      } else {
        msg('❌ ' + data.message, 'error');
      }
    } catch {
      msg('❌ Something went wrong', 'error');
    } finally {
      setPayLoading(false);
    }
  };

  const exportCSV = () => {
    const header = ['Date', 'Invoice', 'Crop', 'Amount', 'Method', 'Status', 'To Farmer'];
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleDateString('en-IN'),
      tx.invoiceNumber || '-',
      tx.cropName      || '-',
      '₹' + tx.amount,
      tx.paymentMethod || '-',
      tx.status,
      tx.toUsername,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'dealer-transactions.csv';
    a.click();
  };

  const filtered = transactions.filter(tx =>
    filter === 'ALL' ? true : tx.status === filter
  );

  const totalPaid    = transactions.filter(tx => tx.status === 'COMPLETED').reduce((s, tx) => s + (tx.amount || 0), 0);
  const totalPending = transactions.filter(tx => tx.status === 'PENDING').reduce((s, tx) => s + (tx.amount || 0), 0);

  const S = {
    page:  { flex:1, padding:'20px 16px', background:'linear-gradient(135deg,#eff6ff,#f8fafc)', minHeight:'100vh', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' },
    card:  { background:'white', borderRadius:14, border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.05)', padding:18 },
    btn:   (bg, color, border) => ({ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', background:bg, color, border:border||'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }),
    input: { width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'system-ui' },
    label: { fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', display:'block', marginBottom:5 },
  };

  if (loading) return (
    <main style={S.page}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
        <div style={{ width:40, height:40, border:'3px solid #dbeafe', borderTop:'3px solid #2563eb', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <style>{RESPONSIVE_CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:100, padding:'12px 20px', borderRadius:12, fontSize:13, fontWeight:600, background:'white', border:`1.5px solid ${toast.type==='success'?'#86efac':'#fca5a5'}`, color:toast.type==='success'?'#15803d':'#dc2626', boxShadow:'0 8px 30px rgba(0,0,0,.1)', maxWidth:'calc(100vw - 40px)' }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="dp-header">
        <div>
          <h1 style={{ fontSize:'clamp(20px,5vw,24px)', fontWeight:700, color:'#1e3a5f', margin:0, fontFamily:'Georgia,serif' }}>
            {t?.payments || 'Payments'}
          </h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:'4px 0 0' }}>
            {t?.managePayments || 'Manage your payments to farmers'}
          </p>
        </div>
        <div className="dp-header-actions">
          <button onClick={fetchTransactions} style={S.btn('white','#2563eb','1px solid #bfdbfe')}>
            <RefreshCw size={14}/>{t?.refresh || 'Refresh'}
          </button>
          <button onClick={exportCSV} style={S.btn('#eff6ff','#1d4ed8','1px solid #93c5fd')}>
            <Download size={14}/>{t?.exportCSV || 'Export CSV'}
          </button>
          <button onClick={() => setShowModal(true)} style={S.btn('linear-gradient(135deg,#1d4ed8,#2563eb)','white')}>
            <CreditCard size={14}/>{t?.payFarmer || 'Pay Farmer'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dp-stats-grid">
        {[
          { label: t?.total      || 'Total',       value: transactions.length,                                    color:'#374151' },
          { label: t?.totalPaid  || 'Total Paid',  value: `₹${totalPaid.toLocaleString('en-IN')}`,               color:'#2563eb' },
          { label: t?.pending    || 'Pending',      value: `₹${totalPending.toLocaleString('en-IN')}`,            color:'#d97706' },
          { label: t?.completed  || 'Completed',    value: transactions.filter(tx => tx.status === 'COMPLETED').length, color:'#16a34a' },
        ].map((st, i) => (
          <div key={i} style={S.card}>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 5px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{st.label}</p>
            <p style={{ fontSize:'clamp(16px,3.5vw,22px)', fontWeight:700, color:st.color, margin:0 }}>{st.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="dp-filter-bar" style={S.card}>
        <Filter size={14} color="#9ca3af"/>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:1 }}>
          {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding:'5px 14px', borderRadius:20, border:'none', fontSize:12, fontWeight:600, cursor:'pointer', background:filter===f?'#dbeafe':'#f9fafb', color:filter===f?'#1d4ed8':'#6b7280', outline:filter===f?'1.5px solid #93c5fd':'none', whiteSpace:'nowrap' }}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span style={{ fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>
          {filtered.length} {t?.transactions || 'transactions'}
        </span>
      </div>

      {/* Transaction List */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.length === 0 ? (
          <div style={{ ...S.card, textAlign:'center', padding:48 }}>
            <p style={{ fontSize:40, margin:'0 0 12px' }}>💳</p>
            <p style={{ fontSize:15, color:'#374151', fontWeight:600, margin:'0 0 4px' }}>
              {t?.noPaymentsYet || 'No payments yet'}
            </p>
            <p style={{ fontSize:13, color:'#9ca3af', margin:0 }}>
              {t?.clickPayFarmer || 'Click "Pay Farmer" to make your first payment'}
            </p>
          </div>
        ) : filtered.map(tx => {
          const sc = statusConfig[tx.status] || statusConfig.PENDING;
          return (
            <div key={tx.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <div style={{ width:42, height:42, minWidth:42, borderRadius:12, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ArrowUpRight size={18} color="#2563eb"/>
              </div>
              <div style={{ flex:1, minWidth:120 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{tx.cropName || 'Payment'}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:10, background:sc.bg, color:sc.color }}>{sc.label}</span>
                  {tx.paymentMethod && (
                    <span style={{ fontSize:11, color:'#6b7280', background:'#f3f4f6', padding:'2px 8px', borderRadius:10 }}>
                      {tx.paymentMethod.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 2px' }}>
                  To: <strong>{tx.toUsername}</strong>
                  {tx.invoiceNumber && <span style={{ marginLeft:8, color:'#9ca3af' }}>#{tx.invoiceNumber}</span>}
                </p>
                <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>
                  {tx.quantity && tx.unit ? `${tx.quantity} ${tx.unit} • ` : ''}
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>
              <p style={{ fontSize:'clamp(14px,3.5vw,18px)', fontWeight:700, color:'#1d4ed8', margin:0, flexShrink:0 }}>
                -₹{(tx.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pay Farmer Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,.2)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #f3f4f6', position:'sticky', top:0, background:'white', zIndex:1 }}>
              <span style={{ fontWeight:700, fontSize:16, color:'#111827' }}>💳 Pay Farmer</span>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#9ca3af' }}>×</button>
            </div>
            <div style={{ padding:24 }}>
              <div className="dp-modal-grid">
                <div className="dp-modal-full">
                  <label style={S.label}>Farmer Username *</label>
                  <input style={S.input} placeholder="e.g. ramesh_farmer" value={payForm.toUsername} onChange={e => setPayForm({ ...payForm, toUsername: e.target.value })}/>
                </div>
                <div>
                  <label style={S.label}>Crop Name *</label>
                  <input style={S.input} placeholder="e.g. Wheat" value={payForm.cropName} onChange={e => setPayForm({ ...payForm, cropName: e.target.value })}/>
                </div>
                <div>
                  <label style={S.label}>Amount (₹) *</label>
                  <input style={S.input} type="number" placeholder="0.00" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })}/>
                </div>
                <div>
                  <label style={S.label}>Quantity</label>
                  <input style={S.input} type="number" placeholder="100" value={payForm.quantity} onChange={e => setPayForm({ ...payForm, quantity: e.target.value })}/>
                </div>
                <div>
                  <label style={S.label}>Unit</label>
                  <select style={S.input} value={payForm.unit} onChange={e => setPayForm({ ...payForm, unit: e.target.value })}>
                    {['kg', 'quintal', 'ton', 'litre', 'piece'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="dp-modal-full">
                  <label style={S.label}>Description</label>
                  <input style={S.input} placeholder="Payment for..." value={payForm.description} onChange={e => setPayForm({ ...payForm, description: e.target.value })}/>
                </div>
              </div>
              <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#1d4ed8' }}>
                💳 Online payment redirects to <strong>PayU</strong> — UPI, Card, Net Banking, Wallets supported
              </div>
              <div className="dp-modal-btns">
                <button onClick={() => setShowModal(false)} style={{ ...S.btn('white','#6b7280','1.5px solid #e5e7eb'), flex:1, justifyContent:'center' }}>
                  Cancel
                </button>
                <button onClick={handleCash} disabled={payLoading} style={{ ...S.btn('#f0fdf4','#15803d','1.5px solid #86efac'), flex:1, justifyContent:'center' }}>
                  {payLoading ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : '💵'} Cash
                </button>
                <button onClick={handleOnlinePayment} disabled={payLoading} style={{ ...S.btn('linear-gradient(135deg,#1d4ed8,#2563eb)','white'), flex:1, justifyContent:'center' }}>
                  {payLoading ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <CreditCard size={13}/>} Pay Online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DealerPayments;