import ky from 'ky';
import { beforeRequestInterceptor, beforeRetry } from './interceptors';

export const apiClient = ky.create({
	prefixUrl: import.meta.env.VITE_API_URL,
	retry: {
		limit: 1,
		statusCodes: [401],
	},
	credentials: 'include',
	hooks: {
		beforeRequest: [beforeRequestInterceptor],
		beforeRetry: [beforeRetry],
	},
});
