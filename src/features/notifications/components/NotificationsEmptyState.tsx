import { useTranslation } from 'react-i18next';

type NotificationsEmptyStateProps = {
	unreadOnly: boolean;
};

export const NotificationsEmptyState = ({
	unreadOnly,
}: NotificationsEmptyStateProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex justify-center py-8">
			<p className="text-lg text-gray-600 dark:text-gray-400">
				{unreadOnly
					? t('NotificationsPage.emptyUnread')
					: t('NotificationsPage.empty')}
			</p>
		</div>
	);
};
