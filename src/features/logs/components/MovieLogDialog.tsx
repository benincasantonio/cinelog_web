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
import { useMovieLogStore } from '../store/movieLogStore';
import { MovieLogForm } from './MovieLogForm';

export const CreateMovieLogDialog = () => {
	const { t } = useTranslation();
	const isOpen = useMovieLogDialogStore((state) => state.isOpen);
	const close = useMovieLogDialogStore((state) => state.close);
	const triggerUpdate = useMovieLogDialogStore((state) => state.triggerUpdate);

	const movieToEdit = useMovieLogDialogStore((state) => state.movieToEdit);
	const isFormLoading = useMovieLogStore((state) => state.isLoading);

	const editMode = !!movieToEdit;

	const submitText = editMode
		? t('CreateMovieLogDialog.submitUpdate')
		: t('CreateMovieLogDialog.submitCreate');

	const submittingText = editMode
		? t('CreateMovieLogDialog.submittingUpdate')
		: t('CreateMovieLogDialog.submittingCreate');

	const onOpenChange = (open: boolean) => {
		if (!open) {
			close();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton
				className="w-full max-w-106.25 sm:max-w-lg"
			>
				<DialogHeader>
					<DialogTitle>
						{editMode
							? t('CreateMovieLogDialog.titleUpdate')
							: t('CreateMovieLogDialog.titleCreate')}
					</DialogTitle>
					<DialogDescription>
						{t('CreateMovieLogDialog.description')}
					</DialogDescription>
				</DialogHeader>

				<MovieLogForm
					formId="log-movie-form"
					showSubmitButton={false}
					onSuccess={() => {
						close();
						triggerUpdate();
					}}
				/>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">
							{t('CreateMovieLogDialog.close')}
						</Button>
					</DialogClose>
					<Button form="log-movie-form" type="submit" disabled={isFormLoading}>
						{isFormLoading ? submittingText : submitText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
