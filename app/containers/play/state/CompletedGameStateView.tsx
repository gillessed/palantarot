import { Button, HTMLTable, Icon, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { Role } from '../../../../server/model/Result';
import { CompletedGameState, Outcome, PlayerId } from '../../../play/common';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { getPlayerName } from '../../../services/players/playerName';
import { ActionButton } from '../svg/ActionButton';
import { getCardUrl } from '../svg/CardSvg';
import { StatusOverlay } from '../svg/StatusOverlay';
import { TrickSvg } from '../svg/TrickSvg';
import './CompletedGameStateView.scss';
import { StateViewProps } from './StateViewProps';


type Props = StateViewProps;

interface State {
  scoreViewOpen: boolean;
}

type Result = {
  player: PlayerId;
  role: Role;
  points: number;
}
const InsetX = 300;

export class CompletedStateView extends React.PureComponent<Props, State> {
  public state: State = {
    scoreViewOpen: false,
  };

  public render() {
    const { width, height, game, players } = this.props;
    const { endState } = game.state;
    const { player } = game;
    const { scoreViewOpen } = this.state;
    const isParticipant = InGameSelectors.isParticipant(game);
    let text = 'The game is over. ';
    let won: boolean | null = null;
    if (endState) {
      if (endState.bidderWon) {
        won = player === endState.bidder || player === endState.partner;
      } else {
        won = !(player === endState.bidder || player === endState.partner);
      }
    }
    if (won === true) {
      text += 'You have won.';
    } else if (won === false) {
      text += 'You have lost.';
    }

    const buttony = Math.max(
      height * 0.85,
      height * 0.6 + 300);

    return (<g className='playing-state-view'>
      <StatusOverlay {...this.props} />
      <TrickSvg {...this.props} />
      {endState && isParticipant && <text
        className='completed-game-message'
        x={width / 2}
        y={buttony - 80}
        textAnchor='middle'
      >
        {text}
      </text>}
      {endState && <ActionButton
        x={width / 2}
        y={buttony}
        width={240}
        height={80}
        text='Show Score'
        onClick={this.openScoreView}
      />}
      {endState && scoreViewOpen && this.renderEndState(endState)}
      {/* TODO: (gcole) render other end state: all passes. */}
    </g>);
  }

  private renderEndState = (endState: CompletedGameState) => {
    const { width, height } = this.props;
    const InsetY = InsetX / width * height;
    const iw = Math.max(1200, width - 2 * InsetX);
    const ih = Math.max(600, height - 2 * InsetY);
    const ix = (width - iw) / 2;
    const iy = (height - ih) / 2;
    return (
      <foreignObject
        x={ix}
        y={iy}
        width={iw}
        height={ih}
      >
        <div className='score-view'>
          <Button
            className='close-button'
            intent={Intent.PRIMARY}
            icon={IconNames.SMALL_CROSS}
            onClick={this.closeScoreView}
          />
          {this.renderScoreTable(endState)}
          <div className='dog-and-results'>
            <div className='dog-view'>
              <span className='dog-text unselectable'>Dog</span>
              <div className='dog-cards'>
                {endState.dog.map((card) => {
                  return (
                    <img
                      key={`${card[0]}|${card[1]}`}
                      src={getCardUrl(card)}
                    />
                  );
                })}
              </div>
            </div>
            {this.renderResultsView(endState)}
          </div>
        </div>
      </foreignObject>
    );
  }

  private renderScoreTable(endState: CompletedGameState) {
    const thresholds = [56, 51, 41, 36];
    let oneLastPlayer: string | undefined;
    for (let i = 0; i < endState.players.length; i++) {
      if (endState.outcomes[i] && endState.outcomes[i].find((outcome) => outcome === Outcome.ONE_LAST)) {
        oneLastPlayer = endState.players[i];
      }
    }
    const oneLastPoints = oneLastPlayer === undefined ? 0
      : oneLastPlayer === endState.bidder ? 10
        : oneLastPlayer === endState.partner ? 10
          : -10;
    return (
      <HTMLTable
        bordered
        striped
        className='score-table'
      >
        <thead>
          <tr>
            <th></th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bid</td>
            <td>{endState.bid}</td>
          </tr>
          <tr>
            <td>Card Points</td>
            <td>{endState.pointsEarned} / 91</td>
          </tr>
          <tr>
            <td>Bout</td>
            <td>{endState.bouts.length}</td>
          </tr>
          <tr>
            <td>Threshold</td>
            <td>{thresholds[endState.bouts.length]}</td>
          </tr>
          <tr>
            <td>Threshold Points</td>
            <td>{getPointsEearned(endState.pointsEarned - thresholds[endState.bouts.length])}</td>
          </tr>
          <tr>
            <td>Showed</td>
            <td>{endState.shows.length * 10 * (endState.bidderWon ? 1 : -1)}</td>
          </tr>
          <tr>
            <td>One Last</td>
            <td>{oneLastPoints}</td>
          </tr>
          <tr>
            <td>Slam</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>Final Points Result</td>
            <td>{endState.pointsResult}</td>
          </tr>
        </tbody>
      </HTMLTable>
    );
  }

  private renderResultsView(state: CompletedGameState) {
    const { players } = this.props;
    const results: Result[] = [];
    const playerOrder: string[] = [state.bidder];
    const rest = new Set(state.players);
    rest.delete(state.bidder);
    const multiplier = state.players.length === 3 ? 2 :
      state.players.length === 4 ? 3 :
        state.players.length === 5 && state.partner !== state.bidder ? 2 :
          4;
    if (state.partner && state.partner !== state.bidder) {
      playerOrder.push(state.partner);
      rest.delete(state.partner);
    }
    playerOrder.push(...rest);
    for (const player of playerOrder) {
      const role = player === state.bidder ? Role.BIDDER :
        player === state.partner ? Role.PARTNER :
          Role.OPPOSITION;
      const points = role === Role.BIDDER ? multiplier * state.pointsResult :
        role === Role.PARTNER ? state.pointsResult :
          -state.pointsResult;
      results.push({
        player,
        role,
        points,
      });
    }
    return (
      <div className='results-view'>
        <div className='result-view-internal'>
          {results.map((result, index) => {
            const pointsClasses = classNames('points-earned unselectable', {
              'plus': result.points >= 0,
              'minus': result.points < 0,
            });
            const player = players.get(result.player);
            const playerName = getPlayerName(player);
            return (
              <React.Fragment key={index}>
                <div className='result-separator' key={`separator-${index}`} />
                <div className='player-result' key={`result-${index}`}>
                  {result.role === Role.BIDDER && <Icon
                    icon={IconNames.CROWN}
                    iconSize={30}
                    color='#FFC940'
                  />}
                  {result.role === Role.PARTNER && <Icon
                    icon={IconNames.PERSON}
                    iconSize={30}
                    color='#FFC940'
                  />}
                  {result.role === Role.OPPOSITION && <Icon
                    icon={IconNames.PEOPLE}
                    iconSize={30}
                    color='#C274C2'
                  />}
                  <span className='unselectable'>{playerName}</span>
                  <span className={pointsClasses}>{result.points}</span>
                </div>
              </React.Fragment >
            );
          })}
          <div className='result-separator' />
        </div>
      </div>
    );
  }

  private closeScoreView = () => {
    this.setState({
      scoreViewOpen: false,
    });
  }

  private openScoreView = () => {
    this.setState({
      scoreViewOpen: true,
    });
  }
}

function getPointsEearned(dif: number) {
  const negative = dif < 0;
  const x = Math.abs(dif) + 9.9;
  const y = x - x % 10;
  return negative ? -y : y;
}
