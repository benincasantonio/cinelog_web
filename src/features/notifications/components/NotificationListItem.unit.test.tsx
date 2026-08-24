import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationBaseResponse } from '../models';
import { NotificationListItem } from './NotificationListItem';

const { mockMarkAsRead, mockNotify, notificationStoreState } = vi.hoisted(
	() => ({
		mockMarkAsRead: vi.fn(),
		mockNotify: vi.fn(),
		notificationStoreState: {
			pendingReadId: null as string | null,
			isMarkingAllRead: false,
			markAsRead: vi.fn(),
		},
	})
);

notificationStoreState.markAsRead = mockMarkAsRead;

vi.mock('../stores', () => ({
	useNotificationsStore: (
		selector: (state: typeof notificationStoreState) => unknown
	) => selector(notificationStoreState),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		onClick,
		disabled,
		variant: _variant,
		...props
	}: {
		children?: ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		variant?: string;
	} & Record<string, unknown>) => (
		<button type="button" onClick={onClick} disabled={disabled} {...props}>
			{children}
		</button>
	),
	useNotification: () => ({ notify: mockNotify }),
}));

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
	beforeEach(() => {
		vi.clearAllMocks();
		notificationStoreState.pendingReadId = null;
		notificationStoreState.isMarkingAllRead = false;
		mockMarkAsRead.mockResolvedValue(undefined);
	});

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
		expect(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		).toBeInTheDocument();
	});

	it('renders type-only copy with no link when the actor is missing', () => {
		renderItem({ ...unreadNotification, actor: null });

		expect(
			screen.getByText('NotificationItem.follow.started.noActor')
		).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.queryByText('Movie Fan')).not.toBeInTheDocument();
	});

	it('marks an unread notification read from an explicit text button', async () => {
		renderItem(unreadNotification);

		fireEvent.click(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		);

		await waitFor(() => {
			expect(mockMarkAsRead).toHaveBeenCalledWith('n-1');
		});
		expect(mockNotify).not.toHaveBeenCalled();
	});

	it('does not render a read control for an already-read notification', () => {
		renderItem({
			...unreadNotification,
			readAt: '2026-07-18T11:00:00Z',
		});

		expect(
			screen.queryByRole('button', { name: 'NotificationItem.markAsRead' })
		).not.toBeInTheDocument();
	});

	it('disables and exposes busy state while a read mutation is pending', () => {
		notificationStoreState.pendingReadId = 'n-1';

		renderItem(unreadNotification);

		expect(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		).toBeDisabled();
		expect(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		).toHaveAttribute('aria-busy', 'true');
	});

	it('disables individual reads during a bulk mutation', () => {
		notificationStoreState.isMarkingAllRead = true;

		renderItem(unreadNotification);

		expect(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
		).toBeDisabled();
	});

	it('shows localized danger feedback and permits retry after failure', async () => {
		mockMarkAsRead.mockRejectedValueOnce(new Error('Read failed'));
		renderItem(unreadNotification);

		fireEvent.click(
			screen.getByRole('button', { name: 'NotificationItem.markAsRead' })
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
