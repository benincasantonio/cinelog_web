import { Button, useNotification } from '@antoniobenincasa/ui';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { NotificationBaseResponse } from '../models';
import { useNotificationsStore } from '../stores';
import { resolveNotificationView } from '../utilities/resolve-notification-view';
import { NotificationItem } from './NotificationItem';

type NotificationListItemProps = {
	notification: NotificationBaseResponse;
};

export const NotificationListItem = ({
	notification,
}: NotificationListItemProps) => {
	const { t } = useTranslation();
	const { notify } = useNotification();
	const pendingReadId = useNotificationsStore((state) => state.pendingReadId);
	const isMarkingAllRead = useNotificationsStore(
		(state) => state.isMarkingAllRead
	);
	const markAsRead = useNotificationsStore((state) => state.markAsRead);
	const { copyKey, interpolation, actorHref } =
		resolveNotificationView(notification);
	const isUnread = notification.readAt === null;
	const isPending = pendingReadId === notification.id;

	const handleMarkAsRead = async () => {
		try {
			await markAsRead(notification.id);
		} catch {
			notify({
				variant: 'danger',
				message: t('NotificationItem.markAsReadError'),
			});
		}
	};

	const title = actorHref ? (
		<Trans
			i18nKey={copyKey}
			values={interpolation}
			components={{
				actor: <Link to={actorHref} className="hover:underline" />,
			}}
		/>
	) : (
		t(copyKey)
	);

	return (
		<NotificationItem
			unread={isUnread}
			createdAt={notification.createdAt}
			title={title}
			action={
				isUnread ? (
					<Button
						type="button"
						variant="outline"
						disabled={pendingReadId !== null || isMarkingAllRead}
						aria-busy={isPending}
						onClick={handleMarkAsRead}
					>
						{t('NotificationItem.markAsRead')}
					</Button>
				) : undefined
			}
		/>
	);
};
