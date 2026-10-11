import api from './api';

export const plannerService = {
  async getTodayPlan() {
    const res = await api.get('/planner/today');
    return res.data;
  },

  async toggleTask(taskId) {
    const res = await api.patch(`/planner/tasks/${taskId}/toggle`);
    return res.data;
  },

  async getWeeklySummary() {
    const res = await api.get('/planner/weekly');
    return res.data;
  },
};
