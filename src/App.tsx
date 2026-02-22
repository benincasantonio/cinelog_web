import './App.css';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';
import { ThemeProvider } from './lib/components/ThemeProvider';
import { AppRoutes } from './routes';

function App() {
	const fetchUserInfo = useAuthStore((state) => state.fetchUserInfo);

	useEffect(() => {
		const initialize = async () => {
			await fetchUserInfo();
		};
		initialize();
	}, [fetchUserInfo]);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="cinelog-theme">
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
