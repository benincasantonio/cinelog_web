import {
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/hooks/useTheme';
import type { Theme } from '@/lib/models';

export const ThemeDropdownRadioGroup = () => {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();

	const changeTheme = (theme: Theme) => {
		setTheme(theme);
	};

	return (
		<DropdownMenuRadioGroup value={theme}>
			<DropdownMenuRadioItem value="light" onClick={() => changeTheme('light')}>
				{t('ThemeDropdownRadioGroup.themes.light')}
			</DropdownMenuRadioItem>
			<DropdownMenuRadioItem value="dark" onClick={() => changeTheme('dark')}>
				{t('ThemeDropdownRadioGroup.themes.dark')}
			</DropdownMenuRadioItem>
			<DropdownMenuRadioItem
				value="system"
				onClick={() => changeTheme('system')}
			>
				{t('ThemeDropdownRadioGroup.themes.system')}
			</DropdownMenuRadioItem>
		</DropdownMenuRadioGroup>
	);
};
