import { Button } from "@antoniobenincasa/ui";
import { useCreateMovieLogDialogStore } from "../store";
import { Plus } from "lucide-react";

export const CreateMovieLogButton = () => {
  const open = useCreateMovieLogDialogStore((state) => state.open);

  return (
    <>
      <Button
        variant="default"
        className="bg-primary text-white dark:bg-primary dark:text-gray-900 hover:bg-violet-700 dark:hover:bg-violet-500 hidden md:inline-flex"
        onClick={open}
      >
        Log a Movie
      </Button>

      <Plus
        className="
      w-6 h-6 text-primary dark:text-primary hover:text-primary dark:hover:text-primary transition-colors
      md:hidden
      cursor-pointer
    "
        onClick={open}
      />
    </>
  );
};
