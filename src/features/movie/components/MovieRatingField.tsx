import { type ReactNode, useId } from 'react';
import { RateMovie } from './RateMovie';

interface MovieRatingFieldProps {
	value?: number | null;
	onChange: (rating: number) => void;
	label: string;
	description?: string;
	error?: string;
	disabled?: boolean;
	labelClassName?: string;
	children?: ReactNode;
}

export const MovieRatingField = ({
	value,
	onChange,
	label,
	description,
	error,
	disabled,
	labelClassName = '',
	children,
}: MovieRatingFieldProps) => {
	const id = useId();
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;

	return (
		<>
			<p className={`text-sm font-medium ${labelClassName}`}>{label}</p>
			{description && (
				<p id={descriptionId} className="text-sm text-muted-foreground mb-2">
					{description}
				</p>
			)}
			{children || (
				<RateMovie
					rating={value ?? undefined}
					onChangeRating={onChange}
					label={label}
					descriptionId={
						[description && descriptionId, error && errorId]
							.filter(Boolean)
							.join(' ') || undefined
					}
					disabled={disabled}
				/>
			)}
			{error && (
				<span id={errorId} className="text-sm text-red-500">
					{error}
				</span>
			)}
		</>
	);
};
