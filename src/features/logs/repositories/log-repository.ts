import { apiClient } from "@/lib/api/client";
import { auth } from "@/lib/firebase";
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

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createLog = async (
  request: LogCreateRequest
): Promise<LogCreateResponse> => {
  const headers = await getAuthHeaders();

  return apiClient
    .post("v1/logs/", {
      json: request,
      headers,
    })
    .json();
};

export const getLogs = async (
  params: GetLogsParams = {}
): Promise<LogListResponse> => {
  const headers = await getAuthHeaders();

  const searchParams: Record<string, string> = {};
  if (params.sortBy) searchParams.sortBy = params.sortBy;
  if (params.sortOrder) searchParams.sortOrder = params.sortOrder;
  if (params.watchedWhere) searchParams.watchedWhere = params.watchedWhere;
  if (params.dateWatchedFrom) searchParams.dateWatchedFrom = params.dateWatchedFrom;
  if (params.dateWatchedTo) searchParams.dateWatchedTo = params.dateWatchedTo;

  return apiClient
    .get("v1/logs/", {
      searchParams,
      headers,
    })
    .json();
};

export const updateLog = async (
  logId: string,
  request: LogUpdateRequest
): Promise<LogCreateResponse> => {
  const headers = await getAuthHeaders();

  return apiClient
    .put(`v1/logs/${logId}`, {
      json: request,
      headers,
    })
    .json();
};

