import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockSetTheme = vi.fn();

const navbarState = {
	authenticatedStatus: false as boolean | null,
	theme: 'dark' as 'dark' | 'light',
	isMobile: false,
};

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (
		selector: (state: { authenticatedStatus: boolean | null }) => unknown
	) => selector({ authenticatedStatus: navbarState.authenticatedStatus }),
}));

vi.mock('@/lib/hooks/useTheme', () => ({
	useTheme: () => ({ theme: navbarState.theme, setTheme: mockSetTheme }),
}));

vi.mock('../hooks', () => ({
	useIsMobile: () => navbarState.isMobile,
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		onClick,
		...props
	}: { children?: ReactNode; onClick?: () => void } & Record<
		string,
		unknown
	>) => (
		<button type="button" onClick={onClick} {...props}>
			{children}
		</button>
	),
	NavigationMenu: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	NavigationMenuList: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	NavigationMenuLink: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock('lucide-react', () => ({
	Menu: ({ onClick }: { onClick?: () => void }) => (
		<button type="button" data-testid="menu-icon" onClick={onClick}>
			menu
		</button>
	),
	Moon: () => <span>moon</span>,
	Sun: () => <span>sun</span>,
}));

vi.mock('@/features/logs/components', () => ({
	CreateMovieLogButton: () => <div data-testid="create-log-button" />,
	CreateMovieLogDialog: () => <div data-testid="create-log-dialog" />,
}));

vi.mock('./Logo', () => ({
	Logo: () => <div data-testid="logo" />,
}));

vi.mock('./MobileNavbar', () => ({
	MobileNavbar: ({ isOpen }: { isOpen: boolean }) => (
		<div data-testid="mobile-navbar">{isOpen ? 'open' : 'closed'}</div>
	),
}));

vi.mock('./ProfileDropdownMenu', () => ({
	ProfileDropdownMenu: () => <div data-testid="profile-dropdown" />,
}));

import { Navbar } from './Navbar';

describe('Navbar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		navbarState.authenticatedStatus = false;
		navbarState.theme = 'dark';
		navbarState.isMobile = false;
	});

	it('renders unauthenticated actions and navigates on auth buttons', () => {
		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		expect(screen.getByText('Navbar.home')).toBeInTheDocument();
		expect(screen.getByText('Navbar.login')).toBeInTheDocument();
		expect(screen.getByText('Navbar.register')).toBeInTheDocument();
		expect(screen.queryByTestId('create-log-button')).not.toBeInTheDocument();

		fireEvent.click(screen.getByText('Navbar.login'));
		fireEvent.click(screen.getByText('Navbar.register'));
		expect(mockNavigate).toHaveBeenCalledWith('/login');
		expect(mockNavigate).toHaveBeenCalledWith('/registration');
	});

	it('toggles theme based on current theme value', () => {
		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		fireEvent.click(screen.getByLabelText('Toggle theme'));
		expect(mockSetTheme).toHaveBeenCalledWith('light');
	});

	it('shows authenticated content and opens mobile navbar', () => {
		navbarState.authenticatedStatus = true;
		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		expect(screen.getByTestId('create-log-button')).toBeInTheDocument();
		expect(screen.getByTestId('create-log-dialog')).toBeInTheDocument();
		expect(screen.getByTestId('profile-dropdown')).toBeInTheDocument();
		expect(screen.getByText('Navbar.search')).toBeInTheDocument();
		expect(screen.getByTestId('mobile-navbar')).toHaveTextContent('closed');

		fireEvent.click(screen.getByTestId('menu-icon'));
		expect(screen.getByTestId('mobile-navbar')).toHaveTextContent('open');
	});
});
