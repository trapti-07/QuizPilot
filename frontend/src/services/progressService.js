import api from './api';

export const progressService = {
  async getTodayProgress() {
    const res = await api.get('/progress/today');
    return res.data;
  },

  async updateGoal(goalType, goalTarget) {
    const res = await api.put('/progress/goal', { goalType, goalTarget });
    return res.data;
  },

  async getWeeklyProgress() {
    const res = await api.get('/progress/weekly');
    return res.data;
  },
};
