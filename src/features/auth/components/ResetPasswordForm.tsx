import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from '@antoniobenincasa/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../repositories/auth-repository';
import { type ResetPasswordSchema, resetPasswordSchema } from '../schemas';

interface ResetPasswordFormProps {
	email: string;
	initialCode?: string;
	onBack: () => void;
}

export const ResetPasswordForm = ({
	email,
	initialCode,
	onBack,
}: ResetPasswordFormProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const localizedSchema = resetPasswordSchema(
		t('ResetPasswordForm.validation.passwordsMismatch')
	);

	const form = useForm<ResetPasswordSchema>({
		resolver: zodResolver(localizedSchema),
		defaultValues: {
			code: initialCode ?? '',
			newPassword: '',
			confirmPassword: '',
		},
		mode: 'onBlur',
	});

	const handleSubmit = async (data: ResetPasswordSchema) => {
		setLoading(true);
		setError(null);

		try {
			await resetPassword({
				email,
				code: data.code,
				new_password: data.newPassword,
			});
			navigate('/login');
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(t('ResetPasswordForm.errorReset'));
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

				<p className="text-sm text-muted-foreground">
					{t('ResetPasswordForm.emailSentTo', { email })}
				</p>

				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('ResetPasswordForm.code')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t('ResetPasswordForm.codePlaceholder')}
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
							<FormLabel>{t('ResetPasswordForm.newPassword')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									placeholder={t('ResetPasswordForm.newPassword')}
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
							<FormLabel>{t('ResetPasswordForm.confirmPassword')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									placeholder={t('ResetPasswordForm.confirmPassword')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" variant="default" disabled={loading}>
					{loading
						? t('ResetPasswordForm.submittingReset')
						: t('ResetPasswordForm.submitReset')}
				</Button>

				<button
					type="button"
					onClick={onBack}
					className="text-sm text-center hover:underline"
				>
					{t('ResetPasswordForm.backToEmail')}
				</button>
			</form>
		</Form>
	);
};
