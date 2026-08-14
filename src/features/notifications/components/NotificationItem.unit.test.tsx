import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { NotificationBaseResponse } from '../models';
import { NotificationItem } from './NotificationItem';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en-US', resolvedLanguage: 'en-US' },
	}),
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

describe('NotificationItem', () => {
	it('renders title, body, and timestamp without links or buttons', () => {
		render(<NotificationItem notification={unreadNotification} />);

		expect(screen.getByText('New follower')).toBeInTheDocument();
		expect(
			screen.getByText('A user started following you.')
		).toBeInTheDocument();
		expect(screen.queryByText('Movie Fan')).not.toBeInTheDocument();
		expect(
			document.querySelector('time[datetime="2026-07-18T10:30:00Z"]')
		).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('marks unread items with a dot and stronger title', () => {
		render(<NotificationItem notification={unreadNotification} />);

		expect(screen.getByTestId('unread-dot')).toBeInTheDocument();
		expect(screen.getByText('New follower')).toHaveClass('font-semibold');
	});

	it('renders read items without a dot and with a quieter title', () => {
		render(
			<NotificationItem
				notification={{
					...unreadNotification,
					readAt: '2026-07-18T11:00:00Z',
				}}
			/>
		);

		expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument();
		expect(screen.getByText('New follower')).not.toHaveClass('font-semibold');
	});
});
