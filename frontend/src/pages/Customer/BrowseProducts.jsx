//BrowseProducts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from "../../context/LanguageContext";
import {
  Search, Filter, MapPin, ShoppingCart, X, Loader2,
  RefreshCw, ChevronDown, Star, Package, Send, CheckCircle
} from 'lucide-react';

const API = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');
const getUser  = () => {
  try { return JSON.parse(localStorage.getItem('agri_connect_user') || '{}'); }
  catch { return {}; }
};

const cropEmoji = (name = '') => {
  const n = (name || '').toLowerCase();
  if (n.includes('wheat'))     return '🌾';
  if (n.includes('rice'))      return '🍚';
  if (n.includes('tomato'))    return '🍅';
  if (n.includes('potato'))    return '🥔';
  if (n.includes('onion'))     return '🧅';
  if (n.includes('cotton'))    return '🧵';
  if (n.includes('maize') || n.includes('corn')) return '🌽';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('soybean'))   return '🫘';
  if (n.includes('mango'))     return '🥭';
  if (n.includes('banana'))    return '🍌';
  if (n.includes('grapes'))    return '🍇';
  if (n.includes('apple'))     return '🍎';
  if (n.includes('orange'))    return '🍊';
  return '🌱';
};

// ── Request Modal ────────────────────────────────────────────────────────────
const RequestModal = ({ crop, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice]       = useState(crop.pricePerUnit || '');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    if (!quantity || !price) { setError('Quantity आणि Price भरणे आवश्यक आहे'); return; }
    if (Number(quantity) <= 0 || Number(price) <= 0) { setError('Valid quantity आणि price टाका'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/requests/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          cropId:       crop.id,
          quantity:     Number(quantity),
          unit:         crop.unit || 'kg',
          offeredPrice: Number(price),
          message:      message || `${crop.name} साठी request`,
        })
      });
      const data = await res.json();
      if (data.success) { onSuccess('✅ Request sent! Farmer च्या response ची वाट करा.'); onClose(); }
      else setError(data.message || 'Request पाठवता आली नाही');
    } catch { setError('Network error — please try again'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '16px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', borderRadius: 24, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,.2)', overflow: 'hidden',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          borderBottom: '1px solid #bbf7d0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{cropEmoji(crop.name)}</span>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#14532d', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{crop.name}</h3>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Farmer: {crop.farmerName || crop.farmerUsername || '—'} • {crop.city || 'India'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', borderRadius: 10,
            width: 32, height: 32, cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8
          }}>
            <X size={16} color="#dc2626" />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Crop Info */}
          <div style={{
            background: '#f9fafb', borderRadius: 12, padding: '12px 8px',
            marginBottom: 20, display: 'flex', justifyContent: 'space-around',
            flexWrap: 'wrap', gap: 8
          }}>
            <div style={{ textAlign: 'center', minWidth: 70 }}>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px', fontWeight: 700 }}>AVAILABLE</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>{crop.quantity} {crop.unit}</p>
            </div>
            <div style={{ width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center', minWidth: 70 }}>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px', fontWeight: 700 }}>ASKING PRICE</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', margin: 0 }}>₹{crop.pricePerUnit}/{crop.unit}</p>
            </div>
            <div style={{ width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center', minWidth: 70 }}>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px', fontWeight: 700 }}>CATEGORY</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>{crop.category || 'General'}</p>
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                QUANTITY ({crop.unit || 'kg'}) *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder={`Max: ${crop.quantity} ${crop.unit}`}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                YOUR OFFER PRICE (₹/{crop.unit || 'kg'}) *
              </label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder={`Asking: ₹${crop.pricePerUnit}`}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              {quantity && price && (
                <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, margin: '6px 0 0' }}>
                  Total: ₹{(Number(quantity) * Number(price)).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                MESSAGE (Optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Farmer ला message पाठवा..."
                rows={2}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', background: '#fee2e2', padding: '8px 12px', borderRadius: 8, margin: 0, fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '12px 8px', background: 'white', color: '#6b7280',
                border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14,
                fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{
                  flex: 2, padding: 12,
                  background: loading ? '#86efac' : 'linear-gradient(135deg,#16a34a,#15803d)',
                  color: 'white', border: 'none', borderRadius: 12, fontSize: 14,
                  fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                  : <><Send size={16} /> Send Request</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const BrowseProducts = () => {
  const { t } = useLanguage();
  const [crops, setCrops]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy]     = useState('latest');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [toast, setToast]       = useState(null);

  const showMsg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/crops/available`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setCrops(data.data || []);
      else setCrops([]);
    } catch { setCrops([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  const categories = [t.all, ...new Set(crops.map(c => c.category).filter(Boolean))];

  const filtered = crops
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
      const matchCat = category === 'All' || c.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low')  return (a.pricePerUnit || 0) - (b.pricePerUnit || 0);
      if (sortBy === 'price-high') return (b.pricePerUnit || 0) - (a.pricePerUnit || 0);
      if (sortBy === 'qty')        return (b.quantity || 0) - (a.quantity || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div style={{ minHeight: '100vh', background: '#fafdf7', fontFamily: "'Nunito', system-ui, sans-serif", padding: '16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .crop-card { animation: fadeUp .3s ease forwards; opacity: 0; transition: all .2s; }
        @media (hover: hover) {
          .crop-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.1) !important; }
          .order-btn:hover { opacity: .9; transform: scale(.99); }
        }
        .order-btn { transition: all .15s; }

        /* Responsive grid */
        .crop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .crop-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Filter bar responsive */
        .filter-bar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .filter-search {
          flex: 1 1 200px;
          min-width: 0;
        }
        .filter-cats {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1 1 100%;
        }
        @media (min-width: 768px) {
          .filter-cats { flex: 1 1 auto; }
        }
        .filter-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }
        @media (min-width: 640px) {
          .filter-actions { width: auto; }
        }
        .filter-select {
          flex: 1;
          min-width: 130px;
        }
        @media (min-width: 640px) {
          .filter-select { flex: unset; min-width: unset; }
        }

        /* Toast responsive */
        .toast {
          position: fixed;
          top: 16px;
          right: 16px;
          left: 16px;
          z-index: 200;
        }
        @media (min-width: 480px) {
          .toast {
            left: auto;
            max-width: 360px;
          }
        }

        /* Modal scroll fix on small screens */
        .modal-scroll {
          max-height: 90vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Header responsive */
        .page-header h1 {
          font-size: clamp(20px, 5vw, 28px);
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{
          padding: '14px 20px', borderRadius: 14, fontSize: 14, fontWeight: 700,
          background: 'white',
          border: `2px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
          color: toast.type === 'success' ? '#15803d' : '#dc2626',
          boxShadow: '0 8px 30px rgba(0,0,0,.12)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <CheckCircle size={16} color="#16a34a" /> {toast.text}
        </div>
      )}

      {selectedCrop && (
        <RequestModal crop={selectedCrop} onClose={() => setSelectedCrop(null)} onSuccess={showMsg} />
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 style={{ fontWeight: 900, color: '#14532d', margin: '0 0 4px' }}>
          🛒 {t.browseFreshProducts}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          {loading ? 'Loading...' : `${filtered.length} ${t.productsAvailable}`}
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{
        background: 'white', borderRadius: 18, border: '1.5px solid #e5e7eb',
        padding: '14px 16px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.05)'
      }}>
        <div className="filter-bar">
          {/* Search */}
          <div className="filter-search" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              style={{ width: '100%', padding: '11px 36px 11px 38px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="filter-cats">
            {categories.slice(0, 6).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{
                  padding: '7px 12px', borderRadius: 10, border: 'none', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer',
                  background: category === cat ? '#16a34a' : '#f3f4f6',
                  color: category === cat ? 'white' : '#6b7280',
                  transition: 'all .15s', whiteSpace: 'nowrap'
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + Refresh */}
          <div className="filter-actions">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="filter-select"
              style={{
                padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12,
                fontSize: 13, fontWeight: 700, outline: 'none', background: 'white',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
              <option value="latest">{t.latestFirst}</option>
              <option value="price-low">{t.priceLowHigh}</option>
              <option value="price-high">{t.priceHighLow}</option>
              <option value="qty">{t.mostQuantity}</option>
            </select>

            <button onClick={fetchCrops} style={{
              padding: '9px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              borderRadius: 12, color: '#16a34a', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              whiteSpace: 'nowrap'
            }}>
              <RefreshCw size={14} /> {t.refresh}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid #bbf7d0', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Fetching fresh produce...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'white', borderRadius: 20, border: '1.5px solid #e5e7eb' }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>🌾</p>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#374151', margin: '0 0 8px' }}>
            {search || category !== 'All' ? 'No matching products found' : t.noProducts}
          </h3>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 16px' }}>
            {search ? 'Try different search terms' : t.farmersSoon}
          </p>
          {(search || category !== 'All') && (
            <button onClick={() => { setSearch(''); setCategory('All'); }}
              style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Crop Grid */}
      {!loading && filtered.length > 0 && (
        <div className="crop-grid">
          {filtered.map((crop, i) => (
            <div key={crop.id} className="crop-card"
              style={{
                animationDelay: `${Math.min(i * 0.05, 0.4)}s`,
                background: 'white', borderRadius: 20, border: '1.5px solid #e5e7eb',
                overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)'
              }}>

              {/* Card Top */}
              <div style={{ padding: '18px 18px 14px', background: 'linear-gradient(135deg,#f0fdf4,#fafffe)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 40 }}>{cropEmoji(crop.name)}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: '#dcfce7', color: '#15803d', whiteSpace: 'nowrap' }}>
                    ● Available
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#14532d', margin: '10px 0 4px', wordBreak: 'break-word' }}>{crop.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
                  <MapPin size={12} /> {crop.city || 'India'} · {crop.category || 'General'}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', fontWeight: 700 }}>ASKING PRICE</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', margin: 0 }}>
                      ₹{crop.pricePerUnit}
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>/{crop.unit || 'kg'}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', fontWeight: 700 }}>AVAILABLE</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#374151', margin: 0 }}>{crop.quantity} {crop.unit}</p>
                  </div>
                </div>

                {crop.description && (
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {crop.description}
                  </p>
                )}

                {/* Farmer Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9fafb', borderRadius: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {(crop.farmerName || crop.farmerUsername || 'F')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {crop.farmerName || crop.farmerUsername || 'Farmer'}
                    </p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Verified Farmer ✓</p>
                  </div>
                </div>

                <button onClick={() => setSelectedCrop(crop)} className="order-btn"
                  style={{
                    width: '100%', padding: '13px',
                    background: 'linear-gradient(135deg,#16a34a,#15803d)',
                    color: 'white', border: 'none', borderRadius: 12, fontSize: 14,
                    fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(22,163,74,.3)'
                  }}>
                  <ShoppingCart size={16} /> {t.sendRequestsToFarmers}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseProducts;