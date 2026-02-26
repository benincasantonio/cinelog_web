import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatsCard } from './StatsCard';

describe('StatsCard', () => {
	it('should render the title', () => {
		render(<StatsCard title="Total Movies" value={42} />);

		expect(screen.getByText('Total Movies')).toBeInTheDocument();
	});

	it('should render a string value', () => {
		render(<StatsCard title="Favorite" value="Sci-Fi" />);

		expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
	});

	it('should render a numeric value', () => {
		render(<StatsCard title="Count" value={99} />);

		expect(screen.getByText('99')).toBeInTheDocument();
	});

	it('should set data-testid when provided', () => {
		render(<StatsCard title="Title" value={1} testId="my-card" />);

		expect(screen.getByTestId('my-card')).toBeInTheDocument();
		expect(screen.getByTestId('my-card-value')).toHaveTextContent('1');
	});

	it('should not set value data-testid when testId is not provided', () => {
		const { container } = render(<StatsCard title="Title" value={1} />);

		expect(
			container.querySelector('[data-testid$="-value"]')
		).not.toBeInTheDocument();
	});
});
