import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { AuthTabs, LoginForm } from '../components';

const LoginPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<title>{t('LoginPage.pageTitle')}</title>
			<AuthTabs
				children={
					<Card className="w-full md:w-lg">
						<CardHeader>
							<CardTitle>{t('LoginPage.title')}</CardTitle>
							<CardDescription>{t('LoginPage.description')}</CardDescription>
						</CardHeader>
						<CardContent>
							<LoginForm />
						</CardContent>
					</Card>
				}
			/>
		</>
	);
};

export default LoginPage;
