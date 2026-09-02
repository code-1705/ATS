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
      <div className="flex flex-col items-center justify-center p-12 text-[var(--text-muted)]">
        <div
          style={{ borderColor: 'var(--primary, #da7756)', borderTopColor: 'transparent' }}
          className="w-8 h-8 border-4 rounded-full animate-spin mb-4"
        />
        <p className="text-sm font-medium">Loading candidate pipeline...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[var(--border-color)] text-center shadow-xs">
        <div className="w-12 h-12 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center text-[var(--text-dim)] mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-main)] mb-1">No candidates found</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-sm">
          There are no applications matching your selected filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-[var(--border-color)] shadow-xs">
      <table className="w-full text-left text-sm text-[var(--text-muted)]">
        <thead className="bg-[var(--bg-card-hover)] border-b border-[var(--border-color)] text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
          <tr>
            <th className="py-3.5 px-4">Candidate</th>
            <th className="py-3.5 px-4">Applied Role</th>
            <th className="py-3.5 px-4">Submitted</th>
            <th className="py-3.5 px-4">Resume</th>
            <th className="py-3.5 px-4">Pipeline Stage</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
              {/* Candidate Info */}
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div
                    style={{
                      backgroundColor: 'rgba(218, 119, 86, 0.12)',
                      borderColor: 'rgba(218, 119, 86, 0.25)',
                      color: 'var(--primary, #da7756)',
                    }}
                    className="w-9 h-9 rounded-full border font-bold flex items-center justify-center text-xs shrink-0"
                  >
                    {app.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <span className="font-bold text-[var(--text-main)] block">
                      {app.candidate_name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block">
                      {app.candidate_email}
                    </span>
                  </div>
                </div>
              </td>

              {/* Job Info */}
              <td className="py-4 px-4">
                <div>
                  <span className="font-semibold text-[var(--text-main)] block">
                    {app.job_title}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] block">
                    {app.job_department}
                  </span>
                </div>
              </td>

              {/* Date */}
              <td className="py-4 px-4 text-[var(--text-muted)] whitespace-nowrap">
                {formatDate(app.created_at)}
              </td>

              {/* Resume */}
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="flex items-center space-x-1.5">
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      backgroundColor: 'rgba(218, 119, 86, 0.08)',
                      borderColor: 'rgba(218, 119, 86, 0.25)',
                      color: 'var(--primary, #da7756)',
                    }}
                    className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition hover:opacity-80"
                    title="Preview Resume"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </a>
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    download={app.resume_filename}
                    className="p-1.5 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition"
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
                  className="inline-flex items-center text-xs font-semibold text-[var(--text-main)] hover:text-[var(--primary)] bg-white hover:bg-[var(--bg-card-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] shadow-xs transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5 text-[var(--text-dim)]" />
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

