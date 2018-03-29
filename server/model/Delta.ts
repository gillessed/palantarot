export interface Deltas {
    maximums: Delta[];
    minimums: Delta[];
}

export interface Delta {
    playerId: string;
    date: string;
    delta: number;
    gameCount: number;
  }