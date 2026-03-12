import { Card } from "../../../../server/play/model/Card";
import {
  CompletedTrickTransition,
  PlayCardAction,
  type PlayerEvent,
} from "../../../../server/play/model/GameEvents";
import { type PlayerId } from "../../../../server/play/model/GameState";
import type {
  ClientGameState,
  PlayingClientGameState,
} from "../../../../shared/types/ClientGameState";
import { getCardsAllowedToPlay } from "../../../../shared/utils/getCardsAllowedToPlay";
import { getTrickCards } from "../../../../shared/utils/getTrickCards";
import { Vector } from "../../../sceneGraph/math/Vector";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { getCardAssetKey } from "../../assets/ImageAssets";
import { CardNode } from "../../components/CardNode";
import { SideCardPositions } from "../../components/SideCardNode";
import { SideCardPositionLayout } from "../../components/SideCardsNode";
import { StartedGameNode } from "../../components/StartedGameNode";
import { BiddingPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { animateValue, animateVector } from "../../utils/animateValue";
import { rotatePlayerOrder } from "../../utils/rotatePlayerOrder";
import { transferNode } from "../../utils/transferNode";
import { transformVector } from "../../utils/transformVector";
import { ZIndices } from "../../utils/ZIndices";
import { PlayerBidNode } from "../bidding/PlayerBidNode";
import type { GameEventHandler } from "../GameEventHandler";
import { TrickCardsNode } from "./TrickCardsNode";

export class PlayingPhaseNode extends TwoDNode implements GameEventHandler {
  public context: PlaySceneContext;
  public startedGameNode: StartedGameNode;
  public trickCardsNode: TrickCardsNode;
  public bidNodes: Map<PlayerId, PlayerBidNode> = new Map();
  public allowedPlays = new Set<string>();

  constructor(context: PlaySceneContext, state: PlayingClientGameState) {
    super(BiddingPhaseNodeId);
    this.context = context;

    this.startedGameNode = new StartedGameNode(
      context,
      state.playerOrder,
      state.hand,
      state.winningBid,
    );

    const rotatedPlayers = rotatePlayerOrder(
      state.playerOrder,
      context.playerId,
    );
    this.trickCardsNode = new TrickCardsNode(rotatedPlayers, state.trick);
    this.addChild(this.trickCardsNode);

    this.startedGameNode.setActivePlayer(state.toPlay, "instant");
    this.addChild(this.startedGameNode);

    this.updateActivePlayer(state);
  }

  public addCardClickHandlers = () => {
    const handleMouseEntered = (node: CardNode) => {
      if (this.allowedPlays.has(getCardAssetKey(node.card.get()))) {
        this.container?.setCursor("pointer");
        node.hovered.set(true);
      }
    };

    const handleMouseExited = (node: CardNode) => {
      node.hovered.set(false);
      this.container?.setCursor("default");
    };

    this.startedGameNode.playerHandNode.handleClick = async (node) => {
      if (!this.allowedPlays.has(getCardAssetKey(node.card.get()))) {
        return;
      }
      this.removeCardClickHandlers();
      this.context.eventHandler.playCard(node.card.get());
    };
    this.startedGameNode.playerHandNode.handleMouseEntered = handleMouseEntered;
    this.startedGameNode.playerHandNode.handleMouseExited = handleMouseExited;
  };

  public removeCardClickHandlers = () => {
    this.startedGameNode.playerHandNode.handleClick = undefined;
    this.startedGameNode.playerHandNode.handleMouseEntered = undefined;
    this.startedGameNode.playerHandNode.handleMouseExited = undefined;
  };

  public handlePlayCard = async (
    { card, playerId }: PlayCardAction,
    state: PlayingClientGameState,
  ) => {
    await Promise.all([
      playerId === this.context.playerId
        ? this.playCardFromHand(card)
        : this.playCardFromSide(card, playerId),
      this.updateActivePlayer(state),
    ]);
  };

  public updateActivePlayer = async (
    state: PlayingClientGameState,
  ): Promise<void> => {
    if (state.trick.completed) {
      return this.startedGameNode.setActivePlayer(undefined, "animate");
    }

    const promises: Promise<void>[] = [];
    promises.push(
      this.startedGameNode.setActivePlayer(state.toPlay, "animate"),
    );

    if (state.toPlay === this.context.playerId) {
      const allowedPlays = getCardsAllowedToPlay(
        getTrickCards(state.trick),
        state.hand,
        state.anyPlayerPlayedCard,
        state.partnerCard,
      );
      this.allowedPlays = new Set(allowedPlays.map(getCardAssetKey));
      promises.push(
        this.startedGameNode.playerHandNode.setClickableCards(
          allowedPlays,
          "animate",
        ),
      );
      this.addCardClickHandlers();
    } else {
      promises.push(
        this.startedGameNode.playerHandNode.setClickableCards([], "animate"),
      );
      this.removeCardClickHandlers();
    }
    await Promise.all(promises);
  };

  public playCardFromHand = async (card: Card) => {
    const cardIndex =
      this.startedGameNode.playerHandNode.cardNodes.indexOf(card);
    const node = this.startedGameNode.playerHandNode.cardNodes.get(cardIndex);
    const trickPosition = this.trickCardsNode.getOffsetForPlayer(
      this.context.playerId,
    );
    const trickPositionRelativeToHand = transformVector(
      trickPosition,
      this.trickCardsNode,
      this.startedGameNode.playerHandNode,
    );
    await this.startedGameNode.playerHandNode.removeCard(
      cardIndex,
      trickPositionRelativeToHand,
    );
    node.offset = trickPosition;
    transferNode(node, this.trickCardsNode);
    this.trickCardsNode.cardNodes.set(this.context.playerId, node);
  };

  public getSideCardPosition = (playerId: PlayerId) => {
    const rotatedOrder = rotatePlayerOrder(
      this.trickCardsNode.playerOrder,
      this.context.playerId,
    );
    const playerIndex = rotatedOrder.indexOf(playerId);
    if (playerIndex < 0) {
      throw Error("Playing player must be index player order");
    }
    const position = SideCardPositionLayout[rotatedOrder.length][playerIndex];
    const size = this.container?.size.get();
    if (size == null) {
      throw Error("Shouldn't be calling playCardFromSide when unmounted");
    }

    const [sideCardPosition] = SideCardPositions[position](
      size.width / 2,
      size.height / 2,
    );
    return sideCardPosition;
  };

  public playCardFromSide = async (card: Card, playerId: PlayerId) => {
    const sideCardPosition = this.getSideCardPosition(playerId);
    const sourcePosition = transformVector(
      sideCardPosition,
      this,
      this.trickCardsNode,
    );
    const newCardNode = new CardNode(`${this.id}-trick-card-${playerId}`);
    newCardNode.card.set(card);
    newCardNode.offset = sourcePosition;
    newCardNode.zIndex = ZIndices.card;
    newCardNode.opacity = 0;
    this.trickCardsNode.addChild(newCardNode);

    const targetPosition = this.trickCardsNode.getOffsetForPlayer(playerId);
    await Promise.all([
      animateVector(
        this,
        sourcePosition,
        targetPosition,
        (value) => {
          newCardNode.offset = value;
        },
        { durationMs: 500, easing: "inOutCubic" },
      ),
      animateValue(
        this,
        0,
        1,
        (value) => {
          newCardNode.opacity = value;
        },
        { durationMs: 250, easing: "inOutSine" },
      ),
    ]);
    this.trickCardsNode.cardNodes.set(playerId, newCardNode);
  };

  public handleCompletedTrick = async (event: CompletedTrickTransition) => {
    console.log("Completing trick");
    const sideCardPosition = this.getSideCardPosition(event.winner);
    const targetPosition = transformVector(
      sideCardPosition,
      this,
      this.trickCardsNode,
    );
    const promises: Promise<void>[] = [];
    for (const cardNode of this.trickCardsNode.cardNodes.values()) {
      const sourcePosition: Vector = [...cardNode.offset];
      promises.push(
        animateVector(
          this,
          sourcePosition,
          targetPosition,
          (value) => {
            cardNode.offset = value;
          },
          { durationMs: 500, easing: "inOutCubic" },
        ),
      );
    }
    await Promise.all(promises);
  };

  public handleEvent = async (
    event: PlayerEvent,
    gameState: ClientGameState,
  ) => {
    if (gameState.phase !== "playing") {
      throw Error("state should be playing: " + gameState.phase);
    }
    const { type } = event;
    switch (type) {
      case "play_card":
        return this.handlePlayCard(event, gameState);
      case "completed_trick":
        return this.handleCompletedTrick(event);
        break;
    }
  };
}
