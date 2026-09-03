const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL =
  process.env.OPENROUTER_FALLBACK_MODEL || 'inclusionai/ling-3.0-flash-fin:free';

async function callOpenRouter({ system, userMessage, maxTokens = 400 }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'http-referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'x-title': 'Flowee',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice) {
    throw new Error(`OpenRouter response had no choices: ${JSON.stringify(data)}`);
  }
  return choice.message.content;
}

module.exports = { callOpenRouter };
