import { render, screen } from '@testing-library/react';
import { cloneElement, type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { NotificationBaseResponse } from '../models';
import { NotificationListItem } from './NotificationListItem';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en-US', resolvedLanguage: 'en-US' },
	}),
	Trans: ({
		i18nKey,
		values,
		components,
	}: {
		i18nKey: string;
		values?: { firstName?: string; lastName?: string };
		components?: { actor?: ReactElement };
	}) => {
		const name = `${values?.firstName ?? ''} ${values?.lastName ?? ''}`.trim();

		return (
			<>
				{components?.actor
					? cloneElement(components.actor, undefined, name)
					: name}
				{i18nKey}
			</>
		);
	},
}));

const unreadNotification: NotificationBaseResponse = {
	id: 'n-1',
	type: 'follow.started',
	title: 'New follower',
	body: 'A user started following you.',
	actor: {
		handle: 'moviefan',
		firstName: 'Movie',
		lastName: 'Fan',
	},
	availableActions: [],
	readAt: null,
	createdAt: '2026-07-18T10:30:00Z',
};

const renderItem = (notification: NotificationBaseResponse) =>
	render(
		<MemoryRouter>
			<NotificationListItem notification={notification} />
		</MemoryRouter>
	);

describe('NotificationListItem', () => {
	it('renders localized copy with the actor name linked to the profile', () => {
		renderItem(unreadNotification);

		expect(screen.getByRole('link', { name: 'Movie Fan' })).toHaveAttribute(
			'href',
			'/profile/moviefan'
		);
		expect(
			screen.getByText('NotificationItem.follow.started.withActor')
		).toBeInTheDocument();
		expect(screen.queryByText('New follower')).not.toBeInTheDocument();
		expect(
			screen.queryByText('A user started following you.')
		).not.toBeInTheDocument();
		expect(
			document.querySelector('time[datetime="2026-07-18T10:30:00Z"]')
		).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('renders type-only copy with no link when the actor is missing', () => {
		renderItem({ ...unreadNotification, actor: null });

		expect(
			screen.getByText('NotificationItem.follow.started.noActor')
		).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.queryByText('Movie Fan')).not.toBeInTheDocument();
	});
});
