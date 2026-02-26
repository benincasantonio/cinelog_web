import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

import ProfileOverviewPage from './ProfileOverviewPage';

describe('ProfileOverviewPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the page title', () => {
		render(<ProfileOverviewPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe('ProfileOverviewPage.pageTitle');
	});

	it('should render the coming soon message', () => {
		render(<ProfileOverviewPage />);

		expect(
			screen.getByText('ProfileOverviewPage.comingSoon')
		).toBeInTheDocument();
	});
});
