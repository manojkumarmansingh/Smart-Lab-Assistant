export default async function handler(req, res) {
  // 1. Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message: must be a non-empty string.' });
  }

  // 2. Read API key from environment variable
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error('Missing NVIDIA_API_KEY environment variable');
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  try {
    // 3. Call NVIDIA NIM (free tier, unlimited requests, 40 RPM)
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v3.1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful lab assistant specialized in chemistry, biology, lab safety, equipment handling, and experimental protocols. Answer concisely but thoroughly. If unsure, say "I recommend checking the lab manual or asking a supervisor."'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 0.9
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('NVIDIA API error:', response.status, data);
      const errorMsg = data.error?.message || `NVIDIA API returned ${response.status}`;
      return res.status(response.status).json({ error: errorMsg });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.warn('Empty reply from NVIDIA:', data);
      return res.status(500).json({ error: 'AI returned an empty response.' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Function crashed:', err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}
