import { apiClient } from "@/lib/api/client";

import type {
  LogCreateRequest,
  LogCreateResponse,
  LogListResponse,
  LogUpdateRequest,
} from "../models";

export type GetLogsParams = {
  sortBy?: string;
  sortOrder?: string;
  watchedWhere?: string;
  dateWatchedFrom?: string;
  dateWatchedTo?: string;
};

export const createLog = async (
  request: LogCreateRequest,
): Promise<LogCreateResponse> => {
  return apiClient
    .post("v1/logs/", {
      json: request,
    })
    .json();
};

export const getLogs = async (
  params: GetLogsParams = {},
): Promise<LogListResponse> => {
  const searchParams: Record<string, string> = {};
  if (params.sortBy) searchParams.sortBy = params.sortBy;
  if (params.sortOrder) searchParams.sortOrder = params.sortOrder;
  if (params.watchedWhere) searchParams.watchedWhere = params.watchedWhere;
  if (params.dateWatchedFrom)
    searchParams.dateWatchedFrom = params.dateWatchedFrom;
  if (params.dateWatchedTo) searchParams.dateWatchedTo = params.dateWatchedTo;

  return apiClient
    .get("v1/logs/", {
      searchParams,
    })
    .json();
};

export const updateLog = async (
  logId: string,
  request: LogUpdateRequest,
): Promise<LogCreateResponse> => {
  return apiClient
    .put(`v1/logs/${logId}`, {
      json: request,
    })
    .json();
};
