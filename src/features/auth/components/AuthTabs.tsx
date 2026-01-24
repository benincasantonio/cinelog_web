import { Tabs, TabsContent, TabsList, TabsTrigger } from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthTabs = ({ children }: { children: React.ReactNode }) => {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const activeTab = (location.pathname.split('/').pop() || 'login') as
		| 'login'
		| 'registration';

	function handleValueChange(value: string) {
		navigate(`/${value}`);
	}

	return (
		<Tabs
			className="gap-6 md:flex w-full md:items-center"
			value={activeTab}
			onValueChange={handleValueChange}
		>
			<TabsList>
				<TabsTrigger value="login">{t('AuthTabs.login')}</TabsTrigger>
				<TabsTrigger value="registration">
					{t('AuthTabs.registration')}
				</TabsTrigger>
			</TabsList>

			<TabsContent value={activeTab}>{children}</TabsContent>
		</Tabs>
	);
};
