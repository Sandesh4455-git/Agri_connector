import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, XCircle,
  ExternalLink, Calendar, DollarSign, Users, Download
} from 'lucide-react';

const useResponsive = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile };
};

const SchemeDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { scheme } = location.state || {};

  const S = {
    page: {
      flex: 1,
      padding: isMobile ? '14px 12px' : '20px 24px',
      background: 'linear-gradient(135deg,#f0fdf4,#f8fafc)',
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: 'system-ui,sans-serif',
      maxWidth: 960,
      margin: '0 auto',
    },
    card: {
      background: 'white',
      borderRadius: isMobile ? 14 : 16,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
      padding: isMobile ? '16px 14px' : 24,
      marginBottom: 14,
    },
    badge: (bg, color) => ({
      display: 'inline-block', padding: '4px 14px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, background: bg, color,
    }),
    icon: (bg) => ({
      width: 36, height: 36, borderRadius: 10, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }),
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 14px', background: 'white', color: '#374151',
      border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13,
      fontWeight: 600, cursor: 'pointer', marginBottom: 18,
    },
  };

  if (!scheme) {
    return (
      <main style={S.page}>
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <p style={{ fontSize:52, margin:'0 0 16px' }}>📋</p>
          <h3 style={{ fontSize:18, fontWeight:700, color:'#374151', margin:'0 0 8px' }}>Scheme Not Found</h3>
          <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 24px' }}>
            Please go back and click "View Details" from the schemes list.
          </p>
          <button
            onClick={() => navigate('/farmer/schemes')}
            style={{ ...S.backBtn, background:'linear-gradient(135deg,#15803d,#059669)', color:'white', border:'none', padding:'11px 22px' }}
          >
            <ArrowLeft size={16}/> Back to Schemes
          </button>
        </div>
      </main>
    );
  }

  const isActive = scheme.status === 'active' || scheme.isActive !== false;
  const d = scheme.details || {};

  return (
    <main style={S.page}>
      <style>{`*{box-sizing:border-box}a{text-decoration:none}`}</style>

      {/* Back */}
      <button onClick={() => navigate('/farmer/schemes')} style={S.backBtn}>
        <ArrowLeft size={14}/> Back to All Schemes
      </button>

      {/* Header Card */}
      <div style={S.card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap', marginBottom:14 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
              <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:'#14532d', margin:0, fontFamily:'Georgia,serif', lineHeight:1.3 }}>
                {scheme.title}
              </h1>
              <span style={S.badge(isActive?'#dcfce7':'#fee2e2', isActive?'#15803d':'#dc2626')}>
                {isActive ? '● Active' : '● Closed'}
              </span>
            </div>
            {scheme.category && (
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'#dbeafe', color:'#1d4ed8', textTransform:'capitalize', display:'inline-block', marginBottom:10 }}>
                {scheme.category.replace(/_/g,' ')}
              </span>
            )}
            <p style={{ fontSize:13, color:'#4b5563', margin:0, lineHeight:1.6 }}>{scheme.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:10 }}>
          {[
            { Icon: DollarSign, color:'#15803d', bg:'#dcfce7', label:'Subsidy / Benefit',    value: scheme.subsidy || scheme.benefit || '—' },
            { Icon: Calendar,   color:'#d97706', bg:'#fef3c7', label:'Application Deadline', value: scheme.deadline || scheme.lastDate || 'Ongoing' },
            { Icon: Users,      color:'#2563eb', bg:'#dbeafe', label:'Eligible For',          value: scheme.eligibility || '—' },
          ].map(({ Icon, color, bg, label, value }, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#f9fafb', borderRadius:12, padding:'12px 14px' }}>
              <div style={S.icon(bg)}><Icon size={15} color={color}/></div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 2px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</p>
                <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:0, lineHeight:1.4 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Description */}
      {d.fullDescription && (
        <div style={S.card}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 10px', display:'flex', alignItems:'center', gap:8 }}>
            <FileText size={16} color="#15803d"/> About This Scheme
          </h2>
          <p style={{ fontSize:13, color:'#4b5563', lineHeight:1.7, margin:0 }}>{d.fullDescription}</p>
        </div>
      )}

      {/* Documents + Eligibility */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:14, marginBottom:14 }}>
        {d.requiredDocuments?.length > 0 && (
          <div style={{ ...S.card, marginBottom:0 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>
              <FileText size={14} color="#2563eb"/> Required Documents
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {d.requiredDocuments.map((doc, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <CheckCircle size={13} color="#16a34a" style={{ flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:'#374151' }}>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {d.eligibilityCriteria?.length > 0 && (
          <div style={{ ...S.card, marginBottom:0 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>
              <CheckCircle size={14} color="#15803d"/> Eligibility Criteria
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {d.eligibilityCriteria.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', flexShrink:0, marginTop:5 }}/>
                  <span style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      {d.benefits?.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 12px' }}>🎯 Key Benefits</h3>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(200px,1fr))', gap:10 }}>
            {d.benefits.map((b, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#f0fdf4', borderRadius:10, padding:'10px 12px', border:'1px solid #bbf7d0' }}>
                <CheckCircle size={13} color="#15803d" style={{ flexShrink:0, marginTop:2 }}/>
                <span style={{ fontSize:13, color:'#14532d', fontWeight:500, lineHeight:1.4 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Process */}
      {d.applicationProcess?.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 14px' }}>📋 How to Apply</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {d.applicationProcess.map((step, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'#dcfce7', border:'2px solid #86efac', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:'#15803d' }}>{i+1}</span>
                </div>
                <p style={{ fontSize:13, color:'#374151', margin:0, paddingTop:4, lineHeight:1.5 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:14 }}>
        {scheme.officialLink && (
          <a
            href={scheme.officialLink} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding: isMobile ? '10px 16px' : '11px 22px', background:'linear-gradient(135deg,#15803d,#059669)', color:'white', border:'none', borderRadius:11, fontSize: isMobile ? 13 : 14, fontWeight:600, cursor:'pointer', flex: isMobile ? 1 : 'initial', justifyContent:'center' }}
          >
            <ExternalLink size={14}/> Visit Official Website
          </a>
        )}
        <button
          onClick={() => navigate('/farmer/schemes')}
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding: isMobile ? '10px 16px' : '11px 22px', background:'white', color:'#6b7280', border:'1.5px solid #e5e7eb', borderRadius:11, fontSize: isMobile ? 13 : 14, fontWeight:600, cursor:'pointer', flex: isMobile ? 1 : 'initial', justifyContent:'center' }}
        >
          <XCircle size={14}/> Cancel
        </button>
      </div>

      {/* Help Box */}
      <div style={{ background:'white', borderRadius:14, border:'1.5px solid #bbf7d0', padding: isMobile ? '14px' : '16px 22px', display:'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent:'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap:12 }}>
        <div>
          <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>Need Help Applying?</h3>
          <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Visit your nearest CSC (Common Service Center) or Krishi Vigyan Kendra</p>
        </div>
        <a
          href={scheme.officialLink || '#'} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px', background:'#f0fdf4', color:'#15803d', border:'1.5px solid #86efac', borderRadius:10, fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}
        >
          <Download size={13}/> Download Guide
        </a>
      </div>
    </main>
  );
};

export default SchemeDetail;