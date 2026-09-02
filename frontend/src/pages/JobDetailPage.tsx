import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  ExternalLink,
  MapPin,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Tag,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  Eye,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { AdminNavbar } from '../components/AdminNavbar';
import { JobFormModal } from '../components/JobFormModal';
import { CandidateDetailDrawer } from '../components/CandidateDetailDrawer';
import { StageBadge } from '../components/StageBadge';
import {
  getAdminJobById,
  getAdminApplications,
  updateAdminJob,
} from '../services/adminApi';
import type { AdminUser, Job, ApplicationResponse, JobUpdatePayload } from '../types';
import { parseJobDescription } from '../utils/jobMetadata';

interface JobDetailPageProps {
  user: AdminUser;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ user }) => {
  const { job_id } = useParams<{ job_id: string }>();
  const navigate = useNavigate();

  // Core Data State
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Candidate Detail Drawer State
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Edit Job Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Filters & Search
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch Job & Applications
  const loadData = useCallback(async () => {
    if (!job_id) return;
    setLoading(true);
    setError(null);
    try {
      const [jobData, appsData] = await Promise.all([
        getAdminJobById(job_id),
        getAdminApplications({ job_id }),
      ]);
      setJob(jobData);
      setApplications(appsData);
    } catch (err: any) {
      console.error('Failed to load job profile details:', err);
      setError(err?.response?.data?.detail || 'Could not load job position details.');
    } finally {
      setLoading(false);
    }
  }, [job_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Parsed Metadata
  const meta = useMemo(() => {
    return job ? parseJobDescription(job.description) : null;
  }, [job]);

  // Stage Metrics Calculations
  const stageMetrics = useMemo(() => {
    const counts: Record<string, number> = {
      TOTAL: applications.length,
      APPLIED: 0,
      R1: 0,
      R2: 0,
      R3: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    applications.forEach((app) => {
      const stg = app.stage.toUpperCase();
      if (stg === 'APPLIED') counts.APPLIED += 1;
      else if (stg === 'R1') counts.R1 += 1;
      else if (stg === 'R2') counts.R2 += 1;
      else if (stg === 'R3') counts.R3 += 1;
      else if (stg === 'APPROVED') counts.APPROVED += 1;
      else if (stg.includes('REJECT')) counts.REJECTED += 1;
    });

    return counts;
  }, [applications]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Stage filter
      if (stageFilter === 'REJECTED') {
        if (!app.stage.toUpperCase().includes('REJECT')) return false;
      } else if (stageFilter !== 'ALL' && app.stage.toUpperCase() !== stageFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = app.candidate_name.toLowerCase().includes(query);
        const matchEmail = app.candidate_email.toLowerCase().includes(query);
        const matchPhone = app.candidate_phone.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      return true;
    });
  }, [applications, stageFilter, searchQuery]);

  // Toggle Job Status
  const handleToggleStatus = async () => {
    if (!job) return;
    try {
      const updated = await updateAdminJob(job.id, { is_active: !job.is_active });
      setJob(updated);
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    }
  };

  // Save Edit Specifications
  const handleSaveJob = async (payload: JobUpdatePayload) => {
    if (!job) return;
    try {
      const updated = await updateAdminJob(job.id, payload);
      setJob(updated);
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Failed to update job specifications:', err);
      alert(err?.response?.data?.detail || 'Failed to update job position.');
    }
  };

  // Copy Direct Apply URL
  const handleCopyApplyUrl = () => {
    if (!job) return;
    const url = `${window.location.origin}/jobs/${job.id}/apply`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
        <AdminNavbar activeTab="jobs" onTabChange={() => navigate('/admin')} user={user} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <p className="text-sm font-semibold text-[var(--text-muted)]">
            Loading position analysis & candidate data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
        <AdminNavbar activeTab="jobs" onTabChange={() => navigate('/admin')} user={user} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-main)]">
            {error || 'Job Position Not Found'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            The requested role may have been deleted or you do not have permission to view it.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-xs hover:opacity-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Positions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
      <AdminNavbar activeTab="jobs" onTabChange={() => navigate('/admin')} user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-muted)]">
            <Link to="/admin" className="hover:text-[var(--primary)] transition">
              Positions
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            <span className="text-[var(--text-main)] font-bold truncate max-w-xs sm:max-w-md">
              {job.title}
            </span>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Positions
          </Link>
        </div>

        {/* Executive Job Profile Card */}
        <div className="bg-white rounded-2xl border border-[var(--border-color)] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  style={{
                    backgroundColor: 'rgba(218, 119, 86, 0.1)',
                    borderColor: 'rgba(218, 119, 86, 0.25)',
                    color: 'var(--primary, #da7756)',
                  }}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                >
                  {job.department || 'Engineering'}
                </span>

                {meta?.companyName && (
                  meta.companyWebsite ? (
                    <a
                      href={meta.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)] bg-[var(--bg-card-hover)] px-3 py-1 rounded-full border border-[var(--border-color)] shadow-2xs hover:border-[var(--primary)] transition"
                      title={`Visit ${meta.companyName} website`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>{meta.companyName}</span>
                      <ExternalLink className="w-3 h-3 text-[var(--text-dim)]" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)] bg-[var(--bg-card-hover)] px-3 py-1 rounded-full border border-[var(--border-color)] shadow-2xs">
                      <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>{meta.companyName}</span>
                    </span>
                  )
                )}

                <button
                  onClick={handleToggleStatus}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition cursor-pointer shadow-2xs ${
                    job.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Click to toggle hiring status"
                >
                  {job.is_active ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Actively Hiring
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      Inactive / Paused
                    </>
                  )}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
                {job.title}
              </h1>

              {/* Specs Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-[var(--text-muted)]">
                <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1 rounded-xl border border-[var(--border-color)]">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" />
                  {job.location || 'Remote'}
                </span>
                <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1 rounded-xl border border-[var(--border-color)]">
                  <Clock className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" />
                  {job.job_type || 'Full-Time'}
                </span>
                {meta?.workplaceType && (
                  <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1 rounded-xl border border-[var(--border-color)]">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" />
                    {meta.workplaceType}
                  </span>
                )}
                {meta?.experienceLevel && (
                  <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1 rounded-xl border border-[var(--border-color)]">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {meta.experienceLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex flex-wrap items-center gap-3 lg:self-start">
              <button
                onClick={handleCopyApplyUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-white hover:bg-[var(--bg-card-hover)] text-xs font-bold text-[var(--text-main)] transition cursor-pointer shadow-2xs"
                title="Copy Candidate Application Link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Copy Apply URL</span>
                  </>
                )}
              </button>

              <a
                href={`/jobs/${job.id}/apply`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-white hover:bg-[var(--bg-card-hover)] text-xs font-bold text-[var(--text-main)] transition shadow-2xs"
              >
                <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Open Candidate View</span>
              </a>

              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  backgroundColor: 'var(--primary, #da7756)',
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Specifications</span>
              </button>
            </div>
          </div>

          {/* Key Tech Stack & Requirements Pills */}
          {meta?.skills && meta.skills.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
                Required Tech Stack & Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {meta.skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: 'rgba(218, 119, 86, 0.08)',
                      color: 'var(--primary, #da7756)',
                      borderColor: 'rgba(218, 119, 86, 0.25)',
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Analytics KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Applied */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Total Applied
              </span>
              <div className="p-2 rounded-xl bg-orange-50 text-[var(--primary)]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
              {stageMetrics.TOTAL}
            </div>
            <p className="text-[10px] text-[var(--text-dim)]">All-time applications</p>
          </div>

          {/* Initial Review */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                New / Applied
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
              {stageMetrics.APPLIED}
            </div>
            <p className="text-[10px] text-[var(--text-dim)]">Awaiting first screening</p>
          </div>

          {/* In Technical Loops */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Interview Loops
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
              {stageMetrics.R1 + stageMetrics.R2 + stageMetrics.R3}
            </div>
            <p className="text-[10px] text-[var(--text-dim)]">Active in R1, R2, or R3</p>
          </div>

          {/* Approved / Offered */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Approved
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
              {stageMetrics.APPROVED}
            </div>
            <p className="text-[10px] text-[var(--text-dim)]">Candidate offers extended</p>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Timeline
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-bold text-[var(--text-main)] pt-1 truncate">
              {meta?.startDate ? new Date(meta.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Open'}
              {' — '}
              {meta?.endDate ? new Date(meta.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Rolling'}
            </div>
            <p className="text-[10px] text-[var(--text-dim)]">Posting duration</p>
          </div>

          {/* Compensation */}
          <div className="bg-white rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Target Salary
              </span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-bold text-teal-700 pt-1 truncate">
              {meta?.salaryRange || 'Competitive'}
            </div>
            <p className="text-[10px] text-[var(--text-dim)]">Budgeted annual rate</p>
          </div>
        </div>

        {/* Candidate Pipeline Directory Section */}
        <div className="bg-white rounded-2xl border border-[var(--border-color)] shadow-xs overflow-hidden space-y-4">
          {/* Header & Search */}
          <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                <span>Candidate Pipeline for this Role</span>
                <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)]">
                  {filteredApplications.length} candidate{filteredApplications.length === 1 ? '' : 's'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Click on any candidate to inspect their complete profile, resume, notes, and audit history.
              </p>
            </div>

            {/* Candidate Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Interactive Stage Funnel Filter Tabs */}
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setStageFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'ALL'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                All Stages ({stageMetrics.TOTAL})
              </button>

              <button
                onClick={() => setStageFilter('APPLIED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'APPLIED'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                Applied ({stageMetrics.APPLIED})
              </button>

              <button
                onClick={() => setStageFilter('R1')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'R1'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                Round 1 ({stageMetrics.R1})
              </button>

              <button
                onClick={() => setStageFilter('R2')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'R2'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                Round 2 ({stageMetrics.R2})
              </button>

              <button
                onClick={() => setStageFilter('R3')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'R3'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                Round 3 ({stageMetrics.R3})
              </button>

              <button
                onClick={() => setStageFilter('APPROVED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'APPROVED'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                Approved ({stageMetrics.APPROVED})
              </button>

              <button
                onClick={() => setStageFilter('REJECTED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  stageFilter === 'REJECTED'
                    ? 'bg-[var(--primary)] text-white shadow-2xs'
                    : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                Rejected ({stageMetrics.REJECTED})
              </button>
            </div>
          </div>

          {/* Candidate Applications Table */}
          {filteredApplications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-dim)]">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[var(--text-main)]">
                No candidates found in this stage
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {searchQuery
                  ? `No applicants match "${searchQuery}". Clear your search query to see all applicants.`
                  : 'Share the candidate application URL to start receiving inbound applications.'}
              </p>
              <button
                onClick={handleCopyApplyUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline pt-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Candidate Application Link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-[var(--border-color)] bg-[var(--bg-card-hover)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-3 px-6">Candidate</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-xs">
                  {filteredApplications.map((app) => {
                    const initials = app.candidate_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApplicationId(app.id)}
                        className="hover:bg-[var(--bg-card-hover)] transition cursor-pointer group"
                      >
                        {/* Candidate Name & Initials */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div
                              style={{
                                backgroundColor: 'rgba(218, 119, 86, 0.15)',
                                color: 'var(--primary, #da7756)',
                              }}
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border border-[var(--border-color)]"
                            >
                              {initials || 'C'}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition">
                                {app.candidate_name}
                              </div>
                              <span className="text-[11px] text-[var(--text-dim)]">
                                {app.resume_filename || 'Application Submitted'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-0.5 text-[var(--text-muted)]">
                            <span className="text-xs font-medium text-[var(--text-main)]">
                              {app.candidate_email}
                            </span>
                            <span className="text-[11px] text-[var(--text-dim)]">
                              {app.candidate_phone}
                            </span>
                          </div>
                        </td>

                        {/* Current Stage */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <StageBadge currentStage={app.stage} />
                        </td>

                        {/* Applied Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-[var(--text-muted)] text-[11px]">
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </td>

                        {/* Action: View Candidate Profile */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplicationId(app.id);
                            }}
                            style={{
                              backgroundColor: 'rgba(218, 119, 86, 0.1)',
                              borderColor: 'rgba(218, 119, 86, 0.25)',
                              color: 'var(--primary, #da7756)',
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition cursor-pointer shadow-2xs group/btn"
                            title="Inspect Candidate Profile & Resume"
                          >
                            <Eye className="w-3.5 h-3.5 text-[var(--primary)] group-hover/btn:text-white transition-colors" />
                            <span>View Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role Description Overview */}
        <div className="bg-white rounded-2xl border border-[var(--border-color)] p-6 sm:p-8 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>Position Description & Specifications</span>
          </h3>
          <div className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-[var(--bg-card-hover)] p-5 rounded-2xl border border-[var(--border-color)]">
            {meta?.cleanDescription || job.description}
          </div>
        </div>
      </main>

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        applicationId={selectedApplicationId}
        onClose={() => setSelectedApplicationId(null)}
        onStageUpdated={loadData}
      />

      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <JobFormModal
          job={job}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
};
