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
            Date.now() + "",
            new Date(),
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

    protected constructor(
        public readonly id: string,
        private readonly created: Date,
        private readonly reducers: ReducerMap,
        private state: BoardState,
        private readonly log: PlayerEvent[]) {
    }

    public playerAction<T extends Action>(event: T): PlayerEvent[] {
        const reducer = this.reducers[this.state.name];
        if (reducer === undefined) {
            throw new Error(`Cannot find reducer for ${this.state.name}, known reducers are ${Object.keys(this.reducers)}`)
        }
        const [new_state, ...new_events] = reducer(this.state, event);
        this.state = new_state;
        console.debug(JSON.stringify(new_state, null, 2));
        this.log.push(...new_events);
        return new_events;
    }

    public getEvents(player: Player, start_at: number = 0, limit: number = 100): [PlayerEvent[], number] {
        const events = [];
        let i = start_at;
        for (; i < this.log.length && events.length < limit; i++) {
            const privacy = this.log[i].private_to;
            if (privacy === undefined || privacy === player) {
                events.push(this.log[i]);
            }
        }
        return [events, i];
    }

    /* module */ getState() {
        return this.state;
    }

    private isAction(event: PlayerEvent): event is Action {
        return (event as Action).time !== undefined;
    }

    /* module */ getLastAction(): number {
        for (let i = this.log.length - 1; i >= 0; i--) {
            const event = this.log[i];
            if (this.isAction(event)) {
                return event.time;
            }
        }
        return this.created.valueOf()
    }
}

export const testingGetState = (game: Game) => game.getState();
