import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MovieRatingField } from './MovieRatingField';

vi.mock('@/lib/hooks', () => ({ useIsMobile: () => false }));
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { value: number }) =>
			options ? `${key} ${options.value}` : key,
	}),
}));

describe('MovieRatingField', () => {
	it('labels the shared selector and forwards rating changes', () => {
		const onChange = vi.fn();
		render(
			<MovieRatingField label="Your rating" value={8} onChange={onChange} />
		);
		expect(
			screen.getByRole('group', { name: 'Your rating' })
		).toBeInTheDocument();
		expect(screen.getByRole('radio', { checked: true })).toHaveAttribute(
			'value',
			'8'
		);
		fireEvent.click(screen.getAllByRole('radio')[9]);
		expect(onChange).toHaveBeenCalledWith(10);
	});

	it('associates description and error with the selector using unique IDs', () => {
		render(
			<>
				<MovieRatingField
					label="First"
					description="Applies to all viewings"
					error="Choose a rating"
					onChange={vi.fn()}
				/>
				<MovieRatingField
					label="Second"
					description="Another movie"
					onChange={vi.fn()}
				/>
			</>
		);
		expect(
			screen.getByRole('group', { name: 'First' })
		).toHaveAccessibleDescription('Applies to all viewings Choose a rating');
		expect(
			screen.getByRole('group', { name: 'Second' })
		).toHaveAccessibleDescription('Another movie');
	});

	it('supports an empty disabled rating', () => {
		render(
			<MovieRatingField
				label="Your rating"
				value={null}
				onChange={vi.fn()}
				disabled
			/>
		);
		for (const radio of screen.getAllByRole('radio')) {
			expect(radio).not.toBeChecked();
			expect(radio).toBeDisabled();
		}
	});

	it('keeps the label and description while the parent supplies a loading placeholder', () => {
		render(
			<MovieRatingField
				label="Your rating"
				description="Applies to all viewings"
				onChange={vi.fn()}
			>
				<p role="status">Loading rating</p>
			</MovieRatingField>
		);
		expect(screen.getByText('Your rating')).toBeInTheDocument();
		expect(screen.getByText('Applies to all viewings')).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('Loading rating');
		expect(screen.queryByRole('radio')).not.toBeInTheDocument();
	});
});
