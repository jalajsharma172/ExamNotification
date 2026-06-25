import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  port: process.env.PORT || 5000,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  cronSecret: process.env.CRON_SECRET || '',
};

// Validate critical configurations
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Database integrations may fail.');
}

export default config;
