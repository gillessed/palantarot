import * as assert from "assert";
import _ from "lodash";
import { cardsContain, getCardsAllowedToPlay, getPlayerNum, testingSetShuffler } from "./cardUtils";
import { BidValue, Call, Card, GameCompletedTransition, TheOne } from "./common";
import { Game, testingGetState } from "./server";
import { PlayingBoardState } from "./state";

const createTimer = () => {
  let logical_clock = 0;
  return () => logical_clock++
};

export const SampleDeal = {
  dog: [
    ["T", 19], ["H", 4], ["D", 4]
  ] as Card[],
  hands: [
    [
      ["C", 3], ["C", "D"],
      ["D", 5], ["D", 6], ["D", "V"], ["D", "D"], ["D", "R"],
      ["H", 5],
      ["S", 1], ["S", 9], ["S", "V"], ["S", "C"],
      ["T", 7], ["T", 12], ["T", 18]
    ],
    [
      ["C", 10],
      ["D", 1], ["D", 3], ["D", 10],
      ["H", 1], ["H", 2], ["H", 3], ["H", "R"],
      ["S", 2], ["S", 3], ["S", 8], ["S", "R"],
      ["T", 6], ["T", 8], ["T", 21]
    ],
    [
      ["C", 1], ["C", 4], ["C", 7], ["C", 8], ["C", "V"], ["C", "R"],
      ["D", 9], ["D", "C"],
      ["H", 10], ["H", "V"],
      ["S", 4],
      ["T", 4], ["T", 9], ["T", 11], ["T", 16]
    ],
    [
      ["C", 2], ["C", 9],
      ["D", 2], ["D", 7],
      ["H", 6], ["H", 7], ["H", "C"],
      ["S", 5], ["S", 6], ["S", 7], ["S", 10], ["S", "D"],
      ["T", 2], ["T", 3], ["T", 5]
    ],
    [
      ["T", "Joker"],
      ["C", 5], ["C", 6], ["C", "C"],
      ["D", 8], // -> dog
      ["H", 8], ["H", 9], ["H", "D"],
      ["T", 1], ["T", 10], ["T", 13], ["T", 14], ["T", 15], ["T", 17], /* ['T', 19] */["T", 20]
    ]
  ] as Card[][]
};

function autoplayTrick(game: Game, time: () => number) {
  const order = (testingGetState(game) as PlayingBoardState).current_trick.players;
  for (const player of order) {
    const state = testingGetState(game) as PlayingBoardState;
    const cards = getCardsAllowedToPlay(state.hands[getPlayerNum(state.players, player)], state.current_trick.cards);
    // Play first available card, otherwise try to play one last. (Not smartest play, but good for testing)
    const card = _.find(cards, (card) => !_.isEqual(card, TheOne)) || cardsContain(cards, TheOne);
    game.playerAction({ type: 'play_card', player, card, time: time() });
  }
}

