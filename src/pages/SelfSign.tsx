import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import api from '../services/api';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import toast from 'react-hot-toast';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const SIGNATURE_STYLES = [
  { id: 'style1', font: 'Dancing Script, cursive', label: 'Elegant' },
  { id: 'style2', font: 'Pacifico, cursive', label: 'Bold' },
  { id: 'style3', font: 'Satisfy, cursive', label: 'Classic' },
  { id: 'style4', font: 'Great Vibes, cursive', label: 'Formal' },
];

function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces: any[] = [];
    const colors = ['#3B82F6', '#34D399', '#FCD34D', '#F87171', '#A78BFA', '#60A5FA'];
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speed: Math.random() * 3 + 2,
        rotSpeed: Math.random() * 4 - 2,
      });
    }
    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.speed;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.y = -10;
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    const timeout = setTimeout(() => cancelAnimationFrame(frame), 4000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }} />;
}

async function generateSignedPdfBlob(docUrl: string, signerName: string, fontFamily: string, signatureFields: any[], stampBase64?: string): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '48px ' + fontFamily;
  ctx.fillStyle = '#1a1714';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(signerName, canvas.width / 2, canvas.height / 2);
  const signatureDataUrl = canvas.toDataURL('image/png');
  const signatureBytes = await fetch(signatureDataUrl).then(r => r.arrayBuffer());
  const pdfResponse = await fetch(docUrl);
  const pdfBytes = await pdfResponse.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const signatureImage = await pdfDoc.embedPng(signatureBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  let stampImage = null;
  if (stampBase64) {
    try {
      const stampBytes = await fetch(stampBase64).then(r => r.arrayBuffer());
      stampImage = stampBase64.includes('image/png') ? await pdfDoc.embedPng(stampBytes) : await pdfDoc.embedJpg(stampBytes);
    } catch (e) { console.error('Stamp embed failed:', e); }
  }
  if (signatureFields && signatureFields.length > 0) {
    for (const field of signatureFields) {
      const pageIndex = (field.page || 1) - 1;
      const page = pages[Math.min(pageIndex, pages.length - 1)];
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const scaleX = pageWidth / 700;
      const scaleY = pageHeight / (700 * (pageHeight / pageWidth));
      const scaledX = field.x * scaleX, scaledY = field.y * scaleY;
      const scaledW = field.width * scaleX, scaledH = field.height * scaleY;
      const pdfY = pageHeight - scaledY - scaledH;
      if (field.type === 'signature' || !field.type) {
        page.drawRectangle({ x: scaledX-4, y: pdfY-4, width: scaledW+8, height: scaledH+20, color: rgb(1,1,1), borderColor: rgb(0.788,0.659,0.298), borderWidth: 1.5 });
        page.drawText('SIGNATURE', { x: scaledX, y: pdfY+scaledH+4, size: 7, font: helvetica, color: rgb(0.6,0.5,0.18) });
        page.drawImage(signatureImage, { x: scaledX, y: pdfY, width: scaledW, height: scaledH });
      }
      if (field.type === 'date') {
        page.drawRectangle({ x: scaledX-4, y: pdfY-4, width: scaledW+8, height: scaledH+20, color: rgb(1,1,1), borderColor: rgb(0.788,0.659,0.298), borderWidth: 1.5 });
        page.drawText('DATE SIGNED', { x: scaledX, y: pdfY+scaledH+4, size: 7, font: helvetica, color: rgb(0.6,0.5,0.18) });
        page.drawText(today, { x: scaledX+4, y: pdfY+scaledH/2-6, size: 12, font: helveticaBold, color: rgb(0.1,0.09,0.08) });
      }
      if (field.type === 'stamp') {
        if (stampImage) {
          page.drawImage(stampImage, { x: scaledX, y: pdfY, width: scaledW, height: scaledH });
        } else {
          const cx = scaledX+scaledW/2, cy = pdfY+scaledH/2;
          page.drawCircle({ x: cx, y: cy, size: 38, borderColor: rgb(0.1,0.5,0.3), borderWidth: 2, color: rgb(0.95,1,0.97) });
          page.drawText('DIGITALLY', { x: cx-20, y: cy+12, size: 8, font: helveticaBold, color: rgb(0.1,0.5,0.3) });
          page.drawText('VERIFIED', { x: cx-17, y: cy+2, size: 8, font: helveticaBold, color: rgb(0.1,0.5,0.3) });
          page.drawText(today, { x: cx-18, y: cy-10, size: 7, font: helvetica, color: rgb(0.1,0.5,0.3) });
        }
      }
    }
  } else {
    const lastPage = pages[pages.length-1];
    const { width, height } = lastPage.getSize();
    const sigX = width-220-20, sigY = 50;
    lastPage.drawRectangle({ x: sigX-8, y: sigY-8, width: 236, height: 86, color: rgb(1,1,1), borderColor: rgb(0.788,0.659,0.298), borderWidth: 1.5 });
    lastPage.drawText('SIGNATURE', { x: sigX, y: sigY+72, size: 7, font: helvetica, color: rgb(0.6,0.5,0.18) });
    lastPage.drawImage(signatureImage, { x: sigX, y: sigY, width: 200, height: 70 });
  }
  return pdfDoc.save();
}

