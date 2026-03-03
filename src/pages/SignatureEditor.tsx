import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface Field {
  id: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
  type: 'signature' | 'stamp' | 'date';
}

function DraggableField({ field, onRemove, stampPreview }: { field: Field; onRemove: (id: string) => void; stampPreview?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: field.id });

  const getLabel = () => {
    if (field.type === 'stamp') return '🔵 Stamp';
    if (field.type === 'date') return '📅 Date Signed';
    return '✍️ Sign Here';
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        left: field.x, top: field.y,
        width: field.width, height: field.height,
        transform: CSS.Translate.toString(transform),
        border: '2px dashed #3B82F6',
        background: isDragging ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.1)',
        borderRadius: 4,
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: isDragging ? 9999 : 10,
        userSelect: 'none', touchAction: 'none',
        overflow: 'hidden',
      }}
    >
      {field.type === 'stamp' && stampPreview ? (
        <img src={stampPreview} alt="stamp" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
      ) : (
        <span style={{ fontSize: 11, color: '#60A5FA', pointerEvents: 'none', userSelect: 'none', fontWeight: 600, letterSpacing: 1 }}>
          {getLabel()}
        </span>
      )}
      <div
        onPointerDown={e => { e.stopPropagation(); onRemove(field.id); }}
        style={{ position: 'absolute', top: -10, right: -10, width: 22, height: 22, background: '#ef4444', borderRadius: '50%', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, fontWeight: 700 }}>
        ×
      </div>
    </div>
  );
}

