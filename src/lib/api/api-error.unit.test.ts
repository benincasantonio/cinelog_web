import { HTTPError } from 'ky';
import { describe, expect, it } from 'vitest';
import { extractApiError, resolveApiFieldError } from './api-error';

function createHTTPError(body: Record<string, unknown>): HTTPError {
	const response = new Response(JSON.stringify(body), {
		status: 400,
		headers: { 'Content-Type': 'application/json' },
	});
	return new HTTPError(
		response,
		new Request('https://example.com'),
		{} as never
	);
}

describe('extractApiError', () => {
	it('should extract error_code_name from an HTTPError response', async () => {
		const err = createHTTPError({
			error_code_name: 'INVALID_CURRENT_PASSWORD',
			error_code: 4001,
			error_message: 'Invalid password',
			error_description: 'The current password is incorrect',
		});

		const result = await extractApiError(err);

		expect(result?.error_code_name).toBe('INVALID_CURRENT_PASSWORD');
	});

	it('should extract all fields from an HTTPError response', async () => {
		const err = createHTTPError({
			error_code_name: 'SAME_PASSWORD',
			error_code: 4002,
			error_message: 'Same password',
			error_description: 'Passwords must differ',
		});

		const result = await extractApiError(err);

		expect(result?.error_code_name).toBe('SAME_PASSWORD');
		expect(result?.error_code).toBe(4002);
		expect(result?.error_message).toBe('Same password');
		expect(result?.error_description).toBe('Passwords must differ');
	});

	it('should return null for non-HTTPError errors', async () => {
		const result = await extractApiError(new Error('generic'));

		expect(result).toBeNull();
	});

	it('should return null for non-Error values', async () => {
		const result = await extractApiError('string error');

		expect(result).toBeNull();
	});

	it('should return null when response body is not valid JSON', async () => {
		const response = new Response('not json', { status: 400 });
		const err = new HTTPError(
			response,
			new Request('https://example.com'),
			{} as never
		);

		const result = await extractApiError(err);

		expect(result).toBeNull();
	});
});

describe('resolveApiFieldError', () => {
	it('should return null for unknown error codes', () => {
		const t = ((key: string) => key) as never;

		expect(resolveApiFieldError('UNKNOWN_CODE', t)).toBeNull();
	});

	it('should return generic message when no override prefix is given', () => {
		const t = ((key: string) => `translated:${key}`) as never;

		const result = resolveApiFieldError('SAME_PASSWORD', t);

		expect(result).toEqual({
			field: 'newPassword',
			message: 'translated:ApiError.samePassword',
		});
	});

	it('should use override key when translation exists', () => {
		const translations: Record<string, string> = {
			'ChangePasswordForm.ApiError.samePassword': 'Custom override',
			'ApiError.samePassword': 'Generic message',
		};
		const t = ((key: string, opts?: { defaultValue?: string }) => {
			return translations[key] ?? opts?.defaultValue ?? key;
		}) as never;

		const result = resolveApiFieldError(
			'SAME_PASSWORD',
			t,
			'ChangePasswordForm'
		);

		expect(result?.message).toBe('Custom override');
	});

	it('should fall back to generic key when override does not exist', () => {
		const translations: Record<string, string> = {
			'ApiError.samePassword': 'Generic message',
		};
		const t = ((key: string, opts?: { defaultValue?: string }) => {
			return translations[key] ?? opts?.defaultValue ?? key;
		}) as never;

		const result = resolveApiFieldError('SAME_PASSWORD', t, 'SomeOtherForm');

		expect(result?.message).toBe('Generic message');
	});
});
