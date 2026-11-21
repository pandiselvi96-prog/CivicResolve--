import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import {
  AIAnalysisResult,
  ComplaintCategory,
  ComplaintPriority,
  Department,
  Complaint
} from '../types';

let genAI: GoogleGenerativeAI | null = null;
if (config.isGeminiConfigured()) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    console.log('✅ Google Gemini API initialized.');
  } catch (err) {
    console.warn('⚠️ Google Gemini initialization failed. Fallback to Demo Mode.', err);
    genAI = null;
  }
} else {
  console.log('ℹ️ Running in resilient Demo AI Mode (Intelligent rule-based & heuristic fallback).');
}

/**
 * Department routing map based on category and keywords
 */
export function routeDepartment(category: ComplaintCategory, text: string): Department {
  const lower = text.toLowerCase();
  if (
    category === 'Potholes & Roads' ||
    lower.includes('pothole') ||
    lower.includes('road') ||
    lower.includes('crater') ||
    lower.includes('asphalt') ||
    lower.includes('flyover') ||
    lower.includes('tar') ||
    lower.includes('speed breaker')
  ) {
    return 'Road Maintenance Department';
  }

  if (
    category === 'Garbage & Sanitation' ||
    lower.includes('garbage') ||
    lower.includes('trash') ||
    lower.includes('waste') ||
    lower.includes('dump') ||
    lower.includes('stench') ||
    lower.includes('litter') ||
    lower.includes('debris') ||
    lower.includes('sanitation')
  ) {
    return 'Sanitation Department';
  }

  if (
    category === 'Water Supply' ||
    lower.includes('water') ||
    lower.includes('pipe') ||
    lower.includes('leak') ||
    lower.includes('contamination') ||
    lower.includes('pipeline') ||
    lower.includes('tap') ||
    lower.includes('drinking water')
  ) {
    return 'Water Supply Department';
  }

  if (
    category === 'Streetlights & Electrical' ||
    lower.includes('light') ||
    lower.includes('lamp') ||
    lower.includes('pole') ||
    lower.includes('electric') ||
    lower.includes('wire') ||
    lower.includes('cable') ||
    lower.includes('transformer') ||
    lower.includes('darkness') ||
    lower.includes('short circuit')
  ) {
    return 'Electrical Department';
  }

  if (
    category === 'Drainage' ||
    lower.includes('drain') ||
    lower.includes('sewage') ||
    lower.includes('clog') ||
    lower.includes('gutter') ||
    lower.includes('flood') ||
    lower.includes('stormwater') ||
    lower.includes('manhole')
  ) {
    return 'Drainage Department';
  }

  if (
    category === 'Public Infrastructure' ||
    lower.includes('bridge') ||
    lower.includes('park') ||
    lower.includes('bench') ||
    lower.includes('footpath') ||
    lower.includes('sidewalk') ||
    lower.includes('bus shelter')
  ) {
    return 'Public Works Department';
  }

  return 'General Grievance Cell';
}

/**
 * Intelligent deterministic heuristic analyzer when Gemini API is offline/unconfigured
 */
function heuristicAnalyzeComplaint(
  title: string,
  description: string,
  category: ComplaintCategory,
  locationText: string
): AIAnalysisResult {
  const fullText = `${title} ${description} ${locationText}`.toLowerCase();
  const department = routeDepartment(category, fullText);

  let urgency: ComplaintPriority = 'Medium';
  let reasoning = 'Routine civic grievance requiring standard municipal investigation and scheduling.';
  let immediateAction = 'Log for weekly ward maintenance inspection and queue work ticket.';
  let classification = `${category} Civic Incident`;

  // Severity keywords
  const criticalKeywords = ['burst', 'flood', 'electrocution', 'spark', 'death', 'casualty', 'open manhole', 'contamination', 'poison', 'spewing', 'urgent emergency', 'hospital'];
  const highKeywords = ['severe', 'pothole', 'accident', 'danger', 'broken', 'overflowing', 'stench', 'impassable', 'blocked', 'fallen tree', 'blind spot', 'crater'];
  const lowKeywords = ['faded paint', 'cleaning', 'aesthetic', 'request', 'suggestion', 'mild', 'cosmetic'];

  if (criticalKeywords.some(w => fullText.includes(w))) {
    urgency = 'Critical';
    reasoning = 'Presents immediate danger to human safety, major property damage, or catastrophic disruption of essential public utilities.';
    immediateAction = 'Dispatch emergency response team within 2 hours and cordon off the hazard zone.';
    classification = `Critical ${category} Public Emergency`;
  } else if (highKeywords.some(w => fullText.includes(w))) {
    urgency = 'High';
    reasoning = 'High pedestrian or vehicular risk, acute public nuisance, or risk of rapid escalation if unaddressed.';
    immediateAction = `Mobilize ${department} field crew within 24 hours with safety markers.`;
    classification = `High-Priority ${category} Issue`;
  } else if (lowKeywords.some(w => fullText.includes(w))) {
    urgency = 'Low';
    reasoning = 'Minor civic inconvenience without immediate structural hazard or public health compromise.';
    immediateAction = 'Schedule into standard civic beat maintenance cycle within 7 business days.';
    classification = `Standard ${category} Maintenance Request`;
  } else {
    urgency = 'Medium';
    reasoning = 'Noticeable civic disruption affecting local residents; timely intervention prevents deterioration.';
    immediateAction = `Notify area supervisor in ${department} for site assessment within 48 hours.`;
  }

  // Create crisp 1-2 sentence summary
  const summary = `${title.trim().replace(/\.$/, '')}. Issue classified under ${category} requiring targeted field intervention at ${locationText || 'the reported area'}.`;

  return {
    summary,
    classification,
    urgency,
    urgencyReasoning: reasoning,
    recommendedDepartment: department,
    suggestedImmediateAction: immediateAction,
    aiConfidence: 0.94,
    isDemoMode: true
  };
}

