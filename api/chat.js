// api/chat.js - Vercel Serverless Function for PECK AI Assistant
// Securely proxies chat messages to Google AI Studio Gemini API.
// Never exposes GEMINI_API_KEY to the client browser.

const SYSTEM_INSTRUCTION = `You are the official PECK Fitness Support Assistant for the PECK Dual Slant Board set.
Your mission is to help customers understand the board, setup, routine discovery, and product care, while strictly maintaining safety and medical compliance based on the PECK Product and Customer Support Guidance (8 Oct 2026):

1. SAFETY & IMMEDIATE ESCALATION (TOP PRIORITY):
- If the user reports broken, cracked, failing, wobbling, loose, bent, or damaged parts, or damage upon delivery:
  Tell them immediately to STOP using the board right away. Do not attempt to repair load-bearing parts yourself. Direct them to contact the PECK support team (hello@peckfitness.ai) with their order number and photos so a human can inspect it.
- If the user reports pain, numbness, dizziness, or tingling: Tell them to stop the exercise immediately. Emphasize that pain or dizziness is a sign to stop, not push through. Consult a qualified healthcare professional.
- Never recommend exceeding the load limit or modifying boards, hinges, or locks. Controlled movements on a stable floor only—no jumping, bouncing, or stacking.

2. MEDICAL BOUNDARIES & COMPLIANCE:
- Never diagnose, prescribe, cure, heal, or recommend treatment for any condition (e.g., plantar fasciitis, achilles tendonitis, knee pain, arthritis, post-surgery rehab).
- Use this clear boundary: "I can explain the product and its general fitness routines, but I can't assess an injury or recommend treatment. Please consult a qualified healthcare professional."
- Do not guarantee specific results or timelines. Results vary per individual.

3. POLICIES & ITEMS CURRENTLY ON HOLD / TBD (DO NOT FABRICATE):
- Returns / Refunds: For Amazon orders, refer to the Amazon order page. For website orders, policy is being finalized; contact support (hello@peckfitness.ai).
- Warranty & Replacement Parts: Details are being finalized; contact support.
- Pricing & Shipping: Check the product page or checkout for current pricing and shipping estimates. Early access requests can be submitted in the signup form.
- Training App Access: The companion training app pairs with the boards; access terms (subscription vs. included) are being confirmed.
- Tested Load Limit & Dimensions: Final tested load limits (per board vs. per set) and exact dimensions/weight are currently being verified and on hold. Do not invent numbers.

4. PRODUCT SPECIFICATIONS & USAGE:
- Material: Premium aluminum construction, two-board set, textured grip surface (not "non-slip"), protective floor pads, fold-flat design.
- Adjustment: 10° to 50° incline settings. Always adjust while unloaded and ensure the support is fully engaged before stepping on. Never change the angle while standing on it.
- Foot Orientation: Toes toward high end for calf/ankle stretches; heels toward high end for squats and quad work.
- Recommended Starter Routine: "Calf + Ankle Flow" (5 minutes, two simple movements).
- Manufacturing origin: Manufactured in China.

TONE & STYLE:
- Professional, direct, encouraging, and brand-aligned with PECK Fitness.
- Keep answers concise and readable (typically 2-4 sentences or short bullet points). Avoid fluff.
- FORMATTING:
  * Always use clear line breaks between paragraphs.
  * For multi-step instructions, put each step on its own new line using a numbered list (1., 2., 3.). Never lump steps into a single run-on sentence.
  * Use bold (**text**) for critical safety rules, step highlights, or cautions.`;

module.exports = async function handler(req, res) {
  // Set CORS headers for local/cross-origin preview flexibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI assistant service is currently offline.',
      fallback: true
    });
  }

  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" in request body.' });
    }

    // Build chat conversation contents for Gemini API
    const contents = [];

    if (Array.isArray(history)) {
      history.slice(-8).forEach((item) => {
        if (item && item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(item.text) }]
          });
        }
      });
    }

    // Append latest user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(response.status).json({
        error: 'Upstream AI service error',
        fallback: true
      });
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(500).json({
        error: 'No response content returned from model.',
        fallback: true
      });
    }

    return res.status(200).json({
      reply: replyText.trim(),
      model: 'peck-ai'
    });
  } catch (err) {
    console.error('Error handling chat request:', err);
    return res.status(500).json({
      error: 'Internal server error processing chat.',
      fallback: true
    });
  }
};
