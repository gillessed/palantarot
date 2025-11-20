import type { PlayerEvent } from "../../server/play/model/GameEvents";
import { RoomSocketMessages } from "../../server/play/room/RoomSocketMessages";
import type { SocketMessage } from "../../server/websocket/SocketMessage";
import { updateClientGameForEvents } from "../../shared/game/updateClientGameForEvents";
import {
  EmptyClientGame,
  type ClientGame,
} from "../../shared/types/ClientGameTypes";
import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import type { SceneNode } from "../sceneGraph/nodes/SceneNode";
import type { ImageAssets } from "./assets/ImageAssets";
import { BiddingPhaseNode } from "./gamePhase/bidding/BiddingPhaseNode";
import { NewGamePhaseNode } from "./gamePhase/newGame/NewGamePhaseNode";
import { TableNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";

export type GamePhaseNode = NewGamePhaseNode | BiddingPhaseNode;

export class TableNode extends TwoDNode {
  public context: PlaySceneContext;
  public imageAssets: ImageAssets;
  public gamePhaseNode?: SceneNode;
  public gameState: ClientGame = EmptyClientGame;
  private removeSceneListener?: () => void;

  constructor(context: PlaySceneContext, imageAssets: ImageAssets) {
    super(TableNodeId);
    this.context = context;
    this.imageAssets = imageAssets;
  }

  public onMount = () => {
    this.removeSceneListener = this.context.socket.addListener(
      this.handleServerMessage
    );
    this.context.socket.connect();
    this.context.socket.send(
      RoomSocketMessages.enterRoom({
        playerId: this.context.playerId,
        roomId: this.context.roomId,
      })
    );

    this.removeSceneListener = this.context.socket.addListener(
      this.handleServerMessage
    );
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

  public setSceneNode = (newGamePhaseNode: SceneNode) => {
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    this.gamePhaseNode = newGamePhaseNode;
    this.addChild(newGamePhaseNode);
  };

  public setToPlayState = (state: ClientGame) => {
    this.gameState = state;
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    switch (this.gameState.gamePhase) {
      case "new_game":
        const newGamePhaseNode = new NewGamePhaseNode(
          this.context,
          this.gameState
        );
        this.gamePhaseNode = newGamePhaseNode;
        this.handleEvent =
          this.createNewGamePhaseEventHandler(newGamePhaseNode);
        break;
      case "bidding":
        const biddingPhaseNode = new BiddingPhaseNode(
          this.context,
          this.gameState
        );
        this.gamePhaseNode = biddingPhaseNode;
        break;
    }
    if (this.gamePhaseNode != null) {
      this.addChild(this.gamePhaseNode);
    }
  };

  public handleServerMessage = (message: SocketMessage) => {
    const playerId = this.context.playerId;
    RoomSocketMessages.gameUpdates.handle(message, (payload) => {
      try {
        const newGameState = updateClientGameForEvents(
          this.gameState,
          payload.events,
          playerId
        );
        this.gameState = newGameState;
        for (const event of payload.events) {
          this.handleEvent(event);
        }
      } catch (error) {
        console.error(error);
      }
    });
    RoomSocketMessages.roomStatus.handle(message, (payload) => {
      try {
        const newGameState = updateClientGameForEvents(
          this.gameState,
          payload.room.gameEvents,
          playerId
        );
        this.setToPlayState(newGameState);
      } catch (error) {
        console.error(error);
      }
    });
  };

  public createNewGamePhaseEventHandler = (
    newGamePhaseNode: NewGamePhaseNode
  ) => {
    return (event: PlayerEvent) => {
      const { type } = event;
      switch (type) {
        case "enter_game":
          newGamePhaseNode.handleEnterGame(event);
          break;

        case "leave_game":
          newGamePhaseNode.handleLeaveGame(event);
          break;

        case "mark_player_ready":
          newGamePhaseNode.handleMarkPlayerReady(event);
          break;

        case "mark_player_unready":
          newGamePhaseNode.handleMarkPlayerUnready(event);
          break;

        case "players_set":
          // TODO: deal animation
          this.setToPlayState(this.gameState);
          break;
      }
    };
  };

  public createBiddingPhaseEventHandler = (
    biddingPhaseNode: BiddingPhaseNode
  ) => {
    return (event: PlayerEvent) => {
      const { type } = event;
      switch (type) {
        case "dealt_hand":
          biddingPhaseNode.handleDealtHands(event);
          break;

        case "bid":
          if (this.gameState.toBid == null) {
            throw Error("to bid cannot be null");
          }
          biddingPhaseNode.handleBid(
            event,
            this.gameState.playerOrder[this.gameState.toBid]
          );
          break;
      }
    };
  };

  public handleEvent = (_: PlayerEvent) => {};
}
