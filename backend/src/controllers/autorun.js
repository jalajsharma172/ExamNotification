import  supabase from '../config/supabase.js';
import { getExamsFromDBDesc } from '../supabase/getExamsInfoFromDB.js';
import config from '../config/config.js';
export async function checkexam(req, res, next) {
    const list=config.geminiApiKeyList();
    let i=0;
    const data=await getExamsFromDBDesc();
    console.log("data",data);
    for (let i = 0; i < data.length; i++) { 
        let key=list[i];
        
    }
}


await checkexam();