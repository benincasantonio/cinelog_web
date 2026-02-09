import { Button, Input } from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
	MAX_YEAR,
	MIN_YEAR,
	type StatsFilterSchema,
	statsFilterSchema,
} from '../schemas';
import { useStatsStore } from '../stores';
import { StatsFilterPresets } from './StatsFilterPresets';

export const StatsFilter = () => {
	const { t } = useTranslation();

	const filters = useStatsStore((state) => state.filters);
	const setYearFrom = useStatsStore((state) => state.setYearFrom);
	const setYearTo = useStatsStore((state) => state.setYearTo);
	const fetchStats = useStatsStore((state) => state.fetchStats);
	const resetFilters = useStatsStore((state) => state.resetFilters);

	const defaultValues = useMemo(
		() => ({
			yearFrom: filters?.yearFrom ?? null,
			yearTo: filters?.yearTo ?? null,
		}),
		[filters]
	);

	const {
		control,
		handleSubmit,
		formState: { isDirty, errors },
		reset,
	} = useForm<StatsFilterSchema>({
		resolver: zodResolver(statsFilterSchema),
		mode: 'onChange',
		defaultValues,
	});

	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	function onSubmit(data: StatsFilterSchema) {
		setYearFrom(data.yearFrom);
		setYearTo(data.yearTo);
		fetchStats();
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-3 items-end"
		>
			<StatsFilterPresets />

			<div className="flex flex-col md:flex-row items-end gap-2 md:gap-5">
				<div className="flex flex-col gap-0.5">
					<span className="text-xs font-medium text-gray-500">
						{t('StatsFilter.yearRange')}
					</span>
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
									aria-label={t('StatsFilter.yearFrom')}
									className="w-32 text-base"
									value={field.value ?? ''}
									onChange={(e) => {
										const value = e.target.value
											? Number(e.target.value)
											: null;
										field.onChange(value);
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
									aria-label={t('StatsFilter.yearTo')}
									className="w-32 text-base"
									value={field.value ?? ''}
									onChange={(e) => {
										const value = e.target.value
											? Number(e.target.value)
											: null;
										field.onChange(value);
									}}
								/>
							)}
						/>
					</div>
					{errors.yearFrom && (
						<span className="text-red-500 text-sm" data-testid="error-yearFrom">
							{t(
								`StatsFilter.validation.${
									errors.yearFrom.message === 'bothYearsRequired'
										? 'bothYearsRequired'
										: errors.yearFrom.type === 'too_big'
											? 'maxYear'
											: 'minYear'
								}`,
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
										: errors.yearTo.message === 'bothYearsRequired'
											? 'bothYearsRequired'
											: errors.yearTo.type === 'too_big'
												? 'maxYear'
												: 'minYear'
								}`,
								{ min: MIN_YEAR, max: MAX_YEAR }
							)}
						</span>
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button type="submit" disabled={!isDirty} size="sm">
						{t('StatsFilter.applyFilters')}
					</Button>

					<Button
						type="button"
						disabled={!isDirty}
						size="sm"
						variant="outline"
						onClick={resetFilters}
					>
						{t('StatsFilter.resetFilters')}
					</Button>
				</div>
			</div>
		</form>
	);
};
