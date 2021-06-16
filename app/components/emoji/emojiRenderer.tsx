import { PopoverInteractionKind, Position, Tooltip } from '@blueprintjs/core';
import * as React from 'react';
import { Card, RegSuit, RegValue, Suit, TrumpSuit, TrumpValue } from "../../../server/play/model/Card";
import { getCardUrl } from "../../containers/play/svg/CardSvg";

interface Emoji {
  def: string;
  render: (key: number) => string | JSX.Element;
}

const Emojis: Emoji[] = [];

function getRender(value: RegValue | TrumpValue, suit: Suit) {
  return (key: number) => {
    const card = [suit, value] as Card;
    const url = getCardUrl(card);
    return (
      <Tooltip
        key={key} 
        interactionKind={PopoverInteractionKind.HOVER}
        content={<img src={url} width={110} height={150}/>}
        position={Position.LEFT}
      >
        <img src={url} width={22} height={30}/>
      </Tooltip>
    );
  };
}

function generateCardEmojis() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'V', 'C', 'D', 'R'] as RegValue[];
  for (const num of numbers) {
    const club: Emoji = {
      def: `c_${num}`.toLocaleLowerCase(),
      render: getRender(num, RegSuit.Club),
    };
    const diamond: Emoji = {
      def: `d_${num}`.toLocaleLowerCase(),
      render: getRender(num, RegSuit.Diamond),
    };
    const heart: Emoji = {
      def: `h_${num}`.toLocaleLowerCase(),
      render: getRender(num, RegSuit.Heart),
    };
    const spade: Emoji = {
      def: `s_${num}`.toLocaleLowerCase(),
      render: getRender(num, RegSuit.Spade),
    };
    Emojis.push(club, diamond, heart, spade);
  }
  for (let num = 1; num <= 21; num++) {
    const trump: Emoji = {
      def: `t_${num}`,
      render: getRender(num, TrumpSuit),
    };
    Emojis.push(trump);
  }
  const joker: Emoji = {
    def: `t_j`,
    render: getRender(TrumpValue.Joker, TrumpSuit),
  };
  Emojis.push(joker);
}
generateCardEmojis();

export function parseMessageForEmojis(text: string) {
  const pieces = [];
  let lastPiece = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) !== ':' || i >= text.length - 2) {
      continue;
    }
    let emojiMatch = null;
    for (const emoji of Emojis) {
      const { def } = emoji;
      if (text.substring(i + 1, i + 2 + def.length) === (def + ':')) {
        emojiMatch = emoji;
        break;
      }
    }
    if (!emojiMatch) {
      continue;
    }
    if (i !== lastPiece) {
      pieces.push(text.substring(lastPiece, i));
    }
    pieces.push(emojiMatch.render(i));
    i = i + 1 + emojiMatch.def.length;
    lastPiece = i + 1;
  }
  if (lastPiece !== text.length - 1) {
    pieces.push(text.substring(lastPiece, text.length));
  }
  return pieces;
}

export function getEmojiStringFromCard(card: Card): string {
  const [suit, value] = card;
  let suitString = '';
  switch (suit) {
    case RegSuit.Club: suitString = 'c'; break; 
    case RegSuit.Diamond: suitString = 'd'; break; 
    case RegSuit.Heart: suitString = 'h'; break; 
    case RegSuit.Spade: suitString = 's'; break; 
    case TrumpSuit: suitString = 't'; break; 
  }
  let valueString = '';
  if (suit === TrumpSuit) {
    if (value === TrumpValue.Joker) {
      valueString = 'j';
    } else {
      valueString = `${value}`;
    }
  } else {
    valueString = `${value}`.toLocaleLowerCase();
  }
  return `:${suitString}_${valueString}:`;
}
