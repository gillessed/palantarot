import { Action, GameSettingsAction, PlayerEvent, PlayerId, Transition } from "../model/GameEvents";
import { DefaultGameSettings, GameSettings } from "../model/GameSettings";
import { BoardState, GameplayState, NewGameBoardState } from '../model/GameState';
import { buildGameStateReducer, GameReducerMap } from '../model/GameStateReducers';

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
      false,
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
    private readonly reducers: GameReducerMap,
    private state: BoardState,
    private readonly log: PlayerEvent[],
    public readonly settings: GameSettings,
    public logged: boolean,
  ) { }

  public playerAction<T extends Action>(event: T): PlayerEvent[] {
    const reducer = this.reducers[this.state.name];
    if (reducer === undefined) {
      throw new Error(`Cannot find reducer for ${this.state.name}, known reducers are ${Object.keys(this.reducers)}`)
    }
    const { state: newState, events: newEvents } = reducer(this.state, event);
    this.state = newState;
    this.log.push(...newEvents);
    return newEvents;
  }

  public appendTransition<T extends Transition>(event: T) {
    this.log.push(event);
  }

  public getEvents(playerId: PlayerId, startAt: number = 0, limit: number = 100): { events: PlayerEvent[], count: number } {
    const events = [];
    let i = startAt;
    for (; i < this.log.length && events.length < limit; i++) {
      const privacy = this.log[i].privateTo;
      const exclude = this.log[i].exclude ?? [];
      const isPrivate = privacy != null && privacy !== playerId;
      const isExcluded = exclude.indexOf(playerId) >= 0;
      if (playerId === '<debug-player>' || (!isPrivate && !isExcluded)) {
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
    return this.created.valueOf()
  }
}

export const testingGetState = (game: Game) => game.getState();
