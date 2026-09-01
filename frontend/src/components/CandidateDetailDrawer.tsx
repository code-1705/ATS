import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  ExternalLink,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  History,
  Loader2
} from 'lucide-react';
import { getApplicationDetails, updateApplicationStage, getResumeDownloadUrl } from '../services/adminApi';
import type { ApplicationDetailResponse, ApplicationStage } from '../types';
import { StageBadge } from './StageBadge';

interface CandidateDetailDrawerProps {
  applicationId: string | null;
  onClose: () => void;
  onStageUpdated: () => void;
}

const STAGE_ACTION_CONFIG: Record<
  string,
  { label: string; bg: string; hover: string; text: string; icon: 'check' | 'reject' | 'clock' }
> = {
  APPLIED: {
    label: 'Re-open to Applied',
    bg: 'bg-slate-700',
    hover: 'hover:bg-slate-800',
    text: 'text-white',
    icon: 'clock'
  },
  R1: {
    label: 'Advance to R1',
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-white',
    icon: 'check'
  },
  R1_REJECT: {
    label: 'R1 Reject',
    bg: 'bg-orange-600',
    hover: 'hover:bg-orange-700',
    text: 'text-white',
    icon: 'reject'
  },
  R2: {
    label: 'Advance to R2',
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-white',
    icon: 'check'
  },
  R2_REJECT: {
    label: 'R2 Reject',
    bg: 'bg-amber-600',
    hover: 'hover:bg-amber-700',
    text: 'text-white',
    icon: 'reject'
  },
  R3: {
    label: 'Advance to R3',
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    text: 'text-white',
    icon: 'check'
  },
  R3_REJECT: {
    label: 'R3 Reject',
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-white',
    icon: 'reject'
  },
  APPROVED: {
    label: 'Approve Candidate',
    bg: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-white',
    icon: 'check'
  },
  REJECT: {
    label: 'Reject Candidate',
    bg: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    text: 'text-white',
    icon: 'reject'
  }
};

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  applicationId,
  onClose,
  onStageUpdated
}) => {
  const [app, setApp] = useState<ApplicationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      loadDetails(applicationId);
    }
  }, [applicationId]);

  const loadDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicationDetails(id);
      setApp(data);
    } catch {
      setError('Unable to load candidate details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage: ApplicationStage) => {
    if (!app) return;
    setUpdatingStage(true);
    try {
      await updateApplicationStage(app.id, newStage);
      await loadDetails(app.id);
      onStageUpdated();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update stage.');
    } finally {
      setUpdatingStage(false);
    }
  };

  if (!applicationId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {app?.job_department || 'Application Details'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {loading ? 'Loading Dossier...' : app?.candidate_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs">Fetching candidate details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              {error}
            </div>
          ) : app ? (
            <>
              {/* Quick Status Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Current Hiring Stage</span>
                  <StageBadge
                    currentStage={app.stage}
                    validNextStages={app.valid_next_stages}
                    onStageChange={handleStageChange}
                    interactive={true}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 px-3 py-2 rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Preview Resume
                  </a>
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    download={app.resume_filename}
                    className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </a>
                </div>
              </div>

              {/* Stage Quick Progression Action Bar */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                  Quick Stage Actions
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(!app.valid_next_stages || app.valid_next_stages.length === 0) ? (
                    <span className="text-xs text-slate-500 italic">
                      No further stage transitions available (terminal stage).
                    </span>
                  ) : (
                    app.valid_next_stages.map((nextStage) => {
                      const actionConfig = STAGE_ACTION_CONFIG[nextStage] || {
                        label: `Move to ${nextStage}`,
                        bg: 'bg-indigo-600',
                        hover: 'hover:bg-indigo-700',
                        text: 'text-white',
                        icon: 'check'
                      };
                      return (
                        <button
                          key={nextStage}
                          onClick={() => handleStageChange(nextStage)}
                          disabled={updatingStage}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg ${actionConfig.bg} ${actionConfig.text} ${actionConfig.hover} text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {actionConfig.icon === 'check' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                          {actionConfig.icon === 'reject' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                          {actionConfig.icon === 'clock' && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                          {actionConfig.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" /> Full Name
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{app.candidate_name}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1" /> Email Address
                  </span>
                  <a
                    href={`mailto:${app.candidate_email}`}
                    className="text-sm font-semibold text-indigo-600 hover:underline truncate block"
                  >
                    {app.candidate_email}
                  </a>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1" /> Phone Number
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{app.candidate_phone}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1" /> Applied Position
                  </span>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {app.job_title || 'Position'}
                  </p>
                </div>
              </div>

              {/* Candidate Note */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Candidate Note / Cover Message
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[80px]">
                  {app.brief_note ? app.brief_note : <span className="text-slate-400 italic">No note submitted.</span>}
                </div>
              </div>

              {/* Audit History Timeline */}
              {app.audit_logs && app.audit_logs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <History className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    Stage Audit Trail ({app.audit_logs.length})
                  </h3>
                  <div className="space-y-2">
                    {app.audit_logs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-700">{log.from_stage}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-indigo-600">{log.to_stage}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
