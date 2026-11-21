import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldAlert, Check } from 'lucide-react';
import { ComplaintStatus, StatusHistoryEntry } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TimelineProps {
  currentStatus: ComplaintStatus;
  statusHistory: StatusHistoryEntry[];
}

const STAGES: Array<{
  status: ComplaintStatus;
  labelKey: 'statusSubmitted' | 'statusReview' | 'statusAssigned' | 'statusProgress' | 'statusResolved';
  icon: React.ElementType;
}> = [
  { status: 'Submitted', labelKey: 'statusSubmitted', icon: Clock },
  { status: 'Under Review', labelKey: 'statusReview', icon: ShieldAlert },
  { status: 'Assigned', labelKey: 'statusAssigned', icon: Truck },
  { status: 'In Progress', labelKey: 'statusProgress', icon: Clock },
  { status: 'Resolved', labelKey: 'statusResolved', icon: CheckCircle2 },
];

export const Timeline: React.FC<TimelineProps> = ({ currentStatus, statusHistory }) => {
  const { t } = useLanguage();

  const getStageIndex = (status: ComplaintStatus): number => {
    return STAGES.findIndex(s => s.status === status);
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-4">
      {/* Horizontal Steps */}
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 -z-0" />

        {/* Active progress fill line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-civic-teal transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%`
          }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          // Find historical timestamp if available
          const historyEntry = statusHistory.find(h => h.status === stage.status);
          const timestamp = historyEntry
            ? new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
            : null;

          return (
            <div key={stage.status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-civic-teal text-white ring-4 ring-teal-100'
                    : isCurrent
                    ? 'bg-navy-900 text-white ring-4 ring-sky-200 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="text-center mt-2 w-24">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-navy-900 font-bold'
                      : isCompleted
                      ? 'text-civic-teal'
                      : 'text-slate-400'
                  }`}
                >
                  {t(stage.labelKey)}
                </p>
                {timestamp && (
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History notes expandable list */}
      {statusHistory.length > 0 && (
        <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-xl p-4 divide-y divide-slate-200/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Status Audit Log
          </h4>
          {statusHistory.map((entry, i) => (
            <div key={i} className="py-2.5 flex items-start justify-between text-xs gap-3">
              <div>
                <span className="font-semibold text-slate-800">{entry.status}</span>
                {entry.note && (
                  <p className="text-slate-600 mt-0.5">{entry.note}</p>
                )}
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(entry.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
