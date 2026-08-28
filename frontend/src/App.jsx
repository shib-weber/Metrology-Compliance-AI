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

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/rules" element={<GovRulesPage />} />
            <Route path="/twins" element={<DigitalTwinsPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/citizen" element={
              <ProtectedRoute><CitizenDashboard /></ProtectedRoute>
            } />
            <Route path="/inspector" element={
              <ProtectedRoute requiredRole="inspector"><InspectorDashboard /></ProtectedRoute>
            } />
            <Route path="/reports/:reportId" element={
              <ProtectedRoute requiredRole="inspector"><ReportDetails /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}