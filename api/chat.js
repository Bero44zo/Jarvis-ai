export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Nur POST-Anfragen sind erlaubt."
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Keine Nachricht erhalten."
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions:
          "Du bist JARVIS, der persönliche KI-Assistent des Benutzers. Antworte hilfreich, präzise und auf Deutsch, sofern der Benutzer nicht eine andere Sprache verwendet.",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API Fehler."
      });
    }

    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({
      reply: reply || "Ich konnte keine Antwort erzeugen."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Interner Serverfehler."
    });
  }
}
