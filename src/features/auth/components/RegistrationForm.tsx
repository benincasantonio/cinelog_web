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
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfileVisibilitySelect } from '@/features/profile/components/ProfileVisibilitySelect';
import { extractApiError, resolveApiFieldError } from '@/lib/api/api-error';
import { getActiveLocale } from '@/lib/locales/i18n';
import type { ProfileVisibility } from '@/lib/models';
import {
	CODE_LENGTH,
	createRegistrationSchema,
	type RegistrationSchema,
} from '../schemas/registration.schema';
import { useAuthStore } from '../stores';

const RESEND_COOLDOWN_SECONDS = 60;

export const RegistrationForm = () => {
	const { t } = useTranslation();
	const { register, sendRegistrationCode } = useAuthStore();
	const navigate = useNavigate();
	const schema = useMemo(() => createRegistrationSchema(t), [t]);

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [sendError, setSendError] = useState<string | null>(null);
	const [codeSent, setCodeSent] = useState(false);
	const [sentEmail, setSentEmail] = useState<string | null>(null);
	const [cooldown, setCooldown] = useState(0);

	const form = useForm<RegistrationSchema>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			handle: '',
			dateOfBirth: undefined,
			bio: '',
			profileVisibility: 'private',
			verificationCode: '',
		},
	});

	const emailValue = form.watch('email');

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	useEffect(() => {
		if (sentEmail === null || emailValue.trim().toLowerCase() === sentEmail) {
			return;
		}

		setSentEmail(null);
		setCodeSent(false);
		setCooldown(0);
		setSendError(null);
		form.setValue('verificationCode', '');
		form.clearErrors('verificationCode');
	}, [emailValue, form, sentEmail]);

	const handleSendCode = async () => {
		const email = form.getValues('email');
		const emailValid = await form.trigger('email');
		if (sending || cooldown > 0 || !emailValid) return;

		setSending(true);
		setSendError(null);

		try {
			await sendRegistrationCode({ email });
			setSentEmail(email.trim().toLowerCase());
			setCodeSent(true);
			setCooldown(RESEND_COOLDOWN_SECONDS);
		} catch (err: unknown) {
			const apiError = await extractApiError(err);
			setSendError(
				apiError?.error_code_name === 'RATE_LIMIT_EXCEEDED'
					? t('ApiError.rateLimitExceeded')
					: t('RegistrationForm.sendCodeError')
			);
		} finally {
			setSending(false);
		}
	};

	const handleSubmit = async (data: RegistrationSchema) => {
		if (loading) return;

		setLoading(true);
		setError(null);

		try {
			await register({
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				password: data.password,
				handle: data.handle,
				dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
				bio: data.bio,
				locale: getActiveLocale(),
				profileVisibility: data.profileVisibility,
				verificationCode: data.verificationCode,
			});

			navigate('/login');
		} catch (err: unknown) {
			const apiError = await extractApiError(err);
			if (apiError?.error_code_name) {
				const fieldError = resolveApiFieldError(apiError.error_code_name, t);
				if (fieldError) {
					form.setError(fieldError.field as keyof RegistrationSchema, {
						message: fieldError.message,
					});
					return;
				}

				if (apiError.error_code_name === 'RATE_LIMIT_EXCEEDED') {
					setError(t('ApiError.rateLimitExceeded'));
					return;
				}
			}

			setError(t('RegistrationForm.error'));
		} finally {
			setLoading(false);
		}
	};

	const sendCodeLabel =
		cooldown > 0
			? t('RegistrationForm.resendIn', { seconds: cooldown })
			: codeSent
				? t('RegistrationForm.resendCode')
				: t('RegistrationForm.sendCode');

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col gap-3"
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
								<Input
									{...field}
									type="email"
									placeholder={t('RegistrationForm.email')}
								/>
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
									onChange={(event) => {
										const value = event.target.value;
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

				<FormField
					control={form.control}
					name="verificationCode"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('RegistrationForm.code')}</FormLabel>
							<div className="flex items-start gap-2">
								<FormControl>
									<Input
										{...field}
										onChange={(event) =>
											field.onChange(
												event.target.value
													.toUpperCase()
													.replace(/[^A-F0-9]/g, '')
											)
										}
										placeholder={t('RegistrationForm.codePlaceholder')}
										inputMode="text"
										autoCapitalize="characters"
										autoComplete="one-time-code"
										maxLength={CODE_LENGTH}
									/>
								</FormControl>
								<Button
									type="button"
									variant="outline"
									className="whitespace-nowrap"
									onClick={handleSendCode}
									disabled={sending || cooldown > 0}
								>
									{sendCodeLabel}
								</Button>
							</div>
							{codeSent && (
								<p className="text-muted-foreground text-sm">
									{t('RegistrationForm.codeSent', { email: sentEmail })}
								</p>
							)}
							{sendError && <p className="text-red-500 text-sm">{sendError}</p>}
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={loading}>
					{loading
						? t('RegistrationForm.submitting')
						: t('RegistrationForm.createAccount')}
				</Button>
			</form>
		</Form>
	);
};
