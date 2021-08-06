import {ClientGame} from '../app/services/room/ClientGame';
import {Card} from '../server/play/model/Card';
import {Bid} from '../server/play/model/GameState';
import {RandomBot, RandomBotType} from './RandomBot';
import {SimpleBot, SimpleBotType} from './SimpleBot';

export interface TarotBot {
  type: string;
  bid(game: ClientGame): Bid;
  pickPartner(game: ClientGame): Card;
  dropDog(game: ClientGame): Card[];
  playCard(game: ClientGame): Card;
}

export type TarotBotRegistry = {[key: string]: () => TarotBot};
export const DefaultTarotBotRegistry: TarotBotRegistry = {
  [RandomBotType]: () => new RandomBot(),
  [SimpleBotType]: () => new SimpleBot(),
};
