import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockUpdateLocale = vi.fn();
const mockNotify = vi.fn();
const mockSetTheme = vi.fn();

const authState = {
	userInfo: { handle: 'neo', locale: 'en-US' } as {
		handle: string;
		locale: 'en-US' | 'fr-FR' | 'it-IT';
	} | null,
	isLocaleUpdating: false,
	theme: 'system' as 'dark' | 'light' | 'system',
};

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (
		selector: (state: {
			logout: () => Promise<void>;
			userInfo: {
				handle: string;
				locale: 'en-US' | 'fr-FR' | 'it-IT';
			} | null;
			isLocaleUpdating: boolean;
			updateLocale: (locale: string) => Promise<void>;
		}) => unknown
	) =>
		selector({
			logout: mockLogout,
			userInfo: authState.userInfo,
			isLocaleUpdating: authState.isLocaleUpdating,
			updateLocale: mockUpdateLocale,
		}),
}));

vi.mock('@/lib/hooks/useTheme', () => ({
	useTheme: () => ({ theme: authState.theme, setTheme: mockSetTheme }),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	DropdownMenu: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuContent: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuSub: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuSubTrigger: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuSubContent: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuRadioGroup: ({
		children,
		value,
	}: {
		children?: ReactNode;
		value?: string;
	}) => <div data-value={value}>{children}</div>,
	DropdownMenuRadioItem: ({
		children,
		disabled,
		onClick,
		value,
	}: {
		children?: ReactNode;
		disabled?: boolean;
		onClick?: () => void;
		value?: string;
	}) => (
		<button
			type="button"
			data-value={value}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button>
	),
	DropdownMenuSeparator: () => <hr />,
	DropdownMenuItem: ({
		children,
		onClick,
	}: {
		children?: ReactNode;
		onClick?: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
	useNotification: () => ({ notify: mockNotify }),
}));

vi.mock('lucide-react', () => ({
	Languages: () => <span>languages-icon</span>,
	LogOut: () => <span>logout-icon</span>,
	SunMoon: () => <span>sun-moon-icon</span>,
	User: () => <span>user-icon</span>,
}));

import { ProfileDropdownMenu } from './ProfileDropdownMenu';

describe('ProfileDropdownMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authState.userInfo = { handle: 'neo', locale: 'en-US' };
		authState.isLocaleUpdating = false;
		authState.theme = 'system';
		mockLogout.mockResolvedValue(undefined);
		mockUpdateLocale.mockResolvedValue(undefined);
	});

	it('navigates to profile when profile item is clicked', () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.profile'));
		expect(mockNavigate).toHaveBeenCalledWith('/profile/neo');
	});

	it('does not navigate to profile when user info is missing', () => {
		authState.userInfo = null;
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.profile'));
		expect(mockNavigate).not.toHaveBeenCalledWith('/profile/neo');
	});

	it('persists full locale tags from language menu items', () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.fr'));
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.it'));

		expect(mockUpdateLocale).toHaveBeenCalledWith('fr-FR');
		expect(mockUpdateLocale).toHaveBeenCalledWith('it-IT');
	});

	it('marks the active locale and ignores its radio item', () => {
		render(<ProfileDropdownMenu />);

		expect(
			screen.getByText('ProfileDropdownMenu.languages.en').parentElement
		).toHaveAttribute('data-value', 'en-US');

		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.en'));
		expect(mockUpdateLocale).not.toHaveBeenCalled();
	});

	it('disables every locale while an update is pending', () => {
		authState.isLocaleUpdating = true;

		render(<ProfileDropdownMenu />);

		expect(screen.getByText('ProfileDropdownMenu.languages.en')).toBeDisabled();
		expect(screen.getByText('ProfileDropdownMenu.languages.fr')).toBeDisabled();
		expect(screen.getByText('ProfileDropdownMenu.languages.it')).toBeDisabled();
	});

	it('shows only a danger notification when locale persistence fails', async () => {
		mockUpdateLocale.mockRejectedValueOnce(new Error('network'));

		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.fr'));

		await vi.waitFor(() =>
			expect(mockNotify).toHaveBeenCalledWith({
				variant: 'danger',
				message: 'ProfileDropdownMenu.localeUpdateError',
			})
		);
	});

	it('does not show a success notification after persistence', async () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.fr'));

		await vi.waitFor(() =>
			expect(mockUpdateLocale).toHaveBeenCalledWith('fr-FR')
		);
		expect(mockNotify).not.toHaveBeenCalled();
	});

	it('changes theme from theme menu items', () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.light'));
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.dark'));
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.system'));

		expect(mockSetTheme).toHaveBeenCalledWith('light');
		expect(mockSetTheme).toHaveBeenCalledWith('dark');
		expect(mockSetTheme).toHaveBeenCalledWith('system');
	});

	it('marks the current theme in the theme menu', () => {
		authState.theme = 'dark';

		render(<ProfileDropdownMenu />);

		expect(
			screen.getByText('ThemeDropdownRadioGroup.themes.dark').parentElement
		).toHaveAttribute('data-value', 'dark');
		expect(
			screen.getByText('ThemeDropdown.theme').parentElement
		).toHaveTextContent('sun-moon-icon');
	});

	it('logs out and redirects home', async () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.logout'));
		await Promise.resolve();

		expect(mockLogout).toHaveBeenCalledTimes(1);
		expect(mockNavigate).toHaveBeenCalledWith('/');
	});
});
