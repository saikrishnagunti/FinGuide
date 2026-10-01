import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdvisorProvider } from './context/AdvisorContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AdvisorDrawer from './components/AdvisorDrawer';
import SessionInactivityHandler from './components/SessionInactivityHandler';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IEForm from './pages/IEForm';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import History from './pages/History';
import Advisor from './pages/Advisor';
import Guest from './pages/Guest';
import Settings from './pages/Settings';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/ie-form': 'Income & Expenses',
  '/upload': 'Upload Statement',
  '/analysis': 'Financial Audit',
  '/budget': 'Budget Planner',
  '/goals': 'Financial Goals',
  '/history': 'History',
  '/advisor': 'Ask Advisor',
  '/settings': 'Settings & Account',
};

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FinGuide';

  return (
    <div className="app-layout">
      <SessionInactivityHandler />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar title={title} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="main-content">
        <div key={location.pathname} className="page-transition-wrapper">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ie-form" element={<IEForm />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/history" element={<History />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      {/* Persistent floating FAB and slide-over advisor drawer */}
      <AdvisorDrawer />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading FinGuide...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/guest" element={<Guest />} />

      {/* Protected routes (wrapped in layout) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdvisorProvider>
            <AppRoutes />
          </AdvisorProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
