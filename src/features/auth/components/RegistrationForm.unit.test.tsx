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
	useNavigate: () => mockNavigate,
}));

const mockRegister = vi.fn();
vi.mock('../stores', () => ({
	useAuthStore: () => ({ register: mockRegister }),
}));

const { shouldBypassValidation } = vi.hoisted(() => ({
	shouldBypassValidation: { value: false },
}));

vi.mock('@hookform/resolvers/zod', async () => {
	const actual = await vi.importActual('@hookform/resolvers/zod');
	return {
		...actual,
		zodResolver:
			(schema: unknown, ...rest: unknown[]) =>
			async (values: Record<string, unknown>, ...resolverArgs: unknown[]) => {
				if (shouldBypassValidation.value) {
					return { values, errors: {} };
				}
				return (actual as { zodResolver: Function }).zodResolver(
					schema,
					...rest
				)(values, ...resolverArgs);
			},
	};
});

import { RegistrationForm } from './RegistrationForm';

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
	await user.type(
		screen.getByPlaceholderText('RegistrationForm.firstName'),
		'John'
	);
	await user.type(
		screen.getByPlaceholderText('RegistrationForm.lastName'),
		'Doe'
	);
	await user.type(
		screen.getByPlaceholderText('RegistrationForm.email'),
		'john@example.com'
	);
	await user.type(
		screen.getByPlaceholderText('RegistrationForm.password'),
		'password123'
	);
	await user.type(
		screen.getByPlaceholderText('RegistrationForm.handle'),
		'johndoe'
	);

	const dateInput = screen.getByPlaceholderText('RegistrationForm.dateOfBirth');
	await userEvent.clear(dateInput);
	await userEvent.type(dateInput, '2000-01-01');
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
	await fillForm(user);
	await user.click(
		screen.getByRole('button', { name: 'RegistrationForm.submit' })
	);
}

describe('RegistrationForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		shouldBypassValidation.value = false;
	});

	describe('rendering', () => {
		it('should render all form fields', () => {
			render(<RegistrationForm />);

			expect(
				screen.getByPlaceholderText('RegistrationForm.firstName')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('RegistrationForm.lastName')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('RegistrationForm.email')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('RegistrationForm.password')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('RegistrationForm.handle')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('RegistrationForm.dateOfBirth')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('RegistrationForm.bioPlaceholder')
			).toBeInTheDocument();
		});

		it('should render the submit button', () => {
			render(<RegistrationForm />);

			expect(
				screen.getByRole('button', { name: 'RegistrationForm.submit' })
			).toBeInTheDocument();
		});
	});

	describe('date of birth input', () => {
		it('should set undefined when date input is cleared', async () => {
			const user = userEvent.setup();
			render(<RegistrationForm />);

			const dateInput = screen.getByPlaceholderText(
				'RegistrationForm.dateOfBirth'
			);
			await user.type(dateInput, '2000-01-01');
			await user.clear(dateInput);

			expect(dateInput).toHaveValue('');
		});

		it('should display the date formatted as YYYY-MM-DD when a value is set', async () => {
			const user = userEvent.setup();
			render(<RegistrationForm />);

			const dateInput = screen.getByPlaceholderText(
				'RegistrationForm.dateOfBirth'
			);
			await user.type(dateInput, '1995-06-15');

			expect(dateInput).toHaveValue('1995-06-15');
		});
	});

	describe('validation', () => {
		it('should not call register with empty fields', async () => {
			const user = userEvent.setup();
			render(<RegistrationForm />);

			await user.click(
				screen.getByRole('button', { name: 'RegistrationForm.submit' })
			);

			await waitFor(() => {
				expect(mockRegister).not.toHaveBeenCalled();
			});
		});
	});

	describe('successful submission', () => {
		it('should call register with form data', async () => {
			const user = userEvent.setup();
			mockRegister.mockResolvedValueOnce(undefined);
			render(<RegistrationForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(mockRegister).toHaveBeenCalledWith(
					expect.objectContaining({
						firstName: 'John',
						lastName: 'Doe',
						email: 'john@example.com',
						password: 'password123',
						handle: 'johndoe',
					})
				);
			});
		});

		it('should send empty string for dateOfBirth when not set', async () => {
			shouldBypassValidation.value = true;
			const user = userEvent.setup();
			mockRegister.mockResolvedValueOnce(undefined);
			render(<RegistrationForm />);

			// Fill all fields except dateOfBirth
			await user.type(
				screen.getByPlaceholderText('RegistrationForm.firstName'),
				'John'
			);
			await user.type(
				screen.getByPlaceholderText('RegistrationForm.lastName'),
				'Doe'
			);
			await user.type(
				screen.getByPlaceholderText('RegistrationForm.email'),
				'john@example.com'
			);
			await user.type(
				screen.getByPlaceholderText('RegistrationForm.password'),
				'password123'
			);
			await user.type(
				screen.getByPlaceholderText('RegistrationForm.handle'),
				'johndoe'
			);
			await user.click(
				screen.getByRole('button', { name: 'RegistrationForm.submit' })
			);

			await waitFor(() => {
				expect(mockRegister).toHaveBeenCalledWith(
					expect.objectContaining({
						dateOfBirth: '',
					})
				);
			});
		});

		it('should navigate to /login on success', async () => {
			const user = userEvent.setup();
			mockRegister.mockResolvedValueOnce(undefined);
			render(<RegistrationForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith('/login');
			});
		});

		it('should show submitting text while loading', async () => {
			const user = userEvent.setup();
			let resolvePromise: () => void;
			const promise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});
			mockRegister.mockReturnValueOnce(promise);
			render(<RegistrationForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(
					screen.getByRole('button', {
						name: 'RegistrationForm.submitting',
					})
				).toBeDisabled();
			});

			await act(async () => {
				resolvePromise!();
			});
		});
	});

	describe('error handling', () => {
		it('should show error message when register throws an Error', async () => {
			const user = userEvent.setup();
			mockRegister.mockRejectedValueOnce(new Error('Email already taken'));
			render(<RegistrationForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(screen.getByText('Email already taken')).toBeInTheDocument();
			});
		});

		it('should show generic error for non-Error exceptions', async () => {
			const user = userEvent.setup();
			mockRegister.mockRejectedValueOnce('unknown');
			render(<RegistrationForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(screen.getByText('RegistrationForm.error')).toBeInTheDocument();
			});
		});

		it('should not navigate when register fails', async () => {
			const user = userEvent.setup();
			mockRegister.mockRejectedValueOnce(new Error('fail'));
			render(<RegistrationForm />);

			await fillAndSubmit(user);

			await waitFor(() => {
				expect(screen.getByText('fail')).toBeInTheDocument();
			});
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
