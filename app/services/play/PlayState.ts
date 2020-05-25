import { Card, PlayerId, Trick } from '../../play/common';
import { BoardStateName } from '../../play/state';

export interface PlayState {
  selfId: PlayerId;
  stateName: BoardStateName;
  players: PlayerId[];
  currentBidder?: PlayerId;
  bids: { [playerId: string]: Array<number | "pass"> };
  ready: { [playerId: string]: boolean };
  hand?: Card[];
  dog?: Card[];
  trick?: Trick;
}
