import { z } from "zod";

export const logFormSchema = z
  .object({
    tmdbId: z.number().int().positive(),
    dateWatched: z.string(),
    viewingNotes: z.string().nullable().optional(),
    watchedWhere: z.string().nullable().optional(),
  })
  .strict();

export type LogFormSchema = z.infer<typeof logFormSchema>;
