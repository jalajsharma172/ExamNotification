import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'exams.json');
    const examsData = fs.readFileSync(filePath, 'utf8');
    const exams = JSON.parse(examsData);
    
    // Insert all exams using upsert to avoid duplicates by name
    const { data, error } = await supabase
      .from('exams')
      .upsert(exams, { onConflict: 'name' })
      .select();
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, inserted: data?.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
