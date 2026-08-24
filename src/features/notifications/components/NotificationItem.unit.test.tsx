import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationItem } from './NotificationItem';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en-US', resolvedLanguage: 'en-US' },
	}),
}));

const createdAt = '2026-07-18T10:30:00Z';

describe('NotificationItem', () => {
	it('renders the provided title and timestamp without inventing links or buttons', () => {
		render(
			<NotificationItem
				unread
				title="You have a new follower"
				createdAt={createdAt}
			/>
		);

		expect(screen.getByText('You have a new follower')).toBeInTheDocument();
		expect(
			document.querySelector('time[datetime="2026-07-18T10:30:00Z"]')
		).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('marks unread items with a dot and stronger title', () => {
		render(
			<NotificationItem unread title="Unread title" createdAt={createdAt} />
		);

		expect(screen.getByTestId('unread-dot')).toBeInTheDocument();
		expect(screen.getByRole('heading')).toHaveClass('font-semibold');
	});

	it('renders read items without a dot and with a quieter title', () => {
		render(
			<NotificationItem
				unread={false}
				title="Read title"
				createdAt={createdAt}
			/>
		);

		expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument();
		expect(screen.getByRole('heading')).not.toHaveClass('font-semibold');
	});

	it('renders an optional explicit action', () => {
		render(
			<NotificationItem
				unread
				title="Unread title"
				createdAt={createdAt}
				action={<button type="button">Mark as read</button>}
			/>
		);

		expect(
			screen.getByRole('button', { name: 'Mark as read' })
		).toBeInTheDocument();
	});
});
