import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { CandidateTable } from '../components/CandidateTable';
import { CandidateDetailDrawer } from '../components/CandidateDetailDrawer';
import { JobManagementTable } from '../components/JobManagementTable';
import { JobFormModal } from '../components/JobFormModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  getAdminJobs,
  getAdminApplications,
  getDashboardStats,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  updateApplicationStage
} from '../services/adminApi';
import type {
  Job,
  ApplicationResponse,
  AdminUser,
  ApplicationStage,
  JobCreatePayload,
  JobUpdatePayload,
  DashboardStats
} from '../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface AdminDashboardPageProps {
  user: AdminUser;
}

const STAGE_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'All Stages' },
  { key: 'APPLIED', label: 'Applied (Initial)' },
  { key: 'R1', label: 'R1' },
  { key: 'R1_REJECT', label: 'R1 Reject' },
  { key: 'R2', label: 'R2' },
  { key: 'R2_REJECT', label: 'R2 Reject' },
  { key: 'R3', label: 'R3' },
  { key: 'R3_REJECT', label: 'R3 Reject' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECT', label: 'Reject' }
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');

  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_candidates: 0,
    in_review: 0,
    approved: 0,
    rejected: 0
  });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);

  // Filters State
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  // Modals & Drawers State
  const [inspectApplicationId, setInspectApplicationId] = useState<string | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  // Debounce search query changes by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [selectedJobFilter, selectedStageFilter, debouncedSearchQuery]);

  useEffect(() => {
    loadStats();
  }, [selectedJobFilter]);

  const loadDashboardData = async () => {
    await Promise.all([loadJobs(), loadStats()]);
  };

  const loadStats = async () => {
    try {
      const data = await getDashboardStats(selectedJobFilter !== 'ALL' ? selectedJobFilter : undefined);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await getAdminJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const params: any = {};
      if (selectedJobFilter !== 'ALL') params.job_id = selectedJobFilter;
      if (selectedStageFilter !== 'ALL') params.stage = selectedStageFilter;
      if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();

      const data = await getAdminApplications(params);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };


  // Stage Update Handler
  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    try {
      await updateApplicationStage(appId, newStage);
      await Promise.all([loadApplications(), loadStats()]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update candidate stage.');
    }
  };

  // Job CRUD Handlers
  const handleSaveJob = async (payload: JobCreatePayload | JobUpdatePayload) => {
    if (editingJob) {
      await updateAdminJob(editingJob.id, payload);
    } else {
      await createAdminJob(payload as JobCreatePayload);
    }
    await loadJobs();
  };

  const handleToggleJobStatus = async (job: Job) => {
    try {
      await updateAdminJob(job.id, { is_active: !job.is_active });
      await loadJobs();
    } catch {
      alert('Failed to toggle job status.');
    }
  };

  const handleDeleteJobConfirm = async (jobId: string) => {
    try {
      await deleteAdminJob(jobId);
      await Promise.all([loadJobs(), loadStats()]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        candidateCount={stats.total_candidates}
        jobCount={jobs.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Candidates</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-slate-900">{stats.total_candidates}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Active Review</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-blue-600">{stats.in_review}</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved / Hired</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-emerald-600">{stats.approved}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-rose-600">{stats.rejected}</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>


        {/* Tab 1: Candidate Applications Pipeline */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {/* Filter Controls Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search candidate by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                {/* Job Filter Dropdown */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-600 shrink-0">Filter by Job:</span>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[200px]"
                  >
                    <option value="ALL">All Jobs ({jobs.length} Positions)</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stage Filter Chips */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center mr-1">
                  <Filter className="w-3 h-3 mr-1" /> Stage:
                </span>
                {STAGE_FILTERS.map((stg) => {
                  const isSelected = selectedStageFilter === stg.key;
                  return (
                    <button
                      key={stg.key}
                      onClick={() => setSelectedStageFilter(stg.key)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {stg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Table */}
            <CandidateTable
              applications={applications}
              onInspect={(id) => setInspectApplicationId(id)}
              onStageChange={handleStageChange}
              loading={loadingApps}
            />
          </div>
        )}

        {/* Tab 2: Job Management */}
        {activeTab === 'jobs' && (
          <JobManagementTable
            jobs={jobs}
            onCreateJob={() => {
              setEditingJob(null);
              setJobModalOpen(true);
            }}
            onEditJob={(job) => {
              setEditingJob(job);
              setJobModalOpen(true);
            }}
            onDeleteJob={(job) => setDeletingJob(job)}
            onToggleStatus={handleToggleJobStatus}
            loading={loadingJobs}
          />
        )}
      </main>

      {/* Candidate Dossier Detail Drawer */}
      <CandidateDetailDrawer
        applicationId={inspectApplicationId}
        onClose={() => setInspectApplicationId(null)}
        onStageUpdated={loadApplications}
      />

      {/* Job Create/Edit Modal */}
      <JobFormModal
        job={editingJob}
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        onSave={handleSaveJob}
      />

      {/* Confirm Delete Job Modal */}
      <ConfirmDeleteModal
        job={deletingJob}
        isOpen={!!deletingJob}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleDeleteJobConfirm}
      />
    </div>
  );
};
