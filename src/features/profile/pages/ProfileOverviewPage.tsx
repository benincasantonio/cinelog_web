import { useTranslation } from 'react-i18next';

const ProfileOverviewPage = () => {
	const { t } = useTranslation();
	return (
		<>
			<title>{t('ProfileOverviewPage.pageTitle')}</title>
			<div className="text-center py-16 text-gray-500 dark:text-gray-400">
				<p className="text-lg font-medium">
					{t('ProfileOverviewPage.comingSoon')}
				</p>
			</div>
		</>
	);
};

export default ProfileOverviewPage;
