import { createClient } from "@supabase/supabase-js";
import config from "./config.js";
// console.log("URL:", config.supabaseUrl);
// console.log("KEY:", config.supabaseAnonKey);
// console.log("KEY length:", config.supabaseAnonKey?.length);

if (!config.supabaseUrl) {
  throw new Error("SUPABASE_URL is missing.");
}

if (!config.supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is missing.");
}

const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);
if(supabase){
  console.log("Supabase client created successfully.");
}else{
  console.error("Failed to create Supabase client.");  
}
export default supabase;
