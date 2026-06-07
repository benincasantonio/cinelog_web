import { Moon, Sun, SunMoon } from 'lucide-react';
import type { Theme } from '../models';

export const ThemeIcon = ({ theme }: { theme: Theme }) => {
	if (theme === 'dark') return <Moon className="w-4 h-4" />;
	if (theme === 'light') return <Sun className="w-4 h-4" />;
	return <SunMoon className="w-4 h-4" />;
};
