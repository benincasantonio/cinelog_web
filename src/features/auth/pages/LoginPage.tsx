import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@antoniobenincasa/ui";
import { LoginForm } from "../components";

const LoginPage = () => {
  return (
    <div>
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
