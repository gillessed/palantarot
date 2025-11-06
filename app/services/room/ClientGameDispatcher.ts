import { Card, TrumpCard } from "../../../server/play/model/Card";
import {
  BidAction,
  CallPartnerAction,
  EnterGameAction,
  LeaveGameAction,
  PlayCardAction,
  PlayerNotReadyAction,
  PlayerReadyAction,
  SetDogAction,
  ShowTrumpAction,
} from "../../../server/play/model/GameEvents";
import { BidValue, Call, PlayerId } from "../../../server/play/model/GameState";
import { RoomDispatcher } from "./RoomDispatcher";

export class PlayDispatcher {
  private readonly roomDispatcher: RoomDispatcher;
  private readonly player: PlayerId;
  constructor(roomDispatcher: RoomDispatcher, player: PlayerId) {
    this.roomDispatcher = roomDispatcher;
    this.player = player;
  }

  public enterGame(time?: number) {
    const action: EnterGameAction = {
      type: "enter_game",
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public leaveGame(time?: number) {
    const action: LeaveGameAction = {
      type: "leave_game",
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public markAsReady(time?: number) {
    const action: PlayerReadyAction = {
      type: "mark_player_ready",
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public markAsNotReady(time?: number) {
    const action: PlayerNotReadyAction = {
      type: "unmark_player_ready",
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public bid(bid: BidValue, russian?: boolean, time?: number) {
    const action: BidAction = {
      type: "bid",
      bid,
      calls: russian ? ["russian"] : undefined,
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public pass(time?: number) {
    this.bid(0, undefined, time);
  }

  public callPartner(card: Card, time?: number) {
    const action: CallPartnerAction = {
      type: "call_partner",
      card,
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public dropDog(cards: Set<Card>, time?: number) {
    const action: SetDogAction = {
      type: "set_dog",
      dog: [...cards],
      player: this.player,
      privateTo: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public playCard(card: Card, time?: number) {
    const action: PlayCardAction = {
      type: "play_card",
      card,
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }

  public showTrump(cards: TrumpCard[], time?: number) {
    const action: ShowTrumpAction = {
      type: "show_trump",
      cards,
      player: this.player,
      time: time ?? Date.now(),
    };
    this.roomDispatcher.gameAction(action);
  }
}
