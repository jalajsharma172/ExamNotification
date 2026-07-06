import supabase from '../config/supabase.js';


/**
 * Fetches all exams from Supabase ordered by last_checked_at.
 */
export async function getExamsFromDB() {
  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .order('last_checked_at', { ascending: true, nullsFirst: true });

  if (error) throw error;
  return exams || [];
}


// Test
// console.log(await getExamsFromDB());  

export async function getExamsFromDBDesc() {
  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .order('last_checked_at', { ascending: false, nullsFirst: true });

  if (error) throw error;
  return exams || [];
}

