import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@antoniobenincasa/ui";
import { AuthTabs, LoginForm } from "../components";

const LoginPage = () => {
  return (
    <AuthTabs
      children={
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your account</CardDescription>
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
