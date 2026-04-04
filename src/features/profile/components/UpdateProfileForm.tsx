import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Textarea,
	useNotification,
} from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/stores';
import type { UpdateProfileRequest } from '@/features/profile/models';
import type { ProfileVisibility } from '@/lib/models';
import { type UpdateProfileSchema, updateProfileSchema } from '../schemas';
import { useUserStore } from '../stores';
import { ProfileVisibilitySelect } from './ProfileVisibilitySelect';

export const UpdateProfileForm = () => {
	const { t } = useTranslation();
	const { notify } = useNotification();
	const userInfo = useAuthStore((state) => state.userInfo);
	const updateUserInfo = useAuthStore((state) => state.updateUserInfo);
	const updateProfile = useUserStore((state) => state.updateProfile);

	const [loading, setLoading] = useState(false);

	const localizedSchema = updateProfileSchema({
		firstNameRequired: t('UpdateProfileForm.firstNameRequired'),
		lastNameRequired: t('UpdateProfileForm.lastNameRequired'),
		dateOfBirthRequired: t('UpdateProfileForm.dateOfBirthRequired'),
		dateOfBirthInvalidFormat: t('UpdateProfileForm.dateOfBirthInvalidFormat'),
		dateOfBirthInvalidDate: t('UpdateProfileForm.dateOfBirthInvalidDate'),
		dateOfBirthPast: t('UpdateProfileForm.dateOfBirthPast'),
	});

	const form = useForm<UpdateProfileSchema>({
		resolver: zodResolver(localizedSchema),
		defaultValues: {
			firstName: userInfo?.firstName ?? '',
			lastName: userInfo?.lastName ?? '',
			bio: userInfo?.bio ?? '',
			dateOfBirth: userInfo?.dateOfBirth ?? '',
			profileVisibility: userInfo?.profileVisibility ?? 'private',
		},
		mode: 'onBlur',
	});

	const { isDirty } = form.formState;

	const handleSubmit = async (data: UpdateProfileSchema) => {
		setLoading(true);

		const payload: Record<string, unknown> = {};
		for (const key of Object.keys(data) as (keyof UpdateProfileSchema)[]) {
			const newValue = data[key];
			const currentValue = userInfo?.[key];
			if (newValue !== undefined && newValue !== currentValue) {
				payload[key] = newValue;
			}
		}

		if (Object.keys(payload).length === 0) {
			setLoading(false);
			return;
		}

		try {
			const updatedUser = await updateProfile(payload as UpdateProfileRequest);
			updateUserInfo(updatedUser);
			form.reset({
				firstName: updatedUser.firstName ?? '',
				lastName: updatedUser.lastName ?? '',
				bio: updatedUser.bio ?? '',
				dateOfBirth: updatedUser.dateOfBirth ?? '',
				profileVisibility: updatedUser.profileVisibility,
			});
			notify({
				variant: 'success',
				message: t('UpdateProfileForm.success'),
			});
		} catch {
			notify({
				variant: 'danger',
				message: t('UpdateProfileForm.error'),
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-2">
					<FormItem>
						<FormLabel>{t('UpdateProfileForm.email')}</FormLabel>
						<FormControl>
							<Input value={userInfo?.email ?? ''} disabled />
						</FormControl>
					</FormItem>

					<FormItem>
						<FormLabel>{t('UpdateProfileForm.handle')}</FormLabel>
						<FormControl>
							<Input value={userInfo?.handle ?? ''} disabled />
						</FormControl>
					</FormItem>
				</div>

				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('UpdateProfileForm.firstName')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t('UpdateProfileForm.firstName')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('UpdateProfileForm.lastName')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t('UpdateProfileForm.lastName')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="dateOfBirth"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('UpdateProfileForm.dateOfBirth')}</FormLabel>
							<FormControl>
								<Input {...field} type="date" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('UpdateProfileForm.bio')}</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder={t('UpdateProfileForm.bioPlaceholder')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="profileVisibility"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('ProfileVisibilitySelect.label')}</FormLabel>
							<ProfileVisibilitySelect
								value={field.value ?? 'private'}
								onChange={(value) => field.onChange(value as ProfileVisibility)}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" variant="default" disabled={loading || !isDirty}>
					{loading
						? t('UpdateProfileForm.submitting')
						: t('UpdateProfileForm.submit')}
				</Button>
			</form>
		</Form>
	);
};
