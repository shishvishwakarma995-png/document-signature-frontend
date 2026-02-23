import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const GOLD = '#C9A84C';
const BLACK = '#0A0A0B';
const PARCHMENT = '#f5f0e8';

export default function SignPage() {
  const { token } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/api/share/${token}`);
        setDocument(res.data.document);
        if (res.data.signerEmail) setSignerEmail(res.data.signerEmail);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired link.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [token]);

  const handleSign = async () => {
    if (!signerName || !signerEmail) {
      setError('Please enter your name and email.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/share/${token}/sign`, { signerName, signerEmail });
      setSuccess('Document signed successfully! ✓');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/share/${token}/reject`, { reason });
      setSuccess('Document rejected.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: PARCHMENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace' }}>
      <p style={{ color: '#9a9088' }}>Loading document...</p>
    </div>
  );

  if (error && !document) return (
    <div style={{ minHeight: '100vh', background: PARCHMENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1a1714', marginBottom: 8 }}>Link Invalid</h2>
        <p style={{ fontSize: 13, color: '#9a9088' }}>{error}</p>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', background: PARCHMENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>{success.includes('rejected') ? '❌' : '✅'}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#1a1714', marginBottom: 12 }}>{success}</h2>
        <p style={{ fontSize: 13, color: '#9a9088' }}>You can close this window now.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: PARCHMENT, position: 'absolute', top: 0, left: 0, fontFamily: 'DM Mono, monospace' }}>
      <nav style={{ background: BLACK, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 600, color: GOLD, letterSpacing: 2 }}>SignVault</span>
        <span style={{ fontSize: 11, color: '#6b6460', letterSpacing: 1 }}>DOCUMENT SIGNING</span>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#1a1714', marginBottom: 8 }}>Review & Sign</h1>
        <p style={{ fontSize: 12, color: '#9a9088', marginBottom: 40 }}>Please review the document below and sign or reject it.</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '12px 16px', fontSize: 12, color: '#dc2626', marginBottom: 24 }}>
            ⚠ {error}
          </div>
        )}

        {/* PDF Viewer */}
        <div style={{ background: 'white', border: '1px solid #e8e2d8', borderRadius: 10, padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>📄</span>
            <div>
              <p style={{ fontSize: 14, color: '#1a1714', fontWeight: 500 }}>{document?.original_name}</p>
              <a href={document?.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: GOLD, textDecoration: 'none' }}>Open PDF in new tab →</a>
            </div>
          </div>
          <iframe
            src={document?.file_url}
            style={{ width: '100%', height: 500, border: '1px solid #e8e2d8', borderRadius: 6 }}
            title="Document Preview"
          />
        </div>

        {/* Signer Info */}
        {!rejecting ? (
          <div style={{ background: 'white', border: '1px solid #e8e2d8', borderRadius: 10, padding: 32, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#1a1714', marginBottom: 24 }}>Your Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#6b6460', display: 'block', marginBottom: 8 }}>Full Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.5px solid #ccc4b8', padding: '10px 0', fontSize: 14, fontFamily: 'inherit', color: '#1a1714', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#6b6460', display: 'block', marginBottom: 8 }}>Email Address</label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.5px solid #ccc4b8', padding: '10px 0', fontSize: 14, fontFamily: 'inherit', color: '#1a1714', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                onClick={handleSign}
                disabled={submitting}
                style={{ flex: 1, background: BLACK, color: GOLD, border: 'none', padding: 16, fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4 }}
              >
                {submitting ? 'Signing...' : '✓ Sign Document'}
              </button>
              <button
                onClick={() => setRejecting(true)}
                style={{ flex: 1, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: 16, fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4 }}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 32, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#1a1714', marginBottom: 16 }}>Reason for Rejection</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are rejecting this document..."
              rows={4}
              style={{ width: '100%', background: '#fafafa', border: '1px solid #e8e2d8', borderRadius: 6, padding: 12, fontSize: 13, fontFamily: 'inherit', color: '#1a1714', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={handleReject}
                disabled={submitting}
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: 16, fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4 }}
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setRejecting(false)}
                style={{ flex: 1, background: 'transparent', color: '#6b6460', border: '1px solid #e8e2d8', padding: 16, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}