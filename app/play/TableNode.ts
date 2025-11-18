import type { PlayerEvent } from "../../server/play/model/GameEvents";
import { RoomSocketMessages } from "../../server/play/room/RoomSocketMessages";
import type { SocketMessage } from "../../server/websocket/SocketMessage";
import { updateClientGameForEvents } from "../../shared/game/updateClientGameForEvents";
import {
  EmptyClientGame,
  type ClientGame,
} from "../../shared/types/ClientGameTypes";
import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager, SceneNode } from "../sceneGraph/nodes/SceneNode";
import type { ImageAssets } from "./assets/ImageAssets";
import { BiddingPhaseNode } from "./gamePhase/bidding/BiddingPhaseNode";
import { NewGamePhaseNode } from "./gamePhase/newGame/NewGamePhaseNode";
import { TableNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";

export type GamePhaseNode = NewGamePhaseNode | BiddingPhaseNode;

export class TableNode extends TwoDNode<PlaySceneContext> {
  public imageAssets: ImageAssets;
  public newGamePhaseNode = new NewGamePhaseNode();
  public biddingGameNode = new BiddingPhaseNode();
  public gamePhaseNode?: SceneNode<PlaySceneContext>;
  private gameState: ClientGame = EmptyClientGame;
  private removeSceneListener?: () => void;

  constructor(imageAssets: ImageAssets) {
    super(TableNodeId);
    this.imageAssets = imageAssets;
  }

  public onMount = (container: NodeManager<PlaySceneContext>) => {
    const { socket } = container.context;
    this.removeSceneListener = socket.addListener(this.handleServerMessage);
  };

  public onUnmount = () => {
    this.removeSceneListener?.();
    this.removeSceneListener = undefined;
  };

  public update = () => {
    const width = this.container?.width ?? 0;
    const height = this.container?.height ?? 0;
    this.offset = [width / 2, height / 2];
  };

  public setSceneNode = (newGamePhaseNode: SceneNode<PlaySceneContext>) => {
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    this.gamePhaseNode = newGamePhaseNode;
    this.addChild(newGamePhaseNode);
  };

  public setToPlayState = (state: ClientGame) => {
    this.gameState = state;
    switch (this.gameState.gamePhase) {
      case "new_game":
        this.setSceneNode(this.newGamePhaseNode);
        this.newGamePhaseNode.setToGameState(this.gameState);
        break;
      case "bidding":
        this.setSceneNode(this.biddingGameNode);
        this.biddingGameNode.setToGameState(this.gameState);
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
        this.newGamePhaseNode.handleEnterGame(event);
        break;

      case "leave_game":
        this.newGamePhaseNode.handleLeaveGame(event);
        break;

      case "mark_player_ready":
        this.newGamePhaseNode.handleMarkPlayerReady(event);
        break;

      case "mark_player_unready":
        this.newGamePhaseNode.handleMarkPlayerUnready(event);
        break;

      case "players_set":
        // TODO: deal animation
        this.setSceneNode(this.biddingGameNode);
        break;

      case "dealt_hand":
        // this.biddingGameNode.handleDealtHand(event);
        break;
    }
  };
}
