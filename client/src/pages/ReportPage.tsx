import React, { useState, useEffect } from 'react';
import {
  FileText,
  MapPin,
  Camera,
  Sparkles,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { MapPicker } from '../components/MapPicker';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { DuplicateWarningModal } from '../components/DuplicateWarningModal';
import { Complaint, ComplaintCategory, DuplicateCheckResult } from '../types';

interface ReportPageProps {
  onNavigate: (tab: 'home' | 'report' | 'track' | 'admin') => void;
  onSetTrackId: (id: string) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ onNavigate, onSetTrackId }) => {
  const { t } = useLanguage();

  // Form Fields State
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Potholes & Roads');
  const [address, setAddress] = useState('Anna Salai near Gemini Flyover, Thousand Lights, Chennai, TN 600006');
  const [lat, setLat] = useState<number>(13.0524);
  const [lng, setLng] = useState<number>(80.2508);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission & AI State
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Duplicate Check State
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [bypassDuplicateCheck, setBypassDuplicateCheck] = useState(false);

  // Pre-submission live duplicate detection with debounce
  useEffect(() => {
    if (bypassDuplicateCheck || submitting || submittedComplaint) return;
    if (title.trim().length < 8 || description.trim().length < 15) return;

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkDuplicate({
          title,
          description,
          category,
          lat,
          lng
        });

        if (res.success && res.result && res.result.hasPotentialDuplicates) {
          setDuplicateResult(res.result);
          setShowDuplicateModal(true);
        }
      } catch (err) {
        // Soft fail duplicate check
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, description, category, lat, lng, bypassDuplicateCheck]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = ev => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!citizenName.trim() || !citizenEmail.trim() || !title.trim() || !description.trim()) {
      setErrorMessage('Please fill in all mandatory fields before submitting.');
      return;
    }

    // Check email pattern
    if (!/\S+@\S+\.\S+/.test(citizenEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('citizenName', citizenName.trim());
      formData.append('citizenEmail', citizenEmail.trim());
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('address', address.trim());
      formData.append('lat', lat.toString());
      formData.append('lng', lng.toString());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.createComplaint(formData);

      if (res.success && res.complaint) {
        setSubmittedComplaint(res.complaint);
        // Scroll to top of AI card
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Failed to submit complaint. Please check server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackNow = (id: string) => {
    onSetTrackId(id);
    onNavigate('track');
  };

  const handleUpvoteAndTrack = async (existingId: string) => {
    try {
      await api.upvoteComplaint(existingId);
      setShowDuplicateModal(false);
      onSetTrackId(existingId);
      onNavigate('track');
    } catch (err) {
      setShowDuplicateModal(false);
      onSetTrackId(existingId);
      onNavigate('track');
    }
  };

  const handleProceedAnyway = () => {
    setBypassDuplicateCheck(true);
    setShowDuplicateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* If complaint just submitted: Display Polished AI Analysis Card */}
      {submittedComplaint ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-400">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Grievance Registered Successfully!</span>
              <p className="text-xs text-emerald-700">
                Your report has been analyzed by Google Gemini AI and routed to the {submittedComplaint.department}.
              </p>
            </div>
          </div>

          <AIAnalysisCard
            complaint={submittedComplaint}
            onTrackNow={handleTrackNow}
          />

          <div className="text-center pt-4">
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
                setImageFile(null);
                setImagePreview(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-navy-900 underline"
            >
              Submit Another Grievance
            </button>
          </div>
        </div>
      ) : (
        /* Report Form Card */
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-10">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-civic-teal text-xs font-bold mb-3 border border-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Assisted Municipal Triage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              {t('formTitle')}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {t('formSubtitle')}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Citizen Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('labelCitizenName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={e => setCitizenName(e.target.value)}
                  placeholder={t('placeholderCitizenName')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('labelCitizenEmail')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={citizenEmail}
                  onChange={e => setCitizenEmail(e.target.value)}
                  placeholder={t('placeholderCitizenEmail')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Title & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('labelTitle')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('placeholderTitle')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('labelCategory')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="Potholes & Roads">{t('catRoads')}</option>
                  <option value="Garbage & Sanitation">{t('catGarbage')}</option>
                  <option value="Water Supply">{t('catWater')}</option>
                  <option value="Streetlights & Electrical">{t('catLights')}</option>
                  <option value="Drainage">{t('catDrainage')}</option>
                  <option value="Public Infrastructure">{t('catInfra')}</option>
                  <option value="Other">{t('catOther')}</option>
                </select>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('labelDescription')} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('placeholderDescription')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-y"
              />
            </div>

            {/* Location & Map Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('labelLocation')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={t('placeholderAddress')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />

              {/* Interactive Leaflet Map Picker */}
              <MapPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>

            {/* Optional Photo Attachment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('labelPhoto')}
              </label>
              {imagePreview ? (
                <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-36 w-auto object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-2xl p-6 cursor-pointer bg-slate-50/50 hover:bg-teal-50/30 transition-all group">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-civic-teal mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-civic-teal transition-colors">
                    {t('photoUploadHint')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-civic-teal hover:from-teal-700 hover:to-teal-800 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('btnSubmitting')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>{t('btnSubmitComplaint')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Duplicate Complaint Warning Modal */}
      {duplicateResult && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          duplicateResult={duplicateResult}
          onUpvoteAndTrack={handleUpvoteAndTrack}
          onProceedAnyway={handleProceedAnyway}
          onClose={() => setShowDuplicateModal(false)}
        />
      )}
    </div>
  );
};
