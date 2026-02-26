import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
let mockPathname = '/login';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('react-router-dom', () => ({
	useLocation: () => ({ pathname: mockPathname }),
	useNavigate: () => mockNavigate,
}));

import { AuthTabs } from './AuthTabs';

describe('AuthTabs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPathname = '/login';
	});

	it('should render the login tab trigger', () => {
		render(
			<AuthTabs>
				<div>content</div>
			</AuthTabs>
		);

		expect(screen.getByText('AuthTabs.login')).toBeInTheDocument();
	});

	it('should render the registration tab trigger', () => {
		render(
			<AuthTabs>
				<div>content</div>
			</AuthTabs>
		);

		expect(screen.getByText('AuthTabs.registration')).toBeInTheDocument();
	});

	it('should render children content', () => {
		render(
			<AuthTabs>
				<div>child content</div>
			</AuthTabs>
		);

		expect(screen.getByText('child content')).toBeInTheDocument();
	});

	it('should navigate to /registration when registration tab is clicked', async () => {
		const user = userEvent.setup();
		render(
			<AuthTabs>
				<div>content</div>
			</AuthTabs>
		);

		await user.click(screen.getByText('AuthTabs.registration'));

		expect(mockNavigate).toHaveBeenCalledWith('/registration');
	});

	it('should navigate to /login when login tab is clicked', async () => {
		mockPathname = '/registration';
		const user = userEvent.setup();
		render(
			<AuthTabs>
				<div>content</div>
			</AuthTabs>
		);

		await user.click(screen.getByText('AuthTabs.login'));

		expect(mockNavigate).toHaveBeenCalledWith('/login');
	});

	it('should derive active tab from pathname', () => {
		mockPathname = '/registration';
		render(
			<AuthTabs>
				<div>content</div>
			</AuthTabs>
		);

		const registrationTrigger = screen.getByText('AuthTabs.registration');
		expect(registrationTrigger).toHaveAttribute('data-state', 'active');
	});

	it('should default to login tab when pathname has no segment', () => {
		mockPathname = '/';
		render(
			<AuthTabs>
				<div>content</div>
			</AuthTabs>
		);

		const loginTrigger = screen.getByText('AuthTabs.login');
		expect(loginTrigger).toHaveAttribute('data-state', 'active');
	});
});
