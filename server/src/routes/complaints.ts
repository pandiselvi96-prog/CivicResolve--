import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { complaintStore } from '../services/store';
import { analyzeComplaintWithGemini } from '../services/gemini';
import { Complaint, ComplaintCategory, ComplaintStatus, Department, ComplaintPriority } from '../types';

const router = Router();

// Configure local uploads directory for optional citizen image attachment
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `photo-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted.'));
    }
  }
});

/**
 * GET /api/complaints - List all complaints with filtering and search
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, department, category, search } = req.query;

    const complaints = await complaintStore.getAll({
      status: status as string,
      priority: priority as string,
      department: department as string,
      category: category as string,
      search: search as string,
    });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
      isDemoMode: !complaintStore.getUsingFirebase()
    });
  } catch (err: any) {
    console.error('Error in GET /api/complaints:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/complaints/:id - Get a single complaint by Unique ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const complaint = await complaintStore.getById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: `Complaint with ID "${id}" was not found.`
      });
    }

    res.json({
      success: true,
      complaint,
      isDemoMode: !complaintStore.getUsingFirebase()
    });
  } catch (err: any) {
    console.error('Error in GET /api/complaints/:id:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/complaints - Create a new complaint with AI analysis
 */
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const {
      citizenName,
      citizenEmail,
      title,
      description,
      category,
      address,
      lat,
      lng,
      imageUrl: directImageUrl
    } = req.body;

    // Validation
    if (!citizenName || !citizenEmail || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'citizenName, citizenEmail, title, description, and category are mandatory.'
      });
    }

    // Coordinates fallback if not provided (default to central Chennai coordinates)
    const latitude = parseFloat(lat) || 13.0827;
    const longitude = parseFloat(lng) || 80.2707;
    const formattedAddress = address || 'Chennai Central Municipal Zone, Tamil Nadu';

    // Image path
    let finalImageUrl = directImageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    // Call Gemini AI Triage Engine
    const aiAnalysis = await analyzeComplaintWithGemini(
      title,
      description,
      category as ComplaintCategory,
      formattedAddress
    );

    // Build unique ID and record
    const id = complaintStore.generateId();
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id,
      citizenName: citizenName.trim(),
      citizenEmail: citizenEmail.trim(),
      title: title.trim(),
      description: description.trim(),
      category: category as ComplaintCategory,
      location: {
        address: formattedAddress,
        lat: latitude,
        lng: longitude
      },
      imageUrl: finalImageUrl,
      status: 'Submitted',
      priority: aiAnalysis.urgency,
      department: aiAnalysis.recommendedDepartment,
      aiAnalysis,
      upvotes: 1,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: now,
          note: 'Complaint submitted by citizen and analyzed by CivicResolve AI Engine.'
        }
      ]
    };

    const saved = await complaintStore.create(newComplaint);

    res.status(201).json({
      success: true,
      message: 'Complaint successfully registered and analyzed.',
      complaint: saved,
      isDemoMode: aiAnalysis.isDemoMode
    });
  } catch (err: any) {
    console.error('Error in POST /api/complaints:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

/**
 * PATCH /api/complaints/:id - Update status, department, priority or resolution notes
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, department, priority, resolutionNotes, updaterNote, updaterName } = req.body;

    const updates: Partial<Complaint> = {};
    if (status) updates.status = status as ComplaintStatus;
    if (department) updates.department = department as Department;
    if (priority) updates.priority = priority as ComplaintPriority;
    if (resolutionNotes !== undefined) updates.resolutionNotes = resolutionNotes;

    const updated = await complaintStore.update(id, updates, updaterNote, updaterName);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Complaint with ID "${id}" was not found.`
      });
    }

    res.json({
      success: true,
      message: `Complaint ${id} updated successfully.`,
      complaint: updated
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/complaints/:id:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/complaints/:id/upvote - Upvote a complaint
 */
router.post('/:id/upvote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const upvoted = await complaintStore.upvote(id);

    if (!upvoted) {
      return res.status(404).json({
        success: false,
        error: `Complaint with ID "${id}" was not found.`
      });
    }

    res.json({
      success: true,
      message: `Upvoted complaint ${id}.`,
      upvotes: upvoted.upvotes
    });
  } catch (err: any) {
    console.error('Error in POST /api/complaints/:id/upvote:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

export default router;
