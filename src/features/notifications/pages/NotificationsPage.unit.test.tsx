import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationBaseResponse } from '../models';

const mockLoadNotifications = vi.fn();
const mockLoadMore = vi.fn();
const mockSetUnreadOnly = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockReset = vi.fn();
const mockNotify = vi.fn();

const storeState = {
	items: [] as NotificationBaseResponse[],
	nextCursor: null as string | null,
	unreadCount: 0,
	unreadOnly: false,
	isLoading: false,
	isLoadingMore: false,
	pendingReadId: null as string | null,
	isMarkingAllRead: false,
	error: null as string | null,
	hasLoaded: false,
	loadNotifications: mockLoadNotifications,
	loadMore: mockLoadMore,
	setUnreadOnly: mockSetUnreadOnly,
	markAllAsRead: mockMarkAllAsRead,
	reset: mockReset,
};

vi.mock('../stores', () => ({
	useNotificationsStore: (selector: (state: typeof storeState) => unknown) =>
		selector(storeState),
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

import NotificationsPage from './NotificationsPage';

const sampleItem: NotificationBaseResponse = {
	id: 'n-1',
	type: 'follow.started',
	title: 'New follower',
	body: 'A user started following you.',
	actor: null,
	availableActions: [],
	readAt: null,
	createdAt: '2026-07-18T10:30:00Z',
};

describe('NotificationsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storeState.items = [];
		storeState.nextCursor = null;
		storeState.unreadCount = 0;
		storeState.unreadOnly = false;
		storeState.isLoading = false;
		storeState.isLoadingMore = false;
		storeState.pendingReadId = null;
		storeState.isMarkingAllRead = false;
		storeState.error = null;
		storeState.hasLoaded = false;
		mockMarkAllAsRead.mockResolvedValue(undefined);
	});

	it('loads notifications on mount and resets on unmount', () => {
		const { unmount } = render(<NotificationsPage />);

		expect(mockLoadNotifications).toHaveBeenCalledOnce();
		unmount();
		expect(mockReset).toHaveBeenCalledOnce();
	});

	it('renders the loading state', () => {
		storeState.isLoading = true;

		render(<NotificationsPage />);

		expect(screen.getByText('NotificationsPage.loading')).toBeInTheDocument();
	});

	it('renders the empty state', () => {
		storeState.hasLoaded = true;

		render(<NotificationsPage />);

		expect(screen.getByText('NotificationsPage.empty')).toBeInTheDocument();
	});

	it('renders the unread empty state when the filter is on', () => {
		storeState.hasLoaded = true;
		storeState.unreadOnly = true;

		render(<NotificationsPage />);

		expect(
			screen.getByText('NotificationsPage.emptyUnread')
		).toBeInTheDocument();
	});

	it('renders a retryable error', () => {
		storeState.hasLoaded = true;
		storeState.error = 'Network error';

		render(<NotificationsPage />);

		expect(screen.getByText('NotificationsPage.error')).toBeInTheDocument();
		fireEvent.click(screen.getByText('NotificationsPage.retry'));
		expect(mockLoadNotifications).toHaveBeenCalledTimes(2);
	});

	it('renders items and load more', () => {
		storeState.hasLoaded = true;
		storeState.items = [sampleItem];
		storeState.nextCursor = 'cursor-1';

		render(<NotificationsPage />);

		expect(
			screen.getByText('NotificationItem.follow.started.noActor')
		).toBeInTheDocument();
		fireEvent.click(screen.getByText('NotificationsPage.loadMore'));
		expect(mockLoadMore).toHaveBeenCalledOnce();
	});

	it('toggles the unread filter', () => {
		storeState.hasLoaded = true;

		render(<NotificationsPage />);

		fireEvent.click(screen.getByText('NotificationsPage.unreadOnly'));
		expect(mockSetUnreadOnly).toHaveBeenCalledWith(true);
	});

	it('marks all notifications read from an immediate text control', async () => {
		storeState.hasLoaded = true;
		storeState.items = [sampleItem];
		storeState.unreadCount = 1;

		render(<NotificationsPage />);

		fireEvent.click(
			screen.getByRole('button', { name: 'NotificationsPage.markAllAsRead' })
		);

		await waitFor(() => {
			expect(mockMarkAllAsRead).toHaveBeenCalledOnce();
		});
		expect(mockNotify).not.toHaveBeenCalled();
	});

	it('hides the bulk control when there are no unread notifications', () => {
		storeState.hasLoaded = true;

		render(<NotificationsPage />);

		expect(
			screen.queryByRole('button', {
				name: 'NotificationsPage.markAllAsRead',
			})
		).not.toBeInTheDocument();
	});

	it('disables the bulk control while a read mutation is pending', () => {
		storeState.hasLoaded = true;
		storeState.items = [sampleItem];
		storeState.unreadCount = 1;
		storeState.pendingReadId = 'n-1';

		render(<NotificationsPage />);

		expect(
			screen.getByRole('button', { name: 'NotificationsPage.markAllAsRead' })
		).toBeDisabled();
	});

	it('shows localized danger feedback and permits bulk retry after failure', async () => {
		mockMarkAllAsRead.mockRejectedValueOnce(new Error('Bulk failed'));
		storeState.hasLoaded = true;
		storeState.items = [sampleItem];
		storeState.unreadCount = 1;

		render(<NotificationsPage />);
		fireEvent.click(
			screen.getByRole('button', { name: 'NotificationsPage.markAllAsRead' })
		);

		await waitFor(() => {
			expect(mockNotify).toHaveBeenCalledWith({
				variant: 'danger',
				message: 'NotificationsPage.markAllAsReadError',
			});
		});
	});
});
