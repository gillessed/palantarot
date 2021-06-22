import { Store } from 'redux';
import { Action } from '../../../server/play/model/GameEvents';
import { ChatText } from '../../../server/play/room/ChatText';
import { RoomSocketMessages } from '../../../server/play/room/RoomSocketMessages';
import { generateId } from '../../../server/utils/randomString';
import { ReduxState } from '../rootReducer';
import { SocketActions } from '../socket/socketService';
import { PlayDispatcher } from './ClientGameDispatcher';
import { RoomActions } from './RoomActions';

export class RoomDispatcher {
  constructor(
    private readonly store: Store<ReduxState>,
  ) { }

  // Rooms Actions

  public socketConnect(roomId: string, playerId: string) {
    this.store.dispatch(SocketActions.connect({
      id: generateId(),
      initialMessages: [RoomSocketMessages.enterRoom({ roomId, playerId })],
    }));
  }

  public gameAction(action: Action) {
    const roomId = this.store.getState().room?.id;
    const playerId = this.store.getState().room?.playerId;
    if (roomId && playerId) {
      this.store.dispatch(SocketActions.send(RoomSocketMessages.gameAction({ roomId, playerId, action })));
    } 
  }

  public addBot(botId: string) {
    const roomId = this.store.getState().room?.id;
    if (roomId) {
      this.store.dispatch(SocketActions.send(RoomSocketMessages.addBot({ roomId, botId })));
    }
  }

  public removeBot(botId: string) {
    const roomId = this.store.getState().room?.id;
    if (roomId) {
      this.store.dispatch(SocketActions.send(RoomSocketMessages.removeBot({ roomId, botId })));
    }
  }

  public setAutopass(autopass: boolean) {
    this.store.dispatch(RoomActions.setAutopass(autopass));
  }

  public setAutoplay(autoplay: boolean) {
    this.store.dispatch(RoomActions.setAutoplay(autoplay));
  }

  public closeShowWindow() {
    this.store.dispatch(RoomActions.closeShowWindow());
  }

  public exitGame() {
    this.store.dispatch(SocketActions.close());
  }

  public sendChat(text: string) {
    const roomId = this.store.getState().room?.id;
    const playerId = this.store.getState().room?.playerId;
    if (roomId && playerId) {
      //TODO someday move message id generation to the server
      const chat: ChatText = {
        id: generateId(),
        text,
        authorId: playerId,
        time: Date.now(),
      }
      this.store.dispatch(SocketActions.send(RoomSocketMessages.roomChat({ roomId, chat })));
    }
  }

  public autoplay() {
    const roomId = this.store.getState().room?.id;
    if (roomId) {
      this.store.dispatch(SocketActions.send(RoomSocketMessages.autoplay({ roomId })));
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
