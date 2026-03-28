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
	INVALID_CURRENT_PASSWORD: {
		field: 'currentPassword',
		i18nKey: 'ApiError.invalidCurrentPassword',
	},
	SAME_PASSWORD: {
		field: 'newPassword',
		i18nKey: 'ApiError.samePassword',
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
