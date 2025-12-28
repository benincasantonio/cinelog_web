import { Button } from "@antoniobenincasa/ui";
import { useCreateMovieLogDialogStore } from "../store";

export const CreateMovieLogButton = () => {
  const open = useCreateMovieLogDialogStore((state) => state.open);

  return (
    <Button
      variant="default"
      className="bg-violet-600 text-white dark:bg-violet-600 dark:text-gray-900 hover:bg-violet-700 dark:hover:bg-violet-500"
      onClick={open}
    >
      Log a Movie
    </Button>
  );
};

