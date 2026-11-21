import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Calendar,
  MapPin,
  ThumbsUp,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Complaint, ComplaintPriority } from '../types';
import { Timeline } from '../components/Timeline';

interface TrackPageProps {
  initialComplaintId?: string;
  onNavigateReport?: () => void;
}

export const TrackPage: React.FC<TrackPageProps> = ({
  initialComplaintId,
  onNavigateReport
}) => {
  const { t } = useLanguage();
  const [searchId, setSearchId] = useState(initialComplaintId || 'CR-2026-1001');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoting, setUpvoting] = useState(false);

  const sampleIds = ['CR-2026-1001', 'CR-2026-1002', 'CR-2026-1003', 'CR-2026-1004', 'CR-2026-1005'];

  const fetchComplaint = async (idToFetch: string) => {
    const cleanId = idToFetch.trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.getComplaintById(cleanId);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
      } else {
        setComplaint(null);
        setError(`Complaint ID "${cleanId}" not found. Try one of the demo samples.`);
      }
    } catch (err: any) {
      setComplaint(null);
      setError(err.message || 'Unable to retrieve complaint record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      fetchComplaint(initialComplaintId);
    } else {
      fetchComplaint('CR-2026-1001');
    }
  }, [initialComplaintId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(searchId);
  };

  const handleUpvote = async () => {
    if (!complaint || upvoting) return;
    setUpvoting(true);
    try {
      const res = await api.upvoteComplaint(complaint.id);
      if (res.success) {
        setComplaint(prev => (prev ? { ...prev, upvotes: res.upvotes } : null));
      }
    } catch (err) {
      console.warn('Upvote error:', err);
    } finally {
      setUpvoting(false);
    }
  };

  const getPriorityStyle = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          {t('trackTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('trackSubtitle')}
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={e => setSearchId(e.target.value.toUpperCase())}
              placeholder={t('trackSearchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {loading ? t('loading') : t('btnSearch')}
          </button>
        </form>

        {/* Quick Sample IDs */}
        <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold">{t('quickFillLabel')}</span>
          {sampleIds.map(sample => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setSearchId(sample);
                fetchComplaint(sample);
              }}
              className={`font-mono px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                searchId === sample
                  ? 'bg-teal-50 border-teal-400 text-civic-teal font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">{t('notFoundTitle')}</h3>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Main Complaint Tracker Card */}
      {complaint && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-navy-900 text-teal-300">
                  {complaint.id}
                </span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getPriorityStyle(complaint.priority)}`}>
                  {complaint.priority} Priority
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {complaint.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950">
                {complaint.title}
              </h2>
            </div>

            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-civic-teal border border-teal-200 font-bold text-xs shadow-2xs transition-all hover:scale-105 cursor-pointer"
              title="Upvote this complaint to increase municipal urgency"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{complaint.upvotes} {t('upvoteCountLabel')}</span>
            </button>
          </div>

          {/* 5-Stage Visual Progress Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t('statusTimelineTitle')}
            </h3>
            <Timeline
              currentStatus={complaint.status}
              statusHistory={complaint.statusHistory}
            />
          </div>

          {/* Description & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Left: Description & Citizen Info */}
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Citizen Problem Description
                </span>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {complaint.description}
                </p>
              </div>

              {complaint.imageUrl && (
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Attached Photographic Evidence
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-56">
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reported {new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <span>•</span>
                <span>By {complaint.citizenName}</span>
              </div>
            </div>

            {/* Right: AI Triage & Municipal Assignment */}
            <div className="space-y-4">
              {/* Department Routing */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Assigned Municipal Department
                </span>
                <div className="flex items-center gap-2 text-navy-950 font-bold text-base">
                  <Building2 className="w-5 h-5 text-civic-teal" />
                  <span>{complaint.department}</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-slate-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{complaint.location.address}</span>
                </div>
              </div>

              {/* Gemini AI Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 to-navy-900 text-white p-5 rounded-2xl border border-teal-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>Gemini AI Triage Assessment</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {complaint.aiAnalysis.summary}
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-teal-300 font-semibold">
                  Recommended Action: {complaint.aiAnalysis.suggestedImmediateAction}
                </div>
              </div>

              {/* Official Notes / Field Engineer Updates */}
              <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-civic-tealDark">
                  <ShieldCheck className="w-4 h-4 text-civic-teal" />
                  <span>{t('officialNotesTitle')}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {complaint.resolutionNotes || t('noNotesYet')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
