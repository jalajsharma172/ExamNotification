import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    } else {
        return Response.json({ success: false, error: ".env file not found." }, { status: 404 });
    }
    
    const lines = envContent.split('\n');
    const keys = [];
    
    for (const line of lines) {
      const match = line.match(/^(GEMINI[^=]*)=(.*)$/);
      if (match) {
        keys.push({ name: match[1].trim(), key: match[2].trim() });
      }
    }
    
    return Response.json({ success: true, keys });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
