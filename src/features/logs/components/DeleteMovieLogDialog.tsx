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
import { useMovieLogStore } from '../stores/movieLogStore';

interface DeleteMovieLogDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
}

export const DeleteMovieLogDialog = ({
	isOpen,
	onClose,
	onConfirm,
}: DeleteMovieLogDialogProps) => {
	const { t } = useTranslation();
	const isDeleteMovieLogLoading = useMovieLogStore(
		(state) => state.isDeleteMovieLogLoading
	);

	const onOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton
				className="w-full max-w-106.25 sm:max-w-lg"
			>
				<DialogHeader>
					<DialogTitle>{t('DeleteMovieLogDialog.title')}</DialogTitle>
					<DialogDescription>
						{t('DeleteMovieLogDialog.description')}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">
							{t('DeleteMovieLogDialog.cancel')}
						</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleteMovieLogLoading}
					>
						{isDeleteMovieLogLoading
							? t('DeleteMovieLogDialog.confirm')
							: t('DeleteMovieLogDialog.confirm')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
