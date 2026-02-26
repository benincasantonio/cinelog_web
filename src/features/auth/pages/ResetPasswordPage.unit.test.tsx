import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

let mockLocationState: unknown = {};
const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
	Navigate: ({ to }: { to: string }) => (
		<div data-testid="navigate" data-to={to}>
			Redirecting
		</div>
	),
	useLocation: () => ({ state: mockLocationState }),
	useNavigate: () => mockNavigate,
	useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

let capturedProps: { email: string; initialCode?: string; onBack: () => void };
vi.mock('../components', () => ({
	ResetPasswordForm: (props: {
		email: string;
		initialCode?: string;
		onBack: () => void;
	}) => {
		capturedProps = props;
		return <div data-testid="reset-password-form">Form</div>;
	},
}));

import ResetPasswordPage from './ResetPasswordPage';

describe('ResetPasswordPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLocationState = {};
		mockSearchParams = new URLSearchParams();
	});

	it('should redirect to /forgot-password when no email is provided', () => {
		render(<ResetPasswordPage />);

		const navigate = screen.getByTestId('navigate');
		expect(navigate).toHaveAttribute('data-to', '/forgot-password');
	});

	it('should render the form when email is in location state', () => {
		mockLocationState = { email: 'test@example.com' };
		render(<ResetPasswordPage />);

		expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
	});

	it('should render the page title', () => {
		mockLocationState = { email: 'test@example.com' };
		render(<ResetPasswordPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe('ResetPasswordPage.pageTitle');
	});

	it('should render the card title and description', () => {
		mockLocationState = { email: 'test@example.com' };
		render(<ResetPasswordPage />);

		expect(screen.getByText('ResetPasswordPage.title')).toBeInTheDocument();
		expect(
			screen.getByText('ResetPasswordPage.description')
		).toBeInTheDocument();
	});

	it('should pass email from location state to ResetPasswordForm', () => {
		mockLocationState = { email: 'test@example.com' };
		render(<ResetPasswordPage />);

		expect(capturedProps.email).toBe('test@example.com');
	});

	it('should pass email from search params when not in state', () => {
		mockSearchParams = new URLSearchParams('email=param@example.com');
		render(<ResetPasswordPage />);

		expect(capturedProps.email).toBe('param@example.com');
	});

	it('should pass code from search params', () => {
		mockSearchParams = new URLSearchParams(
			'email=test@example.com&code=123456'
		);
		render(<ResetPasswordPage />);

		expect(capturedProps.initialCode).toBe('123456');
	});

	it('should clean search params on mount', () => {
		mockSearchParams = new URLSearchParams(
			'email=test@example.com&code=123456'
		);
		render(<ResetPasswordPage />);

		expect(mockSetSearchParams).toHaveBeenCalledWith(
			expect.any(URLSearchParams),
			{
				replace: true,
			}
		);
	});

	it('should navigate to /forgot-password when onBack is called', () => {
		mockLocationState = { email: 'test@example.com' };
		render(<ResetPasswordPage />);

		capturedProps.onBack();

		expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
	});
});
