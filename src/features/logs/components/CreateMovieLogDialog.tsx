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
import { useCreateMovieLogDialogStore } from '../store';
import { LogMovieForm } from './LogMovieForm';

export const CreateMovieLogDialog = () => {
	const { t } = useTranslation();
	const isOpen = useCreateMovieLogDialogStore((state) => state.isOpen);
	const setIsOpen = useCreateMovieLogDialogStore((state) => state.setIsOpen);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent
				showCloseButton
				className="w-full max-w-[425px] sm:max-w-lg"
			>
				<DialogHeader>
					<DialogTitle>{t('CreateMovieLogDialog.title')}</DialogTitle>
					<DialogDescription>
						{t('CreateMovieLogDialog.description')}
					</DialogDescription>
				</DialogHeader>

				<LogMovieForm />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">
							{t('CreateMovieLogDialog.close')}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
