export const WATCHED_WHERE_VALUES = [
  "cinema",
  "streaming",
  "homeVideo",
  "tv",
  "other",
] as const;

export type WatchedWhere = (typeof WATCHED_WHERE_VALUES)[number];

export const WATCHED_WHERE_LABELS: Record<WatchedWhere, string> = {
  cinema: "Cinema",
  streaming: "Streaming",
  homeVideo: "Home Video",
  tv: "TV",
  other: "Other",
};
