import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Public pages
import { HomePage } from './pages/HomePage';
import { PlansPage } from './pages/PlansPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Client pages
import { ClientLayout } from './pages/client/ClientLayout';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { WalletPage } from './pages/client/WalletPage';
import { ExchangePage } from './pages/client/ExchangePage';
import { ClientPlansPage } from './pages/client/ClientPlansPage';
import { HistoryPage } from './pages/client/HistoryPage';
import { ProfilePage } from './pages/client/ProfilePage';

// Admin pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Route protection component
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/client" replace />;
  }
  
  return <>{children}</>;
}

// Public route component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/client'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      } />
      <Route path="/plans" element={
        <PublicRoute>
          <PlansPage />
        </PublicRoute>
      } />
      <Route path="/auth/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/auth/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      
      {/* Client routes */}
      <Route path="/client" element={
        <ProtectedRoute>
          <ClientLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ClientDashboard />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="exchange" element={<ExchangePage />} />
        <Route path="plans" element={<ClientPlansPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<div className="p-8 text-center text-slate-600 dark:text-slate-400">Users management coming soon...</div>} />
        <Route path="transactions" element={<div className="p-8 text-center text-slate-600 dark:text-slate-400">Transaction management coming soon...</div>} />
        <Route path="plans" element={<div className="p-8 text-center text-slate-600 dark:text-slate-400">Plans management coming soon...</div>} />
        <Route path="wallets" element={<div className="p-8 text-center text-slate-600 dark:text-slate-400">Wallet management coming soon...</div>} />
        <Route path="rates" element={<div className="p-8 text-center text-slate-600 dark:text-slate-400">Rates management coming soon...</div>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Page not found</p>
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Return to homepage
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
            <AppRoutes />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;