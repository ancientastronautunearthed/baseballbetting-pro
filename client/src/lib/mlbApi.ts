import { apiRequest } from './queryClient';
import type { Game, Prediction, News } from '@shared/schema';

export interface GameWithPrediction extends Game {
  prediction?: Prediction;
}

export const fetchTodaysPicks = async (): Promise<GameWithPrediction[]> => {
  const res = await apiRequest('GET', '/api/picks/today');
  return res.json();
};

export const fetchPicksByDate = async (date: string): Promise<GameWithPrediction[]> => {
  const res = await apiRequest('GET', `/api/picks?date=${date}`);
  return res.json();
};

export const fetchGameDetails = async (gameId: number): Promise<GameWithPrediction> => {
  const res = await apiRequest('GET', `/api/games/${gameId}`);
  return res.json();
};

export const fetchLatestNews = async (): Promise<News[]> => {
  const res = await apiRequest('GET', '/api/news/latest');
  return res.json();
};

export const fetchAllNews = async (): Promise<News[]> => {
  const res = await apiRequest('GET', '/api/news');
  return res.json();
};

export const fetchNewsByCategory = async (category: string): Promise<News[]> => {
  const res = await apiRequest('GET', `/api/news/category/${category}`);
  return res.json();
};

export const fetchAnalytics = async () => {
  const res = await apiRequest('GET', '/api/analytics');
  return res.json();
};

export const fetchPerformanceByDate = async (startDate: string, endDate: string) => {
  const res = await apiRequest('GET', `/api/analytics/performance?start=${startDate}&end=${endDate}`);
  return res.json();
};
