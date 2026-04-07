export default async function handler(req, res) {
  console.log('Function called, method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  console.log('Message received:', message);

  const apiKey = process.env.NVIDIA_API_KEY;
  console.log('API key exists?', !!apiKey);
  
  if (!apiKey) {
    return res.status(500).json({ error: 'NVIDIA_API_KEY not set' });
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-v3.1",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    console.log('NVIDIA response status:', response.status);

    if (!response.ok) {
      const errorMsg = data.error?.message || 'NVIDIA API error';
      return res.status(response.status).json({ error: errorMsg });
    }

    const reply = data.choices[0]?.message?.content || 'No reply generated.';
    res.status(200).json({ reply });
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).json({ error: err.message });
  }
}
