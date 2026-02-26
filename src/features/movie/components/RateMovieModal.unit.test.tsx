import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetIsOpen = vi.fn();
const storeState = { isOpen: true };

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('../stores/useMovieRatingStore', () => ({
	useMovieRatingStore: (
		selector: (state: {
			isOpen: boolean;
			setIsOpen: (value: boolean) => void;
		}) => unknown
	) => selector({ isOpen: storeState.isOpen, setIsOpen: mockSetIsOpen }),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Dialog: ({ children, open }: { children?: ReactNode; open: boolean }) => (
		<div data-testid="dialog" data-open={open ? 'true' : 'false'}>
			{children}
		</div>
	),
	DialogContent: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DialogHeader: ({ children }: { children?: ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
	DialogDescription: ({ children }: { children?: ReactNode }) => (
		<p>{children}</p>
	),
}));

vi.mock('./RateMovieForm', () => ({
	RateMovieForm: ({
		onSuccess,
		onCancel,
	}: {
		onSuccess?: (rating: unknown) => void;
		onCancel?: () => void;
	}) => (
		<div>
			<button
				type="button"
				onClick={() => onSuccess?.({ rating: 8, comment: 'great' })}
			>
				success
			</button>
			<button type="button" onClick={onCancel}>
				cancel
			</button>
		</div>
	),
}));

import { RateMovieModal } from './RateMovieModal';

describe('RateMovieModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storeState.isOpen = true;
	});

	it('renders modal title and description', () => {
		render(<RateMovieModal />);
		expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
		expect(screen.getByText('RateMovieModal.title')).toBeInTheDocument();
		expect(screen.getByText('RateMovieModal.description')).toBeInTheDocument();
	});

	it('closes modal when cancel is triggered', () => {
		render(<RateMovieModal />);
		fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
		expect(mockSetIsOpen).toHaveBeenCalledWith(false);
	});

	it('closes modal and forwards rating on success', () => {
		const onSuccess = vi.fn();
		render(<RateMovieModal onSuccess={onSuccess} />);

		fireEvent.click(screen.getByRole('button', { name: 'success' }));
		expect(mockSetIsOpen).toHaveBeenCalledWith(false);
		expect(onSuccess).toHaveBeenCalledWith({ rating: 8, comment: 'great' });
	});
});