export default function SignatureEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<Field[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [stampPreview, setStampPreview] = useState<string>('');
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }));

  useEffect(() => {
    api.get(`/api/docs/${id}`).then(res => {
      setDoc(res.data.document);
      setLoading(false);
    }).catch(() => { setError('Document not found.'); setLoading(false); });
    const saved = localStorage.getItem(`stamp_${id}`);
    if (saved) setStampPreview(saved);
  }, [id]);

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file!'); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        const compressCanvas = document.createElement('canvas');
        const maxSize = 300;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        compressCanvas.width = img.width * ratio;
        compressCanvas.height = img.height * ratio;
        const compressCtx = compressCanvas.getContext('2d')!;
        compressCtx.drawImage(img, 0, 0, compressCanvas.width, compressCanvas.height);
        const compressed = compressCanvas.toDataURL('image/png', 0.8);
        setStampPreview(compressed);
        localStorage.setItem(`stamp_${id}`, compressed);
        try {
          await api.post(`/api/docs/${id}/stamp`, { stampData: compressed });
          setError('');
        } catch (e: any) {
          setError('Stamp upload failed! Try a smaller image.');
        }
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const addField = (type: 'signature' | 'stamp' | 'date') => {
    if (type === 'stamp' && !stampPreview) { stampInputRef.current?.click(); return; }
    setFields(prev => [...prev, {
      id: Date.now().toString(),
      x: 100, y: 150,
      page: currentPage,
      width: type === 'stamp' ? 100 : 180,
      height: type === 'stamp' ? 100 : 55,
      type,
    }]);
  };

  const removeField = (fieldId: string) => setFields(prev => prev.filter(f => f.id !== fieldId));

  const handleDragEnd = (event: any) => {
    const { active, delta } = event;
    if (!pdfContainerRef.current) return;
    const containerW = pdfContainerRef.current.offsetWidth;
    const containerH = pdfContainerRef.current.offsetHeight;
    setFields(prev => prev.map(f => {
      if (f.id !== active.id) return f;
      return { ...f, x: Math.max(0, Math.min(f.x + delta.x, containerW - f.width)), y: Math.max(0, Math.min(f.y + delta.y, containerH - f.height)) };
    }));
  };

  const handleSave = async () => {
    if (fields.length === 0) { setError('Please add at least one field!'); return; }
    setSaving(true);
    try {
      await api.post('/api/signatures', {
        documentId: id,
        fields: fields.map(f => ({ x: f.x, y: f.y, page: f.page, width: f.width, height: f.height, type: f.type })),
      });
      if (stampPreview) await api.post(`/api/docs/${id}/stamp`, { stampData: stampPreview });
      setSaved(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748B', fontSize: 13 }}>Loading editor...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Grotesk:wght@400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sidebar-btn { transition: all 0.2s; cursor: pointer; border-radius: 4px; padding: 12px; text-align: left; width: 100%; display: block; font-family: 'Space Grotesk', sans-serif; }
        .sidebar-btn:hover { border-color: rgba(59,130,246,0.4) !important; background: rgba(59,130,246,0.06) !important; }
        .page-btn { transition: all 0.2s; cursor: pointer; border-radius: 3px; padding: 7px 12px; width: 100%; font-family: 'Space Grotesk', sans-serif; font-size: 11px; margin-bottom: 6px; }
        .field-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 3px; margin-bottom: 6px; }
        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { border-color: rgba(59,130,246,0.3) !important; color: #60A5FA !important; }
        .save-btn { transition: all 0.3s; clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%); }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.4); }
      `}</style>

      <div style={{ minHeight: '100vh', width: '100%', background: '#0C0C14', fontFamily: "'Space Grotesk', sans-serif", position: 'absolute', top: 0, left: 0 }}>

        {/* NAV */}
        <nav style={{ background: 'rgba(5,15,36,0.98)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }} />
              <span className="font-playfair" style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
            </div>
            <span style={{ color: '#64748B', fontSize: 14 }}>—</span>
            <span style={{ fontSize: 11, color: '#64748B', letterSpacing: 2, textTransform: 'uppercase' }}>Editor</span>
            {doc?.original_name && (
              <>
                <span style={{ color: '#64748B', fontSize: 14 }}>·</span>
                <span style={{ fontSize: 12, color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.original_name}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate(-1)} className="nav-btn"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 16px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Back
            </button>
            <button onClick={() => navigate('/dashboard')} className="nav-btn"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '8px 16px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              ← Dashboard
            </button>
            <button onClick={handleSave} disabled={saving || saved} className="save-btn"
              style={{ background: saved ? 'rgba(16,185,129,0.2)' : '#2563EB', color: saved ? '#34D399' : 'white', border: saved ? '1px solid rgba(16,185,129,0.3)' : 'none', padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: saving || saved ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'Space Grotesk', sans-serif" }}>
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save & Share'}
            </button>
          </div>
        </nav>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '10px 32px', fontSize: 12 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

          {/* SIDEBAR */}
          <div style={{ width: 220, background: 'rgba(5,15,36,0.8)', borderRight: '1px solid rgba(255,255,255,0.04)', padding: 16, overflowY: 'auto', flexShrink: 0 }}>

            {/* Add Fields */}
            <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>Add Fields</p>

            <button onClick={() => addField('signature')} className="sidebar-btn"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px dashed rgba(59,130,246,0.2)', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 3 }}>✍️ Sign Here</p>
              <p style={{ fontSize: 11, color: '#64748B' }}>Signature field</p>
            </button>

            <button onClick={() => addField('date')} className="sidebar-btn"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px dashed rgba(59,130,246,0.2)', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 3 }}>📅 Date</p>
              <p style={{ fontSize: 11, color: '#64748B' }}>Date signed</p>
            </button>

            {/* Stamp */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 4 }}>
              <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>Company Stamp</p>
              <input ref={stampInputRef} type="file" accept="image/*" onChange={handleStampUpload} style={{ display: 'none' }} />

              {stampPreview ? (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                    <img src={stampPreview} alt="stamp" style={{ width: '100%', height: 72, objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => addField('stamp')}
                      style={{ flex: 1, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', borderRadius: 3, padding: '7px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                      + Add to PDF
                    </button>
                    <button onClick={() => stampInputRef.current?.click()}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', borderRadius: 3, padding: '7px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => stampInputRef.current?.click()} className="sidebar-btn"
                  style={{ background: 'rgba(59,130,246,0.04)', border: '1px dashed rgba(59,130,246,0.15)', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 3 }}>🔵 Upload Stamp</p>
                  <p style={{ fontSize: 11, color: '#64748B' }}>PNG, JPG supported</p>
                </button>
              )}
            </div>

            {/* Pages */}
            {numPages > 1 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 8 }}>
                <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>Pages</p>
                {Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className="page-btn"
                    style={{ background: currentPage === p ? '#2563EB' : 'rgba(255,255,255,0.03)', color: currentPage === p ? 'white' : '#475569', border: currentPage === p ? '1px solid #2563EB' : '1px solid rgba(255,255,255,0.06)' }}>
                    Page {p}
                  </button>
                ))}
              </div>
            )}

            {/* Fields list */}
            {fields.filter(f => f.page === currentPage).length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 8 }}>
                <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>
                  Fields ({fields.filter(f => f.page === currentPage).length})
                </p>
                {fields.filter(f => f.page === currentPage).map((f, i) => (
                  <div key={f.id} className="field-item" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
                    <span style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>{f.type} {i + 1}</span>
                    <button onClick={() => removeField(f.id)} style={{ background: 'none', border: 'none', color: '#F87171', fontSize: 16, cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 8 }}>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.8 }}>
                💡 Drag fields to exact position on the PDF.
              </p>
            </div>
          </div>

          {/* PDF AREA */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 32, background: '#0A1628' }}>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div ref={pdfContainerRef} style={{ position: 'relative', display: 'inline-block', userSelect: 'none', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', borderRadius: 4, overflow: 'hidden' }}>
                <Document
                  file={doc?.file_url}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div style={{ width: 700, height: 900, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: '#94A3B8', fontSize: 13 }}>Loading PDF...</p>
                    </div>
                  }
                >
                  <Page pageNumber={currentPage} width={700} renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>
                {fields.filter(f => f.page === currentPage).map(field => (
                  <DraggableField key={field.id} field={field} onRemove={removeField} stampPreview={field.type === 'stamp' ? stampPreview : undefined} />
                ))}
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </>
  );
}