import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreateMovieLogButton } from './CreateMovieLogButton';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock useMovieLogDialogStore
const mockOpen = vi.fn();
vi.mock('../store', () => ({
    useMovieLogDialogStore: (selector: (state: { open: () => void }) => unknown) => {
        const state = { open: mockOpen };
        return selector(state);
    },
}));

describe('CreateMovieLogButton', () => {
    beforeEach(() => {
        mockOpen.mockClear();
    });

    describe('Rendering', () => {
        it('should render the desktop button with translated text', () => {
            render(<CreateMovieLogButton />);

            const button = screen.getByRole('button', {
                name: 'CreateMovieLogButton.logMovie',
            });
            expect(button).toBeInTheDocument();
        });

        it('should render the button with correct styling classes', () => {
            render(<CreateMovieLogButton />);

            const button = screen.getByRole('button', {
                name: 'CreateMovieLogButton.logMovie',
            });
            expect(button).toHaveClass('hidden', 'md:inline-flex');
        });

        it('should render the Plus icon for mobile', () => {
            render(<CreateMovieLogButton />);

            // The Plus icon should be visible on mobile (has md:hidden class)
            const plusIcon = document.querySelector('.md\\:hidden');
            expect(plusIcon).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call open when desktop button is clicked', async () => {
            const user = userEvent.setup();
            render(<CreateMovieLogButton />);

            const button = screen.getByRole('button', {
                name: 'CreateMovieLogButton.logMovie',
            });
            await user.click(button);

            expect(mockOpen).toHaveBeenCalledTimes(1);
        });

        it('should call open when Plus icon is clicked', async () => {
            const user = userEvent.setup();
            render(<CreateMovieLogButton />);

            const plusIcon = document.querySelector('.md\\:hidden');
            expect(plusIcon).toBeInTheDocument();

            await user.click(plusIcon!);

            expect(mockOpen).toHaveBeenCalledTimes(1);
        });
    });
});
