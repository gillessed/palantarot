export interface Deltas {
    maximums: Delta[];
    minimums: Delta[];
    playerId?: string;
}

export interface Delta {
    playerId: string;
    date: string;
    delta: number;
  }