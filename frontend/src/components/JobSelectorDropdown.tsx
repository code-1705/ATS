import React from 'react';
import type { Job } from '../types';
import { ChevronDown } from 'lucide-react';

interface JobSelectorDropdownProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  disabled?: boolean;
  error?: string;
}

export const JobSelectorDropdown: React.FC<JobSelectorDropdownProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  disabled = false,
  error
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--text-main)]">
        Position Applied For <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <select
          value={selectedJobId}
          disabled={disabled}
          onChange={(e) => onSelectJob(e.target.value)}
          className={`w-full appearance-none bg-[var(--bg-card-hover)] border rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition pr-10 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${
            error ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
          }`}
        >
          <option value="" disabled>-- Select a Job from Open Roles ({jobs.length} Available) --</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} — [{job.department}] ({job.location})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--text-dim)]">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};
