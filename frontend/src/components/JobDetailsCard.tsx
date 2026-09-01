import React from 'react';
import type { Job } from '../types';
import { MapPin, Clock } from 'lucide-react';

interface JobDetailsCardProps {
  job: Job;
}

export const JobDetailsCard: React.FC<JobDetailsCardProps> = ({ job }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            {job.department}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">{job.title}</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {job.location}
          </span>
          <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {job.job_type}
          </span>
        </div>
      </div>

      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-200 whitespace-pre-line">
        {job.description}
      </div>
    </div>
  );
};
