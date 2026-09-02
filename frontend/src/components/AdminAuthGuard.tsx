import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAdminProfile, isAuthenticated, clearAuthToken } from '../services/adminApi';
import { Loader2 } from 'lucide-react';
import type { AdminUser } from '../types';

interface AdminAuthGuardProps {
  children: (user: AdminUser) => React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const location = useLocation();

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getAdminProfile();
      setUser(profile);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Verifying admin session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children(user)}</>;
};
