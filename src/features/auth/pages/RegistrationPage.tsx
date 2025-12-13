import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@antoniobenincasa/ui";
import { AuthTabs, RegistrationForm } from "../components";

const RegistrationPage = () => {
  return (
    <AuthTabs
      children={
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>Create a new account</CardDescription>
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
