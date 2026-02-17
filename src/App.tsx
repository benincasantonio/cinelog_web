import './App.css';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fetchCsrfToken } from '@/features/auth/repositories/auth-repository';
import { useAuthStore } from '@/features/auth/stores';
import { ThemeProvider } from './lib/components/ThemeProvider';
import { AppRoutes } from './routes';

function App() {
	const initializeAuth = useAuthStore((state) => state.initializeAuth);
	const setCsrfToken = useAuthStore((state) => state.setCsrfToken);

	useEffect(() => {
		const initialize = async () => {
			try {
				const { csrfToken } = await fetchCsrfToken();
				setCsrfToken(csrfToken);
			} catch (error) {
				console.error('Failed to fetch CSRF token:', error);
			}
			await initializeAuth();
		};
		initialize();
	}, [initializeAuth, setCsrfToken]);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="cinelog-theme">
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
