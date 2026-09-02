import React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import type { Job } from '../types';
import { parseJobDescription } from '../utils/jobMetadata';

interface JobManagementTableProps {
  jobs: Job[];
  onCreateJob: () => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
  onToggleStatus: (job: Job) => Promise<void>;
  loading?: boolean;
}

export const JobManagementTable: React.FC<JobManagementTableProps> = ({
  jobs,
  onCreateJob,
  onEditJob,
  onDeleteJob,
  onToggleStatus,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border-color)] p-12 text-center text-[var(--text-muted)] shadow-xs">
        <div
          style={{ borderColor: 'var(--primary, #da7756)', borderTopColor: 'transparent' }}
          className="w-8 h-8 mx-auto border-4 rounded-full animate-spin mb-3"
        />
        <p className="text-sm font-medium">Loading job postings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[var(--text-main)]">Partner Company Job Postings</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Manage client job requirements, set application deadlines, add skills, and toggle status.
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--border-color)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card-hover)] border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Job Role & Partner Company</th>
                <th className="py-3.5 px-4">Timeline & Compensation</th>
                <th className="py-3.5 px-4">Required Skills</th>
                <th className="py-3.5 px-4">Location & Type</th>
                <th className="py-3.5 px-4">Applicants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-main)]">
              {jobs.map((job) => {
                const meta = parseJobDescription(job.description);

                return (
                  <tr key={job.id} className="hover:bg-[var(--bg-card-hover)] transition">
                    {/* Title & Company */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-main)] text-sm">{job.title}</span>
                          {meta.companyName && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--text-main)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                              <Building2 className="w-3 h-3 text-[var(--primary)]" />
                              {meta.companyName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                          <span className="font-semibold text-[var(--primary)]">{job.department}</span>
                          {meta.experienceLevel && (
                            <>
                              <span>•</span>
                              <span>{meta.experienceLevel}</span>
                            </>
                          )}
                          <span>•</span>
                          {job.is_active ? (
                            <a
                              href={`/jobs/${job.id}/apply`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--primary, #da7756)' }}
                              className="inline-flex items-center hover:underline font-medium"
                            >
                              <ExternalLink className="w-3 h-3 mr-0.5" />
                              Direct apply link
                            </a>
                          ) : (
                            <span className="text-[var(--text-dim)]">Archived</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Timeline & Compensation */}
                    <td className="py-4 px-4 whitespace-nowrap text-[var(--text-muted)]">
                      <div className="flex flex-col space-y-1">
                        {(meta.startDate || meta.endDate) ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-main)]">
                            <Calendar className="w-3 h-3 text-[var(--primary)]" />
                            {meta.startDate ? new Date(meta.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Open'}
                            {' - '}
                            {meta.endDate ? new Date(meta.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-dim)]">No deadline set</span>
                        )}

                        {meta.salaryRange && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            {meta.salaryRange}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Required Skills */}
                    <td className="py-4 px-4">
                      {meta.skills && meta.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {meta.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: 'rgba(218, 119, 86, 0.08)',
                                color: 'var(--primary, #da7756)',
                                borderColor: 'rgba(218, 119, 86, 0.2)',
                              }}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                            >
                              {skill}
                            </span>
                          ))}
                          {meta.skills.length > 3 && (
                            <span className="text-[10px] font-bold text-[var(--text-dim)] self-center">
                              +{meta.skills.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--text-dim)] italic">None specified</span>
                      )}
                    </td>

                    {/* Location & Type */}
                    <td className="py-4 px-4 whitespace-nowrap text-[var(--text-muted)]">
                      <div className="flex flex-col space-y-0.5">
                        <span className="flex items-center text-[11px]">
                          <MapPin className="w-3 h-3 mr-1 text-[var(--text-dim)]" />
                          {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center text-[11px]">
                          <Clock className="w-3 h-3 mr-1 text-[var(--text-dim)]" />
                          {job.job_type || 'Full-Time'}
                          {meta.workplaceType ? ` (${meta.workplaceType})` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Applications Count */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        style={{
                          backgroundColor: 'rgba(218, 119, 86, 0.1)',
                          borderColor: 'rgba(218, 119, 86, 0.25)',
                          color: 'var(--primary, #da7756)',
                        }}
                        className="inline-flex items-center text-xs font-bold border px-2.5 py-1 rounded-full"
                      >
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {job.applications_count || 0} Candidates
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(job)}
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                          job.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {job.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Open
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => onEditJob(job)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job)}
                          className="p-1.5 rounded-lg text-[var(--text-dim)] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
