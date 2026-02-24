import ky from 'ky';
import {
	afterResponseInterceptor,
	beforeRequestInterceptor,
	beforeRetryInterceptor,
} from './interceptors';

export const apiClient = ky.create({
	prefixUrl: import.meta.env.VITE_API_URL,
	retry: {
		limit: 1,
		methods: ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'],
		statusCodes: [401, 408, 413, 429, 500, 502, 503, 504],
	},
	credentials: 'include',
	hooks: {
		beforeRequest: [beforeRequestInterceptor],
		afterResponse: [afterResponseInterceptor],
		beforeRetry: [beforeRetryInterceptor],
	},
});
