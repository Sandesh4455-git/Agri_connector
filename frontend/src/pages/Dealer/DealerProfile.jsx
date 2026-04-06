// src/pages/dealer/DealerProfile.jsx
// Responsive version — works on mobile, tablet, desktop

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  User, MapPin, Phone, Mail, Building2, Shield, Star, TrendingUp,
  Package, Users, DollarSign, Award, Globe, Edit3, Save, X,
  CreditCard, Truck, CheckCircle, Plus, Trash2,
  Banknote, Smartphone, Building, Info,
  Clock, Zap, Camera
} from 'lucide-react';

const PayIcon = ({ type }) => {
  if (type === 'upi')  return <Smartphone size={20} color="#7c3aed" />;
  if (type === 'bank') return <Building    size={20} color="#1d4ed8" />;
  if (type === 'cash') return <Banknote    size={20} color="#15803d" />;
  if (type === 'card') return <CreditCard  size={20} color="#b45309" />;
  return <DollarSign size={20} />;
};

// ─── PAYMENT MODAL ─────────────────────────────────────────────────────────────
function PaymentModal({ onClose }) {
  const PAYMENT_METHODS_INIT = [
    { id: 1, type: 'upi',  label: 'UPI',                       value: 'mrunal@okicici',      enabled: true,  icon: 'upi'  },
    { id: 2, type: 'bank', label: 'Bank Transfer (NEFT/RTGS)', value: 'ICICI Bank - ****4321', enabled: true,  icon: 'bank' },
    { id: 3, type: 'cash', label: 'Cash on Delivery',          value: 'Up to ₹50,000',       enabled: false, icon: 'cash' },
    { id: 4, type: 'card', label: 'Credit/Debit Card',         value: 'Visa, Mastercard',    enabled: true,  icon: 'card' },
  ];

  const [methods, setMethods] = useState(PAYMENT_METHODS_INIT);
  const [adding, setAdding]   = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'upi', label: '', value: '' });
  const [saved, setSaved]     = useState(false);

  const toggle    = (id) => setMethods(m => m.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const remove    = (id) => setMethods(m => m.filter(x => x.id !== id));
  const addMethod = () => {
    if (!newMethod.label || !newMethod.value) return;
    setMethods(m => [...m, { ...newMethod, id: Date.now(), enabled: true, icon: newMethod.type }]);
    setNewMethod({ type: 'upi', label: '', value: '' });
    setAdding(false);
  };
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="dp-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dp-modal">
        <div className="dp-modal-header" style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
          <div className="dp-modal-header-left">
            <div className="dp-modal-hico"><CreditCard size={22} color="white" /></div>
            <div>
              <h3>Payment Methods</h3>
              <p>Manage how buyers can pay you</p>
            </div>
          </div>
          <button className="dp-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="dp-modal-body">
          <div className="dp-methods-list">
            {methods.map(m => (
              <div key={m.id} className={`dp-method-item ${m.enabled ? 'active' : 'inactive'}`}>
                <div className="dp-method-ico"><PayIcon type={m.type} /></div>
                <div className="dp-method-info">
                  <div className="dp-method-label">{m.label}</div>
                  <div className="dp-method-val">{m.value}</div>
                </div>
                <div className="dp-method-actions">
                  <button className={`dp-toggle ${m.enabled ? 'on' : 'off'}`} onClick={() => toggle(m.id)}>
                    <div className="dp-toggle-knob" />
                  </button>
                  <button className="dp-del-btn" onClick={() => remove(m.id)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          {adding ? (
            <div className="dp-add-form">
              <div className="dp-add-form-title">Add Payment Method</div>
              <div className="dp-add-row">
                <label>Type</label>
                <select value={newMethod.type} onChange={e => setNewMethod({ ...newMethod, type: e.target.value })}>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="dp-add-row">
                <label>Label</label>
                <input placeholder="e.g. Google Pay UPI" value={newMethod.label}
                  onChange={e => setNewMethod({ ...newMethod, label: e.target.value })} />
              </div>
              <div className="dp-add-row">
                <label>Details</label>
                <input placeholder="e.g. name@upi or bank account" value={newMethod.value}
                  onChange={e => setNewMethod({ ...newMethod, value: e.target.value })} />
              </div>
              <div className="dp-add-btns">
                <button className="dp-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
                <button className="dp-btn-primary" onClick={addMethod}>Add Method</button>
              </div>
            </div>
          ) : (
            <button className="dp-add-trigger" onClick={() => setAdding(true)}>
              <Plus size={16} /> Add New Payment Method
            </button>
          )}

          <div className="dp-modal-info">
            <Info size={14} />
            <span>Enabled methods will be shown to buyers when placing orders.</span>
          </div>
        </div>

        <div className="dp-modal-footer">
          <button className="dp-btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`dp-btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
            {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELIVERY MODAL ────────────────────────────────────────────────────────────
function DeliveryModal({ onClose }) {
  const DELIVERY_SETTINGS_INIT = {
    selfDelivery: true,
    thirdParty: true,
    minOrderValue: '5000',
    maxDeliveryRadius: '200',
    deliveryCharge: '500',
    freeDeliveryAbove: '25000',
    estimatedDays: '3-5',
    zones: [
      { id: 1, name: 'Mumbai Metro', charge: '0',   days: '1-2', enabled: true  },
      { id: 2, name: 'Maharashtra',  charge: '300', days: '2-3', enabled: true  },
      { id: 3, name: 'Gujarat',      charge: '500', days: '3-4', enabled: true  },
      { id: 4, name: 'Pan India',    charge: '800', days: '5-7', enabled: false },
    ],
  };

  const [settings, setSettings]   = useState(DELIVERY_SETTINGS_INIT);
  const [saved, setSaved]         = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const sc = (key, val) => setSettings(s => ({ ...s, [key]: val }));
  const toggleZone = (id) =>
    setSettings(s => ({ ...s, zones: s.zones.map(z => z.id === id ? { ...z, enabled: !z.enabled } : z) }));
  const updateZone = (id, key, val) =>
    setSettings(s => ({ ...s, zones: s.zones.map(z => z.id === id ? { ...z, [key]: val } : z) }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="dp-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dp-modal dp-modal-lg">
        <div className="dp-modal-header" style={{ background: 'linear-gradient(135deg,#065f46,#10b981)' }}>
          <div className="dp-modal-header-left">
            <div className="dp-modal-hico"><Truck size={22} color="white" /></div>
            <div>
              <h3>Delivery Settings</h3>
              <p>Configure delivery & logistics preferences</p>
            </div>
          </div>
          <button className="dp-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="dp-modal-tabs">
          {['general', 'zones'].map(tab => (
            <button key={tab} className={`dp-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'general' ? <><Truck size={15} /> General</> : <><Globe size={15} /> Delivery Zones</>}
            </button>
          ))}
        </div>

        <div className="dp-modal-body">
          {activeTab === 'general' && (
            <div className="dp-del-general">
              <div className="dp-section-title">Delivery Options</div>
              <div className="dp-del-types">
                <label className={`dp-del-type ${settings.selfDelivery ? 'checked' : ''}`}>
                  <input type="checkbox" checked={settings.selfDelivery}
                    onChange={e => sc('selfDelivery', e.target.checked)} />
                  <div className="dp-del-type-ico"><Truck size={20} color={settings.selfDelivery ? '#065f46' : '#94a3b8'} /></div>
                  <div>
                    <div className="dp-del-type-label">Self Delivery</div>
                    <div className="dp-del-type-sub">Your own delivery team</div>
                  </div>
                  {settings.selfDelivery && <CheckCircle size={18} color="#10b981" style={{ marginLeft: 'auto' }} />}
                </label>
                <label className={`dp-del-type ${settings.thirdParty ? 'checked' : ''}`}>
                  <input type="checkbox" checked={settings.thirdParty}
                    onChange={e => sc('thirdParty', e.target.checked)} />
                  <div className="dp-del-type-ico"><Package size={20} color={settings.thirdParty ? '#065f46' : '#94a3b8'} /></div>
                  <div>
                    <div className="dp-del-type-label">Third-Party Courier</div>
                    <div className="dp-del-type-sub">Delhivery, DTDC, etc.</div>
                  </div>
                  {settings.thirdParty && <CheckCircle size={18} color="#10b981" style={{ marginLeft: 'auto' }} />}
                </label>
              </div>

              <div className="dp-section-title" style={{ marginTop: 20 }}>Charges & Limits</div>
              <div className="dp-del-grid">
                {[
                  { label: 'Min Order Value (₹)',        key: 'minOrderValue',      ph: '5000'  },
                  { label: 'Base Delivery Charge (₹)',   key: 'deliveryCharge',     ph: '500'   },
                  { label: 'Free Delivery Above (₹)',    key: 'freeDeliveryAbove',  ph: '25000' },
                  { label: 'Max Delivery Radius (km)',   key: 'maxDeliveryRadius',  ph: '200'   },
                  { label: 'Estimated Delivery (days)',  key: 'estimatedDays',      ph: '3-5'   },
                ].map(f => (
                  <div key={f.key} className="dp-del-field">
                    <label>{f.label}</label>
                    <input type="text" value={settings[f.key]} placeholder={f.ph}
                      onChange={e => sc(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="dp-modal-info" style={{ marginTop: 16 }}>
                <Info size={14} />
                <span>Free delivery threshold applies on top of base delivery charges.</span>
              </div>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="dp-del-zones">
              <div className="dp-section-title">Delivery Zone Configuration</div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Set zone-specific charges and estimated delivery times.
              </p>
              {settings.zones.map(zone => (
                <div key={zone.id} className={`dp-zone-row ${zone.enabled ? '' : 'disabled'}`}>
                  <div className="dp-zone-left">
                    <button className={`dp-toggle ${zone.enabled ? 'on' : 'off'}`} onClick={() => toggleZone(zone.id)}>
                      <div className="dp-toggle-knob" />
                    </button>
                    <div className="dp-zone-name"><Globe size={14} color="#64748b" />{zone.name}</div>
                  </div>
                  <div className="dp-zone-fields">
                    <div className="dp-zone-field">
                      <label>Charge (₹)</label>
                      <input type="text" value={zone.charge}
                        onChange={e => updateZone(zone.id, 'charge', e.target.value)}
                        disabled={!zone.enabled} />
                    </div>
                    <div className="dp-zone-field">
                      <label>Days</label>
                      <input type="text" value={zone.days}
                        onChange={e => updateZone(zone.id, 'days', e.target.value)}
                        disabled={!zone.enabled} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dp-modal-footer">
          <button className="dp-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={`dp-btn-save ${saved ? 'saved' : ''}`}
            style={saved ? {} : { background: 'linear-gradient(135deg,#065f46,#10b981)' }}
            onClick={handleSave}
          >
            {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DealerProfile() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();

  const INITIAL_PROFILE = {
    name:            user?.name  || 'Mrunal Pernekar',
    businessName:    'Pernekar Agro Traders',
    email:           user?.email || 'mrunal@pernekaragrotraders.com',
    phone:           '9876543210',
    gst:             '27ABCDE1234F1Z5',
    establishedYear: '2015',
    license:         'TRD-2024-12345',
    businessAddress: '123 Business Street, Market Area, Mumbai - 400001',
    businessType:    t?.wholesaleDistributor || 'Wholesale Distributor',
    specializations: [t?.grains || 'Grains', t?.vegetables || 'Vegetables', t?.cashCrops || 'Cash Crops'],
    tradeAreas:      ['Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Delhi NCR'],
    stats:           { suppliers: 12, orders: 48, revenue: '₹2.5L', satisfaction: '4.8/5' },
    verified:        true,
    premium:         true,
  };

  const [profile, setProfile]         = useState(INITIAL_PROFILE);
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState(INITIAL_PROFILE);
  const [modal, setModal]             = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSpec, setNewSpec]         = useState('');
  const [newArea, setNewArea]         = useState('');

  const ef = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const handleSaveProfile = () => {
    setProfile(editForm);
    if (updateProfile) updateProfile(editForm);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setEditing(false); }, 1400);
  };

  const removeSpec = (s) => setEditForm(f => ({ ...f, specializations: f.specializations.filter(x => x !== s) }));
  const addSpec = () => {
    if (newSpec.trim() && !editForm.specializations.includes(newSpec.trim())) {
      setEditForm(f => ({ ...f, specializations: [...f.specializations, newSpec.trim()] }));
      setNewSpec('');
    }
  };
  const removeArea = (a) => setEditForm(f => ({ ...f, tradeAreas: f.tradeAreas.filter(x => x !== a) }));
  const addArea = () => {
    if (newArea.trim() && !editForm.tradeAreas.includes(newArea.trim())) {
      setEditForm(f => ({ ...f, tradeAreas: [...f.tradeAreas, newArea.trim()] }));
      setNewArea('');
    }
  };

  const d = editing ? editForm : profile;

  return (
    <>
      <div className="dp-root">
        {/* ── BANNER ── */}
        <div className="dp-banner">
          <div className="dp-banner-bg" />
          <div className="dp-banner-content">
            <div className="dp-avatar">
              <div className="dp-avatar-inner">
                {d.name?.slice(0, 2).toUpperCase() || 'MP'}
              </div>
              <div className="dp-avatar-ring" />
              {editing && (
                <button className="dp-avatar-cam" title="Change photo">
                  <Camera size={14} color="white" />
                </button>
              )}
            </div>
            <div className="dp-banner-info">
              <h1>{d.businessName}</h1>
              <p className="dp-banner-sub"><User size={14} /> {d.name}</p>
              <div className="dp-badges">
                {d.verified && (
                  <span className="dp-badge verified"><CheckCircle size={13} /> {t?.verified || 'Verified'}</span>
                )}
                {d.premium && (
                  <span className="dp-badge premium"><Zap size={13} /> {t?.premiumPartner || 'Premium Partner'}</span>
                )}
              </div>
            </div>
            <div className="dp-banner-actions">
              {editing ? (
                <>
                  <button className="dp-btn-outline" onClick={() => { setEditing(false); setEditForm(profile); }}>
                    <X size={16} /> {t?.cancel || 'Cancel'}
                  </button>
                  <button className={`dp-btn-primary-sm ${saveSuccess ? 'success' : ''}`} onClick={handleSaveProfile}>
                    {saveSuccess
                      ? <><CheckCircle size={16} /> {t?.saved || 'Saved!'}</>
                      : <><Save size={16} /> {t?.saveProfile || 'Save Profile'}</>}
                  </button>
                </>
              ) : (
                <button className="dp-btn-primary-sm" onClick={() => { setEditing(true); setEditForm(profile); }}>
                  <Edit3 size={16} /> {t?.editProfile || 'Edit Profile'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="dp-stats-row">
          {[
            { icon: <Users size={20} color="#1d4ed8" />, val: profile.stats.suppliers,    label: t?.activeSuppliers || 'Active Suppliers', bg: '#eff6ff' },
            { icon: <Package size={20} color="#7c3aed" />, val: profile.stats.orders,     label: t?.monthlyOrders   || 'Monthly Orders',   bg: '#f5f3ff' },
            { icon: <TrendingUp size={20} color="#15803d" />, val: profile.stats.revenue, label: t?.revenue         || 'Revenue',          bg: '#f0fdf4' },
            { icon: <Star size={20} color="#b45309" />, val: profile.stats.satisfaction,  label: t?.satisfaction    || 'Satisfaction',     bg: '#fffbeb' },
          ].map((s, i) => (
            <div key={i} className="dp-stat-card" style={{ '--sb': s.bg }}>
              <div className="dp-stat-ico" style={{ background: s.bg }}>{s.icon}</div>
              <div className="dp-stat-val">{s.val}</div>
              <div className="dp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="dp-grid">

          {/* LEFT COLUMN */}
          <div className="dp-col">
            {/* Business Info */}
            <div className="dp-card">
              <div className="dp-card-header">
                <Building2 size={18} color="#1d4ed8" />
                <h3>{t?.businessInformation || 'Business Information'}</h3>
              </div>
              <div className="dp-card-body">
                {editing ? (
                  <div className="dp-edit-fields">
                    {[
                      { label: t?.businessName       || 'Business Name',     key: 'businessName'    },
                      { label: t?.ownerName          || 'Owner Name',        key: 'name'            },
                      { label: t?.businessType       || 'Business Type',     key: 'businessType'    },
                      { label: t?.gstNumber          || 'GST Number',        key: 'gst'             },
                      { label: t?.establishmentYear  || 'Established Year',  key: 'establishedYear' },
                      { label: t?.licenseNumber      || 'License Number',    key: 'license'         },
                    ].map(f => (
                      <div key={f.key} className="dp-edit-field">
                        <label>{f.label}</label>
                        <input type="text" value={editForm[f.key] || ''}
                          onChange={e => ef(f.key, e.target.value)} />
                      </div>
                    ))}
                    <div className="dp-edit-field dp-edit-field--full">
                      <label>{t?.businessAddress || 'Business Address'}</label>
                      <textarea value={editForm.businessAddress || ''}
                        onChange={e => ef('businessAddress', e.target.value)} rows={3} />
                    </div>
                  </div>
                ) : (
                  <div className="dp-info-rows">
                    {[
                      { label: t?.businessType  || 'Business Type', val: d.businessType,    icon: <Building2 size={15} color="#64748b" /> },
                      { label: t?.gstNumber     || 'GST Number',    val: d.gst,             icon: <Shield    size={15} color="#64748b" /> },
                      { label: t?.established   || 'Established',   val: d.establishedYear, icon: <Clock     size={15} color="#64748b" /> },
                      { label: t?.licenseNumber || 'License',       val: d.license,         icon: <Award     size={15} color="#64748b" /> },
                    ].map(r => (
                      <div key={r.label} className="dp-info-row">
                        <div className="dp-info-row-left">{r.icon}<span>{r.label}</span></div>
                        <div className="dp-info-row-val">{r.val}</div>
                      </div>
                    ))}
                    <div className="dp-info-address">
                      <MapPin size={15} color="#64748b" />
                      <span>{d.businessAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="dp-card">
              <div className="dp-card-header">
                <Phone size={18} color="#7c3aed" />
                <h3>{t?.contactDetails || 'Contact Details'}</h3>
              </div>
              <div className="dp-card-body">
                {editing ? (
                  <div className="dp-edit-fields">
                    {[
                      { label: t?.contactNumber || 'Phone', key: 'phone', type: 'tel'   },
                      { label: t?.emailAddress  || 'Email', key: 'email', type: 'email' },
                    ].map(f => (
                      <div key={f.key} className="dp-edit-field">
                        <label>{f.label}</label>
                        <input type={f.type} value={editForm[f.key] || ''}
                          onChange={e => ef(f.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dp-info-rows">
                    <div className="dp-info-row">
                      <div className="dp-info-row-left"><Phone size={15} color="#7c3aed" /><span>{t?.phone || 'Phone'}</span></div>
                      <div className="dp-info-row-val">+91 {d.phone}</div>
                    </div>
                    <div className="dp-info-row">
                      <div className="dp-info-row-left"><Mail size={15} color="#7c3aed" /><span>{t?.email || 'Email'}</span></div>
                      <div className="dp-info-row-val" style={{ fontSize: 12, wordBreak: 'break-all' }}>{d.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Areas */}
            <div className="dp-card">
              <div className="dp-card-header">
                <Globe size={18} color="#0891b2" />
                <h3>{t?.tradeAreas || 'Trade Areas'}</h3>
              </div>
              <div className="dp-card-body">
                <div className="dp-areas-list">
                  {(editing ? editForm : profile).tradeAreas.map(a => (
                    <div key={a} className="dp-area-chip">
                      <Globe size={13} color="#0891b2" />
                      <span>{a}</span>
                      {editing && (
                        <button className="dp-chip-del" onClick={() => removeArea(a)}><X size={12} /></button>
                      )}
                    </div>
                  ))}
                </div>
                {editing && (
                  <div className="dp-chip-add">
                    <input placeholder="Add trade area…" value={newArea}
                      onChange={e => setNewArea(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addArea()} />
                    <button onClick={addArea}><Plus size={15} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="dp-col">
            {/* Specializations */}
            <div className="dp-card">
              <div className="dp-card-header">
                <Award size={18} color="#b45309" />
                <h3>{t?.specialization || 'Specializations'}</h3>
              </div>
              <div className="dp-card-body">
                <div className="dp-spec-chips">
                  {(editing ? editForm : profile).specializations.map(s => (
                    <span key={s} className="dp-spec-chip">
                      {s}
                      {editing && (
                        <button className="dp-chip-del" onClick={() => removeSpec(s)}><X size={12} /></button>
                      )}
                    </span>
                  ))}
                </div>
                {editing && (
                  <div className="dp-chip-add" style={{ marginTop: 12 }}>
                    <input placeholder="Add specialization…" value={newSpec}
                      onChange={e => setNewSpec(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSpec()} />
                    <button onClick={addSpec}><Plus size={15} /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Business Settings */}
            <div className="dp-card dp-card--highlight">
              <div className="dp-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="dp-settings-hico">⚙️</div>
                  <h3>{t?.businessSettings || 'Business Settings'}</h3>
                </div>
              </div>
              <div className="dp-card-body" style={{ padding: '8px 20px 20px' }}>
                <div className="dp-setting-item">
                  <div className="dp-setting-ico" style={{ background: '#eff6ff' }}>
                    <CreditCard size={22} color="#1d4ed8" />
                  </div>
                  <div className="dp-setting-info">
                    <div className="dp-setting-title">{t?.paymentMethods || 'Payment Methods'}</div>
                    <div className="dp-setting-sub">Manage accepted payment methods</div>
                    <div className="dp-setting-tags">
                      {['UPI', 'Bank', 'Card'].map(tag => (
                        <span key={tag} className="dp-setting-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button className="dp-configure-btn dp-configure-btn--blue" onClick={() => setModal('payment')}>
                    <CreditCard size={15} /> {t?.configure || 'Configure'}
                  </button>
                </div>

                <div className="dp-setting-divider" />

                <div className="dp-setting-item">
                  <div className="dp-setting-ico" style={{ background: '#f0fdf4' }}>
                    <Truck size={22} color="#15803d" />
                  </div>
                  <div className="dp-setting-info">
                    <div className="dp-setting-title">{t?.deliverySettings || 'Delivery Settings'}</div>
                    <div className="dp-setting-sub">Configure delivery and logistics</div>
                    <div className="dp-setting-tags">
                      <span className="dp-setting-tag dp-setting-tag--green">Self Delivery</span>
                      <span className="dp-setting-tag dp-setting-tag--green">3rd Party</span>
                      <span className="dp-setting-tag">4 Zones</span>
                    </div>
                  </div>
                  <button className="dp-configure-btn dp-configure-btn--green" onClick={() => setModal('delivery')}>
                    <Truck size={15} /> {t?.setup || 'Setup'}
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="dp-card">
              <div className="dp-card-header">
                <TrendingUp size={18} color="#15803d" />
                <h3>Performance Overview</h3>
              </div>
              <div className="dp-card-body">
                <div className="dp-perf-bars">
                  {[
                    { label: 'Order Fulfillment', pct: 94, color: '#10b981' },
                    { label: 'On-Time Delivery',  pct: 87, color: '#3b82f6' },
                    { label: 'Customer Rating',   pct: 96, color: '#f59e0b' },
                    { label: 'Response Rate',     pct: 91, color: '#8b5cf6' },
                  ].map(b => (
                    <div key={b.label} className="dp-perf-bar-row">
                      <div className="dp-perf-bar-top">
                        <span>{b.label}</span>
                        <span style={{ color: b.color, fontWeight: 700 }}>{b.pct}%</span>
                      </div>
                      <div className="dp-perf-bar-track">
                        <div className="dp-perf-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modal === 'payment'  && <PaymentModal  onClose={() => setModal(null)} />}
      {modal === 'delivery' && <DeliveryModal onClose={() => setModal(null)} />}

      <style>{CSS}</style>
    </>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.dp-root{font-family:'DM Sans','Baloo 2',sans-serif;color:#1e293b;min-height:100vh;background:#f1f5f9;padding-bottom:60px;}

/* BANNER */
.dp-banner{position:relative;overflow:hidden;border-radius:0 0 24px 24px;margin-bottom:0;}
.dp-banner-bg{position:absolute;inset:0;background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#3b82f6 100%);z-index:0;}
.dp-banner-bg::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
.dp-banner-content{position:relative;z-index:1;display:flex;align-items:center;gap:24px;padding:32px 32px 36px;flex-wrap:wrap;}

.dp-avatar{position:relative;flex-shrink:0;}
.dp-avatar-inner{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:white;letter-spacing:-1px;box-shadow:0 8px 24px rgba(0,0,0,.3);}
.dp-avatar-ring{position:absolute;inset:-3px;border-radius:50%;border:3px solid rgba(255,255,255,.3);}
.dp-avatar-cam{position:absolute;bottom:0;right:0;background:rgba(0,0,0,.5);border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;}

.dp-banner-info{flex:1;min-width:200px;}
.dp-banner-info h1{font-size:clamp(18px,4vw,26px);font-weight:800;color:white;margin-bottom:4px;line-height:1.2;}
.dp-banner-sub{display:flex;align-items:center;gap:6px;font-size:14px;color:rgba(255,255,255,.75);margin-bottom:10px;}
.dp-badges{display:flex;gap:8px;flex-wrap:wrap;}
.dp-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;}
.dp-badge.verified{background:rgba(16,185,129,.2);color:#6ee7b7;border:1px solid rgba(16,185,129,.3);}
.dp-badge.premium{background:rgba(245,158,11,.2);color:#fcd34d;border:1px solid rgba(245,158,11,.3);}

.dp-banner-actions{display:flex;gap:10px;flex-wrap:wrap;}
.dp-btn-outline{display:flex;align-items:center;gap:7px;padding:10px 20px;border-radius:12px;border:2px solid rgba(255,255,255,.3);background:transparent;color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;}
.dp-btn-outline:hover{background:rgba(255,255,255,.1);}
.dp-btn-primary-sm{display:flex;align-items:center;gap:7px;padding:10px 20px;border-radius:12px;border:none;background:rgba(255,255,255,.2);backdrop-filter:blur(10px);color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 4px 14px rgba(0,0,0,.2);}
.dp-btn-primary-sm:hover{background:rgba(255,255,255,.3);transform:translateY(-1px);}
.dp-btn-primary-sm.success{background:rgba(16,185,129,.3);}

/* STATS */
.dp-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:24px 32px;background:white;box-shadow:0 4px 16px rgba(0,0,0,.06);}
.dp-stat-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 12px;border-radius:16px;background:var(--sb);transition:transform .2s;cursor:default;}
.dp-stat-card:hover{transform:translateY(-2px);}
.dp-stat-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
.dp-stat-val{font-size:22px;font-weight:800;color:#1e293b;}
.dp-stat-lbl{font-size:12px;color:#64748b;font-weight:500;text-align:center;}

/* GRID */
.dp-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px 32px;}
.dp-col{display:flex;flex-direction:column;gap:20px;}

/* CARD */
.dp-card{background:white;border-radius:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);overflow:hidden;border:1px solid #f1f5f9;}
.dp-card--highlight{border:2px solid #e0e7ff;box-shadow:0 4px 20px rgba(99,102,241,.1);}
.dp-card-header{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid #f1f5f9;background:#fafafa;}
.dp-card-header h3{font-size:15px;font-weight:700;color:#1e293b;}
.dp-card-body{padding:16px 20px;}
.dp-settings-hico{font-size:20px;}

/* INFO ROWS */
.dp-info-rows{display:flex;flex-direction:column;gap:12px;}
.dp-info-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;background:#f8fafc;gap:8px;}
.dp-info-row-left{display:flex;align-items:center;gap:8px;font-size:13px;color:#64748b;font-weight:500;flex-shrink:0;}
.dp-info-row-val{font-size:13px;font-weight:600;color:#1e293b;text-align:right;word-break:break-word;}
.dp-info-address{display:flex;align-items:flex-start;gap:8px;padding:10px 14px;border-radius:10px;background:#f8fafc;font-size:13px;color:#475569;line-height:1.5;}

/* EDIT FIELDS */
.dp-edit-fields{display:flex;flex-direction:column;gap:12px;}
.dp-edit-field{display:flex;flex-direction:column;gap:5px;}
.dp-edit-field--full{grid-column:1/-1;}
.dp-edit-field label{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;}
.dp-edit-field input,.dp-edit-field textarea{padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;outline:none;transition:border-color .2s;background:white;resize:vertical;width:100%;box-sizing:border-box;}
.dp-edit-field input:focus,.dp-edit-field textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);}

/* CHIPS */
.dp-spec-chips{display:flex;flex-wrap:wrap;gap:8px;}
.dp-spec-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;font-size:13px;font-weight:600;border:1px solid #fcd34d;}
.dp-areas-list{display:flex;flex-direction:column;gap:8px;}
.dp-area-chip{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;font-size:14px;font-weight:500;}
.dp-chip-del{background:none;border:none;cursor:pointer;padding:2px;border-radius:4px;color:#94a3b8;display:flex;align-items:center;margin-left:auto;transition:color .2s;}
.dp-chip-del:hover{color:#ef4444;}
.dp-chip-add{display:flex;gap:8px;margin-top:10px;}
.dp-chip-add input{flex:1;padding:8px 12px;border:2px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;min-width:0;}
.dp-chip-add input:focus{border-color:#3b82f6;}
.dp-chip-add button{padding:8px 14px;border:none;border-radius:10px;background:#3b82f6;color:white;cursor:pointer;display:flex;align-items:center;transition:background .2s;flex-shrink:0;}
.dp-chip-add button:hover{background:#2563eb;}

/* SETTINGS */
.dp-setting-item{display:flex;align-items:flex-start;gap:16px;padding:16px 0;flex-wrap:wrap;}
.dp-setting-ico{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dp-setting-info{flex:1;min-width:120px;}
.dp-setting-title{font-size:15px;font-weight:700;color:#1e293b;margin-bottom:3px;}
.dp-setting-sub{font-size:13px;color:#64748b;margin-bottom:8px;}
.dp-setting-tags{display:flex;flex-wrap:wrap;gap:6px;}
.dp-setting-tag{padding:3px 10px;border-radius:20px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:600;border:1px solid #e2e8f0;}
.dp-setting-tag--green{background:#dcfce7;color:#15803d;border-color:#bbf7d0;}
.dp-setting-divider{height:1px;background:#f1f5f9;margin:4px 0;}
.dp-configure-btn{display:flex;align-items:center;gap:7px;padding:10px 18px;border-radius:12px;border:none;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .25s;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.12);}
.dp-configure-btn--blue{background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;}
.dp-configure-btn--blue:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(59,130,246,.3);}
.dp-configure-btn--green{background:linear-gradient(135deg,#065f46,#10b981);color:white;}
.dp-configure-btn--green:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(16,185,129,.3);}

/* PERF BARS */
.dp-perf-bars{display:flex;flex-direction:column;gap:14px;}
.dp-perf-bar-top{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;}
.dp-perf-bar-track{height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;}
.dp-perf-bar-fill{height:100%;border-radius:4px;transition:width 1s cubic-bezier(.22,1,.36,1);}

/* MODAL */
.dp-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease both;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.dp-modal{background:white;border-radius:24px;width:100%;max-width:520px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.25);animation:slideUp .3s cubic-bezier(.22,1,.36,1) both;overflow:hidden;}
.dp-modal-lg{max-width:620px;}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
.dp-modal-header{padding:22px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.dp-modal-header-left{display:flex;align-items:center;gap:14px;}
.dp-modal-hico{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;}
.dp-modal-header h3{font-size:18px;font-weight:800;color:white;margin-bottom:2px;}
.dp-modal-header p{font-size:13px;color:rgba(255,255,255,.75);}
.dp-modal-close{background:rgba(255,255,255,.15);border:none;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:white;cursor:pointer;transition:background .2s;}
.dp-modal-close:hover{background:rgba(255,255,255,.25);}
.dp-modal-tabs{display:flex;border-bottom:2px solid #f1f5f9;background:#fafafa;}
.dp-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:14px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s;}
.dp-tab.active{color:#1e40af;border-bottom-color:#3b82f6;background:white;}
.dp-modal-body{padding:20px 24px;overflow-y:auto;flex:1;}
.dp-modal-footer{padding:16px 24px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:12px;background:#fafafa;flex-wrap:wrap;}

/* PAYMENT METHODS */
.dp-methods-list{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;}
.dp-method-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:2px solid #f1f5f9;transition:border-color .2s;flex-wrap:wrap;}
.dp-method-item.active{border-color:#e0e7ff;background:#fafbff;}
.dp-method-item.inactive{background:#fafafa;opacity:.75;}
.dp-method-ico{width:40px;height:40px;border-radius:10px;background:#f8fafc;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dp-method-info{flex:1;min-width:100px;}
.dp-method-label{font-size:14px;font-weight:700;color:#1e293b;}
.dp-method-val{font-size:12px;color:#64748b;margin-top:2px;}
.dp-method-actions{display:flex;align-items:center;gap:10px;}

/* TOGGLE */
.dp-toggle{position:relative;width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;transition:background .3s;flex-shrink:0;padding:0;}
.dp-toggle.on{background:linear-gradient(135deg,#10b981,#059669);}
.dp-toggle.off{background:#e2e8f0;}
.dp-toggle-knob{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:white;transition:left .3s;box-shadow:0 2px 4px rgba(0,0,0,.2);}
.dp-toggle.on .dp-toggle-knob{left:23px;}
.dp-toggle.off .dp-toggle-knob{left:3px;}
.dp-del-btn{background:none;border:none;cursor:pointer;color:#94a3b8;padding:6px;border-radius:8px;display:flex;align-items:center;transition:all .2s;}
.dp-del-btn:hover{color:#ef4444;background:#fff1f0;}

/* ADD FORM */
.dp-add-form{background:#f8fafc;border-radius:14px;padding:16px;border:2px solid #e2e8f0;margin-bottom:12px;}
.dp-add-form-title{font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px;}
.dp-add-row{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.dp-add-row label{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;}
.dp-add-row input,.dp-add-row select{padding:9px 12px;border:2px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s;width:100%;box-sizing:border-box;}
.dp-add-row input:focus,.dp-add-row select:focus{border-color:#3b82f6;}
.dp-add-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:4px;flex-wrap:wrap;}
.dp-add-trigger{width:100%;padding:12px;border-radius:12px;border:2px dashed #e2e8f0;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#64748b;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;margin-bottom:12px;}
.dp-add-trigger:hover{border-color:#3b82f6;color:#3b82f6;background:#eff6ff;}
.dp-modal-info{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;font-size:12.5px;color:#78350f;font-weight:500;}

/* DELIVERY */
.dp-section-title{font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;}
.dp-del-types{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.dp-del-type{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;border:2px solid #e2e8f0;cursor:pointer;transition:all .2s;background:white;}
.dp-del-type input{display:none;}
.dp-del-type.checked{border-color:#10b981;background:#f0fdf4;}
.dp-del-type:hover{border-color:#94a3b8;}
.dp-del-type-ico{width:38px;height:38px;border-radius:10px;background:#f8fafc;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dp-del-type-label{font-size:13px;font-weight:700;color:#1e293b;}
.dp-del-type-sub{font-size:11px;color:#64748b;margin-top:2px;}
.dp-del-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.dp-del-field{display:flex;flex-direction:column;gap:4px;}
.dp-del-field label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;}
.dp-del-field input{padding:9px 12px;border:2px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s;width:100%;box-sizing:border-box;}
.dp-del-field input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.1);}

/* ZONES */
.dp-zone-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:2px solid #f1f5f9;margin-bottom:10px;transition:all .2s;flex-wrap:wrap;}
.dp-zone-row.disabled{opacity:.55;}
.dp-zone-left{display:flex;align-items:center;gap:10px;min-width:140px;}
.dp-zone-name{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:#1e293b;}
.dp-zone-fields{display:flex;gap:10px;flex:1;flex-wrap:wrap;}
.dp-zone-field{display:flex;flex-direction:column;gap:3px;}
.dp-zone-field label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;}
.dp-zone-field input{width:80px;padding:7px 10px;border:2px solid #e2e8f0;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;}
.dp-zone-field input:focus{border-color:#10b981;}
.dp-zone-field input:disabled{background:#f8fafc;color:#94a3b8;}

/* BUTTONS */
.dp-btn-ghost{padding:10px 20px;border-radius:12px;border:2px solid #e2e8f0;background:transparent;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#64748b;cursor:pointer;transition:all .2s;}
.dp-btn-ghost:hover{border-color:#94a3b8;color:#1e293b;}
.dp-btn-primary{padding:9px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;}
.dp-btn-primary:hover{filter:brightness(1.08);}
.dp-btn-save{display:flex;align-items:center;gap:8px;padding:11px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 4px 14px rgba(59,130,246,.3);}
.dp-btn-save:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(59,130,246,.35);}
.dp-btn-save.saved{background:linear-gradient(135deg,#065f46,#10b981);box-shadow:0 4px 14px rgba(16,185,129,.3);}

/* RESPONSIVE */
@media(max-width:900px){
  .dp-grid{grid-template-columns:1fr;}
  .dp-stats-row{grid-template-columns:repeat(2,1fr);padding:16px 20px;}
}
@media(max-width:600px){
  .dp-banner-content{padding:20px 16px 24px;gap:16px;}
  .dp-banner-info h1{font-size:18px;}
  .dp-banner-actions{width:100%;justify-content:flex-end;}
  .dp-grid{padding:16px;}
  .dp-del-types{grid-template-columns:1fr;}
  .dp-del-grid{grid-template-columns:1fr;}
  .dp-modal-body{padding:16px;}
  .dp-modal-footer{justify-content:stretch;}
  .dp-modal-footer > button{flex:1;}
  .dp-zone-left{min-width:unset;}
  .dp-zone-fields{width:100%;}
  .dp-setting-item{gap:10px;}
  .dp-configure-btn{padding:8px 12px;font-size:12px;}
}
@media(max-width:400px){
  .dp-stats-row{grid-template-columns:1fr 1fr;gap:8px;}
  .dp-stat-val{font-size:18px;}
}
`;