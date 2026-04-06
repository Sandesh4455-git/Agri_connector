//MyOrders
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Eye, X, RefreshCw, Clock, CheckCircle, XCircle, Truck, CreditCard } from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

const STATUS_CFG = {
  PENDING:     { color:'#d97706', bg:'#fef9c3', border:'#fcd34d', label:'Pending',     icon:Clock        },
  CONFIRMED:   { color:'#2563eb', bg:'#dbeafe', border:'#93c5fd', label:'Confirmed',   icon:CheckCircle  },
  SHIPPED:     { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', label:'Shipped',     icon:Truck        },
  DELIVERED:   { color:'#16a34a', bg:'#dcfce7', border:'#86efac', label:'Delivered',   icon:CheckCircle  },
  CANCELLED:   { color:'#dc2626', bg:'#fee2e2', border:'#fca5a5', label:'Cancelled',   icon:XCircle      },
  NEGOTIATING: { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', label:'Negotiating', icon:Clock        },
  ACCEPTED:    { color:'#16a34a', bg:'#dcfce7', border:'#86efac', label:'Accepted',    icon:CheckCircle  },
  REJECTED:    { color:'#dc2626', bg:'#fee2e2', border:'#fca5a5', label:'Rejected',    icon:XCircle      },
  COMPLETED:   { color:'#16a34a', bg:'#dcfce7', border:'#86efac', label:'Completed',   icon:CheckCircle  },
};

const cropEmoji = n => {
  const s = (n||'').toLowerCase();
  if(s.includes('wheat'))     return '🌾';
  if(s.includes('rice'))      return '🍚';
  if(s.includes('tomato'))    return '🍅';
  if(s.includes('potato'))    return '🥔';
  if(s.includes('onion'))     return '🧅';
  if(s.includes('corn')||s.includes('maize')) return '🌽';
  if(s.includes('mango'))     return '🥭';
  if(s.includes('banana'))    return '🍌';
  if(s.includes('chilli'))    return '🌶️';
  if(s.includes('cucumber'))  return '🥒';
  if(s.includes('sugarcane')) return '🎋';
  return '🌱';
};

const MyOrders = () => {
  const { t } = useLanguage();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('All');
  const [detail,     setDetail]     = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [paying,     setPaying]     = useState(null);
  const [payModal,   setPayModal]   = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (text, type='success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization:`Bearer ${getToken()}` };
      const res  = await fetch(`${API}/requests/customer`, { headers });
      const data = await res.json();
      if (data.success) {
        const mapped = (data.data || []).map(r => ({
          id:             r.id,
          _src:           'request',
          cropName:       r.crop?.name || '—',
          quantity:       r.quantity || 0,
          unit:           r.unit || r.crop?.unit || 'kg',
          pricePerUnit:   r.counterPrice || r.offeredPrice || 0,
          offeredPrice:   r.offeredPrice || 0,
          counterPrice:   r.counterPrice || null,
          totalAmount:    (r.counterPrice || r.offeredPrice || 0) * (r.quantity || 0),
          status:         r.status || 'PENDING',
          paymentMethod:  'COD',
          paymentStatus:  'PENDING',
          farmerName:     r.farmer?.name || '—',
          farmerUsername: r.farmer?.username || '—',
          city:           r.crop?.city || r.farmer?.city || '—',
          createdAt:      r.createdAt,
          notes:          r.message || '—',
        }));
        mapped.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
        setOrders(mapped);
      }
    } catch {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      const res  = await fetch(`${API}/requests/customer/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization:`Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order cancelled successfully');
        fetchOrders();
        setDetail(null);
      } else {
        showToast(data.message || 'Cannot cancel', 'error');
      }
    } catch {
      showToast('Error cancelling', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const handlePayment = async (order, method) => {
    setPaying(order.id);
    try {
      const isCash = method === 'COD';
      const url = isCash ? `${API}/payments/cash` : `${API}/payments/create-order`;
      const body = {
        toUsername:  order.farmerUsername,
        amount:      order.totalAmount,
        cropName:    order.cropName,
        quantity:    order.quantity,
        unit:        order.unit,
        description: `Payment for ${order.cropName} - Order #${order.id}`,
      };
      const res  = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        if (isCash) {
          showToast('Cash payment recorded! ✅ Farmer will be notified.');
          setPayModal(null);
          setDetail(null);
          fetchOrders();
        } else {
          const { txnId, amount, productInfo, merchantKey, hash, payuUrl, surl, furl } = data.data;
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = payuUrl;
          const fields = { key:merchantKey, txnid:txnId, amount, productinfo:productInfo, firstname:'Customer', email:'customer@agriconnect.com', phone:'9999999999', surl, furl, hash };
          Object.entries(fields).forEach(([k,v]) => {
            const input = document.createElement('input');
            input.type='hidden'; input.name=k; input.value=v;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        showToast(data.message || 'Payment failed', 'error');
      }
    } catch {
      showToast('Payment error — try again', 'error');
    } finally {
      setPaying(null);
    }
  };

  const TABS = [t.all, t.pending, t.negotiating, t.accepted, t.rejected, t.completed, t.cancelled];
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ fontFamily:"'Nunito',system-ui,sans-serif", minHeight:'100vh', background:'#fafdf7', padding:'16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .ord-row { animation:fadeUp .25s ease forwards; opacity:0; transition:background .15s; }
        @media (hover:hover) { .ord-row:hover { background:#f0fdf4!important; } }
        .pay-opt { transition:all .15s; cursor:pointer; width:100%; }
        @media (hover:hover) { .pay-opt:hover { transform:translateY(-2px); box-shadow:0 4px 14px rgba(0,0,0,.1)!important; } }

        /* Toast — full width on mobile */
        .ord-toast {
          position: fixed;
          top: 16px;
          left: 16px;
          right: 16px;
          z-index: 400;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          background: white;
          box-shadow: 0 6px 20px rgba(0,0,0,.1);
        }
        @media (min-width: 480px) {
          .ord-toast { left: auto; right: 20px; max-width: 320px; }
        }

        /* Header */
        .ord-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ord-title { font-size: clamp(20px, 5vw, 28px); font-weight: 900; color: #14532d; margin: 0; }

        /* Cards layout for mobile (replaces table) */
        .ord-cards { display: flex; flex-direction: column; gap: 12px; }
        .ord-table-wrap {
          background: white;
          border-radius: 20px;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
        }
        .ord-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* Hide table / show cards on small screens */
        @media (max-width: 700px) {
          .ord-table-wrap { display: none; }
          .ord-cards { display: flex; }
        }
        @media (min-width: 701px) {
          .ord-cards { display: none; }
        }

        /* Action buttons in table */
        .ord-action-cell { display: flex; gap: 5px; flex-wrap: wrap; }

        /* Detail / pay modal inner scroll */
        .modal-inner {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 30px 80px rgba(0,0,0,.25);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 10px;
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="ord-toast" style={{ border:`2px solid ${toast.type==='error'?'#fca5a5':'#86efac'}`, color:toast.type==='error'?'#dc2626':'#15803d' }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="ord-header">
        <div>
          <h1 className="ord-title">📋 {t.myOrders}</h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:'4px 0 0' }}>{orders.length} {t.totalOrders}</p>
        </div>
        <button onClick={fetchOrders} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', background:'white', border:'1.5px solid #c8e6d4', borderRadius:12, fontSize:13, color:'#2e7d52', cursor:'pointer', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
          <RefreshCw size={14}/> {t.refresh}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${filter===tab?'#16a34a':'#c8e6d4'}`, background:filter===tab?'#16a34a':'white', color:filter===tab?'white':'#2a5a3a', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all .15s' }}>
            {tab==='All' ? `All (${orders.length})` : `${tab[0]+tab.slice(1).toLowerCase()} (${orders.filter(o=>o.status===tab).length})`}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <div style={{ width:40, height:40, border:'3px solid #dcfce7', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:60, background:'white', borderRadius:20, border:'1.5px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
          <p style={{ fontSize:48, margin:'0 0 12px' }}>📦</p>
          <p style={{ fontSize:16, fontWeight:800, color:'#374151', margin:0 }}>{t.noOrdersFound}</p>
          <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>
            {filter==='All' ? "You haven't placed any orders yet" : `No ${filter.toLowerCase()} orders`}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (<>

        {/* ── Desktop Table ── */}
        <div className="ord-table-wrap">
          <div className="ord-table-scroll">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#1a3a28' }}>
                  {['Crop','Quantity','Amount','Status','Payment','Date','Action'].map(h => (
                    <th key={h} style={{ padding:'13px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#a8d8bc', textTransform:'uppercase', letterSpacing:'.08em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const sc = STATUS_CFG[o.status] || STATUS_CFG.PENDING;
                  const Icon = sc.icon;
                  const canCancel = ['PENDING','NEGOTIATING'].includes(o.status);
                  const canPay    = o.status === 'ACCEPTED';
                  return (
                    <tr key={o.id} className="ord-row" style={{ borderBottom:'1px solid #f0fdf4', animationDelay:`${i*.04}s` }}>
                      <td style={{ padding:'13px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:22, flexShrink:0 }}>{cropEmoji(o.cropName)}</span>
                          <div style={{ minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:800, color:'#14532d', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120 }}>{o.cropName}</p>
                            <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>#{o.id}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'13px 16px', fontSize:13, fontWeight:700, color:'#374151', whiteSpace:'nowrap' }}>{o.quantity} {o.unit}</td>
                      <td style={{ padding:'13px 16px', fontSize:15, fontWeight:900, color:'#16a34a', whiteSpace:'nowrap' }}>₹{Number(o.totalAmount||0).toLocaleString('en-IN')}</td>
                      <td style={{ padding:'13px 16px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                          <Icon size={11}/> {sc.label}
                        </span>
                      </td>
                      <td style={{ padding:'13px 16px', fontSize:12, color:'#6b7280', fontWeight:600, whiteSpace:'nowrap' }}>{o.paymentMethod||'COD'}</td>
                      <td style={{ padding:'13px 16px', fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding:'13px 16px' }}>
                        <div className="ord-action-cell">
                          <button onClick={() => setDetail(o)} style={{ padding:'5px 10px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, color:'#16a34a', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                            <Eye size={12}/> View
                          </button>
                          {canPay && (
                            <button onClick={() => setPayModal(o)}
                              style={{ padding:'5px 10px', background:'linear-gradient(135deg,#16a34a,#15803d)', border:'none', borderRadius:8, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, boxShadow:'0 2px 8px rgba(22,163,74,.3)', whiteSpace:'nowrap' }}>
                              <CreditCard size={12}/> Pay Now
                            </button>
                          )}
                          {canCancel && (
                            <button onClick={() => handleCancel(o.id)} disabled={cancelling===o.id}
                              style={{ padding:'5px 10px', background:'#fff1f2', border:'1px solid #fecaca', borderRadius:8, color:'#ef4444', fontSize:11, fontWeight:700, cursor:'pointer', opacity:cancelling===o.id ? .6 : 1, whiteSpace:'nowrap' }}>
                              {cancelling===o.id ? '...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Mobile Cards (shown below 700px) ── */}
        <div className="ord-cards">
          {filtered.map((o, i) => {
            const sc = STATUS_CFG[o.status] || STATUS_CFG.PENDING;
            const Icon = sc.icon;
            const canCancel = ['PENDING','NEGOTIATING'].includes(o.status);
            const canPay    = o.status === 'ACCEPTED';
            return (
              <div key={o.id} style={{ background:'white', borderRadius:16, border:'1.5px solid #e5e7eb', padding:'14px', boxShadow:'0 2px 8px rgba(0,0,0,.05)', animationDelay:`${i*.04}s` }}>
                {/* Top row */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                    <span style={{ fontSize:26, flexShrink:0 }}>{cropEmoji(o.cropName)}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:800, color:'#14532d', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.cropName}</p>
                      <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>Order #{o.id}</p>
                    </div>
                  </div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                    <Icon size={11}/> {sc.label}
                  </span>
                </div>
                {/* Details grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                  <div style={{ background:'#f9fafb', borderRadius:10, padding:'8px 10px' }}>
                    <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 2px', fontWeight:700 }}>QUANTITY</p>
                    <p style={{ fontSize:13, fontWeight:800, color:'#374151', margin:0 }}>{o.quantity} {o.unit}</p>
                  </div>
                  <div style={{ background:'#f0fdf4', borderRadius:10, padding:'8px 10px' }}>
                    <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 2px', fontWeight:700 }}>AMOUNT</p>
                    <p style={{ fontSize:14, fontWeight:900, color:'#16a34a', margin:0 }}>₹{Number(o.totalAmount||0).toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ background:'#f9fafb', borderRadius:10, padding:'8px 10px' }}>
                    <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 2px', fontWeight:700 }}>PAYMENT</p>
                    <p style={{ fontSize:12, fontWeight:700, color:'#374151', margin:0 }}>{o.paymentMethod||'COD'}</p>
                  </div>
                  <div style={{ background:'#f9fafb', borderRadius:10, padding:'8px 10px' }}>
                    <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 2px', fontWeight:700 }}>DATE</p>
                    <p style={{ fontSize:12, fontWeight:700, color:'#374151', margin:0 }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={() => setDetail(o)} style={{ flex:1, minWidth:80, padding:'9px 10px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, color:'#16a34a', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                    <Eye size={13}/> View
                  </button>
                  {canPay && (
                    <button onClick={() => setPayModal(o)}
                      style={{ flex:2, minWidth:100, padding:'9px 10px', background:'linear-gradient(135deg,#16a34a,#15803d)', border:'none', borderRadius:10, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, boxShadow:'0 2px 8px rgba(22,163,74,.3)' }}>
                      <CreditCard size={13}/> Pay Now
                    </button>
                  )}
                  {canCancel && (
                    <button onClick={() => handleCancel(o.id)} disabled={cancelling===o.id}
                      style={{ flex:1, minWidth:80, padding:'9px 10px', background:'#fff1f2', border:'1px solid #fecaca', borderRadius:10, color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer', opacity:cancelling===o.id ? .6 : 1 }}>
                      {cancelling===o.id ? '...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </>)}

      {/* ── Payment Modal ── */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:250, padding:16 }}>
          <div style={{ background:'white', borderRadius:24, padding:'24px 20px', width:'100%', maxWidth:400, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 80px rgba(0,0,0,.3)' }}>
            <div className="modal-header">
              <div style={{ minWidth:0 }}>
                <h2 style={{ fontSize:18, fontWeight:900, color:'#14532d', margin:0 }}>💳 Complete Payment</h2>
                <p style={{ fontSize:12, color:'#9ca3af', margin:'4px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {payModal.cropName} — ₹{Number(payModal.totalAmount).toLocaleString('en-IN')}
                </p>
              </div>
              <button onClick={() => setPayModal(null)} style={{ background:'#fee2e2', border:'none', borderRadius:8, padding:'6px 8px', cursor:'pointer', color:'#dc2626', flexShrink:0 }}><X size={16}/></button>
            </div>

            {/* Summary */}
            <div style={{ background:'#f0fdf4', borderRadius:14, padding:14, marginBottom:18, border:'1.5px solid #bbf7d0' }}>
              {[
                ['Crop',     payModal.cropName],
                ['Farmer',   payModal.farmerName],
                ['Quantity', `${payModal.quantity} ${payModal.unit}`],
                ['Total',    `₹${Number(payModal.totalAmount).toLocaleString('en-IN')}`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, gap:8 }}>
                  <span style={{ fontSize:12, color:'#6a9a7a', fontWeight:700, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:13, color:'#14532d', fontWeight:800, textAlign:'right', wordBreak:'break-word' }}>{v}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize:13, fontWeight:800, color:'#374151', marginBottom:10 }}>Select Payment Method:</p>
            <div style={{ display:'grid', gap:10 }}>
              {[
                { method:'COD',    emoji:'🤝', label:'Cash on Delivery', sub:'Pay when you receive the crop',  color:'#16a34a' },
                { method:'UPI',    emoji:'📱', label:'UPI Payment',       sub:'GPay, PhonePe, Paytm',           color:'#7c3aed' },
                { method:'ONLINE', emoji:'💳', label:'Online / Card',     sub:'Debit/Credit card, Net banking', color:'#2563eb' },
              ].map(opt => (
                <button key={opt.method} className="pay-opt"
                  onClick={() => handlePayment(payModal, opt.method)}
                  disabled={paying === payModal.id}
                  style={{ padding:'13px 16px', background:'white', border:'2px solid #e5e7eb', borderRadius:14, textAlign:'left', opacity:paying===payModal.id ? .6 : 1, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{opt.emoji}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:800, color:opt.color, margin:0 }}>{opt.label}</p>
                      <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{opt.sub}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {paying === payModal.id && (
              <p style={{ textAlign:'center', fontSize:12, color:'#6a9a7a', marginTop:12, fontWeight:700 }}>Processing payment...</p>
            )}
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detail && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div className="modal-inner" style={{ padding:'22px 18px' }}>
            <div className="modal-header">
              <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                <span style={{ fontSize:26, flexShrink:0 }}>{cropEmoji(detail.cropName)}</span>
                <div style={{ minWidth:0 }}>
                  <h2 style={{ fontSize:17, fontWeight:900, color:'#14532d', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{detail.cropName}</h2>
                  <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>Order #{detail.id}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background:'#fee2e2', border:'none', borderRadius:8, padding:'6px 8px', cursor:'pointer', color:'#dc2626', flexShrink:0 }}><X size={16}/></button>
            </div>

            <div style={{ display:'grid', gap:8 }}>
              {[
                ['Status', (()=>{ const sc=STATUS_CFG[detail.status]||STATUS_CFG.PENDING; return <span style={{ padding:'3px 10px', borderRadius:20, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, fontSize:12, fontWeight:700 }}>{sc.label}</span>; })()],
                ['Crop',          detail.cropName],
                ['Farmer',        detail.farmerName],
                ['City',          detail.city],
                ['Quantity',      `${detail.quantity} ${detail.unit}`],
                ['Offered Price', `₹${detail.offeredPrice}/${detail.unit}`],
                ...(detail.counterPrice ? [['Counter Price', `₹${detail.counterPrice}/${detail.unit}`]] : []),
                ['Total Amount',  `₹${Number(detail.totalAmount||0).toLocaleString('en-IN')}`],
                ['Notes',         detail.notes],
                ['Ordered On',    detail.createdAt ? new Date(detail.createdAt).toLocaleString('en-IN') : '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'#f8fffe', borderRadius:10, border:'1px solid #e0f0e8', gap:8 }}>
                  <span style={{ fontSize:12, color:'#6a9a7a', fontWeight:700, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:13, color:'#1a3a28', fontWeight:800, textAlign:'right', wordBreak:'break-word', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>

            {detail.status === 'ACCEPTED' && (
              <button onClick={() => { setDetail(null); setPayModal(detail); }}
                style={{ width:'100%', marginTop:16, padding:13, background:'linear-gradient(135deg,#16a34a,#15803d)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(22,163,74,.3)' }}>
                <CreditCard size={16}/> Pay Now — ₹{Number(detail.totalAmount||0).toLocaleString('en-IN')}
              </button>
            )}
            {['PENDING','NEGOTIATING'].includes(detail.status) && (
              <button onClick={() => handleCancel(detail.id)} disabled={cancelling===detail.id}
                style={{ width:'100%', marginTop:12, padding:12, background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', opacity:cancelling===detail.id ? .7 : 1 }}>
                {cancelling===detail.id ? 'Cancelling...' : 'Cancel This Order'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;