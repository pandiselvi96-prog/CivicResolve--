import { Complaint, DuplicateCheckResult, DuplicateMatch } from '../types';

/**
 * Haversine formula to compute distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Tokenize and normalize text into keyword set
 */
function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'it', 'this', 'that', 'there', 'from', 'near', 'very',
    'my', 'we', 'our', 'has', 'have', 'been', 'some', 'any', 'not', 'can', 'will'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  return new Set(words);
}

/**
 * Compute Jaccard similarity coefficient between two keyword sets
 */
function computeJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if a new complaint might be a duplicate of an existing complaint
 */
export function detectDuplicates(
  newComplaint: {
    title: string;
    description: string;
    category: string;
    lat: number;
    lng: number;
  },
  existingComplaints: Complaint[]
): DuplicateCheckResult {
  const newKeywords = extractKeywords(`${newComplaint.title} ${newComplaint.description}`);
  const matches: DuplicateMatch[] = [];

  for (const existing of existingComplaints) {
    // Distance in meters
    const distanceMeters = calculateDistanceMeters(
      newComplaint.lat,
      newComplaint.lng,
      existing.location.lat,
      existing.location.lng
    );

    // Text similarity
    const existingKeywords = extractKeywords(`${existing.title} ${existing.description}`);
    const textSimilarity = computeJaccardSimilarity(newKeywords, existingKeywords);

    // Category match bonus
    const isSameCategory = existing.category === newComplaint.category;

    const matchReasons: string[] = [];

    // Scoring heuristics:
    // Distance weight: 1.0 at 0m, 0.0 at 1000m
    const distanceScore = Math.max(0, 1 - distanceMeters / 1500);

    let compositeScore = textSimilarity * 0.55 + distanceScore * 0.35 + (isSameCategory ? 0.1 : 0);

    if (isSameCategory) {
      matchReasons.push(`Same category: ${existing.category}`);
    }
    if (distanceMeters < 500) {
      matchReasons.push(`Very close location (~${distanceMeters}m away)`);
    } else if (distanceMeters < 1500) {
      matchReasons.push(`Nearby location (~${distanceMeters}m away)`);
    }

    // Shared key terms
    const sharedTerms: string[] = [];
    for (const term of newKeywords) {
      if (existingKeywords.has(term)) sharedTerms.push(term);
    }
    if (sharedTerms.length > 0) {
      matchReasons.push(`Common keywords: ${sharedTerms.slice(0, 4).join(', ')}`);
    }

    // Duplicate threshold:
    // Either very close and some keyword overlap, or high text similarity in same area
    const isDuplicate =
      (distanceMeters < 600 && textSimilarity > 0.25) ||
      (distanceMeters < 1200 && textSimilarity > 0.45 && isSameCategory) ||
      (textSimilarity > 0.65 && distanceMeters < 3000);

    if (isDuplicate) {
      matches.push({
        complaint: existing,
        similarityScore: Math.round(compositeScore * 100) / 100,
        distanceMeters,
        matchReasons
      });
    }
  }

  // Sort by highest similarity
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  const hasPotentialDuplicates = matches.length > 0;
  let warningMessage: string | undefined;

  if (hasPotentialDuplicates) {
    const top = matches[0];
    warningMessage = `A similar issue (${top.complaint.id}: "${top.complaint.title}") was already reported ~${top.distanceMeters}m away. You can upvote the existing grievance to accelerate its resolution or continue submitting your report.`;
  }

  return {
    hasPotentialDuplicates,
    confidence: matches.length > 0 ? matches[0].similarityScore : 0,
    duplicateCount: matches.length,
    nearbyComplaints: matches,
    warningMessage
  };
}
