import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockIsMobile = false;
vi.mock('@/lib/hooks', () => ({
	useIsMobile: () => mockIsMobile,
}));

vi.mock('lucide-react', () => ({
	Star: ({
		className,
		onClick,
	}: {
		className: string;
		onClick: () => void;
	}) => <svg data-testid="star" className={className} onClick={onClick} />,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, params?: Record<string, unknown>) => {
			if (key === 'RateMovie.optionLabel')
				return `Rate ${params?.value} star${params?.value === 1 ? '' : 's'}`;
			if (key === 'RateMovie.ratingLabel') return `${params?.value} out of 10`;
			return key;
		},
	}),
}));

import { RateMovie } from './RateMovie';

describe('RateMovie', () => {
	const mockOnChangeRating = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsMobile = false;
	});

	it('should render 10 stars', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		expect(screen.getAllByTestId('star')).toHaveLength(10);
	});

	it('should call onChangeRating when a star is clicked', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		const stars = screen.getAllByTestId('star');
		fireEvent.click(stars[6]); // 7th star (index 6)

		expect(mockOnChangeRating).toHaveBeenCalledWith(7);
	});

	it('should highlight stars up to the current rating', () => {
		render(<RateMovie rating={5} onChangeRating={mockOnChangeRating} />);

		const stars = screen.getAllByTestId('star');
		for (let i = 0; i < 5; i++) {
			expect(stars[i]).toHaveClass('text-yellow-400');
		}
		for (let i = 5; i < 10; i++) {
			expect(stars[i]).not.toHaveClass('text-yellow-400');
		}
	});

	it('should highlight stars on hover', () => {
		render(<RateMovie rating={0} onChangeRating={mockOnChangeRating} />);

		const thirdStarContainer = screen.getByText('Rate 3 stars').parentElement!;
		fireEvent.mouseEnter(thirdStarContainer);

		const stars = screen.getAllByTestId('star');
		for (let i = 0; i < 3; i++) {
			expect(stars[i]).toHaveClass('text-yellow-400');
		}
		for (let i = 3; i < 10; i++) {
			expect(stars[i]).not.toHaveClass('text-yellow-400');
		}
	});

	it('should reset highlight on mouse leave', () => {
		render(<RateMovie rating={2} onChangeRating={mockOnChangeRating} />);

		// Hover over star 8
		const starContainer = screen.getByText('Rate 8 stars').parentElement!;
		fireEvent.mouseEnter(starContainer);

		// Leave the container
		const container = starContainer.parentElement!;
		fireEvent.mouseLeave(container);

		// Should revert to rating=2
		const stars = screen.getAllByTestId('star');
		expect(stars[1]).toHaveClass('text-yellow-400');
		expect(stars[2]).not.toHaveClass('text-yellow-400');
	});

	it('should use smaller stars on mobile', () => {
		mockIsMobile = true;
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		const stars = screen.getAllByTestId('star');
		expect(stars[0]).toHaveClass('w-5', 'h-5');
	});

	it('should use larger stars on desktop', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		const stars = screen.getAllByTestId('star');
		expect(stars[0]).toHaveClass('w-8', 'h-8');
	});

	it('should treat undefined rating as 0', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		const stars = screen.getAllByTestId('star');
		for (const star of stars) {
			expect(star).not.toHaveClass('text-yellow-400');
		}
	});

	it('should render singular star label for star 1', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		expect(screen.getByText('Rate 1 star')).toBeInTheDocument();
	});

	it('should show numeric badge with current rating when rating is set', () => {
		render(<RateMovie rating={7} onChangeRating={mockOnChangeRating} />);

		expect(screen.getByText('7 out of 10')).toBeInTheDocument();
	});

	it('should show numeric badge with hovered value while hovering', () => {
		render(<RateMovie rating={3} onChangeRating={mockOnChangeRating} />);

		const eighthStarContainer = screen.getByText('Rate 8 stars').parentElement!;
		fireEvent.mouseEnter(eighthStarContainer);

		expect(screen.getByText('8 out of 10')).toBeInTheDocument();
	});

	it('should revert numeric badge to current rating after mouse leave', () => {
		render(<RateMovie rating={3} onChangeRating={mockOnChangeRating} />);

		const eighthStarContainer = screen.getByText('Rate 8 stars').parentElement!;
		fireEvent.mouseEnter(eighthStarContainer);
		expect(screen.getByText('8 out of 10')).toBeInTheDocument();

		const container = eighthStarContainer.parentElement!;
		fireEvent.mouseLeave(container);

		expect(screen.getByText('3 out of 10')).toBeInTheDocument();
	});

	it('should hide numeric badge when no rating and not hovering', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		const badgeEl = document.querySelector('[aria-live="polite"]');
		expect(badgeEl).toHaveClass('opacity-0');
	});

	it('should show numeric badge when hovering with no prior rating', () => {
		render(<RateMovie onChangeRating={mockOnChangeRating} />);

		const fifthStarContainer = screen.getByText('Rate 5 stars').parentElement!;
		fireEvent.mouseEnter(fifthStarContainer);

		expect(screen.getByText('5 out of 10')).toBeInTheDocument();
	});
});

describe('rating keyboard and semantics', () => {
	it('exposes the saved score as a checked, named radio', () => {
		render(<RateMovie rating={8} onChangeRating={vi.fn()} />);
		expect(screen.getAllByRole('radio')).toHaveLength(10);
		expect(screen.getByRole('radio', { name: 'Rate 8 stars' })).toBeChecked();
	});
	it('supports native keyboard selection without submitting a surrounding form', async () => {
		const submit = vi.fn((event) => event.preventDefault());
		function Example() {
			const [rating, setRating] = useState(8);
			return (
				<form onSubmit={submit}>
					<RateMovie rating={rating} onChangeRating={setRating} />
				</form>
			);
		}
		render(<Example />);
		const user = userEvent.setup();
		await user.tab();
		expect(screen.getByRole('radio', { name: 'Rate 8 stars' })).toHaveFocus();
		await user.keyboard('[ArrowRight]');
		expect(screen.getByRole('radio', { name: 'Rate 9 stars' })).toBeChecked();
		expect(submit).not.toHaveBeenCalled();
	});
	it('keeps multiple rating groups independent', () => {
		render(
			<>
				<RateMovie rating={8} onChangeRating={vi.fn()} />
				<RateMovie rating={3} onChangeRating={vi.fn()} />
			</>
		);
		const radios = screen.getAllByRole('radio');
		expect(radios[0].getAttribute('name')).not.toBe(
			radios[10].getAttribute('name')
		);
		expect(radios[7]).toBeChecked();
		expect(radios[12]).toBeChecked();
	});
});
