import { createContext } from 'react';
import type { ThemeProviderState } from '../models/theme';

const initialState: ThemeProviderState = {
	theme: 'system',
	setTheme: () => null,
};

export const ThemeProviderContext =
	createContext<ThemeProviderState>(initialState);
