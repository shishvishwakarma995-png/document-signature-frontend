import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function SignersStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [signers, setSigners] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, signed: 0, rejected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, signersRes] = await Promise.all([
          api.get(`/api/docs/${id}`),
          api.get(`/api/signers/${id}`),
        ]);
        setDoc(docRes.data.document);
        setSigners(signersRes.data.signers || []);
        setStats({
          total: signersRes.data.total || 0,
          signed: signersRes.data.signed || 0,
          rejected: signersRes.data.rejected || 0,
          pending: signersRes.data.pending || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const progress = stats.total > 0 ? Math.round((stats.signed / stats.total) * 100) : 0;

  const getStatusBadge = (status: string) => {
    if (status === "signed") return { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' };
    if (status === "rejected") return { bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' };
    return { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' };
  };

  const getAvatarStyle = (status: string) => {
    if (status === "signed") return { background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' };
    if (status === "rejected") return { background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' };
    return { background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' };
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748B', fontSize: 13 }}>Loading...</p>
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
        .signer-row { transition: all 0.2s; }
        .signer-row:hover { background: rgba(59,130,246,0.03) !important; }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { border-color: rgba(59,130,246,0.2) !important; transform: translateY(-2px); }
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
            <button onClick={() => navigate("/dashboard")} className="nav-btn"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 18px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Dashboard
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

          {/* Header */}
          <div className="fade-in" style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 1, background: '#2563EB' }} />
              <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#3B82F6' }}>Signing Status</span>
            </div>
            <h1 className="font-playfair" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: 'white', marginBottom: 6 }}>
              Document <em style={{ color: '#60A5FA' }}>Tracker</em>
            </h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>{doc?.original_name}</p>
          </div>

          {/* Stats Grid */}
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total', value: stats.total, color: '#60A5FA', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
              { label: 'Signed', value: stats.signed, color: '#34D399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
              { label: 'Pending', value: stats.pending, color: '#FCD34D', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
              { label: 'Rejected', value: stats.rejected, color: '#F87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
            ].map((s, i) => (
              <div key={i} className="stat-card"
                style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '24px 16px', textAlign: 'center' }}>
                <p className="font-playfair" style={{ fontSize: 40, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.value}</p>
                <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {stats.total > 0 && (
            <div className="fade-in" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Signing Progress</span>
                <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>{progress}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, #2563EB, #34D399)', height: '100%', borderRadius: 100, width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
                {stats.signed} of {stats.total} people have signed
                {stats.signed === stats.total && stats.total > 0 && <span style={{ color: '#34D399', marginLeft: 8 }}>✓ All signed!</span>}
              </p>
            </div>
          )}

          {/* Signers List */}
          <div className="fade-in" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="font-playfair" style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Signers</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 2s infinite' }} />
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
                Auto-refreshes every 10s
              </div>
            </div>

            {signers.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📭</div>
                <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>No signers invited yet.</p>
                <button onClick={() => navigate("/dashboard")}
                  style={{ background: '#2563EB', color: 'white', border: 'none', padding: '10px 24px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif", clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
                  Go to Dashboard
                </button>
              </div>
            ) : (
              signers.map((signer, i) => {
                const badge = getStatusBadge(signer.status);
                const avatar = getAvatarStyle(signer.status);
                return (
                  <div key={signer.id} className="signer-row"
                    style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < signers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, ...avatar }}>
                        {signer.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, color: 'white', fontWeight: 500, marginBottom: 3 }}>{signer.name || 'Not signed yet'}</p>
                        <p style={{ fontSize: 12, color: '#64748B' }}>{signer.email}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {signer.signed_at && (
                        <span style={{ fontSize: 12, color: '#64748B' }}>
                          {new Date(signer.signed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {signer.rejection_reason && (
                        <span style={{ fontSize: 11, color: '#F87171', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {signer.rejection_reason}
                        </span>
                      )}
                      <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, fontWeight: 600, ...badge }}>
                        {signer.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}