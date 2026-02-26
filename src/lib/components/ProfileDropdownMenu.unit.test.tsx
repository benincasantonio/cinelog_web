import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockChangeLanguage = vi.fn();

const authState = {
	userInfo: { handle: 'neo' } as { handle: string } | null,
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
		i18n: { changeLanguage: mockChangeLanguage },
	}),
}));

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (
		selector: (state: {
			logout: () => Promise<void>;
			userInfo: { handle: string } | null;
		}) => unknown
	) => selector({ logout: mockLogout, userInfo: authState.userInfo }),
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
}));

vi.mock('lucide-react', () => ({
	Languages: () => <span>languages-icon</span>,
	LogOut: () => <span>logout-icon</span>,
	User: () => <span>user-icon</span>,
}));

import { ProfileDropdownMenu } from './ProfileDropdownMenu';

describe('ProfileDropdownMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authState.userInfo = { handle: 'neo' };
		mockLogout.mockResolvedValue(undefined);
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

	it('changes language from language menu items', () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.en'));
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.fr'));
		fireEvent.click(screen.getByText('ProfileDropdownMenu.languages.it'));

		expect(mockChangeLanguage).toHaveBeenCalledWith('en');
		expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
		expect(mockChangeLanguage).toHaveBeenCalledWith('it');
	});

	it('logs out and redirects home', async () => {
		render(<ProfileDropdownMenu />);
		fireEvent.click(screen.getByText('ProfileDropdownMenu.logout'));
		await Promise.resolve();

		expect(mockLogout).toHaveBeenCalledTimes(1);
		expect(mockNavigate).toHaveBeenCalledWith('/');
	});
});
