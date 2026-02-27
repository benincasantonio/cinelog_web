import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSubmitRating = vi.fn();
const storeState = {
	isLoading: false,
	movieRating: null as { rating: number; comment?: string | null } | null,
};

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('../stores/useMovieRatingStore', () => ({
	useMovieRatingStore: (
		selector: (state: {
			submitRating: (rating: number, comment?: string) => Promise<unknown>;
			isLoading: boolean;
			movieRating: { rating: number; comment?: string | null } | null;
		}) => unknown
	) =>
		selector({
			submitRating: mockSubmitRating,
			isLoading: storeState.isLoading,
			movieRating: storeState.movieRating,
		}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Button: ({
		children,
		onClick,
		disabled,
		type,
	}: {
		children?: ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		type?: 'button' | 'submit';
	}) => (
		<button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
	Spinner: () => <span>spinner</span>,
	Textarea: ({ ...props }: Record<string, unknown>) => <textarea {...props} />,
}));

vi.mock('./RateMovie', () => ({
	RateMovie: ({
		rating,
		onChangeRating,
	}: {
		rating?: number;
		onChangeRating: (value: number) => void;
	}) => (
		<div>
			<span data-testid="current-rating">{rating ?? 0}</span>
			<button type="button" onClick={() => onChangeRating(8)}>
				choose-rating
			</button>
		</div>
	),
}));

import { RateMovieForm } from './RateMovieForm';

describe('RateMovieForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storeState.isLoading = false;
		storeState.movieRating = null;
		mockSubmitRating.mockResolvedValue({ rating: 8, comment: 'great' });
	});

	it('renders labels and starts with disabled submit', () => {
		render(<RateMovieForm />);
		expect(screen.getByText('RateMovieForm.yourRating')).toBeInTheDocument();
		expect(
			screen.getByText('RateMovieForm.reviewOptional')
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'RateMovieForm.save' })
		).toBeDisabled();
	});

	it('submits rating and calls onSuccess', async () => {
		const onSuccess = vi.fn();
		render(<RateMovieForm onSuccess={onSuccess} />);

		fireEvent.click(screen.getByRole('button', { name: 'choose-rating' }));
		fireEvent.change(screen.getByLabelText('RateMovieForm.reviewOptional'), {
			target: { value: 'Amazing' },
		});
		const form = screen
			.getByRole('button', { name: 'RateMovieForm.save' })
			.closest('form');
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);

		await waitFor(() => {
			expect(mockSubmitRating).toHaveBeenCalledWith(8, 'Amazing');
		});
		expect(onSuccess).toHaveBeenCalledWith({ rating: 8, comment: 'great' });
	});

	it('calls onCancel from cancel button', () => {
		const onCancel = vi.fn();
		render(<RateMovieForm onCancel={onCancel} />);
		fireEvent.click(
			screen.getByRole('button', { name: 'RateMovieForm.cancel' })
		);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('does not call onSuccess when submit returns nothing', async () => {
		mockSubmitRating.mockResolvedValueOnce(undefined);
		const onSuccess = vi.fn();
		render(<RateMovieForm onSuccess={onSuccess} />);

		fireEvent.click(screen.getByRole('button', { name: 'choose-rating' }));
		const form = screen
			.getByRole('button', { name: 'RateMovieForm.save' })
			.closest('form');
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);

		await waitFor(() => {
			expect(mockSubmitRating).toHaveBeenCalledWith(8, '');
		});
		expect(onSuccess).not.toHaveBeenCalled();
	});

	it('loads existing movie rating into the form', async () => {
		storeState.movieRating = { rating: 7, comment: 'Old note' };
		render(<RateMovieForm />);
		await waitFor(() => {
			expect(screen.getByTestId('current-rating')).toHaveTextContent('7');
			expect(screen.getByLabelText('RateMovieForm.reviewOptional')).toHaveValue(
				'Old note'
			);
		});
	});

	it('shows validation message when submitted without selecting rating', async () => {
		render(<RateMovieForm />);
		const form = screen
			.getByRole('button', { name: 'RateMovieForm.save' })
			.closest('form');
		expect(form).not.toBeNull();

		fireEvent.submit(form as HTMLFormElement);

		await waitFor(() => {
			expect(
				screen.getByText('RateMovieForm.validation.rating')
			).toBeInTheDocument();
		});
	});

	it('renders spinner and disabled actions while loading', () => {
		storeState.isLoading = true;
		render(<RateMovieForm />);

		expect(screen.getByText('spinner')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'RateMovieForm.cancel' })
		).toBeDisabled();
	});

	it('handles existing movie rating with null comment', async () => {
		storeState.movieRating = { rating: 6, comment: null };
		render(<RateMovieForm />);

		await waitFor(() => {
			expect(screen.getByTestId('current-rating')).toHaveTextContent('6');
			expect(screen.getByLabelText('RateMovieForm.reviewOptional')).toHaveValue(
				''
			);
		});
	});
});
