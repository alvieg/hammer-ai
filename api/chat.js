// api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { message } = req.body;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || "[No reply]";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
