import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { createRegistrationSchema } from './registration.schema';

const t = ((key: string) => key) as TFunction;
const validRegistration = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	password: 'password123',
	handle: 'johndoe',
	dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
	bio: '',
	verificationCode: 'ABC123',
};

describe('createRegistrationSchema', () => {
	it('accepts followers-only visibility', () => {
		const result = createRegistrationSchema(t).safeParse({
			...validRegistration,
			profileVisibility: 'followers_only',
		});

		expect(result.success).toBe(true);
	});

	it('rejects the legacy visibility value', () => {
		const result = createRegistrationSchema(t).safeParse({
			...validRegistration,
			profileVisibility: 'friends_only',
		});

		expect(result.success).toBe(false);
	});
});
