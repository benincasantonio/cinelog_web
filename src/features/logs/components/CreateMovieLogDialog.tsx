import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@antoniobenincasa/ui";
import { useCreateMovieLogDialogStore } from "../store";

type CreateMovieLogDialogProps = {
  children?: React.ReactNode;
};

export const CreateMovieLogDialog = ({
  children,
}: CreateMovieLogDialogProps) => {
  const isOpen = useCreateMovieLogDialogStore((state) => state.isOpen);
  const setIsOpen = useCreateMovieLogDialogStore((state) => state.setIsOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton
        className="w-full max-w-[425px] sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Log a Movie</DialogTitle>
          <DialogDescription>
            Add the details of what you watched.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {children ?? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon.
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
