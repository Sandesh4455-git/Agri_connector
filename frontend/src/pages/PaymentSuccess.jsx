import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Printer, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/payments';
const getToken = () => localStorage.getItem('agri_connect_token');

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status') || 'success';
  const txnId  = searchParams.get('txnid') || searchParams.get('txnId') || '';

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const role     = localStorage.getItem('agri_connect_role')?.toLowerCase() || 'farmer';
  const backPath = role === 'dealer' ? '/dealer/payments' : '/farmer/payments';
  const isSuccess = status === 'success';
  const now = new Date();

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = getToken();
        if (!token) { setLoading(false); return; }
        const res = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && txnId) {
          const found = (data.data || []).find(t => t.payuTxnId === txnId);
          setPayment(found || null);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchPayment();
  }, [txnId]);

  const handlePrint = () => window.print();

  const btnStyle = (bg, color, border) => ({
    flex: 1,
    padding: '11px 12px',
    background: bg, color,
    border: border || 'none',
    borderRadius: 10,
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    whiteSpace: 'nowrap',
  });

  const rowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '10px 0', borderBottom: '1px solid #f3f4f6', gap: 12,
  };

  const p = payment;

  return (
    <div style={{
      minHeight: '100vh',
      background: isSuccess ? 'linear-gradient(135deg,#f0fdf4,#ecfdf5)' : 'linear-gradient(135deg,#fef2f2,#fff5f5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ps-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          width: 100%;
          max-width: 540px;
          overflow: hidden;
        }

        .ps-header {
          background: ${isSuccess ? 'linear-gradient(135deg,#15803d,#059669)' : 'linear-gradient(135deg,#dc2626,#ef4444)'};
          padding: clamp(20px,5vw,32px) clamp(16px,5vw,32px) clamp(18px,4vw,28px);
          text-align: center;
          color: white;
        }

        .ps-body {
          padding: clamp(18px,4vw,28px) clamp(16px,4vw,32px);
        }

        .ps-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .ps-actions > button {
          min-width: 120px;
        }

        @media print {
          body * { visibility: hidden; }
          #agri-invoice, #agri-invoice * { visibility: visible; }
          #agri-invoice { position: fixed; top: 0; left: 0; width: 100%; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="agri-invoice" className="ps-card">

        {/* Header */}
        <div className="ps-header">
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {isSuccess ? <CheckCircle size={32} color="white" /> : <XCircle size={32} color="white" />}
          </div>
          <h2 style={{ fontSize: 'clamp(17px,4vw,22px)', fontWeight: 700, margin: '0 0 6px' }}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 14px' }}>
            {isSuccess ? 'Your transaction has been completed' : 'Something went wrong with your payment'}
          </p>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Georgia,serif', opacity: 0.9 }}>
            🌾 AgriConnect
          </span>
        </div>

        {/* Body */}
        <div className="ps-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ width: 34, height: 34, border: '3px solid #dcfce7', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 12 }}>Loading transaction details...</p>
            </div>
          ) : isSuccess ? (
            <>
              {/* Invoice Number */}
              <div style={{ textAlign: 'center', marginBottom: 18, padding: '11px 14px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Invoice Number</p>
                <p style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#15803d', margin: 0 }}>
                  {p?.invoiceNumber || ('INV-' + Date.now())}
                </p>
              </div>

              {/* Amount */}
              <div style={{ textAlign: 'center', marginBottom: 18, padding: '14px', background: '#f9fafb', borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>Amount Paid</p>
                <p style={{ fontSize: 'clamp(28px,7vw,38px)', fontWeight: 800, color: '#15803d', margin: 0 }}>
                  ₹{(p?.amount || 0).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Details */}
              {[
                { label: 'Transaction ID',  value: p?.payuTxnId || txnId || '-' },
                { label: 'Crop / Product',  value: p?.cropName || '-' },
                { label: 'Quantity',        value: p?.quantity && p?.unit ? `${p.quantity} ${p.unit}` : '-' },
                { label: 'From (Dealer)',   value: p?.fromUsername || '-' },
                { label: 'To (Farmer)',     value: p?.toUsername || '-' },
                { label: 'Payment Method',  value: p?.paymentMethod?.replace('_', ' ') || 'ONLINE' },
                { label: 'Date & Time', value: (() => {
                    const d = p?.completedAt ? new Date(p.completedAt) : now;
                    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  })()
                },
                { label: 'Status', value: '✅ Completed' },
              ].map((row, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: '#111827', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}

              <div style={{ marginTop: 14, padding: '9px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 11, color: '#92400e', textAlign: 'center' }}>
                🔒 Computer-generated invoice. No signature required.
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '18px 0' }}>
              <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700, margin: '0 0 10px' }}>
                Transaction could not be completed
              </p>
              {txnId && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>
                Transaction ID: <strong>{txnId}</strong>
              </p>}
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                Please try again or use a different payment method.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="ps-actions no-print">
            <button onClick={() => navigate(backPath)} style={btnStyle('white', '#374151', '1.5px solid #e5e7eb')}>
              <ArrowLeft size={14} /> Back
            </button>
            {isSuccess && (
              <button onClick={handlePrint} style={btnStyle('linear-gradient(135deg,#15803d,#059669)', 'white')}>
                <Printer size={14} /> Print Invoice
              </button>
            )}
            {!isSuccess && (
              <button onClick={() => navigate(backPath)} style={btnStyle('linear-gradient(135deg,#dc2626,#ef4444)', 'white')}>
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;