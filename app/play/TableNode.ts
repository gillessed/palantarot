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
import { TableNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";

export type GamePhaseNode = TwoDNode & GameEventHandler;

export class TableNode extends TwoDNode implements Sizeable {
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
  private queueMessages: SocketMessage<GameUpdatesMessagePayload>[] = [];

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
      })
    );

    const removeSceneListener = this.context.socket.addListener(
      this.handleServerMessage
    );

    const stopSizeListen = manager.size.listen((size: Size) => {
      const { width, height } = size;
      this.offset = [width / 2, height / 2];
      this.size.set(size);
    });

    return () => {
      stopSizeListen();
      removeSceneListener();
    };
  };

  public setSceneNode = (newGamePhaseNode: GamePhaseNode) => {
    if (this.gamePhaseNode != null) {
      this.removeChild(this.gamePhaseNode);
    }
    this.gamePhaseNode = newGamePhaseNode;
    this.addChild(newGamePhaseNode);
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
          this.gameState
        );
        break;
      case "dog_reveal":
        this.gamePhaseNode = new DogRevealPhaseNode(
          this.context,
          this.gameState
        );
        break;
    }
    if (this.gamePhaseNode != null) {
      this.addChild(this.gamePhaseNode);
    }
  };

  public handleGameEventMessage = ({
    payload,
  }: SocketMessage<GameUpdatesMessagePayload>) => {
    for (const event of payload.events) {
      const newGameState = updateClientGameForEvents(
        this.gameState,
        [event],
        this.context.playerId
      );
      this.gameState = newGameState;
    }
  };

  public handleEvent = (event: PlayerEvent) => {
    const { type } = event;
    switch (type) {
      // handle transitions
      case "game_started":
        break;
      case "bidding_completed":
        break;
      case "dog_revealed":
        break;
      case "dog_revealed":
        break;
      default:
        this.gamePhaseNode?.handleEvent(event, this.gameState);
        return;
    }
  };

  public handleServerMessage = (message: SocketMessage) => {
    RoomSocketMessages.gameUpdates.handleMessage(message, (typedMessage) => {
      try {
        if (this.processedInitialUpdated) {
          this.handleGameEventMessage(typedMessage);
        } else {
          this.queueMessages.push(message);
        }
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
            this.context.playerId
          );
          this.setToPlayState(newGameState);
          for (const queuedMessage of this.queueMessages) {
            this.handleGameEventMessage(queuedMessage);
          }
          this.queueMessages.splice(0);
          this.processedInitialUpdated = true;
        } catch (error) {
          console.error(error);
        }
      }
    });
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
          if (this.gameState.phase !== "bidding") {
            throw Error("Cannot be other phase during bid action");
          }
          biddingPhaseNode.handleBid(
            event,
            this.gameState.playerOrder[this.gameState.toBid]
          );
          break;

        case "bidding_completed":
          // TODO: animation
          this.setToPlayState(this.gameState);
          break;
      }
    };
  };

  public createDogRevealPhaseEventHandler = (_: DogRevealPhaseNode) => {
    return (event: PlayerEvent) => {
      const { type } = event;
      switch (type) {
      }
    };
  };
}
