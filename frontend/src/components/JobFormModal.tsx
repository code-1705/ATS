import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  Globe,
  Loader2,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sliders,
} from 'lucide-react';
import type { Job, JobCreatePayload, JobUpdatePayload } from '../types';
import { parseJobDescription, serializeJobDescription } from '../utils/jobMetadata';

interface JobFormModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: JobCreatePayload | JobUpdatePayload) => Promise<void>;
}

type TabType = 'basics' | 'requirements' | 'description';

export const JobFormModal: React.FC<JobFormModalProps> = ({
  job,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basics');

  // Fundamentals
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState('Full-Time');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [isActive, setIsActive] = useState(true);

  // Client/Partner Company
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Timeline
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Skills & Requirements
  const [skillsInput, setSkillsInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [salaryRange, setSalaryRange] = useState('');

  // Description
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setDepartment(job.department || '');
      setLocation(job.location || 'Remote');
      setJobType(job.job_type || 'Full-Time');
      setIsActive(job.is_active !== undefined ? job.is_active : true);

      // Parse existing structured metadata
      const parsed = parseJobDescription(job.description);
      setCompanyName(parsed.companyName || '');
      setCompanyWebsite(parsed.companyWebsite || '');
      setStartDate(parsed.startDate || '');
      setEndDate(parsed.endDate || '');
      setSkillsInput(parsed.skills.join(', '));
      setExperienceLevel(parsed.experienceLevel || 'Senior');
      setSalaryRange(parsed.salaryRange || '');
      setWorkplaceType(parsed.workplaceType || 'Remote');
      setDescription(parsed.cleanDescription || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      setTitle('');
      setDepartment('Engineering');
      setLocation('Remote');
      setJobType('Full-Time');
      setWorkplaceType('Remote');
      setCompanyName('');
      setCompanyWebsite('');
      setStartDate(today);
      setEndDate(thirtyDaysLater);
      setSkillsInput('');
      setExperienceLevel('Senior');
      setSalaryRange('');
      setDescription('');
      setIsActive(true);
    }
    setActiveTab('basics');
    setError(null);
  }, [job, isOpen]);

  if (!isOpen) return null;

  const validateBasics = () => {
    if (!companyName.trim()) {
      setError('Partner Company Name is required.');
      return false;
    }
    if (!title.trim()) {
      setError('Job Title is required.');
      return false;
    }
    if (!department.trim()) {
      setError('Department is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateAll = () => {
    if (!validateBasics()) {
      setActiveTab('basics');
      return false;
    }
    if (!description.trim()) {
      setError('Job Description & Responsibilities are required.');
      setActiveTab('description');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Serialize metadata and clean description
    const fullDescription = serializeJobDescription(
      {
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        skills,
        salaryRange: salaryRange.trim(),
        experienceLevel: experienceLevel.trim(),
        workplaceType: workplaceType.trim(),
      },
      description.trim()
    );

    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        job_type: jobType,
        description: fullDescription,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save job details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-10 space-y-7 border border-[var(--border-color)] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-5 shrink-0">
          <div className="flex items-center space-x-4">
            <div
              style={{
                backgroundColor: 'rgba(218, 119, 86, 0.12)',
                color: 'var(--primary, #da7756)',
              }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs border border-[var(--primary)]/20"
            >
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
                {job ? 'Edit Partner Job Opening' : 'Create New Partner Job Opening'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                Configure partner company details, role specifications, candidate skills, and deadlines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'basics'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Company & Role</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateBasics()) setActiveTab('requirements');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'requirements'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Skills & Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'description'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Description & Status</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-[var(--danger-bg)] border border-rose-200 text-[var(--danger)] text-xs sm:text-sm rounded-xl shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* =========================================================================
              TAB 1: COMPANY & ROLE DETAILS
              ========================================================================= */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              {/* Partner Company Card */}
              <div className="p-6 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  <Building2 className="w-4 h-4" />
                  <span>Partner / Client Company</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stripe, Anthropic, Scale AI"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-white border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                      />
                      <Building2 className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Company Website / Domain <span className="text-xs font-normal normal-case text-[var(--text-muted)]">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://stripe.com"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full bg-white border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                      />
                      <Globe className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  <Layers className="w-4 h-4 text-[var(--primary)]" />
                  <span>Position Fundamentals</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Full-Stack Engineer (React + FastAPI)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs font-medium"
                    />
                    <Briefcase className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Department / Function <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineering, AI & Intelligence, Product"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Employment Type
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 cursor-pointer transition shadow-xs"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Workplace Mode
                    </label>
                    <select
                      value={workplaceType}
                      onChange={(e) => setWorkplaceType(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 cursor-pointer transition shadow-xs"
                    >
                      <option value="Remote">Remote (Worldwide)</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-Site">On-Site</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Location / Region Details
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Remote or San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-white border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                      />
                      <MapPin className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab 1 Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateBasics()) setActiveTab('requirements');
                  }}
                  style={{
                    backgroundColor: 'var(--primary, #da7756)',
                    boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
                  }}
                  className="px-6 py-3 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 transition cursor-pointer"
                >
                  <span>Next: Skills & Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: REQUIREMENTS, SKILLS & TIMELINE
              ========================================================================= */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {/* Timeline & Compensation */}
              <div className="p-6 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  <Calendar className="w-4 h-4" />
                  <span>Timeline & Compensation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                      Opening / Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Salary / Compensation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $140k - $180k / yr"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Experience Level */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  <Tag className="w-4 h-4 text-[var(--primary)]" />
                  <span>Candidate Qualifications & Skills</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Target Seniority / Experience Level
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 cursor-pointer transition shadow-xs"
                    >
                      <option value="Entry">Junior / Entry Level (0-2 years)</option>
                      <option value="Mid">Mid-Level Engineer (2-4 years)</option>
                      <option value="Senior">Senior Engineer / Builder (5+ years)</option>
                      <option value="Staff/Lead">Staff / Technical Lead (8+ years)</option>
                      <option value="Principal">Principal / Architect (10+ years)</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Required Skills & Tech Stack <span className="text-xs font-normal normal-case text-[var(--text-muted)]">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, TypeScript, FastAPI, PostgreSQL, Docker, Redis, Kubernetes"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="w-full bg-white border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs"
                    />
                    {skillsInput.trim() && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {skillsInput
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: 'rgba(218, 119, 86, 0.1)',
                                color: 'var(--primary, #da7756)',
                                borderColor: 'rgba(218, 119, 86, 0.25)',
                              }}
                              className="text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab 2 Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('basics')}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-white text-xs sm:text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back: Company & Role
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  style={{
                    backgroundColor: 'var(--primary, #da7756)',
                    boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
                  }}
                  className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 transition cursor-pointer"
                >
                  <span>Next: Description & Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: DESCRIPTION & HIRING STATUS
              ========================================================================= */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  Job Description & Core Responsibilities <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Detail the engineering challenges, role mission, core deliverables, team culture, and interview expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[var(--border-color)] rounded-2xl p-4 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 transition shadow-xs leading-relaxed"
                />
              </div>

              {/* Hiring Status Toggle */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-color)]">
                <div>
                  <span className="text-sm font-bold text-[var(--text-main)] block">Active Hiring Status</span>
                  <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                    {isActive
                      ? 'Role is active and visible on the public candidate placement portal'
                      : 'Role is archived and hidden from public applications'}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    style={{
                      backgroundColor: isActive ? 'var(--primary, #da7756)' : undefined,
                    }}
                    className="w-12 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  />
                </label>
              </div>

              {/* Tab 3 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('requirements')}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-white text-xs sm:text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back: Skills & Timeline
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    backgroundColor: 'var(--primary, #da7756)',
                    boxShadow: '0 2px 10px rgba(218, 119, 86, 0.25)',
                  }}
                  className="inline-flex items-center px-8 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Role...
                    </>
                  ) : job ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Publish Job Opening
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
