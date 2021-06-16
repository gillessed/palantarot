import { IconName } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { Card } from '../../../../server/play/model/Card';
import { Bid, BidValue, Call } from '../../../../server/play/model/GameEvents';
import { getPlayerName } from '../../../services/players/playerName';
import { isSpectatorModeObserver, SpectatorMode } from '../SpectatorMode';
import { CardHeight, CardWidth, getMaxHandWidth, getObserverClipHeight, HandCardPopup, PlayerTextHeight, PlayerTextMargin, TrickWidth } from './CardSpec';
import { CardSvg } from './CardSvg';
import { GradientIds } from './Gradients';
import { HandSvg } from './HandSvg';
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
    spectatorMode: SpectatorMode;
    hand?: Card[];
    playerCount: number;
  }

  export interface State {
    textWidth?: number;
  }

  export type ArrangementArgs = ArrangementProps & State;

  export type Props = ArrangementProps & OwnProps;
}

export interface TitleLayout {
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

const emptyLayout = (): TitleLayout => {
  return {
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
  };
}

const TopCardY = -CardHeight + 70;
const HorizontalX = CardWidth / 2;
const IconYOffset = 12;
const IconXDelta = IconSize.width + 8;

export class PlayerTitleSvg extends React.PureComponent<PlayerTitleSvg.Props, PlayerTitleSvg.State> {
  private textElement: SVGTextElement;
  public state: PlayerTitleSvg.State = {};

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
    const { svgWidth, svgHeight, player, showDealer, highlight, bid, hand, spectatorMode, playerCount } = this.props;
    const playerName = player ? `${getPlayerName(player)}` : 'Unknown Player';
    const layoutArgs: PlayerTitleSvg.ArrangementArgs = { ...this.props, ...this.state };
    const clipHeight = getObserverClipHeight(svgWidth, svgHeight, playerCount);
    const L = isSpectatorModeObserver(spectatorMode) ?
      getTitleLayoutForObserverMode(layoutArgs, playerCount, clipHeight ?? CardHeight) :
      getTitleLayout(layoutArgs);
    const textClasses = classNames('player-text unselectable',
      {
        'highlight': highlight,
        'plain': !highlight,
      },
    );
    const handLeft = L.bidx + 20;
    return (
      <g>
        {!hand && <CardSvg
          x={L.cardx}
          y={L.cardy}
          color={showDealer ? 'blue' : 'black'}
        />}
        {hand && <HandSvg
          left={L.cardx}
          top={L.cardy}
          right={svgWidth - PlayerTextMargin}
          cards={hand}
          clipHeight={clipHeight}
          alignment='left'
        />}
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

  private renderBid(bid: Bid, L: TitleLayout) {
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

  private renderIcons(L: TitleLayout) {
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
}

export function getTitleLayout(args: PlayerTitleSvg.ArrangementArgs): TitleLayout {
  const { svgWidth, svgHeight, side, position, text, textWidth } = args;
  const L = emptyLayout();
  if (side === 'top') {
    L.cardx = position - CardWidth / 2;
    L.cardy = TopCardY;
    L.texty = PlayerTextHeight + PlayerTextMargin + CardHeight + TopCardY;
    L.icony = L.texty - IconSize.width / 2 - 15;
    L.bidy = L.cardy + CardHeight + 110;
    L.bidx = position;
    L.bidAnchor = 'middle';
    L.icony = L.texty - IconSize.width / 2 - IconYOffset;
    if (text === 'before') {
      L.textx = L.cardx - PlayerTextMargin + CardWidth;
      L.textAnchor = 'end';
      L.iconx = textWidth !== undefined ? L.textx - textWidth - 10 - IconSize.width : L.iconx;
    } else {
      L.textx = L.cardx + PlayerTextMargin;
      L.textAnchor = 'start';
      L.iconx = textWidth !== undefined ? L.textx + textWidth + 10 : L.iconx;
    }
  } else if (side === 'left') {
    L.cardx = -CardWidth + HorizontalX;
    L.cardy = position;
    L.textAnchor = 'start';
    L.textx = PlayerTextMargin;
    L.iconx = textWidth !== undefined ? L.textx + textWidth + 10 : L.iconx;
    L.bidy = L.cardy + CardHeight / 2;
    L.bidx = HorizontalX + 30;
    L.bidAnchor = 'start';
    if (text === 'before') {
      L.texty = L.cardy - PlayerTextMargin;
    } else {
      L.texty = L.cardy + CardHeight + PlayerTextHeight + PlayerTextMargin;
    }
    L.icony = L.texty - IconSize.width / 2 - IconYOffset;
    L.iconx = textWidth !== undefined ? L.textx + textWidth + 10 : L.iconx;
  } else if (side === 'right') {
    L.cardx = svgWidth - HorizontalX;
    L.cardy = position;
    L.bidy = L.cardy + CardHeight / 2;
    L.bidx = L.cardx - 30;
    L.textx = svgWidth - PlayerTextMargin;
    L.textAnchor = 'end';
    L.iconx = textWidth !== undefined ? L.textx - textWidth - 10 - IconSize.width : L.iconx;
    L.bidAnchor = 'end';
    if (text === 'before') {
      L.texty = L.cardy - PlayerTextMargin;
    } else {
      L.texty = L.cardy + CardHeight + PlayerTextHeight + PlayerTextMargin;
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

export function getTitleLayoutForObserverMode(
  args: PlayerTitleSvg.ArrangementArgs,
  playerCount: number,
  clipHeight: number,
): TitleLayout {
  const { svgWidth, svgHeight, side, position, text, textWidth } = args;
  const L = emptyLayout();
  const maxHandWidth = getMaxHandWidth(playerCount);
  const maximumWidth = maxHandWidth + TrickWidth;

  if(maximumWidth > svgWidth) {
    L.cardx = TrickWidth;
  } else {
    L.cardx = (svgWidth - maximumWidth) / 2 + TrickWidth;
  }
  L.cardy = position;
  L.bidy = L.cardy + clipHeight / 2;
  L.bidx = L.cardx - 30;
  L.textx = L.cardx + 40;
  L.texty = L.cardy - PlayerTextMargin;
  L.textAnchor = 'start';
  L.iconx = L.textx - 10 - IconSize.width;
  L.icony = L.texty - IconSize.width / 2 - IconYOffset;
  L.iconxdelta = -IconXDelta;
  L.bidAnchor = 'end';

  return L;
}
