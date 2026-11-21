import { Router, Request, Response } from 'express';
import { complaintStore } from '../services/store';

const router = Router();

/**
 * GET /api/analytics - Dynamic KPIs, category, status and priority distribution
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const analytics = await complaintStore.getAnalytics();
    res.json({
      success: true,
      analytics,
      isDemoMode: !complaintStore.getUsingFirebase()
    });
  } catch (err: any) {
    console.error('Error in GET /api/analytics:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

export default router;
