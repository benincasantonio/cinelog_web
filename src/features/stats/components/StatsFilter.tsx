import { Button, Checkbox, Input } from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStatsStore } from '../stores';

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();

const formSchema = z
	.object({
		isAllTime: z.boolean(),
		yearFrom: z.number().min(MIN_YEAR).max(MAX_YEAR).nullable(),
		yearTo: z.number().min(MIN_YEAR).max(MAX_YEAR).nullable(),
	})
	.refine(
		(data) => {
			if (data.isAllTime || data.yearFrom == null || data.yearTo == null)
				return true;
			return data.yearTo >= data.yearFrom;
		},
		{
			message: 'yearToBeforeYearFrom',
			path: ['yearTo'],
		}
	);

type FormValues = z.infer<typeof formSchema>;

export const StatsFilter = () => {
	const { t } = useTranslation();

	const isAllTime = useStatsStore((state) => state.isAllTime());
	const filters = useStatsStore((state) => state.filters);
	const setYearFrom = useStatsStore((state) => state.setYearFrom);
	const setYearTo = useStatsStore((state) => state.setYearTo);
	const canApplyFilters = useStatsStore((state) => state.canApplyFilters());
	const setAllTime = useStatsStore((state) => state.setAllTime);
	const fetchStats = useStatsStore((state) => state.fetchStats);
	const resetFilters = useStatsStore((state) => state.resetFilters);
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		values: {
			isAllTime,
			yearFrom: filters?.yearFrom ?? null,
			yearTo: filters?.yearTo ?? null,
		},
	});

	function onSubmit() {
		fetchStats();
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col md:flex-row justify-end items-center gap-5"
		>
			<div className="flex items-center gap-1.5">
				<Controller
					name="isAllTime"
					control={control}
					render={({ field }) => (
						<Checkbox
							checked={field.value}
							onChange={(e) => {
								setAllTime(e.target.checked);
							}}
						/>
					)}
				/>
				<span data-testid="all-time-label">{t('StatsFilter.allTime')}</span>
			</div>

			{!isAllTime && (
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<Controller
							name="yearFrom"
							control={control}
							render={({ field }) => (
								<Input
									type="number"
									min={MIN_YEAR}
									max={MAX_YEAR}
									placeholder={t('StatsFilter.yearFrom')}
									value={field.value ?? ''}
									onChange={(e) => {
										const value = e.target.value
											? Number(e.target.value)
											: null;
										setYearFrom(value);
									}}
								/>
							)}
						/>
						<span data-testid="year-separator">-</span>
						<Controller
							name="yearTo"
							control={control}
							render={({ field }) => (
								<Input
									type="number"
									min={MIN_YEAR}
									max={MAX_YEAR}
									placeholder={t('StatsFilter.yearTo')}
									value={field.value ?? ''}
									onChange={(e) => {
										const value = e.target.value
											? Number(e.target.value)
											: null;
										setYearTo(value);
									}}
								/>
							)}
						/>
					</div>
					{errors.yearFrom && (
						<span className="text-red-500 text-sm" data-testid="error-yearFrom">
							{t(
								`StatsFilter.validation.${errors.yearFrom.type === 'too_big' ? 'maxYear' : 'minYear'}`,
								{ min: MIN_YEAR, max: MAX_YEAR }
							)}
						</span>
					)}
					{errors.yearTo && (
						<span className="text-red-500 text-sm" data-testid="error-yearTo">
							{t(
								`StatsFilter.validation.${
									errors.yearTo.message === 'yearToBeforeYearFrom'
										? 'yearToBeforeYearFrom'
										: errors.yearTo.type === 'too_big'
											? 'maxYear'
											: 'minYear'
								}`,
								{ min: MIN_YEAR, max: MAX_YEAR }
							)}
						</span>
					)}
				</div>
			)}

			<Button type="submit" disabled={!canApplyFilters} size="sm">
				{t('StatsFilter.applyFilters')}
			</Button>

			<Button
				type="button"
				disabled={!canApplyFilters}
				size="sm"
				variant="outline"
				onClick={resetFilters}
			>
				{t('StatsFilter.resetFilters')}
			</Button>
		</form>
	);
};
