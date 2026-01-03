import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@antoniobenincasa/ui";
import { AuthTabs, RegistrationForm } from "../components";
import { useTranslation } from "react-i18next";

const RegistrationPage = () => {
  const { t } = useTranslation();

  return (
    <AuthTabs
      children={
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>{t("RegistrationPage.title")}</CardTitle>
            <CardDescription>{t("RegistrationPage.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationForm />
          </CardContent>
        </Card>
      }
    />
  );
};

export default RegistrationPage;
