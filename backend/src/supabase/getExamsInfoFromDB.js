import supabase from '../config/supabase.js';


/**
 * Fetches all exams from Supabase ordered by last_checked_at.
 */
export async function getExamsFromDB() {
  const { data: exams, error } = await supabase
    .from('Exams')
    .select('*')
    .order('id');

  if (error) throw error;
  return exams || [];
}


// Test
// console.log(await getExamsFromDB());  

export async function get__ExamsBasedOnQueue() {

  const { data: first__Row, error: first__Error } = await supabase
    .from("Exams")
    .select("ID, Count")
    .eq("ID", 1)
    .single();
  if (first__Error) throw first__Error;

  const count = first__Row.Count;

  const { data: Exams, error: Exams__Error } = await supabase
    .from('Exams')
    .select("*")
    .lt('Count', count)
    .order("ID", { ascending: true });

  if (Exams__Error) throw Exams__Error;

  if (!Exams || Exams.length === 0) {
    const { data: All___Exams, error: All___ExamsError } = await supabase
      .from('Exams')
      .select("*")
      .order("ID", { ascending: true });

    if (All___ExamsError) throw All___ExamsError;
    return All___Exams || [];
  }

  return Exams || [];
}

// //(ID:3,Count)=>ID 1 , 2 Done
// const data= await set__ExamsBasedOnQueue__Count(3,3);
// console.log(data);
export async function set__ExamsBasedOnQueue__Count(id, count) {
  const { data: exam, error } = await supabase
    .from("Exams")
    .update({ Count: count })
    .lt("ID", id)
    .select("ID, Count");

  if (error) throw new Error(`Can't update exam: ${error.message}`);
  return exam || [];

}
