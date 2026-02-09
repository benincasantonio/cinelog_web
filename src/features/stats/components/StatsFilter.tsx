import { Button, Input } from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStatsStore } from '../stores';

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();

const formSchema = z
	.object({
		yearFrom: z.number().min(MIN_YEAR).max(MAX_YEAR).nullable(),
		yearTo: z.number().min(MIN_YEAR).max(MAX_YEAR).nullable(),
	})
	.superRefine((data, context) => {
		if (data.yearFrom != null && data.yearTo == null) {
			context.addIssue({
				code: 'custom',
				message: 'bothYearsRequired',
				path: ['yearTo'],
			});
		}

		if (data.yearTo != null && data.yearFrom == null) {
			context.addIssue({
				code: 'custom',
				message: 'bothYearsRequired',
				path: ['yearFrom'],
			});
		}

		if (data.yearFrom == null || data.yearTo == null) return;

		if (data.yearTo < data.yearFrom) {
			context.addIssue({
				code: 'custom',
				message: 'yearToBeforeYearFrom',
				path: ['yearTo'],
			});
		}
	});

type FormValues = z.infer<typeof formSchema>;

export const StatsFilter = () => {
	const { t } = useTranslation();

	const filters = useStatsStore((state) => state.filters);
	const setYearFrom = useStatsStore((state) => state.setYearFrom);
	const setYearTo = useStatsStore((state) => state.setYearTo);
	const fetchStats = useStatsStore((state) => state.fetchStats);
	const resetFilters = useStatsStore((state) => state.resetFilters);
	const activePreset = useStatsStore((state) => state.activePreset());
	const applyPreset = useStatsStore((state) => state.applyPreset);

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
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues,
	});

	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	function onSubmit(data: FormValues) {
		setYearFrom(data.yearFrom);
		setYearTo(data.yearTo);
		fetchStats();
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-3 items-end"
		>
			<div className="w-full flex items-center gap-1 overflow-x-auto pb-1">
				<Button
					type="button"
					size="sm"
					variant={activePreset === 'allTime' ? 'default' : 'outline'}
					onClick={() => applyPreset('allTime')}
					data-testid="preset-allTime"
					data-active={activePreset === 'allTime'}
				>
					{t('StatsFilter.allTime')}
				</Button>
				<Button
					type="button"
					size="sm"
					variant={activePreset === 'thisYear' ? 'default' : 'outline'}
					onClick={() => applyPreset('thisYear')}
					data-testid="preset-thisYear"
					data-active={activePreset === 'thisYear'}
				>
					{t('StatsFilter.thisYear')}
				</Button>
				<Button
					type="button"
					size="sm"
					variant={activePreset === 'lastYear' ? 'default' : 'outline'}
					onClick={() => applyPreset('lastYear')}
					data-testid="preset-lastYear"
					data-active={activePreset === 'lastYear'}
				>
					{t('StatsFilter.lastYear')}
				</Button>
				<Button
					type="button"
					size="sm"
					variant={activePreset === 'last5Years' ? 'default' : 'outline'}
					onClick={() => applyPreset('last5Years')}
					data-testid="preset-last5Years"
					data-active={activePreset === 'last5Years'}
				>
					{t('StatsFilter.last5Years')}
				</Button>
			</div>

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
