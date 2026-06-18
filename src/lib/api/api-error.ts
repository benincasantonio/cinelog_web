import type { TFunction } from 'i18next';
import { HTTPError } from 'ky';

export interface ApiErrorBody {
	error_code_name: string;
	error_code: number;
	error_message: string;
	error_description: string;
}

export interface ApiErrorFieldMapping {
	field: string;
	i18nKey: string;
}

export interface ResolvedFieldError {
	field: string;
	message: string;
}

export const API_ERROR_MAP: Record<string, ApiErrorFieldMapping> = {
	EMAIL_ALREADY_EXISTS: {
		field: 'email',
		i18nKey: 'ApiError.emailAlreadyExists',
	},
	HANDLE_ALREADY_TAKEN: {
		field: 'handle',
		i18nKey: 'ApiError.handleAlreadyTaken',
	},
	INVALID_CURRENT_PASSWORD: {
		field: 'currentPassword',
		i18nKey: 'ApiError.invalidCurrentPassword',
	},
	SAME_PASSWORD: {
		field: 'newPassword',
		i18nKey: 'ApiError.samePassword',
	},
	EMAIL_VERIFICATION_CODE_REQUIRED: {
		field: 'verificationCode',
		i18nKey: 'ApiError.emailVerificationCodeRequired',
	},
	EMAIL_VERIFICATION_CODE_EXPIRED: {
		field: 'verificationCode',
		i18nKey: 'ApiError.emailVerificationCodeExpired',
	},
	INVALID_EMAIL_VERIFICATION_CODE: {
		field: 'verificationCode',
		i18nKey: 'ApiError.invalidEmailVerificationCode',
	},
	EMAIL_VERIFICATION_CODE_ATTEMPTS_EXCEEDED: {
		field: 'verificationCode',
		i18nKey: 'ApiError.emailVerificationCodeAttemptsExceeded',
	},
};

export function resolveApiFieldError(
	errorCodeName: string,
	t: TFunction,
	overridePrefix?: string
): ResolvedFieldError | null {
	const mapping = API_ERROR_MAP[errorCodeName];
	if (!mapping) return null;

	let i18nKey = mapping.i18nKey;

	if (overridePrefix) {
		const leafKey = mapping.i18nKey.split('.').pop()!;
		const overrideKey = `${overridePrefix}.ApiError.${leafKey}`;
		if (t(overrideKey, { defaultValue: '' }) !== '') {
			i18nKey = overrideKey;
		}
	}

	return {
		field: mapping.field,
		message: t(i18nKey),
	};
}

export async function extractApiError(
	err: unknown
): Promise<ApiErrorBody | null> {
	if (!(err instanceof HTTPError)) return null;
	return err.response.json().catch(() => null);
}
