import { Store } from 'redux';
import { Action } from '../../../server/play/model/GameEvents';
import { RoomSockets } from '../../../server/play/room/RoomSocketMessages';
import { generateId } from '../../../server/utils/randomString';
import { ReduxState } from '../rootReducer';
import { PlayDispatcher } from './ClientGameDispatcher';
import { RoomActions } from './RoomActions';
import { roomSocketService } from './RoomSagas';

export class RoomDispatcher {
  constructor(
    private readonly store: Store<ReduxState>,
  ) { }

  // Rooms Actions

  public socketConnect() {
    this.store.dispatch(roomSocketService.actions.join(generateId()));
  }

  public joinRoom(roomId: string, playerId: string) {
    this.store.dispatch(roomSocketService.actions.send(RoomSockets.enterRoom(roomId, playerId)));
  }

  public gameAction(action: Action) {
    const roomId = this.store.getState().room?.id;
    const playerId = this.store.getState().room?.playerId;
    if (roomId && playerId) {
      this.store.dispatch(roomSocketService.actions.send(RoomSockets.gameAction(roomId, playerId, action)));
    } 
  }

  public addBot(botId: string) {
    const roomId = this.store.getState().room?.id;
    if (roomId) {
      this.store.dispatch(roomSocketService.actions.send(RoomSockets.addBot(roomId, botId)));
    }
  }

  public removeBot(botId: string) {
    const roomId = this.store.getState().room?.id;
    if (roomId) {
      this.store.dispatch(roomSocketService.actions.send(RoomSockets.removeBot(roomId, botId)));
    }
  }

  public setAutoplay(autoplay: boolean) {
    this.store.dispatch(RoomActions.setAutoplay(autoplay));
  }

  public closeShowWindow() {
    this.store.dispatch(RoomActions.closeShowWindow());
  }

  public exitGame() {
    this.store.dispatch(roomSocketService.actions.close());
  }

  public sendChat(text: string) {
    const roomId = this.store.getState().room?.id;
    const playerId = this.store.getState().room?.playerId;
    if (roomId && playerId) {
      //TODO someday move message id generation to the server
      this.store.dispatch(roomSocketService.actions.send(RoomSockets.chatMessage(roomId, generateId(), text, playerId)));
    }
  }

  public autoplay() {
    const roomId = this.store.getState().room?.id;
    if (roomId) {
      this.store.dispatch(roomSocketService.actions.send(RoomSockets.autoplay(roomId)));
    }
  }

  public goToNextGame() {
    this.store.dispatch(RoomActions.moveToNewGame());
  }

  // Game Actions

  public play(player: string) {
    return new PlayDispatcher(this, player);
  }
}
