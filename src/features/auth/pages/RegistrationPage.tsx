import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { AuthTabs, RegistrationForm } from '../components';

const RegistrationPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<title>{t('RegistrationPage.pageTitle')}</title>
			<AuthTabs
				children={
					<Card className="w-full md:w-lg">
						<CardHeader>
							<CardTitle>{t('RegistrationPage.title')}</CardTitle>
							<CardDescription>
								{t('RegistrationPage.description')}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RegistrationForm />
						</CardContent>
					</Card>
				}
			/>
		</>
	);
};

export default RegistrationPage;
