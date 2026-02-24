import { Card } from "../../../../server/play/model/Card";
import { cardsWithout } from "../../../../server/play/model/CardUtils";
import type { PlayerEvent } from "../../../../server/play/model/GameEvents";
import type { DogRevealClientGameState } from "../../../../shared/types/ClientGameState";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { StartedGameNode } from "../../components/StartedGameNode";
import { DogRevealPhaseNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { GameEventHandler } from "../GameEventHandler";
import { DogCardsNode } from "./DogCardsNode";

export class DogRevealPhaseNode extends TwoDNode implements GameEventHandler {
  public context: PlaySceneContext;
  public startedGameNode: StartedGameNode;
  public dogCardsNode: DogCardsNode;

  constructor(
    context: PlaySceneContext,
    state: DogRevealClientGameState,
    initializing: boolean,
  ) {
    super(DogRevealPhaseNodeId);
    this.context = context;

    const isActivePlayer = this.context.playerId === state.winningBid.player;

    const hand = isActivePlayer ? state.hand : cardsWithout(state.hand, ...state.dog);
    this.startedGameNode = new StartedGameNode(
      context,
      state.playerOrder,
      hand,
      state.winningBid,
    );
    this.startedGameNode.setActivePlayer(state.winningBid.player, "instant");
    this.addChild(this.startedGameNode);

    this.dogCardsNode = new DogCardsNode(
      state.playerOrder.length === 5 ? 3 : 6,
    );
    this.addChild(this.dogCardsNode);

    if (initializing) {
      if (!isActivePlayer) {
        this.doRevealAnimation(state.dog);
      } else {
        this.doRevealAnimationForBidder(state.dog);
      }
    } else {
      for (const card of state.dog) {
        // add cards to hand
      }
    }
  }

  public doRevealAnimation = async (
    dogCards: readonly Card[],
  ): Promise<void> => {
    for (const card of dogCards) {
      this.dogCardsNode.addCard(card, "face-down");
    }
    await this.dogCardsNode.turnOverAll("face-up", "animate");
  };

  public doRevealAnimationForBidder = async (
    dogCards: readonly Card[],
  ): Promise<void> => {
    await this.doRevealAnimation(dogCards);
    const dogCardNodes = this.dogCardsNode.get
    await this.startedGameNode.playerHandNode.insertCards(dogCards);
  };

  public handleEvent = (event: PlayerEvent) => {
    const { type } = event;
    switch (type) {
    }
  };
}
