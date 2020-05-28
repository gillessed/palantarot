import { Request, Response, Router } from 'express';
import WebSocket from "ws";
import { getCardsAllowedToPlay, getPlayerNum } from '../../app/play/cardUtils';
import { Action, EnteredChatTransition, GameDescription, LeftChatTransition, PlayCardAction, PlayerEvent, PlayerId } from '../../app/play/common';
import { Game } from "../../app/play/server";
import { GameplayState, PlayingBoardState } from '../../app/play/state';
import { AutoplayActionType } from '../../app/services/ingame/InGameSagas';
import { DebugPlayAction, DebugPlayMessage, PlayAction, PlayError, PlayUpdates } from './PlayMessages';

export class PlayService {
  public router: Router;

  constructor(
    /** game_id -> Game */
    private readonly games = new Map<string, Game>(),
    /** game_id -> set of players in game */
    private readonly players = new Map<string, Set<PlayerId>>(),
    /** "game_id-player" -> socket */
    private readonly sockets = new Map<string, WebSocket>()
  ) {
    this.router = Router();
    this.router.post('/new_game', this.newGame);
    this.router.get('/games', this.listGames);
    this.router.get('/debug/:id', this.debugView);
  }

  public newGame = async (req: Request, res: Response) => {
    const game = Game.create_new();
    this.games.set(game.id, game);
    this.players.set(game.id, new Set<PlayerId>());
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

  public debugView = async (req: Request, res: Response) => {
    const id = req.params['id'];
    const game = this.games.get(id);
    if (game == undefined) {
      res.send(404, "unable to locate game " + id);
    } else {
      const reply = {
        state: game.getState(),
        events: game.getEvents('<debugplayer>', 0, 100000),
      };
      res.send(reply);
    }
  };

  private static getSocketKey(gameId: string, player: PlayerId) {
    return gameId + '-' + player;
  }

  private async broadcastEvents(gameId: string, events: PlayerEvent[]) {
    for (const player of this.players.get(gameId) || []) {
      const socketKey = PlayService.getSocketKey(gameId, player);
      this.sockets.get(socketKey)?.send(JSON.stringify({
        type: 'play_updates',
        events: events.filter((event) =>
          event.private_to === undefined || event.private_to === player)
      } as PlayUpdates));
    }
  }

  public addSocket(gameId: string, player: PlayerId, socket: WebSocket) {
    try {
      // 1. check conditions
      if (!this.games.has(gameId)) {
        socket.send(JSON.stringify({
          type: 'play_error',
          error: `Cannot subscribe to ${gameId} as it does not exist.`
        } as PlayError));
        return
      } else if (this.sockets.has(PlayService.getSocketKey(gameId, player))) {
        socket.send(JSON.stringify({
          type: 'play_error',
          error: `Cannot subscribe to ${gameId} as player ${player} is already in the game.`
        } as PlayError));
        return
      }

      // 2. register handlers
      this.sockets.set(PlayService.getSocketKey(gameId, player), socket);
      this.players.get(gameId)?.add(player);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data.type === 'play_action') {
            const message: PlayAction = data;
            this.playSocket(gameId, message.action);
          } else if (data.type === 'debug_play_action') {
            const message: DebugPlayAction = data;
            this.playSocket(gameId, message.action, true);
          } else if (data.type === AutoplayActionType) {
            this.debugAutoplay(gameId);
          } else if (data.type === 'debug_play') {
            const message: DebugPlayMessage = data;
            const enteredChat: EnteredChatTransition = {
              type: 'entered_chat',
              player: message.player,
            };
            this.games.get(gameId)?.appendTransition(enteredChat);
            this.broadcastEvents(gameId, [enteredChat])
              .catch(e => {
                throw new Error(e)
              });
          }
        } catch (e) {
          console.error("Error while trying to process player action", gameId, player, event.data, e);
          this.removeSocket(gameId, player);
        }
      };
      socket.on('close', () => this.removeSocket(gameId, player));

      // 3. update them on game state
      socket.send(JSON.stringify({
        type: 'play_updates',
        events: this.games.get(gameId)?.getEvents(player, 0, 100000)[0] || []
      } as PlayUpdates));

      // 4. notify others that player entered the game
      const enteredChat = {
        type: 'entered_chat',
        player: player,
      } as EnteredChatTransition;
      this.games.get(gameId)?.appendTransition(enteredChat);
      this.broadcastEvents(gameId, [enteredChat])
        .catch(e => {
          throw new Error(e)
        });
    } catch (e) {
      console.error("Error while adding socket:", gameId, player, e)
    }
  }

  private removeSocket(gameId: string, player: PlayerId) {
    try {
      const socketKey = PlayService.getSocketKey(gameId, player);
      const socket = this.sockets.get(socketKey);
      if (socket) {
        this.players.get(gameId)?.delete(player);
        this.sockets.delete(socketKey);
        const leftChat = {
          type: 'left_chat',
          player: player,
        } as LeftChatTransition;
        this.games.get(gameId)?.appendTransition(leftChat);
        this.broadcastEvents(gameId, [leftChat])
          .catch(e => {
            throw new Error(e)
          });
      }
    } catch (e) {
      console.error("Error while trying to remove socket", gameId, player, e)
    }
  }

  private playSocket(gameId: string, action: Action, debugPlayer?: boolean) {
    const socket = this.sockets.get(PlayService.getSocketKey(gameId, action.player));
    if (!socket && !debugPlayer) {
      throw Error(`Could not find socket for ${gameId}, ${action.player}`);
    }
    try {
      const messages = this.games.get(gameId)?.playerAction(action);
      if (messages) {
        this.broadcastEvents(gameId, messages)
          .catch(e => { throw new Error(e) });
      }
    } catch (e) {
      socket?.send(JSON.stringify({
        type: 'play_error',
        error: e.message
      }));
    }
  }

  private debugAutoplay(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) {
      return;
    }
    const anyState = game.getState();
    if (anyState.name !== GameplayState.Playing) {
      return;
    }
    const state = anyState as PlayingBoardState;
    const toPlay = state.current_trick.players[state.current_trick.current_player];
    const playerNum = getPlayerNum(state.players, toPlay);
    const toPlayHand = state.hands[playerNum];
    const allowableCards = getCardsAllowedToPlay(toPlayHand, state.current_trick.cards);
    const randomCard = allowableCards[Math.floor(Math.random() * allowableCards.length)];
    const action: PlayCardAction = {
      type: 'play_card',
      player: toPlay,
      card: randomCard,
      time: Date.now(),
    };
    this.playSocket(gameId, action, true);
  }
}
