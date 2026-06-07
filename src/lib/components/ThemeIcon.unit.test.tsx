import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
	Moon: ({ className }: { className?: string }) => (
		<span data-testid="moon-icon" className={className} />
	),
	Sun: ({ className }: { className?: string }) => (
		<span data-testid="sun-icon" className={className} />
	),
	SunMoon: ({ className }: { className?: string }) => (
		<span data-testid="sun-moon-icon" className={className} />
	),
}));

import { ThemeIcon } from './ThemeIcon';

describe('ThemeIcon', () => {
	it('renders the moon icon for the dark theme', () => {
		render(<ThemeIcon theme="dark" />);

		expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
		expect(screen.queryByTestId('sun-moon-icon')).not.toBeInTheDocument();
	});

	it('renders the sun icon for the light theme', () => {
		render(<ThemeIcon theme="light" />);

		expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
		expect(screen.queryByTestId('sun-moon-icon')).not.toBeInTheDocument();
	});

	it('renders the sun-moon icon for the system theme', () => {
		render(<ThemeIcon theme="system" />);

		expect(screen.getByTestId('sun-moon-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
		expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
	});

	it('falls back to the sun-moon icon for an unknown theme', () => {
		render(<ThemeIcon theme="unknown" />);

		expect(screen.getByTestId('sun-moon-icon')).toBeInTheDocument();
	});

	it('applies the icon sizing classes', () => {
		render(<ThemeIcon theme="dark" />);

		expect(screen.getByTestId('moon-icon')).toHaveClass('w-4', 'h-4');
	});
});
