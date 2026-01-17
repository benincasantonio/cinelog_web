import { apiClient } from "@/lib/api/client";
import type { StatsResponse } from "../models";

export type GetStatsParams = {
  yearFrom?: number;
  yearTo?: number;
};

export const getMyStats = async (
  params: GetStatsParams = {},
): Promise<StatsResponse> => {
  const searchParams: Record<string, string | number> = {};
  if (params.yearFrom) searchParams.yearFrom = params.yearFrom;
  if (params.yearTo) searchParams.yearTo = params.yearTo;

  return apiClient
    .get("v1/stats/me", {
      searchParams,
    })
    .json();
};
