import { IconName } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Bid, BidValue, Call } from '../../../play/common';
import { getPlayerName } from '../../../services/players/playerName';
import { CardHeight, CardWidth, HandCardPopup } from './CardSpec';
import { CardSvg } from './CardSvg';
import { GradientIds } from './Gradients';
import { IconSize } from './IconSizes';
import './PlayerTitleSvg.scss';
import { SvgBlueprintIcon } from './SvgBlueprintIcon';

export namespace PlayerTitleSvg {
  export interface ArrangementProps {
    svgWidth: number;
    svgHeight: number;
    side: 'left' | 'top' | 'right' | 'bottom';
    position: number;
    text: 'before' | 'after';
  }

  export interface OwnProps {
    player?: Player;
    showReady?: boolean;
    showUnready?: boolean;
    showCrown?: boolean;
    showDealer?: boolean;
    showPerson?: boolean;
    highlight?: boolean;
    bid?: Bid;
  }

  export type Props = ArrangementProps & OwnProps;
}

interface Layout {
  cardx: number;
  cardy: number;
  textx: number;
  texty: number;
  textAnchor: string;
  iconx: number;
  icony: number;
  iconxdelta: number;
  bidx: number;
  bidy: number;
  bidAnchor: string;
}

interface State {
  textWidth?: number;
}

const TopCardY = -CardHeight + 70;
const HorizontalX = CardWidth / 2;
const TextMargin = 10;
const TextHeight = 28;
const IconYOffset = 12;
const IconXDelta = IconSize.width + 8;

export class PlayerTitleSvg extends React.PureComponent<PlayerTitleSvg.Props, State> {
  private textElement: SVGTextElement;
  public state: State = {};

  public componentWillReceiveProps(nextProps: PlayerTitleSvg.Props) {
    if (this.props.player !== nextProps.player) {
      setTimeout(() => {
        if (this.textElement) {
          this.setState({ textWidth: this.textElement.getComputedTextLength() });
        }
      }, 0);
    }
  }

  public render() {
    const { player, showDealer, highlight, bid } = this.props;
    const playerName = player ? `${getPlayerName(player)}` : 'Unknown Player';
    const L = this.getLayout();
    const textClasses = classNames('player-text unselectable',
      {
        'highlight': highlight,
        'plain': !highlight,
      },
    );
    return (
      <g>
        <CardSvg
          x={L.cardx}
          y={L.cardy}
          color={showDealer ? 'blue' : 'black'}
        />
        <text
          ref={this.setTextRef}
          className={textClasses}
          x={L.textx}
          y={L.texty}
          textAnchor={L.textAnchor}
        >
          {playerName}
        </text>
        {bid && this.renderBid(bid, L)}
        {this.renderIcons(L)}
      </g>
    );
  }

  private renderBid(bid: Bid, L: Layout) {
    const fillId = bid.bid === BidValue.PASS ? GradientIds.PassText : GradientIds.BidText;
    const text = bid.bid === BidValue.PASS ? 'PASS' :
      (bid.bid === BidValue.TWENTY && bid.calls.indexOf(Call.RUSSIAN) >= 0) ? 'R 20' :
        `${bid.bid}`;
    return (
      <text
        className='player-bid unselectable'
        x={L.bidx}
        y={L.bidy}
        textAnchor={L.bidAnchor}
        alignmentBaseline='central'
        fill={`url(#${fillId})`}
      >
        {text}
      </text>
    );
  }

  private renderIcons(L: Layout) {
    const { showReady, showUnready, showCrown, showPerson } = this.props;
    const { textWidth } = this.state;
    if (textWidth === undefined) {
      return;
    }
    const icons: Array<{ icon: IconName, fill: string }> = [];
    if (showReady) {
      icons.push({ icon: IconNames.TICK, fill: '#62D96B' });
    }
    if (showUnready) {
      icons.push({ icon: IconNames.CROSS, fill: '#D13913' });
    }
    if (showCrown) {
      icons.push({ icon: IconNames.CROWN, fill: `url(#${GradientIds.Crown})` });
    }
    if (showPerson) {
      icons.push({ icon: IconNames.PERSON, fill: `url(#${GradientIds.Crown})` });
    }
    return (
      <g>
        {icons.map((iconDef, index) => {
          return (
            <SvgBlueprintIcon
              key={index}
              x={L.iconx + L.iconxdelta * index}
              y={L.icony}
              icon={iconDef.icon}
              fill={iconDef.fill}
            />
          );
        })}
      </g>
    )
  }

