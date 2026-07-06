import dotenv from "dotenv";
import { getAllApiKeyList } from "./geminiApiKeyList.js";
import {getAllApiKeyMap} from "./getAllApiKeyMap.js";
dotenv.config({path: "../../.env"});

const config = {
  port: process.env.PORT || 5000,
  supabaseUrl: 'https://dxqwphgzohgcvphgthmf.supabase.co' || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: 'sb_publishable_eeXnRmu5sP9LVkSjL7IWwg_6GJajeOD' || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  cronSecret: process.env.CRON_SECRET || '',
  geminiApiKeyList: getAllApiKeyList() || [],
  geminiApiKeyMap: getAllApiKeyMap() ,
};


export default config;
