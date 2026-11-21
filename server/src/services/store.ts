import admin from 'firebase-admin';
import { config } from '../config';
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  Department,
  AnalyticsData,
  StatusHistoryEntry
} from '../types';

// Pre-seeded realistic demo complaints (Chennai & Metro Civic Data with real coordinates)
const initialDemoComplaints: Complaint[] = [
  {
    id: 'CR-2026-1001',
    citizenName: 'Aravind Swaminathan',
    citizenEmail: 'aravind.s@example.com',
    title: 'Severe pothole cluster near Anna Flyover junction',
    description: 'Deep road crater causing vehicles to swerve abruptly during peak hours. Two two-wheeler riders almost slipped yesterday evening. Immediate asphalt patch required.',
    category: 'Potholes & Roads',
    location: {
      address: 'Anna Salai near Gemini Flyover, Thousand Lights, Chennai, TN 600006',
      lat: 13.0524,
      lng: 80.2508
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    priority: 'High',
    department: 'Road Maintenance Department',
    aiAnalysis: {
      summary: 'Hazardous cluster of deep potholes causing severe traffic swerving and accident risk near a major arterial flyover.',
      classification: 'Road Infrastructure Hazard & Traffic Vulnerability',
      urgency: 'High',
      urgencyReasoning: 'Heavy two-wheeler volume on major arterial road poses acute safety hazard and imminent accident potential.',
      recommendedDepartment: 'Road Maintenance Department',
      suggestedImmediateAction: 'Deploy asphalt road patching crew with warning barricades within 12 hours.',
      aiConfidence: 0.96,
      isDemoMode: true
    },
    upvotes: 24,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolutionNotes: 'Inspection completed by Ward 112 Engineer. Cold mix patch work scheduled for tonight between 11 PM and 4 AM.',
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Complaint logged via CivicResolve portal.' },
      { status: 'Under Review', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), note: 'AI routed to Road Maintenance Dept; triage verified.' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Assigned to Ward 112 Road Works Division.' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), note: 'Asphalt crew dispatched for road leveling.' }
    ]
  },
  {
    id: 'CR-2026-1002',
    citizenName: 'Meenakshi Raman',
    citizenEmail: 'meenakshi.r@example.com',
    title: 'Overflowing commercial waste bin attracting strays and foul stench',
    description: 'Community garbage dumpster has not been emptied for four consecutive days. Waste is spilling over pedestrian footpath, blocking access to neighborhood bus stop.',
    category: 'Garbage & Sanitation',
    location: {
      address: '4th Cross Street, T. Nagar, Chennai, TN 600017',
      lat: 13.0418,
      lng: 80.2341
    },
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
    status: 'Resolved',
    priority: 'High',
    department: 'Sanitation Department',
    aiAnalysis: {
      summary: 'Public health concern regarding uncollected commercial municipal waste spilling onto high-density pedestrian walkway.',
      classification: 'Sanitation & Public Health Violation',
      urgency: 'High',
      urgencyReasoning: 'Four days accumulation near bus stop presents sanitation disease vectors and pedestrian blockade.',
      recommendedDepartment: 'Sanitation Department',
      suggestedImmediateAction: 'Dispatch compact compactor truck and disinfect roadside bins immediately.',
      aiConfidence: 0.94,
      isDemoMode: true
    },
    upvotes: 41,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    resolutionNotes: 'Trash completely cleared via hydraulic compactor truck. Bleaching powder and lime disinfection applied.',
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), note: 'Complaint logged.' },
      { status: 'Under Review', timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(), note: 'Priority verified by Sanitation Supervisor.' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), note: 'Assigned to Zone 10 Solid Waste Management team.' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Compactor vehicle on-site.' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Bin cleared and disinfected.' }
    ]
  },
  {
    id: 'CR-2026-1003',
    citizenName: 'Karthik Narayanan',
    citizenEmail: 'karthik.n@example.com',
    title: 'High-pressure potable water pipeline burst flooding residential lane',
    description: 'Drinking water pipeline ruptured under sidewalk. Clean water is spewing across the road for over 6 hours, leading to zero water pressure in 30+ households.',
    category: 'Water Supply',
    location: {
      address: '2nd Main Road, Gandhi Nagar, Adyar, Chennai, TN 600020',
      lat: 13.0067,
      lng: 80.2570
    },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
    status: 'Assigned',
    priority: 'Critical',
    department: 'Water Supply Department',
    aiAnalysis: {
      summary: 'Main potable water distribution line breach causing severe freshwater wastage and neighborhood water supply blackout.',
      classification: 'Critical Water Utility Failure & Street Flooding',
      urgency: 'Critical',
      urgencyReasoning: 'Massive loss of treated drinking water and complete disruption to thirty families requires emergency valve shutoff.',
      recommendedDepartment: 'Water Supply Department',
      suggestedImmediateAction: 'Isolate Sector 8 feeder valve to halt leakage and send pipeline welding team.',
      aiConfidence: 0.98,
      isDemoMode: true
    },
    upvotes: 56,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    resolutionNotes: 'Main line feeder valve temporarily shut off. Excavator mobilized for replacement collar clamp.',
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Urgent citizen alert submitted.' },
      { status: 'Under Review', timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), note: 'System flagged as CRITICAL severity.' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Emergency water repair brigade assigned.' }
    ]
  },
  {
    id: 'CR-2026-1004',
    citizenName: 'Deepa Subramanian',
    citizenEmail: 'deepa.sub@example.com',
    title: 'Row of 5 streetlights dark creating unsafe blind spot at night',
    description: 'LED streetlights along the park perimeter road have been completely dead since thunderstorm last week. Elderly walkers and women feel unsafe due to pitch black conditions.',
    category: 'Streetlights & Electrical',
    location: {
      address: 'Nageswara Rao Park Perimeter, Mylapore, Chennai, TN 600004',
      lat: 13.0336,
      lng: 80.2679
    },
    status: 'Under Review',
    priority: 'Medium',
    department: 'Electrical Department',
    aiAnalysis: {
      summary: 'Post-storm electrical outage affecting sequential public street illumination near public park walkway.',
      classification: 'Public Lighting Outage & Civic Safety Risk',
      urgency: 'Medium',
      urgencyReasoning: 'Absence of lighting in recreational park corridor poses personal safety concerns during twilight and nighttime.',
      recommendedDepartment: 'Electrical Department',
      suggestedImmediateAction: 'Check junction box feeder breaker and replace blown fuses/LED drivers.',
      aiConfidence: 0.92,
      isDemoMode: true
    },
    upvotes: 19,
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), note: 'Complaint logged.' },
      { status: 'Under Review', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Electrical board line engineer queued.' }
    ]
  },
  {
    id: 'CR-2026-1005',
    citizenName: 'Sundar Pichai (Citizen Test)',
    citizenEmail: 'sundar.test@example.com',
    title: 'Monsoon stormwater drain clogged with plastic silt and construction debris',
    description: 'Rainwater drain culvert is completely blocked with hardened cement bags and plastic trash. Light showers already resulted in 1 foot of water logging on front porches.',
    category: 'Drainage',
    location: {
      address: 'Velachery Bypass Road, Velachery, Chennai, TN 600042',
      lat: 12.9754,
      lng: 80.2206
    },
    status: 'Resolved',
    priority: 'High',
    department: 'Drainage Department',
    aiAnalysis: {
      summary: 'Stormwater conduit obstruction threatening neighborhood inundation with minimal precipitation.',
      classification: 'Drainage Culvert Obstruction & Flood Vulnerability',
      urgency: 'High',
      urgencyReasoning: 'Velachery low-lying topography prone to severe waterlogging; clogged conduits accelerate residential inundation.',
      recommendedDepartment: 'Drainage Department',
      suggestedImmediateAction: 'Deploy super-sucker de-silting machine and clear debris within 24 hours.',
      aiConfidence: 0.95,
      isDemoMode: true
    },
    upvotes: 38,
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    resolutionNotes: 'Super-sucker desilting unit cleared 4.2 metric tons of silt. Drain flow tested with dye trace.',
    statusHistory: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString() },
      { status: 'Under Review', timestamp: new Date(Date.now() - 80 * 3600 * 1000).toISOString() },
      { status: 'Assigned', timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString() },
      { status: 'In Progress', timestamp: new Date(Date.now() - 44 * 3600 * 1000).toISOString() },
      { status: 'Resolved', timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(), note: 'Culvert cleared and water flow restored.' }
    ]
  }
];

