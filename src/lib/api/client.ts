import ky from 'ky';
import {
	afterResponseInterceptor,
	beforeRequestInterceptor,
} from './interceptors';

export const apiClient = ky.create({
	prefixUrl: import.meta.env.VITE_API_URL,
	retry: 2,
	credentials: 'include',
	hooks: {
		beforeRequest: [beforeRequestInterceptor],
		afterResponse: [afterResponseInterceptor],
	},
});