/**
 * Main AI Analysis function
 */
export async function analyzeComplaintWithGemini(
  title: string,
  description: string,
  category: ComplaintCategory,
  locationText: string
): Promise<AIAnalysisResult> {
  if (!genAI || !config.isGeminiConfigured()) {
    return heuristicAnalyzeComplaint(title, description, category, locationText);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert AI Triage Engineer for the CivicResolve municipal grievance platform.
Analyze the following citizen complaint and return ONLY a valid JSON object matching the exact schema below.

Citizen Complaint:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- Location: ${locationText}

Routing Rules:
- Potholes / Damaged Roads -> "Road Maintenance Department"
- Overflowing Garbage / Waste -> "Sanitation Department"
- Water Leakage / Burst Pipes -> "Water Supply Department"
- Broken Streetlights / Wiring -> "Electrical Department"
- Drainage Blockages / Flooding -> "Drainage Department"
- Footpaths / Parks / Structures -> "Public Works Department"
- Others -> "General Grievance Cell"

Priority Rules:
- Critical: Open manholes, live wires, burst mains flooding homes, immediate danger to life.
- High: Severe potholes on main roads, uncollected waste for days near schools/hospitals, blocked drains causing waterlogging.
- Medium: Dark streets, broken park benches, moderate leaks.
- Low: Cosmetic wear, faded road markings, non-urgent suggestions.

Output JSON Format (do NOT wrap in markdown, do NOT include backticks, return raw JSON string only):
{
  "summary": "1 to 2 crisp, professional sentences summarizing the core issue and impact.",
  "classification": "Specific technical classification e.g. Road Infrastructure Hazard",
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "urgencyReasoning": "1 clear sentence explaining why this urgency was assigned.",
  "recommendedDepartment": "Exact department name from the routing rules",
  "suggestedImmediateAction": "Specific actionable next step for the field team.",
  "aiConfidence": 0.95
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean any markdown formatting if present
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    return {
      summary: parsed.summary || `${title}. Needs review by municipal team.`,
      classification: parsed.classification || `${category} Grievance`,
      urgency: (['Low', 'Medium', 'High', 'Critical'].includes(parsed.urgency) ? parsed.urgency : 'Medium') as ComplaintPriority,
      urgencyReasoning: parsed.urgencyReasoning || 'Assessed based on public safety impact.',
      recommendedDepartment: (parsed.recommendedDepartment || routeDepartment(category, `${title} ${description}`)) as Department,
      suggestedImmediateAction: parsed.suggestedImmediateAction || 'Dispatch ward supervisor for site verification.',
      aiConfidence: typeof parsed.aiConfidence === 'number' ? parsed.aiConfidence : 0.95,
      isDemoMode: false
    };
  } catch (err) {
    console.warn('Gemini API call encountered an issue, falling back to Resilient Heuristic Mode:', err);
    return heuristicAnalyzeComplaint(title, description, category, locationText);
  }
}

/**
 * AI Assistant for Chat / Inquiries / Drafting Status Updates
 */
export async function runAIAssistant(
  query: string,
  complaintsContext: Complaint[],
  complaintId?: string
): Promise<{ answer: string; suggestedActions?: string[]; isDemoMode: boolean }> {
  // If specific complaint referenced
  const targetComplaint = complaintId
    ? complaintsContext.find(c => c.id.toLowerCase() === complaintId.toLowerCase())
    : null;

  if (!genAI || !config.isGeminiConfigured()) {
    // Smart heuristic response
    const qLower = query.toLowerCase();

    if (targetComplaint) {
      if (qLower.includes('draft') || qLower.includes('update') || qLower.includes('status')) {
        return {
          answer: `Here is a drafted status update for **${targetComplaint.id}**:\n\n"Field inspection conducted by ${targetComplaint.department}. Issue verified as ${targetComplaint.aiAnalysis.classification} with ${targetComplaint.priority} priority. Work crew has been assigned to initiate '${targetComplaint.aiAnalysis.suggestedImmediateAction}'. Estimated completion within 24-48 hours. Thank you for your patience."`,
          suggestedActions: [
            `Apply update to ${targetComplaint.id}`,
            'Send SMS notification to citizen',
            'Request drone inspection'
          ],
          isDemoMode: true
        };
      }
      return {
        answer: `**${targetComplaint.id} (${targetComplaint.title})**\n- **Status:** ${targetComplaint.status}\n- **Priority:** ${targetComplaint.priority}\n- **Department:** ${targetComplaint.department}\n- **AI Summary:** ${targetComplaint.aiAnalysis.summary}\n- **Suggested Action:** ${targetComplaint.aiAnalysis.suggestedImmediateAction}`,
        suggestedActions: ['Update Status to In Progress', 'Reassign Department', 'View on Map'],
        isDemoMode: true
      };
    }

    // General queries
    if (qLower.includes('critical') || qLower.includes('high') || qLower.includes('urgent')) {
      const highIssues = complaintsContext.filter(c => c.priority === 'Critical' || c.priority === 'High');
      const list = highIssues
        .slice(0, 4)
        .map(c => `• **${c.id}** [${c.priority}] (${c.department}): ${c.title} - *Status: ${c.status}*`)
        .join('\n');
      return {
        answer: `There are currently **${highIssues.length} high/critical priority complaints** needing immediate attention:\n\n${list}\n\nRecommended: Prioritize dispatching teams for water leaks and hazardous road craters first.`,
        suggestedActions: ['Filter Admin Table by High/Critical', 'Notify Ward Engineers', 'Export Daily SitRep'],
        isDemoMode: true
      };
    }

    if (qLower.includes('pothole') || qLower.includes('road')) {
      const roadIssues = complaintsContext.filter(c => c.category === 'Potholes & Roads');
      return {
        answer: `Currently tracking **${roadIssues.length} road & pothole grievances**. The most critical is located near Anna Salai (${roadIssues[0]?.id || 'CR-2026-1001'}). Asphalt repair crews have been alerted.`,
        suggestedActions: ['View Road Issues on Map', 'Contact Road Maintenance Dept'],
        isDemoMode: true
      };
    }

    return {
      answer: `CivicResolve AI Assistant is active. Currently monitoring **${complaintsContext.length} total civic complaints** across Chennai and municipal zones.\n\nYou can ask me to:\n- *"Summarize today's critical road issues"*\n- *"Draft a status update for CR-2026-1001"*\n- *"Which department has the most pending grievances?"*`,
      suggestedActions: [
        'Summarize today\'s critical road issues',
        'Draft update for CR-2026-1001',
        'Department workload overview'
      ],
      isDemoMode: true
    };
  }

  // Live Gemini Assistant
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const contextSummary = complaintsContext.slice(0, 15).map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      department: c.department,
      location: c.location.address
    }));

    const prompt = `
You are the CivicResolve AI Assistant for municipal admins and citizens.
Current active complaints in system:
${JSON.stringify(contextSummary, null, 2)}

${targetComplaint ? `Citizen / Admin is asking about specific complaint: ${JSON.stringify(targetComplaint)}` : ''}

User Query: "${query}"

Respond concisely, professionally, and helpfully. If the user asks to draft a message or update, provide a polished ready-to-use template. If summarizing, highlight key actionable points.
`;

    const res = await model.generateContent(prompt);
    return {
      answer: res.response.text(),
      suggestedActions: ['Apply Recommended Action', 'View in Map', 'Export Report'],
      isDemoMode: false
    };
  } catch (err) {
    console.warn('Gemini Assistant fallback:', err);
    return {
      answer: `AI Assistant (Demo Fallback): Found ${complaintsContext.length} registered civic grievances. All systems are operational.`,
      isDemoMode: true
    };
  }
}
