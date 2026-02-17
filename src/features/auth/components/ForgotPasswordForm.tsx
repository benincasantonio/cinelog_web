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
import { Link } from 'react-router-dom';
import { forgotPassword } from '../repositories/auth-repository';
import { type ForgotPasswordSchema, forgotPasswordSchema } from '../schemas';

interface ForgotPasswordFormProps {
	onSuccess: (email: string) => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<ForgotPasswordSchema>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
		mode: 'onBlur',
	});

	const handleSubmit = async (data: ForgotPasswordSchema) => {
		setLoading(true);
		setError(null);

		try {
			await forgotPassword({ email: data.email });
			onSuccess(data.email);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(t('ForgotPasswordForm.errorEmail'));
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
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('ForgotPasswordForm.email')}</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="email"
									placeholder={t('ForgotPasswordForm.email')}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" variant="default" disabled={loading}>
					{loading
						? t('ForgotPasswordForm.submittingEmail')
						: t('ForgotPasswordForm.submitEmail')}
				</Button>

				<Link to="/login" className="text-sm text-center hover:underline">
					{t('ForgotPasswordForm.backToLogin')}
				</Link>
			</form>
		</Form>
	);
};
