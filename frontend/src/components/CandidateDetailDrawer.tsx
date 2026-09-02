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
  Loader2,
  MapPin,
  ShieldCheck,
  Zap,
  Globe,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { getApplicationDetails, updateApplicationStage, getResumeDownloadUrl } from '../services/adminApi';
import type { ApplicationDetailResponse, ApplicationStage } from '../types';
import { StageBadge } from './StageBadge';

interface CandidateDetailDrawerProps {
  applicationId: string | null;
  onClose: () => void;
  onStageUpdated: () => void;
}

interface ParsedCandidateDetails {
  location?: string;
  currentTitle?: string;
  experience?: string;
  workAuth?: string;
  noticePeriod?: string;
  linkedin?: string;
  portfolio?: string;
  customNote?: string;
}

function parseCandidateNote(rawNote?: string | null): ParsedCandidateDetails {
  if (!rawNote) return {};
  const lines = rawNote.split('\n');
  const details: ParsedCandidateDetails = {};
  const customLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Current Location:')) {
      details.location = trimmed.replace('Current Location:', '').trim();
    } else if (trimmed.startsWith('Current Title:')) {
      details.currentTitle = trimmed.replace('Current Title:', '').trim();
    } else if (trimmed.startsWith('Total Experience:')) {
      details.experience = trimmed.replace('Total Experience:', '').trim();
    } else if (trimmed.startsWith('Work Authorization:')) {
      const val = trimmed.replace('Work Authorization:', '').trim();
      details.workAuth =
        val === 'authorized'
          ? 'Authorized (No sponsorship needed)'
          : val === 'sponsorship_needed'
          ? 'Requires Visa Sponsorship'
          : val === 'remote_contract'
          ? 'Open to Remote / Contract'
          : val;
    } else if (trimmed.startsWith('Notice Period:')) {
      const val = trimmed.replace('Notice Period:', '').trim();
      details.noticePeriod =
        val === 'immediate'
          ? 'Immediate (Ready to start)'
          : val === '2_weeks'
          ? '2 Weeks'
          : val === '1_month'
          ? '1 Month'
          : val === '2_months_plus'
          ? '2+ Months'
          : val;
    } else if (trimmed.startsWith('LinkedIn:')) {
      details.linkedin = trimmed.replace('LinkedIn:', '').trim();
    } else if (trimmed.startsWith('Portfolio/GitHub:') || trimmed.startsWith('Portfolio:')) {
      details.portfolio = trimmed.replace(/Portfolio(\/GitHub)?:/, '').trim();
    } else if (trimmed) {
      customLines.push(trimmed);
    }
  }

  if (customLines.length > 0) {
    details.customNote = customLines.join('\n');
  }

  return details;
}

const STAGE_ACTION_CONFIG: Record<
  string,
  { label: string; bg: string; hover: string; text: string; border: string; icon: 'check' | 'reject' | 'clock' }
