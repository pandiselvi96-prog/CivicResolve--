import {
  Complaint,
  AnalyticsData,
  DuplicateCheckResult,
  SystemHealth
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  async getComplaints(filters?: {
    status?: string;
    priority?: string;
    department?: string;
    category?: string;
    search?: string;
  }): Promise<{ success: boolean; complaints: Complaint[]; count: number; isDemoMode: boolean }> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
      if (filters.department && filters.department !== 'All') params.append('department', filters.department);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/complaints${query}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaintById(id: string): Promise<{ success: boolean; complaint: Complaint; isDemoMode: boolean }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id.trim().toUpperCase())}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Complaint not found' }));
      throw new Error(errorData.error || 'Failed to fetch complaint');
    }
    return res.json();
  },

  async createComplaint(formData: FormData): Promise<{ success: boolean; complaint: Complaint; message: string; isDemoMode: boolean }> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Submission failed' }));
      throw new Error(err.error || 'Submission failed');
    }
    return res.json();
  },

  async updateComplaint(
    id: string,
    updates: {
      status?: string;
      department?: string;
      priority?: string;
      resolutionNotes?: string;
      updaterNote?: string;
    }
  ): Promise<{ success: boolean; complaint: Complaint; message: string }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(err.error || 'Failed to update complaint');
    }
    return res.json();
  },

  async upvoteComplaint(id: string): Promise<{ success: boolean; upvotes: number; message: string }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/upvote`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json();
  },

  async checkDuplicate(payload: {
    title: string;
    description: string;
    category: string;
    lat: number;
    lng: number;
  }): Promise<{ success: boolean; result: DuplicateCheckResult }> {
    const res = await fetch(`${API_BASE}/ai/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to run duplicate check');
    return res.json();
  },

  async askAssistant(payload: {
    query: string;
    complaintId?: string;
  }): Promise<{ success: boolean; answer: string; suggestedActions: string[]; isDemoMode: boolean }> {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to query AI Assistant');
    return res.json();
  },

  async getAnalytics(): Promise<{ success: boolean; analytics: AnalyticsData; isDemoMode: boolean }> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
