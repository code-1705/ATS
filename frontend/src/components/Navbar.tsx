import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeJobsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeJobsCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">EnterRecruit</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Careers</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Candidate Application Portal</p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {activeJobsCount !== undefined && activeJobsCount > 0 && (
            <div className="hidden sm:flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              {activeJobsCount} Open Positions
            </div>
          )}

          <Link
            to="/admin/login"
            className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3.5 py-2 rounded-lg border border-slate-200 transition"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
};
