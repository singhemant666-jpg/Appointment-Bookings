// Symptoms -> kaunsa specialist dikhana chahiye.
// ANTHROPIC_API_KEY ho to Claude use hoga, warna simple keyword fallback.

const KEYWORDS = {
  Cardiologist: ['chest', 'heart', 'bp', 'blood pressure', 'palpitation', 'seene'],
  Dermatologist: ['skin', 'rash', 'acne', 'hair', 'itch', 'pimple', 'allergy'],
  Pediatrician: ['child', 'baby', 'kid', 'infant', 'bacha', 'bachche'],
  Orthopedic: ['bone', 'joint', 'knee', 'back pain', 'fracture', 'shoulder', 'kamar'],
  'ENT Specialist': ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'kaan', 'gala'],
  Gynecologist: ['pregnan', 'period', 'menstrual', 'pcos'],
};

function keywordFallback(text) {
  const t = text.toLowerCase();
  for (const [spec, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => t.includes(w)))
      return { specialization: spec, reason: 'Symptoms ke keywords se match hua.', emergency: false, source: 'keywords' };
  }
  return { specialization: 'General Physician', reason: 'Pehle General Physician se mil lein.', emergency: false, source: 'keywords' };
}

async function suggestSpecialization(symptoms, available) {
  if (!process.env.ANTHROPIC_API_KEY) return keywordFallback(symptoms);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-sonnet-5-5',
        max_tokens: 300,
        system:
          'You help patients pick a doctor type for booking. You are NOT diagnosing. ' +
          `Choose exactly one from: ${available.join(', ')}. ` +
          'If symptoms sound like an emergency (chest pain with breathlessness, stroke signs, heavy bleeding) set "emergency" to true. ' +
          'Reply ONLY with JSON: {"specialization": string, "reason": string (one short Hinglish sentence), "emergency": boolean}',
        messages: [{ role: 'user', content: symptoms }],
      }),
    });
    const data = await res.json();
    const text = data.content?.map((c) => c.text || '').join('') || '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    if (!available.includes(parsed.specialization)) return keywordFallback(symptoms);
    return { ...parsed, source: 'ai' };
  } catch (e) {
    console.error('AI error, fallback used:', e.message);
    return keywordFallback(symptoms);
  }
}

module.exports = { suggestSpecialization };
