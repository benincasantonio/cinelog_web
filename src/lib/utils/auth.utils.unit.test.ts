import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCsrfTokenFromCookie } from './auth.utils';

describe('auth.utils', () => {
	beforeEach(() => {
		// Clear all cookies before each test
		document.cookie.split(';').forEach((cookie) => {
			const name = cookie.split('=')[0].trim();
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
	});

	afterEach(() => {
		// Clean up cookies after each test
		document.cookie.split(';').forEach((cookie) => {
			const name = cookie.split('=')[0].trim();
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
	});

	describe('getCsrfTokenFromCookie', () => {
		it('should return null when no cookies are set', () => {
			const result = getCsrfTokenFromCookie();
			expect(result).toBeNull();
		});

		it('should return null when csrf_token cookie is not set', () => {
			document.cookie = 'other_cookie=value123';
			const result = getCsrfTokenFromCookie();
			expect(result).toBeNull();
		});

		it('should return the CSRF token when csrf_token cookie is set', () => {
			document.cookie = 'csrf_token=test-csrf-token-123';
			const result = getCsrfTokenFromCookie();
			expect(result).toBe('test-csrf-token-123');
		});

		it('should return the CSRF token when multiple cookies are set', () => {
			document.cookie = 'session_id=abc123';
			document.cookie = 'csrf_token=my-csrf-token';
			document.cookie = 'user_pref=dark';
			const result = getCsrfTokenFromCookie();
			expect(result).toBe('my-csrf-token');
		});

		it('should handle cookie value that contains special characters', () => {
			document.cookie = 'csrf_token=token-with-dashes-123';
			const result = getCsrfTokenFromCookie();
			expect(result).toBe('token-with-dashes-123');
		});
	});
});
