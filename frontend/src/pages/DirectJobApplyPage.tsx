import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { JobDetailsCard } from '../components/JobDetailsCard';
import { ResumeDropzone } from '../components/ResumeDropzone';
import { SuccessModal } from '../components/SuccessModal';
import { getJobDetails, submitTargetedJobApplication } from '../services/api';
import type { Job, ApplicationResponse } from '../types';
import {
  User,
  Phone,
  Mail,
  Send,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Briefcase,
  Globe,
  Building2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const DirectJobApplyPage: React.FC = () => {
  const { job_id } = useParams<{ job_id: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successApplication, setSuccessApplication] = useState<ApplicationResponse | null>(null);

  // Stepper State (Step 1: Contact, Step 2: Experience & Links, Step 3: Resume & Work Auth)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Personal / Contact Details
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  // Step 2: Experience & Professional Profiles
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentCompany, setCurrentCompany] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<string>('3-5');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');

  // Step 3: Resume, Work Authorization & Notes
  const [resume, setResume] = useState<File | null>(null);
  const [workAuth, setWorkAuth] = useState<string>('authorized');
  const [noticePeriod, setNoticePeriod] = useState<string>('immediate');
  const [note, setNote] = useState<string>('');

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadJob = useCallback(async (id: string) => {
    setLoadingJob(true);
    try {
      const data = await getJobDetails(id);
      if (!data.is_active) {
        setErrorMessage('This position is archived and no longer accepting applications.');
        setJob(null);
      } else {
        setJob(data);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Job position not found or no longer active.');
    } finally {
      setLoadingJob(false);
    }
  }, []);

  useEffect(() => {
    if (job_id) {
      loadJob(job_id);
    }
  }, [job_id, loadJob]);

  // Validation per step
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full Name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().length < 7) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!location.trim()) {
      errs.location = 'Current location / city is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (linkedinUrl.trim() && !/^https?:\/\//i.test(linkedinUrl)) {
      errs.linkedinUrl = 'URL must start with http:// or https://';
    }
    if (portfolioUrl.trim() && !/^https?:\/\//i.test(portfolioUrl)) {
      errs.portfolioUrl = 'URL must start with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!resume) errs.resume = 'Please upload your resume (PDF/DOCX)';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!job_id) return;
    if (!validateStep3()) return;

    setSubmitting(true);
    try {
      // Compose comprehensive production metadata into brief_note
      const structuredDetails = [
        note.trim(),
        location ? `Current Location: ${location}` : '',
        currentTitle ? `Current Title: ${currentTitle}${currentCompany ? ` at ${currentCompany}` : ''}` : '',
        experienceYears ? `Total Experience: ${experienceYears} years` : '',
        linkedinUrl ? `LinkedIn: ${linkedinUrl}` : '',
        portfolioUrl ? `Portfolio/GitHub: ${portfolioUrl}` : '',
        workAuth ? `Work Authorization: ${workAuth}` : '',
        noticePeriod ? `Notice Period: ${noticePeriod}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const result = await submitTargetedJobApplication(job_id, {
        candidate_name: name,
        candidate_email: email,
        candidate_phone: phone,
        brief_note: structuredDetails,
        resume: resume!,
      });
      setSuccessApplication(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to submit application. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setCurrentTitle('');
    setCurrentCompany('');
    setExperienceYears('3-5');
    setLinkedinUrl('');
    setPortfolioUrl('');
    setResume(null);
    setWorkAuth('authorized');
    setNoticePeriod('immediate');
    setNote('');
    setErrors({});
    setCurrentStep(1);
    setSuccessApplication(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/apply"
            className="inline-flex items-center text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to All Available Roles
          </Link>
        </div>

        {/* Global Loading / Error States */}
        {loadingJob ? (
          <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] shadow-xs">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-[var(--primary)]" />
            Loading job details and application portal...
          </div>
        ) : errorMessage && !job ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : job ? (
          /* =========================================================================
              2-COLUMN LAYOUT: JOB DETAILS ON LEFT, MULTI-STEP APPLY ON RIGHT
              ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Role Overview & Job Details */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl border border-[var(--border-color)] p-6 sm:p-7 shadow-xs space-y-6">
                {/* Unified Job Specs Card */}
                <JobDetailsCard job={job} showActiveBadge={true} />

                {/* Candidate Placement Perks */}
                <div className="pt-5 border-t border-[var(--border-color)] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                    Placement Process Guarantees
                  </h4>
                  <ul className="text-xs text-[var(--text-muted)] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span><strong>Direct Manager Review:</strong> Profile presented directly to engineering decision-makers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span><strong>Fast Response:</strong> Initial feedback delivered within 48 business hours.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span><strong>100% Free:</strong> No placement fees or deductions for candidates.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Multi-Step Application Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-[var(--border-color)] shadow-xs overflow-hidden">
                {/* Stepper Header */}
                <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                      Step {currentStep} of 3
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      {currentStep === 1 && 'Personal Information'}
                      {currentStep === 2 && 'Experience & Profiles'}
                      {currentStep === 3 && 'Resume & Authorization'}
                    </span>
                  </div>

                  {/* Visual Stepper Progress Bar */}
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      style={{ backgroundColor: currentStep >= 1 ? 'var(--primary, #da7756)' : 'var(--border-color, #e6e4dc)' }}
                      className="h-1.5 rounded-full transition-all duration-300"
                    />
                    <div
                      style={{ backgroundColor: currentStep >= 2 ? 'var(--primary, #da7756)' : 'var(--border-color, #e6e4dc)' }}
                      className="h-1.5 rounded-full transition-all duration-300"
                    />
                    <div
                      style={{ backgroundColor: currentStep >= 3 ? 'var(--primary, #da7756)' : 'var(--border-color, #e6e4dc)' }}
                      className="h-1.5 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* =========================================================================
                      STEP 1: PERSONAL / CONTACT DETAILS
                      ========================================================================= */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-main)]">Personal Details</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          How client hiring leads will contact and identify you.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. Jane Doe"
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                                setErrors((prev) => ({ ...prev, name: '' }));
                              }}
                              className={`w-full bg-[var(--bg-card-hover)] border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition ${
                                errors.name ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
                              }`}
                            />
                            <User className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="jane.doe@example.com"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((prev) => ({ ...prev, email: '' }));
                              }}
                              className={`w-full bg-[var(--bg-card-hover)] border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition ${
                                errors.email ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
                              }`}
                            />
                            <Mail className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                          {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              placeholder="+1 (555) 000-0000"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                setErrors((prev) => ({ ...prev, phone: '' }));
                              }}
                              className={`w-full bg-[var(--bg-card-hover)] border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition ${
                                errors.phone ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
                              }`}
                            />
                            <Phone className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                          {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Current Location / City <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. San Francisco, CA or Bangalore, India"
                              value={location}
                              onChange={(e) => {
                                setLocation(e.target.value);
                                setErrors((prev) => ({ ...prev, location: '' }));
                              }}
                              className={`w-full bg-[var(--bg-card-hover)] border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition ${
                                errors.location ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
                              }`}
                            />
                            <MapPin className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                          {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
                        </div>
                      </div>

                      {/* Step 1 Actions */}
                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNext}
                          style={{
                            backgroundColor: 'var(--primary, #da7756)',
                            boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
                          }}
                          className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 transition cursor-pointer"
                        >
                          <span>Next: Experience & Links</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      STEP 2: EXPERIENCE & PROFESSIONAL PROFILES
                      ========================================================================= */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-main)]">Experience & Profiles</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Help partner companies evaluate your seniority and code repositories.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Current Job Title */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Current or Recent Job Title
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. Senior Software Engineer"
                              value={currentTitle}
                              onChange={(e) => setCurrentTitle(e.target.value)}
                              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition"
                            />
                            <Briefcase className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                        </div>

                        {/* Current Company */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Current Company / Employer
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. Acme Corp / Stealth Startup"
                              value={currentCompany}
                              onChange={(e) => setCurrentCompany(e.target.value)}
                              className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition"
                            />
                            <Building2 className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                        </div>

                        {/* Years of Experience */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Relevant Years of Experience
                          </label>
                          <select
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition"
                          >
                            <option value="0-1">Less than 1 year (Junior / Entry)</option>
                            <option value="1-3">1 to 3 years (Mid-level)</option>
                            <option value="3-5">3 to 5 years (Senior)</option>
                            <option value="5-8">5 to 8 years (Staff / Lead)</option>
                            <option value="8+">8+ years (Principal / Architect)</option>
                          </select>
                        </div>

                        {/* LinkedIn Profile */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            LinkedIn Profile URL <span className="text-xs font-normal text-[var(--text-muted)]">(Recommended)</span>
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              placeholder="https://linkedin.com/in/username"
                              value={linkedinUrl}
                              onChange={(e) => {
                                setLinkedinUrl(e.target.value);
                                setErrors((prev) => ({ ...prev, linkedinUrl: '' }));
                              }}
                              className={`w-full bg-[var(--bg-card-hover)] border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition ${
                                errors.linkedinUrl ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
                              }`}
                            />
                            <Globe className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                          {errors.linkedinUrl && <p className="text-xs text-rose-600 mt-1">{errors.linkedinUrl}</p>}
                        </div>

                        {/* GitHub / Portfolio */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            GitHub / Portfolio / Personal Website <span className="text-xs font-normal text-[var(--text-muted)]">(Recommended)</span>
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              placeholder="https://github.com/username or https://yourportfolio.com"
                              value={portfolioUrl}
                              onChange={(e) => {
                                setPortfolioUrl(e.target.value);
                                setErrors((prev) => ({ ...prev, portfolioUrl: '' }));
                              }}
                              className={`w-full bg-[var(--bg-card-hover)] border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition ${
                                errors.portfolioUrl ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[var(--border-color)]'
                              }`}
                            />
                            <Globe className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-3" />
                          </div>
                          {errors.portfolioUrl && <p className="text-xs text-rose-600 mt-1">{errors.portfolioUrl}</p>}
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-white text-xs sm:text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          style={{
                            backgroundColor: 'var(--primary, #da7756)',
                            boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
                          }}
                          className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 transition cursor-pointer"
                        >
                          <span>Next: Resume & Work Auth</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      STEP 3: RESUME, WORK AUTHORIZATION & NOTES
                      ========================================================================= */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-main)]">Resume & Authorization</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Upload your resume and confirm availability for this position.
                        </p>
                      </div>

                      {/* Resume Upload Dropzone */}
                      <ResumeDropzone
                        selectedFile={resume}
                        onFileSelect={(file) => {
                          setResume(file);
                          setErrors((prev) => ({ ...prev, resume: '' }));
                        }}
                        error={errors.resume}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Work Authorization */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Work Authorization Status
                          </label>
                          <select
                            value={workAuth}
                            onChange={(e) => setWorkAuth(e.target.value)}
                            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition"
                          >
                            <option value="authorized">Authorized to work (No sponsorship needed)</option>
                            <option value="sponsorship_needed">Will require Visa Sponsorship</option>
                            <option value="remote_contract">Open to Remote / Contract Placement</option>
                          </select>
                        </div>

                        {/* Notice Period */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--text-main)]">
                            Availability / Notice Period
                          </label>
                          <select
                            value={noticePeriod}
                            onChange={(e) => setNoticePeriod(e.target.value)}
                            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition"
                          >
                            <option value="immediate">Immediate (Ready to start)</option>
                            <option value="2_weeks">2 Weeks</option>
                            <option value="1_month">1 Month</option>
                            <option value="2_months_plus">2+ Months</option>
                          </select>
                        </div>
                      </div>

                      {/* Brief Cover Note */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[var(--text-main)]">
                          Brief Note / Standout Projects <span className="text-xs font-normal text-[var(--text-muted)]">(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Share highlights of your architecture work, notable achievements, or why you're excited for this role..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-3 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition"
                        />
                      </div>

                      {/* Step 3 Actions */}
                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-white text-xs sm:text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                        >
                          ← Back
                        </button>

                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            backgroundColor: 'var(--primary, #da7756)',
                            boxShadow: '0 2px 10px rgba(218, 119, 86, 0.25)',
                          }}
                          className="w-full sm:w-auto min-w-[220px] flex items-center justify-center py-3 px-6 rounded-xl text-white font-bold text-xs sm:text-sm hover:opacity-95 focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting Application...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Application for {job.title}
                            </>
                          )}
                        </button>
                      </div>

                      <div className="pt-2 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Encrypted candidate dossier • Direct client hiring lead review</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Success Confirmation Modal */}
      {successApplication && (
        <SuccessModal
          application={successApplication}
          onReset={handleResetForm}
        />
      )}
    </div>
  );
};
