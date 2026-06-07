import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	DropdownMenuSub: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuSubContent: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuSubTrigger: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock('lucide-react', () => ({
	SunMoon: () => <span>sun-moon-icon</span>,
}));

vi.mock('./ThemeDropdownRadioGroup', () => ({
	ThemeDropdownRadioGroup: () => <div data-testid="theme-radio-group" />,
}));

import { ThemeDropdown } from './ThemeDropdown';

describe('ThemeDropdown', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders inline radio group content', () => {
		render(<ThemeDropdown context="inline" />);

		expect(screen.getByTestId('theme-radio-group')).toBeInTheDocument();
	});

	it('renders submenu trigger and radio group content', () => {
		render(<ThemeDropdown context="submenu" />);

		expect(
			screen.getByText('ThemeDropdown.theme').parentElement
		).toHaveTextContent('sun-moon-icon');
		expect(screen.getByTestId('theme-radio-group')).toBeInTheDocument();
	});
});
