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
} from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ProfileVisibilitySelect } from '@/features/profile/components/ProfileVisibilitySelect';
import type { ProfileVisibility } from '@/lib/models';
import { PROFILE_VISIBILITY_VALUES } from '@/lib/models';
import { useAuthStore } from '../stores';

type RegistrationSchema = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	handle: string;
	dateOfBirth: Date;
	bio?: string;
	profileVisibility: ProfileVisibility;
};

export const RegistrationForm = () => {
	const { t } = useTranslation();
	const { register } = useAuthStore();
	const navigate = useNavigate();

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const localizedSchema = z
		.object({
			firstName: z.string().min(1).nonempty(),
			lastName: z.string().min(1).nonempty(),
			email: z.email().nonempty(),
			password: z.string().min(8).nonempty(),
			handle: z.string().min(1).nonempty(),
			dateOfBirth: z.date().refine((date) => date < new Date(), {
				message: t('RegistrationForm.validation.dobPast'),
			}),
			bio: z.string().optional(),
			profileVisibility: z.enum(PROFILE_VISIBILITY_VALUES),
		})
		.strict();

	const form = useForm<RegistrationSchema>({
		resolver: zodResolver(localizedSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			handle: '',
			dateOfBirth: undefined,
			bio: '',
			profileVisibility: 'private',
		},
	});

	const handleSubmit = async (data: RegistrationSchema) => {
		setLoading(true);
		setError(null);

		try {
			await register({
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				password: data.password,
				handle: data.handle,
				dateOfBirth: data.dateOfBirth?.toISOString() ?? '',
				bio: data.bio,
				profileVisibility: data.profileVisibility,
			});

			navigate('/login');
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(t('RegistrationForm.error'));
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col gap-2"
			>
				{error && <div className="text-red-500 text-sm">{error}</div>}
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('RegistrationForm.firstName')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t('RegistrationForm.firstName')}
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
							<FormLabel>{t('RegistrationForm.lastName')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t('RegistrationForm.lastName')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('RegistrationForm.email')}</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t('RegistrationForm.email')} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('RegistrationForm.password')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t('RegistrationForm.password')}
									type="password"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="handle"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('RegistrationForm.handle')}</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t('RegistrationForm.handle')} />
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
							<FormLabel>{t('RegistrationForm.dateOfBirth')}</FormLabel>
							<FormControl>
								<Input
									placeholder={t('RegistrationForm.dateOfBirth')}
									type="date"
									value={
										field.value ? field.value.toISOString().split('T')[0] : ''
									}
									onChange={(e) => {
										const value = e.target.value;
										field.onChange(value ? new Date(value) : undefined);
									}}
								/>
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
							<FormLabel>{t('RegistrationForm.bio')}</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder={t('RegistrationForm.bioPlaceholder')}
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
								value={field.value}
								onChange={(value) => field.onChange(value as ProfileVisibility)}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" variant="default" disabled={loading}>
					{loading
						? t('RegistrationForm.submitting')
						: t('RegistrationForm.submit')}
				</Button>
			</form>
		</Form>
	);
};
