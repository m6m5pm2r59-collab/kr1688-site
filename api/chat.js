/**
 * KR1688 - Agnes AI Chat API Proxy
 * 
 * Vercel Serverless Function
 * Routes frontend chat requests to Agnes API without exposing API key in client code.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key existence
  if (!process.env.AGNES_API_KEY) {
    console.error('AGNES_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error: API key not found' });
  }

  try {
    const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGNES_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Agnes API error ${response.status}:`, JSON.stringify(data).slice(0, 500));
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API proxy error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
