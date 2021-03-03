import { Action, GameSettingsAction, PlayerEvent, PlayerId, Transition } from "./common";
import { biddingBoardReducer, completedBoardReducer, dogRevealAndExchangeBoardReducer, newGameBoardReducer, partnerCallBoardReducer, playingBoardReducer } from "./reducers";
import { BoardReducer, BoardState, GameplayState, NewGameBoardState } from './state';

type ReducerMap = { [state: string]: BoardReducer<any, any, any> }

function createInitialState(): NewGameBoardState {
  return {
    name: GameplayState.NewGame,
    players: [],
    ready: [],
  };
}

function buildReducer() {
  return {
    'new_game': newGameBoardReducer,
    'bidding': biddingBoardReducer,
    'partner_call': partnerCallBoardReducer,
    'dog_reveal': dogRevealAndExchangeBoardReducer,
    'playing': playingBoardReducer,
    'completed': completedBoardReducer,
  };
}

export interface GameSettings {
  autologEnabled: boolean;
  bakerBengtsonVariant: boolean;
}
export const DefaultGameSettings: GameSettings = {
  autologEnabled: true,
  bakerBengtsonVariant: false,
}

export class Game {
  static readonly createNew = (settings: GameSettings = DefaultGameSettings): Game => {
    const game = new Game(
      `${Date.now()}`,
      new Date(),
      buildReducer(),
      createInitialState(),
      [],
      settings,
    );
    const action: GameSettingsAction = {
      type: 'game_settings',
      settings,
      player: 'god',
      time: Date.now(),
    };
    game.playerAction(action);
    return game;
  };

  protected constructor(
    public readonly id: string,
    public readonly created: Date,
    private readonly reducers: ReducerMap,
    private state: BoardState,
    private readonly log: PlayerEvent[],
    public readonly settings: GameSettings,
  ) {}

  public playerAction<T extends Action>(event: T): PlayerEvent[] {
    const reducer = this.reducers[this.state.name];
    if (reducer === undefined) {
      throw new Error(`Cannot find reducer for ${this.state.name}, known reducers are ${Object.keys(this.reducers)}`)
    }
    const [newState, ...newEvents] = reducer(this.state, event);
    this.state = newState;
    this.log.push(...newEvents);
    return newEvents;
  }

  public appendTransition<T extends Transition>(event: T) {
    this.log.push(event);
  }

  public getEvents(player: PlayerId, startAt: number = 0, limit: number = 100): [PlayerEvent[], number] {
    const events = [];
    let i = startAt;
    for (; i < this.log.length && events.length < limit; i++) {
      const privacy = this.log[i].privateTo;
      const exclude = this.log[i].exclude ?? [];
      const isPrivate = privacy != null && privacy !== player;
      const isExcluded = exclude.indexOf(player) >= 0;
      if (player === '<debug-player>' || (!isPrivate && !isExcluded)) {
        events.push(this.log[i]);
      }
    }
    return [events, i];
  }

    /* module */ getState() {
    return this.state;
  }

  private static isAction(event: PlayerEvent): event is Action {
    return (event as Action).time !== undefined;
  }

    /* module */ getLastAction(): number {
    for (let i = this.log.length - 1; i >= 0; i--) {
      const event = this.log[i];
      if (Game.isAction(event)) {
        return event.time;
      }
    }
    return this.created.valueOf()
  }
}

export const testingGetState = (game: Game) => game.getState();
