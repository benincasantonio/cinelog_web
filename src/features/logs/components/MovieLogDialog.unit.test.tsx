import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to ensure mock stores are available before vi.mock calls
const { mockMovieLogDialogStore, mockMovieLogStore } = vi.hoisted(() => {
	// biome-ignore lint/style/noCommonJs: require is needed inside vi.hoisted
	const { create } = require('zustand');

	const mockMovieLogDialogStore = create<{
		isOpen: boolean;
		prefilledMovie: null;
		movieToEdit: null;
	}>((set: (state: Partial<{ isOpen: boolean }>) => void) => ({
		isOpen: false,
		prefilledMovie: null,
		movieToEdit: null,
	}));

	const mockMovieLogStore = create<{
		isLoading: boolean;
		error: string | null;
	}>(() => ({
		isLoading: false,
		error: null,
	}));

	return { mockMovieLogDialogStore, mockMovieLogStore };
});

// Mock the stores first
vi.mock('../store', () => ({
	useMovieLogDialogStore: (selector: (state: unknown) => unknown) =>
		selector(mockMovieLogDialogStore.getState()),
}));

vi.mock('../store/movieLogStore', () => ({
	useMovieLogStore: (selector: (state: unknown) => unknown) =>
		selector(mockMovieLogStore.getState()),
}));

// Mock MovieLogForm component
vi.mock('./MovieLogForm', () => ({
	MovieLogForm: ({ formId }: { formId: string }) => (
		<form id={formId} data-testid="log-movie-form">
			Mock Form
		</form>
	),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock UI components from @antoniobenincasa/ui
vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		disabled,
		form,
		type,
		variant,
	}: {
		children: ReactNode;
		disabled?: boolean;
		form?: string;
		type?: string;
		variant?: string;
	}) => (
		<button
			disabled={disabled}
			form={form}
			type={type as 'button' | 'submit' | 'reset' | undefined}
			data-variant={variant}
		>
			{children}
		</button>
	),
	Dialog: ({
		children,
		open,
	}: {
		children: ReactNode;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}) => (open ? <div data-testid="dialog">{children}</div> : null),
	DialogClose: ({ children }: { children: ReactNode; asChild?: boolean }) => (
		<div data-testid="dialog-close">{children}</div>
	),
	DialogContent: ({
		children,
	}: {
		children: ReactNode;
		showCloseButton?: boolean;
		className?: string;
	}) => <div data-testid="dialog-content">{children}</div>,
	DialogDescription: ({ children }: { children: ReactNode }) => (
		<p data-testid="dialog-description">{children}</p>
	),
	DialogFooter: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-footer">{children}</div>
	),
	DialogHeader: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-header">{children}</div>
	),
	DialogTitle: ({ children }: { children: ReactNode }) => (
		<h2 data-testid="dialog-title">{children}</h2>
	),
}));

import { CreateMovieLogDialog } from './MovieLogDialog';

describe('CreateMovieLogDialog', () => {
	beforeEach(() => {
		mockMovieLogDialogStore.setState({
			isOpen: false,
			prefilledMovie: null,
			movieToEdit: null,
		});
		mockMovieLogStore.setState({
			isLoading: false,
			error: null,
		});
	});

	describe('Dialog Visibility', () => {
		it('should not render dialog content when isOpen is false', () => {
			mockMovieLogDialogStore.setState({ isOpen: false });

			render(<CreateMovieLogDialog />);

			expect(
				screen.queryByText('CreateMovieLogDialog.titleCreate')
			).not.toBeInTheDocument();
		});

		it('should render dialog content when isOpen is true', () => {
			mockMovieLogDialogStore.setState({ isOpen: true });

			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.titleCreate')
			).toBeInTheDocument();
			expect(
				screen.getByText('CreateMovieLogDialog.description')
			).toBeInTheDocument();
		});
	});

	describe('Dialog Content', () => {
		beforeEach(() => {
			mockMovieLogDialogStore.setState({ isOpen: true });
		});

		it('should render the dialog title', () => {
			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.titleCreate')
			).toBeInTheDocument();
		});

		it('should render the dialog description', () => {
			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.description')
			).toBeInTheDocument();
		});

		it('should render the MovieLogForm component', () => {
			render(<CreateMovieLogDialog />);

			expect(screen.getByTestId('log-movie-form')).toBeInTheDocument();
		});

		it('should render the close button', () => {
			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.close')
			).toBeInTheDocument();
		});

		it('should render the submit button', () => {
			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.submitCreate')
			).toBeInTheDocument();
		});
	});

	describe('Submit Button State', () => {
		beforeEach(() => {
			mockMovieLogDialogStore.setState({ isOpen: true });
		});

		it('should show submit text when not loading', () => {
			mockMovieLogStore.setState({ isLoading: false });

			render(<CreateMovieLogDialog />);

			const submitButton = screen.getByRole('button', {
				name: 'CreateMovieLogDialog.submitCreate',
			});
			expect(submitButton).toBeInTheDocument();
			expect(submitButton).not.toBeDisabled();
		});

		it('should show submitting text when loading', () => {
			mockMovieLogStore.setState({ isLoading: true });

			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.submittingCreate')
			).toBeInTheDocument();
		});

		it('should disable submit button when loading', () => {
			mockMovieLogStore.setState({ isLoading: true });

			render(<CreateMovieLogDialog />);

			const submitButton = screen.getByRole('button', {
				name: 'CreateMovieLogDialog.submittingCreate',
			});
			expect(submitButton).toBeDisabled();
		});

		it('should link submit button to form via form attribute', () => {
			render(<CreateMovieLogDialog />);

			const submitButton = screen.getByRole('button', {
				name: 'CreateMovieLogDialog.submitCreate',
			});
			expect(submitButton).toHaveAttribute('form', 'log-movie-form');
			expect(submitButton).toHaveAttribute('type', 'submit');
		});
	});

	describe('Form Integration', () => {
		beforeEach(() => {
			mockMovieLogDialogStore.setState({ isOpen: true });
		});

		it('should pass correct formId to MovieLogForm', () => {
			render(<CreateMovieLogDialog />);

			const form = screen.getByTestId('log-movie-form');
			expect(form).toHaveAttribute('id', 'log-movie-form');
		});
	});

	describe('Edit Mode', () => {
		beforeEach(() => {
			mockMovieLogDialogStore.setState({
				isOpen: true,
				movieToEdit: {
					id: '1',
					tmdbId: 123,
					movie: { title: 'Test Movie' },
					dateWatched: '2024-01-01',
					viewingNotes: null,
					watchedWhere: null,
				},
			});
		});

		it('should render the edit dialog title', () => {
			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.titleUpdate')
			).toBeInTheDocument();
		});

		it('should show update submit text', () => {
			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.submitUpdate')
			).toBeInTheDocument();
		});

		it('should show updating text when loading', () => {
			mockMovieLogStore.setState({ isLoading: true });

			render(<CreateMovieLogDialog />);

			expect(
				screen.getByText('CreateMovieLogDialog.submittingUpdate')
			).toBeInTheDocument();
		});
	});
});
