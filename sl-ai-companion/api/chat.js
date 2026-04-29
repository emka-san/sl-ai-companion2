export default async function handler(req, res) {
  // Permite doar POST
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // LSL trimite JSON cu message si user_id
  const { message, user_id } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // sau 'llama-3.1-8b-versatile' pt viteză
        messages: [
          {
            role: 'system',
            content: 'Ești un companion AI în Second Life. Răspunde scurt în română, max 2 propoziții. Fii prietenos, ușor obraznic, amuzant. Nu folosi em dash.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.9,
        max_tokens: 120
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(500).json({ error: 'Groq error', details: err });
    }

    const data = await groqRes.json();
    const reply = data.choices[0].message.content.trim();

    // Răspuns pt LSL
    res.status(200).json({ reply: reply });

  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}