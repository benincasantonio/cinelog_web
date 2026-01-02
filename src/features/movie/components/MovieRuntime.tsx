import React from "react";
import { Clock } from "lucide-react";

interface MovieRuntimeProps {
  runtime: number | null;
  className?: string;
}

export const MovieRuntime: React.FC<MovieRuntimeProps> = ({
  runtime,
  className = "",
}) => {
  if (!runtime || runtime <= 0) return null;

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Clock className="w-4 h-4" />
      <span>
        {hours}h {minutes}m
      </span>
    </div>
  );
};
