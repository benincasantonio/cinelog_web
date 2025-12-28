import { Form } from "@antoniobenincasa/ui";
import { useForm } from "react-hook-form";
import { type LogFormSchema } from "../schemas";

export const LogMovieForm = () => {
  const form = useForm<LogFormSchema>({
    mode: "onBlur",
  });

  return (
    <Form {...form}>
      <form className="flex flex-col">Coming soon.</form>
    </Form>
  );
};
