import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MovieVote } from './MovieVote';

describe('MovieVote', () => {
	it('returns null when vote is zero or lower', () => {
		const { container: zeroVote } = render(
			<MovieVote vote={0} source="tmdb" />
		);
		expect(zeroVote).toBeEmptyDOMElement();

		const { container: negativeVote } = render(
			<MovieVote vote={-1} source="user" />
		);
		expect(negativeVote).toBeEmptyDOMElement();
	});

	it('renders formatted vote with tmdb color class', () => {
		render(<MovieVote vote={7.25} source="tmdb" />);
		expect(screen.getByText('7.3')).toBeInTheDocument();
		expect(screen.getByText('7.3').parentElement).toHaveClass('text-amber-500');
	});

	it('renders with user color class and custom className', () => {
		render(<MovieVote vote={8} source="user" className="clickable" />);
		expect(screen.getByText('8.0').parentElement).toHaveClass(
			'text-primary',
			'clickable'
		);
	});

	it('calls onClick when vote container is clicked', () => {
		const onClick = vi.fn();
		render(<MovieVote vote={9} source="user" onClick={onClick} />);
		fireEvent.click(screen.getByText('9.0'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
