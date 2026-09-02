import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from '../components/LandingNavbar';
import { getOpenJobs } from '../services/api';
import type { Job } from '../types';
import {
  MapPin,
  Briefcase,
  Building2,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ExternalLink,
  Loader2,
  Zap,
  ChevronDown,
  Sparkles,
  Compass,
  Users,
  Award,
} from 'lucide-react';
import { parseJobDescription } from '../utils/jobMetadata';

interface CandidatePreset {
  id: string;
  name: string;
  role: string;
  experience: string;
  matchScore: number;
  rubric: {
    systemDesign: number;
    codingDepth: number;
    leadership: number;
  };
  extractedSkills: string[];
  recommendation: string;
  stage: string;
  resumeSnippet: string;
}

const CANDIDATE_PRESETS: Record<string, CandidatePreset> = {
  architect: {
    id: 'architect',
    name: 'Sarah Chen',
    role: 'Senior AI Systems Architect',
    experience: '8+ years (ex-Stripe, Anthropic)',
    matchScore: 98,
    rubric: {
      systemDesign: 99,
      codingDepth: 96,
      leadership: 95,
    },
    extractedSkills: ['PyTorch', 'Distributed Training', 'FastAPI', 'PostgreSQL', 'vLLM', 'Docker'],
    recommendation: 'Exceeds role criteria by 18%. Autonomous recommendation: Fast-track to Technical Interview.',
    stage: 'TECHNICAL INTERVIEW',
    resumeSnippet:
      'Engineered distributed LLM inference clusters serving 40k QPS. Designed resilient data ingestion microservices with 99.99% uptime.',
  },
  fullstack: {
    id: 'fullstack',
    name: 'Marcus Vance',
    role: 'Staff Full-Stack Engineer',
    experience: '6 years (ex-Figma, Linear)',
    matchScore: 94,
    rubric: {
      systemDesign: 92,
      codingDepth: 97,
      leadership: 89,
    },
    extractedSkills: ['React 19', 'TypeScript', 'Node.js', 'Python', 'TailwindCSS', 'Redis'],
    recommendation: 'Strong candidate profile. High code quality signals detected across public open source commits.',
    stage: 'PORTFOLIO REVIEW',
    resumeSnippet:
      'Led frontend architecture migration to React 19 concurrent features. Optimized bundle sizes by 44% and introduced typed REST schema contracts.',
  },
  product: {
    id: 'product',
    name: 'Elena Rostova',
    role: 'Principal Product Manager',
    experience: '7 years (B2B SaaS Growth)',
    matchScore: 91,
    rubric: {
      systemDesign: 88,
      codingDepth: 85,
      leadership: 98,
    },
    extractedSkills: ['Product Strategy', 'Customer Discovery', 'SQL Analytics', 'Sprint Planning', 'PLG Growth'],
    recommendation: 'Exceptional cross-functional leadership profile. Strong product-led growth pedigree.',
    stage: 'HR SCREENING',
    resumeSnippet:
      'Scaled enterprise recruitment SaaS from $2M to $18M ARR. Authored automated candidate pipeline PRDs adopted across 14 enterprise accounts.',
  },
};

