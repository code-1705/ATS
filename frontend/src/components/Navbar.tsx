import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

interface NavbarProps {
  activeJobsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeJobsCount }) => {
  return (
    <header className="bg-white border-b border-[var(--border-color)] sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group no-underline">
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary, #da7756)',
              boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
            }}
            className="flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0"
          >
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-[var(--text-main)]">
                Careers Hub
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-card-hover, #faf9f6)',
                  borderColor: 'var(--border-color, #e6e4dc)',
                  color: 'var(--primary, #da7756)',
                }}
                className="text-xs px-2.5 py-0.5 rounded-full font-bold border"
              >
                Placement
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] hidden sm:block">
              Talent & Placement Network
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {activeJobsCount !== undefined && activeJobsCount > 0 && (
            <div className="hidden sm:flex items-center text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-card-hover)] border border-[var(--border-color)] px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              {activeJobsCount} Partner Roles
            </div>
          )}

          <Link
            to="/#roles"
            style={{
              borderColor: 'var(--border-color, #e6e4dc)',
              backgroundColor: 'var(--bg-card-hover, #faf9f6)',
              color: 'var(--text-main, #24221f)',
            }}
            className="inline-flex items-center text-xs font-semibold hover:text-[var(--primary)] px-3.5 py-2 rounded-xl border transition no-underline shadow-xs"
          >
            Explore All Roles →
          </Link>
        </div>
      </div>
    </header>
  );
};