> = {
  APPLIED: {
    label: 'Re-open to Applied',
    bg: 'bg-slate-100',
    hover: 'hover:bg-slate-200',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: 'clock'
  },
  R1: {
    label: 'Advance to R1',
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'check'
  },
  R1_REJECT: {
    label: 'R1 Reject',
    bg: 'bg-orange-50',
    hover: 'hover:bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'reject'
  },
  R2: {
    label: 'Advance to R2',
    bg: 'bg-indigo-50',
    hover: 'hover:bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: 'check'
  },
  R2_REJECT: {
    label: 'R2 Reject',
    bg: 'bg-amber-50',
    hover: 'hover:bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'reject'
  },
  R3: {
    label: 'Advance to R3',
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: 'check'
  },
  R3_REJECT: {
    label: 'R3 Reject',
    bg: 'bg-red-50',
    hover: 'hover:bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'reject'
  },
  APPROVED: {
    label: 'Approve Candidate',
    bg: 'bg-emerald-50',
    hover: 'hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: 'check'
  },
  REJECT: {
    label: 'Reject Candidate',
    bg: 'bg-rose-50',
    hover: 'hover:bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  useEffect(() => {
    if (applicationId) {
      loadDetails(applicationId);
    }
  }, [applicationId]);

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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!applicationId) return null;

  const parsedDetails = app ? parseCandidateNote(app.brief_note) : {};
  const hasStructuredDetails =
    parsedDetails.location ||
    parsedDetails.currentTitle ||
    parsedDetails.experience ||
    parsedDetails.workAuth ||
    parsedDetails.noticePeriod ||
    parsedDetails.linkedin ||
    parsedDetails.portfolio;

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-[var(--border-color)] overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card-hover)] flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div
              style={{
                backgroundColor: 'rgba(218, 119, 86, 0.15)',
                color: 'var(--primary, #da7756)',
              }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 border border-[var(--primary)]/20 shadow-xs"
            >
              {loading ? '...' : getInitials(app?.candidate_name)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: 'rgba(218, 119, 86, 0.1)',
                    borderColor: 'rgba(218, 119, 86, 0.25)',
                    color: 'var(--primary, #da7756)',
                  }}
                  className="text-[0.7rem] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full"
                >
                  {app?.job_department || 'General'}
                </span>
                <span className="text-xs text-[var(--text-dim)]">•</span>
                <span className="text-xs text-[var(--text-muted)]">Candidate Dossier</span>
              </div>

              <h2 className="text-xl font-extrabold text-[var(--text-main)] tracking-tight">
                {loading ? 'Loading Candidate...' : app?.candidate_name}
              </h2>

              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="font-semibold text-[var(--text-main)]">{app?.job_title || 'Position'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mb-2" />
              <p className="text-xs font-semibold">Fetching candidate profile...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-[var(--danger-bg)] border border-rose-200 text-[var(--danger)] rounded-xl text-sm flex items-center space-x-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          ) : app ? (
            <>
              {/* Quick Status Bar & Resume Actions */}
              <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Hiring Pipeline Stage
                  </span>
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
                    style={{
                      backgroundColor: 'rgba(218, 119, 86, 0.08)',
                      borderColor: 'rgba(218, 119, 86, 0.25)',
                      color: 'var(--primary, #da7756)',
                    }}
                    className="inline-flex items-center text-xs font-bold border px-3 py-2 rounded-xl transition hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Preview Resume
                  </a>
                  <a
                    href={getResumeDownloadUrl(app.id)}
                    download={app.resume_filename}
                    className="inline-flex items-center text-xs font-bold text-[var(--text-main)] hover:text-[var(--primary)] bg-[var(--bg-card-hover)] hover:bg-slate-100 border border-[var(--border-color)] px-3 py-2 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </a>
                </div>
              </div>

              {/* Stage Quick Progression Action Bar */}
              <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                    Quick Stage Actions
                  </span>
                  {updatingStage && (
                    <span className="text-xs text-[var(--primary)] flex items-center gap-1 font-semibold">
                      <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-0.5">
                  {!app.valid_next_stages || app.valid_next_stages.length === 0 ? (
                    <span className="text-xs text-[var(--text-muted)] italic">
                      No further stage transitions available (terminal stage).
                    </span>
                  ) : (
                    app.valid_next_stages.map((nextStage) => {
                      const actionConfig = STAGE_ACTION_CONFIG[nextStage] || {
                        label: `Move to ${nextStage}`,
                        bg: 'bg-indigo-50',
                        hover: 'hover:bg-indigo-100',
                        text: 'text-indigo-700',
                        border: 'border-indigo-200',
                        icon: 'check',
                      };
                      return (
                        <button
                          key={nextStage}
                          onClick={() => handleStageChange(nextStage)}
                          disabled={updatingStage}
                          className={`inline-flex items-center px-3.5 py-1.5 rounded-xl border ${actionConfig.bg} ${actionConfig.text} ${actionConfig.border} ${actionConfig.hover} text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs`}
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

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" /> Full Name
                  </span>
                  <p className="text-sm font-bold text-[var(--text-main)]">{app.candidate_name}</p>
                </div>

                {/* Email */}
                <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" /> Email Address
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(app.candidate_email, 'email')}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer flex items-center gap-0.5"
                    >
                      {copiedField === 'email' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <a
                    href={`mailto:${app.candidate_email}`}
                    style={{ color: 'var(--primary, #da7756)' }}
                    className="text-sm font-bold hover:underline truncate block"
                  >
                    {app.candidate_email}
                  </a>
                </div>

                {/* Phone */}
                <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" /> Phone Number
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(app.candidate_phone, 'phone')}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer flex items-center gap-0.5"
                    >
                      {copiedField === 'phone' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <a
                    href={`tel:${app.candidate_phone}`}
                    className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--primary)] transition"
                  >
                    {app.candidate_phone}
                  </a>
                </div>

                {/* Applied Position */}
                <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" /> Applied Position
                  </span>
                  <p className="text-sm font-bold text-[var(--text-main)] truncate">
                    {app.job_title || 'Position'}
                  </p>
                </div>
              </div>

              {/* =========================================================================
                  PARSED PROFESSIONAL PROFILE & WORK AUTHORIZATION
                  ========================================================================= */}
              {hasStructuredDetails && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                    Professional Profile & Eligibility
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parsedDetails.currentTitle && (
                      <div className="bg-white border border-[var(--border-color)] rounded-xl p-3 flex items-start space-x-2.5 shadow-2xs">
                        <Briefcase className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Current Role
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {parsedDetails.currentTitle}
                          </span>
                        </div>
                      </div>
                    )}

                    {parsedDetails.location && (
                      <div className="bg-white border border-[var(--border-color)] rounded-xl p-3 flex items-start space-x-2.5 shadow-2xs">
                        <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Location
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {parsedDetails.location}
                          </span>
                        </div>
                      </div>
                    )}

                    {parsedDetails.experience && (
                      <div className="bg-white border border-[var(--border-color)] rounded-xl p-3 flex items-start space-x-2.5 shadow-2xs">
                        <Clock className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Experience
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {parsedDetails.experience}
                          </span>
                        </div>
                      </div>
                    )}

                    {parsedDetails.noticePeriod && (
                      <div className="bg-white border border-[var(--border-color)] rounded-xl p-3 flex items-start space-x-2.5 shadow-2xs">
                        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Notice / Availability
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {parsedDetails.noticePeriod}
                          </span>
                        </div>
                      </div>
                    )}

                    {parsedDetails.workAuth && (
                      <div className="sm:col-span-2 bg-white border border-[var(--border-color)] rounded-xl p-3 flex items-start space-x-2.5 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Work Authorization
                          </span>
                          <span className="text-xs font-bold text-[var(--text-main)]">
                            {parsedDetails.workAuth}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* External Profile Links */}
                  {(parsedDetails.linkedin || parsedDetails.portfolio) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {parsedDetails.linkedin && (
                        <a
                          href={parsedDetails.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-700 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                      )}
                      {parsedDetails.portfolio && (
                        <a
                          href={parsedDetails.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/70 text-purple-700 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Portfolio / GitHub</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Candidate Cover Note / Personal Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
                  Candidate Note / Cover Message
                </h3>
                <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-4 text-xs sm:text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-line min-h-[60px]">
                  {parsedDetails.customNote ? (
                    parsedDetails.customNote
                  ) : !hasStructuredDetails && app.brief_note ? (
                    app.brief_note
                  ) : (
                    <span className="text-[var(--text-dim)] italic">No additional cover message provided.</span>
                  )}
                </div>
              </div>

              {/* Stage Audit Trail */}
              {app.audit_logs && app.audit_logs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center">
                    <History className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
                    Stage Audit Trail ({app.audit_logs.length})
                  </h3>
                  <div className="space-y-2">
                    {app.audit_logs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-3 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[var(--text-muted)]">{log.from_stage}</span>
                          <span className="text-[var(--text-dim)]">→</span>
                          <span style={{ color: 'var(--primary, #da7756)' }} className="font-bold">
                            {log.to_stage}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
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
