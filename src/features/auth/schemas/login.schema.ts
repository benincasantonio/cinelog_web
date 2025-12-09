import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.email().nonempty(),
    password: z.string().min(8).nonempty(),
  })
  .strict();

export type LoginSchema = z.infer<typeof loginSchema>;
