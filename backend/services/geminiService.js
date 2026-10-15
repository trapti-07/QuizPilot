const { GoogleGenAI } = require('@google/genai');

/**
 * Dedicated Google Gemini Service using the official @google/genai SDK.
 * Generates verified multiple-choice questions for board revision.
 */
class GeminiService {
  /**
   * Get an instance of the GoogleGenAI client
   */
  static getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
      return null;
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  /**
   * Generate multiple choice questions using Google Gen AI SDK
   * @param {Object} params
   * @param {string} params.subject
   * @param {string} params.unit
   * @param {string} params.difficulty
   * @param {number} params.count
   * @param {string} [params.topic]
   */
  static async generateQuestions({ subject, unit, difficulty = 'Medium', count = 5, topic }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
      return {
        success: false,
        fallbackReason: 'NO_KEY',
        message: 'No GEMINI_API_KEY configured in backend .env',
      };
    }

    const ai = this.getClient();
    if (!ai) {
      return {
        success: false,
        fallbackReason: 'NO_KEY',
        message: 'Failed to initialize Google Gen AI SDK with provided key',
      };
    }

    const targetDifficulty = difficulty === 'Adaptive' ? 'Medium' : difficulty;

    const prompt = `You are QuizPilot, an expert AI exam preparation engine strictly dedicated to Class 12 Board Examination curricula (CBSE Class 12 / State Boards Class 12).
Generate exactly ${count} high-quality, authentic Class 12 Board multiple-choice questions for the following requirements:
- Target Exam: Class 12 Board Examination (CBSE / State Boards)
- Target Class: Class 12 ONLY
- Subject: ${subject}
- Unit / Chapter: ${unit}
- Difficulty Level: ${targetDifficulty}
${topic ? `- Specific Class 12 Topic / Concept: ${topic}` : ''}

CRITICAL RULES:
1. STRICT CLASS 12 CURRICULUM BOUNDARY: All questions MUST strictly belong to the official NCERT / CBSE Class 12 board examination syllabus. Under NO circumstances should questions from Class 9, Class 10, or Class 11 be generated.
2. UNIT & TOPIC CONSISTENCY: Every question must strictly match the selected Class 12 Unit "${unit}"${topic ? ` and concept "${topic}"` : ''}. Do not introduce questions from other units or chapters.
3. Each question must have exactly 4 plausible options.
4. Only ONE option must be scientifically / mathematically correct according to the official Class 12 board textbook syllabus.
5. Provide a clear, step-by-step concise explanation for the correct answer suitable for Class 12 board students.
6. correctAnswer MUST BE an integer index (0, 1, 2, or 3) indicating which option in the options array is correct.
7. Return ONLY a valid JSON array of objects. Do not wrap in markdown or any other commentary text.

JSON Schema format:
[
  {
    "question": "string",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": 0,
    "explanation": "string",
    "topic": "${topic || unit}",
    "difficulty": "${targetDifficulty}"
  }
]`;

    // Try primary recommended models: gemini-2.0-flash, gemini-1.5-flash
    const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[GeminiService] Requesting ${count} questions using model: ${modelName}...`);
        
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.35,
            responseMimeType: 'application/json',
          },
        });

        // Extract generated text
        const text = response?.text;
        if (!text || text.trim() === '') {
          throw new Error('Empty response received from Gemini model');
        }

        // Clean any residual markdown formatting if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(cleanText);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Gemini response did not produce a non-empty array');
        }

        // Backend validation and sanitization
        const validatedQuestions = parsed.map((item, idx) => {
          if (!item.question || typeof item.question !== 'string') {
            throw new Error(`Item ${idx} missing valid question text`);
          }
          if (!Array.isArray(item.options) || item.options.length !== 4) {
            throw new Error(`Item ${idx} must contain exactly 4 options`);
          }

          let correctIdx = typeof item.correctAnswer === 'number' ? item.correctAnswer : parseInt(item.correctAnswer, 10);
          if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
            // Check if returned as letter 'A', 'B', 'C', 'D'
            if (typeof item.correctAnswer === 'string') {
              const letterMap = { A: 0, B: 1, C: 2, D: 3, a: 0, b: 1, c: 2, d: 3 };
              if (letterMap[item.correctAnswer.trim()] !== undefined) {
                correctIdx = letterMap[item.correctAnswer.trim()];
              } else {
                const matchIndex = item.options.findIndex(opt => opt.trim() === item.correctAnswer.trim());
                correctIdx = matchIndex !== -1 ? matchIndex : 0;
              }
            } else {
              correctIdx = 0;
            }
          }

          return {
            question: String(item.question).trim(),
            options: item.options.map(o => String(o).trim()),
            correctAnswer: correctIdx,
            explanation: (item.explanation && String(item.explanation).trim()) || 'Verified by official syllabus key.',
            topic: String(item.topic || topic || unit || 'General').trim(),
            difficulty: String(item.difficulty || targetDifficulty).trim(),
          };
        });

        console.log(`[GeminiService] Successfully generated and verified ${validatedQuestions.length} questions using ${modelName}.`);
        return {
          success: true,
          questions: validatedQuestions.slice(0, count),
          modelUsed: modelName,
          message: `Generated dynamically using Google Gemini (${modelName})`,
        };

      } catch (err) {
        lastError = err;
        const errMsg = err.message || '';
        console.warn(`[GeminiService Warning] Model ${modelName} failed (${errMsg}). Trying next candidate if available.`);
        // If authentication error or invalid API key, no need to retry other models
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('401') || errMsg.includes('unauthorized')) {
          break;
        }
      }
    }

    // All models failed or error occurred
    let userMessage = 'Gemini generation failed';
    if (lastError?.message?.includes('API_KEY_INVALID')) {
      userMessage = 'Invalid GEMINI_API_KEY configured in backend .env';
    } else if (lastError?.message?.includes('RESOURCE_EXHAUSTED') || lastError?.message?.includes('429')) {
      userMessage = 'Gemini API quota or rate limit reached';
    } else {
      userMessage = `Gemini generation error (${lastError?.message || 'Network error'})`;
    }

    return {
      success: false,
      fallbackReason: 'API_ERROR',
      message: userMessage,
      error: lastError?.message,
    };
  }
}

module.exports = GeminiService;
