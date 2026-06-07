import {
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '@antoniobenincasa/ui';
import { SunMoon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeDropdownRadioGroup } from './ThemeDropdownRadioGroup';

type ThemeDropdownProps = {
	context: 'inline' | 'submenu';
};

export const ThemeDropdown = ({ context }: ThemeDropdownProps) => {
	const { t } = useTranslation();

	if (context === 'inline') return <ThemeDropdownRadioGroup />;

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger className="flex items-center gap-2">
				<SunMoon className="w-4 h-4" />
				{t('ThemeDropdown.theme')}
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<ThemeDropdownRadioGroup />
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
};
