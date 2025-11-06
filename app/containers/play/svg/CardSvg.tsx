import classNames from "classnames";
import React from "react";
import { Card, Suit, TrumpValue } from "../../../../server/play/model/Card";
import { CardHeight, CardWidth } from "./CardSpec";
import "./CardSvg.scss";

interface Props {
  width?: number;
  height?: number;
  x: number;
  y: number;
  card?: Card;
  enlarge?: boolean;
  selectable?: boolean;
  selected?: boolean;
  dog?: boolean;
  color?: "black" | "blue" | "green" | "red";
  onClick?: (card: Card) => void;
  clipHeight?: number;
}

export const SuitMap = {
  [Suit.Trump]: "Trump",
  [Suit.Club]: "Club",
  [Suit.Diamond]: "Diamond",
  [Suit.Heart]: "Heart",
  [Suit.Spade]: "Spade",
};

interface State {
  hover: boolean;
}

interface OutlineLayout {
  ox: number;
  oy: number;
  ow: number;
  oh: number;
}

export function getCardText(card: Card) {
  const [suit, value] = card;
  let suitText = "";
  if (value === TrumpValue.Joker) {
    return "the joker";
  }
  switch (suit) {
    case Suit.Club:
      suitText = "clubs";
      break;
    case Suit.Diamond:
      suitText = "diamonds";
      break;
    case Suit.Heart:
      suitText = "hearts";
      break;
    case Suit.Spade:
      suitText = "spades";
      break;
    case Suit.Trump:
      suitText = "trump";
      break;
  }
  return `the ${value} of ${suitText}`;
}

export function getCardUrl(card: Card) {
  const [suit, number] = card;
  return `/static/images/cards/${SuitMap[suit]} ${number}.png`;
}

export const CardBackUrls = {
  Red: "/static/images/cards/Card Back Red.png",
  Green: "/static/images/cards/Card Back Green.png",
  Blue: "/static/images/cards/Card Back Blue.png",
  Black: "/static/images/cards/Card Back Black.png",
};

export class CardSvg extends React.PureComponent<Props> {
  public state: State = {
    hover: false,
  };

  public render() {
    const { card, x, y, width, height, selectable, selected, color, dog, clipHeight } = this.props;
    const { hover } = this.state;
    let link = "";
    if (card) {
      link = getCardUrl(card);
    } else {
      switch (color) {
        case "red":
          link = CardBackUrls.Red;
          break;
        case "green":
          link = CardBackUrls.Green;
          break;
        case "blue":
          link = CardBackUrls.Blue;
          break;
        case "black":
        default:
          link = CardBackUrls.Black;
      }
    }
    const w = width != null ? width : CardWidth;
    const h = height != null ? height : CardHeight;
    const cardClasses = classNames("card-image", {
      selectable: selectable,
      selected: selected,
    });
    const centerx = x + w / 2;
    const centery = y + h / 2;
    const outlineRadioX = 0.92;
    const outlineRadioY = 0.95;
    const L: OutlineLayout = {
      ox: centerx - (w * outlineRadioX) / 2,
      oy: centery - (h * outlineRadioY) / 2,
      ow: w * outlineRadioX,
      oh: h * outlineRadioY,
    };
    const clipPathId = `card-clip-path-[${x}]-[${y}]`;
    const outlineHeight = clipHeight ?? h * outlineRadioY;
    return (
      <g>
        {clipHeight != null && (
          <defs>
            <clipPath id={clipPathId}>
              <rect
                x={centerx - (w * outlineRadioX) / 2}
                y={centery - (h * outlineRadioY) / 2}
                width={w * outlineRadioX}
                height={clipHeight}
              />
            </clipPath>
          </defs>
        )}
        <image
          className={cardClasses}
          width={w}
          height={h}
          x={x}
          y={y}
          xlinkHref={link}
          onClick={this.onClick}
          onMouseEnter={this.handleMouseOver}
          onMouseLeave={this.handleMouseExit}
          clipPath={`url(#${clipPathId})`}
        />
        {dog && this.renderOutline("dog-card-outline", L)}
        {selectable && hover && (
          <rect
            pointerEvents="none"
            className="card-hover-outline"
            x={centerx - (w * outlineRadioX) / 2}
            y={centery - (h * outlineRadioY) / 2}
            rx={8}
            width={w * outlineRadioX}
            height={outlineHeight}
          />
        )}
        {selected && (
          <rect
            pointerEvents="none"
            className="card-outline"
            x={centerx - (w * outlineRadioX) / 2}
            y={centery - (h * outlineRadioY) / 2}
            rx={8}
            width={w * outlineRadioX}
            height={outlineHeight}
          />
        )}
      </g>
    );
  }

  private renderOutline(classes: string, L: OutlineLayout) {
    return <rect pointerEvents="none" className={classes} x={L.ox} y={L.oy} rx={8} width={L.ow} height={L.oh} />;
  }

  private onClick = () => {
    const { card, onClick } = this.props;
    if (onClick && card) {
      onClick(card);
    }
  };

  private handleMouseOver = () => {
    this.setState({ hover: true });
  };

  private handleMouseExit = () => {
    this.setState({ hover: false });
  };
}
