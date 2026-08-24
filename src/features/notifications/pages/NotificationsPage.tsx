import { Button, useNotification } from '@antoniobenincasa/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationList } from '../components';
import { useNotificationsStore } from '../stores';

const NotificationsPage = () => {
	const { t } = useTranslation();
	const { notify } = useNotification();
	const unreadOnly = useNotificationsStore((state) => state.unreadOnly);
	const unreadCount = useNotificationsStore((state) => state.unreadCount);
	const pendingReadId = useNotificationsStore((state) => state.pendingReadId);
	const isMarkingAllRead = useNotificationsStore(
		(state) => state.isMarkingAllRead
	);
	const loadNotifications = useNotificationsStore(
		(state) => state.loadNotifications
	);
	const setUnreadOnly = useNotificationsStore((state) => state.setUnreadOnly);
	const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
	const reset = useNotificationsStore((state) => state.reset);

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead();
		} catch {
			notify({
				variant: 'danger',
				message: t('NotificationsPage.markAllAsReadError'),
			});
		}
	};

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
				<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<h1 className="text-2xl font-bold">{t('NotificationsPage.title')}</h1>
					<div className="flex flex-wrap gap-2">
						{unreadCount > 0 ? (
							<Button
								type="button"
								variant="outline"
								disabled={pendingReadId !== null || isMarkingAllRead}
								aria-busy={isMarkingAllRead}
								onClick={handleMarkAllAsRead}
							>
								{t('NotificationsPage.markAllAsRead')}
							</Button>
						) : null}
						<Button
							type="button"
							variant={unreadOnly ? 'default' : 'outline'}
							aria-pressed={unreadOnly}
							onClick={() => setUnreadOnly(!unreadOnly)}
						>
							{t('NotificationsPage.unreadOnly')}
						</Button>
					</div>
				</div>
				<NotificationList />
			</div>
		</>
	);
};

export default NotificationsPage;
