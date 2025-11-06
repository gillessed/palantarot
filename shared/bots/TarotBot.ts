import { type ClientGame } from "../types/ClientGame.ts";
import { type Card } from "../../server/play/model/Card.ts";
import { type Bid } from "../../server/play/model/GameState.ts";
import { RandomBot, RandomBotType } from "./RandomBot.ts";
import { SimpleBot, SimpleBotType } from "./SimpleBot.ts";

export interface TarotBot {
  type: string;
  bid(game: ClientGame): Bid;
  pickPartner(game: ClientGame): Card;
  dropDog(game: ClientGame): Card[];
  playCard(game: ClientGame): Card;
}

export type TarotBotRegistry = { [key: string]: () => TarotBot };
export const DefaultTarotBotRegistry: TarotBotRegistry = {
  [RandomBotType]: () => new RandomBot(),
  [SimpleBotType]: () => new SimpleBot(),
};