export const test = () => {
  const game = Game.create_new();
  const time = createTimer();
  testingSetShuffler((_cards: Card[]) => [..._.concat<Card>([], ...SampleDeal.hands), ...SampleDeal.dog]);

  game.playerAction({ type: 'enter_game', player: 'dxiao', time: time() });
  game.playerAction({ type: 'enter_game', player: 'ericb', time: time() });
  game.playerAction({ type: 'enter_game', player: 'gcole', time: time() });
  game.playerAction({ type: 'enter_game', player: 'karl', time: time() });
  game.playerAction({ type: 'enter_game', player: 'samira', time: time() });
  game.playerAction({ type: 'message', player: 'dxiao', text: 'does this work?', time: time() });
  game.playerAction({ type: 'mark_player_ready', player: 'samira', time: time() });
  game.playerAction({ type: 'mark_player_ready', player: 'ericb', time: time() });
  game.playerAction({ type: 'mark_player_ready', player: 'gcole', time: time() });
  game.playerAction({ type: 'mark_player_ready', player: 'karl', time: time() });
  game.playerAction({ type: 'mark_player_ready', player: 'dxiao', time: time() });

  assert.deepStrictEqual(game.getEvents("dxiao")[0].pop()?.type, 'dealt_hand');

  game.playerAction({ type: 'bid', player: 'dxiao', bid: BidValue.TEN, time: time() });
  game.playerAction({ type: 'bid', player: 'ericb', bid: BidValue.TWENTY, calls: [Call.RUSSIAN], time: time() });
  game.playerAction({ type: 'bid', player: 'gcole', bid: BidValue.PASS, time: time() });
  game.playerAction({ type: 'bid', player: 'karl', bid: BidValue.PASS, time: time() });
  game.playerAction({ type: 'bid', player: 'samira', bid: BidValue.FORTY, time: time() });
  game.playerAction({ type: 'bid', player: 'dxiao', bid: BidValue.PASS, time: time() });
  game.playerAction({ type: 'bid', player: 'ericb', bid: BidValue.PASS, time: time() });

  assert.deepStrictEqual(game.getEvents('dxiao')[0].pop()?.type, 'bidding_completed');

  game.playerAction({ type: 'call_partner', player: 'samira', card: ["H", "R"], time: time() });

  assert.deepStrictEqual(game.getEvents('dxiao')[0].pop()?.type, 'dog_revealed');

  game.playerAction({ type: 'set_dog', player: 'samira', dog: [['D', 4], ['D', 8], ['H', 4]], private_to: 'samira', time: time() });

  assert.deepStrictEqual(game.getEvents('dxiao')[0].pop()?.type, 'game_started');

  game.playerAction({
    type: 'show_trump', player: 'samira', time: time(), cards: [
      ["T", "Joker"], ["T", 1], ["T", 10], ["T", 13], ["T", 14], ["T", 15], ["T", 17], ['T', 19], ["T", 20]
    ]
  });

  game.playerAction({ type: 'play_card', player: 'samira', card: ['C', 5], time: time() });
  game.playerAction({ type: 'play_card', player: 'dxiao', card: ['C', 3], time: time() });
  game.playerAction({ type: 'play_card', player: 'ericb', card: ['C', 10], time: time() });
  game.playerAction({ type: 'play_card', player: 'gcole', card: ['C', 'R'], time: time() });
  game.playerAction({ type: 'play_card', player: 'karl', card: ['C', 2], time: time() });

  assert.deepStrictEqual(game.getEvents('dxiao', time() - 5)[0].pop()?.type, 'completed_trick');

  game.playerAction({ type: 'play_card', player: 'gcole', card: ['C', 1], time: time() });
  game.playerAction({ type: 'play_card', player: 'karl', card: ['C', 9], time: time() });
  game.playerAction({ type: 'play_card', player: 'samira', card: ['C', 6], time: time() });
  game.playerAction({ type: 'play_card', player: 'dxiao', card: ['C', 'D'], time: time() });
  game.playerAction({ type: 'play_card', player: 'ericb', card: ['T', 6], time: time() });

  assert.deepStrictEqual(game.getEvents('dxiao', time() - 5)[0].pop()?.type, 'completed_trick');

  game.playerAction({ type: 'play_card', player: 'ericb', card: ['T', 8], time: time() });
  game.playerAction({ type: 'play_card', player: 'gcole', card: ['T', 11], time: time() });
  game.playerAction({ type: 'play_card', player: 'karl', card: ['T', 2], time: time() });
  game.playerAction({ type: 'play_card', player: 'samira', card: ['T', 13], time: time() });
  game.playerAction({ type: 'play_card', player: 'dxiao', card: ['T', 18], time: time() });

  assert.deepStrictEqual(game.getEvents('dxiao', time() - 5)[0].pop()?.type, 'completed_trick');

  for (let i = 0; i < 12; i++) {
    autoplayTrick(game, time);
  }
  assert.deepStrictEqual(game.getEvents('dxiao', time() - 5)[0].pop()?.type, 'game_completed');

  const end_state = (game.getEvents('dxiao', time() - 5)[0].pop() as GameCompletedTransition).end_state;
  assert.deepStrictEqual(end_state.bidderWon, true);
  assert.deepStrictEqual(end_state.outcomes[4], ['one_last']);
  assert.deepStrictEqual(end_state.bouts.length, 3);
  assert.deepStrictEqual(end_state.pointsEarned, 52);
  assert.deepStrictEqual(end_state.shows[4], []);
  assert.deepStrictEqual(end_state.pointsResult, 80);

  return game;
};
