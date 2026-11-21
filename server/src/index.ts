import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import complaintsRouter from './routes/complaints';
import aiRouter from './routes/ai';
import analyticsRouter from './routes/analytics';
import { complaintStore } from './services/store';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);

// System Health and Demo Status Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'CivicResolve',
    version: '1.0.0',
    demoMode: !config.isGeminiConfigured() || !complaintStore.getUsingFirebase(),
    geminiConfigured: config.isGeminiConfigured(),
    firebaseConfigured: complaintStore.getUsingFirebase(),
    timestamp: new Date().toISOString()
  });
});

// Serve Frontend Client Static Build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for undefined API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 CivicResolve API Server running on port ${config.port}`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🤖 Gemini API: ${config.isGeminiConfigured() ? 'LIVE' : 'DEMO MODE (Intelligent Heuristic Fallback)'}`);
  console.log(`🔥 Database: ${complaintStore.getUsingFirebase() ? 'FIRESTORE' : 'IN-MEMORY DEMO STORE'}`);
  console.log(`====================================================`);
});

export default app;
