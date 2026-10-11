import api from './api';

export const analyticsService = {
  async getWeakTopics() {
    const res = await api.get('/analytics/weak-topics');
    return res.data;
  },

  async getDifficultyRecommendation() {
    const res = await api.get('/analytics/difficulty');
    return res.data;
  },

  async getImprovementReport() {
    const res = await api.get('/analytics/improvement-report');
    return res.data;
  },
};

export const leaderboardService = {
  async getLeaderboard() {
    const res = await api.get('/leaderboard');
    return res.data;
  },
};
