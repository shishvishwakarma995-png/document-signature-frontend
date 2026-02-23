import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const GOLD = '#C9A84C';
const BLACK = '#0A0A0B';
const PARCHMENT = '#f5f0e8';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Mono', monospace; background: ${PARCHMENT}; }
        .sv-root { display: flex; min-height: 100vh; }
        .sv-left { width: 52%; background: ${BLACK}; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        @media (max-width: 900px) { .sv-left { display: none; } }
        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,168,76,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.07) 1px, transparent 1px); background-size: 48px 48px; }
        .sv-input { width: 100%; background: transparent; border: none; border-bottom: 1.5px solid #ccc4b8; padding: 10px 0; font-size: 14px; font-family: 'DM Mono', monospace; color: #1a1714; outline: none; transition: border-color 0.2s; }
        .sv-input::placeholder { color: #bbb4a8; }
        .sv-input:focus { border-bottom-color: ${GOLD}; }
        .sv-input.err { border-bottom-color: #e53e3e; }
        .sv-btn { width: 100%; background: ${BLACK}; color: ${GOLD}; border: none; padding: 16px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; border-radius: 4px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .sv-btn:hover:not(:disabled) { background: #1a1714; transform: translateY(-1px); }
        .sv-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .sv-link { color: ${GOLD}; text-decoration: none; }
        .sv-link:hover { opacity: 0.75; }
        .doc-card { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.12); border-radius: 8px; padding: 14px 18px; margin-bottom: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(201,168,76,0.25); border-top-color: ${GOLD}; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.45s ease both; }
      `}</style>

      <div className="sv-root">
        <div className="sv-left">
          <div className="grid-bg" />
          <div style={{ position: 'relative', zIndex: 1, padding: '48px 52px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <rect x="2" y="2" width="32" height="32" rx="4" stroke={GOLD} strokeWidth="1.5"/>
                <path d="M10 18h16M10 12h10M10 24h12" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: GOLD, letterSpacing: 2 }}>SignVault</span>
            </div>
            <div style={{ marginTop: 'auto', marginBottom: 48 }}>
              <p style={{ fontSize: 11, color: GOLD, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20, opacity: 0.75 }}>Trusted by 10,000+ enterprises</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, color: '#f0ece4', lineHeight: 1.15, marginBottom: 20 }}>Documents signed<br/>with confidence</h2>
              <p style={{ fontSize: 13, color: '#6b6460', lineHeight: 1.8 }}>End-to-end encrypted signing with full audit trails and legally traceable records.</p>
            </div>
            <div style={{ marginBottom: 64 }}>
              {[
                { icon: '📄', name: 'NDA_Agreement.pdf', status: '✓ Signed', color: '#10b981' },
                { icon: '📋', name: 'Contract_Q1.pdf', status: '⏳ Pending', color: GOLD },
                { icon: '📑', name: 'Offer_Letter.pdf', status: '✓ Signed', color: '#10b981' },
              ].map(doc => (
                <div key={doc.name} className="doc-card">
                  <span style={{ fontSize: 18 }}>{doc.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, color: '#c8c4bc', marginBottom: 4 }}>{doc.name}</div>
                    <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: doc.color }}>{doc.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: PARCHMENT, padding: '48px 32px' }}>
          <div className="slide-up" style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 600, color: '#1a1714', letterSpacing: -1, marginBottom: 8 }}>Welcome back</h1>
              <p style={{ fontSize: 12, color: '#9a9088' }}>Sign in to your SignVault account</p>
            </div>

            {serverError && (
              <div style={{ background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: 6, padding: '12px 16px', fontSize: 12, color: '#c0392b', marginBottom: 24 }}>
                ⚠ {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 28 }} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#6b6460' }}>Email address</label>
                <input {...register('email')} type="email" placeholder="you@company.com" className={`sv-input ${errors.email ? 'err' : ''}`} />
                {errors.email && <span style={{ fontSize: 11, color: '#e53e3e' }}>{errors.email.message}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#6b6460' }}>Password</label>
                  <a href="#" className="sv-link" style={{ fontSize: 11 }}>Forgot?</a>
                </div>
                <input {...register('password')} type="password" placeholder="••••••••" className={`sv-input ${errors.password ? 'err' : ''}`} />
                {errors.password && <span style={{ fontSize: 11, color: '#e53e3e' }}>{errors.password.message}</span>}
              </div>

              <button type="submit" disabled={loading} className="sv-btn">
                {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9a9088', marginTop: 28 }}>
              Don't have an account? <Link to="/register" className="sv-link" style={{ fontWeight: 500 }}>Create one free</Link>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 36, fontSize: 10, color: '#bbb4a8', flexWrap: 'wrap' }}>
              <span>🔒 256-bit encrypted</span><span>·</span>
              <span>📋 Full audit trail</span><span>·</span>
              <span>⚖️ Legally binding</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}