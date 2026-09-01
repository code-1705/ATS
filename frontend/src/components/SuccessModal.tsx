import React from 'react';
import { CheckCircle, RefreshCw, Copy, Check } from 'lucide-react';
import type { ApplicationResponse } from '../types';

interface SuccessModalProps {
  application: ApplicationResponse;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ application, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const copyAppId = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
          <p className="text-sm text-slate-600">
            Thank you, <span className="font-semibold text-slate-900">{application.candidate_name}</span>. Your application for{' '}
            <span className="font-semibold text-indigo-600">{application.job_title || 'the position'}</span> has been received successfully.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Application Reference ID</span>
            <button
              onClick={copyAppId}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
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
          <p className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 truncate">
            {application.id}
          </p>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Email Confirmation:</span>
              <p className="font-medium text-slate-800 truncate">{application.candidate_email}</p>
            </div>
            <div>
              <span className="text-slate-500">Initial Status:</span>
              <p className="font-semibold text-emerald-600">{application.stage_label || 'Applied'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Submit Another Application
          </button>
        </div>
      </div>
    </div>
  );
};
