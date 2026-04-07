export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get the message from the request
  const { message } = req.body;

  // 3. Get your secret API key from Vercel's environment variables
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NVIDIA_API_KEY environment variable is not set' });
  }

  try {
    // 4. Send the message to NVIDIA's AI
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-v3.1", // The specific AI model to use
        messages: [
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7, // Controls the "creativity" of the response
        max_tokens: 1024 // Limits the length of the response
      })
    });

    const data = await response.json();

    // 5. Handle any errors from the NVIDIA API
    if (!response.ok) {
      const errorMsg = data.error?.message || 'NVIDIA API error';
      return res.status(response.status).json({ error: errorMsg });
    }

    // 6. Extract the AI's reply and send it back to the frontend
    const reply = data.choices[0]?.message?.content || 'No reply generated.';
    res.status(200).json({ reply });
  } catch (err) {
    // 7. Handle any other unexpected errors
    console.error('Function error:', err);
    res.status(500).json({ error: err.message });
  }
}
