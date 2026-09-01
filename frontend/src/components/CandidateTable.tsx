import React from 'react';
import {
  ExternalLink,
  Download,
  Eye,
  User
} from 'lucide-react';
import { StageBadge } from './StageBadge';
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
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Filtering candidates...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Candidates Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No candidates matched your current job and stage filters. Try adjusting or clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Candidate</th>
              <th className="py-3.5 px-4">Applied Role</th>
              <th className="py-3.5 px-4">Submission Date</th>
              <th className="py-3.5 px-4">Resume</th>
              <th className="py-3.5 px-4">Stage</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/60 transition group">
                {/* Candidate Info */}
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm">{app.candidate_name}</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">{app.candidate_email}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">{app.candidate_phone}</span>
                  </div>
                </td>

                {/* Job Role */}
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {app.job_title || 'Position'}
                    </span>
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md w-fit mt-1">
                      {app.job_department || 'General'}
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
                      href={`/api/admin/applications/${app.id}/resume`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition"
                      title="Preview Resume"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </a>
                    <a
                      href={`/api/admin/applications/${app.id}/resume`}
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
    </div>
  );
};
