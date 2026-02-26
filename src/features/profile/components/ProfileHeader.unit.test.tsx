import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('lucide-react', () => ({
	User: () => <svg data-testid="user-icon" />,
}));

import { ProfileHeader } from './ProfileHeader';

const fullUser = {
	firstName: 'John',
	lastName: 'Doe',
	handle: 'johndoe',
	bio: 'Movie lover',
};

describe('ProfileHeader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the user full name', () => {
		render(<ProfileHeader userInfo={fullUser as never} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('should render the user handle with @ prefix', () => {
		render(<ProfileHeader userInfo={fullUser as never} />);

		expect(screen.getByText('@johndoe')).toBeInTheDocument();
	});

	it('should not render the handle when it is not provided', () => {
		const { firstName, lastName, bio } = fullUser;
		render(<ProfileHeader userInfo={{ firstName, lastName, bio } as never} />);

		expect(screen.queryByText(/@/)).not.toBeInTheDocument();
	});

	it('should render the bio when provided', () => {
		render(<ProfileHeader userInfo={fullUser as never} />);

		expect(screen.getByText('Movie lover')).toBeInTheDocument();
	});

	it('should render the noBio placeholder when bio is missing', () => {
		const { firstName, lastName, handle } = fullUser;
		render(
			<ProfileHeader userInfo={{ firstName, lastName, handle } as never} />
		);

		expect(screen.getByText('ProfileHeader.noBio')).toBeInTheDocument();
	});

	it('should render the about section heading', () => {
		render(<ProfileHeader userInfo={fullUser as never} />);

		expect(screen.getByText('ProfileHeader.about')).toBeInTheDocument();
	});

	it('should render the user icon', () => {
		render(<ProfileHeader userInfo={fullUser as never} />);

		expect(screen.getByTestId('user-icon')).toBeInTheDocument();
	});

	it('should handle null userInfo', () => {
		render(<ProfileHeader userInfo={null} />);

		expect(screen.getByText('ProfileHeader.noBio')).toBeInTheDocument();
		expect(screen.getByText('ProfileHeader.about')).toBeInTheDocument();
	});
});
