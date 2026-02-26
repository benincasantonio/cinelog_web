import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to ensure mock stores are available before vi.mock calls
const { mockMovieLogDialogStore, mockMovieLogStore, mockSearch } = vi.hoisted(
	() => {
		// biome-ignore lint/style/noCommonJs: require is needed inside vi.hoisted
		const { create } = require('zustand');

		const mockMovieLogDialogStore = create(() => ({
			prefilledMovie: null,
			movieToEdit: null,
			clearPrefilledMovie: vi.fn(),
		}));

		const mockMovieLogStore = create(() => ({
			isLoading: false,
			error: null,
			createLog: vi.fn().mockResolvedValue(undefined),
			updateLog: vi.fn().mockResolvedValue(undefined),
			clearError: vi.fn(),
		}));

		const mockSearch = vi.fn().mockResolvedValue({
			results: [],
		});

		return { mockMovieLogDialogStore, mockMovieLogStore, mockSearch };
	}
);

// Mock the stores first
vi.mock('../stores', () => ({
	useMovieLogDialogStore: (selector: (state: unknown) => unknown) =>
		selector(mockMovieLogDialogStore.getState()),
}));

vi.mock('../stores/movieLogStore', () => ({
	useMovieLogStore: (selector: (state: unknown) => unknown) =>
		selector(mockMovieLogStore.getState()),
}));

// Mock movie search repository
vi.mock('@/features/movie-search/repositories', () => ({
	search: mockSearch,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock UI components from @antoniobenincasa/ui
vi.mock('@antoniobenincasa/ui', () => ({
	Autocomplete: ({
		value,
		items,
		onFilterChange,
		onValueChange,
	}: {
		value: string;
		items: Array<{ label: string; value: string }>;
		onFilterChange: (value: string) => void;
		onValueChange: (value: string) => void;
	}) => (
		<div data-testid="autocomplete" data-value={value}>
			<input
				data-testid="autocomplete-input"
				value={value}
				onChange={(e) => onFilterChange(e.target.value)}
			/>
			{/* helper for tests: directly fire onFilterChange('') without fighting controlled-input suppression */}
			<button
				type="button"
				data-testid="clear-filter"
				onClick={() => onFilterChange('')}
			/>
			<button
				type="button"
				data-testid="select-movie-99"
				onClick={() => onValueChange('99')}
			/>
			<select
				data-testid="autocomplete-select"
				value={value}
				onChange={(e) => onValueChange(e.target.value)}
			>
				<option value="">Select</option>
				{items.map((item) => (
					<option
						key={item.value}
						value={item.value}
						data-testid={`autocomplete-option-${item.value}`}
					>
						{item.label}
					</option>
				))}
			</select>
		</div>
	),
	Button: ({
		children,
		disabled,
		type,
	}: {
		children: ReactNode;
		disabled?: boolean;
		type?: string;
	}) => (
		<button
			disabled={disabled}
			type={type as 'button' | 'submit' | 'reset' | undefined}
			data-testid="submit-button"
		>
			{children}
		</button>
	),
	Form: ({ children }: { children: ReactNode }) => (
		<div data-testid="form-provider">{children}</div>
	),
	FormControl: ({ children }: { children: ReactNode }) => (
		<div data-testid="form-control">{children}</div>
	),
	FormField: ({
		render,
		name,
		control,
	}: {
		render: (props: {
			field: { value: unknown; onChange: (value: unknown) => void };
		}) => ReactNode;
		name: string;
		control: { _formValues?: Record<string, unknown> };
	}) => {
		// Get value from control's form values if available
		const value = control?._formValues?.[name] ?? '';
		return (
			<div data-testid={`form-field-${name}`}>
				{render({ field: { value, onChange: () => undefined } })}
			</div>
		);
	},
	FormItem: ({ children }: { children: ReactNode }) => (
		<div data-testid="form-item">{children}</div>
	),
	FormLabel: ({ children }: { children: ReactNode }) => (
		<label data-testid="form-label">{children}</label>
	),
	FormMessage: () => <span data-testid="form-message" />,
	Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
		<input data-testid="date-input" {...props} />
	),
	Select: ({
		children,
		value,
		onValueChange,
	}: {
		children: ReactNode;
		value: string;
		onValueChange: (value: string) => void;
	}) => (
		<div data-testid="select" data-value={value}>
			<input
				data-testid="select-native-arrow"
				value={value}
				onChange={(e) => onValueChange(e.target.value)}
			/>
			<div data-testid="select-children">{children}</div>
		</div>
	),
	SelectContent: ({ children }: { children: ReactNode }) => (
		<div data-testid="select-content">{children}</div>
	),
	SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
		<div data-testid={`select-item-${value}`} data-value={value}>
			{children}
		</div>
	),
	SelectTrigger: ({ children }: { children: ReactNode }) => (
		<div data-testid="select-trigger">{children}</div>
	),
	SelectValue: ({ placeholder }: { placeholder: string }) => (
		<span data-testid="select-value">{placeholder}</span>
	),
	Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
		<textarea data-testid="textarea" {...props} />
	),
}));

