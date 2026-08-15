import type { NotificationBaseResponse } from '../models';

export const resolveNotificationView = (
	notification: NotificationBaseResponse
) => {
	const actor = notification.actor;

	return {
		copyKey: `NotificationItem.${notification.type}.${actor ? 'withActor' : 'noActor'}`,
		interpolation: actor
			? { firstName: actor.firstName, lastName: actor.lastName }
			: undefined,
		actorHref: actor ? `/profile/${actor.handle}` : null,
	};
};
