import React from 'react';
import { AlertTriangle, ThumbsUp, MapPin, X, ArrowRight } from 'lucide-react';
import { DuplicateCheckResult, DuplicateMatch } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  duplicateResult: DuplicateCheckResult;
  onUpvoteAndTrack: (existingId: string) => void;
  onProceedAnyway: () => void;
  onClose: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  duplicateResult,
  onUpvoteAndTrack,
  onProceedAnyway,
  onClose
}) => {
  const { t } = useLanguage();

  if (!isOpen || !duplicateResult.hasPotentialDuplicates) return null;

  const topMatch: DuplicateMatch | undefined = duplicateResult.nearbyComplaints[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-amber-200 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t('dupModalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                Found {duplicateResult.duplicateCount} similar civic report(s) nearby
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          {duplicateResult.warningMessage || t('dupModalBody')}
        </p>

        {/* Existing Matched Complaint Card */}
        {topMatch && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-teal-300">
                {topMatch.complaint.id}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {Math.round(topMatch.similarityScore * 100)}% AI Match
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                {topMatch.complaint.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {topMatch.complaint.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-civic-teal" />
                <span>~{topMatch.distanceMeters}m away</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <ThumbsUp className="w-3 h-3 text-civic-teal" />
                <span>{topMatch.complaint.upvotes} upvotes</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {topMatch && (
            <button
              type="button"
              onClick={() => onUpvoteAndTrack(topMatch.complaint.id)}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-civic-teal hover:bg-civic-tealDark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{t('dupUpvoteBtn')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onProceedAnyway}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>{t('dupProceedBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
