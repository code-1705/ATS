import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface ResumeDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndSetFile = (file: File) => {
    setInternalError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setInternalError('Invalid format. Please upload PDF, DOC, or DOCX files only.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setInternalError('File is too large. Maximum file size is 10MB.');
      return;
    }

    if (file.size === 0) {
      setInternalError('Uploaded file is empty.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">
        Resume / CV <span className="text-rose-500">*</span>
      </label>

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : error || internalError
              ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
              : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {(error || internalError) && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-600 mt-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{internalError || error}</span>
        </div>
      )}
    </div>
  );
};
