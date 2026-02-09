import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/features/stats/components', () => ({
    Stats: () => <div data-testid="stats-component">Stats Component</div>,
}));

import ProfileStatsPage from './ProfileStatsPage';

describe('ProfileStatsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render the page with correct structure', () => {
            render(<ProfileStatsPage />);

            expect(screen.getByTestId('stats-component')).toBeInTheDocument();
        });

        it('should render the page title', () => {
            render(<ProfileStatsPage />);

            const titleElement = document.querySelector('title');
            expect(titleElement).toBeInTheDocument();
            expect(titleElement?.textContent).toBe('ProfileStatsPage.pageTitle');
        });

        it('should render the Stats component', () => {
            render(<ProfileStatsPage />);

            const statsComponent = screen.getByTestId('stats-component');
            expect(statsComponent).toBeInTheDocument();
            expect(statsComponent).toHaveTextContent('Stats Component');
        });
    });

    describe('layout', () => {
        it('should have the container div with proper spacing classes', () => {
            const { container } = render(<ProfileStatsPage />);

            const containerDiv = container.querySelector('.space-y-4');
            expect(containerDiv).toBeInTheDocument();
        });

        it('should not render any empty divs', () => {
            const { container } = render(<ProfileStatsPage />);

            // Get all divs in the container
            const allDivs = container.querySelectorAll('div');

            // Check that none of them are empty (have no text content and no children with content)
            for (const div of allDivs) {
                // Allow divs that have children with content
                if (div.children.length === 0 && div.textContent?.trim() === '') {
                    // This is an empty div with no children - fail the test
                    expect(div).toHaveTextContent(/.+/);
                }
            }
        });
    });
});
