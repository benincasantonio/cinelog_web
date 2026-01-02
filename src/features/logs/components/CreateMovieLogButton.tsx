import { Button } from "@antoniobenincasa/ui";
import { useCreateMovieLogDialogStore } from "../store";
import { Plus } from "lucide-react";

export const CreateMovieLogButton = () => {
  const open = useCreateMovieLogDialogStore((state) => state.open);

  return (
    <>
      <Button
        variant="default"
        className="bg-violet-600 text-white dark:bg-violet-600 dark:text-gray-900 hover:bg-violet-700 dark:hover:bg-violet-500 hidden md:inline-flex"
        onClick={open}
      >
        Log a Movie
      </Button>

      <Plus
        className="
      w-6 h-6 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors
      md:hidden
      cursor-pointer
    "
        onClick={open}
      />
    </>
  );
};
