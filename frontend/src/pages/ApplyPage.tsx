import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { JobSelectorDropdown } from '../components/JobSelectorDropdown';
import { JobDetailsCard } from '../components/JobDetailsCard';
import { ResumeDropzone } from '../components/ResumeDropzone';
import { SuccessModal } from '../components/SuccessModal';
import { getOpenJobs, submitGeneralApplication } from '../services/api';
import type { Job, ApplicationResponse } from '../types';
import { User, Phone, Mail, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const ApplyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get('job_id') || '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successApplication, setSuccessApplication] = useState<ApplicationResponse | null>(null);

  // Form Fields State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [resume, setResume] = useState<File | null>(null);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await getOpenJobs();
      setJobs(data);
      if (preselectedJobId && data.some(j => j.id === preselectedJobId)) {
        setSelectedJobId(preselectedJobId);
      } else if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    } catch {
      setErrorMessage('Unable to load open jobs. Please make sure the backend server is running.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const validate = (): boolean => {
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
    if (!selectedJobId) errs.job_id = 'Please select a job position';
    if (!resume) errs.resume = 'Please upload your resume (PDF/DOCX)';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await submitGeneralApplication({
        job_id: selectedJobId,
        candidate_name: name,
        candidate_email: email,
        candidate_phone: phone,
        brief_note: note,
        resume: resume!
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
    setNote('');
    setResume(null);
    setErrors({});
    setSuccessApplication(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeJobsCount={jobs.length} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Join Our World-Class Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Apply for Open Positions
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Select an opening, attach your resume, and submit your details. Fast, transparent hiring decisions.
          </p>
        </div>

        {/* Loading / Error States */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Step 1: Job Selection */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Select Target Role</span>
              </h2>

              {loadingJobs ? (
                <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-600" />
                  Loading available roles...
                </div>
              ) : (
                <div className="space-y-4">
                  <JobSelectorDropdown
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    onSelectJob={(id) => {
                      setSelectedJobId(id);
                      setErrors((prev) => ({ ...prev, job_id: '' }));
                    }}
                    error={errors.job_id}
                  />

                  {selectedJob && <JobDetailsCard job={selectedJob} />}
                </div>
              )}
            </div>

            {/* Step 2: Personal Information */}
            <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Your Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
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
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.name ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300'
                      }`}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. jane.doe@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.email ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 000-0000 or +91 9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full bg-white border rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.phone ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300'
                      }`}
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Resume Upload */}
              <ResumeDropzone
                selectedFile={resume}
                onFileSelect={(file) => {
                  setResume(file);
                  setErrors((prev) => ({ ...prev, resume: '' }));
                }}
                error={errors.resume}
              />

              {/* Brief Note */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  Brief Note / Cover Message <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a brief introduction, standout projects, or why you are excited for this role..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || loadingJobs}
                  className="w-full sm:w-auto min-w-[200px] flex items-center justify-center py-3.5 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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
