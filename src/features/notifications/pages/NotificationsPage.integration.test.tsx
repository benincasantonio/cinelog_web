import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockListNotifications } = vi.hoisted(() => ({
	mockListNotifications: vi.fn(),
}));

vi.mock('../repositories/notifications-repository', () => ({
	listNotifications: (...args: unknown[]) => mockListNotifications(...args),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en-US', resolvedLanguage: 'en-US' },
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		onClick,
		disabled,
		...props
	}: {
		children?: ReactNode;
		onClick?: () => void;
		disabled?: boolean;
	} & Record<string, unknown>) => (
		<button type="button" onClick={onClick} disabled={disabled} {...props}>
			{children}
		</button>
	),
	Spinner: () => <div data-testid="spinner" />,
}));

import { useNotificationsStore } from '../stores';
import NotificationsPage from './NotificationsPage';

const firstItem = {
	id: 'n-1',
	type: 'follow.started' as const,
	title: 'New follower',
	body: 'A user started following you.',
	actor: null,
	availableActions: [] as const,
	readAt: null,
	createdAt: '2026-07-18T10:30:00Z',
};

const secondItem = {
	id: 'n-2',
	type: 'follow.accepted' as const,
	title: 'Follow accepted',
	body: 'Your follow request was accepted.',
	actor: null,
	availableActions: [] as const,
	readAt: '2026-07-18T11:00:00Z',
	createdAt: '2026-07-18T09:00:00Z',
};

const unreadItem = {
	...firstItem,
	id: 'n-unread',
	title: 'Unread only item',
};

describe('NotificationsPage list flow', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useNotificationsStore.setState({
			items: [],
			nextCursor: null,
			unreadCount: 0,
			unreadOnly: false,
			isLoading: false,
			isLoadingMore: false,
			error: null,
			hasLoaded: false,
		});
	});

	it('lists notifications, filters unread, and loads more', async () => {
		mockListNotifications
			.mockResolvedValueOnce({
				items: [firstItem],
				nextCursor: 'cursor-1',
				unreadCount: 2,
			})
			.mockResolvedValueOnce({
				items: [unreadItem],
				nextCursor: 'unread-cursor',
				unreadCount: 1,
			})
			.mockResolvedValueOnce({
				items: [secondItem],
				nextCursor: null,
				unreadCount: 1,
			});

		render(<NotificationsPage />);

		expect(await screen.findByText('New follower')).toBeInTheDocument();
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: false });

		fireEvent.click(screen.getByText('NotificationsPage.unreadOnly'));

		expect(await screen.findByText('Unread only item')).toBeInTheDocument();
		expect(screen.queryByText('New follower')).not.toBeInTheDocument();
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: true });

		fireEvent.click(screen.getByText('NotificationsPage.loadMore'));

		await waitFor(() => {
			expect(screen.getByText('Follow accepted')).toBeInTheDocument();
		});
		expect(screen.getByText('Unread only item')).toBeInTheDocument();
		expect(mockListNotifications).toHaveBeenCalledWith({
			unreadOnly: true,
			cursor: 'unread-cursor',
		});
		expect(
			screen.queryByText('NotificationsPage.loadMore')
		).not.toBeInTheDocument();
	});
});
