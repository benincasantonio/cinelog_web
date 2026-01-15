import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@antoniobenincasa/ui';
import { Languages, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';

export const ProfileDropdownMenu = () => {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();

	const logout = useAuthStore((state) => state.logout);
	const userInfo = useAuthStore((state) => state.userInfo);

	const handleLogout = async () => {
		await logout();
		navigate('/');
	};

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="h-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white">
						<User className="w-5 h-5" />
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem asChild>
					<Link
						to={userInfo?.handle ? `/profile/${userInfo.handle}` : '/profile'}
						className="flex items-center gap-2 cursor-pointer"
					>
						<User className="w-4 h-4" />
						{t('ProfileDropdownMenu.profile')}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="flex items-center gap-2">
						<Languages className="w-4 h-4" />
						{t('ProfileDropdownMenu.language')}
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem onClick={() => changeLanguage('en')}>
							{t('ProfileDropdownMenu.languages.en')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => changeLanguage('fr')}>
							{t('ProfileDropdownMenu.languages.fr')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => changeLanguage('it')}>
							{t('ProfileDropdownMenu.languages.it')}
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					onClick={handleLogout}
					className="flex items-center gap-2 cursor-pointer"
				>
					<LogOut className="w-4 h-4" />
					{t('ProfileDropdownMenu.logout')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
