import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
	Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

vi.mock('./Navbar', () => ({
	Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

import { DefaultLayout } from './DefaultLayout';

describe('DefaultLayout', () => {
	it('should render the Navbar', () => {
		render(<DefaultLayout />);

		expect(screen.getByTestId('navbar')).toBeInTheDocument();
	});

	it('should render the Outlet', () => {
		render(<DefaultLayout />);

		expect(screen.getByTestId('outlet')).toBeInTheDocument();
	});

	it('should render Navbar before the main content', () => {
		const { container } = render(<DefaultLayout />);

		const navbar = container.querySelector('[data-testid="navbar"]');
		const main = container.querySelector('main');
		expect(navbar?.compareDocumentPosition(main!)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	});

	it('should wrap Outlet in a main element', () => {
		render(<DefaultLayout />);

		const main = screen.getByRole('main');
		expect(main).toContainElement(screen.getByTestId('outlet'));
	});
});
