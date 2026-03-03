import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AuditTrail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/docs/${id}`),
      api.get(`/api/audit/${id}`),
    ]).then(([docRes, auditRes]) => {
      setDoc(docRes.data.document);
      setLogs(auditRes.data.logs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const getActionStyle = (action: string) => {
    if (action === 'document_signed') return { label: 'Document Signed', bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)', dot: '#34D399' };
    if (action === 'document_rejected') return { label: 'Document Rejected', bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', dot: '#F87171' };
    if (action === 'document_uploaded') return { label: 'Document Uploaded', bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)', dot: '#FCD34D' };
    if (action === 'invite_sent') return { label: 'Invite Sent', bg: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', dot: '#60A5FA' };
    return { label: action, bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.2)', dot: '#475569' };
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748B', fontSize: 13 }}>Loading audit trail...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp 0.5s ease both; }
        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { border-color: rgba(59,130,246,0.3) !important; color: #60A5FA !important; }
        .log-card { transition: all 0.2s; }
        .log-card:hover { border-color: rgba(59,130,246,0.2) !important; background: rgba(59,130,246,0.02) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0C0C14', fontFamily: "'Space Grotesk', sans-serif", color: 'white' }}>

        {/* NAV */}
        <nav style={{ background: 'rgba(5,15,36,0.95)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }} />
            <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(-1)} className="nav-btn"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 18px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Back
            </button>
            <button onClick={() => navigate('/dashboard')} className="nav-btn"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 18px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Dashboard
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

          {/* Header */}
          <div className="fade-in" style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 1, background: '#2563EB' }} />
              <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#3B82F6' }}>Audit Trail</span>
            </div>
            <h1 className="font-playfair" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: 'white', marginBottom: 6 }}>
              Activity <em style={{ color: '#60A5FA' }}>Timeline</em>
            </h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>{doc?.original_name}</p>
          </div>

          {/* Summary chips */}
          {logs.length > 0 && (
            <div className="fade-in" style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#60A5FA' }}>
                {logs.length} Total Events
              </div>
              {['document_signed', 'document_rejected', 'invite_sent'].map(action => {
                const count = logs.filter(l => l.action === action).length;
                if (!count) return null;
                const s = getActionStyle(action);
                return (
                  <div key={action} style={{ background: s.bg, border: s.border, borderRadius: 100, padding: '6px 16px', fontSize: 12, color: s.color }}>
                    {count} {s.label}
                  </div>
                );
              })}
            </div>
          )}

          {logs.length === 0 ? (
            <div className="fade-in" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📋</div>
              <p className="font-playfair" style={{ fontSize: 22, color: '#64748B', marginBottom: 8 }}>No audit logs yet</p>
              <p style={{ fontSize: 13, color: '#64748B' }}>Logs will appear when actions are performed on this document.</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline vertical line */}
              <div style={{ position: 'absolute', left: 19, top: 8, bottom: 8, width: 1, background: 'linear-gradient(to bottom, #2563EB, rgba(37,99,235,0.1))' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {logs.map((log, i) => {
                  const s = getActionStyle(log.action);
                  return (
                    <div key={log.id || i} className="fade-in log-card"
                      style={{ position: 'relative', display: 'flex', gap: 24, paddingLeft: 52, animationDelay: `${i * 0.05}s` }}>

                      {/* Timeline dot */}
                      <div style={{ position: 'absolute', left: 12, top: 20, width: 16, height: 16, borderRadius: '50%', background: s.dot, boxShadow: `0 0 12px ${s.dot}40`, zIndex: 1, flexShrink: 0 }} />

                      {/* Card */}
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, fontWeight: 600, background: s.bg, color: s.color, border: s.border }}>
                            {s.label}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{formatDate(log.created_at)}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {log.metadata?.signerEmail && (
                            <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{log.metadata.signerEmail}</p>
                          )}
                          {log.metadata?.signerName && (
                            <p style={{ fontSize: 12, color: '#475569' }}>Signed by: <span style={{ color: '#94A3B8' }}>{log.metadata.signerName}</span></p>
                          )}
                          {log.metadata?.name && (
                            <p style={{ fontSize: 12, color: '#475569' }}>Name: <span style={{ color: '#94A3B8' }}>{log.metadata.name}</span></p>
                          )}
                          {log.ip_address && (
                            <p style={{ fontSize: 11, color: '#64748B' }}>
                              IP: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{log.ip_address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}