import {
	Button,
	NavigationMenu,
	NavigationMenuLink,
	NavigationMenuList,
} from '@antoniobenincasa/ui';
import { Menu, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';
import {
	CreateMovieLogButton,
	CreateMovieLogDialog,
} from '@/features/logs/components';
import { useTheme } from '@/lib/hooks/useTheme';
import { useIsMobile } from '../hooks';
import type { MobileNavbarItem } from '../models/mobile-navbar-item.model';
import { Logo } from './Logo';
import { MobileNavbar } from './MobileNavbar';
import { ProfileDropdownMenu } from './ProfileDropdownMenu';

export const Navbar = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const authenticatedStatus = useAuthStore(
		(state) => state.authenticatedStatus
	);
	const { theme, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);

	const toggleTheme = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	const navigationData: {
		label: string;
		path: string;
		visible?: boolean;
	}[] = [
		{ label: t('Navbar.home'), path: '/' },
		{
			label: t('Navbar.search'),
			path: '/search',
			visible: authenticatedStatus === true,
		},
	];

	const mobileNavbarItems: MobileNavbarItem[] = [
		{
			name: t('Navbar.home'),
			path: '/',
			visible: true,
		},
		{
			name: t('Navbar.search'),
			path: '/search',
			visible: authenticatedStatus === true,
		},
	];

	const isMobile = useIsMobile();

	return (
		<>
			<nav className="w-full border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-6">
					<Menu
						className="md:hidden cursor-pointer"
						onClick={() => setIsOpen(true)}
					></Menu>
					<Logo isAlpha={true} />

					<NavigationMenu className="hidden md:block" viewport={isMobile}>
						<NavigationMenuList className="flex-wrap">
							{navigationData.map((item) =>
								item.visible !== false ? (
									<NavigationMenuLink asChild key={item.path}>
										<Link to={item.path}>{item.label}</Link>
									</NavigationMenuLink>
								) : null
							)}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				{/* Right side - Auth buttons or User menu */}
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						aria-label="Toggle theme"
					>
						{theme === 'dark' ? (
							<Sun className="w-5 h-5" />
						) : (
							<Moon className="w-5 h-5" />
						)}
					</Button>

					{authenticatedStatus === true && <CreateMovieLogButton />}

					{authenticatedStatus === false ? (
						<>
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
								data-testid="mobile-login-button"
								onClick={() => navigate('/login')}
								aria-label={t('Navbar.login')}
							>
								<User className="w-5 h-5" />
							</Button>
							<div className="hidden md:flex items-center gap-2">
								<Button variant="ghost" onClick={() => navigate('/login')}>
									{t('Navbar.login')}
								</Button>
								<Button onClick={() => navigate('/registration')}>
									{t('Navbar.register')}
								</Button>
							</div>
						</>
					) : (
						<>
							<ProfileDropdownMenu />
						</>
					)}
				</div>

				{authenticatedStatus === true && <CreateMovieLogDialog />}
			</nav>
			<MobileNavbar
				isOpen={isOpen}
				items={mobileNavbarItems}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
};
