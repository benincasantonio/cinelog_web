export type ByMethod = {
  cinema: number;
  streaming: number;
  homeVideo: number;
  tv: number;
  other: number;
};

export type Distribution = {
  byMethod: ByMethod;
};

export type Pace = {
  onTrackFor: number;
  currentAverage: number;
  daysSinceLastLog: number;
};

export type Summary = {
  totalWatches: number;
  uniqueTitles: number;
  totalRewatches: number;
  totalMinutes: number;
  voteAverage: number;
};

export type StatsResponse = {
  summary: Summary;
  distribution: Distribution;
  pace: Pace;
};
