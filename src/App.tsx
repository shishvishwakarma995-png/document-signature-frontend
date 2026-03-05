import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SignPage from "./pages/SignPage";
import SignatureEditor from "./pages/SignatureEditor";
import SelfSign from "./pages/SelfSign";
import SignersStatus from './pages/SignersStatus';
import AuditTrail from './pages/AuditTrail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/editor/:id" element={<ProtectedRoute><SignatureEditor /></ProtectedRoute>} />
      <Route path="/self-sign/:id" element={<ProtectedRoute><SelfSign /></ProtectedRoute>} />
      <Route path="/status/:id" element={<ProtectedRoute><SignersStatus /></ProtectedRoute>} />
      <Route path="/audit/:id" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
      <Route path="/sign/:token" element={<SignPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E293B',
                color: '#F1F5F9',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: "'Space Grotesk', sans-serif",
              },
              success: {
                iconTheme: { primary: '#34D399', secondary: '#1E293B' },
                style: {
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  color: '#34D399',
                },
              },
              error: {
                iconTheme: { primary: '#F87171', secondary: '#1E293B' },
                style: {
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#F87171',
                },
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}