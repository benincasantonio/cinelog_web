import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to ensure mock stores are available before vi.mock calls
const { mockMovieLogDialogStore, mockMovieLogStore, mockSearch } = vi.hoisted(
    () => {
        const { create } = require('zustand');

        const mockMovieLogDialogStore = create<{
            prefilledMovie: null | { tmdbId: number; title: string };
            movieToEdit: null | {
                id: string;
                tmdbId: number;
                movie: { title: string };
                dateWatched: string;
                viewingNotes: string | null;
                watchedWhere: string | null;
            };
            clearPrefilledMovie: () => void;
        }>(() => ({
            prefilledMovie: null,
            movieToEdit: null,
            clearPrefilledMovie: vi.fn(),
        }));

        const mockMovieLogStore = create<{
            isLoading: boolean;
            error: string | null;
            createLog: () => Promise<void>;
            updateLog: () => Promise<void>;
            clearError: () => void;
        }>(() => ({
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
vi.mock('../store', () => ({
    useMovieLogDialogStore: (selector: (state: unknown) => unknown) =>
        selector(mockMovieLogDialogStore.getState()),
}));

vi.mock('../store/movieLogStore', () => ({
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
            <select
                data-testid="autocomplete-select"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
            >
                <option value="">Select</option>
                {items.map((item) => (
                    <option key={item.value} value={item.value} data-testid={`autocomplete-option-${item.value}`}>
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
        <div data-testid="form-provider">
            {children}
        </div>
    ),
    FormControl: ({ children }: { children: ReactNode }) => (
        <div data-testid="form-control">{children}</div>
    ),
    FormField: ({
        render,
        name,
        control,
    }: {
        render: (props: { field: { value: unknown; onChange: (value: unknown) => void } }) => ReactNode;
        name: string;
        control: { _formValues?: Record<string, unknown> };
    }) => {
        // Get value from control's form values if available
        const value = control?._formValues?.[name] ?? '';
        return (
            <div data-testid={`form-field-${name}`}>
                {render({ field: { value, onChange: () => { } } })}
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
            {children}
        </div>
    ),
    SelectContent: ({ children }: { children: ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
        children,
        value,
    }: {
        children: ReactNode;
        value: string;
    }) => (
        <option data-testid={`select-item-${value}`} value={value}>
            {children}
        </option>
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

// Mock @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
    zodResolver: () => vi.fn(),
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
            expect(
                screen.getByText('MovieLogForm.submit')
            ).toBeInTheDocument();
        });

        it('should hide submit button when showSubmitButton is false', () => {
            render(<MovieLogForm showSubmitButton={false} />);

            expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
        });

        it('should show submitting text when loading', () => {
            mockMovieLogStore.setState({ isLoading: true });

            render(<MovieLogForm />);

            expect(
                screen.getByText('MovieLogForm.submitting')
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
                expect(screen.getByTestId('autocomplete-option-123')).toBeInTheDocument();
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
                expect(screen.getByTestId('autocomplete-option-456')).toBeInTheDocument();
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
                expect(screen.getByTestId('autocomplete-option-456')).toBeInTheDocument();
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
    });
});
