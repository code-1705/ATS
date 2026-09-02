import React from 'react';
import type { Job } from '../types';
import { MapPin, Clock, Building2, Calendar, DollarSign, Tag, Briefcase } from 'lucide-react';
import { parseJobDescription } from '../utils/jobMetadata';

interface JobDetailsCardProps {
  job: Job;
  showActiveBadge?: boolean;
}

export const JobDetailsCard: React.FC<JobDetailsCardProps> = ({ job, showActiveBadge = false }) => {
  const meta = parseJobDescription(job.description);

  return (
    <div className="space-y-5">
      {/* Header & Badges */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={{
                backgroundColor: 'rgba(218, 119, 86, 0.1)',
                borderColor: 'rgba(218, 119, 86, 0.25)',
                color: 'var(--primary, #da7756)',
              }}
              className="text-[0.72rem] font-bold uppercase tracking-wider border px-3 py-1 rounded-full"
            >
              {job.department || 'General'}
            </span>

            {meta.companyName && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)] bg-[var(--bg-card-hover)] px-3 py-1 rounded-full border border-[var(--border-color)] shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{meta.companyName}</span>
              </span>
            )}
          </div>

          {(showActiveBadge || job.is_active) && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Actively Hiring
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          {job.title}
        </h2>

        {/* Quick Location & Type Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-muted)] pt-1">
          <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] shadow-2xs">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
            {job.location || 'Remote'}
          </span>
          <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] shadow-2xs">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
            {job.job_type || 'Full-Time'}
          </span>
          {meta.workplaceType && (
            <span className="inline-flex items-center bg-[var(--bg-card-hover)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] shadow-2xs">
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
              {meta.workplaceType}
            </span>
          )}
        </div>
      </div>

      {/* Structured Metrics (Spacious 2-Column Layout, No Truncation) */}
      {(meta.startDate || meta.endDate || meta.salaryRange || meta.experienceLevel) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--border-color)]">
          {(meta.startDate || meta.endDate) && (
            <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl p-3.5 flex items-start space-x-3 shadow-2xs">
              <div className="p-2 rounded-xl bg-white border border-[var(--border-color)] text-[var(--primary)] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                  Application Timeline
                </span>
                <span className="text-xs font-bold text-[var(--text-main)] block mt-0.5 leading-snug">
                  {meta.startDate ? new Date(meta.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open'}
                  {' — '}
                  {meta.endDate ? new Date(meta.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Rolling'}
                </span>
              </div>
            </div>
          )}

          {meta.experienceLevel && (
            <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl p-3.5 flex items-start space-x-3 shadow-2xs">
              <div className="p-2 rounded-xl bg-white border border-[var(--border-color)] text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                  Seniority Level
                </span>
                <span className="text-xs font-bold text-[var(--text-main)] block mt-0.5 leading-snug">
                  {meta.experienceLevel}
                </span>
              </div>
            </div>
          )}

          {meta.salaryRange && (
            <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl p-3.5 flex items-start space-x-3 shadow-2xs sm:col-span-2">
              <div className="p-2 rounded-xl bg-white border border-[var(--border-color)] text-emerald-600 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                  Target Compensation
                </span>
                <span className="text-xs font-bold text-emerald-700 block mt-0.5 leading-snug">
                  {meta.salaryRange}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Badges */}
      {meta.skills && meta.skills.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[var(--border-color)]">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
            Key Tech Stack & Requirements
          </span>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {meta.skills.map((skill, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: 'rgba(218, 119, 86, 0.08)',
                  color: 'var(--primary, #da7756)',
                  borderColor: 'rgba(218, 119, 86, 0.25)',
                }}
                className="text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description Content */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-color)]">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
          Role Overview & Expectations
        </span>
        <div className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--border-color)]">
          {meta.cleanDescription || job.description}
        </div>
      </div>
    </div>
  );
};
