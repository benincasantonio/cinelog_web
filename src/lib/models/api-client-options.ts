import type { Options } from 'ky';

export interface ApiClientOptions extends Options {
	skipAuth?: boolean;
}
