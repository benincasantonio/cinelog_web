import { describe, expect, it } from 'vitest';
import { updateProfileSchema } from './update-profile.schema';

const schema = updateProfileSchema({
	firstNameRequired: 'First name is required',
	lastNameRequired: 'Last name is required',
	dateOfBirthRequired: 'Date of birth is required',
	dateOfBirthInvalidFormat: 'Date of birth has an invalid format',
	dateOfBirthInvalidDate: 'Date of birth is invalid',
	dateOfBirthPast: 'Date of birth must be in the past',
});

const validProfile = {
	firstName: 'Jane',
	lastName: 'Doe',
	bio: '',
	dateOfBirth: '1990-01-15',
};

describe('updateProfileSchema', () => {
	it('accepts followers-only visibility', () => {
		const result = schema.safeParse({
			...validProfile,
			profileVisibility: 'followers_only',
		});

		expect(result.success).toBe(true);
	});

	it('rejects the legacy visibility value', () => {
		const result = schema.safeParse({
			...validProfile,
			profileVisibility: 'friends_only',
		});

		expect(result.success).toBe(false);
	});
});
