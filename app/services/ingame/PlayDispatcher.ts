import { BidAction, BidValue, Call, CallPartnerAction, Card, EnterGameAction, LeaveGameAction, MessageAction, PlayCardAction, PlayerId, PlayerNotReadyAction, PlayerReadyAction, SetDogAction, ShowTrumpAction, TrumpCard } from '../../play/common';
import { InGameDispatcher } from './InGameDispatcher';

export class PlayDispatcher {
  constructor(
    private readonly inGameDispatcher: InGameDispatcher,
    private readonly player: PlayerId,
    private readonly debug?: boolean,
  ) { }

  public sendMessage(text: string, time?: number, exclude?: PlayerId[]) {
    const action: MessageAction = {
      type: 'message',
      text,
      player: this.player,
      time: time ?? Date.now(),
      exclude,
    };
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public enterGame(time?: number) {
    const action: EnterGameAction = {
      type: 'enter_game',
      player: this.player,
      time: time ?? Date.now(),
    };
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public leaveGame(time?: number) {
    const action: LeaveGameAction = {
      type: 'leave_game',
      player: this.player,
      time: time ?? Date.now(),
    };
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public markAsReady(time?: number) {
    const action: PlayerReadyAction = {
      type: 'mark_player_ready',
      player: this.player,
      time: time ?? Date.now(),
    };
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public markAsNotReady(time?: number) {
    const action: PlayerNotReadyAction = {
      type: 'unmark_player_ready',
      player: this.player,
      time: time ?? Date.now(),
    };
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public bid(bid: BidValue, russian?: boolean, time?: number) {
    const action: BidAction = {
      type: 'bid',
      bid,
      calls: russian ? [Call.RUSSIAN] : undefined,
      player: this.player,
      time: time ?? Date.now(),
    };
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public pass(time?: number) {
    this.bid(0, undefined, time);
  }

  public callPartner(card: Card, time?: number) {
    const action: CallPartnerAction = {
      type: 'call_partner',
      card,
      player: this.player,
      time: time ?? Date.now(),
    }
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public dropDog(cards: Set<Card>, time?: number) {
    const action: SetDogAction = {
      type: 'set_dog',
      dog: [...cards],
      player: this.player,
      privateTo: this.player,
      time: time ?? Date.now(),
    }
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public playCard(card: Card, time?: number) {
    const action: PlayCardAction = {
      type: 'play_card',
      card,
      player: this.player,
      time: time ?? Date.now(),
    }
    this.inGameDispatcher.playAction(action, this.debug);
  }

  public showTrump(cards: TrumpCard[], time?: number) {
    if (this.debug) {
      console.warn("Showing trump doesn't work with debug commands.");
      return;
    }
    const action: ShowTrumpAction = {
      type: 'show_trump',
      cards,
      player: this.player,
      time: time?? Date.now(),
    }
    this.inGameDispatcher.playAction(action, this.debug);
  }
}
