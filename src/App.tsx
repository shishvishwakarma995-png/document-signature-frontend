import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
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
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}