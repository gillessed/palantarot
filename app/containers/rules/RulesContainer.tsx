import { Classes } from "@blueprintjs/core";
import React from "react";
import { Card, RegSuit, RegValue, Suit, TrumpValue } from "../../../server/play/model/Card";
import { getCardUrl } from "../play/svg/CardSvg";
import "./RulesContainer.scss";

function buildSuit(suit: RegSuit) {
  const cards: Card[] = [];
  for (let i = 1; i <= 10; i++) {
    cards.push([suit, i]);
  }
  cards.push([suit, RegValue.V]);
  cards.push([suit, RegValue.C]);
  cards.push([suit, RegValue.D]);
  cards.push([suit, RegValue.R]);
  return cards;
}

function buildTrump() {
  const trump: Card[] = [];
  for (let i = 1; i <= 21; i++) {
    trump.push([Suit.Trump, i]);
  }
  return trump;
}

const Clubs: Card[] = buildSuit(Suit.Club);
const Diamonds: Card[] = buildSuit(Suit.Diamond);
const Hearts: Card[] = buildSuit(Suit.Heart);
const Spades: Card[] = buildSuit(Suit.Spade);
const Trump: Card[] = buildTrump();
const Joker: Card = [Suit.Trump, TrumpValue.Joker];

export class RulesContainer extends React.PureComponent {
  public render() {
    return (
      <div className="rules-container page-container">
        <h1 className={Classes.HEADING}>How to Play</h1>
        <p>
          French Tarot is a game with a long history and tradition. You can find the rules for standard french tarot{" "}
          <a href="https://en.wikipedia.org/wiki/French_Tarot">here</a>. However, we play with heavily modified house
          rules and so that will only serve you so well when playing with us.
        </p>

        <h3 className={Classes.HEADING}>The Deck</h3>

        <p>
          Tarot is played with a 78 card deck that has 5 suits: clubs, diamonds, hearts, spades, and a separate trump
          suit.
        </p>

        <div className="card-display">
          <div className="card-with-subtitle">
            <img src={getCardUrl(Clubs[4])} />
            <h6 className={Classes.HEADING}>Clubs</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Diamonds[0])} />
            <h6 className={Classes.HEADING}>Diamonds</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[11])} />
            <h6 className={Classes.HEADING}>Hearts</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Spades[6])} />
            <h6 className={Classes.HEADING}>Spades</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Trump[14])} />
            <h6 className={Classes.HEADING}>Trump</h6>
          </div>
        </div>

        <p>
          Each of the regular suits has 14 cards. They consist of the numbers 1 through 10, and then four facecards
          which are a little different that the ones in a standard deck. Here are all of the clubs listed in order of
          lowest to highest.
        </p>

        <div className="card-display">
          {Clubs.map((card, i) => (
            <img key={i} src={getCardUrl(card)} />
          ))}
        </div>

        <p>The trump range from 1 to 21, and also include a special card, the Joker.</p>

        <div className="card-display">
          {Trump.map((card, i) => (
            <img key={i} src={getCardUrl(card)} />
          ))}
        </div>

        <p>There is also one special card called the Joker, which has a unique set of rules.</p>

        <div className="card-display">
          <img src={getCardUrl(Joker)} />
        </div>

        <h3 className={Classes.HEADING}>Dealing</h3>

        <p>
          Tarot is commonly played with 5 players, and 5 does not evenly divide into 78. Instead, 15 cards are dealt to
          each player, and 3 cards are chosen at random to put into the center of the table during the deal. This is
          called the dog, and will be explained in detail later.
        </p>

        <p>
          In person, the deck is traditionally left fairly unshuffled and cards are dealt 3 at a time in hopes of
          getting more variance in the hand strengths.
        </p>

        <h3 className={Classes.HEADING}>Play Phase and Tricks</h3>

        <p>
          Tarot is a trick taking game, so it's somewhat similar to Hearts, Spades, Euchre and Bridge. There are two
          phases to the game. The first is the bidding phase, and the second is the playing phase. The playing phase is
          somewhat easier to explain, so we'll start there.
        </p>

        <p>
          During the play phase, the cards are play in groups called tricks. Those familiar with trick taking games can
          skip this part. A trick consists of 1 card played by each player, and so there will be 15 tricks every game.
        </p>

        <p>
          When there are no cards played on the table, the leader must play the first card of the trick. The leader is
          determined by who won the last trick, excepting the first trick, where the leader is the dealer. The leader of
          the trick is free to play any card from their hand, unless it is the first trick of the game. Once the first
          card is played, that determines the suit of the trick, and it is the next player's turn to play a card, in
          counter-clockwise order.
        </p>

        <p>
          When playing a card on a trick that already has cards, there are rules for what you are allowed to play.
          <span className="important-text">
            &nbsp;Note, these are different than most games, and should be read carefully.
          </span>
        </p>

        <ol>
          <li>If you have any cards in hand that match the suit of the trick, you must play one of them.</li>
          <li>
            If you have no cards in hand that match the suit of the trick, but you have trump cards in hand, you must
            play one of them.
          </li>
          <li>
            If you are forced to play trump on a trick, and that trick already has trump cards in it, you must beat the
            highest trump card if you can. If you cannot beat it, you can play any trump you want.
          </li>
          <li>If you are both out of the trick suit, and out of trump, you can play any card on the trick.</li>
        </ol>

        <p>
          Once each player has played once, the winner of the trick is determined. Trump are the strongest cards in the
          game, and so if a trick has any trump in it, the highest trump with win the trick. If there are no trump on a
          trick, the highest card matching the suit of the trick wins. Non-trump cards that don't match the suit of the
          trick are irrelevant and cannot win a trick.
        </p>

        <p>
          In person, once a player has won a trick, they will collect it and create a pile of all the cards of tricks
          they have won.
          <span className="important-text">
            &nbsp;Note, unlike other trick taking games, the number of tricks won is not important, and so the cards are
            usually just piled together. As tarot is a team game, you will also combine your winnings with your
            teammates' to make things easier once you know who your teammates are.
          </span>
        </p>

        <p>
          The playing phases continues until all 15 tricks have been played and at the point the game is over, and the
          winners of the rounds are determined.
        </p>

        <h3 className={Classes.HEADING}>Card Values</h3>

        <p>
          Each card in tarot has a point value, and winning a trick will give you the point values of all the cards in
          that trick. During the play phase, you and your team are trying to win as many points as possible.
        </p>

        <p>
          For non-trump Ccard, all non-face cards are worth 0.5 points. The face cards are worth more, as shown here.
        </p>

        <div className="card-display">
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[0])} />
            <h6 className={Classes.HEADING}>0.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[9])} />
            <h6 className={Classes.HEADING}>0.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[10])} />
            <h6 className={Classes.HEADING}>1.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[11])} />
            <h6 className={Classes.HEADING}>2.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[12])} />
            <h6 className={Classes.HEADING}>3.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Hearts[13])} />
            <h6 className={Classes.HEADING}>4.5</h6>
          </div>
        </div>

        <p>For trump, all trump except the 1 and the 21 are worth 0.5 points.</p>

        <div className="card-display">
          <div className="card-with-subtitle">
            <img src={getCardUrl(Trump[1])} />
            <h6 className={Classes.HEADING}>0.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Trump[10])} />
            <h6 className={Classes.HEADING}>0.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Trump[19])} />
            <h6 className={Classes.HEADING}>0.5</h6>
          </div>
        </div>

        <p>
          The remaining three cards, the 1, the 21 and the Joker, are called the
          <span className="important-text"> Bout </span> and are all worth 4.5 points.
        </p>

        <div className="card-display">
          <div className="card-with-subtitle">
            <img src={getCardUrl(Trump[0])} />
            <h6 className={Classes.HEADING}>4.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Trump[20])} />
            <h6 className={Classes.HEADING}>4.5</h6>
          </div>
          <div className="card-with-subtitle">
            <img src={getCardUrl(Joker)} />
            <h6 className={Classes.HEADING}>4.5</h6>
          </div>
        </div>

        <p>As such, the total number of points in the deck is 91.</p>

        <h3 className={Classes.HEADING}>Determing The Winners</h3>

        <p>
          When the play phase is finished, there will be two piles of cards. Each team should have their winnings and
          will begin counting how many points they have. While it is not necessary to count both since the counts have
          to sum to 91, it is commonly done in person to avoid errors.
        </p>

        <p>
          There will be two teams, the bidder (and his partner) and the opposition. The bidder must meet a certain
          threshold of points in his pile to be considered a winner for the round, but the threshold is not static.
        </p>

        <p>
          The threshold to win the round is determined by the number of Bout the bidder has in his pile. If the total
          number of points exceeds this threshold, then he has won the round. As a reminder, the bout are the 1, the 21
          and the Joker.
        </p>

        <ul>
          <li>
            <span className="important-text">3 Bout: </span>36 points
          </li>
          <li>
            <span className="important-text">2 Bout: </span>41 points
          </li>
          <li>
            <span className="important-text">1 Bout: </span>51 points
          </li>
          <li>
            <span className="important-text">0 Bout: </span>56 points
          </li>
        </ul>

        <p>
          This means that the fewer Bout you have, the more points you need to win the round. Because of this, and the
          fact that Bout are also worth 4.5 points each, means that they are the most valuable cards in the game.
        </p>

        <p>The most important goal of the play phase is to make sure you beat that treshold.</p>

        <p>
          Another imporant detail is that meeting the threshold counts as a win. The point total must be below it to
          count as a loss.
        </p>

        <h3 className={Classes.HEADING}>Bidding</h3>

        <p>
          Bidding works much the same way as other trick taking games, but there are a few nuances. During the bidding
          phase, starting with the dealer and moving counter-clockwise, each player makes a bid, which is either a
          number or a pass. The valid values to bid are 10, 20, 40, 80, 160. If someone has bid before you, you must bid
          higher, or pass. This means a bid of 160 effectively ends the bidding as no one else can bid higher.
        </p>

        <p>
          Bidding continues until all players but one have passed. That last player who bid is then considered the
          bidder moves on to a few things to setup the round.
        </p>

        <p>
          If you have previously bid, and the bidding comes back to you, you may choose to bid again, but if you pass,
          you can no longer again bid in this round.
        </p>

        <p>
          The incentive to become the bidder is driven by point. Whoever is the bidder stands to earn more points than
          the rest if he wins the round, but will be outnumbered by his opponents, and thus must have a stronger hand to
          generally stand a chance as the bidder. The payoff will be made more clear when we talk about scoring.
        </p>

        <p>
          The number of the bid has little mechanical influence on the game, but is instead generally a bid of
          confidence. It is more of a wager, as it is a large factor in how many points will be won or lost at the end
          of a round. With a stronger hand, you will want to bid higher as you are more likely to win than lose, and so
          you want to wager more.
        </p>

        <h3 className={Classes.HEADING}>Partners</h3>

        <p>
          Once the bidder has been determined, the bidder then decides who will be his partner. This is done by choosing
          one of the four kings. Whoever has that king in their hand is the partner, but this information stays hidden
          until the king is actually played.
        </p>

        <p>
          A bidder can be his own partner, in which case they will have no partner and all four other players will be on
          a team against them. This is generally something to be avoided, buy can be lucrative in the right situations.
          If a player has all four kings in their hand, they may instead opt to call a queen instead, and so on for
          chevaliers and valets, but this is quite rare.
        </p>

        <p>
          Above, it was mentioned that there are restrictions on what to lead for the first trick of the game. The
          player cannot lead the partner suit on the first round, unless they play the king. This is to prevent the
          partner from often being revealed on the first round.
        </p>

        <h5 className={Classes.HEADING}>Russian 20</h5>

        <p>
          There is one special bid we allow called the Russian 20. It is a signal bid which indicates some of the cards
          in your hand to other players. It has the same value as the 20 bid, and can be bid in place of a 20.
        </p>

        <p>
          A Russian 20 signals to other players that you have at least 2 kings and at least 1 bout in your hand. This
          means that bidder will have a good chance at calling you, and you have at least one strong card, and so it
          inventivizes other players to overbid you and call you on a hand you wouldn't normally be able to win on your
          own.
        </p>

        <h3 className={Classes.HEADING}>The Dog</h3>

        <p>
          Once the partner card has been chosen, the bidder then deals with the dog. What he does depends on the value
          of his bid. This is the only mechanical effect the bid number has on the game.
        </p>

        <h5 className={Classes.HEADING}>10, 20, 40</h5>

        <p>
          If the bidder bid 10, 20 or 40, the bidder will flip the dog, reveal it to everyone and then put it in their
          hand. Then they can select three cards to drop which will be part of their winnings automatically. Bidders
          generally use this to make their hands a little stronger.
        </p>

        <p>
          As a rule, you are not allowed to drop kings or trump, unless you only have those in hand, which to date has
          never happened.
        </p>

        <h5 className={Classes.HEADING}>80</h5>

        <p>
          If the the bidder bid 80, instead of looking at the dog and sorting it into his hand, he instead takes the dog
          and, while keeping it hidden, will add it to his pile of cards. They will count as the bidder's points at the
          end of the game. However, it is a little harder to win as you don't get to make your hand stronger by
          exchanging cards.
        </p>

        <h5 className={Classes.HEADING}>160</h5>

        <p>
          If the bidder bid 160, the cards stay hidden, but instead of going to the dealer, they will go to the
          opposition team, giving the bidder a points handicap. This is the most rewarding, but also most difficult bid
          to win.
        </p>

        <h3 className={Classes.HEADING}>Self-Call</h3>

        <p>
          As mentioned above, bidders can call themselves if they want to by choosing a king in their hand. However,
          they can also call themselves by chance if their king winds up in the dog. For 10, 20 and 40 bids, this
          information will be revealed right away, but in 80 and 160 bids, this will not be known until the end of the
          game.
        </p>

        <h3 className={Classes.HEADING}>Scoring</h3>

        <p>
          Once a round is over and the winner is determined, we determine how many points each player wins and loses.
          The first step is to calculate the score delta.
        </p>

        <span className="equation">Δ = bid amount + points over threshold + misc</span>

        <h5 className={Classes.HEADING}>Bid Amount</h5>

        <p>This is simply the amount the bidder bid, but should be negative if the bidder lost the round.</p>

        <h5 className={Classes.HEADING}>Points Over Threshold</h5>

        <p>
          In determining score, we calculate by how much the bidder exceeded or missed their threshold and then round it
          or down to the nearest 10 is the number is positive or negative respectively.
        </p>

        <h6 className={Classes.HEADING}>Points Over Threshold</h6>

        <p>
          If a bidder had 3 bout, and 52 points, their threshold was 36, so they exceeded it by 16, so the value for
          this is rounded up to 20.
        </p>

        <p>
          If a bidder had 2 bout, and 39.5 points, their threshold was 41, so they missed it by -1.5, so the value for
          this is rounded down to -10.
        </p>

        <h5 className={Classes.HEADING}>Misc</h5>

        <p>There are three things that fall under the category of misc, which are as follows.</p>

        <h6 className={Classes.HEADING}>One Last</h6>

        <p>TODO</p>

        <h6 className={Classes.HEADING}>Showing Trump</h6>

        <p>TODO</p>

        <h6 className={Classes.HEADING}>Slam</h6>

        <p>TODO</p>

        <h3 className={Classes.HEADING}>Final Tally</h3>

        <p>
          Once you have computed the score delta, you can then determine how much each player wins or loses. It is a
          zero sum-game, so the sum of all points exchanges should be zero.
        </p>

        <p>
          When the bidder has called a parter, and the game was 2 vs. 3, the bidder gets 2 * Δ. The partner receives Δ.
          Each of the 3 opposition player get -Δ.
        </p>

        <p>
          When the bidder has called himself, and the game was 1 vs. 4, the bidder gets 4 * Δ. Each of the 4 opposition
          player get -Δ.
        </p>
      </div>
    );
  }
}
