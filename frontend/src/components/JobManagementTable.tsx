import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import type { Job } from '../types';
import { parseJobDescription } from '../utils/jobMetadata';

interface JobManagementTableProps {
  jobs: Job[];
  onCreateJob: () => void;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
  onToggleStatus: (job: Job) => Promise<void>;
  loading?: boolean;
}

export const JobManagementTable: React.FC<JobManagementTableProps> = ({
  jobs,
  onCreateJob,
  onToggleStatus,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border-color)] p-12 text-center text-[var(--text-muted)] shadow-xs">
        <div
          style={{ borderColor: 'var(--primary, #da7756)', borderTopColor: 'transparent' }}
          className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-3"
        />
        <p className="text-sm font-semibold">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">Role Listings</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Manage open positions across partner organizations.
          </p>
        </div>

        <button
          onClick={onCreateJob}
          style={{
            backgroundColor: 'var(--primary, #da7756)',
            boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
          }}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Job
        </button>
      </div>

      {/* Clean Table: Role | Company | End Date | Applicants | Status | Actions */}
      <div className="bg-white rounded-2xl border border-[var(--border-color)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card-hover)] border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">End Date</th>
                <th className="py-3.5 px-4">Applicants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-main)]">
              {jobs.map((job) => {
                const meta = parseJobDescription(job.description);

                return (
                  <tr key={job.id} className="hover:bg-[var(--bg-card-hover)] transition">
                    {/* 1. Role */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-main)] text-sm">
                          {job.title}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--primary)] mt-0.5">
                          {job.department || 'General'}
                        </span>
                      </div>
                    </td>

                    {/* 2. Company */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {meta.companyName ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)] bg-[var(--bg-card-hover)] px-3 py-1 rounded-full border border-[var(--border-color)] shadow-2xs">
                          <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>{meta.companyName}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-dim)] italic">—</span>
                      )}
                    </td>

                    {/* 3. End Date */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {meta.endDate ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-main)]">
                          <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>
                            {new Date(meta.endDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-dim)] font-medium">Ongoing</span>
                      )}
                    </td>

                    {/* 4. Applicants */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        style={{
                          backgroundColor: 'rgba(218, 119, 86, 0.1)',
                          borderColor: 'rgba(218, 119, 86, 0.25)',
                          color: 'var(--primary, #da7756)',
                        }}
                        className="inline-flex items-center text-xs font-bold border px-3 py-1 rounded-full"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        {job.applications_count || 0} Candidates
                      </span>
                    </td>

                    {/* 5. Status Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(job)}
                        className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border transition cursor-pointer shadow-2xs ${
                          job.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {job.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            Open
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* 6. Actions: Only Eye Button */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/jobs/${job.id}`}
                        style={{
                          backgroundColor: 'rgba(218, 119, 86, 0.1)',
                          borderColor: 'rgba(218, 119, 86, 0.25)',
                          color: 'var(--primary, #da7756)',
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition cursor-pointer shadow-2xs group"
                        title="View Detailed Job Profile & Candidate Analytics"
                      >
                        <Eye className="w-4 h-4 text-[var(--primary)] group-hover:text-white transition-colors" />
                        <span>View Analysis</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
