import { Button } from '@antoniobenincasa/ui';
import { UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ProfileNotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<UserX className="size-16 text-gray-400 dark:text-gray-500" />
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
				{t('ProfileNotFoundPage.title')}
			</h1>
			<p className="text-gray-500 dark:text-gray-400">
				{t('ProfileNotFoundPage.description')}
			</p>
			<Button asChild variant="default">
				<Link to="/">{t('ProfileNotFoundPage.goHome')}</Link>
			</Button>
		</div>
	);
};

export default ProfileNotFoundPage;
