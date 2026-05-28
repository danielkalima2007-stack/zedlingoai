exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { message, language } = JSON.parse(event.body);

  const systemPrompt = `You are ZedLingo AI, the first AI assistant built specifically for Zambia. 
You are helpful, warm, culturally aware, and speak like a knowledgeable Zambian friend.

The user has selected: ${language} as their language.

Language rules:
- If language is "Bemba": Respond primarily in Chibemba. Mix in some English only where needed. Start with a Bemba greeting.
- If language is "Nyanja": Respond primarily in Chinyanja. Mix in some English only where needed. Start with a Nyanja greeting.
- If language is "Tonga": Respond primarily in Tonga. Mix in some English only where needed. Start with a Tonga greeting.
- If language is "Lozi": Respond primarily in Lozi. Mix in some English only where needed. Start with a Lozi greeting.
- If language is "English": Respond fully in clear simple English.

Always be helpful, practical, and relevant to Zambian life and culture.
Keep responses concise and easy to understand.
Never say you can't speak these languages — always try your best.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env._GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error?.message || "Groq error" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error: " + err.message })
    };
  }
};
