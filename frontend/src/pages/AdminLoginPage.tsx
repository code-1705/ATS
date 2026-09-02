import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { loginAdmin } from '../services/adminApi';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginAdmin(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[var(--text-main)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Careers Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-3">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary, #da7756)',
              boxShadow: '0 4px 14px rgba(218, 119, 86, 0.3)',
            }}
            className="flex items-center justify-center text-white mx-auto"
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Sign in to manage jobs, candidate pipeline, and autonomous AI evaluations.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] py-8 px-6 sm:px-10 rounded-2xl shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-[var(--danger-bg)] border border-rose-200 text-[var(--danger)] text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@enter.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition"
                />
                <Mail className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition"
                />
                <Lock className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--primary, #da7756)',
                  boxShadow: '0 2px 10px rgba(218, 119, 86, 0.25)',
                }}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold text-sm hover:opacity-95 focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

