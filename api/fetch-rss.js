export default async function handler(req, res) {
  const { url } = req.query;

  // Set CORS headers to allow access from the frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Helper function to fetch a URL with timeout and user agent
  const tryFetch = async (fetchUrl) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per attempt

      const response = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; INSparkRSS/1.0; +https://insparklab.com)'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      const trimmed = text.trim();

      // Basic validation: Check for XML/RSS/Atom or JSON (for some APIs) signatures
      const isXml = trimmed.startsWith('<') && (
        trimmed.includes('<rss') || 
        trimmed.includes('<feed') || 
        trimmed.includes('<rdf') ||
        trimmed.includes('<?xml')
      );
      
      const isJson = trimmed.startsWith('{');

      if (isXml || isJson) {
         // Exclude generic HTML pages that don't look like feeds
         if (trimmed.toLowerCase().startsWith('<!doctype html') && !contentType.includes('xml')) {
            return null;
         }
         return { content: text, type: isJson ? 'application/json' : 'text/xml' };
      }
      return null;

    } catch (e) {
      return null;
    }
  };

  // Logic: Sequential Guessing
  // 1. Try the exact URL first
  let result = await tryFetch(url);

  // 2. If failed, try common RSS suffixes
  if (!result) {
    const baseUrl = url.replace(/\/$/, '');
    const suffixes = [
      '/feed', 
      '/rss', 
      '/rss.xml', 
      '/feed.xml', 
      '/atom.xml', 
      '/index.xml'
    ];
    
    for (const suffix of suffixes) {
      result = await tryFetch(`${baseUrl}${suffix}`);
      if (result) break;
    }
  }

  if (result) {
    res.setHeader('Content-Type', result.type);
    return res.status(200).send(result.content);
  }

  return res.status(404).json({ error: 'Unable to find valid RSS feed' });
}