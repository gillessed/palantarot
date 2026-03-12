import { Card } from "../../../../server/play/model/Card";
import type { PlayerEvent } from "../../../../server/play/model/GameEvents";
import type { DogRevealClientGameState } from "../../../../shared/types/ClientGameState";
import { cardsWithout } from "../../../../shared/utils/cardsWithout";
import { Vector } from "../../../sceneGraph/math/Vector";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { TimerNode } from "../../../sceneGraph/nodes/TimerNode";
import { getCardAssetKey } from "../../assets/ImageAssets";
import { CardNode } from "../../components/CardNode";
import { StartedGameNode } from "../../components/StartedGameNode";
import { TextActionButtonNode } from "../../components/TextActionButtonNode";
import { CardHeight } from "../../constants/CardConstants";
import { DogRevealPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { transferNode } from "../../utils/transferNode";
import { transformVector } from "../../utils/transformVector";
import { GameEventHandler } from "../GameEventHandler";
import { DogCardsNode } from "./DogCardsNode";
import { getAllowedDrops } from "./getAllowedDrops";

export class DogRevealPhaseNode extends TwoDNode implements GameEventHandler {
  public context: PlaySceneContext;
  public startedGameNode: StartedGameNode;
  public dogCardsNode: DogCardsNode;
  public setDogButton: TextActionButtonNode;
  public allowedDrops = new Set<string>();
  public dogFadeOutAnimation: TimerNode;

  constructor(context: PlaySceneContext, state: DogRevealClientGameState) {
    super(DogRevealPhaseNodeId);
    this.context = context;

    this.dogFadeOutAnimation = new TimerNode(`${DogRevealPhaseNode}-fade-out`);
    this.dogFadeOutAnimation.easing = "inOutSine";
    this.dogFadeOutAnimation.reversed = true;
    this.dogFadeOutAnimation.durationMs = 250;
    this.addChild(this.dogFadeOutAnimation);

    const isBidder = this.context.playerId === state.winningBid.player;
    for (const card of getAllowedDrops(state.hand, state.dog.length)) {
      this.allowedDrops.add(getCardAssetKey(card));
    }

    this.dogCardsNode = new DogCardsNode(state.dog);
    this.addChild(this.dogCardsNode);

    this.setDogButton = new TextActionButtonNode(
      `${DogRevealPhaseNodeId}-button`,
    );
    this.setDogButton.setText("Set dog");
    this.setDogButton.setDisabled(true);
    this.setDogButton.offset = [0, CardHeight / 2 + 50];
    this.setDogButton.size.set({ width: 200, height: 60 });
    this.setDogButton.onClick = async () => {
      const promises: Promise<void>[] = [];
      promises.push(
        new Promise<void>((resolve) => {
          this.dogFadeOutAnimation.start({
            onChanged: (value) => {
              this.dogCardsNode.opacity = value;
              this.dogCardsNode.handleClick = undefined;
              this.dogCardsNode.handleMouseEntered = undefined;
              this.dogCardsNode.handleMouseExited = undefined;
              this.startedGameNode.playerHandNode.handleClick = undefined;
              this.startedGameNode.playerHandNode.handleMouseEntered =
                undefined;
              this.startedGameNode.playerHandNode.handleMouseExited = undefined;
            },
            onFinished: () => {
              this.dogCardsNode.visible = false;
              resolve();
            },
          });
        }),
      );
      promises.push(
        this.startedGameNode.playerHandNode.setClickableCards([], "animate"),
      );
      await Promise.all(promises);
      const cards = this.dogCardsNode
        .getAllCardNodes()
        .map((node) => node.card.get());
      this.context.eventHandler.setDog(cards);
    };
    this.dogCardsNode.addChild(this.setDogButton);

    const hand = isBidder ? cardsWithout(state.hand, ...state.dog) : state.hand;
    this.startedGameNode = new StartedGameNode(
      context,
      state.playerOrder,
      hand,
      state.winningBid,
    );
    this.startedGameNode.setActivePlayer(state.winningBid.player, "instant");
    this.addChild(this.startedGameNode);

    if (!isBidder) {
      this.doRevealAnimation();
    } else {
      this.doRevealAnimationForBidder(
        getAllowedDrops(state.hand, state.dog.length),
      );
    }

    if (isBidder) {
      this.setCardClickHandlers();
    }
  }

  public setCardClickHandlers = () => {
    const handleMouseEntered = (node: CardNode) => {
      if (this.allowedDrops.has(getCardAssetKey(node.card.get()))) {
        this.container?.setCursor("pointer");
        node.hovered.set(true);
      }
    };

    const handleMouseExited = (node: CardNode) => {
      node.hovered.set(false);
      this.container?.setCursor("default");
    };

    this.startedGameNode.playerHandNode.handleClick = async (
      node,
      cardIndex,
    ) => {
      if (!this.allowedDrops.has(getCardAssetKey(node.card.get()))) {
        return;
      }
      const dogIndex = this.dogCardsNode.getLowestEmpty();
      if (dogIndex < 0) {
        return;
      }
      const dogPosition: Vector = [
        this.dogCardsNode.getCardOffsetForIndex(dogIndex),
        0,
      ];
      const dogPositionRelativeToHand = transformVector(
        dogPosition,
        this.dogCardsNode,
        this.startedGameNode.playerHandNode,
      );
      this.dogCardsNode.cardNodes[dogIndex] = node;
      await this.startedGameNode.playerHandNode.removeCard(
        cardIndex,
        dogPositionRelativeToHand,
      );
      node.offset = dogPosition;
      transferNode(node, this.dogCardsNode);
      this.dogCardsNode.setHandler(node);
      if (
        this.dogCardsNode.getAllCardNodes().length === this.dogCardsNode.dogSize
      ) {
        this.setDogButton.setDisabled(false);
      }
    };
    this.dogCardsNode.handleClick = async (node) => {
      this.dogCardsNode.removeCardNode(node);
      if (
        this.dogCardsNode.getAllCardNodes().length < this.dogCardsNode.dogSize
      ) {
        this.setDogButton.setDisabled(true);
      }
      await this.startedGameNode.playerHandNode.insertCards([node], "animate");
    };
    this.startedGameNode.playerHandNode.handleMouseEntered = handleMouseEntered;
    this.startedGameNode.playerHandNode.handleMouseExited = handleMouseExited;
    this.dogCardsNode.handleMouseEntered = handleMouseEntered;
    this.dogCardsNode.handleMouseExited = handleMouseExited;
  };

  public doRevealAnimation = async (): Promise<void> => {
    await this.dogCardsNode.turnOverAll("face-up", "animate");
  };

  public doRevealAnimationForBidder = async (
    allowedDrops: readonly Card[],
  ): Promise<void> => {
    await this.doRevealAnimation();
    const dogCards = this.dogCardsNode.getAllCardNodes();
    this.dogCardsNode.clear();
    await this.startedGameNode.playerHandNode.insertCards(dogCards, "animate");
    await this.startedGameNode.playerHandNode.setClickableCards(
      allowedDrops,
      "animate",
    );
  };

  public handleEvent = async (event: PlayerEvent) => {
    const { type } = event;
    switch (type) {
      // TODO: handle show?
    }
  };
}
