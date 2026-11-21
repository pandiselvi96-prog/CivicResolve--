import { Router, Request, Response } from 'express';
import { complaintStore } from '../services/store';
import { detectDuplicates } from '../services/duplicateDetector';
import { runAIAssistant } from '../services/gemini';

const router = Router();

/**
 * POST /api/ai/check-duplicate - Pre-submission duplicate detection
 */
router.post('/check-duplicate', async (req: Request, res: Response) => {
  try {
    const { title, description, category, lat, lng } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        error: 'title or description required for duplicate check.'
      });
    }

    const latitude = parseFloat(lat) || 13.0827;
    const longitude = parseFloat(lng) || 80.2707;

    const existingComplaints = await complaintStore.getAll();

    const result = detectDuplicates(
      {
        title: title || '',
        description: description || '',
        category: category || 'Other',
        lat: latitude,
        lng: longitude
      },
      existingComplaints
    );

    res.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error('Error in POST /api/ai/check-duplicate:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/ai/assistant - AI Assistant for admins and citizens
 */
router.post('/assistant', async (req: Request, res: Response) => {
  try {
    const { query, complaintId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'query string is required.'
      });
    }

    const allComplaints = await complaintStore.getAll();
    const result = await runAIAssistant(query, allComplaints, complaintId);

    res.json({
      success: true,
      answer: result.answer,
      suggestedActions: result.suggestedActions || [],
      isDemoMode: result.isDemoMode
    });
  } catch (err: any) {
    console.error('Error in POST /api/ai/assistant:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

export default router;
