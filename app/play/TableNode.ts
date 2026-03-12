import type { Size } from "recharts/types/util/types";
import type { PlayerEvent } from "../../server/play/model/GameEvents";
import type { GameSettings } from "../../server/play/model/GameSettings";
import {
  GameUpdatesMessagePayload,
  RoomSocketMessages,
} from "../../server/play/room/RoomSocketMessages";
import type { SocketMessage } from "../../server/websocket/SocketMessage";
import { createEmptyClientGameState } from "../../shared/game/emptyClientGameState";
import { updateClientGameForEvents } from "../../shared/game/updateClientGameForEvents";
import type { ClientGameState } from "../../shared/types/ClientGameState";
import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager } from "../sceneGraph/nodes/SceneNode";
import {
  createDefaultProperty,
  type Property,
} from "../sceneGraph/property/Property";
import type { Sizeable } from "../sceneGraph/property/Size";
import type { ImageAssets } from "./assets/ImageAssets";
import { BiddingPhaseNode } from "./gamePhase/bidding/BiddingPhaseNode";
import { DogRevealPhaseNode } from "./gamePhase/dogReveal/DogRevealPhaseNode";
import type { GameEventHandler } from "./gamePhase/GameEventHandler";
import { NewGamePhaseNode } from "./gamePhase/newGame/NewGamePhaseNode";
import { PartnerCallPhaseNode } from "./gamePhase/partnerCall/PartnerCallPhaseNode";
import { PlayingPhaseNode } from "./gamePhase/playing/PlayingPhaseNode";
import { TableNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";
import { BlockingQueueExecutor } from "../../shared/blockingQueue/BlockingQueueExecutor";

export type GamePhaseNode = TwoDNode & GameEventHandler;

export class TableNode extends TwoDNode implements Sizeable {
  
  public handleGameEventMessage = async (payload: GameUpdatesMessagePayload) => {
    for (const event of payload.events) {
      const newGameState = updateClientGameForEvents(
        this.gameState,
        [event],
        this.context.playerId,
      );
      this.gameState = newGameState;
      await this.handleEvent(event);
    }
  };

  public context: PlaySceneContext;
  public gameSettings: GameSettings = {
    autologEnabled: false,
    bakerBengtsonVariant: false,
    publicHands: false,
  };
  public size: Property<Size> = createDefaultProperty({ width: 0, height: 0 });
  public imageAssets: ImageAssets;
  public gamePhaseNode?: GamePhaseNode;
  public gameState: ClientGameState = createEmptyClientGameState();
  private processedInitialUpdated = false;
  private messageHandler = new BlockingQueueExecutor<GameUpdatesMessagePayload>(this.handleGameEventMessage);

  constructor(context: PlaySceneContext, imageAssets: ImageAssets) {
    super(TableNodeId);
    this.context = context;
    this.imageAssets = imageAssets;
  }

  public onMount = (manager: NodeManager) => {
    this.context.socket.connect();
    this.context.socket.send(
      RoomSocketMessages.enterRoom({
        playerId: this.context.playerId,
        roomId: this.context.roomId,
      }),
    );

    const removeSceneListener = this.context.socket.addListener(
      this.handleServerMessage,
    );

    const stopSizeListen = manager.size.getAndListen((size: Size) => {
      const { width, height } = size;
      this.offset = [width / 2, height / 2];
      this.size.set(size);
    });

    return () => {
      stopSizeListen();
      removeSceneListener();
    };
  };

  public setToPlayState = (state: ClientGameState) => {
    this.gameState = state;
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    const { phase } = this.gameState;
    switch (phase) {
      case "new_game":
        this.gamePhaseNode = new NewGamePhaseNode(this.context, this.gameState);
        break;
      case "bidding":
        this.gamePhaseNode = new BiddingPhaseNode(this.context, this.gameState);
        break;
      case "partner_call":
        this.gamePhaseNode = new PartnerCallPhaseNode(
          this.context,
          this.gameState,
        );
        break;
      case "dog_reveal":
        this.gamePhaseNode = new DogRevealPhaseNode(
          this.context,
          this.gameState,
        );
        break;
      case "playing":
        this.gamePhaseNode = new PlayingPhaseNode(this.context, this.gameState);
        break;
    }
    if (this.gamePhaseNode != null) {
      this.addChild(this.gamePhaseNode);
    }
  };

  public handleEvent = async (event: PlayerEvent) => {
    const { type } = event;
    switch (type) {
      case "players_set":
        await this.transitionToBid();
        break;
      case "bidding_completed":
        await this.transitionToPartnerCall();
        break;
      case "dog_revealed":
        await this.transitionToDogReveal();
        break;
      case "game_started":
        await this.transitionToPlaying();
        break;
      default:
        await this.gamePhaseNode?.handleEvent(event, this.gameState);
        return;
    }
  };

  public transitionToBid = async () => {
    if (this.gameState.phase !== "bidding") {
      return;
    }
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    const newPhaseNode = new BiddingPhaseNode(this.context, this.gameState);
    this.gamePhaseNode = newPhaseNode;
    this.addChild(newPhaseNode);
  };

  public transitionToPartnerCall = async () => {
    if (this.gameState.phase !== "partner_call") {
      return;
    }
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    const newPhaseNode = new PartnerCallPhaseNode(this.context, this.gameState);
    this.gamePhaseNode = newPhaseNode;
    this.addChild(newPhaseNode);
  };

  public transitionToDogReveal = async () => {
    if (this.gameState.phase !== "dog_reveal") {
      return;
    }
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    const dogRevealPhaseNode = new DogRevealPhaseNode(
      this.context,
      this.gameState,
    );
    this.gamePhaseNode = dogRevealPhaseNode;
    this.addChild(dogRevealPhaseNode);
  };

  public transitionToPlaying = async () => {
    if (this.gameState.phase !== "playing") {
      return;
    }
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    const playingPhaseNode = new PlayingPhaseNode(this.context, this.gameState);
    this.gamePhaseNode = playingPhaseNode;
    this.addChild(playingPhaseNode);
  };

  public handleServerMessage = (message: SocketMessage) => {
    RoomSocketMessages.gameUpdates.handleMessage(message, (typedMessage) => {
      try {
        this.messageHandler.push(typedMessage.payload);
      } catch (error) {
        console.error(error);
      }
    });
    RoomSocketMessages.roomStatus.handle(message, (payload) => {
      if (!this.processedInitialUpdated) {
        try {
          const newGameState = updateClientGameForEvents(
            this.gameState,
            payload.room.gameEvents,
            this.context.playerId,
          );
          this.setToPlayState(newGameState);
          this.processedInitialUpdated = true;
          this.messageHandler.start();
        } catch (error) {
          console.error(error);
        }
      }
    });
  };
}
