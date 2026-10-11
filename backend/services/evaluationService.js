/**
 * Evaluates quiz attempt answers strictly on the server.
 * Returns evaluated attempt details, score, points, topic analysis.
 */
function evaluateQuizSubmission(quiz, submittedAnswers, timeTaken = 0) {
  const totalQuestions = quiz.questions.length;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredCount = 0;

  const topicStats = {};

  const evaluatedAnswers = quiz.questions.map((q, index) => {
    // submittedAnswers is an array or object mapping index -> selectedOption index
    let userSelection = -1;
    if (Array.isArray(submittedAnswers)) {
      const match = submittedAnswers.find(a => a.questionIndex === index);
      if (match && typeof match.selectedOption === 'number') {
        userSelection = match.selectedOption;
      } else if (typeof submittedAnswers[index] === 'number') {
        userSelection = submittedAnswers[index];
      }
    } else if (submittedAnswers && typeof submittedAnswers === 'object') {
      if (typeof submittedAnswers[index] === 'number') {
        userSelection = submittedAnswers[index];
      }
    }

    const isAnswered = userSelection >= 0 && userSelection <= 3;
    const isCorrect = isAnswered && userSelection === q.correctAnswer;

    if (!isAnswered) {
      unansweredCount++;
    } else if (isCorrect) {
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }

    // Topic aggregation
    const topicName = q.topic || quiz.unit || 'General';
    if (!topicStats[topicName]) {
      topicStats[topicName] = { total: 0, correct: 0 };
    }
    topicStats[topicName].total += 1;
    if (isCorrect) {
      topicStats[topicName].correct += 1;
    }

    return {
      questionIndex: index,
      questionText: q.question,
      options: q.options,
      topic: topicName,
      selectedOption: userSelection,
      correctOption: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const score = correctAnswers;

  // Points calculation based on difficulty
  let basePointsPerQuestion = 15;
  if (quiz.difficulty === 'Easy') basePointsPerQuestion = 10;
  if (quiz.difficulty === 'Medium') basePointsPerQuestion = 15;
  if (quiz.difficulty === 'Hard') basePointsPerQuestion = 25;
  if (quiz.difficulty === 'Adaptive') basePointsPerQuestion = 20;

  let pointsAwarded = correctAnswers * basePointsPerQuestion;
  // Performance bonus for high accuracy
  if (accuracy >= 90 && totalQuestions >= 5) {
    pointsAwarded += 30; // Mastery bonus
  } else if (accuracy >= 75 && totalQuestions >= 5) {
    pointsAwarded += 15; // Distinction bonus
  }

  // Topic wise accuracy summary
  const topicBreakdown = Object.keys(topicStats).map(topic => {
    const stat = topicStats[topic];
    return {
      topic,
      total: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / stat.total) * 100),
    };
  });

  return {
    evaluatedAnswers,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredCount,
    score,
    accuracy,
    pointsAwarded,
    timeTaken,
    topicBreakdown,
  };
}

module.exports = {
  evaluateQuizSubmission,
};
