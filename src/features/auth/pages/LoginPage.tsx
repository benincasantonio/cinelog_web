import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@antoniobenincasa/ui";
import { AuthTabs, LoginForm } from "../components";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <AuthTabs
      children={
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>{t("LoginPage.title")}</CardTitle>
            <CardDescription>{t("LoginPage.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      }
    />
  );
};

export default LoginPage;
