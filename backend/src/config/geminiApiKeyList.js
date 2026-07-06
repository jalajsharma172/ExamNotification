import dotenv from "dotenv";

dotenv.config({path: "../../.env"});

export function getAllApiKeyList() {
  const keys = [];

  for (const [envName, envValue] of Object.entries(process.env)) {
    if (
      envName.startsWith("GEMINI") &&
      typeof envValue === "string" &&
      envValue.trim() !== ""
    ) {
      keys.push(envValue.trim());
    }
  }

  return keys;
}

// For testing
// console.log(getAllApiKeys());