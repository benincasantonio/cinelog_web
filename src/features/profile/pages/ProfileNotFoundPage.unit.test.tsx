import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

import ProfileNotFoundPage from './ProfileNotFoundPage';

function renderWithRouter() {
	return render(
		<MemoryRouter initialEntries={['/profile/unknown']}>
			<Routes>
				<Route path="/profile/:handle" element={<ProfileNotFoundPage />} />
				<Route path="/" element={<div data-testid="home">Home</div>} />
			</Routes>
		</MemoryRouter>
	);
}

describe('ProfileNotFoundPage', () => {
	it('should render the title', () => {
		renderWithRouter();

		expect(screen.getByText('ProfileNotFoundPage.title')).toBeInTheDocument();
	});

	it('should render the description', () => {
		renderWithRouter();

		expect(
			screen.getByText('ProfileNotFoundPage.description')
		).toBeInTheDocument();
	});

	it('should render a go home link pointing to /', () => {
		renderWithRouter();

		const link = screen.getByText('ProfileNotFoundPage.goHome');
		expect(link).toBeInTheDocument();
		expect(link.closest('a')).toHaveAttribute('href', '/');
	});
});