export const LandingPage: React.FC = () => {
  // Jobs & filters state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  // Only 3 most recently created jobs
  const recentJobs = useMemo(() => {
    const sorted = [...jobs].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    return sorted.slice(0, 3);
  }, [jobs]);

  // Interactive Simulator preset state
  const [activePresetKey, setActivePresetKey] = useState<string>('architect');
  const activePreset = CANDIDATE_PRESETS[activePresetKey];

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await getOpenJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs on landing page:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const faqs = [
    {
      q: 'Are these jobs for your company or at client partner companies?',
      a: 'These openings are hosted on behalf of our diverse client companies—ranging from high-growth tech startups to established engineering enterprises. Client companies partner with our platform to find and hire exceptional talent for their open positions.',
    },
    {
      q: 'How does our platform match and place candidates?',
      a: 'When you apply to a specific role or join our general talent pool, our objective skills rubric and team evaluate your practical engineering depth and project work. We then introduce qualified candidates directly to hiring managers and founders at client companies for interview loops.',
    },
    {
      q: 'Is there any fee or cost for candidates to use this platform?',
      a: 'Never. Our platform is 100% free for job seekers. Our client companies compensate us when they make a successful hire, so you never pay anything for applications, assessments, interview preparation, or placement.',
    },
    {
      q: 'Can I be considered for multiple client companies with one application?',
      a: 'Yes! Submitting your CV to a role or our General Placement Pool makes you eligible across all current and upcoming openings hosted for our partner companies. If your skills match multiple client needs, we will advocate for you across all relevant teams.',
    },
    {
      q: 'How long does it take to hear back after submitting an application?',
      a: 'We respect your time. Every submission is reviewed within 48 to 72 business hours. If there is a strong match with our partner companies, our team reaches out promptly to coordinate next steps and schedule company team interviews.',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark, #f2f0e9)',
        color: 'var(--text-main, #24221f)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* 1. Minimalist Header */}
      <LandingNavbar activeJobsCount={jobs.length} />

      {/* =========================================================
          2. CLEAN MINIMALIST HERO SECTION
          ========================================================= */}
      <section
        style={{
          padding: '70px 24px 60px',
          maxWidth: '1120px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Subtle Warm Pill Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e6e4dc)',
            color: 'var(--text-muted, #666560)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '22px',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--success, #378b59)',
              display: 'inline-block',
            }}
          />
          Talent Placement Network • Hiring for Leading Tech Companies & Startups
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.16,
            letterSpacing: '-0.03em',
            color: 'var(--text-main, #24221f)',
            margin: '0 auto 22px',
            maxWidth: '920px',
          }}
        >
          One Application. Placed at Leading Tech Companies.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.12rem',
            color: 'var(--text-muted, #666560)',
            maxWidth: '720px',
            margin: '0 auto 34px',
            lineHeight: 1.6,
          }}
        >
          Top companies partner with our talent platform to find and hire exceptional talent. Browse verified roles across high-growth startups and tech enterprises, showcase your real skills, and get fast-tracked to direct interviews.
        </p>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            marginBottom: '52px',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="#roles"
            style={{
              padding: '13px 32px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary, #da7756)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(218, 119, 86, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover, #c46445)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary, #da7756)')}
          >
            <span>Explore Partner Roles</span>
            <span>↓</span>
          </a>

          <Link
            to="/apply"
            style={{
              padding: '13px 26px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #24221f)',
              border: '1px solid var(--border-color, #e6e4dc)',
              fontSize: '0.98rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            }}
            className="hover:bg-black/[0.02] transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>General Placement Pool</span>
          </Link>
        </div>

        {/* 4 Candidate Value Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary, #da7756)' }}>
              Top Companies
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Vetted Roles Across High-Growth Startups & Tech Firms
            </div>
          </div>

          <div
            style={{
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success, #378b59)' }}>
              &lt; 48h Match
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Direct Introductions to Company Hiring Managers
            </div>
          </div>

          <div
            style={{
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
              100% Skills-First
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Evaluated on Code & Architecture, Not Keywords
            </div>
          </div>

          <div
            style={{
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
              100% Free
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Zero Cost to Candidates • Hired by Leading Teams
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. LIVE INTERACTIVE SIMULATION CARD (ResolveAI Style)
          ========================================================= */}
      <section
        id="evaluation-simulator"
        style={{
          maxWidth: '1040px',
          margin: '0 auto 80px',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e6e4dc)',
            backgroundColor: 'var(--bg-card, #ffffff)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Header Bar with Mac-style Dots */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--bg-dark, #f2f0e9)',
              borderBottom: '1px solid var(--border-color, #e6e4dc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#c44336' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d97706' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#378b59' }} />
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '0.84rem',
                  color: 'var(--text-muted, #666560)',
                  fontWeight: 600,
                }}
              >
                Transparent Evaluation • How We Review Applications
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-indicator" />
              <span style={{ fontSize: '0.75rem', color: 'var(--success, #378b59)', fontWeight: 600 }}>
                Objective Rubric
              </span>
            </div>
          </div>

          {/* Interactive Preset Buttons */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--bg-card-hover, #faf9f6)',
              borderBottom: '1px solid var(--border-color, #e6e4dc)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666560)', fontWeight: 600 }}>
              Preview Sample Role Evaluation:
            </span>
            {Object.keys(CANDIDATE_PRESETS).map((key) => {
              const preset = CANDIDATE_PRESETS[key];
              const isSelected = activePresetKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePresetKey(key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    backgroundColor: isSelected ? 'var(--primary, #da7756)' : 'var(--bg-card, #ffffff)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted, #666560)',
                    border: isSelected ? '1px solid var(--primary, #da7756)' : '1px solid var(--border-color, #e6e4dc)',
                  }}
                >
                  {preset.role}
                </button>
              );
            })}
          </div>

          {/* Dual Panel Simulation View */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">
            {/* Left Panel: Raw Extracted Resume Feed */}
            <div style={{ padding: '24px' }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #24221f)' }}>
                    {activePreset.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666560)' }}>
                    {activePreset.experience}
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: 'var(--success-bg, #eaf3ed)',
                    color: 'var(--success, #378b59)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Verified Application
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim, #9c9a93)', fontWeight: 700, marginBottom: '6px' }}>
                  OCR Document Excerpt
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-card-hover, #faf9f6)',
                    border: '1px solid var(--border-color, #e6e4dc)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted, #666560)',
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{activePreset.resumeSnippet}&rdquo;
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim, #9c9a93)', fontWeight: 700, marginBottom: '6px' }}>
                  Extracted Competencies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activePreset.extractedSkills.map((s) => (
                    <span
                      key={s}
                      style={{
                        backgroundColor: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border-color, #e6e4dc)',
                        color: 'var(--text-main, #24221f)',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: AI Scoring & Rubric */}
            <div style={{ padding: '24px' }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim, #9c9a93)', fontWeight: 700 }}>
                    Autonomous Match
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary, #da7756)' }}>
                    {activePreset.matchScore}%
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim, #9c9a93)', fontWeight: 700 }}>
                    Recommended Stage
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--primary, #da7756)',
                      backgroundColor: 'rgba(218, 119, 86, 0.1)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      marginTop: '2px',
                    }}
                  >
                    {activePreset.stage}
                  </div>
                </div>
              </div>

              {/* Rubric Progress Bars */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span style={{ color: 'var(--text-muted, #666560)' }}>System Design & Architecture</span>
                    <span style={{ color: 'var(--text-main, #24221f)' }}>{activePreset.rubric.systemDesign}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-dark, #f2f0e9)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${activePreset.rubric.systemDesign}%`, backgroundColor: 'var(--primary, #da7756)', borderRadius: '3px' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span style={{ color: 'var(--text-muted, #666560)' }}>Coding & Implementation Depth</span>
                    <span style={{ color: 'var(--text-main, #24221f)' }}>{activePreset.rubric.codingDepth}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-dark, #f2f0e9)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${activePreset.rubric.codingDepth}%`, backgroundColor: 'var(--success, #378b59)', borderRadius: '3px' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span style={{ color: 'var(--text-muted, #666560)' }}>Domain Experience & Leadership</span>
                    <span style={{ color: 'var(--text-main, #24221f)' }}>{activePreset.rubric.leadership}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-dark, #f2f0e9)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${activePreset.rubric.leadership}%`, backgroundColor: 'var(--indigo, #5d574e)', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card-hover, #faf9f6)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: 'var(--text-main, #24221f)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
                <span>{activePreset.recommendation}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. HOW WE HIRE: CANDIDATE APPLICATION & INTERVIEW JOURNEY (#process)
          ========================================================= */}
      <section
        id="process"
        style={{
          maxWidth: '1040px',
          margin: '0 auto 80px',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e6e4dc)',
            backgroundColor: 'var(--bg-card, #ffffff)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
            padding: '36px',
          }}
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--primary, #da7756)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '6px',
              }}
            >
              <Compass className="w-4 h-4" /> The Placement Journey
            </div>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
              How It Works: Getting Placed at Top Companies
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
              Leading tech companies partner with us to find exceptional engineers and product builders. Here is how we connect you directly to hiring decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div
              style={{
                padding: '22px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-dark, #f2f0e9)',
                border: '1px solid var(--border-color, #e6e4dc)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary, #da7756)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                1
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
                Apply or Join Pool
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
                Browse curated roles across our client companies or submit your CV once to our general placement pool.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                padding: '22px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-dark, #f2f0e9)',
                border: '1px solid var(--border-color, #e6e4dc)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary, #da7756)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                2
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
                Skills Benchmark
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
                Our objective rubric assesses your actual code, past projects, and system design—calibrated to what partner teams need.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                padding: '22px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-dark, #f2f0e9)',
                border: '1px solid var(--border-color, #e6e4dc)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary, #da7756)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                3
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
                Direct Introductions
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
                Skip resume black holes. We introduce qualified candidates directly to engineering heads and founders at client companies.
              </p>
            </div>

            {/* Step 4 */}
            <div
              style={{
                padding: '22px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-dark, #f2f0e9)',
                border: '1px solid var(--border-color, #e6e4dc)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success, #378b59)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                4
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
                Interview & Offer
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
                Interview directly with company teams and secure competitive compensation, equity packages, and seamless placement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. LIVE OPEN POSITIONS BOARD (#roles)
          ========================================================= */}
      <section
        id="roles"
        style={{
          maxWidth: '1120px',
          margin: '0 auto 80px',
          padding: '0 24px',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--primary, #da7756)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '6px',
              }}
            >
              <Briefcase className="w-4 h-4" /> Live Open Positions
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
              Open Roles Across Partner Companies
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
              Explore active engineering, product, and AI positions hosted for our client companies.
            </p>
          </div>

          <Link
            to="/apply"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              color: 'var(--text-main, #24221f)',
              fontSize: '0.86rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="hover:bg-black/[0.02] transition-colors"
          >
            <span>General Open Application</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--primary)]" />
          </Link>
        </div>

        {/* Roles List: Top 3 Most Recent Openings */}
        {loadingJobs ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            <p className="text-sm font-medium text-[var(--text-muted)]">Loading recent openings...</p>
          </div>
        ) : recentJobs.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <Briefcase className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main, #24221f)' }}>
              No open roles currently posted
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
              Submit a general open application to be considered for upcoming partner roles.
            </p>
            <Link
              to="/apply"
              style={{
                marginTop: '16px',
                padding: '9px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary, #da7756)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Submit General Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.map((job) => {
                const meta = parseJobDescription(job.description);

                return (
                  <div
                    key={job.id}
                    style={{
                      backgroundColor: 'var(--bg-card, #ffffff)',
                      border: '1px solid var(--border-color, #e6e4dc)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                    }}
                    className="hover:shadow-md hover:border-[#dcdad0] group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            style={{
                              backgroundColor: 'var(--bg-dark, #f2f0e9)',
                              color: 'var(--indigo, #5d574e)',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {job.department}
                          </span>

                          {meta.companyName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-main)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                              <Building2 className="w-3 h-3 text-[var(--primary)]" />
                              {meta.companyName}
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--text-muted, #666560)',
                            fontWeight: 600,
                          }}
                        >
                          {job.job_type || 'Full-Time'}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: 'var(--text-main, #24221f)',
                          lineHeight: 1.3,
                        }}
                        className="group-hover:text-[var(--primary)] transition-colors"
                      >
                        {job.title}
                      </h3>

                      <div className="flex items-center text-xs text-[var(--text-muted)] gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                          {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                          {meta.workplaceType || 'Immediate'}
                        </span>
                      </div>

                      {meta.skills && meta.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {meta.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: 'rgba(218, 119, 86, 0.08)',
                                color: 'var(--primary, #da7756)',
                                borderColor: 'rgba(218, 119, 86, 0.2)',
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--text-muted, #666560)',
                          lineHeight: 1.5,
                        }}
                        className="line-clamp-3"
                      >
                        {meta.cleanDescription || job.description}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: '16px',
                        marginTop: '16px',
                        borderTop: '1px solid var(--border-color, #e6e4dc)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Link
                        to={`/jobs/${job.id}/apply`}
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'var(--text-muted, #666560)',
                          textDecoration: 'none',
                        }}
                        className="hover:text-[var(--text-main)]"
                      >
                        View Details
                      </Link>

                      <Link
                        to={`/jobs/${job.id}/apply`}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary, #da7756)',
                          color: '#FFFFFF',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(218, 119, 86, 0.2)',
                        }}
                        className="hover:opacity-95 transition-opacity"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Roles Navigation Bar */}
            <div className="text-center pt-2">
              <Link
                to="/apply"
                style={{
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  color: 'var(--text-main, #24221f)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                className="hover:border-[var(--primary)] hover:text-[var(--primary)] transition shadow-xs"
              >
                <span>View All Open Positions ({jobs.length})</span>
                <ArrowRight className="w-4 h-4 text-[var(--primary)]" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          6. WHY BUILD WITH US / LIFE & CULTURE (#culture)
          ========================================================= */}
      <section
        id="culture"
        style={{
          maxWidth: '1120px',
          margin: '0 auto 80px',
          padding: '0 24px',
        }}
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--primary, #da7756)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '6px',
            }}
          >
            <Users className="w-4 h-4" /> Why Candidates Choose Us
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
            Why Apply Through Our Talent Network
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
            We partner directly with leading startups and technology enterprises to match high-caliber engineering and product builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(218, 119, 86, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary, #da7756)',
                marginBottom: '16px',
              }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Direct Lead Access
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Skip generic resume portals. We introduce your verified profile directly to engineering directors and founders at partner companies.
            </p>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(218, 119, 86, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary, #da7756)',
                marginBottom: '16px',
              }}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Curated Opportunities
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Discover vetted roles across early-stage AI pioneers, fast-scaling venture startups, and established global tech companies.
            </p>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(218, 119, 86, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary, #da7756)',
                marginBottom: '16px',
              }}
            >
              <Compass className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              One Assessment, Multiple Offers
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Your objective skills evaluation opens doors to multiple client companies and roles without repeating initial phone screens.
            </p>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(218, 119, 86, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary, #da7756)',
                marginBottom: '16px',
              }}
            >
              <Award className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Advocacy & Negotiation
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              We support you through interview preparation, competitive salary negotiations, and equity packages—always 100% free for candidates.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. INTERACTIVE FAQ ACCORDION (#faq)
          ========================================================= */}
      <section
        id="faq"
        style={{
          maxWidth: '880px',
          margin: '0 auto 90px',
          padding: '0 24px',
        }}
      >
        <div className="text-center mb-10">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
            Everything you need to know about our hiring process, remote policy, and candidate experience.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                style={{
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #24221f)' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--primary)]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 22px 18px',
                      fontSize: '0.86rem',
                      color: 'var(--text-muted, #666560)',
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          8. CLEAN MINIMALIST FOOTER
          ========================================================= */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color, #e6e4dc)',
          backgroundColor: 'var(--bg-dark, #f2f0e9)',
          padding: '40px 24px',
          fontSize: '0.82rem',
          color: 'var(--text-muted, #666560)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary, #da7756)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-main, #24221f)' }}>Careers Hub</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim, #9c9a93)' }}>
                Official Careers & Opportunities Portal
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#roles" className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)]">
              Partner Roles
            </a>
            <a href="#process" className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)]">
              How It Works
            </a>
            <Link to="/apply" className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)]">
              General Placement Pool
            </Link>
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)] flex items-center gap-1"
            >
              <span>System Status</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-center sm:text-right text-[var(--text-dim)]">
            &copy; {new Date().getFullYear()} Talent Placement Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
