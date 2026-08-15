import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { NotificationBaseResponse } from '../models';
import { resolveNotificationView } from '../utilities/resolve-notification-view';
import { NotificationItem } from './NotificationItem';

type NotificationListItemProps = {
	notification: NotificationBaseResponse;
};

export const NotificationListItem = ({
	notification,
}: NotificationListItemProps) => {
	const { t } = useTranslation();
	const { copyKey, interpolation, actorHref } =
		resolveNotificationView(notification);

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
			unread={notification.readAt === null}
			createdAt={notification.createdAt}
			title={title}
		/>
	);
};
