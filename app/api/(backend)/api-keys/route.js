export async function GET() {
  try {
    // Read GEMINI keys directly from process.env (works on local, Vercel, and Render)
    const keys = [];

    for (const [name, value] of Object.entries(process.env)) {
      if (name.startsWith('GEMINI') && value && value.trim() !== '') {
        keys.push({ name: name.trim(), key: value.trim() });
      }
    }

    return Response.json({ success: true, keys });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
