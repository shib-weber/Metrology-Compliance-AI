import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CitizenDashboard from './pages/CitizenDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import ReportDetails from './pages/ReportDetails';
import GovRulesPage from './pages/GovRulesPage';
import DigitalTwinsPage from './pages/DigitalTwinsPage';
import OverviewPage from './pages/OverviewPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // 1. Wait for AuthContext to resolve localStorage/token before redirecting
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-indigo-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Case-insensitive role verification
  if (
    requiredRole && 
    user.role?.toLowerCase() !== requiredRole.toLowerCase()
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen max-w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/rules" element={<GovRulesPage />} />
            <Route path="/twins" element={<DigitalTwinsPage />} />
            <Route path="/overview" element={<OverviewPage />} />

            {/* Protected Routes */}
            <Route 
              path="/citizen" 
              element={
                <ProtectedRoute>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inspector" 
              element={
                <ProtectedRoute requiredRole="inspector">
                  <InspectorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/:reportId" 
              element={
                <ProtectedRoute requiredRole="inspector">
                  <ReportDetails />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}