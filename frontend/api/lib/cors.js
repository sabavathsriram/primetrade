// Minimal CORS helper for Vercel serverless functions
export function setCors(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}
