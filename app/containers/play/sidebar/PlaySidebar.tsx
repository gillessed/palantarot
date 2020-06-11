import { Button, ButtonGroup, Icon, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import history from '../../../history';
import { ActionType, BidAction, BiddingCompletedTransition, BidValue, Call, CallPartnerAction, PlayerId, TransitionType } from '../../../play/common';
import { StaticRoutes } from '../../../routes';
import { Dispatchers } from '../../../services/dispatchers';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState, SidebarEvent } from '../../../services/ingame/InGameTypes';
import { CardBackUrls, getCardText } from '../svg/CardSvg';
import { GameEventMessage } from './GameEventMessage';
import { PlayMessage } from './PlayMessage';
import { PlayMessageInput } from './PlayMessageInput';
import './PlaySidebar.scss';

interface Props {
  playerId: string;
  players: Map<string, Player>;
  game: InGameState;
  dispatchers: Dispatchers;
}

interface State {
  showMessages: boolean;
}

export const EventsToDisplay: Array<ActionType | TransitionType | 'error'> = [
  'message',
  'bid',
  'bidding_completed',
  'call_partner',
];

export class PlaySidebar extends React.PureComponent<Props, State> {
  public state: State = {
    showMessages: true,
  };
  private messageDiv: HTMLDivElement;

  public componentWillReceiveProps(nextProps: Props) {
    const currentEvents = this.props.game.events.filter((event) => EventsToDisplay.indexOf(event.type) >= 0);
    const nextEvents = nextProps.game.events.filter((event) => EventsToDisplay.indexOf(event.type) >= 0);
    if (this.messageDiv && currentEvents.length < nextEvents.length) {
      this.messageDiv.scrollTop = this.messageDiv.scrollHeight;
    }
  }

  public render() {
    const { showMessages } = this.state;
    return (
      <div className='play-sidebar'>
        <div className='sidebar-header'>
          <img
            className='header-image'
            src={CardBackUrls.Blue}
          />
          <Button
            className='lobby-button'
            icon={IconNames.UNDO}
            onClick={this.returnToLobby}
            intent={Intent.PRIMARY}
          />
        </div>
        <ButtonGroup className='toggle-button-group bp3-dark' fill>
          <Button
            className='toggle-messages-button'
            icon={IconNames.PROPERTIES}
            active={showMessages}
            onClick={this.setShowMessages}
          />
          <Button
            className='toggle-players-button'
            icon={IconNames.PEOPLE}
            active={!showMessages}
            onClick={this.setShowPlayers}
          />
        </ButtonGroup>
        <div className='list-container' ref={this.setRef}>
          {showMessages && this.renderMessages()}
          {!showMessages && this.renderPlayers()}
        </div>
        <PlayMessageInput
          player={this.props.game.player}
          dispatchers={this.props.dispatchers}
        />
      </div>
    );
  }

  private setRef = (element: HTMLDivElement) => {
    if (element) {
      this.messageDiv = element;
    }
  }

  private setShowMessages = () => {
    this.setState({ showMessages: true });
  }

  private renderMessages() {
    const sidebarEvents = InGameSelectors.getEventsForSidebar(this.props.game);
    return sidebarEvents.map(this.renderMessage);
  }

  private renderMessage = (event: SidebarEvent, index: number) => {
    const { players, game } = this.props;
    switch (event.type) {
      case 'message_group':
        return (
          <PlayMessage
            game={game}
            message={event}
            players={players}
            key={index}
          />
        );
      case 'bid':
        const bidEvent = event as BidAction;
        const bidRussian = (bidEvent.calls?.indexOf(Call.RUSSIAN) ?? -1) >= 0;
        const bidMessage = bidEvent.bid === BidValue.PASS
          ? `${bidEvent.player} passed`
          : `${bidEvent.player} bid ${bidRussian ? 'russian 20' : bidEvent.bid}`;
        return <GameEventMessage key={index} message={bidMessage} />;
      case 'bidding_completed':
        const biddingCompletedTransition = event as BiddingCompletedTransition;
        const biddingCompletedWinner = biddingCompletedTransition.winning_bid.player;
        const biddingCompletedMessage = `${biddingCompletedWinner} has won the bid`
        return <GameEventMessage key={index} message={biddingCompletedMessage} />;
      case 'call_partner':
        const callEvent = event as CallPartnerAction;
        const callMessage = `${callEvent.player} has called ${getCardText(callEvent.card)}`
        return <GameEventMessage key={index} message={callMessage} />;
      default: return null;
    }
  }

  private setShowPlayers = () => {
    this.setState({ showMessages: false });
  }

  private renderPlayers() {
    return this.props.game.state.inChat.map(this.renderPlayer);
  }

  private renderPlayer = (player: PlayerId) => {
    const { game } = this.props;
    const isParticipant = game.state.playerOrder.indexOf(player) >= 0;
    const isYou = game.player === player;
    return (
      <div key={player} className='player-row'>
        <Icon
          icon={isParticipant ? IconNames.PERSON : IconNames.EYE_OPEN}
          color={isYou ? '#0F9960' : isParticipant ? '#137CBD' : '#F5F8FA'}
        />
        <span className='player-name unselectable'>{player} {isYou && ' (You)'}</span>
      </div>
    );
  }

  private returnToLobby = () => {
    history.push(StaticRoutes.lobby());
  }
}
