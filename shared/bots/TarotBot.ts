import { type ClientRoom } from "../types/ClientRoom.ts";
import { type Card } from "../../server/play/model/Card.ts";
import { type Bid } from "../../server/play/model/GameState.ts";
import { RandomBot, RandomBotType } from "./RandomBot.ts";
import { SimpleBot, SimpleBotType } from "./SimpleBot.ts";

export interface TarotBot {
  type: string;
  bid(game: ClientRoom): Bid;
  pickPartner(game: ClientRoom): Card;
  dropDog(game: ClientRoom): Card[];
  playCard(game: ClientRoom): Card;
}

export type TarotBotRegistry = { [key: string]: () => TarotBot };
export const DefaultTarotBotRegistry: TarotBotRegistry = {
  [RandomBotType]: () => new RandomBot(),
  [SimpleBotType]: () => new SimpleBot(),
};
