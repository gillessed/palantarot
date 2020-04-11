import {Request, Response, Router} from 'express';
import {Game} from "../../app/play/server";
import {Action, Player, PlayerEvent} from "../../app/play/common";
import WebSocket from "ws";

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
    }

    public newGame = async (req: Request, res: Response) => {
        const game = Game.create_new();
        this.games.set(game.id, game);
        res.send(game.id);
    };

    public listGames = async (req: Request, res: Response) => {
        res.send(this.games.keys());
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
            this.sockets.get(socketKey)?.emit(
                'play_action',
                events.filter((event) =>
                    event.private_to === undefined || event.private_to === player));
        }
    }

    public addSocket(game_id: string, player: Player, socket: WebSocket) {
        this.sockets.set(this.getSocketKey(game_id, player), socket);
        socket.on('action', (action: Action) => {
            try {
                const messages = this.games.get(game_id)?.playerAction(action);
                if (messages) {
                    this.broadcastEvents(game_id, messages);
                }
            } catch (e) {
                socket.emit("play_error", e)
            }
        });
        socket.on('leave', (game_id: string, player: Player) => {
            this.sockets.delete(this.getSocketKey(game_id, player));
        })
    }
}