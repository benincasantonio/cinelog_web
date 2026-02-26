import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeLayout } from './HomeLayout';

describe('HomeLayout', () => {
	describe('rendering', () => {
		it('should render the "Welcome to Cinelog" heading', () => {
			render(<HomeLayout>content</HomeLayout>);

			expect(
				screen.getByRole('heading', { name: 'Welcome to Cinelog' })
			).toBeInTheDocument();
		});

		it('should render children inside the content panel', () => {
			render(
				<HomeLayout>
					<span>child content</span>
				</HomeLayout>
			);

			expect(screen.getByText('child content')).toBeInTheDocument();
		});

		it('should render custom element children', () => {
			render(
				<HomeLayout>
					<button>Click me</button>
				</HomeLayout>
			);

			expect(
				screen.getByRole('button', { name: 'Click me' })
			).toBeInTheDocument();
		});

		it('should render multiple children', () => {
			render(
				<HomeLayout>
					<p>First</p>
					<p>Second</p>
				</HomeLayout>
			);

			expect(screen.getByText('First')).toBeInTheDocument();
			expect(screen.getByText('Second')).toBeInTheDocument();
		});
	});

	describe('structure', () => {
		it('should render the branding panel as hidden on small screens (md:block)', () => {
			render(<HomeLayout>content</HomeLayout>);

			// The branding div contains the h1 — look it up by heading role
			const heading = screen.getByRole('heading', {
				name: 'Welcome to Cinelog',
			});
			// Its parent should have the class that hides it on mobile
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			expect(heading.parentElement!.className).toContain('hidden');
			expect(heading.parentElement!.className).toContain('md:block');
		});

		it('should have the heading at level 1', () => {
			render(<HomeLayout>content</HomeLayout>);

			expect(
				screen.getByRole('heading', { level: 1, name: 'Welcome to Cinelog' })
			).toBeInTheDocument();
		});
	});
});
