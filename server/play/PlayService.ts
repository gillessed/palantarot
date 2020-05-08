import {Request, Response, Router} from 'express';
import {Game} from "../../app/play/server";
import {Action, GameDescription, Player, PlayerEvent} from "../../app/play/common";
import WebSocket from "ws";

export interface PlayMessage {
    type: 'play'
    game: string
    player: Player
}

export interface PlayError {
    type: 'play_error'
    error: string
}

export interface PlayUpdates {
    type: 'play_updates'
    events: PlayerEvent[]
}

export interface PlayAction {
    type: 'play_action'
    action: Action
}

export class PlayService {
    public router: Router;
    private games: Map<string, Game>;
    private sockets: Map<string, WebSocket>;

    constructor() {
        this.router = Router();
        this.games = new Map<string, Game>();
        this.router.post('/new_game', this.newGame);
        this.router.get('/games', this.listGames);
        this.router.get('/game/:id/:player', this.getEvents);
        this.router.post('/game/:id', this.playAction);
        this.sockets = new Map<string, WebSocket>();
    }

    public newGame = async (req: Request, res: Response) => {
        const game = Game.create_new();
        this.games.set(game.id, game);
        res.send(game.id);
    };

    public listGames = async (req: Request, res: Response) => {
        const games: { [id: string]: GameDescription } = {};
        for (const [k, v] of this.games) {
            games[k] = {
                state: v.getState().name,
                players: v.getState().players,
                last_updated: v.getLastAction(),
            };
        }
        res.send(games);
    };

    public getEvents = async (req: Request, res: Response) => {
        const id = req.params['id'];
        const player = req.params['player'] as Player;
        const start_at = req.query['start_at'];
        const limit = req.query['limit'];
        res.send(this.games.get(id)?.getEvents(player, start_at, limit));
    };

    public playAction = async (req: Request, res: Response) => {
        const id = req.params['id'];
        const action = req.body as Action;
        try {
            const reply = this.games.get(id)?.playerAction(action);
            if (reply) {
                this.broadcastEvents(id, reply);
            }
            res.send(reply);
        } catch (e) {
            res.send(400, { error: (e as Error).message });
        }
    };

    private getSocketKey(game_id: string, player: Player) {
        return game_id + '-' + player;
    }

    private async broadcastEvents(game_id: string, events: PlayerEvent[]) {
        const game = this.games.get(game_id) as Game; // no undefined

        for (const player of game.getState().players) {
            const socketKey = this.getSocketKey(game_id, player);
            this.sockets.get(socketKey)?.send(JSON.stringify({
                type: 'play_updates',
                events: events.filter((event) =>
                  event.private_to === undefined || event.private_to === player)
            } as PlayUpdates));
        }
    }

    public addSocket(game_id: string, player: Player, socket: WebSocket) {
        if (!this.games.has(game_id)) {
            socket.send(JSON.stringify({
                type: 'play_error',
                error: `Cannot subscribe to ${game_id} as it does not exist.`
            } as PlayError));
            return
        }
        this.sockets.set(this.getSocketKey(game_id, player), socket);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data as string);
            if (data.type === 'play_action') {
                const message: PlayAction = data;
                this.playSocket(game_id, message.action);
            }
        };
        socket.on('close', () => this.removeSocket(game_id, player));
        socket.send(JSON.stringify({
            type: 'play_updates',
            events: this.games.get(game_id)?.getEvents(player, 0, 10000) || []

        } as PlayUpdates));
    }

    private removeSocket(game_id: string, player: Player) {
        const socketKey = this.getSocketKey(game_id, player);
        const socket = this.sockets.get(socketKey);
        if (socket) {
            this.sockets.delete(socketKey);
        }
    }

    private playSocket(game_id: string, action: Action) {
        const socket = this.sockets.get(this.getSocketKey(game_id, action.player));
        if (!socket) {
            throw Error(`Could not find socket for ${game_id}, ${action.player}`);
        }
        try {
            const messages = this.games.get(game_id)?.playerAction(action);
            if (messages) {
                this.broadcastEvents(game_id, messages);
            }
        } catch (e) {
            socket.send(JSON.stringify({
                type: 'play_error',
                error: e.message
            }));
        }
    }
}