import React, { useState } from 'react';
import type { ApplicationStage } from '../types';
import { ChevronDown, Loader2 } from 'lucide-react';

interface StageBadgeProps {
  currentStage: string;
  onStageChange?: (newStage: ApplicationStage) => Promise<void>;
  interactive?: boolean;
}

export const STAGE_CONFIGS: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  APPLIED: {
    label: 'Applied (Initial)',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-500'
  },
  REJECT: {
    label: 'Reject',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    dot: 'bg-rose-500'
  },
  R1: {
    label: 'R1',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dot: 'bg-blue-500'
  },
  R1_REJECT: {
    label: 'R1 Reject',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    dot: 'bg-orange-500'
  },
  R2: {
    label: 'R2',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    dot: 'bg-indigo-500'
  },
  R2_REJECT: {
    label: 'R2 Reject',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dot: 'bg-amber-500'
  },
  R3: {
    label: 'R3',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    dot: 'bg-purple-500'
  },
  R3_REJECT: {
    label: 'R3 Reject',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    dot: 'bg-red-500'
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500'
  }
};

const ALL_STAGES: ApplicationStage[] = [
  'APPLIED',
  'R1',
  'R1_REJECT',
  'R2',
  'R2_REJECT',
  'R3',
  'R3_REJECT',
  'APPROVED',
  'REJECT'
];

export const StageBadge: React.FC<StageBadgeProps> = ({
  currentStage,
  onStageChange,
  interactive = true
}) => {
  const [updating, setUpdating] = useState(false);
  const config = STAGE_CONFIGS[currentStage.toUpperCase()] || {
    label: currentStage,
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-400'
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as ApplicationStage;
    if (newStage === currentStage || !onStageChange) return;

    setUpdating(true);
    try {
      await onStageChange(newStage);
    } finally {
      setUpdating(false);
    }
  };

  if (!interactive || !onStageChange) {
    return (
      <span
        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}></span>
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${config.bg} ${config.text} ${config.border}`}
      >
        {updating ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-600" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 shrink-0`}></span>
        )}
        <span className="truncate max-w-[110px]">{config.label}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-500 shrink-0" />
      </div>

      <select
        value={currentStage}
        disabled={updating}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      >
        {ALL_STAGES.map((stg) => (
          <option key={stg} value={stg}>
            {STAGE_CONFIGS[stg]?.label || stg}
          </option>
        ))}
      </select>
    </div>
  );
};
