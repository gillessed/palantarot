import type { Size } from "recharts/types/util/types";
import type { PlayerEvent } from "../../server/play/model/GameEvents";
import {
  GameUpdatesMessagePayload,
  RoomSocketMessages,
} from "../../server/play/room/RoomSocketMessages";
import type { SocketMessage } from "../../server/websocket/SocketMessage";
import { createEmptyClientGameState } from "../../shared/game/emptyClientGameState";
import { updateClientGameForEvents } from "../../shared/game/updateClientGameForEvents";
import type { ClientGameState } from "../../shared/types/ClientGameState";
import { TwoDNode } from "../sceneGraph/nodes/2d/TwoDNode";
import type { NodeManager, SceneNode } from "../sceneGraph/nodes/SceneNode";
import {
  createDefaultProperty,
  type Property,
} from "../sceneGraph/property/Property";
import type { Sizeable } from "../sceneGraph/property/Size";
import type { ImageAssets } from "./assets/ImageAssets";
import { BiddingPhaseNode } from "./gamePhase/bidding/BiddingPhaseNode";
import { NewGamePhaseNode } from "./gamePhase/newGame/NewGamePhaseNode";
import { PartnerCallPhaseNode } from "./gamePhase/partnerCall/PartnerCallPhaseNode";
import { TableNodeId } from "./NodeIds";
import type { PlaySceneContext } from "./PlaySceneContext";
import type { GameSettings } from "../../server/play/model/GameSettings";

export type GamePhaseNode = NewGamePhaseNode | BiddingPhaseNode;

export class TableNode extends TwoDNode implements Sizeable {
  public context: PlaySceneContext;
  public gameSettings: GameSettings = {
    autologEnabled: false,
    bakerBengtsonVariant: false,
    publicHands: false,
  };
  public size: Property<Size> = createDefaultProperty({ width: 0, height: 0 });
  public imageAssets: ImageAssets;
  public gamePhaseNode?: SceneNode;
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

  public setSceneNode = (newGamePhaseNode: SceneNode) => {
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
        this.handleEvent =
          this.createBiddingPhaseEventHandler(biddingPhaseNode);
        break;
      case "partner_call":
        const partnerCallPhaseNode = new PartnerCallPhaseNode(
          this.context,
          this.gameState
        );
        this.gamePhaseNode = partnerCallPhaseNode;
        this.handleEvent =
          this.createPartnerCallPhaseEventHandler(partnerCallPhaseNode);
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
      this.handleEvent(event);
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

  public createPartnerCallPhaseEventHandler = (_: PartnerCallPhaseNode) => {
    return (event: PlayerEvent) => {
      const { type } = event;
      switch (
        type
        // TODO: handle events
      ) {
      }
    };
  };

  public handleEvent = (_: PlayerEvent) => {};
}
