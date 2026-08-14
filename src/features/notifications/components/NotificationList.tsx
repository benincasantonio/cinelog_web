import { Button, Spinner } from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { useNotificationsStore } from '../stores';
import { NotificationItem } from './NotificationItem';
import { NotificationsEmptyState } from './NotificationsEmptyState';

export const NotificationList = () => {
	const { t } = useTranslation();
	const items = useNotificationsStore((state) => state.items);
	const nextCursor = useNotificationsStore((state) => state.nextCursor);
	const unreadOnly = useNotificationsStore((state) => state.unreadOnly);
	const isLoading = useNotificationsStore((state) => state.isLoading);
	const isLoadingMore = useNotificationsStore((state) => state.isLoadingMore);
	const error = useNotificationsStore((state) => state.error);
	const hasLoaded = useNotificationsStore((state) => state.hasLoaded);
	const loadNotifications = useNotificationsStore(
		(state) => state.loadNotifications
	);
	const loadMore = useNotificationsStore((state) => state.loadMore);

	if (isLoading && items.length === 0) {
		return (
			<div className="flex items-center justify-center gap-2 py-8">
				<Spinner className="size-6 text-primary" />
				<p className="text-lg text-gray-600 dark:text-gray-400">
					{t('NotificationsPage.loading')}
				</p>
			</div>
		);
	}

	if (error && items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-8">
				<p className="text-lg text-gray-600 dark:text-gray-400">
					{t('NotificationsPage.error')}
				</p>
				<Button type="button" variant="outline" onClick={loadNotifications}>
					{t('NotificationsPage.retry')}
				</Button>
			</div>
		);
	}

	if (hasLoaded && items.length === 0) {
		return <NotificationsEmptyState unreadOnly={unreadOnly} />;
	}

	return (
		<div className="flex flex-col gap-3">
			{items.map((notification) => (
				<NotificationItem key={notification.id} notification={notification} />
			))}

			{error ? (
				<div className="flex flex-col items-center gap-3 py-2">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{t('NotificationsPage.error')}
					</p>
					<Button type="button" variant="outline" onClick={loadMore}>
						{t('NotificationsPage.retry')}
					</Button>
				</div>
			) : null}

			{nextCursor ? (
				<Button
					type="button"
					variant="outline"
					disabled={isLoadingMore}
					onClick={loadMore}
				>
					{t('NotificationsPage.loadMore')}
				</Button>
			) : null}
		</div>
	);
};
