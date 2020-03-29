import { Router, Request, Response } from 'express';
import {Game} from "../../app/play/server";
import {Action, Player} from "../../app/play/common";

export class PlayService {
    public router: Router;
    private games: Map<string, Game>;

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
        const reply = this.games.get(id)?.playerAction(action)
        res.send(reply)
    };

}