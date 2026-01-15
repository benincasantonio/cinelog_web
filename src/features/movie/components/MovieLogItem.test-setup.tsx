import { BrowserRouter, useParams } from 'react-router-dom';
import type { LogListItem } from '@/features/logs/models';
import { MovieLogItem } from './MovieLogItem';

// Create a test component that wraps MovieLogItem with routing
export const TestWrapper = ({ log }: { log: LogListItem }) => {
	return (
		<BrowserRouter>
			<MovieLogItem log={log} />
			<NavigationTracker />
		</BrowserRouter>
	);
};

// Component to track navigation
const NavigationTracker = () => {
	const params = useParams();
	return <div data-testid="nav-tracker">{JSON.stringify(params)}</div>;
};
