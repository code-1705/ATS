import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Job } from '../types';

interface ConfirmDeleteModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (jobId: string) => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !job) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(job.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Delete Job Posting?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-900">{job.title}</strong>?
          </p>

          <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-left space-y-1.5">
            <p className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              Cascade Deletion Warning
            </p>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              {job.applications_count && job.applications_count > 0 ? (
                <>
                  This position has <strong className="font-bold text-rose-900">{job.applications_count} active candidate {job.applications_count === 1 ? 'application' : 'applications'}</strong>. Deleting this job will permanently delete all candidate profiles, interview logs, and resume files. This action is irreversible.
                </>
              ) : (
                <>
                  Deleting this job will permanently remove the position and purge all associated candidate application records and uploaded resume files. This action is irreversible.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Job'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
