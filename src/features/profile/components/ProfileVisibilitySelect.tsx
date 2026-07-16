import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@antoniobenincasa/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
	PROFILE_VISIBILITY_VALUES,
	type ProfileVisibility,
} from '@/lib/models';

type ProfileVisibilitySelectProps = {
	value: ProfileVisibility;
	onChange: (value: ProfileVisibility) => void;
};

export const ProfileVisibilitySelect = ({
	value,
	onChange,
}: ProfileVisibilitySelectProps) => {
	const { t } = useTranslation();
	const descriptionId = useId();

	return (
		<div className="grid gap-2">
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-full" aria-describedby={descriptionId}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PROFILE_VISIBILITY_VALUES.map((option) => (
						<SelectItem key={option} value={option}>
							{t(`ProfileVisibilitySelect.${option}`)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p id={descriptionId} className="text-muted-foreground text-sm">
				{t(`ProfileVisibilitySelect.descriptions.${value}`)}
			</p>
		</div>
	);
};
