import { create } from "zustand";
import {
  getMyStats,
  type GetStatsParams,
} from "../repositories/stats-repository";
import { type StatsResponse } from "../models";

interface StatsStore {
  stats: StatsResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: (params?: GetStatsParams) => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  fetchStats: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await getMyStats(params);
      set({ stats, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
