import { type Action, type PlayerEvent } from "../model/GameEvents";
import { DefaultGameSettings, type GameSettings } from "../model/GameSettings";
import {
  type BoardState,
  GameplayState,
  type NewGameBoardState,
  type PlayerId,
  type ReducerResult,
} from "../model/GameState";
import { buildGameStateReducer, type GameReducerMap } from "../model/reducers/GameStateReducers";

export function createInitialState(publicHands: boolean): NewGameBoardState {
  return {
    name: GameplayState.NewGame,
    players: [],
    ready: [],
    publicHands,
  };
}

export class Game {
  static readonly createNew = (settings: GameSettings = DefaultGameSettings): Game => {
    const game = new Game(
      `${Date.now()}`,
      new Date(),
      buildGameStateReducer(),
      createInitialState(settings.publicHands),
      [],
      settings,
      false
    );
    return game;
  };

  public readonly id: string;
  public readonly created: Date;
  private readonly reducers: GameReducerMap;
  private state: BoardState;
  private readonly log: PlayerEvent[];
  public readonly settings: GameSettings;
  public logged: boolean;

  protected constructor(
    id: string,
    created: Date,
    reducers: GameReducerMap,
    state: BoardState,
    log: PlayerEvent[],
    settings: GameSettings,
    logged: boolean
  ) {
    this.id = id;
    this.created = created;
    this.reducers = reducers;
    this.state = state;
    this.log = log;
    this.settings = settings;
    this.logged = logged;
  }

  public playerAction<T extends Action>(event: T): ReducerResult<any> {
    const reducer = this.reducers[this.state.name];
    if (reducer === undefined) {
      throw new Error(`Cannot find reducer for ${this.state.name}, known reducers are ${Object.keys(this.reducers)}`);
    }
    const reducerResult = reducer(this.state, event);
    this.state = reducerResult.state;
    this.log.push(...reducerResult.events);
    return reducerResult;
  }

  public appendEvent<T extends PlayerEvent>(event: T) {
    this.log.push(event);
  }

  public getEvents(
    playerId: PlayerId,
    startAt: number = 0,
    limit: number = 100
  ): { events: PlayerEvent[]; count: number } {
    const events = [];
    let i = startAt;
    for (; i < this.log.length && events.length < limit; i++) {
      const privacy = this.log[i].privateTo;
      const exclude = this.log[i].exclude ?? [];
      const isPrivate = privacy != null && privacy !== playerId;
      const isExcluded = exclude.indexOf(playerId) >= 0;
      if (playerId === "<debug-player>" || (!isPrivate && !isExcluded)) {
        events.push(this.log[i]);
      }
    }
    return { events, count: i };
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
    return this.created.valueOf();
  }
}

export const testingGetState = (game: Game) => game.getState();