class ComplaintStore {
  private inMemoryComplaints: Map<string, Complaint> = new Map();
  private firestoreDb: admin.firestore.Firestore | null = null;
  private isFirebaseActive: boolean = false;
  private nextIdSequence: number = 1006;

  constructor() {
    // Populate in-memory map
    for (const c of initialDemoComplaints) {
      this.inMemoryComplaints.set(c.id, { ...c });
    }

    // Try initializing Firebase Firestore if configured
    if (config.isFirebaseConfigured()) {
      try {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: config.firebase.projectId,
              clientEmail: config.firebase.clientEmail,
              privateKey: config.firebase.privateKey,
            }),
          });
        }
        this.firestoreDb = admin.firestore();
        this.isFirebaseActive = true;
        console.log('✅ Firebase Firestore connected successfully.');
      } catch (err) {
        console.warn('⚠️ Firebase initialization failed. Falling back to In-Memory Demo Store.', err);
        this.firestoreDb = null;
        this.isFirebaseActive = false;
      }
    } else {
      console.log('ℹ️ Running in resilient Demo Store Mode (In-Memory pre-seeded store).');
    }
  }

  public getUsingFirebase(): boolean {
    return this.isFirebaseActive;
  }

  public generateId(): string {
    const year = new Date().getFullYear();
    const id = `CR-${year}-${this.nextIdSequence++}`;
    return id;
  }

  public async getAll(filters?: {
    status?: string;
    priority?: string;
    department?: string;
    category?: string;
    search?: string;
  }): Promise<Complaint[]> {
    let complaints: Complaint[] = [];

    if (this.isFirebaseActive && this.firestoreDb) {
      try {
        const snapshot = await this.firestoreDb.collection('complaints').orderBy('createdAt', 'desc').get();
        complaints = snapshot.docs.map(doc => doc.data() as Complaint);
      } catch (err) {
        console.error('Firestore fetch failed, using fallback in-memory cache:', err);
        complaints = Array.from(this.inMemoryComplaints.values());
      }
    } else {
      complaints = Array.from(this.inMemoryComplaints.values());
    }

    // Sort newest first
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply filters
    if (filters) {
      if (filters.status && filters.status !== 'All') {
        complaints = complaints.filter(c => c.status.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.priority && filters.priority !== 'All') {
        complaints = complaints.filter(c => c.priority.toLowerCase() === filters.priority!.toLowerCase());
      }
      if (filters.department && filters.department !== 'All') {
        complaints = complaints.filter(c => c.department.toLowerCase() === filters.department!.toLowerCase());
      }
      if (filters.category && filters.category !== 'All') {
        complaints = complaints.filter(c => c.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        complaints = complaints.filter(c =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.citizenName.toLowerCase().includes(q) ||
          c.location.address.toLowerCase().includes(q)
        );
      }
    }

    return complaints;
  }

  public async getById(id: string): Promise<Complaint | null> {
    const cleanId = id.trim().toUpperCase();

    if (this.isFirebaseActive && this.firestoreDb) {
      try {
        const doc = await this.firestoreDb.collection('complaints').doc(cleanId).get();
        if (doc.exists) {
          return doc.data() as Complaint;
        }
      } catch (err) {
        console.error('Firestore getById error, checking in-memory:', err);
      }
    }

    const complaint = this.inMemoryComplaints.get(cleanId);
    return complaint ? { ...complaint } : null;
  }

  public async create(complaint: Complaint): Promise<Complaint> {
    this.inMemoryComplaints.set(complaint.id, { ...complaint });

    if (this.isFirebaseActive && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('complaints').doc(complaint.id).set(complaint);
      } catch (err) {
        console.error('Failed to write complaint to Firestore, stored in-memory:', err);
      }
    }

    return complaint;
  }

  public async update(
    id: string,
    updates: Partial<Complaint>,
    updaterNote?: string,
    updaterName?: string
  ): Promise<Complaint | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedHistory: StatusHistoryEntry[] = [...existing.statusHistory];

    if (updates.status && updates.status !== existing.status) {
      updatedHistory.push({
        status: updates.status,
        timestamp: now,
        note: updaterNote || `Status updated to ${updates.status}`,
        updatedBy: updaterName || 'Admin Official'
      });
    }

    const merged: Complaint = {
      ...existing,
      ...updates,
      updatedAt: now,
      statusHistory: updatedHistory,
      resolutionNotes: updates.resolutionNotes !== undefined ? updates.resolutionNotes : existing.resolutionNotes
    };

    this.inMemoryComplaints.set(merged.id, merged);

    if (this.isFirebaseActive && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('complaints').doc(merged.id).update({
          ...updates,
          updatedAt: now,
          statusHistory: updatedHistory,
        });
      } catch (err) {
        console.error('Failed to update Firestore, updated in-memory:', err);
      }
    }

    return merged;
  }

  public async upvote(id: string): Promise<Complaint | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const upvoted: Complaint = {
      ...existing,
      upvotes: (existing.upvotes || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    this.inMemoryComplaints.set(upvoted.id, upvoted);

    if (this.isFirebaseActive && this.firestoreDb) {
      try {
        await this.firestoreDb.collection('complaints').doc(upvoted.id).update({
          upvotes: upvoted.upvotes,
          updatedAt: upvoted.updatedAt
        });
      } catch (err) {
        console.error('Failed to upvote in Firestore:', err);
      }
    }

    return upvoted;
  }

  public async getAnalytics(): Promise<AnalyticsData> {
    const all = await this.getAll();

    const totalComplaints = all.length;
    const resolvedComplaints = all.filter(c => c.status === 'Resolved').length;
    const pendingComplaints = totalComplaints - resolvedComplaints;
    const highOrCriticalComplaints = all.filter(
      c => c.priority === 'High' || c.priority === 'Critical'
    ).length;

    // Calculate realistic average resolution time from history
    let totalResolutionHours = 0;
    let resolvedWithTimes = 0;
    for (const c of all) {
      if (c.status === 'Resolved' && c.statusHistory.length > 0) {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.updatedAt).getTime();
        const hours = (end - start) / (1000 * 3600);
        if (hours > 0) {
          totalResolutionHours += hours;
          resolvedWithTimes++;
        }
      }
    }
    const avgResolutionTimeHours = resolvedWithTimes > 0
      ? Math.round((totalResolutionHours / resolvedWithTimes) * 10) / 10
      : 24.5;

    // By Category
    const categoryMap = new Map<string, { count: number; resolved: number }>();
    const categories = [
      'Potholes & Roads',
      'Garbage & Sanitation',
      'Water Supply',
      'Streetlights & Electrical',
      'Drainage',
      'Public Infrastructure',
      'Other'
    ];
    for (const cat of categories) {
      categoryMap.set(cat, { count: 0, resolved: 0 });
    }
    for (const c of all) {
      const entry = categoryMap.get(c.category) || { count: 0, resolved: 0 };
      entry.count++;
      if (c.status === 'Resolved') entry.resolved++;
      categoryMap.set(c.category, entry);
    }
    const byCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      resolved: data.resolved
    }));

    // By Status
    const statusOrder: ComplaintStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    const byStatus = statusOrder.map(st => ({
      name: st,
      count: all.filter(c => c.status === st).length
    }));

    // By Priority
    const priorityOrder: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];
    const byPriority = priorityOrder.map(pr => ({
      name: pr,
      count: all.filter(c => c.priority === pr).length
    }));

    // By Department
    const deptMap = new Map<string, { count: number; pending: number }>();
    for (const c of all) {
      const entry = deptMap.get(c.department) || { count: 0, pending: 0 };
      entry.count++;
      if (c.status !== 'Resolved') entry.pending++;
      deptMap.set(c.department, entry);
    }
    const byDepartment = Array.from(deptMap.entries()).map(([name, val]) => ({
      name,
      count: val.count,
      pending: val.pending
    }));

    const recentResolutions = all
      .filter(c => c.status === 'Resolved')
      .slice(0, 5);

    return {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      highOrCriticalComplaints,
      avgResolutionTimeHours,
      aiTriageAccuracyPercent: 96.4,
      byCategory,
      byStatus,
      byPriority,
      byDepartment,
      recentResolutions
    };
  }
}

export const complaintStore = new ComplaintStore();
