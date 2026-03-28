import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('../components', () => ({
	UpdateProfileForm: () => <div data-testid="update-profile-form" />,
	ChangePasswordForm: () => <div data-testid="change-password-form" />,
}));

import ProfileSettingsPage from './ProfileSettingsPage';

describe('ProfileSettingsPage', () => {
	it('should render the profile section heading', () => {
		render(<ProfileSettingsPage />);

		expect(
			screen.getByText('ProfileSettingsPage.profileSection')
		).toBeInTheDocument();
	});

	it('should render the password section heading', () => {
		render(<ProfileSettingsPage />);

		expect(
			screen.getByText('ProfileSettingsPage.passwordSection')
		).toBeInTheDocument();
	});

	it('should render the UpdateProfileForm', () => {
		render(<ProfileSettingsPage />);

		expect(screen.getByTestId('update-profile-form')).toBeInTheDocument();
	});

	it('should render the ChangePasswordForm', () => {
		render(<ProfileSettingsPage />);

		expect(screen.getByTestId('change-password-form')).toBeInTheDocument();
	});
});
