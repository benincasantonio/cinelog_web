import { Tabs, TabsContent, TabsList, TabsTrigger } from "@antoniobenincasa/ui";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthTabs = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = (location.pathname.split("/").pop() || "login") as
    | "login"
    | "registration";

  function handleValueChange(value: string) {
    navigate(`/${value}`);
  }

  return (
    <Tabs className="gap-6" value={activeTab} onValueChange={handleValueChange}>
      <TabsList>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="registration">Registration</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab}>{children}</TabsContent>
    </Tabs>
  );
};
