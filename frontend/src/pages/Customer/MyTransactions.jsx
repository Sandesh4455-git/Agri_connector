// MyTransactions.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, TrendingUp, TrendingDown, CreditCard, Search, Eye, X } from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('agri_connect_user')||'{}'); } catch { return {}; } };

const STATUS_CFG = {
  COMPLETED: { color:'#16a34a', bg:'#dcfce7', border:'#86efac', label:'Completed' },
  PENDING:   { color:'#d97706', bg:'#fef9c3', border:'#fcd34d', label:'Pending'   },
  FAILED:    { color:'#dc2626', bg:'#fee2e2', border:'#fca5a5', label:'Failed'    },
  REFUNDED:  { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', label:'Refunded'  },
};

const MyTransactions = () => {
  const { t } = useLanguage();
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');
  const [search,  setSearch]  = useState('');
  const [detail,  setDetail]  = useState(null);
  const [summary, setSummary] = useState({ totalIn:0, totalOut:0, count:0 });
  const [toast,   setToast]   = useState(null);
  const user = getUser();

  const showToast = (text,type='success') => { setToast({text,type}); setTimeout(()=>setToast(null),3000); };

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/payments/transactions`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) {
        const list = data.data||[];
        setTxns(list);
        const totalOut = list.filter(t=>t.status?.name?.includes('COMPLETED')&&t.fromUsername===user.username).reduce((s,t)=>s+(t.amount||0),0);
        const totalIn  = list.filter(t=>t.status?.name?.includes('COMPLETED')&&t.toUsername===user.username).reduce((s,t)=>s+(t.amount||0),0);
        setSummary({ totalIn, totalOut, count:list.length });
      }
    } catch(e) { showToast('Failed to load transactions','error'); }
    finally { setLoading(false); }
  }, [user.username]);

  useEffect(()=>{ fetchTxns(); }, [fetchTxns]);

  const getStatus = (t) => {
    if (!t.status) return 'PENDING';
    if (typeof t.status==='string') return t.status;
    if (t.status.name) return t.status.name;
    return 'PENDING';
  };

  const isOutgoing = t => t.fromUsername===user.username;

  const TABS = [t.all,t.completed,t.pending,t.failed];

  const filtered = txns
    .filter(t => {
      const s = getStatus(t);
      const matchF = filter==='All' || s===filter;
      const q = search.toLowerCase();
      const matchS = !q ||
        (t.txnId||t.id||'').toString().toLowerCase().includes(q) ||
        (t.description||'').toLowerCase().includes(q) ||
        (t.fromUsername||'').toLowerCase().includes(q) ||
        (t.toUsername||'').toLowerCase().includes(q);
      return matchF && matchS;
    })
    .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

  return (
    <div style={{ fontFamily:"'Nunito',system-ui,sans-serif", minHeight:'100vh', background:'#fafdf7', padding:'24px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .txn-row{animation:fadeUp .25s ease forwards;opacity:0;transition:background .15s}
        .txn-row:hover{background:#f0fdf4!important}

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
          /* Summary cards stack */
          .summary-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
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
          /* Table adjustments */
          .transaction-table th,
          .transaction-table td {
            padding: 10px 12px !important;
            font-size: 11px !important;
          }
          .transaction-table td:first-child,
          .transaction-table th:first-child {
            padding-left: 12px !important;
          }
          .transaction-table td:last-child,
          .transaction-table th:last-child {
            padding-right: 12px !important;
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
          <h1 style={{fontSize:28,fontWeight:900,color:'#14532d',margin:0}}>💳 {t.myTransactions}</h1>
          <p style={{fontSize:13,color:'#6b7280',margin:'4px 0 0'}}>{t.paymentHistory}</p>
        </div>
        <button onClick={fetchTxns} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',background:'white',border:'1.5px solid #c8e6d4',borderRadius:12,fontSize:13,color:'#2e7d52',cursor:'pointer',fontWeight:700}}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Summary Cards – responsive grid */}
      {!loading && (
        <div className="summary-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
          {[
            { label:t.totalPaid,       value:`₹${summary.totalOut.toLocaleString('en-IN')}`, icon:TrendingDown, color:'#dc2626', bg:'linear-gradient(135deg,#fee2e2,#fff1f2)', border:'#fca5a5' },
            { label:t.totalReceived,   value:`₹${summary.totalIn.toLocaleString('en-IN')}`,  icon:TrendingUp,   color:'#16a34a', bg:'linear-gradient(135deg,#dcfce7,#f0fdf4)', border:'#86efac' },
            { label:t.totalTransactions,value: summary.count,                                icon:CreditCard,   color:'#2563eb', bg:'linear-gradient(135deg,#dbeafe,#eff6ff)', border:'#93c5fd' },
          ].map((c,i)=>(
            <div key={i} style={{borderRadius:18,background:c.bg,border:`1.5px solid ${c.border}`,padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{fontSize:11,color:c.color,margin:'0 0 5px',fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',opacity:.8}}>{c.label}</p>
                <p style={{fontSize:22,fontWeight:900,color:c.color,margin:0}}>{c.value}</p>
              </div>
              <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <c.icon size={20} color={c.color}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + filters – responsive */}
      <div style={{background:'white',borderRadius:16,border:'1.5px solid #c8e6d4',padding:'12px 16px',marginBottom:16,display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:'1 1 200px'}}>
          <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#9abfaa'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t.searchByIdUser}
            style={{width:'100%',padding:'8px 10px 8px 34px',border:'1.5px solid #c8e6d4',borderRadius:20,fontSize:13,outline:'none',background:'white',boxSizing:'border-box'}}/>
        </div>
        <div className="filter-tabs" style={{display:'flex',gap:6}}>
          {TABS.map(tab=>(
            <button key={tab} onClick={()=>setFilter(tab)}
              style={{padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filter===tab?'#16a34a':'#c8e6d4'}`,background:filter===tab?'#16a34a':'white',color:filter===tab?'white':'#2a5a3a',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,transition:'all .15s'}}>
              {tab==='All'?`All (${txns.length})`:tab[0]+tab.slice(1).toLowerCase()}
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
          <p style={{fontSize:48,margin:'0 0 12px'}}>💳</p>
          <p style={{fontSize:16,fontWeight:800,color:'#374151',margin:0}}>{t.noTransactionsFound}</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:'6px 0 0'}}>{filter==='All'?t.noPaymentHistory:'No matching transactions'}</p>
        </div>
      ) : (
        <div style={{background:'white',borderRadius:20,border:'1.5px solid #c8e6d4',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
          <div style={{overflowX:'auto'}}>
            <table className="transaction-table" style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#1a3a28'}}>
                  {['Txn ID','Type','Amount','From','To','Status','Date','Action'].map(h=>(
                    <th key={h} style={{padding:'13px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#a8d8bc',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                 </tr>
              </thead>
              <tbody>
                {filtered.map((t,i)=>{
                  const status = getStatus(t);
                  const sc     = STATUS_CFG[status]||STATUS_CFG.PENDING;
                  const out    = isOutgoing(t);
                  return (
                    <tr key={t.id||i} className="txn-row" style={{borderBottom:'1px solid #f0fdf4',animationDelay:`${i*.04}s`}}>
                      <td style={{padding:'13px 16px',fontSize:12,fontFamily:'monospace',color:'#6a9a7a'}}>{t.txnId||`#${t.id}`}</td>
                      <td style={{padding:'13px 16px'}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:out?'#dc2626':'#16a34a'}}>
                          {out?<TrendingDown size={12}/>:<TrendingUp size={12}/>}
                          {out?'DEBIT':'CREDIT'}
                        </span>
                      </td>
                      <td style={{padding:'13px 16px',fontSize:15,fontWeight:900,color:out?'#dc2626':'#16a34a'}}>
                        {out?'-':'+'}₹{Number(t.amount||0).toLocaleString('en-IN')}
                      </td>
                      <td style={{padding:'13px 16px',fontSize:12,color:'#374151',fontWeight:600}}>{t.fromUsername||'—'}</td>
                      <td style={{padding:'13px 16px',fontSize:12,color:'#374151',fontWeight:600}}>{t.toUsername||'—'}</td>
                      <td style={{padding:'13px 16px'}}>
                        <span style={{padding:'4px 10px',borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,fontSize:11,fontWeight:700}}>{sc.label}</span>
                      </td>
                      <td style={{padding:'13px 16px',fontSize:12,color:'#9ca3af'}}>{t.createdAt?new Date(t.createdAt).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'13px 16px'}}>
                        <button onClick={()=>setDetail(t)} style={{padding:'5px 10px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,color:'#16a34a',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                          <Eye size={12}/> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal – responsive */}
      {detail && (()=>{
        const status = getStatus(detail);
        const sc = STATUS_CFG[status]||STATUS_CFG.PENDING;
        const out= isOutgoing(detail);
        return (
          <div className="modal-container" style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}}>
            <div className="modal-inner" style={{background:'white',borderRadius:20,padding:28,width:'100%',maxWidth:440,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 30px 80px rgba(0,0,0,.25)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:44,height:44,borderRadius:12,background:out?'#fee2e2':'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {out?<TrendingDown size={22} color="#dc2626"/>:<TrendingUp size={22} color="#16a34a"/>}
                  </div>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:900,color:'#14532d',margin:0}}>Transaction Detail</h2>
                    <p style={{fontSize:12,color:'#9ca3af',margin:0}}>{detail.txnId||`#${detail.id}`}</p>
                  </div>
                </div>
                <button onClick={()=>setDetail(null)} style={{background:'#fee2e2',border:'none',borderRadius:8,padding:'6px 8px',cursor:'pointer',color:'#dc2626'}}><X size={16}/></button>
              </div>
              <div style={{display:'grid',gap:8}}>
                {[
                  ['Amount',      `${out?'-':'+'}₹${Number(detail.amount||0).toLocaleString('en-IN')}`],
                  ['Type',        out?'Debit (Payment)':'Credit (Received)'],
                  ['Status',      <span style={{padding:'3px 10px',borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,fontSize:12,fontWeight:700}}>{sc.label}</span>],
                  ['From',        detail.fromUsername||'—'],
                  ['To',          detail.toUsername||'—'],
                  ['Description', detail.description||'—'],
                  ['Txn ID',      detail.txnId||`#${detail.id}`],
                  ['Date',        detail.createdAt?new Date(detail.createdAt).toLocaleString('en-IN'):'—'],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:'#f8fffe',borderRadius:10,border:'1px solid #e0f0e8'}}>
                    <span style={{fontSize:12,color:'#6a9a7a',fontWeight:700}}>{k}</span>
                    <span style={{fontSize:13,color:'#1a3a28',fontWeight:800,textAlign:'right',maxWidth:'60%'}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MyTransactions;