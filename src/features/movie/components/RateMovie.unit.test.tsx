import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
