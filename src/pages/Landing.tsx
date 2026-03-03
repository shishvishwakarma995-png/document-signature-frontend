import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
      setMouseY((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-space { font-family: 'Space Grotesk', sans-serif; }

        :root {
          --navy: #0C0C14;
          --navy-2: #111120;
          --navy-3: #081630;
          --blue: #2563EB;
          --blue-bright: #3B82F6;
          --silver: #CBD5E1;
          --silver-dim: #64748B;
          --white: #F8FAFC;
          --accent: #38BDF8;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes scroll-line {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        @keyframes counter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .cursor-dot {
          width: 6px; height: 6px;
          background: var(--blue-bright);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.1s;
        }

        .hero-title-1 { animation: fadeUp 1s ease 0.2s both; }
        .hero-title-2 { animation: fadeUp 1s ease 0.35s both; }
        .hero-sub { animation: fadeUp 1s ease 0.5s both; }
        .hero-btns { animation: fadeUp 1s ease 0.65s both; }
        .hero-meta { animation: fadeUp 1s ease 0.8s both; }

        .nav-link {
          position: relative;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--silver-dim);
          transition: color 0.3s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 1px;
          background: var(--blue-bright);
          transition: width 0.3s;
        }
        .nav-link:hover { color: var(--white); }
        .nav-link:hover::after { width: 100%; }

        .btn-primary {
          background: var(--blue);
          color: white;
          border: none;
          padding: 14px 32px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .btn-primary:hover { background: var(--blue-bright); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(59,130,246,0.5); }
        .btn-primary:hover::before { transform: translateX(100%); }

        .btn-outline {
          background: transparent;
          color: var(--silver);
          border: 1px solid rgba(148,163,184,0.2);
          padding: 14px 32px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .btn-outline:hover { border-color: var(--blue-bright); color: var(--blue-bright); }

        /* Feature cards */
        .feat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 36px;
          position: relative;
          transition: all 0.4s;
          overflow: hidden;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(59,130,246,0.08) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .feat-card:hover { border-color: rgba(59,130,246,0.3); transform: translateY(-4px); }
        .feat-card:hover::before { opacity: 1; }
        .feat-number {
          font-family: 'Playfair Display', serif;
          font-size: 64px;
          font-weight: 900;
          color: rgba(59,130,246,0.08);
          position: absolute;
          top: 16px; right: 24px;
          line-height: 1;
          transition: color 0.4s;
        }
        .feat-card:hover .feat-number { color: rgba(59,130,246,0.15); }

        /* Timeline steps */
        .step-line {
          width: 2px;
          height: 80px;
          background: linear-gradient(to bottom, var(--blue), transparent);
          margin: 0 auto;
        }

        /* Shimmer text */
        .shimmer-text {
          background: linear-gradient(90deg, var(--silver) 0%, white 30%, var(--accent) 50%, white 70%, var(--silver) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* Testimonial */
        .testi-card {
          border: 1px solid rgba(255,255,255,0.06);
          padding: 32px;
          background: rgba(255,255,255,0.02);
          position: relative;
          transition: all 0.3s;
        }
        .testi-card:hover { border-color: rgba(59,130,246,0.25); background: rgba(59,130,246,0.03); }
        .testi-accent {
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 0;
          background: var(--blue);
          transition: height 0.4s;
        }
        .testi-card:hover .testi-accent { height: 100%; }

        /* Scroll indicator */
        .scroll-line {
          width: 1px; height: 60px;
          background: var(--blue);
          animation: scroll-line 2s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .hero-huge { font-size: clamp(48px, 10vw, 72px) !important; }
        }
      `}</style>

      {/* Cursor dot */}
      <div className="cursor-dot" style={{ left: `${mouseX}vw`, top: `${mouseY}vh` }} />

      <div style={{ background: 'var(--navy)', color: 'var(--white)', fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh' }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 60px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(2,8,24,0.92)',
          backdropFilter: 'blur(24px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', boxShadow: '0 0 12px var(--blue)' }} />
            <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, color: 'var(--white)', textTransform: 'uppercase' }}>SignVault</span>
          </div>

          <div className="hide-mobile" style={{ display: 'flex', gap: 40 }}>
            {[{ label: 'Features', id: 'features' }, { label: 'Process', id: 'process' }, { label: 'Security', id: 'security' }].map(item => (
              <a key={item.id} href={`#${item.id}`} className="nav-link">{item.label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-outline" onClick={() => navigate('/login')} style={{ padding: '10px 24px', fontSize: 12 }}>Sign In</button>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '10px 24px', fontSize: 12 }}>Get Started</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '120px 60px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Dynamic glow follows mouse */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 60% 60% at ${mouseX}% ${mouseY}%, rgba(37,99,235,0.12) 0%, transparent 70%)`,
            transition: 'background 0.3s ease',
            pointerEvents: 'none',
          }} />

          {/* Corner decorations */}
          <div style={{ position: 'absolute', top: 100, right: 60, width: 320, height: 320, border: '1px solid rgba(59,130,246,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 120, right: 80, width: 280, height: 280, border: '1px solid rgba(59,130,246,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 80, left: -60, width: 240, height: 240, border: '1px solid rgba(59,130,246,0.06)', borderRadius: '50%' }} />

          {/* Year label */}
          <div style={{ position: 'absolute', top: 140, right: 60 }} className="hide-mobile">
            <span style={{ fontSize: 10, letterSpacing: 4, color: 'var(--silver-dim)', textTransform: 'uppercase' }}>Est. 2026</span>
          </div>

          <div style={{ maxWidth: 900, position: 'relative', zIndex: 2 }}>
            {/* Small tag */}
            <div className="hero-title-1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 32, height: 1, background: 'var(--blue)' }} />
              <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blue-bright)' }}>Document Signing Platform</span>
            </div>

            {/* Giant title */}
            <div className="hero-title-2">
              <h1 className="font-playfair" style={{ fontSize: 'clamp(64px, 10vw, 120px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: -2, color: 'var(--white)', marginBottom: 4 }}>
                Sign with
              </h1>
              <h1 className="font-playfair shimmer-text" style={{ fontSize: 'clamp(64px, 10vw, 120px)', fontWeight: 900, fontStyle: 'italic', lineHeight: 0.95, letterSpacing: -2, marginBottom: 24 }}>
                Authority.
              </h1>
            </div>

            <p className="hero-sub" style={{ fontSize: 16, color: 'var(--silver-dim)', lineHeight: 1.8, maxWidth: 520, marginBottom: 48 }}>
              A professional document signing platform for teams that demand precision, security, and elegance. Upload, sign, send — in under 2 minutes.
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize: 14, padding: '16px 40px' }}>
                Start Free →
              </button>
              <button className="btn-outline" onClick={() => navigate('/login')} style={{ fontSize: 14, padding: '16px 40px' }}>
                Sign In
              </button>
              <span style={{ fontSize: 12, color: 'var(--silver-dim)', marginLeft: 8 }}>No credit card required</span>
            </div>

            {/* Meta info */}
            <div className="hero-meta" style={{ display: 'flex', gap: 40, marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
              {[
                { num: '99.9%', label: 'Uptime' },
                { num: '256-bit', label: 'Encrypted' },
                { num: '< 2min', label: 'Avg. Sign Time' },
                { num: '∞', label: 'Documents' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-playfair" style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue-bright)', lineHeight: 1 }}>{stat.num}</div>
                  <div style={{ fontSize: 11, color: 'var(--silver-dim)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, letterSpacing: 3, color: 'var(--silver-dim)', textTransform: 'uppercase' }}>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: '120px 60px', position: 'relative' }}>
          {/* Section number */}
          <div className="font-playfair hide-mobile" style={{ position: 'absolute', top: 100, right: 60, fontSize: 160, fontWeight: 900, color: 'rgba(59,130,246,0.03)', lineHeight: 1, pointerEvents: 'none' }}>01</div>

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 80, flexWrap: 'wrap', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 1, background: 'var(--blue)' }} />
                  <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blue-bright)' }}>Capabilities</span>
                </div>
                <h2 className="font-playfair" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--white)' }}>
                  Everything your team<br /><em style={{ color: 'var(--accent)' }}>needs to sign</em>
                </h2>
              </div>
              <p style={{ fontSize: 14, color: 'var(--silver-dim)', lineHeight: 1.8, maxWidth: 360 }}>
                Built for legal teams, HR departments, and enterprises that handle contracts at scale.
              </p>
            </div>

            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {[
                { icon: '✍️', title: 'Digital Signatures', desc: 'Legally-binding signatures with 4 premium font styles. Your identity, beautifully rendered.', n: '01' },
                { icon: '🎯', title: 'Drag & Drop Editor', desc: 'Precision field placement on any PDF. Signature, date, and stamp fields — exactly where you want.', n: '02' },
                { icon: '📧', title: 'Multi-Signer Flow', desc: 'Send to unlimited signers simultaneously. Each gets a unique, secure signing link.', n: '03' },
                { icon: '🔒', title: 'Audit Trail', desc: 'Court-admissible audit logs. Timestamps, IPs, and signer metadata for every action.', n: '04' },
                { icon: '🏢', title: 'Company Stamp', desc: 'Upload your official stamp once. Applied automatically to every signed document.', n: '05' },
                { icon: '👁️', title: 'Preview Mode', desc: 'See exactly how the final document looks before anyone signs. Zero surprises.', n: '06' },
              ].map((f, i) => (
                <div key={i} className="feat-card">
                  <div className="feat-number">{f.n}</div>
                  <div style={{ fontSize: 28, marginBottom: 20 }}>{f.icon}</div>
                  <div className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--silver-dim)', lineHeight: 1.8 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="process" style={{ padding: '120px 60px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'var(--navy-2)', position: 'relative' }}>
          <div className="font-playfair hide-mobile" style={{ position: 'absolute', top: 100, right: 60, fontSize: 160, fontWeight: 900, color: 'rgba(59,130,246,0.03)', lineHeight: 1, pointerEvents: 'none' }}>02</div>

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, background: 'var(--blue)' }} />
                <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blue-bright)' }}>How It Works</span>
              </div>
              <h2 className="font-playfair" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--white)' }}>
                From upload to signed<br /><em style={{ color: 'var(--accent)' }}>in three steps</em>
              </h2>
            </div>

            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 60, position: 'relative' }}>
              {/* connecting line */}
              <div className="hide-mobile" style={{ position: 'absolute', top: 24, left: '18%', right: '18%', height: 1, background: 'linear-gradient(90deg, var(--blue), rgba(59,130,246,0.1))' }} />

              {[
                { num: '01', title: 'Upload Your PDF', desc: 'Drag and drop any PDF. Our system encrypts and stores it securely in Supabase cloud storage.' },
                { num: '02', title: 'Place Fields', desc: 'Use the visual editor to drag signature, date, and company stamp fields anywhere on the document.' },
                { num: '03', title: 'Sign & Deliver', desc: 'Sign instantly or send signing links to multiple recipients. Download with full audit trail.' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{
                    width: 48, height: 48,
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 28,
                    background: 'var(--navy-2)',
                    position: 'relative', zIndex: 1,
                    transition: 'all 0.3s',
                  }}>
                    <span className="font-playfair" style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue-bright)' }}>{s.num}</span>
                    {/* Pulse ring */}
                    <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1px solid var(--blue)', opacity: 0.3 }} />
                  </div>
                  <h3 className="font-playfair" style={{ fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--silver-dim)', lineHeight: 1.8 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECURITY / TRUST ── */}
        <section id="security" style={{ padding: '120px 60px', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
          <div className="font-playfair hide-mobile" style={{ position: 'absolute', top: 100, right: 60, fontSize: 160, fontWeight: 900, color: 'rgba(59,130,246,0.03)', lineHeight: 1, pointerEvents: 'none' }}>03</div>

          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="grid-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, background: 'var(--blue)' }} />
                <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blue-bright)' }}>Trust & Security</span>
              </div>
              <h2 className="font-playfair" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--white)', marginBottom: 24 }}>
                Enterprise-grade<br /><em style={{ color: 'var(--accent)' }}>security by default</em>
              </h2>
              <p style={{ fontSize: 14, color: 'var(--silver-dim)', lineHeight: 1.8, marginBottom: 40 }}>
                Every action is logged, every document is encrypted, and every signing link is unique and tokenized.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: '🔐', text: 'JWT Authentication + Protected Routes' },
                  { icon: '☁️', text: 'Supabase Encrypted Cloud Storage' },
                  { icon: '📋', text: 'Immutable Audit Trail with IP Logging' },
                  { icon: '🔗', text: 'One-time Tokenized Signing Links' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--silver)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote card */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -20, left: -20, width: '100%', height: '100%', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 8 }} />
              <div style={{ border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: 48, background: 'rgba(37,99,235,0.04)', position: 'relative' }}>
                <div style={{ width: 48, height: 4, background: 'var(--blue)', marginBottom: 32 }} />
                <p className="font-playfair" style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--silver)', lineHeight: 1.7, marginBottom: 36 }}>
                  "SignVault transformed how our legal team handles contracts. The audit trail alone saves us 10+ hours per week on compliance reviews."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--blue), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display, serif',
                  }}>R</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>Rajesh Mehta</div>
                    <div style={{ fontSize: 12, color: 'var(--silver-dim)', marginTop: 3 }}>Legal Director, TechCorp India</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ padding: '120px 60px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'var(--navy-3)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, background: 'var(--blue)' }} />
                <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--blue-bright)' }}>Testimonials</span>
                <div style={{ width: 32, height: 1, background: 'var(--blue)' }} />
              </div>
              <h2 className="font-playfair" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: 'var(--white)' }}>
                Trusted by <em style={{ color: 'var(--accent)' }}>professionals</em>
              </h2>
            </div>

            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { q: 'The cleanest document signing experience I have ever used. The drag-and-drop editor is incredibly intuitive and precise.', name: 'Priya Sharma', role: 'HR Manager, StartupHub', i: 'P' },
                { q: "Hundreds of contracts monthly — SignVault's multi-signer feature and audit logs are absolute game-changers for our team.", name: 'Amit Verma', role: 'COO, LegalEdge', i: 'A' },
                { q: 'Finally a platform that looks as professional as it works. Our clients are always impressed with the experience.', name: 'Neha Gupta', role: 'Founder, DesignStudio', i: 'N' },
              ].map((t, i) => (
                <div key={i} className="testi-card" style={{ borderRadius: 4 }}>
                  <div className="testi-accent" />
                  <div className="font-playfair" style={{ fontSize: 52, color: 'rgba(59,130,246,0.3)', lineHeight: 0.8, marginBottom: 20 }}>"</div>
                  <p style={{ fontSize: 13, color: 'var(--silver-dim)', lineHeight: 1.9, fontStyle: 'italic', marginBottom: 28 }}>{t.q}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--blue), var(--accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'Playfair Display, serif',
                      flexShrink: 0,
                    }}>{t.i}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--silver-dim)', marginTop: 2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '160px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'var(--navy)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.06)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.06)' }} />

          <div style={{ position: 'relative' }}>
            <h2 className="font-playfair" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, lineHeight: 0.95, color: 'var(--white)', marginBottom: 8 }}>
              Ready to sign
            </h2>
            <h2 className="font-playfair shimmer-text" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, fontStyle: 'italic', lineHeight: 0.95, marginBottom: 40 }}>
              with authority?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--silver-dim)', marginBottom: 48, maxWidth: 440, margin: '0 auto 48px' }}>
              Join professionals who trust SignVault for their most important documents.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize: 15, padding: '18px 52px' }}>
                Create Free Account →
              </button>
              <button className="btn-outline" onClick={() => navigate('/login')} style={{ fontSize: 15, padding: '18px 52px' }}>
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--navy-2)', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, background: 'var(--blue)', borderRadius: '50%', boxShadow: '0 0 8px var(--blue)' }} />
            <span className="font-playfair" style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--silver-dim)' }}>© 2026 SignVault. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 32 }}>
            {[{ label: 'Features', id: 'features' }, { label: 'Process', id: 'process' }, { label: 'Security', id: 'security' }].map(item => (
              <a key={item.id} href={`#${item.id}`} style={{ fontSize: 12, color: 'var(--silver-dim)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#3B82F6')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--silver-dim)')}>
                {item.label}
              </a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}