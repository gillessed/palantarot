import {Card, Suit, RegValue, TheJoker, The21, TheOne} from './Card';
import {getEarnings} from './GameEvaluation';
import {CompletedTrick, PlayerId} from './GameState';

test('getEarnings scores tricks won by the bidder', () => {
  const biddingTeam = ['bidder'];
  const tricks = [
    newTrick(
      0,
      ['bidder', 'p1', 'p2', 'p3', 'p4'],
      'bidder',
      [Suit.Spade, RegValue.R],
      [Suit.Spade, RegValue._2],
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5]
    ),
  ];
  const bid = 40;
  const dog: Card[] = [];
  const earnings = getEarnings(biddingTeam, tricks, bid, dog);
  expect(earnings.pointsEarned).toBe(6.5);
  expect(earnings.bouts.length).toBe(0);
});

test('getEarnings scores tricks won by the partner', () => {
  const biddingTeam = ['bidder', 'partner'];
  const tricks = [
    newTrick(
      0,
      ['bidder', 'p1', 'p2', 'p3', 'partner'],
      'partner',
      [Suit.Spade, RegValue._1],
      [Suit.Spade, RegValue._2],
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue.R]
    ),
  ];
  const bid = 40;
  const dog: Card[] = [];
  const earnings = getEarnings(biddingTeam, tricks, bid, dog);
  expect(earnings.pointsEarned).toBe(6.5);
  expect(earnings.bouts.length).toBe(0);
});

test('getEarnings ignores tricks won by the opposition', () => {
  const biddingTeam = ['bidder', 'partner'];
  const tricks = [
    newTrick(
      0,
      ['bidder', 'p1', 'p2', 'p3', 'partner'],
      'partner',
      [Suit.Spade, RegValue._1],
      [Suit.Spade, RegValue._10],
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5]
    ),
  ];
  const bid = 40;
  const dog: Card[] = [];
  const earnings = getEarnings(biddingTeam, tricks, bid, dog);
  expect(earnings.pointsEarned).toBe(2.5);
  expect(earnings.bouts.length).toBe(0);
});

test('getEarnings adds the points in the dog when the bid is 10', () => {
  expectGetEarningsWithDog(
    10,
    [
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5],
    ],
    1.5,
    []
  );
});

test('getEarnings adds the points in the dog when the bid is 20', () => {
  expectGetEarningsWithDog(
    20,
    [
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5],
    ],
    1.5,
    []
  );
});

test('getEarnings adds the points in the dog when the bid is 40', () => {
  expectGetEarningsWithDog(
    40,
    [
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5],
    ],
    1.5,
    []
  );
});

test('getEarnings adds the points in the dog when the bid is 80', () => {
  expectGetEarningsWithDog(80, [TheOne, The21, TheJoker], 13.5, [
    TheOne,
    The21,
    TheJoker,
  ]);
});

test('getEarnings adds the points in the dog when the bid is 160', () => {
  expectGetEarningsWithDog(160, [TheOne, The21, TheJoker], 0, []);
});

test('getEarnings includes bouts from tricks', () => {
  const biddingTeam = ['bidder'];
  const tricks = [
    newTrick(
      0,
      ['bidder', 'p1', 'p2', 'p3', 'p4'],
      'bidder',
      The21,
      [Suit.Spade, RegValue._2],
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5]
    ),
  ];
  const bid = 40;
  const dog: Card[] = [];
  const earnings = getEarnings(biddingTeam, tricks, bid, dog);
  expect(earnings.pointsEarned).toBe(6.5);
  expect(earnings.bouts).toStrictEqual([The21]);
});

test('getEarnings includes bouts from joker exchange', () => {
  const biddingTeam = ['bidder'];
  const bid = 80;
  const tricks = [
    newTrick(
      0,
      ['bidder', 'p1', 'p2', 'p3', 'p4'],
      'bidder',
      [Suit.Spade, RegValue.R],
      [Suit.Spade, RegValue._2],
      [Suit.Spade, RegValue._3],
      [Suit.Spade, RegValue._4],
      [Suit.Spade, RegValue._5]
    ),
    newTrick(
      1,
      ['bidder', 'p1', 'p2', 'p3', 'p4'],
      'p1',
      TheJoker,
      [Suit.Heart, RegValue.R],
      [Suit.Heart, RegValue._3],
      [Suit.Heart, RegValue._4],
      [Suit.Heart, RegValue._5]
    ),
  ];
  const dog: Card[] = [];
  const jokerExchange = {player: 'bidder', owed_to: 'p1'};
  const earnings = getEarnings(biddingTeam, tricks, bid, dog, jokerExchange);
  expect(earnings.pointsEarned).toBe(10.5);
  expect(earnings.bouts).toStrictEqual([TheJoker]);
});

function expectGetEarningsWithDog(
  bid: number,
  dog: Card[],
  expectedPoints: number,
  expectedBouts: Card[]
) {
  const biddingTeam = ['bidder'];
  const tricks: CompletedTrick[] = [];
  const earnings = getEarnings(biddingTeam, tricks, bid, dog);
  expect(earnings.pointsEarned).toBe(expectedPoints);
  expect(earnings.bouts).toStrictEqual(expectedBouts);
}

function newTrick(
  trick_num: number,
  players: PlayerId[],
  winner: PlayerId,
  ...cards: Card[]
): CompletedTrick {
  return {
    trick_num,
    cards,
    players,
    winner,
  };
}
