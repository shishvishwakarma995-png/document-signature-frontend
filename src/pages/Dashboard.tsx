import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Doc {
  id: string;
  original_name: string;
  status: string;
  created_at: string;
  file_url: string;
}

function MultipleEmailInvite({ docId, onSuccess, onClose }: { docId: string; onSuccess: () => void; onClose: () => void }) {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    const emailList = emails.split(",").map(e => e.trim()).filter(e => e.includes("@"));
    if (!emailList.length) { setError("Please enter valid email addresses."); return; }
    setSending(true); setError("");
    try {
      await api.post(`/api/signers/${docId}/invite`, { emails: emailList });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send invitations.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        .invite-textarea:focus { outline: none; border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      `}</style>
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#475569', marginBottom: 12 }}>Send for Signing</p>
        {error && <p style={{ fontSize: 12, color: '#F87171', marginBottom: 8 }}>⚠ {error}</p>}
        <textarea
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder="alice@gmail.com, bob@gmail.com"
          rows={2}
          className="invite-textarea"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: 'white', fontFamily: "'Space Grotesk', sans-serif", resize: 'none', marginBottom: 8, boxSizing: 'border-box' }}
        />
        <p style={{ fontSize: 11, color: '#64748B', marginBottom: 12 }}>Each person receives a unique signing link.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSend} disabled={sending}
            style={{ background: '#2563EB', color: 'white', border: 'none', padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif", clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
            {sending ? "Sending..." : "Send Invitations"}
          </button>
          <button onClick={onClose}
            style={{ background: 'transparent', color: '#475569', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sharingDocId, setSharingDocId] = useState("");
  const [filter, setFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/api/docs");
      setDocuments(res.data.documents);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Only PDF files allowed!"); return; }
    setUploading(true); setError(""); setSuccess("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/api/docs/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Document uploaded successfully!");
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/api/docs/${docId}`);
      setSuccess("Document deleted!");
      fetchDocuments();
    } catch {
      setError("Failed to delete document.");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "signed") return { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' };
    if (status === "pending") return { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' };
    if (status === "rejected") return { bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' };
    return { bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.2)' };
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const filteredDocs = filter === "all" ? documents : documents.filter(d => d.status === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Grotesk:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .doc-card { transition: all 0.2s; }
        .doc-card:hover { border-color: rgba(59,130,246,0.25) !important; background: rgba(59,130,246,0.02) !important; }
        .action-btn { transition: all 0.2s; cursor: pointer; font-family: 'Space Grotesk', sans-serif; border-radius: 3px; font-size: 11px; font-weight: 500; padding: 7px 12px; border: none; }
        .action-btn:hover { transform: translateY(-1px); }
        .upload-zone { transition: all 0.3s; cursor: pointer; }
        .upload-zone:hover { border-color: rgba(59,130,246,0.5) !important; background: rgba(59,130,246,0.04) !important; }
        .filter-btn { transition: all 0.2s; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 11px; border-radius: 3px; padding: 6px 16px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', background: '#0C0C14', color: 'white' }}>

        {/* NAV */}
        <nav style={{ background: 'rgba(5,15,36,0.95)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }} />
            <span className="font-playfair" style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 3, textTransform: 'uppercase' }}>SignVault</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>Welcome, <span style={{ color: '#60A5FA' }}>{user?.name}</span></span>
            <button onClick={logout}
              style={{ border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6', background: 'transparent', padding: '7px 18px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
              Logout
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

          {/* Header */}
          <div className="fade-in" style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 1, background: '#2563EB' }} />
              <span style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#3B82F6' }}>Dashboard</span>
            </div>
            <h1 className="font-playfair" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 8 }}>
              My <em style={{ color: '#60A5FA' }}>Documents</em>
            </h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Upload, manage and send documents for signing</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="fade-in" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20 }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div className="fade-in" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34D399', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginBottom: 20 }}>
              ✓ {success}
            </div>
          )}

          {/* Upload Zone */}
          <div className="upload-zone fade-in"
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed rgba(59,130,246,0.2)', borderRadius: 8, padding: '48px 24px', textAlign: 'center', background: 'rgba(59,130,246,0.02)', marginBottom: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h2 className="font-playfair" style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>Upload a Document</h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>PDF files only — max 10MB</p>
            <button disabled={uploading}
              style={{ background: '#2563EB', color: 'white', border: 'none', padding: '12px 32px', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, fontFamily: "'Space Grotesk', sans-serif", clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
              {uploading ? "Uploading..." : "+ Upload PDF"}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B', marginRight: 8 }}>Filter:</span>
            {["all", "pending", "signed", "rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="filter-btn"
                style={{
                  background: filter === f ? '#2563EB' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? 'white' : '#475569',
                  border: filter === f ? '1px solid #2563EB' : '1px solid rgba(255,255,255,0.08)',
                  textTransform: 'capitalize',
                }}>
                {f === "all" ? `All (${documents.length})` : `${f} (${documents.filter(d => d.status === f).length})`}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#64748B', marginBottom: 16 }}>
            {filteredDocs.length} Document{filteredDocs.length !== 1 ? "s" : ""}
          </p>

          {/* Documents List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ width: 40, height: 40, border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 13, color: '#64748B' }}>Loading documents...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8 }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📁</div>
              <p className="font-playfair" style={{ fontSize: 24, color: '#64748B', marginBottom: 8 }}>No {filter !== "all" ? filter : ""} documents</p>
              <p style={{ fontSize: 13, color: '#64748B' }}>Upload your first PDF to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredDocs.map((doc, idx) => {
                const badge = getStatusBadge(doc.status);
                return (
                  <div key={doc.id} className="doc-card fade-in"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '20px 24px', animationDelay: `${idx * 0.05}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>

                      {/* Left — Doc info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#60A5FA', flexShrink: 0 }}>PDF</div>
                        <div>
                          <p style={{ fontSize: 14, color: 'white', fontWeight: 500, marginBottom: 4 }}>{doc.original_name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <p style={{ fontSize: 11, color: '#64748B' }}>{formatDate(doc.created_at)}</p>
                            <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: badge.bg, color: badge.color, border: badge.border }}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right — Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                          className="action-btn"
                          style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
                          View
                        </a>
                        <button onClick={() => navigate(`/self-sign/${doc.id}`)} className="action-btn"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
                          Sign Now
                        </button>
                        <button onClick={() => navigate(`/editor/${doc.id}`)} className="action-btn"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                          Edit Fields
                        </button>
                        <button onClick={() => setSharingDocId(sharingDocId === doc.id ? "" : doc.id)} className="action-btn"
                          style={{ background: '#2563EB', color: 'white', border: '1px solid #2563EB' }}>
                          Send for Signing
                        </button>
                        <button onClick={() => navigate(`/status/${doc.id}`)} className="action-btn"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
                          Status
                        </button>
                        <button onClick={() => navigate(`/audit/${doc.id}`)} className="action-btn"
                          style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B', border: '1px solid rgba(255,255,255,0.06)' }}>
                          Audit
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="action-btn"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {sharingDocId === doc.id && (
                      <MultipleEmailInvite
                        docId={doc.id}
                        onSuccess={() => { setSuccess("Invitations sent!"); setSharingDocId(""); fetchDocuments(); }}
                        onClose={() => setSharingDocId("")}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}