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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tabs */}
          <div className="flex items-center space-x-6">
            <Link to="/admin" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-400 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white">EnterRecruit</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">Admin</span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden sm:flex items-center space-x-1 pl-4 border-l border-slate-800">
              <button
                onClick={() => onTabChange('candidates')}
                className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'candidates'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                <span>Candidate Pipeline</span>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'candidates' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {candidateCount}
                </span>
              </button>

              <button
                onClick={() => onTabChange('jobs')}
                className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                <span>Job Management</span>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'jobs' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {jobCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/apply"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Open Public Application Page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Public Careers Page
            </Link>

            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name || 'Admin'}</span>
                <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-800/60 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden items-center justify-around py-2.5 border-t border-slate-800 text-xs">
          <button
            onClick={() => onTabChange('candidates')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'candidates' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Candidates ({candidateCount})
          </button>
          <button
            onClick={() => onTabChange('jobs')}
            className={`flex items-center px-3 py-1.5 rounded-lg font-medium ${
              activeTab === 'jobs' ? 'bg-indigo-600 text-white' : 'text-slate-400'
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
