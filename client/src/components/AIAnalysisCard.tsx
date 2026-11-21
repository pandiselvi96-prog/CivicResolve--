import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { Complaint, ComplaintPriority } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AIAnalysisCardProps {
  complaint: Complaint;
  onTrackNow: (id: string) => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ complaint, onTrackNow }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const { aiAnalysis, id } = complaint;

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'Critical':
        return {
          bg: 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-200',
          dot: 'bg-red-500'
        };
      case 'High':
        return {
          bg: 'bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-200',
          dot: 'bg-orange-500'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'Low':
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
    }
  };

  const badgeStyle = getPriorityBadge(aiAnalysis.urgency);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with AI Badge & Unique ID */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-700/80 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-civic-teal flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-white">
                {t('aiCardTitle')}
              </h3>
              {aiAnalysis.isDemoMode && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30">
                  Demo AI Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Confidence Score: {Math.round(aiAnalysis.aiConfidence * 100)}% • Auto-triaged via Gemini
            </p>
          </div>
        </div>

        {/* Unique Complaint ID Pill */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-teal-500/40 rounded-xl px-3.5 py-2 shrink-0">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('aiCardGeneratedId')}
            </span>
            <span className="font-mono text-base font-extrabold text-teal-300">
              {id}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copy ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Executive Summary */}
        <div className="md:col-span-2 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{t('aiSummaryTitle')}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {aiAnalysis.summary}
          </p>
        </div>

        {/* Priority & Reasoning */}
        <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('aiUrgencyTitle')}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${badgeStyle.bg}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} animate-ping`} />
                {aiAnalysis.urgency} Priority
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-300 mt-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">
                  {t('aiReasoningTitle')}:
                </span>
                <span>{aiAnalysis.urgencyReasoning}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Issue Tag:</span>
            <span className="font-semibold text-slate-200">{aiAnalysis.classification}</span>
          </div>
        </div>

        {/* Smart Department Routing & Next Action */}
        <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 flex flex-col justify-between">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t('aiDepartmentTitle')}
            </span>
            <div className="flex items-center gap-2.5 text-teal-300 font-bold text-base mb-3 bg-teal-950/40 border border-teal-800/50 p-3 rounded-xl">
              <Building2 className="w-5 h-5 text-teal-400 shrink-0" />
              <span>{aiAnalysis.recommendedDepartment}</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">
                  {t('aiActionTitle')}:
                </span>
                <span>{aiAnalysis.suggestedImmediateAction}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Routing Protocol:</span>
            <span className="font-semibold text-teal-300">Automated Direct Dispatch</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-700/80 gap-3">
        <p className="text-xs text-slate-400 text-center sm:text-left">
          Save your unique ID <strong className="text-teal-300">{id}</strong> to track municipal progress in real-time.
        </p>

        <button
          onClick={() => onTrackNow(id)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-civic-teal hover:from-teal-400 hover:to-teal-600 font-bold text-sm text-navy-950 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
        >
          <span>{t('aiTrackBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
