import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Check, ArrowRight } from 'lucide-react';
import type { ApplicationResponse } from '../types';

interface SuccessModalProps {
  application: ApplicationResponse;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ application, onReset }) => {
  const [copied, setCopied] = React.useState(false);
  const navigate = useNavigate();

  const handleGoToApply = () => {
    onReset();
    navigate('/apply');
  };

  const copyAppId = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-[var(--border-color)]">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Application Submitted!</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Thank you, <span className="font-bold text-[var(--text-main)]">{application.candidate_name}</span>. Your application for{' '}
            <span style={{ color: 'var(--primary, #da7756)' }} className="font-bold">{application.job_title || 'the position'}</span> has been received successfully.
          </p>
        </div>

        <div className="bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Application Reference ID</span>
            <button
              onClick={copyAppId}
              style={{ color: 'var(--primary, #da7756)' }}
              className="inline-flex items-center font-semibold hover:underline cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy ID
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-[var(--text-main)] bg-white p-2.5 rounded-lg border border-[var(--border-color)] truncate">
            {application.id}
          </p>

          <div className="pt-2 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[var(--text-muted)]">Email Confirmation:</span>
              <p className="font-semibold text-[var(--text-main)] truncate">{application.candidate_email}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Initial Status:</span>
              <p className="font-bold text-emerald-600">{application.stage_label || 'Applied'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoToApply}
            style={{
              backgroundColor: 'var(--primary, #da7756)',
              boxShadow: '0 2px 8px rgba(218, 119, 86, 0.25)',
            }}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-bold hover:opacity-95 transition cursor-pointer gap-2 shadow-xs"
          >
            <span>Explore More Available Roles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
