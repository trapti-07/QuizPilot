import api from './api';

export const leaderboardService = {
  async getLeaderboard() {
    const res = await api.get('/leaderboard');
    return res.data;
  },
};
