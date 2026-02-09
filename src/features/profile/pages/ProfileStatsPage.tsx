import { useTranslation } from 'react-i18next';
import { Stats } from '@/features/stats/components';

const ProfileStatsPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<title>{t('ProfileStatsPage.pageTitle')}</title>
			<div className="space-y-4">
				<Stats />
			</div>
		</>
	);
};

export default ProfileStatsPage;
