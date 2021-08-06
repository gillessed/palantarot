import {Store} from 'redux';
import {LobbySocketMessages} from '../../../server/play/lobby/LobbySocketMessages';
import {NewRoomArgs} from '../../../server/play/room/NewRoomArgs';
import {generateId} from '../../../server/utils/randomString';
import {PropertyCachingState} from '../redux/serviceDispatcher';
import {ReduxState} from '../rootReducer';
import {SocketActions} from '../socket/socketService';
import {LobbyActions} from './LobbyActions';
import {lobbyService} from './LobbyService';
import {Lobby} from './LobbyTypes';

export class LobbyDispatcher extends lobbyService.dispatcher {
  constructor(
    reduxStore: Store<ReduxState>,
    options?: {
      caching?: PropertyCachingState<void, Lobby>;
      debounce?: number;
    }
  ) {
    super(reduxStore, options);
  }

  public newRoom(args: NewRoomArgs) {
    this.store.dispatch(LobbyActions.newRoom(args));
  }

  public socketConnect(playerId: string) {
    this.store.dispatch(
      SocketActions.connect({
        id: generateId(),
        initialMessages: [LobbySocketMessages.enterLobby({playerId})],
      })
    );
  }

  public socketClose() {
    this.store.dispatch(SocketActions.close());
  }
}
