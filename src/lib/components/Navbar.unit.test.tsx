import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockSetTheme = vi.fn();

const navbarState = {
	authenticatedStatus: false as boolean | null,
	theme: 'dark' as 'dark' | 'light' | 'system',
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
	DropdownMenu: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuContent: ({ children }: { children?: ReactNode }) => (
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

vi.mock('lucide-react', () => ({
	Menu: ({ onClick }: { onClick?: () => void }) => (
		<button type="button" data-testid="menu-icon" onClick={onClick}>
			menu
		</button>
	),
	Moon: () => <span>moon</span>,
	Sun: () => <span>sun</span>,
	SunMoon: () => <span>sun-moon</span>,
	User: () => <span>user</span>,
}));

vi.mock('@/features/logs/components', () => ({
	CreateMovieLogButton: () => <div data-testid="create-log-button" />,
	CreateMovieLogDialog: () => <div data-testid="create-log-dialog" />,
}));

vi.mock('./Logo', () => ({
	Logo: () => <div data-testid="logo" />,
}));

vi.mock('./MobileNavbar', () => ({
	MobileNavbar: ({
		isOpen,
		items,
		onClose,
	}: {
		isOpen: boolean;
		items: { name: string; visible?: boolean }[];
		onClose?: () => void;
	}) => (
		<div data-testid="mobile-navbar">
			{isOpen ? 'open' : 'closed'}
			<button type="button" data-testid="mobile-navbar-close" onClick={onClose}>
				close
			</button>
			<span data-testid="mobile-navbar-items">
				{items
					.filter((item) => item.visible !== false)
					.map((item) => item.name)
					.join(',')}
			</span>
		</div>
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

	it('renders unauthenticated actions and navigates on auth controls', () => {
		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		expect(screen.getAllByText('Navbar.home').length).toBeGreaterThan(0);
		expect(screen.getByText('Navbar.login')).toBeInTheDocument();
		expect(screen.getByText('Navbar.register')).toBeInTheDocument();
		expect(screen.getByTestId('mobile-login-button')).toBeInTheDocument();
		expect(screen.getByTestId('mobile-navbar-items')).toHaveTextContent(
			'Navbar.home'
		);
		expect(screen.getByTestId('mobile-navbar-items')).not.toHaveTextContent(
			'Navbar.login'
		);
		expect(screen.getByTestId('mobile-navbar-items')).not.toHaveTextContent(
			'Navbar.register'
		);
		expect(screen.queryByTestId('create-log-button')).not.toBeInTheDocument();

		fireEvent.click(screen.getByText('Navbar.login'));
		fireEvent.click(screen.getByTestId('mobile-login-button'));
		fireEvent.click(screen.getByText('Navbar.register'));
		expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login');
		expect(mockNavigate).toHaveBeenNthCalledWith(2, '/login');
		expect(mockNavigate).toHaveBeenNthCalledWith(3, '/registration');
	});

	it('lets logged-out users select any theme from the navbar menu', () => {
		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		expect(screen.getByLabelText('Navbar.theme')).toBeInTheDocument();
		expect(screen.getByLabelText('Navbar.theme')).toHaveTextContent('moon');
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.light'));
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.dark'));
		fireEvent.click(screen.getByText('ThemeDropdownRadioGroup.themes.system'));

		expect(mockSetTheme).toHaveBeenCalledWith('light');
		expect(mockSetTheme).toHaveBeenCalledWith('dark');
		expect(mockSetTheme).toHaveBeenCalledWith('system');
	});

	it('uses a sun-moon icon for the guest system theme trigger', () => {
		navbarState.theme = 'system';

		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		expect(screen.getByLabelText('Navbar.theme')).toHaveTextContent('sun-moon');
	});

	it('does not render the guest theme menu for authenticated users', () => {
		navbarState.authenticatedStatus = true;

		render(
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		);

		expect(screen.queryByLabelText('Navbar.theme')).not.toBeInTheDocument();
		expect(screen.getByTestId('profile-dropdown')).toBeInTheDocument();
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
		expect(screen.getByTestId('mobile-navbar-items')).toHaveTextContent(
			'Navbar.home,Navbar.search'
		);

		fireEvent.click(screen.getByTestId('menu-icon'));
		expect(screen.getByTestId('mobile-navbar')).toHaveTextContent('open');
		fireEvent.click(screen.getByTestId('mobile-navbar-close'));
		expect(screen.getByTestId('mobile-navbar')).toHaveTextContent('closed');
	});
});
