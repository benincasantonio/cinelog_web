import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetTheme = vi.fn();

const themeState = {
	theme: 'system' as 'dark' | 'light' | 'system',
};

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@/lib/hooks/useTheme', () => ({
	useTheme: () => ({ theme: themeState.theme, setTheme: mockSetTheme }),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	DropdownMenuRadioGroup: ({
		children,
		value,
	}: {
		children?: ReactNode;
		value?: string;
	}) => <div data-value={value}>{children}</div>,
	DropdownMenuRadioItem: ({
		children,
		onClick,
		value,
	}: {
		children?: ReactNode;
		onClick?: () => void;
		value?: string;
	}) => (
		<button type="button" data-value={value} onClick={onClick}>
			{children}
		</button>
	),
}));

import { ThemeDropdownRadioGroup } from './ThemeDropdownRadioGroup';

describe('ThemeDropdownRadioGroup', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		themeState.theme = 'system';
	});

	it('renders theme choices and changes theme', () => {
		render(<ThemeDropdownRadioGroup />);

		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.light'));
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.dark'));
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.system'));

		expect(mockSetTheme).toHaveBeenCalledWith('light');
		expect(mockSetTheme).toHaveBeenCalledWith('dark');
		expect(mockSetTheme).toHaveBeenCalledWith('system');
	});

	it('marks the current theme value', () => {
		themeState.theme = 'dark';

		render(<ThemeDropdownRadioGroup />);

		expect(
			screen.getByText('ThemeDropdownRadioGroup.themes.dark').parentElement
		).toHaveAttribute('data-value', 'dark');
	});
});
