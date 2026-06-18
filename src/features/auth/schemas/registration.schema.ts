import type { TFunction } from 'i18next';
import { z } from 'zod';
import { PROFILE_VISIBILITY_VALUES } from '@/lib/models';

export const CODE_LENGTH = 6;
export const NAME_MAX_LENGTH = 50;
export const PASSWORD_MAX_LENGTH = 128;
export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 20;
export const BIO_MAX_LENGTH = 500;

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ '-]+$/;
const HANDLE_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
export const VERIFICATION_CODE_PATTERN = /^[A-F0-9]{6}$/;

export const createRegistrationSchema = (t: TFunction) =>
	z
		.object({
			firstName: z
				.string()
				.trim()
				.min(1, t('RegistrationForm.validation.firstNameRequired'))
				.max(NAME_MAX_LENGTH, t('RegistrationForm.validation.nameMaxLength'))
				.regex(NAME_PATTERN, t('RegistrationForm.validation.nameFormat')),
			lastName: z
				.string()
				.trim()
				.min(1, t('RegistrationForm.validation.lastNameRequired'))
				.max(NAME_MAX_LENGTH, t('RegistrationForm.validation.nameMaxLength'))
				.regex(NAME_PATTERN, t('RegistrationForm.validation.nameFormat')),
			email: z
				.string()
				.trim()
				.toLowerCase()
				.pipe(z.email(t('RegistrationForm.validation.email'))),
			password: z
				.string()
				.min(8, t('RegistrationForm.validation.passwordMinLength'))
				.max(
					PASSWORD_MAX_LENGTH,
					t('RegistrationForm.validation.passwordMaxLength')
				),
			handle: z
				.string()
				.trim()
				.min(
					HANDLE_MIN_LENGTH,
					t('RegistrationForm.validation.handleMinLength')
				)
				.max(
					HANDLE_MAX_LENGTH,
					t('RegistrationForm.validation.handleMaxLength')
				)
				.regex(HANDLE_PATTERN, t('RegistrationForm.validation.handleFormat')),
			dateOfBirth: z.date().refine((date) => date < new Date(), {
				message: t('RegistrationForm.validation.dobPast'),
			}),
			bio: z
				.string()
				.max(BIO_MAX_LENGTH, t('RegistrationForm.validation.bioMaxLength'))
				.optional(),
			profileVisibility: z.enum(PROFILE_VISIBILITY_VALUES),
			verificationCode: z
				.string()
				.trim()
				.toUpperCase()
				.length(CODE_LENGTH, t('RegistrationForm.validation.codeLength'))
				.regex(
					VERIFICATION_CODE_PATTERN,
					t('RegistrationForm.validation.codeFormat')
				),
		})
		.strict();

export type RegistrationSchema = z.infer<
	ReturnType<typeof createRegistrationSchema>
>;
