import dotenv from "dotenv";

const respose=dotenv.config({path:"../../.env"});

export function getAllApiKeyMap(){
    const map={};
    
    for(const [envName, envValue] of Object.entries(process.env)){
        if(envName.startsWith("GEMINI") && typeof envValue==="string" && envValue.trim()!==""){
            map[envName]=envValue.trim();
        }
    }

    return map;
}
