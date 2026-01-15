import { apiClient } from '@/lib/api/client';
import { auth } from '@/lib/firebase';
import type { StatsResponse } from '../models';

export type GetStatsParams = {
	yearFrom?: number;
	yearTo?: number;
};

const getAuthHeaders = async () => {
	const token = await auth.currentUser?.getIdToken();
	if (!token) throw new Error('Not authenticated');

	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
	};
};

export const getMyStats = async (
	params: GetStatsParams = {}
): Promise<StatsResponse> => {
	const headers = await getAuthHeaders();

	const searchParams: Record<string, string | number> = {};
	if (params.yearFrom) searchParams.yearFrom = params.yearFrom;
	if (params.yearTo) searchParams.yearTo = params.yearTo;

	return apiClient
		.get('v1/stats/me', {
			searchParams,
			headers,
		})
		.json();
};
