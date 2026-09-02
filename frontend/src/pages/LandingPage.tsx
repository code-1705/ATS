import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from '../components/LandingNavbar';
import { getOpenJobs } from '../services/api';
import type { Job } from '../types';
import {
  MapPin,
  Briefcase,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  ArrowRight,
  ExternalLink,
  Loader2,
  Lock,
  Zap,
  ChevronDown,
  Sparkles,
  Calculator,
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  // Interactive Simulator preset state
  const [activePresetKey, setActivePresetKey] = useState<string>('architect');
  const activePreset = CANDIDATE_PRESETS[activePresetKey];

  // Interactive ROI Calculator state
  const [monthlyApplicants, setMonthlyApplicants] = useState<number>(350);
  const [manualScreeningDays, setManualScreeningDays] = useState<number>(24);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  // Extract unique departments
  const departments = useMemo(() => {
    const deps = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) deps.add(j.department);
    });
    return ['ALL', ...Array.from(deps)];
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        selectedDepartment === 'ALL' || job.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [jobs, searchQuery, selectedDepartment]);

  // ROI calculations
  const hoursSavedPerMonth = Math.round(monthlyApplicants * 0.45);
  const costSavingsDollars = Math.round(hoursSavedPerMonth * 48);
  const timeToOfferReductionDays = Math.round(manualScreeningDays * 0.62);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does EnterRecruit differ from legacy Applicant Tracking Systems?',
      a: 'Legacy ATS platforms rely on brittle keyword matching that misses high-caliber non-traditional candidates and lets resume-stuffers slip through. EnterRecruit applies semantic evaluation across skill taxonomies, past project scope, and multi-criteria rubrics while isolating all PII behind signed URLs.',
    },
    {
      q: 'How are candidate resumes stored and secured?',
      a: 'Resumes are never exposed via unauthenticated public static links. EnterRecruit saves files to encrypted Supabase Storage buckets or protected disk paths. Recruiters access files exclusively through time-limited signed URLs generated upon verified JWT admin authentication.',
    },
    {
      q: 'Does EnterRecruit support both general and targeted job applications?',
      a: 'Yes. Candidates can apply directly to specific openings (e.g. /jobs/:id/apply) or submit an open general application (/apply). Both workflows ingest resumes with drag-and-drop support, parse qualifications, and populate recruiter pipeline tables in real-time.',
    },
    {
      q: 'Can our hiring managers customize the stage transition finite-state machine?',
      a: 'EnterRecruit includes a deterministic stage transition graph (Applied -> Screening -> Technical Interview -> Final Round -> Offer / Rejected). Every stage change writes an immutable audit log row with admin user ID and timestamp to guarantee EEOC compliance.',
    },
    {
      q: 'How quickly can our team deploy and start receiving candidate applications?',
      a: 'Instant deployment. EnterRecruit automatically bootstraps 10 default enterprise roles (Engineering, Product, Architecture, Data) and an admin account on startup so your careers portal is ready to intake candidates immediately.',
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
          Autonomous Recruitment & Talent Operating System
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
          Transform Candidate Resumes into Qualified Hires on Autopilot
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.12rem',
            color: 'var(--text-muted, #666560)',
            maxWidth: '700px',
            margin: '0 auto 34px',
            lineHeight: 1.6,
          }}
        >
          EnterRecruit automates resume ingestion, multi-dimensional semantic scoring, and
          candidate stage progression. Screen talent 10x faster with <strong>zero data leaks</strong> and
          enterprise multi-tenant compliance.
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
              padding: '13px 36px',
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
            <span>Explore Open Positions</span>
            <span>→</span>
          </a>

          <Link
            to="/admin/login"
            style={{
              padding: '13px 26px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #24221f)',
              border: '1px solid var(--border-color, #e6e4dc)',
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            className="hover:bg-black/[0.02] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
            <span>Recruiter Command Center</span>
          </Link>
        </div>

        {/* 4 Minimalist Metric Cards from ResolveAI */}
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success, #378b59)' }}>
              99.4%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Semantic Parsing Accuracy
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary, #da7756)' }}>
              &lt; 1.5s
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Resume Ingestion & Scoring
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
              0% PII Leak
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Signed URLs & Strict RBAC
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
              10+ Seed Roles
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #666560)', marginTop: '3px' }}>
              Instant Enterprise Deployment
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
                Live Candidate Evaluation & Rubric Engine Simulation
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-indicator" />
              <span style={{ fontSize: '0.75rem', color: 'var(--success, #378b59)', fontWeight: 600 }}>
                Scoring Engine Active
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
              Select Candidate Preset:
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
          4. INTERACTIVE HIRING ROI / TIME SAVINGS CALCULATOR
          ========================================================= */}
      <section
        id="roi-calculator"
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
          <div className="text-center max-w-2xl mx-auto mb-8">
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
              <Calculator className="w-4 h-4" /> Hiring Efficiency Calculator
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
              Estimate Your Recruiting Time & Cost Reduction
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
              Adjust applicant volume and baseline screening duration to see real-time team savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span style={{ color: 'var(--text-main, #24221f)' }}>Monthly Applications Ingested</span>
                  <span style={{ color: 'var(--primary, #da7756)', fontWeight: 800 }}>{monthlyApplicants}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="50"
                  value={monthlyApplicants}
                  onChange={(e) => setMonthlyApplicants(Number(e.target.value))}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[var(--text-dim)] mt-1">
                  <span>50 apps</span>
                  <span>1,500 apps</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span style={{ color: 'var(--text-main, #24221f)' }}>Current Manual Time-to-Screen</span>
                  <span style={{ color: 'var(--primary, #da7756)', fontWeight: 800 }}>{manualScreeningDays} days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="60"
                  step="1"
                  value={manualScreeningDays}
                  onChange={(e) => setManualScreeningDays(Number(e.target.value))}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[var(--text-dim)] mt-1">
                  <span>7 days</span>
                  <span>60 days</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-dark, #f2f0e9)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary, #da7756)' }}>
                  {hoursSavedPerMonth}h
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #666560)', marginTop: '2px', fontWeight: 600 }}>
                  Recruiter Hours Saved / Mo
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-dark, #f2f0e9)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--success, #378b59)' }}>
                  ${costSavingsDollars.toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #666560)', marginTop: '2px', fontWeight: 600 }}>
                  Estimated Monthly Savings
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-dark, #f2f0e9)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  textAlign: 'center',
                }}
                className="col-span-2"
              >
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
                  {timeToOfferReductionDays} Days Faster
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #666560)', marginTop: '2px', fontWeight: 600 }}>
                  Average Reduction in Candidate Time-to-Offer
                </div>
              </div>
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
              Join Our Engineering & Product Teams
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
              Select a position below to submit your resume directly or review role specifications.
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

        {/* Search & Filter Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e6e4dc)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '28px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          {/* Keyword Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, department, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-dark, #f2f0e9)',
                border: '1px solid var(--border-color, #e6e4dc)',
                borderRadius: '8px',
                padding: '9px 14px 9px 36px',
                fontSize: '0.86rem',
                color: 'var(--text-main, #24221f)',
                outline: 'none',
              }}
              className="w-full focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {departments.map((dept) => {
              const isSelected = selectedDepartment === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    backgroundColor: isSelected ? 'var(--primary, #da7756)' : 'var(--bg-dark, #f2f0e9)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted, #666560)',
                    border: isSelected ? '1px solid var(--primary, #da7756)' : '1px solid var(--border-color, #e6e4dc)',
                  }}
                >
                  {dept === 'ALL' ? 'All Roles' : dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Roles List */}
        {loadingJobs ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            <p className="text-sm font-medium text-[var(--text-muted)]">Loading active positions...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e6e4dc)',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <Briefcase className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main, #24221f)' }}>
              No positions matched your query
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted, #666560)', marginTop: '4px' }}>
              Clear filters or submit an open general application.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('ALL');
              }}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-dark, #f2f0e9)',
                border: '1px solid var(--border-color, #e6e4dc)',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-main, #24221f)',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #e6e4dc)',
                  borderRadius: '12px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                className="hover:shadow-md hover:border-[#dcdad0] group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
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
                      fontSize: '1.18rem',
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
                      Immediate
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-muted, #666560)',
                      lineHeight: 1.5,
                    }}
                    className="line-clamp-3"
                  >
                    {job.description}
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
                      padding: '7px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary, #da7756)',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(218, 119, 86, 0.2)',
                    }}
                    className="hover:opacity-95 transition-opacity"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          6. PLATFORM CAPABILITIES SECTION (#capabilities)
          ========================================================= */}
      <section
        id="capabilities"
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
            <Layers className="w-4 h-4" /> Enterprise Infrastructure
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main, #24221f)' }}>
            Engineered for Modern Talent Teams
          </h2>
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
              <Cpu className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Semantic AI Scoring
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Deep rubric evaluation calibrated to role specifications without keyword-stuffing exploits.
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
                backgroundColor: 'rgba(55, 139, 89, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success, #378b59)',
                marginBottom: '16px',
              }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Real-time Pipeline
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Kanban and tabular candidate progression with instantaneous stage transitions and audit logs.
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
                backgroundColor: 'rgba(93, 87, 78, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--indigo, #5d574e)',
                marginBottom: '16px',
              }}
            >
              <Lock className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Zero-Leak Security
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Strict signed URLs, JWT admin auth, path traversal defenses, and zero public static PII mounts.
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
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning, #d97706)',
                marginBottom: '16px',
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main, #24221f)', marginBottom: '6px' }}>
              Targeted & Open Apply
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #666560)', lineHeight: 1.5 }}>
              Dedicated direct position links and general applicant pools with responsive drag-and-drop resume upload.
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
            Everything you need to know about EnterRecruit architecture and candidate privacy.
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
              <div style={{ fontWeight: 800, color: 'var(--text-main, #24221f)' }}>EnterRecruit</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim, #9c9a93)' }}>
                Autonomous Talent Operating System
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#roles" className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)]">
              Open Positions
            </a>
            <Link to="/apply" className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)]">
              Candidate Portal
            </Link>
            <Link to="/admin/login" className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)]">
              Recruiter Admin
            </Link>
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--text-main)] no-underline text-[var(--text-muted)] flex items-center gap-1"
            >
              <span>API Health</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-center sm:text-right text-[var(--text-dim)]">
            &copy; {new Date().getFullYear()} EnterRecruit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
