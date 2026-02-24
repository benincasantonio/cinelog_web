import ky from 'ky';
import {
	afterResponseInterceptor,
	beforeRequestInterceptor,
	beforeRetry,
} from './interceptors';

export const apiClient = ky.create({
	prefixUrl: import.meta.env.VITE_API_URL,
	retry: {
		limit: 1,
		methods: ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'],
	},
	credentials: 'include',
	hooks: {
		beforeRequest: [beforeRequestInterceptor],
		afterResponse: [afterResponseInterceptor],
		beforeRetry: [beforeRetry],
	},
});
