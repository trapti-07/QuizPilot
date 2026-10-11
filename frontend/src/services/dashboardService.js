import api from './api';

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  async getRecentActivity() {
    const res = await api.get('/dashboard/recent-activity');
    return res.data;
  },
};
