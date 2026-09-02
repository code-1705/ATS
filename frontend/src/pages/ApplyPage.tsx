import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getOpenJobs } from '../services/api';
import type { Job } from '../types';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  Briefcase,
  Search,
  ArrowRight,
} from 'lucide-react';

export const ApplyPage: React.FC = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter state for KPI cards
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  const handleApplyJob = (jobId: string) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const data = await getOpenJobs();
      setJobs(data);
    } catch {
      setErrorMessage('Unable to load open jobs. Please make sure the backend server is running.');
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Unique departments for filter chips
  const departments = useMemo(() => {
    const deps = new Set<string>();
    jobs.forEach((j) => {
      if (j.department) deps.add(j.department);
    });
    return ['ALL', ...Array.from(deps)];
  }, [jobs]);

  // Filtered jobs based on search & department
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        selectedDepartment === 'ALL' || job.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [jobs, searchQuery, selectedDepartment]);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
      <Navbar activeJobsCount={jobs.length} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div
            style={{
              backgroundColor: 'rgba(218, 119, 86, 0.1)',
              borderColor: 'rgba(218, 119, 86, 0.25)',
              color: 'var(--primary, #da7756)',
            }}
            className="inline-flex items-center space-x-2 text-xs font-bold px-3 py-1 rounded-full border"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Talent Placement Network • Multiple Company Opportunities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
            Explore Partner Positions
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)]">
            Browse active engineering, product, and AI positions hosted for our partner companies. Click any position card to apply directly.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =========================================================================
            AVAILABLE JOBS IN KPI CARDS FORMAT
            ========================================================================= */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
                Available Roles ({jobs.length})
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Click on any job KPI card to open its dedicated application page.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search roles, skills, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[var(--border-color)] rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)] transition shadow-xs"
              />
              <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Department Filter Chips */}
          {departments.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {departments.map((dep) => {
                const isSelected = selectedDepartment === dep;
                return (
                  <button
                    key={dep}
                    type="button"
                    onClick={() => setSelectedDepartment(dep)}
                    style={{
                      backgroundColor: isSelected ? 'var(--primary, #da7756)' : 'var(--bg-card, #ffffff)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted, #666560)',
                      borderColor: isSelected ? 'var(--primary, #da7756)' : 'var(--border-color, #e6e4dc)',
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    {dep === 'ALL' ? 'All Roles' : dep}
                  </button>
                );
              })}
            </div>
          )}

          {/* KPI Cards Grid */}
          {loadingJobs ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[var(--border-color)] text-sm text-[var(--text-muted)]">
              <Loader2 className="w-6 h-6 mb-3 animate-spin text-[var(--primary)]" />
              <span>Loading partner opportunities...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-2xl border border-[var(--border-color)]">
              <Briefcase className="w-8 h-8 mx-auto text-[var(--text-dim)] mb-2" />
              <h4 className="text-sm font-bold text-[var(--text-main)]">No matching positions found</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try clearing your search query or department filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('ALL');
                }}
                className="mt-4 px-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg text-xs font-semibold text-[var(--primary)] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleApplyJob(job.id)}
                  style={{
                    borderColor: 'var(--border-color, #e6e4dc)',
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                  className="group relative rounded-2xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-[var(--primary)] hover:shadow-md"
                >
                  {/* Top Row: Department Badge & Action Indicator */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        style={{
                          backgroundColor: 'rgba(218, 119, 86, 0.1)',
                          color: 'var(--primary, #da7756)',
                          borderColor: 'rgba(218, 119, 86, 0.25)',
                        }}
                        className="text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                      >
                        {job.department || 'General'}
                      </span>

                      <span className="text-[0.75rem] font-semibold text-[var(--primary)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Apply Now →
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-base font-extrabold tracking-tight mb-2 text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                      {job.title}
                    </h3>

                    {/* KPI Metrics Chips */}
                    <div className="grid grid-cols-2 gap-2 my-3.5">
                      <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                        <span className="truncate font-medium">{job.location || 'Remote'}</span>
                      </div>
                      <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                        <span className="truncate font-medium">{job.job_type || 'Full-time'}</span>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>
                  </div>

                  {/* Card Footer Button */}
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <Link
                      to={`/jobs/${job.id}/apply`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: 'var(--primary, #da7756)',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 no-underline hover:opacity-95 cursor-pointer"
                    >
                      <span>Apply for This Role</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
