export type ByMethod = {
  cinema: number;
  streaming: number;
  physical_media: number;
  tv: number;
  other: number;
};

export type Distribution = {
  by_method: ByMethod;
};

export type Pace = {
  on_track_for: number;
  current_average: number;
  days_since_last_log: number;
};

export type Summary = {
  total_watches: number;
  unique_titles: number;
  total_rewatches: number;
  total_minutes: number;
};

export type StatsResponse = {
  summary: Summary;
  distribution: Distribution;
  pace: Pace;
};
