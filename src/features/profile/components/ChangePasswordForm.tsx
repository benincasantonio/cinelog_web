import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	useNotification,
} from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { extractApiError, resolveApiFieldError } from '@/lib/api/api-error';
import { type ChangePasswordSchema, changePasswordSchema } from '../schemas';
import { useUserStore } from '../stores';

export const ChangePasswordForm = () => {
	const { t } = useTranslation();
	const { notify } = useNotification();
	const changePassword = useUserStore((state) => state.changePassword);

	const [loading, setLoading] = useState(false);

	const localizedSchema = changePasswordSchema(
		t('ChangePasswordForm.passwordsMismatch')
	);

	const form = useForm<ChangePasswordSchema>({
		resolver: zodResolver(localizedSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		mode: 'onBlur',
	});

	const { isDirty } = form.formState;

	const handleSubmit = async (data: ChangePasswordSchema) => {
		setLoading(true);

		try {
			await changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
			form.reset();
			notify({
				variant: 'success',
				message: t('ChangePasswordForm.success'),
			});
		} catch (err: unknown) {
			const apiError = await extractApiError(err);
			if (apiError?.error_code_name) {
				const fieldError = resolveApiFieldError(
					apiError.error_code_name,
					t,
					'ChangePasswordForm'
				);
				if (fieldError) {
					form.setError(fieldError.field as keyof ChangePasswordSchema, {
						message: fieldError.message,
					});
					return;
				}
			}
			notify({
				variant: 'danger',
				message: t('ChangePasswordForm.error'),
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
				<FormField
					control={form.control}
					name="currentPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('ChangePasswordForm.currentPassword')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									autoComplete="current-password"
									placeholder={t('ChangePasswordForm.currentPassword')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('ChangePasswordForm.newPassword')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									autoComplete="new-password"
									placeholder={t('ChangePasswordForm.newPassword')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('ChangePasswordForm.confirmPassword')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									autoComplete="new-password"
									placeholder={t('ChangePasswordForm.confirmPassword')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" variant="default" disabled={loading || !isDirty}>
					{loading
						? t('ChangePasswordForm.submitting')
						: t('ChangePasswordForm.submit')}
				</Button>
			</form>
		</Form>
	);
};
