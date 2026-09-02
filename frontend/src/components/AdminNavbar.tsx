import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Briefcase, LogOut, ExternalLink } from 'lucide-react';
import { clearAuthToken } from '../services/adminApi';
import type { AdminUser } from '../types';

interface AdminNavbarProps {
  activeTab: 'candidates' | 'jobs';
  onTabChange: (tab: 'candidates' | 'jobs') => void;
  user?: AdminUser | null;
  candidateCount?: number;
  jobCount?: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  activeTab,
  onTabChange,
  user,
  candidateCount = 0,
  jobCount = 0
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthToken();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white border-b border-[var(--border-color)] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tabs */}
          <div className="flex items-center space-x-6">
            <Link to="/admin" className="flex items-center space-x-2.5 group no-underline">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  backgroundColor: 'var(--primary, #da7756)',
                  boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
                }}
                className="flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center">
                <span className="font-extrabold text-lg tracking-tight text-[var(--text-main)]">
                  ATS Workspace
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--bg-card-hover, #faf9f6)',
                    borderColor: 'var(--border-color, #e6e4dc)',
                    color: 'var(--primary, #da7756)',
                  }}
                  className="ml-2.5 text-xs px-2.5 py-0.5 rounded-full font-bold border"
                >
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden sm:flex items-center space-x-1.5 pl-4 border-l border-[var(--border-color)]">
              <button
                onClick={() => onTabChange('candidates')}
                style={
                  activeTab === 'candidates'
                    ? { backgroundColor: 'var(--primary, #da7756)', color: '#FFFFFF' }
                    : undefined
                }
                className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'candidates'
                    ? 'shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                <span>Candidate Pipeline</span>
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'candidates'
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  {candidateCount}
                </span>
              </button>

              <button
                onClick={() => onTabChange('jobs')}
                style={
                  activeTab === 'jobs'
                    ? { backgroundColor: 'var(--primary, #da7756)', color: '#FFFFFF' }
                    : undefined
                }
                className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                <span>Job Management</span>
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'jobs'
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  {jobCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card-hover)] hover:bg-[var(--border-color)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] transition no-underline"
              title="Open Public Careers Home in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
              Careers Home
            </Link>

            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-[var(--text-main)]">{user.name || 'Admin User'}</span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">{user.email}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden items-center justify-around py-2.5 border-t border-[var(--border-color)] text-xs">
          <button
            onClick={() => onTabChange('candidates')}
            style={
              activeTab === 'candidates'
                ? { backgroundColor: 'var(--primary, #da7756)', color: '#FFFFFF' }
                : undefined
            }
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'candidates' ? '' : 'text-[var(--text-muted)]'
            }`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Candidates ({candidateCount})
          </button>
          <button
            onClick={() => onTabChange('jobs')}
            style={
              activeTab === 'jobs'
                ? { backgroundColor: 'var(--primary, #da7756)', color: '#FFFFFF' }
                : undefined
            }
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'jobs' ? '' : 'text-[var(--text-muted)]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            Jobs ({jobCount})
          </button>
        </div>
      </div>
    </header>
  );
};