  private setTextRef = (textElement?: SVGTextElement | null) => {
    if (textElement) {
      this.textElement = textElement;
      this.setState({ textWidth: textElement.getComputedTextLength() });
    }
  }

  private getLayout() {
    const { svgWidth, svgHeight, side, position, text } = this.props;
    const { textWidth } = this.state;
    const L: Layout = {
      cardx: 0,
      cardy: 0,
      textx: 0,
      texty: 0,
      textAnchor: 'auto',
      iconx: 100000,
      icony: 0,
      iconxdelta: 0,
      bidx: 100000,
      bidy: 0,
      bidAnchor: 'auto',
    }
    if (side === 'top') {
      L.cardx = position - CardWidth / 2;
      L.cardy = TopCardY;
      L.texty = TextHeight + TextMargin + CardHeight + TopCardY;
      L.icony = L.texty - IconSize.width / 2 - 15;
      L.bidy = L.cardy + CardHeight + 110;
      L.bidx = position;
      L.bidAnchor = 'middle';
      L.icony = L.texty - IconSize.width / 2 - IconYOffset;
      if (text === 'before') {
        L.textx = L.cardx - TextMargin + CardWidth;
        L.textAnchor = 'end';
        L.iconx = textWidth !== undefined ? L.textx - textWidth - 10 - IconSize.width : L.iconx;
      } else {
        L.textx = L.cardx + TextMargin;
        L.textAnchor = 'start';
        L.iconx = textWidth !== undefined ? L.textx + textWidth + 10 : L.iconx;
      }
    } else if (side === 'left') {
      L.cardx = -CardWidth + HorizontalX;
      L.cardy = position;
      L.textAnchor = 'start';
      L.textx = TextMargin;
      L.iconx = textWidth !== undefined ? L.textx + textWidth + 10 : L.iconx;
      L.bidy = L.cardy + CardHeight / 2;
      L.bidx = HorizontalX + 30;
      L.bidAnchor = 'start';
      if (text === 'before') {
        L.texty = L.cardy - TextMargin;
      } else {
        L.texty = L.cardy + CardHeight + TextHeight + TextMargin;
      }
      L.icony = L.texty - IconSize.width / 2 - IconYOffset;
      L.iconx = textWidth !== undefined ? L.textx + textWidth + 10 : L.iconx;
    } else if (side === 'right') {
      L.cardx = svgWidth - HorizontalX;
      L.cardy = position;
      L.textAnchor = 'end';
      L.textx = svgWidth - TextMargin;
      L.iconx = textWidth !== undefined ? L.textx - textWidth - 10 - IconSize.width : L.iconx;
      L.bidy = L.cardy + CardHeight / 2;
      L.bidx = L.cardx - 30;
      L.bidAnchor = 'end';
      if (text === 'before') {
        L.texty = L.cardy - TextMargin;
      } else {
        L.texty = L.cardy + CardHeight + TextHeight + TextMargin;
      }
      L.icony = L.texty - IconSize.width / 2 - IconYOffset;
    } else if (side === 'bottom') {
      L.cardx = svgWidth - CardWidth - 50;
      L.cardy = svgHeight - HandCardPopup;
      L.textx = svgWidth - 50;
      L.texty = svgHeight - HandCardPopup - 10;
      L.textAnchor = 'end';
      L.icony = svgHeight - HandCardPopup - 10 - IconSize.height / 2 - 15;
      L.bidy = svgHeight - HandCardPopup - 80;
      L.bidAnchor = 'end';
      if (textWidth !== undefined) {
        L.iconx = svgWidth - 50 - textWidth - IconSize.width - 10;
        L.bidx = svgWidth - 50 - textWidth - 80;
      }
    }
    if (text === 'before') {
      L.iconxdelta = -IconXDelta;
    } else {
      L.iconxdelta = IconXDelta;
    }
    return L;
  }
}
