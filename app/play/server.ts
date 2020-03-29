import {BoardReducer, BoardState, NewGameBoardState} from "./state";
import {Action, Player, PlayerEvent} from "./common";
import {
    biddingBoardReducer, completedBoardReducer,
    dogRevealAndExchangeBoardReducer,
    newGameBoardReducer,
    partnerCallBoardReducer, playingBoardReducer
} from "./reducers";

type ReducerMap = { [state: string]: BoardReducer<any, any, any> }

export class Game {
    static readonly create_new = function(): Game {
        return new Game(
            Date.now() + "-" + Math.floor(Math.random() * (2 << 24)).toString(16),
            {
                'new_game': newGameBoardReducer,
                'bidding': biddingBoardReducer,
                'partner_call': partnerCallBoardReducer,
                'dog_reveal': dogRevealAndExchangeBoardReducer,
                'playing': playingBoardReducer,
                'completed': completedBoardReducer,
            },
            {
                name: 'new_game',
                players: [],
                ready: [],
            } as NewGameBoardState,
            []);
    };

    private readonly id: string;
    private readonly reducers: ReducerMap;
    private readonly log: PlayerEvent[];
    private state: BoardState;

    protected constructor(id: string, reducers: ReducerMap, state: BoardState, log: PlayerEvent[]) {
        this.id = id;
        this.reducers = reducers;
        this.state = state;
        this.log = log;
    }

    public playerAction<T extends Action>(event: T): PlayerEvent[] {
        const reducer = this.reducers[this.state.name];
        if (reducer === undefined) {
            throw new Error(`Cannot find reducer for ${this.state.name}, known reducers are ${Object.keys(this.reducers)}`)
        }
        const [new_state, ...new_events] = reducer(this.state, event);
        this.state = new_state;
        this.log.push(...new_events);
        return new_events;
    }

    public getEvents(player: Player, start_at: number = 0, limit: number = 100) {
        const events = [];
        for (let i = start_at; i < this.log.length && events.length < limit; i++) {
            const privacy = this.log[i].private_to;
            if (privacy === undefined || privacy === player) {
                events.push(this.log[i]);
            }
        }
        return events;
    }

    /* module */ getState() {
        return this.state;
    }
}

export const testingGetState = (game: Game) => game.getState();
