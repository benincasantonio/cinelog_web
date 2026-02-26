import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
	X: ({ onClick }: { onClick?: () => void }) => (
		<button type="button" data-testid="close-icon" onClick={onClick}>
			close
		</button>
	),
}));

import { MobileNavbar } from './MobileNavbar';

const items = [
	{ name: 'Home', path: '/', visible: true },
	{ name: 'Search', path: '/search', visible: true },
	{ name: 'Hidden', path: '/hidden', visible: false },
];

describe('MobileNavbar', () => {
	it('renders closed state styles', () => {
		render(
			<MemoryRouter>
				<MobileNavbar isOpen={false} items={items} />
			</MemoryRouter>
		);

		expect(screen.getByRole('navigation')).toHaveClass('pointer-events-none');
	});

	it('renders visible links and handles close clicks', () => {
		const onClose = vi.fn();
		render(
			<MemoryRouter>
				<MobileNavbar isOpen={true} items={items} onClose={onClose} />
			</MemoryRouter>
		);

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Search')).toBeInTheDocument();
		expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

		fireEvent.click(screen.getByTestId('close-icon'));
		expect(onClose).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText('Home'));
		expect(onClose).toHaveBeenCalledTimes(2);
	});

	it('closes on Escape when enabled', () => {
		const onClose = vi.fn();
		render(
			<MemoryRouter>
				<MobileNavbar isOpen={true} items={items} onClose={onClose} />
			</MemoryRouter>
		);

		fireEvent.keyDown(window, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not close on Escape when disabled', () => {
		const onClose = vi.fn();
		render(
			<MemoryRouter>
				<MobileNavbar
					isOpen={true}
					items={items}
					onClose={onClose}
					closeOnEscape={false}
				/>
			</MemoryRouter>
		);

		fireEvent.keyDown(window, { key: 'Escape' });
		expect(onClose).not.toHaveBeenCalled();
	});
});
