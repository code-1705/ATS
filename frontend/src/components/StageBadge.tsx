import React, { useState, useRef, useEffect } from 'react';
import type { ApplicationStage } from '../types';
import { ChevronDown, Loader2, Check } from 'lucide-react';

interface StageBadgeProps {
  currentStage: string;
  validNextStages?: (ApplicationStage | string)[];
  onStageChange?: (newStage: ApplicationStage) => Promise<void>;
  interactive?: boolean;
}

const STAGE_CONFIGS: Record<
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
  validNextStages,
  onStageChange,
  interactive = true
}) => {
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = STAGE_CONFIGS[currentStage.toUpperCase()] || {
    label: currentStage,
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-400'
  };

  const availableStages: ApplicationStage[] = validNextStages
    ? [
        currentStage as ApplicationStage,
        ...validNextStages.filter((s) => s !== currentStage) as ApplicationStage[]
      ]
    : ALL_STAGES;

  const isTerminal = validNextStages !== undefined && validNextStages.length === 0;

  // Handle clicking outside to dismiss the custom dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = async (newStage: ApplicationStage) => {
    setIsOpen(false);
    if (newStage === currentStage || !onStageChange) return;

    setUpdating(true);
    try {
      await onStageChange(newStage);
    } finally {
      setUpdating(false);
    }
  };

  if (!interactive || !onStageChange || isTerminal) {
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
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => !updating && setIsOpen(!isOpen)}
        disabled={updating}
        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none hover:shadow-xs focus:outline-hidden ${config.bg} ${config.text} ${config.border} ${
          isOpen ? 'ring-2 ring-[var(--primary)]/20 shadow-xs' : ''
        }`}
      >
        {updating ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-600" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 shrink-0`}></span>
        )}
        <span className="truncate max-w-[110px]">{config.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 ml-1 text-slate-500 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[175px] bg-white border border-[var(--border-color)] rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] border-b border-[var(--border-color)]/60">
            Transition Stage
          </div>
          <div className="py-0.5 max-h-60 overflow-y-auto">
            {availableStages.map((stg) => {
              const stgConfig = STAGE_CONFIGS[stg.toUpperCase()] || {
                label: stg,
                dot: 'bg-slate-400',
                text: 'text-slate-700',
              };
              const isSelected = stg === currentStage;
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => handleSelect(stg)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 font-bold text-[var(--text-main)]'
                      : 'font-medium text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className={`w-2 h-2 rounded-full ${stgConfig.dot} shrink-0`} />
                    <span className="truncate">{stgConfig.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

