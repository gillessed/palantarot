export interface NewPlayer {
  firstName: string;
  lastName: string;
}

export type Player = NewPlayer & {
  id: string;
};

export const Player = {
  getName: (playerId: string, player?: Player): string => {
    if (player) {
      return player.firstName + ' ' + player.lastName;
    } else {
      return 'Uknown Player: ' + playerId;
    }
  }
}