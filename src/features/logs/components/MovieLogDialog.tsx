import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { useMovieLogDialogStore } from '../store';
import { LogMovieForm } from './LogMovieForm';

export const CreateMovieLogDialog = () => {
	const { t } = useTranslation();
	const isOpen = useMovieLogDialogStore((state) => state.isOpen);
	const setIsOpen = useMovieLogDialogStore((state) => state.setIsOpen);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent
				showCloseButton
				className="w-full max-w-106.25 sm:max-w-lg"
			>
				<DialogHeader>
					<DialogTitle>{t('CreateMovieLogDialog.title')}</DialogTitle>
					<DialogDescription>
						{t('CreateMovieLogDialog.description')}
					</DialogDescription>
				</DialogHeader>

				<LogMovieForm
					formId="log-movie-form"
					showSubmitButton={false}
					onMovieLogCreated={close}
					onMovieLogUpdated={close}
				/>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">
							{t('CreateMovieLogDialog.close')}
						</Button>
					</DialogClose>
					<Button form="log-movie-form" type="submit">
						{t('CreateMovieLogDialog.submit')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
