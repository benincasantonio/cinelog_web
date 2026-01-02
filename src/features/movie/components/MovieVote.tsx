import React from "react";
import { Star } from "lucide-react";

interface MovieVoteProps {
  vote: number;
  source: "user" | "tmdb";
  className?: string;
}

export const MovieVote: React.FC<MovieVoteProps> = ({
  vote,
  source,
  className = "",
}) => {
  if (vote <= 0) return null;

  const colorClass = source === "user" ? "text-primary" : "text-amber-500";

  return (
    <div
      className={`flex items-center gap-1 font-semibold ${colorClass} ${className}`}
    >
      <Star className="w-4 h-4 fill-current" />
      <span>{vote.toFixed(1)}</span>
    </div>
  );
};
