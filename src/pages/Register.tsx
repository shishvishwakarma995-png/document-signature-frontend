import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import api from '../services/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      console.error(err.response?.data?.error || 'Registration failed.');
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
        .fade-up-4 { animation: fadeUp 0.6s ease 0.4s both; }
        .fade-up-5 { animation: fadeUp 0.6s ease 0.5s both; }
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

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }} />
            <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
          </div>

          {/* Center */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 48, height: 4, background: '#2563EB', marginBottom: 32 }} />
            <h2 className="font-playfair" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.0, marginBottom: 20 }}>
              Start signing<br />
              <em style={{ color: '#60A5FA' }}>today.</em>
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.8, maxWidth: 280, marginBottom: 40 }}>
              Join professionals who trust SignVault for secure, legally-binding document signing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Drag & drop signature placement', 'Multiple signers support', 'Full audit trail & compliance', 'Custom company stamp'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#60A5FA', flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, color: '#64748B', letterSpacing: 3, textTransform: 'uppercase' }}>Free to get started</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', overflowY: 'auto' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />
              <span className="font-playfair" style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
            </div>

            <div className="fade-up">
              <h1 className="font-playfair" style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 8 }}>Create Account</h1>
              <p style={{ fontSize: 14, color: '#475569', marginBottom: 36 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>Sign in →</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name */}
              <div className="fade-up-1">
                <label style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Full Name</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Your full name"
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: 'white', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box' }}
                />
                {errors.name && <p style={{ fontSize: 12, color: '#F87171', marginTop: 6 }}>⚠ {errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="fade-up-2">
                <label style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: 'white', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box' }}
                />
                {errors.email && <p style={{ fontSize: 12, color: '#F87171', marginTop: 6 }}>⚠ {errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="fade-up-3">
                <label style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: 'white', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#475569' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 12, color: '#F87171', marginTop: 6 }}>⚠ {errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="fade-up-4">
                <label style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: 'white', fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#475569' }}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ fontSize: 12, color: '#F87171', marginTop: 6 }}>⚠ {errors.confirmPassword.message}</p>}
              </div>

              {/* Submit */}
              <div className="fade-up-5" style={{ marginTop: 4 }}>
                <button type="submit" disabled={isSubmitting} className="btn-main"
                  style={{ width: '100%', padding: '14px', background: '#2563EB', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, letterSpacing: 1, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {isSubmitting ? 'Creating account...' : 'Create Account →'}
                </button>
              </div>
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#64748B', marginTop: 28 }}>
              🔒 Protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </>
  );
}