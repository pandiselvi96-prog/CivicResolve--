export type ComplaintCategory =
  | 'Potholes & Roads'
  | 'Garbage & Sanitation'
  | 'Water Supply'
  | 'Streetlights & Electrical'
  | 'Drainage'
  | 'Public Infrastructure'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Department =
  | 'Road Maintenance Department'
  | 'Sanitation Department'
  | 'Water Supply Department'
  | 'Electrical Department'
  | 'Drainage Department'
  | 'Public Works Department'
  | 'General Grievance Cell';

export interface AIAnalysisResult {
  summary: string;
  classification: string;
  urgency: ComplaintPriority;
  urgencyReasoning: string;
  recommendedDepartment: Department;
  suggestedImmediateAction: string;
  aiConfidence: number;
  isDemoMode: boolean;
}

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface ComplaintLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Complaint {
  id: string; // e.g. CR-2026-1001
  citizenName: string;
  citizenEmail: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: ComplaintLocation;
  imageUrl?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  department: Department;
  aiAnalysis: AIAnalysisResult;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface DuplicateMatch {
  complaint: Complaint;
  similarityScore: number;
  distanceMeters: number;
  matchReasons: string[];
}

export interface DuplicateCheckResult {
  hasPotentialDuplicates: boolean;
  confidence: number;
  duplicateCount: number;
  nearbyComplaints: DuplicateMatch[];
  warningMessage?: string;
}

export interface AnalyticsData {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  highOrCriticalComplaints: number;
  avgResolutionTimeHours: number;
  aiTriageAccuracyPercent: number;
  byCategory: Array<{ name: string; count: number; resolved: number }>;
  byStatus: Array<{ name: string; count: number }>;
  byPriority: Array<{ name: string; count: number }>;
  byDepartment: Array<{ name: string; count: number; pending: number }>;
  recentResolutions: Complaint[];
}

export interface AssistantChatRequest {
  query: string;
  complaintId?: string;
  adminContext?: boolean;
}

export interface AssistantChatResponse {
  answer: string;
  suggestedActions?: string[];
  referencedComplaintId?: string;
  isDemoMode: boolean;
}
