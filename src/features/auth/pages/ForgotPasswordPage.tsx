import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordForm } from '../components';

const ForgotPasswordPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const handleSuccess = (email: string) => {
		navigate('/reset-password', { state: { email } });
	};

	return (
		<>
			<title>{t('ForgotPasswordPage.pageTitle')}</title>
			<div className="flex w-full justify-center items-center">
				<Card className="w-full md:w-lg">
					<CardHeader>
						<CardTitle>{t('ForgotPasswordPage.title')}</CardTitle>
						<CardDescription>
							{t('ForgotPasswordPage.description')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ForgotPasswordForm onSuccess={handleSuccess} />
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default ForgotPasswordPage;
