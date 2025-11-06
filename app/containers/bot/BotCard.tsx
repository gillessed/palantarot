import { Card, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Player } from "../../../server/model/Player";
import "./BotCard.scss";
import "./BotContainer.scss";

interface Props {
  bot: Player;
}
export class BotCard extends React.PureComponent<Props> {
  public render() {
    const { firstName, lastName, botType } = this.props.bot;
    return (
      <Card className="bot-card">
        <div className="bot-card-content">
          <div className="bot-icon">
            <Icon icon={IconNames.CALCULATOR} iconSize={40} />
          </div>
          <div className="bot-card-details">
            <div className="bot-name">
              {firstName} {lastName}
            </div>
            <div className="bot-type">{botType}</div>
          </div>
        </div>
      </Card>
    );
  }
}
