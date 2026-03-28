import { NotificationProvider } from '@antoniobenincasa/ui';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';
import { ThemeProvider } from './lib/components/ThemeProvider';
import { AppRoutes } from './routes';

function App() {
	const fetchUserInfo = useAuthStore((state) => state.fetchUserInfo);

	useEffect(() => {
		fetchUserInfo();
	}, [fetchUserInfo]);

	return (
		<ThemeProvider defaultTheme="dark" storageKey="cinelog-theme">
			<NotificationProvider>
				<BrowserRouter>
					<AppRoutes />
				</BrowserRouter>
			</NotificationProvider>
		</ThemeProvider>
	);
}

export default App;
