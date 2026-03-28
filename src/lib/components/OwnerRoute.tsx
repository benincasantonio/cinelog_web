import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores';

interface OwnerRouteProps {
	children: React.ReactNode;
}

export const OwnerRoute = ({ children }: OwnerRouteProps) => {
	const { handle } = useParams<{ handle: string }>();
	const userInfo = useAuthStore((state) => state.userInfo);

	if (!userInfo || userInfo.handle !== handle) {
		return <Navigate to={`/profile/${handle}`} replace />;
	}

	return <>{children}</>;
};
