import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	mockListNotifications,
	mockMarkNotificationRead,
	mockMarkAllNotificationsRead,
	mockNotify,
} = vi.hoisted(() => ({
	mockListNotifications: vi.fn(),
	mockMarkNotificationRead: vi.fn(),
	mockMarkAllNotificationsRead: vi.fn(),
	mockNotify: vi.fn(),
}));

vi.mock('../repositories/notifications-repository', () => ({
	listNotifications: (...args: unknown[]) => mockListNotifications(...args),
	markNotificationRead: (...args: unknown[]) =>
		mockMarkNotificationRead(...args),
	markAllNotificationsRead: (...args: unknown[]) =>
		mockMarkAllNotificationsRead(...args),
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
	useNotification: () => ({ notify: mockNotify }),
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
	type: 'follow.requested' as const,
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
			pendingReadId: null,
			isMarkingAllRead: false,
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

		expect(
			await screen.findByText('NotificationItem.follow.started.noActor')
		).toBeInTheDocument();
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: false });

		fireEvent.click(screen.getByText('NotificationsPage.unreadOnly'));

		expect(
			await screen.findByText('NotificationItem.follow.requested.noActor')
		).toBeInTheDocument();
		expect(
			screen.queryByText('NotificationItem.follow.started.noActor')
		).not.toBeInTheDocument();
		expect(mockListNotifications).toHaveBeenCalledWith({ unreadOnly: true });

		fireEvent.click(screen.getByText('NotificationsPage.loadMore'));

		await waitFor(() => {
			expect(
				screen.getByText('NotificationItem.follow.accepted.noActor')
			).toBeInTheDocument();
		});
		expect(
			screen.getByText('NotificationItem.follow.requested.noActor')
		).toBeInTheDocument();
		expect(mockListNotifications).toHaveBeenCalledWith({
			unreadOnly: true,
			cursor: 'unread-cursor',
		});
		expect(
			screen.queryByText('NotificationsPage.loadMore')
		).not.toBeInTheDocument();
	});

	it('marks one notification read using the exact server response', async () => {
		const readAt = '2026-07-18T12:34:56Z';
		mockListNotifications.mockResolvedValueOnce({
			items: [firstItem],
			nextCursor: null,
			unreadCount: 1,
		});
		mockMarkNotificationRead.mockResolvedValueOnce({ ...firstItem, readAt });

		render(<NotificationsPage />);

		fireEvent.click(
			await screen.findByRole('button', {
				name: 'NotificationItem.markAsRead',
			})
		);

		await waitFor(() => {
			expect(
				screen.queryByRole('button', {
					name: 'NotificationItem.markAsRead',
				})
			).not.toBeInTheDocument();
		});
		expect(mockMarkNotificationRead).toHaveBeenCalledWith('n-1');
		expect(useNotificationsStore.getState().items[0].readAt).toBe(readAt);
		expect(useNotificationsStore.getState().unreadCount).toBe(0);
		expect(mockNotify).not.toHaveBeenCalled();
	});

	it('removes an individually read notification from the unread-only view', async () => {
		mockListNotifications
			.mockResolvedValueOnce({
				items: [firstItem],
				nextCursor: null,
				unreadCount: 1,
			})
			.mockResolvedValueOnce({
				items: [firstItem],
				nextCursor: null,
				unreadCount: 1,
			});
		mockMarkNotificationRead.mockResolvedValueOnce({
			...firstItem,
			readAt: '2026-07-18T12:34:56Z',
		});

		render(<NotificationsPage />);
		await screen.findByText('NotificationItem.follow.started.noActor');
		fireEvent.click(screen.getByText('NotificationsPage.unreadOnly'));
		await waitFor(() => expect(mockListNotifications).toHaveBeenCalledTimes(2));

		fireEvent.click(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		);

		expect(
			await screen.findByText('NotificationsPage.emptyUnread')
		).toBeInTheDocument();
	});

	it('marks all notifications read and reloads the first page', async () => {
		const readItems = [firstItem, unreadItem].map((item) => ({
			...item,
			readAt: '2026-07-18T12:34:56Z',
		}));
		mockListNotifications
			.mockResolvedValueOnce({
				items: [firstItem, unreadItem],
				nextCursor: 'cursor-1',
				unreadCount: 2,
			})
			.mockResolvedValueOnce({
				items: readItems,
				nextCursor: null,
				unreadCount: 0,
			});
		mockMarkAllNotificationsRead.mockResolvedValueOnce({
			updatedCount: 2,
			unreadCount: 0,
		});

		render(<NotificationsPage />);
		fireEvent.click(
			await screen.findByRole('button', {
				name: 'NotificationsPage.markAllAsRead',
			})
		);

		await waitFor(() => expect(mockListNotifications).toHaveBeenCalledTimes(2));
		expect(mockMarkAllNotificationsRead).toHaveBeenCalledOnce();
		expect(useNotificationsStore.getState()).toMatchObject({
			items: readItems,
			nextCursor: null,
			unreadCount: 0,
		});
		expect(
			screen.queryByRole('button', {
				name: 'NotificationsPage.markAllAsRead',
			})
		).not.toBeInTheDocument();
	});

	it('shows retryable danger feedback when an individual read fails', async () => {
		mockListNotifications.mockResolvedValueOnce({
			items: [firstItem],
			nextCursor: null,
			unreadCount: 1,
		});
		mockMarkNotificationRead.mockRejectedValueOnce(new Error('Read failed'));

		render(<NotificationsPage />);
		fireEvent.click(
			await screen.findByRole('button', {
				name: 'NotificationItem.markAsRead',
			})
		);

		await waitFor(() => {
			expect(mockNotify).toHaveBeenCalledWith({
				variant: 'danger',
				message: 'NotificationItem.markAsReadError',
			});
		});
		expect(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		).toBeEnabled();
	});
});
