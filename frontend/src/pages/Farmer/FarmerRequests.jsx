import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Filter, Check, X, Clock, MessageSquare, User, Package, DollarSign, MapPin, Calendar, Loader2, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/requests';
const getToken = () => localStorage.getItem('agri_connect_token');

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

const FarmerRequests = () => {
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [negotiateModal, setNegotiateModal] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/farmer`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(id + '_accept');
    try {
      const res = await fetch(`${API_URL}/${id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r));
        setMessage('✅ Request accepted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      const res = await fetch(`${API_URL}/${id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
        setMessage('❌ Request rejected.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleNegotiate = async () => {
    if (!counterPrice || isNaN(counterPrice)) return;
    setActionLoading(negotiateModal.id + '_negotiate');
    try {
      const res = await fetch(`${API_URL}/${negotiateModal.id}/negotiate?counterPrice=${counterPrice}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r =>
          r.id === negotiateModal.id ? { ...r, status: 'NEGOTIATING', counterPrice } : r
        ));
        setMessage('💬 Counter offer sent!');
        setTimeout(() => setMessage(''), 3000);
        setNegotiateModal(null);
        setCounterPrice('');
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const getCropEmoji = (cropName) => {
    const map = { Wheat: '🌾', Tomato: '🍅', Rice: '🍚', Cotton: '🧵', Potato: '🥔', Maize: '🌽', Soybean: '🫘', Sugarcane: '🎋' };
    return map[cropName] || '🌿';
  };

  const filteredRequests = requests.filter(r => {
    const cropName = r.crop?.name || '';
    const dealerName = r.dealer?.name || '';
    const matchSearch = cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        dealerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount  = requests.filter(r => r.status === 'PENDING').length;
  const acceptedCount = requests.filter(r => r.status === 'ACCEPTED').length;
  const totalValue    = requests.filter(r => r.status === 'ACCEPTED').reduce((sum, r) => sum + (r.quantity * r.offeredPrice), 0);

  const S = {
    page: {
      flex: 1,
      padding: isMobile ? '14px 12px' : '20px 24px',
      background: 'linear-gradient(135deg,#fff7ed,#fffbeb)',
      minHeight: '100vh',
      fontFamily: 'system-ui,sans-serif',
      boxSizing: 'border-box',
    },
    card: {
      background: 'white',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
      overflow: 'hidden',
    },
    statCard: {
      background: 'white',
      borderRadius: 14,
      padding: isMobile ? '12px 14px' : '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1.5px solid #e5e7eb',
      borderRadius: 10,
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
    },
  };

  return (
    <main style={S.page}>
      <style>{`
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        .req-card{transition:box-shadow .2s}
        .req-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1)!important}
        .action-btn{transition:opacity .15s}
        .action-btn:hover{opacity:0.88}
        .action-btn:active{transform:scale(0.97)}
      `}</style>

      {/* Toast */}
      {message && (
        <div style={{ position:'fixed', top:16, right:16, left: isMobile ? 16 : 'auto', zIndex:50, background:'white', border:'1px solid #e5e7eb', borderRadius:12, padding:'12px 20px', boxShadow:'0 8px 24px rgba(0,0,0,.12)', fontWeight:600, fontSize:13, color:'#374151' }}>
          {message}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight:800, color:'#1f2937', margin:'0 0 4px' }}>
            {t?.requests || 'Purchase Requests'}
          </h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>View and manage purchase requests from dealers</p>
        </div>
        <button
          onClick={fetchRequests}
          style={{ display:'flex', alignItems:'center', gap:6, background:'white', border:'1px solid #e5e7eb', padding:'8px 14px', borderRadius:10, color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom:20 }}>
        {[
          { label: t.totalRequests, value: requests.length,    color: '#ea580c', bg: '#fff7ed', icon: <Package size={18} color="#ea580c" /> },
          { label: t.accepted,      value: acceptedCount,      color: '#16a34a', bg: '#f0fdf4', icon: <Check size={18} color="#16a34a" /> },
          { label: t.pending,       value: pendingCount,       color: '#d97706', bg: '#fef3c7', icon: <Clock size={18} color="#d97706" /> },
          { label: t.totalValue,    value: `₹${totalValue.toLocaleString()}`, color: '#7c3aed', bg: '#f5f3ff', icon: <DollarSign size={18} color="#7c3aed" /> },
        ].map((stat, i) => (
          <div key={i} style={S.statCard}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize: isMobile ? 10 : 12, color:'#6b7280', margin:'0 0 4px', fontWeight:600 }}>{stat.label}</p>
                <p style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:stat.color, margin:0 }}>{stat.value}</p>
              </div>
              <div style={{ width:40, height:40, borderRadius:10, background:stat.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ background:'white', borderRadius:14, padding: isMobile ? '12px 14px' : '16px 20px', boxShadow:'0 2px 8px rgba(0,0,0,.06)', marginBottom:20 }}>
        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:10 }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} size={16} />
            <input
              type="text"
              placeholder={t.searchByCropOrDealer}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...S.input, paddingLeft:36 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...S.input, width: isMobile ? '100%' : 'auto', minWidth: 140 }}
          >
            <option value="all">{t.allStatus}</option>
            <option value="pending">{t.pending}</option>
            <option value="accepted">{t.accepted}</option>
            <option value="rejected">{t.rejected}</option>
            <option value="negotiating">{t.negotiating}</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', gap:12 }}>
          <Loader2 style={{ animation:'spin 1s linear infinite', color:'#ea580c' }} size={36} />
          <p style={{ color:'#6b7280', fontSize:14, margin:0 }}>Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 20px', background:'white', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
          <h3 style={{ fontSize:16, fontWeight:700, color:'#374151', margin:'0 0 8px' }}>{t.noRequestsFound}</h3>
          <p style={{ fontSize:13, color:'#9ca3af', margin:0 }}>{t.whenDealersShowInterestInYourCropsTheyWillAppearHere}</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 12 : 16, marginBottom:20 }}>
          {filteredRequests.map((request) => (
            <div key={request.id} className="req-card" style={{ ...S.card }}>
              <div style={{ padding: isMobile ? '14px 16px' : '18px 20px' }}>

                {/* Header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ background:'#fff7ed', width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <User color="#ea580c" size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight:700, color:'#1f2937', margin:'0 0 2px', fontSize:14 }}>{request.dealer?.name || 'Unknown Dealer'}</h3>
                      <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{request.dealer?.city || ''}</p>
                    </div>
                  </div>
                  <span style={{
                    padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:600,
                    background: request.status === 'PENDING' ? '#fef3c7' : request.status === 'ACCEPTED' ? '#dcfce7' : request.status === 'REJECTED' ? '#fee2e2' : '#f3e8ff',
                    color:      request.status === 'PENDING' ? '#b45309' : request.status === 'ACCEPTED' ? '#15803d' : request.status === 'REJECTED' ? '#dc2626' : '#7c3aed',
                  }}>
                    {request.status?.charAt(0) + request.status?.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Crop */}
                <div style={{ background:'#f9fafb', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:24 }}>{getCropEmoji(request.crop?.name)}</span>
                      <div>
                        <h4 style={{ fontWeight:700, color:'#111827', margin:'0 0 2px', fontSize:14 }}>{request.crop?.name || 'Unknown Crop'}</h4>
                        <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>Qty: {request.quantity} {request.unit}</p>
                      </div>
                    </div>
                    {request.urgency && (
                      <span style={{
                        padding:'3px 8px', borderRadius:20, fontSize:10, fontWeight:600,
                        background: request.urgency === 'high' ? '#fee2e2' : request.urgency === 'medium' ? '#fef3c7' : '#dcfce7',
                        color:      request.urgency === 'high' ? '#dc2626' : request.urgency === 'medium' ? '#b45309' : '#16a34a',
                      }}>
                        {request.urgency} priority
                      </span>
                    )}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns: request.counterPrice ? '1fr 1fr' : '1fr', gap:10 }}>
                    <div>
                      <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 2px' }}>Offered Price</p>
                      <p style={{ fontSize:16, fontWeight:800, color:'#16a34a', margin:0 }}>₹{request.offeredPrice}/{request.unit}</p>
                    </div>
                    {request.counterPrice && (
                      <div>
                        <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 2px' }}>Your Counter</p>
                        <p style={{ fontSize:16, fontWeight:800, color:'#2563eb', margin:0 }}>₹{request.counterPrice}/{request.unit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:12 }}>
                  {request.deliveryDate && (
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#6b7280' }}>
                      <Calendar size={12} /><span>{request.deliveryDate}</span>
                    </div>
                  )}
                  {request.crop?.city && (
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#6b7280' }}>
                      <MapPin size={12} /><span>{request.crop.city}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#6b7280' }}>
                    <Clock size={12} /><span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div style={{ marginBottom:12, padding:'10px 12px', background:'#eff6ff', borderRadius:10, border:'1px solid #bfdbfe' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <MessageSquare size={13} color="#3b82f6" style={{ marginTop:1, flexShrink:0 }} />
                      <p style={{ fontSize:12, color:'#374151', margin:0 }}>{request.message}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(request.status === 'PENDING' || request.status === 'NEGOTIATING') ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                    <button className="action-btn"
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id + '_accept'}
                      style={{ background:'linear-gradient(135deg,#16a34a,#059669)', color:'white', border:'none', padding: isMobile ? '10px 6px' : '10px 8px', borderRadius:10, fontSize: isMobile ? 11 : 13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, opacity: actionLoading === request.id + '_accept' ? 0.6 : 1 }}
                    >
                      {actionLoading === request.id + '_accept' ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> : <Check size={13} />}
                      Accept
                    </button>
                    <button className="action-btn"
                      onClick={() => { setNegotiateModal(request); setCounterPrice(request.offeredPrice); }}
                      style={{ background:'linear-gradient(135deg,#2563eb,#06b6d4)', color:'white', border:'none', padding: isMobile ? '10px 6px' : '10px 8px', borderRadius:10, fontSize: isMobile ? 11 : 13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}
                    >
                      💬 Negotiate
                    </button>
                    <button className="action-btn"
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id + '_reject'}
                      style={{ background:'linear-gradient(135deg,#ef4444,#ec4899)', color:'white', border:'none', padding: isMobile ? '10px 6px' : '10px 8px', borderRadius:10, fontSize: isMobile ? 11 : 13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4, opacity: actionLoading === request.id + '_reject' ? 0.6 : 1 }}
                    >
                      {actionLoading === request.id + '_reject' ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> : <X size={13} />}
                      Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'8px 0' }}>
                    <span style={{ fontSize:13, fontWeight:700, color: request.status === 'ACCEPTED' ? '#16a34a' : '#dc2626' }}>
                      Request {request.status?.charAt(0) + request.status?.slice(1).toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Negotiate Modal */}
      {negotiateModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent:'center', zIndex:50, padding: isMobile ? 0 : 16, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'white', borderRadius: isMobile ? '20px 20px 0 0' : 16, padding:'20px 24px', width:'100%', maxWidth: isMobile ? '100%' : 380, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:'#111827', margin:'0 0 6px' }}>💬 Send Counter Offer</h3>
            <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 16px' }}>
              {negotiateModal.crop?.name} — Dealer offered ₹{negotiateModal.offeredPrice}/{negotiateModal.unit}
            </p>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:8 }}>Your Price (₹/{negotiateModal.unit})</label>
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              style={{ width:'100%', border:'1.5px solid #d1d5db', borderRadius:10, padding:'11px 14px', marginBottom:16, fontSize:14, outline:'none', boxSizing:'border-box' }}
              placeholder="Enter your counter price"
            />
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => { setNegotiateModal(null); setCounterPrice(''); }}
                style={{ flex:1, border:'1px solid #d1d5db', background:'white', color:'#374151', padding:'11px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleNegotiate}
                disabled={actionLoading !== null}
                style={{ flex:1, background:'linear-gradient(135deg,#2563eb,#06b6d4)', color:'white', border:'none', padding:'11px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', opacity: actionLoading ? 0.6 : 1 }}
              >
                {actionLoading ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} /> : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div style={{ background:'white', borderRadius:16, padding: isMobile ? '14px 16px' : '18px 22px', boxShadow:'0 2px 8px rgba(0,0,0,.06)', marginTop: filteredRequests.length === 0 ? 20 : 0 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1f2937', margin:'0 0 14px' }}>💡 Quick Tips</h3>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:10 }}>
          {[
            { bg:'#f0fdf4', titleColor:'#15803d', descColor:'#16a34a', title: t.checkDealerRatings, desc: t.alwaysVerifyDealerCredibilityBeforeAccepting },
            { bg:'#eff6ff', titleColor:'#1d4ed8', descColor:'#2563eb', title: t.negotiateSmartly, desc: t.compareWithMarketPricesBeforeCountering },
            { bg:'#f5f3ff', titleColor:'#6d28d9', descColor:'#7c3aed', title: t.reviewDeliveryTerms, desc: t.ensureDeliveryDatesAndLogisticsAreClear },
          ].map((tip, i) => (
            <div key={i} style={{ padding:'12px 14px', background:tip.bg, borderRadius:12 }}>
              <p style={{ fontWeight:700, color:tip.titleColor, margin:'0 0 4px', fontSize:13 }}>{tip.title}</p>
              <p style={{ fontSize:12, color:tip.descColor, margin:0 }}>{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FarmerRequests;