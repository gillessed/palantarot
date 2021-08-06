import {Card, RegValue, Suit} from '../../../../server/play/model/Card';
import {ClientGame} from '../../../services/room/ClientGame';
import {getAllowedPartnerCalls} from './AllowedPartnerCalls';

test('Can only call kings with less than 4 kings', () => {
  const hand: Card[] = [
    [Suit.Club, 4],
    [Suit.Club, 5],
    [Suit.Club, 6],
    [Suit.Club, 7],
    [Suit.Diamond, 1],
    [Suit.Diamond, 2],
    [Suit.Diamond, 3],
    [Suit.Heart, 4],
    [Suit.Heart, 5],
    [Suit.Heart, 6],
    [Suit.Heart, 8],
    [Suit.Spade, 1],
    [Suit.Spade, 3],
    [Suit.Spade, 5],
    [Suit.Spade, 7],
  ];
  const game = {playState: {hand}} as ClientGame;
  const {canPickD, canPickC, canPickV} = getAllowedPartnerCalls(game);
  expect(canPickD).toBe(false);
  expect(canPickC).toBe(false);
  expect(canPickV).toBe(false);
});

test('Can call kings and queens with 4 kings', () => {
  const hand: Card[] = [
    [Suit.Club, 4],
    [Suit.Club, 5],
    [Suit.Club, 6],
    [Suit.Club, RegValue.R],
    [Suit.Diamond, 1],
    [Suit.Diamond, 2],
    [Suit.Diamond, RegValue.R],
    [Suit.Heart, 4],
    [Suit.Heart, 5],
    [Suit.Heart, 6],
    [Suit.Heart, RegValue.R],
    [Suit.Spade, 1],
    [Suit.Spade, 3],
    [Suit.Spade, 5],
    [Suit.Spade, RegValue.R],
  ];
  const game = {playState: {hand}} as ClientGame;
  const {canPickD, canPickC, canPickV} = getAllowedPartnerCalls(game);
  expect(canPickD).toBe(true);
  expect(canPickC).toBe(false);
  expect(canPickV).toBe(false);
});

test('Can call Cs with 4 queens', () => {
  const hand: Card[] = [
    [Suit.Club, 4],
    [Suit.Club, 5],
    [Suit.Club, RegValue.D],
    [Suit.Club, RegValue.R],
    [Suit.Diamond, 1],
    [Suit.Diamond, RegValue.D],
    [Suit.Diamond, RegValue.R],
    [Suit.Heart, 4],
    [Suit.Heart, 5],
    [Suit.Heart, RegValue.D],
    [Suit.Heart, RegValue.R],
    [Suit.Spade, 1],
    [Suit.Spade, 3],
    [Suit.Spade, RegValue.D],
    [Suit.Spade, RegValue.R],
  ];
  const game = {playState: {hand}} as ClientGame;
  const {canPickD, canPickC, canPickV} = getAllowedPartnerCalls(game);
  expect(canPickD).toBe(true);
  expect(canPickC).toBe(true);
  expect(canPickV).toBe(false);
});

test('Can call Vs with 4 Cs', () => {
  const hand: Card[] = [
    [Suit.Club, 4],
    [Suit.Club, RegValue.C],
    [Suit.Club, RegValue.D],
    [Suit.Club, RegValue.R],
    [Suit.Diamond, RegValue.C],
    [Suit.Diamond, RegValue.D],
    [Suit.Diamond, RegValue.R],
    [Suit.Heart, 4],
    [Suit.Heart, RegValue.C],
    [Suit.Heart, RegValue.D],
    [Suit.Heart, RegValue.R],
    [Suit.Spade, 1],
    [Suit.Spade, RegValue.C],
    [Suit.Spade, RegValue.D],
    [Suit.Spade, RegValue.R],
  ];
  const game = {playState: {hand}} as ClientGame;
  const {canPickD, canPickC, canPickV} = getAllowedPartnerCalls(game);
  expect(canPickD).toBe(true);
  expect(canPickC).toBe(true);
  expect(canPickV).toBe(true);
});
