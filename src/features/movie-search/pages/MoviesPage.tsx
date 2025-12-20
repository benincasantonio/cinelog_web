import { Input } from "@antoniobenincasa/ui";
import { MovieSearchList } from "../components";

const MoviesPage = () => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Movie Search</h1>
      <Input placeholder="Search for movies..." className="mb-4" />

      <MovieSearchList />
    </div>
  );
};

export default MoviesPage;
