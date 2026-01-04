import { Card, CardContent, CardHeader, CardTitle } from "@antoniobenincasa/ui";

interface StatsCardProps {
  title: string;
  value: string | number;
}

export const StatsCard = ({ title, value }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </CardContent>
    </Card>
  );
};
