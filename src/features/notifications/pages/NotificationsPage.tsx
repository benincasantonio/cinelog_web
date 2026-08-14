import { Button } from '@antoniobenincasa/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationList } from '../components';
import { useNotificationsStore } from '../stores';

const NotificationsPage = () => {
	const { t } = useTranslation();
	const unreadOnly = useNotificationsStore((state) => state.unreadOnly);
	const loadNotifications = useNotificationsStore(
		(state) => state.loadNotifications
	);
	const setUnreadOnly = useNotificationsStore((state) => state.setUnreadOnly);
	const reset = useNotificationsStore((state) => state.reset);

	useEffect(() => {
		loadNotifications();

		return () => {
			reset();
		};
	}, [loadNotifications, reset]);

	return (
		<>
			<title>{t('NotificationsPage.pageTitle')}</title>
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<h1 className="text-2xl font-bold">{t('NotificationsPage.title')}</h1>
					<Button
						type="button"
						variant={unreadOnly ? 'default' : 'outline'}
						aria-pressed={unreadOnly}
						onClick={() => setUnreadOnly(!unreadOnly)}
					>
						{t('NotificationsPage.unreadOnly')}
					</Button>
				</div>
				<NotificationList />
			</div>
		</>
	);
};

export default NotificationsPage;
