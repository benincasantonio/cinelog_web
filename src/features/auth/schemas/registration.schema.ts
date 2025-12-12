import { z } from "zod";

export const registrationSchema = z
  .object({
    firstName: z.string().min(1).nonempty(),
    lastName: z.string().min(1).nonempty(),
    email: z.email().nonempty(),
    password: z.string().min(8).nonempty(),
    handle: z.string().min(1).nonempty(),
    dateOfBirth: z.date().refine((date) => date < new Date(), {
      message: "Date of birth must be in the past",
    }),
  })
  .strict();

export type RegistrationSchema = z.infer<typeof registrationSchema>;
