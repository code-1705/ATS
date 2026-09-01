import React from 'react';
import {
  ExternalLink,
  Download,
  Eye,
  User
} from 'lucide-react';
import { StageBadge } from './StageBadge';
import { getResumeDownloadUrl } from '../services/adminApi';
import type { ApplicationResponse, ApplicationStage } from '../types';

interface CandidateTableProps {
  applications: ApplicationResponse[];
  onInspect: (applicationId: string) => void;
  onStageChange: (applicationId: string, newStage: ApplicationStage) => Promise<void>;
  loading?: boolean;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  applications,
  onInspect,
  onStageChange,
  loading = false
}) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Loading candidate pipeline...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/80 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No candidates found</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          There are no applications matching your selected filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
          <tr>
            <th className="py-3.5 px-4">Candidate</th>
            <th className="py-3.5 px-4">Applied Role</th>
            <th className="py-3.5 px-4">Submitted</th>
            <th className="py-3.5 px-4">Resume</th>
            <th className="py-3.5 px-4">Pipeline Stage</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
              {/* Candidate Info */}
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {app.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {app.candidate_name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {app.candidate_email}
                    </span>
                  </div>
                </div>
              </td>

              {/* Job Info */}
              <td className="py-4 px-4">
                <div>
                  <span className="font-medium text-slate-800 block">
                    {app.job_title}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {app.job_department}
                  </span>
                </div>
              </td>

              {/* Date */}
              <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                {formatDate(app.created_at)}
              </td>

              {/* Resume */}
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="flex items-center space-x-1.5">
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition"
                    title="Preview Resume"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </a>
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    download={app.resume_filename}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </td>

              {/* Stage Badge & Dropdown */}
              <td className="py-4 px-4 whitespace-nowrap">
                <StageBadge
                  currentStage={app.stage}
                  validNextStages={app.valid_next_stages}
                  onStageChange={(newStage) => onStageChange(app.id, newStage)}
                  interactive={true}
                />

              </td>

              {/* Actions */}
              <td className="py-4 px-4 text-right whitespace-nowrap">
                <button
                  onClick={() => onInspect(app.id)}
                  className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Inspect
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

