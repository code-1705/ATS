import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  activeJobsCount?: number;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ activeJobsCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(242, 240, 233, 0.92)',
        borderBottom: '1px solid var(--border-color, #e6e4dc)',
      }}
      className="px-4 sm:px-8 h-[68px] transition-all"
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        {/* 1. Brand Logo (Left) */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group no-underline">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              backgroundColor: 'var(--primary, #da7756)',
              boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
            }}
            className="flex items-center justify-center text-white group-hover:scale-105 transition-transform"
          >
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.22rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                color: 'var(--text-main, #24221f)',
                whiteSpace: 'nowrap',
              }}
            >
              Careers Hub
            </div>
            <div
              style={{
                fontSize: '0.64rem',
                color: 'var(--text-muted, #666560)',
                fontWeight: '600',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              Talent & Placement Network
            </div>
          </div>
        </Link>

        {/* 2. Navigation Links (Centered, Strictly Single Line) */}
        <nav className="hidden md:flex items-center justify-center gap-5 lg:gap-7 whitespace-nowrap">
          <a
            href="#roles"
            style={{ color: 'var(--text-muted, #666560)', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap' }}
            className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 no-underline whitespace-nowrap"
          >
            <span>Partner Roles</span>
            {activeJobsCount !== undefined && activeJobsCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  color: 'var(--primary, #da7756)',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {activeJobsCount}
              </span>
            )}
          </a>
          <a
            href="#process"
            style={{ color: 'var(--text-muted, #666560)', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap' }}
            className="hover:text-[var(--text-main)] transition-colors no-underline whitespace-nowrap"
          >
            How It Works
          </a>
          <a
            href="#evaluation-simulator"
            style={{ color: 'var(--text-muted, #666560)', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap' }}
            className="hover:text-[var(--text-main)] transition-colors no-underline whitespace-nowrap"
          >
            Evaluation Rubric
          </a>
          <a
            href="#culture"
            style={{ color: 'var(--text-muted, #666560)', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap' }}
            className="hover:text-[var(--text-main)] transition-colors no-underline whitespace-nowrap"
          >
            Why Choose Us
          </a>
          <a
            href="#faq"
            style={{ color: 'var(--text-muted, #666560)', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap' }}
            className="hover:text-[var(--text-main)] transition-colors no-underline whitespace-nowrap"
          >
            FAQ
          </a>
        </nav>

        {/* 3. Header Action (Right) */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <Link
            to="/apply"
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary, #da7756)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
            className="hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span>Apply Now</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-black/5 transition"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderBottom: '1px solid var(--border-color, #e6e4dc)',
          }}
          className="md:hidden px-6 py-5 space-y-4 shadow-lg"
        >
          <nav className="flex flex-col space-y-3">
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-[var(--primary)] flex items-center justify-between"
            >
              <span>Partner Roles</span>
              {activeJobsCount !== undefined && activeJobsCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {activeJobsCount}
                </span>
              )}
            </a>
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-[var(--primary)]"
            >
              How It Works
            </a>
            <a
              href="#evaluation-simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-[var(--primary)]"
            >
              Evaluation Rubric
            </a>
            <a
              href="#culture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-[var(--primary)]"
            >
              Why Choose Us
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-[var(--primary)]"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-200">
            <Link
              to="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--primary)] mb-2"
            >
              Submit Application
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
