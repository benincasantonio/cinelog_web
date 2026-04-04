import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import type { ProfileVisibility } from '@/lib/models';

type ProfileVisibilitySelectProps = {
	value: ProfileVisibility;
	onChange: (value: ProfileVisibility) => void;
};

const VISIBLE_OPTIONS: ProfileVisibility[] = ['public', 'private'];

export const ProfileVisibilitySelect = ({
	value,
	onChange,
}: ProfileVisibilitySelectProps) => {
	const { t } = useTranslation();

	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{VISIBLE_OPTIONS.map((option) => (
					<SelectItem key={option} value={option}>
						{t(`ProfileVisibilitySelect.${option}`)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
