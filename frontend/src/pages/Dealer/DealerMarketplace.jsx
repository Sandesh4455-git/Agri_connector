// DealerMarketplace.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search, MapPin, Package, Calendar,
  Truck, MessageSquare, RefreshCw, Loader2, Send,
  CheckCircle,
} from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser  = () => localStorage.getItem('agri_connect_user') || '';

const cropEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('wheat'))                       return '🌾';
  if (n.includes('rice'))                        return '🍚';
  if (n.includes('tomato'))                      return '🍅';
  if (n.includes('potato'))                      return '🥔';
  if (n.includes('cotton'))                      return '🧵';
  if (n.includes('onion'))                       return '🧅';
  if (n.includes('corn') || n.includes('maize')) return '🌽';
  if (n.includes('sugarcane'))                   return '🎋';
  if (n.includes('soybean'))                     return '🫘';
  if (n.includes('mango'))                       return '🥭';
  return '🌱';
};

const RequestModal = ({ crop, onClose, onSuccess }) => {
  const [form, setForm]     = useState({ quantity: '', pricePerUnit: crop.pricePerUnit || crop.price || '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.quantity || !form.pricePerUnit) { setError('Quantity आणि Price required आहे'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          cropId: crop.id, farmerUsername: crop.farmerUsername || crop.username,
          cropName: crop.name || crop.cropName, quantity: parseFloat(form.quantity),
          offeredPrice: parseFloat(form.pricePerUnit), unit: crop.unit || 'kg',
          message: form.message || `Interested in buying ${crop.name || crop.cropName}`,
        }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
      else setError(data.message || 'Request पाठवता आली नाही');
    } catch { setError('Server error — backend running आहे का?'); }
    finally { setLoading(false); }
  };

  const MS = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50, padding: 0, backdropFilter: 'blur(4px)' },
    modal:   { background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,.2)' },
    input:   { width: '100%', padding: '9px 11px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' },
    label:   { fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 },
    btn:     (bg, color, border) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: bg, color, border: border || 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1 }),
  };

  return (
    <div style={MS.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MS.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
              {cropEmoji(crop.name || crop.cropName)} Send Request
            </span>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
              to {crop.farmerUsername || crop.username} • {crop.name || crop.cropName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>×</button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '9px 13px', marginBottom: 14, border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6b7280' }}>Available</span>
              <span style={{ fontWeight: 700, color: '#15803d' }}>{crop.quantity} {crop.unit || 'kg'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 3 }}>
              <span style={{ color: '#6b7280' }}>Market Price</span>
              <span style={{ fontWeight: 700, color: '#15803d' }}>₹{crop.pricePerUnit || crop.price || '—'}/{crop.unit || 'kg'}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={MS.label}>Quantity ({crop.unit || 'kg'}) *</label>
              <input style={MS.input} type="number" placeholder={`Max ${crop.quantity}`} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label style={MS.label}>Your Price (₹/{crop.unit || 'kg'}) *</label>
              <input style={MS.input} type="number" placeholder="0.00" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={MS.label}>Message to Farmer</label>
            <textarea style={{ ...MS.input, height: 70, resize: 'vertical' }}
              placeholder="I am interested in buying your crop..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>

          {form.quantity && form.pricePerUnit && (
            <div style={{ background: '#eff6ff', borderRadius: 9, padding: '9px 12px', marginBottom: 12, border: '1px solid #bfdbfe', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Estimated Total</span>
              <span style={{ color: '#1d4ed8', fontWeight: 800 }}>
                ₹{(parseFloat(form.quantity) * parseFloat(form.pricePerUnit)).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '7px 11px', fontSize: 12, color: '#dc2626', marginBottom: 10 }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={MS.btn('white', '#6b7280', '1.5px solid #e5e7eb')}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={MS.btn('linear-gradient(135deg,#1d4ed8,#2563eb)', 'white')}>
              {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DealerMarketplace = () => {
  const { t } = useLanguage();
  const [crops,        setCrops]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('all');
  const [sortBy,       setSortBy]       = useState('latest');
  const [selected,     setSelected]     = useState(null);
  const [toast,        setToast]        = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());

  const showMsg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchCrops(); fetchSentRequests(); }, []);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/crops`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) {
        const me   = getUser();
        const list = (data.data || []).filter(c =>
          c.farmerUsername !== me && c.username !== me && c.available !== false
        );
        setCrops(list);
      }
    } catch { showMsg('❌ Crops load करता आल्या नाहीत', 'error'); }
    finally { setLoading(false); }
  };

  const fetchSentRequests = async () => {
    try {
      const res  = await fetch(`${API}/requests/dealer`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) {
        const ids = new Set((data.data || []).map(r => r.cropId || r.crop?.id));
        setSentRequests(ids);
      }
    } catch {}
  };

  const categories = ['all', ...new Set(crops.map(c => c.category || c.cropType || 'Other').filter(Boolean))];

  const filtered = crops
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || (c.name || c.cropName || '').toLowerCase().includes(q)
        || (c.farmerUsername || c.username || '').toLowerCase().includes(q)
        || (c.location || '').toLowerCase().includes(q);
      const matchCat = category === 'all' || (c.category || c.cropType) === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low')  return (a.pricePerUnit || a.price || 0) - (b.pricePerUnit || b.price || 0);
      if (sortBy === 'price-high') return (b.pricePerUnit || b.price || 0) - (a.pricePerUnit || a.price || 0);
      if (sortBy === 'quantity')   return (b.quantity || 0) - (a.quantity || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const S = {
    page:  { flex: 1, padding: 'clamp(12px,3vw,20px)', background: 'linear-gradient(135deg,#fafafa,#f0f9ff)', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'system-ui,sans-serif' },
    card:  { background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' },
    input: { padding: '8px 11px 8px 34px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: 'white', width: '100%', boxSizing: 'border-box' },
    btn:   (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: bg, color, border: border || 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }),
    pill:  (active) => ({ padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: active ? '#dbeafe' : '#f9fafb', color: active ? '#1d4ed8' : '#6b7280', outline: active ? '1.5px solid #93c5fd' : 'none' }),
  };

  return (
    <main style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dm-crops-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .dm-filter-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .dm-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .dm-tips-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        @media (min-width: 480px) {
          .dm-crops-grid { grid-template-columns: repeat(2,1fr); }
          .dm-tips-grid { grid-template-columns: repeat(3,1fr); }
        }
        @media (min-width: 900px) {
          .dm-crops-grid { grid-template-columns: repeat(3,1fr); }
        }
        @media (min-width: 640px) {
          .modal-sm-center {
            align-items: center !important;
            padding: 16px !important;
          }
          .modal-sm-center > div {
            border-radius: 20px !important;
            max-width: 440px !important;
            max-height: 90vh;
          }
        }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, padding: '10px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: 'white', border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`, color: toast.type === 'success' ? '#15803d' : '#dc2626', boxShadow: '0 8px 30px rgba(0,0,0,.1)', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.text}
        </div>
      )}

      {selected && (
        <div className="modal-sm-center">
          <RequestModal crop={selected} onClose={() => setSelected(null)}
            onSuccess={() => {
              showMsg('✅ Request पाठवली! Farmer accept करेल.');
              setSentRequests(prev => new Set([...prev, selected.id]));
              fetchSentRequests();
            }} />
        </div>
      )}

      {/* Header */}
      <div className="dm-header">
        <div>
          <h1 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 700, color: '#111827', margin: 0, fontFamily: 'Georgia,serif' }}>
            🛒 {t.cropMarketplace}
          </h1>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{t.farmersBrowseCrops}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={fetchCrops} style={S.btn('white', '#374151', '1px solid #e5e7eb')}>
            <RefreshCw size={13} /> {t.refresh}
          </button>
          <div style={{ background: '#dbeafe', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
            {filtered.length} {t.cropsAvailable}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, padding: '12px 14px', marginBottom: 12 }}>
        <div className="dm-filter-row">
          <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input style={S.input} placeholder={t.searchCropFarmerLocation} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 12, outline: 'none', background: 'white', cursor: 'pointer' }}>
            <option value="latest">{t.latestFirst}</option>
            <option value="price-low">{t.priceLowHigh}</option>
            <option value="price-high">{t.priceHighLow}</option>
            <option value="quantity">{t.mostQuantity}</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 9, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={S.pill(category === cat)}>
              {cat === 'all' ? t.allCrops : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: 44, margin: '0 0 12px' }}>🌾</p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 7px' }}>
            {crops.length === 0 ? t.noCropsListed : t.noProducts}
          </h3>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 14px' }}>
            {crops.length === 0 ? t.farmersLoginAddCrops : 'Try different search or category'}
          </p>
          {crops.length > 0 && (
            <button onClick={() => { setSearch(''); setCategory('all'); }} style={S.btn('#dbeafe', '#1d4ed8')}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Crop Cards */}
      {!loading && filtered.length > 0 && (
        <div className="dm-crops-grid">
          {filtered.map(crop => {
            const name        = crop.name || crop.cropName || 'Crop';
            const farmer      = crop.farmerUsername || crop.username || '—';
            const price       = crop.pricePerUnit || crop.price || 0;
            const qty         = crop.quantity || 0;
            const unit        = crop.unit || 'kg';
            const location    = crop.location || crop.farmerLocation || '—';
            const harvest     = crop.harvestDate
              ? new Date(crop.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : '—';
            const cropCat     = crop.category || crop.cropType || 'General';
            const desc        = crop.description || '';
            const alreadySent = sentRequests.has(crop.id);

            return (
              <div key={crop.id} style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
                {/* Card Header */}
                <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <div style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{cropEmoji(name)}</div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 3px', truncate: true }}>{name}</h3>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280' }}>{cropCat}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 8, background: qty > 200 ? '#dcfce7' : qty > 50 ? '#fef3c7' : '#fee2e2', color: qty > 200 ? '#15803d' : qty > 50 ? '#d97706' : '#dc2626' }}>
                            {qty > 200 ? 'High' : qty > 50 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#15803d', margin: 0 }}>₹{price}</p>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>per {unit}</p>
                    </div>
                  </div>
                </div>

                {/* Farmer Info */}
                <div style={{ padding: '9px 14px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {farmer.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>{farmer}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#9ca3af' }}>
                          <MapPin size={9} /> {location}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>⭐ {crop.rating || '4.5'}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '10px 14px', flex: 1 }}>
                  {[
                    { icon: Package,  label: 'Available', value: `${qty} ${unit}` },
                    { icon: Calendar, label: 'Harvest',   value: harvest          },
                    { icon: Truck,    label: 'Delivery',  value: crop.deliveryAvailable !== false ? 'Available' : 'Pickup' },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 2 ? '1px solid #f9fafb' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                        <Icon size={11} color="#9ca3af" /> {label}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{value}</span>
                    </div>
                  ))}
                  {desc && (
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '7px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {desc}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 7 }}>
                  {alreadySent ? (
                    <div style={{ flex: 1, padding: '9px', background: '#f0fdf4', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#15803d', border: '1px solid #bbf7d0' }}>
                      <CheckCircle size={13} /> {t.requestSend || 'Request Sent'}
                    </div>
                  ) : (
                    <button onClick={() => setSelected(crop)}
                      style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Send size={12} /> {t.requestSend || 'Send Request'}
                    </button>
                  )}
                  <button onClick={() => showMsg(`📞 Contact: ${farmer} via Notifications`)}
                    style={{ padding: '9px 12px', background: '#f0f9ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MessageSquare size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {!loading && (
        <div style={{ marginTop: 16, background: 'white', borderRadius: 14, border: '1.5px solid #bfdbfe', padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>💡 {t.marketplaceTips}</h3>
          <div className="dm-tips-grid">
            {[
              { title: t.requestSend,  desc: t.farmerAcceptDeal },
              { title: t.negotiate,    desc: t.negotiatePrice   },
              { title: t.trackRequest, desc: t.trackOrders      },
            ].map((tip, i) => (
              <div key={i} style={{ background: '#eff6ff', borderRadius: 9, padding: '10px 12px', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', margin: '0 0 3px' }}>{tip.title}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default DealerMarketplace;