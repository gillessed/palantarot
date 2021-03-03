import { Bid, Card } from "../app/play/common";
import { InGameState } from "../app/services/ingame/InGameTypes";
import { RandomBot, RandomBotType } from "./RandomBot";
import { SimpleBot, SimpleBotType } from "./SimpleBot";

export interface TarotBot {
  type: string;
  bid(gameState: InGameState): Bid;
  pickPartner(gameState: InGameState): Card;
  dropDog(gameState: InGameState): Card[];
  playCard(gameState: InGameState): Card;
}

export type TarotBotRegistry = { [key: string]: () => TarotBot };
export const DefaultTarotBotRegistry: TarotBotRegistry = {
  [RandomBotType]: () => new RandomBot(),
  [SimpleBotType]: () => new SimpleBot(),
};
