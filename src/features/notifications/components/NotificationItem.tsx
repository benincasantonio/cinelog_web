import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '@/lib/utilities/date-utils';

type NotificationItemProps = {
	unread: boolean;
	createdAt: string;
	title: ReactNode;
	action?: ReactNode;
};

export const NotificationItem = ({
	unread,
	createdAt,
	title,
	action,
}: NotificationItemProps) => {
	const { i18n } = useTranslation();
	const locale = i18n.resolvedLanguage ?? i18n.language;

	return (
		<article
			data-testid="notification-item"
			data-unread={unread}
			className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
		>
			{unread ? (
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
						unread
							? 'font-semibold text-gray-900 dark:text-white'
							: 'font-normal text-gray-700 dark:text-gray-300'
					}
				>
					{title}
				</h3>
				<time
					dateTime={createdAt}
					className="text-xs text-gray-500 dark:text-gray-500"
				>
					{formatRelativeTime(createdAt, locale)}
				</time>
			</div>
			{action}
		</article>
	);
};
