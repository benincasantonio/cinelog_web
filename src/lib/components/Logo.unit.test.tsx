import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Logo } from './Logo';

// Wrapper component for React Router
const renderWithRouter = (component: React.ReactNode) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('Logo', () => {
    describe('Rendering', () => {
        it('should render the CineLog text', () => {
            renderWithRouter(<Logo />);

            expect(screen.getByText('CineLog')).toBeInTheDocument();
        });

        it('should render as a link to the home page', () => {
            renderWithRouter(<Logo />);

            const link = screen.getByRole('link', { name: /CineLog/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/');
        });

        it('should have correct styling classes', () => {
            renderWithRouter(<Logo />);

            const link = screen.getByRole('link', { name: /CineLog/i });
            expect(link).toHaveClass('text-xl', 'font-bold');
        });
    });

    describe('Alpha Badge', () => {
        it('should not show ALPHA badge by default', () => {
            renderWithRouter(<Logo />);

            expect(screen.queryByText('ALPHA')).not.toBeInTheDocument();
        });

        it('should not show ALPHA badge when isAlpha is false', () => {
            renderWithRouter(<Logo isAlpha={false} />);

            expect(screen.queryByText('ALPHA')).not.toBeInTheDocument();
        });

        it('should show ALPHA badge when isAlpha is true', () => {
            renderWithRouter(<Logo isAlpha={true} />);

            expect(screen.getByText('ALPHA')).toBeInTheDocument();
        });

        it('should render ALPHA badge with correct styling', () => {
            renderWithRouter(<Logo isAlpha={true} />);

            const alphaBadge = screen.getByText('ALPHA');
            expect(alphaBadge).toHaveClass('text-xs', 'bg-orange-500', 'text-white', 'rounded-full');
        });
    });
});
