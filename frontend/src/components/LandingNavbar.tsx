import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

interface LandingNavbarProps {
  activeJobsCount?: number;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = () => {
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

        {/* 2. Header Action (Right) */}
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
        </div>
      </div>
    </header>
  );
};
