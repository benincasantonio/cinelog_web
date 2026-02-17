import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@antoniobenincasa/ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Navigate,
	useLocation,
	useNavigate,
	useSearchParams,
} from 'react-router-dom';
import { ResetPasswordForm } from '../components';

const ResetPasswordPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const { email, code } = useMemo(() => {
		const stateEmail = (location.state as { email?: string })?.email;
		return {
			email: stateEmail ?? searchParams.get('email'),
			code: searchParams.get('code') ?? undefined,
		};
	}, [location.state, searchParams]);

	useEffect(() => {
		if (searchParams.has('email') || searchParams.has('code')) {
			searchParams.delete('email');
			searchParams.delete('code');
			setSearchParams(searchParams, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	if (!email) {
		return <Navigate to="/forgot-password" replace />;
	}

	const handleBack = () => {
		navigate('/forgot-password');
	};

	return (
		<>
			<title>{t('ResetPasswordPage.pageTitle')}</title>
			<div className="flex w-full justify-center items-center">
				<Card className="w-full md:w-lg">
					<CardHeader>
						<CardTitle>{t('ResetPasswordPage.title')}</CardTitle>
						<CardDescription>
							{t('ResetPasswordPage.description')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResetPasswordForm
							email={email}
							initialCode={code}
							onBack={handleBack}
						/>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default ResetPasswordPage;
