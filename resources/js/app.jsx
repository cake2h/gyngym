import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import RegisterStep1 from './pages/RegisterStep1';
import RegisterStep2 from './pages/RegisterStep2';
import Profile from './pages/Profile';
import Measurements from './pages/Measurements';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Templates from './pages/Templates';

function ProtectedRoute({ children, allowIncomplete }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-pulse text-slate-500">Загрузка...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!allowIncomplete && !user.name) return <Navigate to="/register/step2" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.name) return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterStep1 /></GuestRoute>} />
            <Route path="/register/step2" element={<ProtectedRoute allowIncomplete><RegisterStep2 /></ProtectedRoute>} />

            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/measurements" element={<ProtectedRoute><Layout><Measurements /></Layout></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Layout><Notes /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Layout><Templates /></Layout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
