import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
	useNavigate: () => mockNavigate,
}));

const mockLogin = vi.fn();
vi.mock('../stores', () => ({
	useAuthStore: () => ({ login: mockLogin }),
}));

import { LoginForm } from './LoginForm';

const validEmail = 'test@example.com';
const validPassword = 'password123';

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
	await user.type(screen.getByPlaceholderText('LoginForm.email'), validEmail);
	await user.type(
		screen.getByPlaceholderText('LoginForm.password'),
		validPassword
	);
	await user.click(screen.getByRole('button', { name: 'LoginForm.submit' }));
}

describe('LoginForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render the email input', () => {
			render(<LoginForm />);

			expect(
				screen.getByPlaceholderText('LoginForm.email')
			).toBeInTheDocument();
		});

		it('should render the password input', () => {
			render(<LoginForm />);

			expect(
				screen.getByPlaceholderText('LoginForm.password')
			).toBeInTheDocument();
		});

		it('should render the submit button', () => {
			render(<LoginForm />);

			expect(
				screen.getByRole('button', { name: 'LoginForm.submit' })
			).toBeInTheDocument();
		});

		it('should render the forgot password link', () => {
			render(<LoginForm />);

			const link = screen.getByText('LoginForm.forgotPassword');
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('href', '/forgot-password');
		});
	});

	describe('validation', () => {
		it('should not call login with empty fields', async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			await user.click(
				screen.getByRole('button', { name: 'LoginForm.submit' })
			);

			await waitFor(() => {
				expect(mockLogin).not.toHaveBeenCalled();
			});
		});
	});

	describe('successful submission', () => {
		it('should call login with email and password', async () => {
			const user = userEvent.setup();
			mockLogin.mockResolvedValueOnce(undefined);
			render(<LoginForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(mockLogin).toHaveBeenCalledWith(validEmail, validPassword);
			});
		});

		it('should navigate to / on success', async () => {
			const user = userEvent.setup();
			mockLogin.mockResolvedValueOnce(undefined);
			render(<LoginForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith('/');
			});
		});

		it('should show submitting text while loading', async () => {
			const user = userEvent.setup();
			let resolvePromise: () => void;
			const promise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});
			mockLogin.mockReturnValueOnce(promise);
			render(<LoginForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(
					screen.getByRole('button', { name: 'LoginForm.submitting' })
				).toBeDisabled();
			});

			await act(async () => {
				resolvePromise!();
			});
		});
	});

	describe('error handling', () => {
		it('should show error message when login throws an Error', async () => {
			const user = userEvent.setup();
			mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
			render(<LoginForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
			});
		});

		it('should show generic error for non-Error exceptions', async () => {
			const user = userEvent.setup();
			mockLogin.mockRejectedValueOnce('unknown');
			render(<LoginForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(screen.getByText('LoginForm.error')).toBeInTheDocument();
			});
		});

		it('should not navigate when login fails', async () => {
			const user = userEvent.setup();
			mockLogin.mockRejectedValueOnce(new Error('fail'));
			render(<LoginForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(screen.getByText('fail')).toBeInTheDocument();
			});
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
