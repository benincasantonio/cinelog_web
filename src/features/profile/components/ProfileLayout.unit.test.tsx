import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileLayout } from './ProfileLayout';

describe('ProfileLayout', () => {
	it('renders sidebar and content columns when sidebar is provided', () => {
		const { container } = render(
			<ProfileLayout sidebar={<div data-testid="sidebar-content">Sidebar</div>}>
				<div data-testid="main-content">Main</div>
			</ProfileLayout>
		);

		expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
		expect(screen.getByTestId('main-content')).toBeInTheDocument();
		expect(container.querySelector('aside')).toBeInTheDocument();
		expect(screen.getByRole('main')).toHaveClass(
			'lg:col-span-9',
			'xl:col-span-9'
		);
	});

	it('renders full-width main column when sidebar is not provided', () => {
		const { container } = render(
			<ProfileLayout>
				<div data-testid="main-content">Main</div>
			</ProfileLayout>
		);

		expect(container.querySelector('aside')).not.toBeInTheDocument();
		expect(screen.getByRole('main')).toHaveClass('lg:col-span-12');
	});
});
