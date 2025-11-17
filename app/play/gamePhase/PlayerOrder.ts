import type { PlayerId } from "../../../server/play/model/GameState";

export class PlayerOrder {
  private getSelfPlayerId: () => string;
  private playerOrder: PlayerId[] = [];

  constructor(getSelfPlayerId: () => string) {
    this.getSelfPlayerId = getSelfPlayerId;
  }

  public addPlayer(playerId: string) {
    this.playerOrder.push(playerId);
  }

  public removePlayer(playerId: string) {
    const index = this.playerOrder.indexOf(playerId);
    if (index >= 0) {
      this.playerOrder.splice(index, 1);
    }
  }

  get length() {
    return this.playerOrder.length;
  }

  [Symbol.iterator]() {
    const selfPlayerId = this.getSelfPlayerId();
    const selfIndex = this.playerOrder.indexOf(selfPlayerId);
    const startIndex = selfIndex >= 0 ? selfIndex : 0;
    let index = startIndex;
    const playerOrderCopy = this.playerOrder;

    return {
      next: () => {
        const nextPlayer = playerOrderCopy[index % this.playerOrder.length];
        index++;
        return {
          value: nextPlayer,
          done:
            this.length === 0 ||
            index === startIndex + this.playerOrder.length + 1,
        };
      },
    };
  }
}
