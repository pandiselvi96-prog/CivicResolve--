import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Sparkles,
  Bot,
  MapPin,
  TrendingUp,
  Eye,
  Edit3,
  LogOut,
  Lock,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Complaint,
  AnalyticsData,
  ComplaintStatus,
  ComplaintPriority,
  Department
} from '../types';
import { MapViewer } from '../components/MapViewer';

interface AdminPageProps {
  onOpenAssistant: () => void;
  onSelectForTrack?: (id: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onOpenAssistant,
  onSelectForTrack
}) => {
  const { t } = useLanguage();

  // Authentication state (Pre-filled demo login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('civicresolve_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('admin@civicresolve.gov');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>(null);

  // Data State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Edit / Status Update Modal State
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [newDepartment, setNewDepartment] = useState<Department>('Road Maintenance Department');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, anaRes] = await Promise.all([
        api.getComplaints({
          status: statusFilter,
          priority: priorityFilter,
          department: departmentFilter,
          search: searchQuery
        }),
        api.getAnalytics()
      ]);

      if (compRes.success) setComplaints(compRes.complaints);
      if (anaRes.success) setAnalytics(anaRes.analytics);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, statusFilter, priorityFilter, departmentFilter, searchQuery]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@civicresolve.gov' && adminPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('civicresolve_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError('Invalid credentials. Use demo: admin@civicresolve.gov / admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('civicresolve_admin_auth');
  };

  const handleOpenEditModal = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setNewStatus(complaint.status);
    setNewDepartment(complaint.department);
    setResolutionNote(complaint.resolutionNotes || '');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setIsUpdating(true);
    try {
      await api.updateComplaint(editingComplaint.id, {
        status: newStatus,
        department: newDepartment,
        resolutionNotes: resolutionNote,
        updaterNote: `Status updated to ${newStatus} by Municipal Admin.`
      });

      setEditingComplaint(null);
      await loadData();
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Login Gate Card if not logged in
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-teal-300 flex items-center justify-center mb-5 mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-extrabold text-center text-navy-950 mb-1">
            {t('adminLoginTitle')}
          </h2>
          <p className="text-xs text-center text-slate-500 mb-6">
            Municipal official authentication gate
          </p>

          {/* Visible Demo Credentials Callout */}
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs text-amber-900">
            <span className="font-bold block mb-1">Visible Demo Credentials for Judges:</span>
            <div className="font-mono text-[11px] space-y-0.5 text-amber-800">
              <p>Email: <strong>admin@civicresolve.gov</strong></p>
              <p>Password: <strong>admin123</strong></p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('adminEmailLabel')}
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('adminPasswordLabel')}
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {t('adminLoginBtn')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Priority Colors for Charts
  const PRIORITY_COLORS: Record<string, string> = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#EAB308',
    Low: '#10B981'
  };

  const STATUS_COLORS: Record<string, string> = {
    Submitted: '#94A3B8',
    'Under Review': '#F59E0B',
    Assigned: '#6366F1',
    'In Progress': '#06B6D4',
    Resolved: '#10B981'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              {t('adminTitle')}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Live Operations
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t('adminSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-civic-teal hover:bg-teal-100 border border-teal-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot Drawer</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('adminLogoutBtn')}</span>
          </button>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t('kpiTotal')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1 block">
              {analytics?.totalComplaints ?? complaints.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t('kpiPending')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
              {analytics?.pendingComplaints ?? 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t('kpiResolved')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
              {analytics?.resolvedComplaints ?? 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t('kpiCritical')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1 block">
              {analytics?.highOrCriticalComplaints ?? 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Analytics Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-navy-950 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-civic-teal" />
            <span>{t('chartCategoryTitle')}</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.byCategory || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-navy-950 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{t('chartPriorityTitle')}</span>
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.byPriority || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {(analytics?.byPriority || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geo-Visualization (Leaflet OpenStreetMap) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-civic-teal" />
              <span>{t('geoMapTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive Leaflet GIS map with live priority markers and direct inspection popups
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {complaints.length} geo-tagged pins displayed
          </span>
        </div>

        <MapViewer
          complaints={complaints}
          onSelectComplaint={c => {
            if (onSelectForTrack) onSelectForTrack(c.id);
          }}
        />
      </div>

      {/* Management Table Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-navy-950">
              {t('tableTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live dispatch table with inline status toggling and department reassignment
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('tableSearchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="All">{t('filterStatus')}: All</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="All">{t('filterPriority')}: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 max-w-[200px]"
          >
            <option value="All">{t('filterDept')}: All</option>
            <option value="Road Maintenance Department">Road Maintenance</option>
            <option value="Sanitation Department">Sanitation</option>
            <option value="Water Supply Department">Water Supply</option>
            <option value="Electrical Department">Electrical</option>
            <option value="Drainage Department">Drainage</option>
            <option value="Public Works Department">Public Works</option>
          </select>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t('tableColId')}</th>
                <th className="py-3.5 px-4">{t('tableColDetails')}</th>
                <th className="py-3.5 px-4">{t('tableColCategory')}</th>
                <th className="py-3.5 px-4">{t('tableColPriority')}</th>
                <th className="py-3.5 px-4">{t('tableColDept')}</th>
                <th className="py-3.5 px-4">{t('tableColStatus')}</th>
                <th className="py-3.5 px-4 text-right">{t('tableColActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No complaints match current filters.
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      {c.id}
                    </td>

                    {/* Title & Citizen */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.citizenName} • {c.location.address}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {c.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2.5 py-0.5 rounded-full font-bold text-[11px]"
                        style={{
                          backgroundColor: `${PRIORITY_COLORS[c.priority]}20`,
                          color: PRIORITY_COLORS[c.priority]
                        }}
                      >
                        {c.priority}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[150px]">
                      {c.department}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full font-bold text-[11px]"
                        style={{
                          backgroundColor: `${STATUS_COLORS[c.status]}20`,
                          color: STATUS_COLORS[c.status]
                        }}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Update status or add resolution note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {onSelectForTrack && (
                        <button
                          onClick={() => onSelectForTrack(c.id)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-civic-teal transition-colors cursor-pointer"
                          title="View citizen tracking timeline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status & Resolution Notes Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-teal-600 block">
                  {editingComplaint.id}
                </span>
                <h3 className="text-base font-bold text-navy-950">
                  {t('modalUpdateStatusTitle')}
                </h3>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Update Status Stage
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold text-slate-800"
                >
                  <option value="Submitted">1. Submitted</option>
                  <option value="Under Review">2. Under Review</option>
                  <option value="Assigned">3. Assigned</option>
                  <option value="In Progress">4. In Progress</option>
                  <option value="Resolved">5. Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reassign Municipal Department
                </label>
                <select
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value as Department)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium text-slate-800"
                >
                  <option value="Road Maintenance Department">Road Maintenance Department</option>
                  <option value="Sanitation Department">Sanitation Department</option>
                  <option value="Water Supply Department">Water Supply Department</option>
                  <option value="Electrical Department">Electrical Department</option>
                  <option value="Drainage Department">Drainage Department</option>
                  <option value="Public Works Department">Public Works Department</option>
                  <option value="General Grievance Cell">General Grievance Cell</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('modalNoteLabel')}
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="e.g. Ward 112 inspection completed. Asphalt paving crew mobilized..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {t('modalCancel')}
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-civic-teal hover:bg-civic-tealDark text-white font-bold shadow-md disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : t('modalSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
