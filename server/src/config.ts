import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or local server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to server/.env if present

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  isGeminiConfigured(): boolean {
    return !!this.geminiApiKey && this.geminiApiKey.trim().length > 10;
  },
  isFirebaseConfigured(): boolean {
    return (
      !!this.firebase.projectId &&
      !!this.firebase.clientEmail &&
      !!this.firebase.privateKey &&
      this.firebase.privateKey.length > 20
    );
  }
};
