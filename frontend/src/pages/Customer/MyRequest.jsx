// MyRequests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, RefreshCw, Clock, CheckCircle, XCircle, X, MessageCircle } from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

const STATUS_CFG = {
  PENDING:    { color:'#d97706', bg:'#fef9c3', border:'#fcd34d', label:'Pending',    icon:Clock        },
  NEGOTIATING:{ color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', label:'Negotiating',icon:MessageCircle},
  ACCEPTED:   { color:'#16a34a', bg:'#dcfce7', border:'#86efac', label:'Accepted',   icon:CheckCircle  },
  REJECTED:   { color:'#dc2626', bg:'#fee2e2', border:'#fca5a5', label:'Rejected',   icon:XCircle      },
  COMPLETED:  { color:'#16a34a', bg:'#dcfce7', border:'#86efac', label:'Completed',  icon:CheckCircle  },
  CANCELLED:  { color:'#6b7280', bg:'#f3f4f6', border:'#d1d5db', label:'Cancelled',  icon:XCircle      },
};

const cropEmoji = n => {
  const s=(n||'').toLowerCase();
  if(s.includes('wheat'))return'🌾'; if(s.includes('rice'))return'🍚'; if(s.includes('tomato'))return'🍅';
  if(s.includes('potato'))return'🥔'; if(s.includes('onion'))return'🧅'; if(s.includes('chilli'))return'🌶️';
  if(s.includes('corn')||s.includes('maize'))return'🌽'; if(s.includes('mango'))return'🥭'; return'🌱';
};

const MyRequests = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [detail,   setDetail]   = useState(null);
  const [cancelling,setCancelling] = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = (text,type='success') => { setToast({text,type}); setTimeout(()=>setToast(null),3000); };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/requests/customer`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setRequests(data.data||[]);
      else setRequests([]);
    } catch { showToast('Failed to load requests','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ fetchRequests(); }, [fetchRequests]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      const res  = await fetch(`${API}/requests/customer/${id}/cancel`, { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) { showToast('Request withdrawn'); fetchRequests(); setDetail(null); }
      else showToast(data.message||'Cannot cancel','error');
    } catch { showToast('Error','error'); }
    finally { setCancelling(null); }
  };

  const TABS = [t.all,t.pending,t.negotiating,t.accepted,t.rejected,t.completed,t.cancelled];

  const filtered = requests
    .filter(r => {
      const matchFilter = filter==='All' || r.status===filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (r.crop?.name||r.cropName||'').toLowerCase().includes(q) ||
        (r.farmer?.name||r.farmerUsername||'').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

  return (
    <div style={{ fontFamily:"'Nunito',system-ui,sans-serif", minHeight:'100vh', background:'#ffffff', padding:'24px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .req-card{animation:fadeUp .25s ease forwards;opacity:0;transition:all .18s}
        .req-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,60,30,.1)!important}

        /* RESPONSIVE OVERRIDES */
        @media (max-width: 640px) {
          /* Header stacks */
          .responsive-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .responsive-header button {
            align-self: flex-start;
          }
          /* Filter tabs scroll horizontally */
          .filter-tabs {
            overflow-x: auto;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            padding-bottom: 8px;
          }
          .filter-tabs button {
            flex-shrink: 0;
          }
          /* Cards: column layout */
          .card-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .card-left {
            width: 100% !important;
          }
          .card-right {
            width: 100% !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          /* Modal adjustments */
          .modal-container {
            padding: 20px !important;
          }
          .modal-inner {
            max-width: 100% !important;
            margin: 0 12px !important;
          }
        }
        @media (max-width: 480px) {
          .modal-container {
            padding: 12px !important;
          }
          .modal-inner {
            padding: 20px !important;
          }
        }
      `}</style>

      {toast && (
        <div style={{position:'fixed',top:20,right:20,zIndex:300,padding:'10px 18px',borderRadius:12,fontSize:13,fontWeight:700,background:'white',border:`2px solid ${toast.type==='error'?'#fca5a5':'#86efac'}`,color:toast.type==='error'?'#dc2626':'#15803d',boxShadow:'0 6px 20px rgba(0,0,0,.1)'}}>
          {toast.text}
        </div>
      )}

      {/* Header – responsive with class */}
      <div className="responsive-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:900,color:'#14532d',margin:0}}>📨 {t.myRequests}</h1>
          <p style={{fontSize:13,color:'#6b7280',margin:'4px 0 0'}}>{requests.length} {t.requestsToFarmers}</p>
        </div>
        <button onClick={fetchRequests} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',background:'white',border:'1.5px solid #c8e6d4',borderRadius:12,fontSize:13,color:'#2e7d52',cursor:'pointer',fontWeight:700}}>
          <RefreshCw size={14}/> {t.refresh}
        </button>
      </div>

      {/* Search + filters – responsive wrapping */}
      <div style={{background:'white',borderRadius:16,border:'1.5px solid #c8e6d4',padding:'12px 16px',marginBottom:16,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:'1 1 220px'}}>
          <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#9abfaa'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t.searchCropFarmer}
            style={{width:'100%',padding:'8px 10px 8px 34px',border:'1.5px solid #c8e6d4',borderRadius:20,fontSize:13,outline:'none',background:'white',boxSizing:'border-box'}}/>
        </div>
        <div className="filter-tabs" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {TABS.map(tab=>(
            <button key={tab} onClick={()=>setFilter(tab)}
              style={{padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filter===tab?'#16a34a':'#c8e6d4'}`,background:filter===tab?'#16a34a':'white',color:filter===tab?'white':'#2a5a3a',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all .15s'}}>
              {tab==='All'?`All (${requests.length})`:tab[0]+tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:60}}>
          <div style={{width:40,height:40,border:'3px solid #dcfce7',borderTop:'3px solid #16a34a',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
        </div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:'center',padding:60,background:'white',borderRadius:20,border:'1.5px solid #c8e6d4'}}>
          <p style={{fontSize:48,margin:'0 0 12px'}}>📭</p>
          <p style={{fontSize:16,fontWeight:800,color:'#374151',margin:0}}>{search?'No matching requests':t.noRequests}</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:'6px 0 0'}}>{search?'Try different keywords': t.browseSendRequest}</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtered.map((req,i)=>{
            const cropName = req.crop?.name || req.cropName || 'Unknown Crop';
            const sc  = STATUS_CFG[req.status] || STATUS_CFG.PENDING;
            const Icon= sc.icon;
            const counterDiff = req.counterPrice && req.counterPrice!==req.offeredPrice;
            return (
              <div key={req.id} className="req-card"
                style={{background:'white',border:'1.5px solid #c8e6d4',borderRadius:16,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,boxShadow:'0 2px 10px rgba(0,60,30,.05)',animationDelay:`${i*.05}s`,cursor:'pointer'}}
                onClick={()=>setDetail(req)}>
                <div className="card-content" style={{display:'flex',alignItems:'center',gap:14,minWidth:0,width:'100%'}}>
                  <div className="card-left" style={{display:'flex',alignItems:'center',gap:14,flex:1,minWidth:0}}>
                    <div style={{width:48,height:48,borderRadius:14,background:sc.bg,border:`1.5px solid ${sc.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:22}}>
                      {cropEmoji(cropName)}
                    </div>
                    <div style={{minWidth:0}}>
                      <p style={{fontSize:15,fontWeight:800,color:'#1a3a28',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cropName}</p>
                      <p style={{fontSize:12,color:'#6a9a7a',margin:'0 0 4px'}}>
                        Farmer: {req.farmer?.name||req.farmerUsername||'—'} · {req.quantity} {req.unit}
                      </p>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:13,fontWeight:800,color:'#16a34a'}}>₹{req.offeredPrice}/{req.unit}</span>
                        {counterDiff && <>
                          <span style={{fontSize:11,color:'#9ca3af'}}>→</span>
                          <span style={{fontSize:13,fontWeight:800,color:'#7c3aed'}}>₹{req.counterPrice}/{req.unit} (counter)</span>
                        </>}
                      </div>
                    </div>
                  </div>
                  <div className="card-right" style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:20,background:sc.bg,color:sc.color,border:`1.5px solid ${sc.border}`,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>
                      <Icon size={11}/> {sc.label}
                    </span>
                    <span style={{fontSize:11,color:'#9ca3af'}}>{req.createdAt?new Date(req.createdAt).toLocaleDateString('en-IN'):'—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal – responsive */}
      {detail && (()=>{
        const sc   = STATUS_CFG[detail.status]||STATUS_CFG.PENDING;
        const crop = detail.crop?.name||detail.cropName||'—';
        return (
          <div className="modal-container" style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}}>
            <div className="modal-inner" style={{background:'white',borderRadius:20,padding:28,width:'100%',maxWidth:460,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 30px 80px rgba(0,0,0,.25)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:28}}>{cropEmoji(crop)}</span>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:900,color:'#14532d',margin:0}}>{crop}</h2>
                    <p style={{fontSize:12,color:'#9ca3af',margin:0}}>Request #{detail.id}</p>
                  </div>
                </div>
                <button onClick={()=>setDetail(null)} style={{background:'#fee2e2',border:'none',borderRadius:8,padding:'6px 8px',cursor:'pointer',color:'#dc2626'}}><X size={16}/></button>
              </div>

              <div style={{background:sc.bg,border:`1.5px solid ${sc.border}`,borderRadius:12,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <sc.icon size={16} color={sc.color}/>
                <span style={{fontSize:13,fontWeight:800,color:sc.color}}>{sc.label}</span>
              </div>

              <div style={{display:'grid',gap:8,marginBottom:16}}>
                {[
                  ['Crop',          crop],
                  ['Farmer',        detail.farmer?.name||detail.farmerUsername||'—'],
                  ['Quantity',      `${detail.quantity} ${detail.unit}`],
                  ['Your Price',    `₹${detail.offeredPrice}/${detail.unit}`],
                  ...(detail.counterPrice&&detail.counterPrice!==detail.offeredPrice
                    ? [['Counter Price',`₹${detail.counterPrice}/${detail.unit}`]] : []),
                  ['Total',         `₹${((detail.counterPrice||detail.offeredPrice)*detail.quantity).toLocaleString('en-IN')}`],
                  ['Message',       detail.message||'—'],
                  ['Requested On',  detail.createdAt?new Date(detail.createdAt).toLocaleString('en-IN'):'—'],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:'#f8fffe',borderRadius:10,border:'1px solid #e0f0e8'}}>
                    <span style={{fontSize:12,color:'#6a9a7a',fontWeight:700}}>{k}</span>
                    <span style={{fontSize:13,color:'#1a3a28',fontWeight:800,textAlign:'right',maxWidth:'60%'}}>{v}</span>
                  </div>
                ))}
              </div>

              {(detail.status==='PENDING'||detail.status==='NEGOTIATING') && (
                <button onClick={()=>handleCancel(detail.id)} disabled={cancelling===detail.id}
                  style={{width:'100%',padding:12,background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',border:'none',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',opacity:cancelling===detail.id?.7:1}}>
                  {cancelling===detail.id?'Withdrawing...':'Withdraw Request'}
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MyRequests;