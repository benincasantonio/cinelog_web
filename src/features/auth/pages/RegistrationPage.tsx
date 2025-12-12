import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@antoniobenincasa/ui";
import { RegistrationForm } from "../components";

const RegistrationPage = () => {
  return (
    <>
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Registration</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
      </Card>
    </>
  );
};

export default RegistrationPage;
