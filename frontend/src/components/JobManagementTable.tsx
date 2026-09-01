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
  ExternalLink
} from 'lucide-react';
import type { Job } from '../types';

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
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading job postings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Active & Archived Positions</h2>
          <p className="text-xs text-slate-500">Manage job requirements, toggle application status, or add new roles.</p>
        </div>
        <button
          onClick={onCreateJob}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Job
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Job Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Location & Type</th>
                <th className="py-3.5 px-4">Applicants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/60 transition">
                  {/* Title */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{job.title}</span>
                      <a
                        href={`/jobs/${job.id}/apply`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[11px] text-indigo-600 hover:underline mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Direct apply link
                      </a>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {job.department}
                    </span>
                  </td>

                  {/* Location & Type */}
                  <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                    <div className="flex flex-col space-y-0.5">
                      <span className="flex items-center text-[11px]">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center text-[11px]">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {job.job_type || 'Full-Time'}
                      </span>
                    </div>
                  </td>

                  {/* Applications Count */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5 mr-1 text-indigo-600" />
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
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
