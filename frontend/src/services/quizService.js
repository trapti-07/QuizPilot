import api from './api';

export const quizService = {
  async generateQuiz(params) {
    const res = await api.post('/quizzes/generate', params);
    return res.data;
  },

  async getQuizById(id) {
    const res = await api.get(`/quizzes/${id}`);
    return res.data;
  },

  async submitQuiz(id, { answers, timeTaken }) {
    const res = await api.post(`/quizzes/${id}/submit`, { answers, timeTaken });
    return res.data;
  },

  async getQuizHistory() {
    const res = await api.get('/quizzes/history');
    return res.data;
  },

  async getAttemptById(attemptId) {
    const res = await api.get(`/quizzes/attempts/${attemptId}`);
    return res.data;
  },
};
