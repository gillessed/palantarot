import { Store } from 'redux';
import { LobbyMessages } from '../../../server/play/lobby/LobbyMessages';
import { NewRoomArgs } from '../../../server/play/room/NewRoomArgs';
import { generateId } from '../../../server/utils/randomString';
import { PropertyCachingState } from '../redux/serviceDispatcher';
import { ReduxState } from '../rootReducer';
import { LobbyActions } from './LobbyActions';
import { lobbySocketService } from './LobbySaga';
import { lobbyService } from './LobbyService';
import { Lobby } from './LobbyTypes';

export class LobbyDispatcher extends lobbyService.dispatcher {
  constructor(
    reduxStore: Store<ReduxState>,
    options?: {
      caching?: PropertyCachingState<void, Lobby>,
      debounce?: number,
    }
  ) {
    super(reduxStore, options);
  }

  public newRoom(args: NewRoomArgs) {
    this.store.dispatch(LobbyActions.newRoom(args));
  }

  public enterLobby(playerId: string) {
    this.store.dispatch(lobbySocketService.actions.send(LobbyMessages.enterLobby(playerId)));
  }

  public socketConnect() {
    this.store.dispatch(lobbySocketService.actions.join(generateId()));
  }

  public socketClose() {
    this.store.dispatch(lobbySocketService.actions.close());
  }
}
