import type { PlayerEvent } from "../../server/play/model/GameEvents";
import { RoomSocketMessages } from "../../server/play/room/RoomSocketMessages";
import type { SocketMessage } from "../../server/websocket/SocketMessage";
import { updateClientGameForEvents } from "../../shared/game/updateClientGameForEvents";
import {
  EmptyClientGame,
  type ClientGame,
} from "../../shared/types/ClientGameTypes";
import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../sceneGraph/nodes/SceneNode";
import type { ImageAssets } from "./assets/ImageAssets";
import type { BiddingGameNode } from "./gamePhase/bidding/BiddingGameNode";
import { NewGameNode } from "./gamePhase/newGame/NewGameNode";
import { TableNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";

export type GamePhaseNode = NewGameNode | BiddingGameNode;

export class TableNode extends TwoDNode<PlaySceneContext> {
  public imageAssets: ImageAssets;
  public gamePhaseNode: GamePhaseNode = new NewGameNode();
  private gameState: ClientGame = EmptyClientGame;
  private removeSceneListener?: () => void;

  constructor(imageAssets: ImageAssets) {
    super(TableNodeId);
    this.imageAssets = imageAssets;
    this.addChild(this.gamePhaseNode);
  }

  public onMount = (container: NodeManager<PlaySceneContext>) => {
    const { socket } = container.context;
    this.removeSceneListener = socket.addListener(this.handleServerMessage);
  };
  public onUnmount = () => {
    this.removeSceneListener?.();
    this.removeSceneListener = undefined;
  };

  public setGamePhaseNode = (gamePhaseNode: GamePhaseNode) => {
    this.removeChild(this.gamePhaseNode);
    this.gamePhaseNode = gamePhaseNode;
    this.addChild(this.gamePhaseNode);
  };

  public update = () => {
    const width = this.container?.width ?? 0;
    const height = this.container?.height ?? 0;
    this.offset = [width / 2, height / 2];
  };

  public setToPlayState = (state: ClientGame) => {
    this.gameState = state;
    switch (this.gameState.gamePhase) {
      case "new_game":
        const newGameNode = new NewGameNode();
        this.setGamePhaseNode(newGameNode);
        newGameNode.setToGameState(this.gameState);
        break;
    }
  };

  public handleServerMessage = (message: SocketMessage) => {
    const playerId = this.container?.context.playerId;
    if (playerId == null) {
      return;
    }
    RoomSocketMessages.gameUpdates.handle(message, (payload) => {
      const newGameState = updateClientGameForEvents(
        this.gameState,
        payload.events,
        playerId
      );
      this.gameState = newGameState;
      for (const event of payload.events) {
        this.handleEvent(event);
      }
    });
    RoomSocketMessages.roomStatus.handle(message, (payload) => {
      const newGameState = updateClientGameForEvents(
        this.gameState,
        payload.room.gameEvents,
        playerId
      );
      this.setToPlayState(newGameState);
    });
  };

  public handleEvent = (event: PlayerEvent) => {
    const { type } = event;
    switch (type) {
      case "enter_game":
        if (this.gamePhaseNode instanceof NewGameNode) {
          this.gamePhaseNode.handleEnterGame(event);
        }
        break;

      case "leave_game":
        if (this.gamePhaseNode instanceof NewGameNode) {
          this.gamePhaseNode.handleLeaveGame(event);
        }
        break;

      case "mark_player_ready":
        if (this.gamePhaseNode instanceof NewGameNode) {
          this.gamePhaseNode.handleMarkPlayerReady(event);
        }
        break;

      case "mark_player_unready":
        if (this.gamePhaseNode instanceof NewGameNode) {
          this.gamePhaseNode.handleMarkPlayerUnready(event);
        }
        break;
    }
  };
}
