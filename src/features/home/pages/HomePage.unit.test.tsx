import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// lucide-react icons are SVGs — mock to avoid potential jsdom issues and keep
// tests focused on content rather than icon internals.
vi.mock('lucide-react', () => ({
	Github: () => <svg data-testid="github-icon" />,
}));

import HomePage from './HomePage';

describe('HomePage', () => {
	describe('rendering', () => {
		it('should render the page title element', () => {
			render(<HomePage />);

			// <title> is rendered via React; its text content is the i18n key
			expect(document.title).toBeDefined();
		});

		it('should render the main h1 heading', () => {
			render(<HomePage />);

			expect(
				screen.getByRole('heading', { level: 1, name: 'HomePage.title' })
			).toBeInTheDocument();
		});

		it('should render the subtitle paragraph', () => {
			render(<HomePage />);

			expect(screen.getByText('HomePage.subtitle')).toBeInTheDocument();
		});

		it('should render the tagline paragraph', () => {
			render(<HomePage />);

			expect(screen.getByText('HomePage.tagline')).toBeInTheDocument();
		});

		it('should render the italic paragraph', () => {
			render(<HomePage />);

			expect(screen.getByText('HomePage.italic')).toBeInTheDocument();
		});
	});

	describe('contribute section', () => {
		it('should render the contribute section heading', () => {
			render(<HomePage />);

			expect(
				screen.getByRole('heading', {
					level: 2,
					name: 'HomePage.contributeTitle',
				})
			).toBeInTheDocument();
		});

		it('should render the contribute description text', () => {
			render(<HomePage />);

			expect(screen.getByText('HomePage.contributeText')).toBeInTheDocument();
		});

		it('should render the frontend GitHub link with correct href', () => {
			render(<HomePage />);

			const frontendLink = screen.getByRole('link', {
				name: /HomePage\.frontend/i,
			});
			expect(frontendLink).toHaveAttribute(
				'href',
				'https://github.com/benincasantonio/cinelog_web'
			);
		});

		it('should render the backend GitHub link with correct href', () => {
			render(<HomePage />);

			const backendLink = screen.getByRole('link', {
				name: /HomePage\.backend/i,
			});
			expect(backendLink).toHaveAttribute(
				'href',
				'https://github.com/benincasantonio/cinelog_server'
			);
		});

		it('should open both GitHub links in a new tab', () => {
			render(<HomePage />);

			const links = screen.getAllByRole('link');
			for (const link of links) {
				expect(link).toHaveAttribute('target', '_blank');
			}
		});

		it('should set rel="noopener noreferrer" on both GitHub links', () => {
			render(<HomePage />);

			const links = screen.getAllByRole('link');
			for (const link of links) {
				expect(link).toHaveAttribute('rel', 'noopener noreferrer');
			}
		});

		it('should render exactly two GitHub icon links', () => {
			render(<HomePage />);

			expect(screen.getAllByTestId('github-icon')).toHaveLength(2);
		});
	});
});
