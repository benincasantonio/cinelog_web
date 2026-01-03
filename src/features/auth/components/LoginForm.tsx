import {
  FormField,
  Input,
  Form,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  Button,
} from "@antoniobenincasa/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "../schemas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores";
import { useTranslation } from "react-i18next";

export const LoginForm = () => {
  const { t } = useTranslation();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { login } = useAuthStore();

  const handleSubmit = async (data: LoginSchema) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("LoginForm.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("LoginForm.email")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder={t("LoginForm.email")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("LoginForm.password")}</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder={t("LoginForm.password")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="default" disabled={loading}>
          {loading ? t("LoginForm.submitting") : t("LoginForm.submit")}
        </Button>
      </form>
    </Form>
  );
};
