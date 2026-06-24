export async function POST(req) {
  try {
    const { key } = await req.json();
    
    if (!key) {
        return Response.json({ success: false, error: "Key is required" }, { status: 400 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return Response.json({ success: false, status: response.status, error: data.error?.message || 'Unknown error' });
    }
    
    return Response.json({ success: true, status: response.status });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
