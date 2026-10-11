const GeminiService = require('./geminiService');
const { getQuestionsFromBank } = require('./questionBankService');

/**
 * Orchestrates quiz generation using the dedicated GeminiService (@google/genai SDK)
 * with automatic fallback to the verified Question Bank if Gemini is unavailable or fails.
 * 
 * Returns:
 * {
 *   questions: Array,
 *   source: 'ai' | 'question_bank',
 *   message: string,
 *   modelUsed?: string
 * }
 */
async function generateQuizQuestions({ subject, unit, difficulty, count = 5, topic }) {
  try {
    // Attempt generation via official Google Gen AI SDK
    const geminiResult = await GeminiService.generateQuestions({
      subject,
      unit,
      difficulty,
      count,
      topic,
    });

    if (geminiResult.success && Array.isArray(geminiResult.questions) && geminiResult.questions.length > 0) {
      return {
        questions: geminiResult.questions,
        source: 'ai',
        message: geminiResult.message || 'Generated dynamically using Google Gemini API',
        modelUsed: geminiResult.modelUsed,
      };
    }

    // Gemini generation was not successful (e.g. no key, rate limit, quota exceeded, invalid response)
    console.warn(`[AI Service] Gemini generation could not proceed (${geminiResult.message}). Activating Question Bank fallback.`);
    
    const fallbackQuestions = await getQuestionsFromBank({ subject, unit, difficulty, count, topic });

    let noticeMessage = 'Loaded verified Board Question Bank';
    if (geminiResult.fallbackReason === 'NO_KEY') {
      noticeMessage = 'Loaded from Verified Board Question Bank (Set GEMINI_API_KEY in backend .env to enable real-time Gemini generation)';
    } else {
      noticeMessage = `Loaded from Verified Board Question Bank (${geminiResult.message})`;
    }

    return {
      questions: fallbackQuestions,
      source: 'question_bank',
      message: noticeMessage,
    };

  } catch (error) {
    console.error(`[AI Service Error] Unexpected error during quiz generation:`, error);
    const fallbackQuestions = await getQuestionsFromBank({ subject, unit, difficulty, count, topic });
    return {
      questions: fallbackQuestions,
      source: 'question_bank',
      message: `Loaded from Verified Board Question Bank (${error.message})`,
    };
  }
}

module.exports = {
  generateQuizQuestions,
  GeminiService,
};
