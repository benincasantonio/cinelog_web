import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import type { FieldValues, ResolverResult } from 'react-hook-form';
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

type ZodResolverFn = (
	schema: unknown,
	...rest: unknown[]
) => (
	values: FieldValues,
	...resolverArgs: unknown[]
) => Promise<ResolverResult<FieldValues>>;

vi.mock('@hookform/resolvers/zod', async () => {
	const actual = await vi.importActual<{ zodResolver: ZodResolverFn }>(
		'@hookform/resolvers/zod'
	);
	return {
		...actual,
		zodResolver:
			(schema: unknown, ...rest: unknown[]) =>
			async (values: Record<string, unknown>, ...resolverArgs: unknown[]) => {
				if (shouldBypassValidation.value) {
					return { values, errors: {} };
				}
				return actual.zodResolver(schema, ...rest)(values, ...resolverArgs);
			},
	};
});

import { RegistrationForm } from './RegistrationForm';

function fillForm() {
	fireEvent.change(screen.getByPlaceholderText('RegistrationForm.firstName'), {
		target: { value: 'John' },
	});
	fireEvent.change(screen.getByPlaceholderText('RegistrationForm.lastName'), {
		target: { value: 'Doe' },
	});
	fireEvent.change(screen.getByPlaceholderText('RegistrationForm.email'), {
		target: { value: 'john@example.com' },
	});
	fireEvent.change(screen.getByPlaceholderText('RegistrationForm.password'), {
		target: { value: 'password123' },
	});
	fireEvent.change(screen.getByPlaceholderText('RegistrationForm.handle'), {
		target: { value: 'johndoe' },
	});
	const dateInput = screen.getByPlaceholderText('RegistrationForm.dateOfBirth');
	fireEvent.change(dateInput, { target: { value: '2000-01-01' } });
}

function fillAndSubmit() {
	fillForm();
	fireEvent.click(
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
			render(<RegistrationForm />);

			const dateInput = screen.getByPlaceholderText(
				'RegistrationForm.dateOfBirth'
			);
			fireEvent.change(dateInput, { target: { value: '2000-01-01' } });
			fireEvent.change(dateInput, { target: { value: '' } });

			expect(dateInput).toHaveValue('');
		});

		it('should display the date formatted as YYYY-MM-DD when a value is set', async () => {
			render(<RegistrationForm />);

			const dateInput = screen.getByPlaceholderText(
				'RegistrationForm.dateOfBirth'
			);
			fireEvent.change(dateInput, { target: { value: '1995-06-15' } });

			expect(dateInput).toHaveValue('1995-06-15');
		});
	});

	describe('validation', () => {
		it('should not call register with empty fields', async () => {
			render(<RegistrationForm />);

			fireEvent.click(
				screen.getByRole('button', { name: 'RegistrationForm.submit' })
			);

			await waitFor(() => {
				expect(mockRegister).not.toHaveBeenCalled();
			});
		});
	});

	describe('successful submission', () => {
		it('should call register with form data', async () => {
			mockRegister.mockResolvedValueOnce(undefined);
			render(<RegistrationForm />);

			fillAndSubmit();

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
			mockRegister.mockResolvedValueOnce(undefined);
			render(<RegistrationForm />);

			// Fill all fields except dateOfBirth
			fireEvent.change(
				screen.getByPlaceholderText('RegistrationForm.firstName'),
				{ target: { value: 'John' } }
			);
			fireEvent.change(
				screen.getByPlaceholderText('RegistrationForm.lastName'),
				{
					target: { value: 'Doe' },
				}
			);
			fireEvent.change(screen.getByPlaceholderText('RegistrationForm.email'), {
				target: { value: 'john@example.com' },
			});
			fireEvent.change(
				screen.getByPlaceholderText('RegistrationForm.password'),
				{
					target: { value: 'password123' },
				}
			);
			fireEvent.change(screen.getByPlaceholderText('RegistrationForm.handle'), {
				target: { value: 'johndoe' },
			});
			fireEvent.click(
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
			mockRegister.mockResolvedValueOnce(undefined);
			render(<RegistrationForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith('/login');
			});
		});

		it('should show submitting text while loading', async () => {
			let resolvePromise: () => void;
			const promise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});
			mockRegister.mockReturnValueOnce(promise);
			render(<RegistrationForm />);

			fillAndSubmit();

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
			mockRegister.mockRejectedValueOnce(new Error('Email already taken'));
			render(<RegistrationForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(screen.getByText('Email already taken')).toBeInTheDocument();
			});
		});

		it('should show generic error for non-Error exceptions', async () => {
			mockRegister.mockRejectedValueOnce('unknown');
			render(<RegistrationForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(screen.getByText('RegistrationForm.error')).toBeInTheDocument();
			});
		});

		it('should not navigate when register fails', async () => {
			mockRegister.mockRejectedValueOnce(new Error('fail'));
			render(<RegistrationForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(screen.getByText('fail')).toBeInTheDocument();
			});
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
