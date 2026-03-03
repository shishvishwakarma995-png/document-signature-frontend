import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Grotesk:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp 0.6s ease both; }
        .fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.6s ease 0.2s both; }
        .fade-up-3 { animation: fadeUp 0.6s ease 0.3s both; }
        .input-field { transition: all 0.2s; }
        .input-field:focus { outline: none; border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .btn-main { transition: all 0.3s; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); }
        .btn-main:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(59,130,246,0.4); background: #3B82F6 !important; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', display: 'flex', background: '#0C0C14' }}>

        {/* LEFT PANEL */}
        <div className="hidden lg:flex" style={{ width: '50%', flexDirection: 'column', justifyContent: 'space-between', padding: 64, background: '#111120', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '50%', right: -40, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.08)', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', right: 20, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.06)', transform: 'translateY(-50%)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }} />
            <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 4, background: '#2563EB', marginBottom: 32 }} />
            <h2 className="font-playfair" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.0, marginBottom: 20 }}>
              Welcome<br />
              <em style={{ color: '#60A5FA' }}>back.</em>
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.8, maxWidth: 280 }}>
              Sign in to access your documents, manage signers, and track every signature in real-time.
            </p>
            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[{ n: '99.9%', l: 'Uptime' }, { n: '256-bit', l: 'Encrypted' }, { n: '< 2min', l: 'Sign Time' }].map((s, i) => (
                <div key={i}>
                  <div className="font-playfair" style={{ fontSize: 22, fontWeight: 700, color: '#60A5FA', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: '#475569', letterSpacing: 3, textTransform: 'uppercase', marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, borderLeft: '2px solid rgba(59,130,246,0.3)', paddingLeft: 16 }}>
            <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 1.7 }}>
              "The most professional document signing experience we've used."
            </p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>— Priya Sharma, HR Manager</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />
              <span className="font-playfair" style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
            </div>

            <div className="fade-up">
              <h1 className="font-playfair" style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 8 }}>Sign In</h1>
              <p style={{ fontSize: 14, color: '#475569', marginBottom: 36 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>Create one →</Link>
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 24 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="fade-up-1">
                <label htmlFor="email" style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: 'white', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box' }}
                />
              </div>

              <div className="fade-up-2">
                <label htmlFor="password" style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                    style={{ width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: 'white', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#475569' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="fade-up-3">
                <button type="submit" disabled={loading} className="btn-main"
                  style={{ width: '100%', padding: '14px', background: '#2563EB', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, letterSpacing: 1, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </div>
            </form>

            {/* Fixed — visible text */}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 32 }}>
              🔒 Protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </>
  );
}