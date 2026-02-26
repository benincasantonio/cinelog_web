import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MovieRuntime } from './MovieRuntime';

describe('MovieRuntime', () => {
	it('returns null for null runtime', () => {
		const { container } = render(<MovieRuntime runtime={null} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('returns null for zero runtime', () => {
		const { container } = render(<MovieRuntime runtime={0} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders hours and minutes for valid runtime', () => {
		render(<MovieRuntime runtime={125} />);
		expect(screen.getByText('2h 5m')).toBeInTheDocument();
	});

	it('applies custom class name', () => {
		const { container } = render(
			<MovieRuntime runtime={60} className="custom-runtime" />
		);
		expect(container.firstChild).toHaveClass('custom-runtime');
	});
});