export default function SelfSign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [previewNumPages, setPreviewNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewPage, setPreviewPage] = useState(1);
  const [step, setStep] = useState<'review' | 'sign' | 'preview' | 'done'>('review');
  const [signerName, setSignerName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('style1');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState('');
  const [signedPdfBytes, setSignedPdfBytes] = useState<Uint8Array | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    api.get('/api/docs/' + id).then(res => {
      setDoc(res.data.document); setLoading(false);
    }).catch(() => { setError('Document not found.'); setLoading(false); });
  }, [id]);

  const handlePreview = async () => {
    if (!signerName.trim()) { toast.error('Please enter your name!'); return; }
    setProcessing(true); setError('');
    const currentStyle = SIGNATURE_STYLES.find(s => s.id === selectedStyle);
    try {
      const sigRes = await api.get('/api/signatures/' + id);
      const fields = (sigRes.data.signatures || []).filter((f: any) => f.x > 0 && f.y > 0);
      let stampBase64 = localStorage.getItem(`stamp_${id}`) || undefined;
      if (!stampBase64 && doc?.stamp_data) stampBase64 = doc.stamp_data;
      const pdfBytes = await generateSignedPdfBlob(doc.file_url, signerName, currentStyle?.font || 'cursive', fields, stampBase64);
      setSignedPdfBytes(pdfBytes);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPreviewBlobUrl(URL.createObjectURL(blob));
      setStep('preview');
      toast.success('Preview ready!');
    } catch (err) { console.error(err); toast.error('Failed to generate preview.'); }
    finally { setProcessing(false); }
  };

  const handleDownload = async () => {
    if (!signedPdfBytes) return;
    setProcessing(true);
    try {
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'signed_' + doc.original_name; a.click();
      URL.revokeObjectURL(url);
      await api.post('/api/signatures', { documentId: id, fields: [{ x: 0, y: 0, page: 1, width: 200, height: 70, type: 'done' }] });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setStep('done');
    } catch { toast.error('Download failed.'); }
    finally { setProcessing(false); }
  };

  const currentStyle = SIGNATURE_STYLES.find(s => s.id === selectedStyle);
  const pdfW = window.innerWidth < 600 ? window.innerWidth - 80 : 660;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748B', fontSize: 13 }}>Loading document...</p>
      </div>
    </div>
  );

  if (step === 'done') return (
    <>
      {showConfetti && <ConfettiEffect />}
      <div style={{ minHeight: '100vh', background: '#0C0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>✅</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: 'white', marginBottom: 12 }}>Document Signed!</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>Your signed PDF has been downloaded successfully.</p>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: '#2563EB', color: 'white', border: 'none', padding: '14px 36px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 1, cursor: 'pointer', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
            Back to Dashboard →
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Grotesk:wght@300;400;500;600&family=Dancing+Script:wght@600&family=Pacifico&family=Satisfy&family=Great+Vibes&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp 0.5s ease both; }
        .style-card { transition: all 0.2s; cursor: pointer; }
        .style-card:hover { border-color: rgba(59,130,246,0.4) !important; }
        .name-input:focus { outline: none; border-bottom-color: #3B82F6 !important; }
        .btn-back { transition: all 0.2s; }
        .btn-back:hover { border-color: rgba(59,130,246,0.3) !important; color: #60A5FA !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0C0C14', fontFamily: "'Space Grotesk', sans-serif", color: 'white' }}>
        <nav style={{ background: 'rgba(5,15,36,0.95)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }} />
            <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(-1)} className="btn-back"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 18px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Back
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-back"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 18px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Dashboard
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
          <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
            {['Review', 'Sign', 'Preview'].map((s, i) => {
              const isActive = (step === 'review' && i === 0) || (step === 'sign' && i === 1) || (step === 'preview' && i === 2);
              const isDone = (i === 0 && (step === 'sign' || step === 'preview')) || (i === 1 && step === 'preview');
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, background: isDone ? 'rgba(16,185,129,0.2)' : isActive ? '#2563EB' : 'rgba(255,255,255,0.04)', color: isDone ? '#34D399' : isActive ? 'white' : '#64748B', border: isDone ? '1px solid rgba(16,185,129,0.3)' : isActive ? '1px solid #2563EB' : '1px solid rgba(255,255,255,0.06)' }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: isActive ? '#60A5FA' : isDone ? '#34D399' : '#64748B' }}>{s}</span>
                  {i < 2 && <span style={{ color: '#64748B', margin: '0 4px', fontSize: 14 }}>→</span>}
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20 }}>
              ⚠ {error}
            </div>
          )}

          {step === 'review' && (
            <div className="fade-in">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 1, background: '#2563EB' }} />
                  <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#3B82F6' }}>Step 1</span>
                </div>
                <h1 className="font-playfair" style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 6 }}>Review Document</h1>
                <p style={{ fontSize: 13, color: '#64748B' }}>Review the document before signing.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', background: '#f8f8f8', borderRadius: 4, padding: 16 }}>
                  <Document file={doc?.file_url} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<p style={{ padding: 40, color: '#64748B', fontSize: 13 }}>Loading PDF...</p>}>
                    <Page pageNumber={currentPage} width={pdfW} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </div>
                {numPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                    {Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${currentPage === p ? '#2563EB' : 'rgba(255,255,255,0.08)'}`, background: currentPage === p ? '#2563EB' : 'transparent', color: currentPage === p ? 'white' : '#475569', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>{p}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={async () => {
                  const sigRes = await api.get('/api/signatures/' + id);
                  const fields = (sigRes.data.signatures || []).filter((f: any) => f.x > 0 && f.y > 0);
                  const hasSignatureField = fields.some((f: any) => f.type === 'signature' || f.type === 'date' || !f.type);
                  if (!hasSignatureField && fields.length > 0) {
                    setProcessing(true);
                    let stampBase64 = localStorage.getItem(`stamp_${id}`) || undefined;
                    if (!stampBase64 && doc?.stamp_data) stampBase64 = doc.stamp_data;
                    const pdfBytes = await generateSignedPdfBlob(doc.file_url, 'Stamp', 'Arial', fields, stampBase64);
                    setSignedPdfBytes(pdfBytes);
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    setPreviewBlobUrl(URL.createObjectURL(blob));
                    setProcessing(false);
                    setStep('preview');
                  } else {
                    setStep('sign');
                  }
                }}
                  style={{ background: '#2563EB', color: 'white', border: 'none', padding: '14px 40px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 1, cursor: 'pointer', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                  Proceed to Sign →
                </button>
              </div>
            </div>
          )}

          {step === 'sign' && (
            <div className="fade-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 1, background: '#2563EB' }} />
                  <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#3B82F6' }}>Step 2</span>
                </div>
                <h1 className="font-playfair" style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 6 }}>Create Your Signature</h1>
                <p style={{ fontSize: 13, color: '#64748B' }}>Type your name and choose a style.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: 28, marginBottom: 16 }}>
                <label style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', display: 'block', marginBottom: 12 }}>Your Full Name</label>
                <input type="text" value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Type your full name..."
                  className="name-input"
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '10px 0', fontSize: 20, fontFamily: "'Space Grotesk', sans-serif", color: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: 28, marginBottom: 16 }}>
                <label style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', display: 'block', marginBottom: 16 }}>Choose Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SIGNATURE_STYLES.map(style => (
                    <div key={style.id} onClick={() => setSelectedStyle(style.id)} className="style-card"
                      style={{ border: `1px solid ${selectedStyle === style.id ? '#3B82F6' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: '16px 20px', background: selectedStyle === style.id ? 'rgba(59,130,246,0.06)' : 'transparent' }}>
                      <p style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{style.label}</p>
                      <p style={{ fontFamily: style.font, fontSize: 28, color: 'white', margin: 0 }}>{signerName || 'Your Name'}</p>
                    </div>
                  ))}
                </div>
              </div>
              {signerName && (
                <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, padding: 24, marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#3B82F6', marginBottom: 12 }}>Signature Preview</p>
                  <p style={{ fontFamily: currentStyle?.font, fontSize: 40, color: 'white', margin: 0 }}>{signerName}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setStep('review')} className="btn-back"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', padding: '12px 24px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
                  ← Back
                </button>
                <button onClick={handlePreview} disabled={processing || !signerName.trim()}
                  style={{ background: signerName.trim() ? '#2563EB' : 'rgba(255,255,255,0.04)', color: signerName.trim() ? 'white' : '#64748B', border: 'none', padding: '12px 36px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 1, cursor: signerName.trim() ? 'pointer' : 'not-allowed', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', opacity: processing ? 0.7 : 1 }}>
                  {processing ? 'Generating...' : 'Preview Signed PDF →'}
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="fade-in">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 1, background: '#2563EB' }} />
                  <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#3B82F6' }}>Step 3</span>
                </div>
                <h1 className="font-playfair" style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 6 }}>Preview Signed Document</h1>
                <p style={{ fontSize: 13, color: '#64748B' }}>Looks good? Download it — or go back to edit.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', background: '#f8f8f8', borderRadius: 4, padding: 16 }}>
                  <Document file={previewBlobUrl} onLoadSuccess={({ numPages }) => setPreviewNumPages(numPages)} loading={<p style={{ padding: 40, color: '#64748B' }}>Loading preview...</p>}>
                    <Page pageNumber={previewPage} width={pdfW} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </div>
                {previewNumPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                    {Array.from({ length: previewNumPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPreviewPage(p)}
                        style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${previewPage === p ? '#2563EB' : 'rgba(255,255,255,0.08)'}`, background: previewPage === p ? '#2563EB' : 'transparent', color: previewPage === p ? 'white' : '#475569', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>{p}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setStep('sign'); setPreviewBlobUrl(''); }} className="btn-back"
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', padding: '12px 20px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
                    ← Edit Signature
                  </button>
                  <button onClick={() => navigate(`/editor/${id}`)} className="btn-back"
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', padding: '12px 20px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
                    ✏️ Edit Fields
                  </button>
                </div>
                <button onClick={handleDownload} disabled={processing}
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)', padding: '14px 36px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 3, opacity: processing ? 0.7 : 1 }}>
                  {processing ? 'Downloading...' : '✓ Looks Good — Download!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}