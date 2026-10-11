import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import QuizAttemptPage from './pages/QuizAttemptPage';
import QuizResultPage from './pages/QuizResultPage';
import WeakTopicsPage from './pages/WeakTopicsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import QuizHistoryPage from './pages/QuizHistoryPage';
import SettingsPage from './pages/SettingsPage';
import RevisionPlannerPage from './pages/RevisionPlannerPage';
import ImprovementReportPage from './pages/ImprovementReportPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center">
        <LoadingSpinner message="Verifying session credentials..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center">
        <LoadingSpinner message="Loading..." size="md" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
          </Route>

          {/* Protected Dashboard & Quiz Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/generate" element={<QuizGeneratorPage />} />
            <Route path="/quiz/:id" element={<QuizAttemptPage />} />
            <Route path="/results/:attemptId" element={<QuizResultPage />} />
            <Route path="/weak-topics" element={<WeakTopicsPage />} />
            <Route path="/planner" element={<RevisionPlannerPage />} />
            <Route path="/improvement" element={<ImprovementReportPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/history" element={<QuizHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
