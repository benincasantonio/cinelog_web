import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@antoniobenincasa/ui', () => ({
	Select: ({
		value,
		onValueChange,
		children,
	}: {
		value: string;
		onValueChange: (value: string) => void;
		children: React.ReactNode;
	}) => (
		<div data-testid="select" data-value={value}>
			<button
				type="button"
				data-testid="select-public"
				onClick={() => onValueChange('public')}
			>
				public
			</button>
			<button
				type="button"
				data-testid="select-private"
				onClick={() => onValueChange('private')}
			>
				private
			</button>
			<button
				type="button"
				data-testid="select-followers-only"
				onClick={() => onValueChange('followers_only')}
			>
				followers_only
			</button>
			{children}
		</div>
	),
	SelectTrigger: ({
		children,
		...props
	}: React.HTMLAttributes<HTMLDivElement>) => (
		<div data-testid="select-trigger" {...props}>
			{children}
		</div>
	),
	SelectValue: () => <span />,
	SelectContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SelectItem: ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: string;
	}) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

import { ProfileVisibilitySelect } from './ProfileVisibilitySelect';

describe('ProfileVisibilitySelect', () => {
	const mockOnChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render with the provided value', () => {
		render(<ProfileVisibilitySelect value="private" onChange={mockOnChange} />);

		expect(screen.getByTestId('select')).toHaveAttribute(
			'data-value',
			'private'
		);
	});

	it('should render every supported visibility option', () => {
		render(<ProfileVisibilitySelect value="private" onChange={mockOnChange} />);

		expect(screen.getByTestId('select-item-public')).toBeInTheDocument();
		expect(
			screen.getByTestId('select-item-followers_only')
		).toBeInTheDocument();
		expect(screen.getByTestId('select-item-private')).toBeInTheDocument();
		expect(screen.getAllByTestId(/^select-item-/)).toHaveLength(3);
	});

	it('should describe the selected visibility below the selector', () => {
		render(<ProfileVisibilitySelect value="private" onChange={mockOnChange} />);

		const description = screen.getByText(
			'ProfileVisibilitySelect.descriptions.private'
		);
		expect(screen.getByTestId('select-trigger')).toHaveAttribute(
			'aria-describedby',
			description.id
		);
	});

	it('should call onChange with public when public is selected', async () => {
		const user = userEvent.setup();
		render(<ProfileVisibilitySelect value="private" onChange={mockOnChange} />);

		await user.click(screen.getByTestId('select-public'));

		expect(mockOnChange).toHaveBeenCalledWith('public');
	});

	it('should call onChange with private when private is selected', async () => {
		const user = userEvent.setup();
		render(<ProfileVisibilitySelect value="public" onChange={mockOnChange} />);

		await user.click(screen.getByTestId('select-private'));

		expect(mockOnChange).toHaveBeenCalledWith('private');
	});

	it('should call onChange with followers_only when followers only is selected', async () => {
		const user = userEvent.setup();
		render(<ProfileVisibilitySelect value="private" onChange={mockOnChange} />);

		await user.click(screen.getByTestId('select-followers-only'));

		expect(mockOnChange).toHaveBeenCalledWith('followers_only');
	});
});
