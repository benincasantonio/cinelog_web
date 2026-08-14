import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '@/lib/utilities/date-utils';
import type { NotificationBaseResponse } from '../models';

type NotificationItemProps = {
	notification: NotificationBaseResponse;
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
	const { i18n } = useTranslation();
	const locale = i18n.resolvedLanguage ?? i18n.language;
	const isUnread = notification.readAt === null;

	return (
		<article
			data-testid="notification-item"
			data-unread={isUnread}
			className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
		>
			{isUnread ? (
				<span
					data-testid="unread-dot"
					aria-hidden="true"
					className="mt-2 size-2 shrink-0 rounded-full bg-primary"
				/>
			) : (
				<span className="mt-2 size-2 shrink-0" aria-hidden="true" />
			)}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<h3
					className={
						isUnread
							? 'font-semibold text-gray-900 dark:text-white'
							: 'font-normal text-gray-700 dark:text-gray-300'
					}
				>
					{notification.title}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{notification.body}
				</p>
				<time
					dateTime={notification.createdAt}
					className="text-xs text-gray-500 dark:text-gray-500"
				>
					{formatRelativeTime(notification.createdAt, locale)}
				</time>
			</div>
		</article>
	);
};
