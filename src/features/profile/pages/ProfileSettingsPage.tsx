import { useTranslation } from 'react-i18next';
import { ChangePasswordForm, UpdateProfileForm } from '../components';

const ProfileSettingsPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-8">
			<section>
				<h2 className="text-xl font-semibold mb-4">
					{t('ProfileSettingsPage.profileSection')}
				</h2>
				<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
					<UpdateProfileForm />
				</div>
			</section>

			<section>
				<h2 className="text-xl font-semibold mb-4">
					{t('ProfileSettingsPage.passwordSection')}
				</h2>
				<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
					<ChangePasswordForm />
				</div>
			</section>
		</div>
	);
};

export default ProfileSettingsPage;
