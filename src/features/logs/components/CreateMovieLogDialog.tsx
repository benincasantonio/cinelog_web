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
import { LogMovieForm } from "./LogMovieForm";

export const CreateMovieLogDialog = () => {
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

        <LogMovieForm />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
