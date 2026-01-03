import { apiClient } from "@/lib/api/client";
import { auth } from "@/lib/firebase";
import type { MovieRatingCreateUpdateRequest } from "../models/movie-rating-request";
import type { MovieRatingResponse } from "../models/movie-rating-response";

export const createOrUpdateRating = async (
  request: MovieRatingCreateUpdateRequest
): Promise<MovieRatingResponse> => {
  const token = await auth.currentUser?.getIdToken();

  return apiClient
    .post("v1/movie-ratings/", {
      json: request,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .json();
};

export const getMovieRating = async (
  tmdbId: number,
  userId?: string
): Promise<MovieRatingResponse> => {
  const token = await auth.currentUser?.getIdToken();

  return apiClient
    .get(`v1/movie-ratings/${tmdbId}`, {
      searchParams: userId ? { user_id: userId } : undefined,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .json();
};
