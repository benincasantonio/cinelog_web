import './App.css';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';
import { ThemeProvider } from './lib/components/ThemeProvider';
import { AppRoutes } from './routes';

function App() {
	const initializeAuth = useAuthStore((state) => state.initializeAuth);

	useEffect(() => {
		const unsubscribe = initializeAuth();
		return () => unsubscribe();
	}, [initializeAuth]);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="cinelog-theme">
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
