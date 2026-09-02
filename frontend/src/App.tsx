import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ApplyPage } from './pages/ApplyPage';
import { DirectJobApplyPage } from './pages/DirectJobApplyPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAuthGuard } from './components/AdminAuthGuard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Candidate Public Application Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/jobs/:job_id/apply" element={<DirectJobApplyPage />} />

        {/* Admin Authentication & Management Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              {(user) => <AdminDashboardPage user={user} />}
            </AdminAuthGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
