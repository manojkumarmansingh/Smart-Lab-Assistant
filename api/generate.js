export default async function handler(req, res) {
  const { experiment } = req.body;

  const API_KEY = "AIzaSyBVtatTtrulViRZn3s4A_qyjP4b9cDug3Q";

  const response = await fetch(
    https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY},
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: Explain the experiment ${experiment} with aim, materials, procedure, safety, and result
          }]
        }]
      })
    }
  );

  const data = await response.json();

  res.status(200).json({
    result: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
  });
}