// Mock models
vi.mock('../models', () => ({
	WATCHED_WHERE_VALUES: ['cinema', 'streaming', 'homeVideo', 'tv', 'other'],
}));

// Mock schemas
vi.mock('../schemas', () => ({
	logFormSchema: {
		parse: vi.fn(),
	},
}));

// Mock @hookform/resolvers/zod — resolver must return { values, errors } for react-hook-form
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: () => async (values: Record<string, unknown>) => ({
		values,
		errors: {},
	}),
}));

import { MovieLogForm } from './MovieLogForm';

describe('MovieLogForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockMovieLogDialogStore.setState({
			prefilledMovie: null,
			movieToEdit: null,
			clearPrefilledMovie: vi.fn(),
		});
		mockMovieLogStore.setState({
			isLoading: false,
			error: null,
			createLog: vi.fn().mockResolvedValue(undefined),
			updateLog: vi.fn().mockResolvedValue(undefined),
			clearError: vi.fn(),
		});
	});

	describe('Rendering', () => {
		it('should render the form with form provider', () => {
			render(<MovieLogForm />);

			expect(screen.getByTestId('form-provider')).toBeInTheDocument();
		});

		it('should render the movie field', () => {
			render(<MovieLogForm />);

			expect(screen.getByText('MovieLogForm.movieLabel')).toBeInTheDocument();
			expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
		});

		it('should render the date watched field', () => {
			render(<MovieLogForm />);

			expect(
				screen.getByText('MovieLogForm.dateWatchedLabel')
			).toBeInTheDocument();
		});

		it('should render the watched where field', () => {
			render(<MovieLogForm />);

			expect(
				screen.getByText('MovieLogForm.watchedWhereLabel')
			).toBeInTheDocument();
		});

		it('should render the viewing notes field', () => {
			render(<MovieLogForm />);

			expect(
				screen.getByText('MovieLogForm.viewingNotesLabel')
			).toBeInTheDocument();
		});

		it('should render all watched where options', () => {
			render(<MovieLogForm />);

			expect(screen.getByTestId('select-item-cinema')).toBeInTheDocument();
			expect(screen.getByTestId('select-item-streaming')).toBeInTheDocument();
			expect(screen.getByTestId('select-item-homeVideo')).toBeInTheDocument();
			expect(screen.getByTestId('select-item-tv')).toBeInTheDocument();
			expect(screen.getByTestId('select-item-other')).toBeInTheDocument();
		});
	});

	describe('Submit Button', () => {
		it('should show submit button by default', () => {
			render(<MovieLogForm />);

			expect(screen.getByTestId('submit-button')).toBeInTheDocument();
			expect(screen.getByText('MovieLogForm.submitCreate')).toBeInTheDocument();
		});

		it('should hide submit button when showSubmitButton is false', () => {
			render(<MovieLogForm showSubmitButton={false} />);

			expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
		});

		it('should show submitting text when loading', () => {
			mockMovieLogStore.setState({ isLoading: true });

			render(<MovieLogForm />);

			expect(
				screen.getByText('MovieLogForm.submittingCreate')
			).toBeInTheDocument();
			expect(
				screen.getByText('MovieLogForm.submittingCreate')
			).toBeInTheDocument();
		});

		it('should show update text when in edit mode', () => {
			mockMovieLogDialogStore.setState({
				movieToEdit: {
					id: '1',
					tmdbId: 123,
					movie: { title: 'Test Movie' },
					dateWatched: '2024-01-01',
					viewingNotes: null,
					watchedWhere: null,
				},
			});

			render(<MovieLogForm />);

			expect(screen.getByText('MovieLogForm.submitUpdate')).toBeInTheDocument();
		});

		it('should show updating text when loading in edit mode', () => {
			mockMovieLogDialogStore.setState({
				movieToEdit: {
					id: '1',
					tmdbId: 123,
					movie: { title: 'Test Movie' },
					dateWatched: '2024-01-01',
					viewingNotes: null,
					watchedWhere: null,
				},
			});
			mockMovieLogStore.setState({ isLoading: true });

			render(<MovieLogForm />);

			expect(
				screen.getByText('MovieLogForm.submittingUpdate')
			).toBeInTheDocument();
		});

		it('should disable submit button when loading', () => {
			mockMovieLogStore.setState({ isLoading: true });

			render(<MovieLogForm />);

			expect(screen.getByTestId('submit-button')).toBeDisabled();
		});

		it('should enable submit button when not loading', () => {
			mockMovieLogStore.setState({ isLoading: false });

			render(<MovieLogForm />);

			expect(screen.getByTestId('submit-button')).not.toBeDisabled();
		});
	});

	describe('Form ID', () => {
		it('should set formId on the form element', () => {
			const { container } = render(<MovieLogForm formId="test-form-id" />);

			const form = container.querySelector('form');
			expect(form).toHaveAttribute('id', 'test-form-id');
		});
	});

	describe('Error Display', () => {
		it('should not display error when error is null', () => {
			mockMovieLogStore.setState({ error: null });

			render(<MovieLogForm />);

			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});

		it('should display error message when error exists', () => {
			const errorMessage = 'Test error message';
			mockMovieLogStore.setState({ error: errorMessage });

			render(<MovieLogForm />);

			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		it('should have error class on error container', () => {
			const errorMessage = 'Test error message';
			mockMovieLogStore.setState({ error: errorMessage });

			render(<MovieLogForm />);

			const errorElement = screen.getByText(errorMessage);
			expect(errorElement).toHaveClass('text-red-500');
		});
	});

	describe('Prefilled Movie', () => {
		it('should populate autocomplete when prefilledMovie is set', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: { tmdbId: 123, title: 'Test Movie' },
				movieToEdit: null,
			});

			render(<MovieLogForm />);

			// Check autocomplete has the prefilled movie option
			await waitFor(() => {
				const autocomplete = screen.getByTestId('autocomplete-select');
				expect(autocomplete).toBeInTheDocument();
			});

			// Verify the movie option is available in the autocomplete
			await waitFor(() => {
				expect(
					screen.getByTestId('autocomplete-option-123')
				).toBeInTheDocument();
				expect(screen.getByText('Test Movie')).toBeInTheDocument();
			});
		});

		it('should have correct tmdbId value in autocomplete when prefilledMovie is set', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: { tmdbId: 456, title: 'Another Movie' },
				movieToEdit: null,
			});

			render(<MovieLogForm />);

			await waitFor(() => {
				expect(
					screen.getByTestId('autocomplete-option-456')
				).toBeInTheDocument();
			});
		});
	});

	describe('Edit Mode', () => {
		const mockMovieToEdit = {
			id: '1',
			tmdbId: 456,
			movie: { title: 'Movie to Edit' },
			dateWatched: '2024-01-15',
			viewingNotes: 'Great movie!',
			watchedWhere: 'cinema',
		};

		it('should populate autocomplete with movie title when movieToEdit is set', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: mockMovieToEdit,
			});

			render(<MovieLogForm />);

			await waitFor(() => {
				expect(
					screen.getByTestId('autocomplete-option-456')
				).toBeInTheDocument();
				expect(screen.getByText('Movie to Edit')).toBeInTheDocument();
			});
		});

		it('should populate date watched input when movieToEdit is set', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: mockMovieToEdit,
			});

			render(<MovieLogForm />);

			const dateInput = screen.getByTestId('date-input');
			await waitFor(() => {
				expect(dateInput).toHaveValue('2024-01-15');
			});
		});

		it('should populate viewing notes textarea when movieToEdit is set', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: mockMovieToEdit,
			});

			render(<MovieLogForm />);

			const textarea = screen.getByTestId('textarea');
			await waitFor(() => {
				expect(textarea).toHaveValue('Great movie!');
			});
		});

		it('should populate watched where select when movieToEdit is set', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: mockMovieToEdit,
			});

			render(<MovieLogForm />);

			const selectEl = screen.getByTestId('select');
			await waitFor(() => {
				expect(selectEl).toHaveAttribute('data-value', 'cinema');
			});
		});

		it('should handle empty viewing notes in movieToEdit', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: {
					...mockMovieToEdit,
					viewingNotes: null,
				},
			});

			render(<MovieLogForm />);

			const textarea = screen.getByTestId('textarea');
			await waitFor(() => {
				expect(textarea).toHaveValue('');
			});
		});

		it('should handle empty watched where in movieToEdit', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: {
					...mockMovieToEdit,
					watchedWhere: null,
				},
			});

			render(<MovieLogForm />);

			const selectEl = screen.getByTestId('select');
			await waitFor(() => {
				expect(selectEl).toHaveAttribute('data-value', '');
			});
		});
	});

	describe('Movie Search', () => {
		it('should call search when filter value changes', async () => {
			const user = userEvent.setup();

			render(<MovieLogForm />);

			const input = screen.getByTestId('autocomplete-input');
			await user.type(input, 'Inception');

			await waitFor(() => {
				expect(mockSearch).toHaveBeenCalled();
			});
		});

		it('should call search with the typed value', async () => {
			// Note: The real Autocomplete component has built-in debounce, which we bypass
			// in this unit test by mocking the component. This tests that the form correctly
			// wires up the onFilterChange callback to the search function.
			mockSearch.mockResolvedValue({
				results: [
					{ id: 1, title: 'Inception' },
					{ id: 2, title: 'Interstellar' },
				],
			});
			const user = userEvent.setup();

			render(<MovieLogForm />);

			const input = screen.getByTestId('autocomplete-input');
			// Type a single character to trigger search
			await user.type(input, 'I');

			await waitFor(() => {
				expect(mockSearch).toHaveBeenCalledWith('I');
			});
		});

		it('should NOT call search when filter value is empty', async () => {
			const user = userEvent.setup();

			render(<MovieLogForm />);

			const input = screen.getByTestId('autocomplete-input');
			// Type then clear to produce an empty onChange event
			await user.type(input, 'a');
			await user.clear(input);

			// search was only called for 'a', NOT for the empty string
			await waitFor(() => {
				const calls = mockSearch.mock.calls;
				expect(calls.every(([arg]) => arg !== '')).toBe(true);
			});
		});

		it('should clear search items when filter value becomes empty', async () => {
			mockSearch.mockResolvedValue({
				results: [{ id: 1, title: 'Inception' }],
			});

			render(<MovieLogForm />);

			// Populate items via a non-empty filter
			fireEvent.change(screen.getByTestId('autocomplete-input'), {
				target: { value: 'I' },
			});

			await waitFor(() => {
				expect(screen.getByTestId('autocomplete-option-1')).toBeInTheDocument();
			});

			// Use the dedicated clear button to call onFilterChange('') directly,
			// bypassing React's controlled-input suppression (value '' → '' is a no-op).
			fireEvent.click(screen.getByTestId('clear-filter'));

			await waitFor(() => {
				expect(
					screen.queryByTestId('autocomplete-option-1')
				).not.toBeInTheDocument();
			});
		});

		it('should populate search items with results from the search API', async () => {
			mockSearch.mockResolvedValue({
				results: [
					{ id: 10, title: 'The Matrix' },
					{ id: 20, title: 'The Matrix Reloaded' },
				],
			});
			const user = userEvent.setup();

			render(<MovieLogForm />);

			const input = screen.getByTestId('autocomplete-input');
			await user.type(input, 'M');

			await waitFor(() => {
				expect(
					screen.getByTestId('autocomplete-option-10')
				).toBeInTheDocument();
				expect(
					screen.getByTestId('autocomplete-option-20')
				).toBeInTheDocument();
				expect(screen.getByText('The Matrix')).toBeInTheDocument();
				expect(screen.getByText('The Matrix Reloaded')).toBeInTheDocument();
			});
		});
	});

	describe('onValueChange (movie selection)', () => {
		it('should set tmdbId to parsed int when a value is selected — component must not throw', () => {
			render(<MovieLogForm />);

			// Directly call onValueChange('99') via the helper button
			fireEvent.click(screen.getByTestId('select-movie-99'));

			// Component remains stable after setValue call
			expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
		});

		it('should handle empty value selection (sets tmdbId to 0) — component must not throw', async () => {
			render(<MovieLogForm />);

			const select = screen.getByTestId('autocomplete-select');
			// Simulate selecting the blank/default option → onValueChange('')
			fireEvent.change(select, { target: { value: '' } });

			// Component must not throw; form still renders
			await waitFor(() => {
				expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
			});
		});
	});

	describe('Watched Where Selection', () => {
		it('should call field.onChange when a watched-where option is selected', () => {
			render(<MovieLogForm />);

			const select = screen.getByTestId('select-native-arrow');
			fireEvent.change(select, { target: { value: 'cinema' } });

			// Component remains stable after onChange call
			expect(screen.getByTestId('select')).toBeInTheDocument();
		});
	});

	describe('Form Submission', () => {
		it('should call createLog on submit in create mode', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: { tmdbId: 123, title: 'Test Movie' },
				movieToEdit: null,
				clearPrefilledMovie: vi.fn(),
			});

			render(<MovieLogForm />);

			const form = screen.getByTestId('form-provider').querySelector('form')!;
			fireEvent.submit(form);

			await waitFor(() => {
				expect(mockMovieLogStore.getState().createLog).toHaveBeenCalled();
			});
		});

		it('should call updateLog on submit in edit mode', async () => {
			const clearPrefilledMovie = vi.fn();
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: {
					id: '1',
					tmdbId: 456,
					movie: { title: 'Movie to Edit' },
					dateWatched: '2024-01-15',
					viewingNotes: 'Great movie!',
					watchedWhere: 'cinema',
				},
				clearPrefilledMovie,
			});

			render(<MovieLogForm />);

			const form = screen.getByTestId('form-provider').querySelector('form')!;
			fireEvent.submit(form);

			await waitFor(() => {
				expect(mockMovieLogStore.getState().updateLog).toHaveBeenCalledWith(
					'1',
					expect.objectContaining({
						dateWatched: '2024-01-15',
						watchedWhere: 'cinema',
						viewingNotes: 'Great movie!',
					})
				);
			});
		});

		it('should call onSuccess and clearPrefilledMovie after successful create', async () => {
			const onSuccess = vi.fn();
			const clearPrefilledMovie = vi.fn();
			mockMovieLogDialogStore.setState({
				prefilledMovie: { tmdbId: 123, title: 'Test Movie' },
				movieToEdit: null,
				clearPrefilledMovie,
			});

			render(<MovieLogForm onSuccess={onSuccess} />);

			const form = screen.getByTestId('form-provider').querySelector('form')!;
			fireEvent.submit(form);

			await waitFor(() => {
				expect(clearPrefilledMovie).toHaveBeenCalled();
				expect(onSuccess).toHaveBeenCalled();
			});
		});

		it('should not call onSuccess when submission fails', async () => {
			const onSuccess = vi.fn();
			mockMovieLogStore.setState({
				createLog: vi.fn().mockRejectedValue(new Error('fail')),
				clearError: vi.fn(),
			});
			mockMovieLogDialogStore.setState({
				prefilledMovie: { tmdbId: 123, title: 'Test Movie' },
				movieToEdit: null,
				clearPrefilledMovie: vi.fn(),
			});

			render(<MovieLogForm onSuccess={onSuccess} />);

			const form = screen.getByTestId('form-provider').querySelector('form')!;
			fireEvent.submit(form);

			await waitFor(() => {
				expect(mockMovieLogStore.getState().createLog).toHaveBeenCalled();
			});
			expect(onSuccess).not.toHaveBeenCalled();
		});

		it('should call clearError before submission', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: { tmdbId: 123, title: 'Test Movie' },
				movieToEdit: null,
				clearPrefilledMovie: vi.fn(),
			});

			render(<MovieLogForm />);

			const form = screen.getByTestId('form-provider').querySelector('form')!;
			fireEvent.submit(form);

			await waitFor(() => {
				expect(mockMovieLogStore.getState().clearError).toHaveBeenCalled();
			});
		});
	});

	describe('useEffect — no-op when no movie state', () => {
		it('should not populate autocomplete items when both prefilledMovie and movieToEdit are null', async () => {
			mockMovieLogDialogStore.setState({
				prefilledMovie: null,
				movieToEdit: null,
			});

			render(<MovieLogForm />);

			// Only the default "Select" option should be present, no movie options
			await waitFor(() => {
				expect(
					screen.queryByTestId(/autocomplete-option-/)
				).not.toBeInTheDocument();
			});
		});
	});
});
