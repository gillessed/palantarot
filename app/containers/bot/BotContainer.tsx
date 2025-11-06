import { Button, Dialog } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { NewPlayer, Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { getAdminPassword } from "../../admin";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import { Palantoaster, TIntent } from "../../components/toaster/Toaster";
import { SagaRegistration } from "../../sagaProvider";
import { addNewPlayerActions } from "../../services/addPlayer";
import { Dispatchers } from "../../services/dispatchers";
import { playersLoader, PlayersSelectors } from "../../services/players";
import { SagaListener } from "../../services/sagaListener";
import { loadContainer } from "../LoadingContainer";
import { BotCard } from "./BotCard";
import "./BotContainer.scss";

interface Props {
  players: Map<PlayerId, Player>;
  dispatchers: Dispatchers;
  sagas: SagaRegistration;
}

interface State {
  addBotDialogOpen: boolean;
}

class BotContainerInternal extends React.PureComponent<Props, State> {
  public state: State = {
    addBotDialogOpen: false,
  };

  private botCreatedListener: SagaListener<Player> = {
    actionType: addNewPlayerActions.success,
    callback: (newPlayer: Player) => {
      Palantoaster.show({
        message: "Added bot",
        intent: TIntent.SUCCESS,
      });
    },
  };
  private botErrorListener: SagaListener<Error> = {
    actionType: addNewPlayerActions.error,
    callback: (error) => {
      console.error(error);
      Palantoaster.show({
        message: "Error saving bot",
        intent: TIntent.DANGER,
      });
    },
  };

  public componentWillMount() {
    this.props.sagas.register(this.botCreatedListener);
    this.props.sagas.register(this.botErrorListener);
  }

  public componentWillUnmount() {
    this.props.sagas.unregister(this.botCreatedListener);
    this.props.sagas.unregister(this.botErrorListener);
  }

  public render() {
    const bots = PlayersSelectors.getBots(this.props.players);
    return (
      <div className="bot-container page-container">
        {this.renderDialog()}
        <div className="title bot-header">
          <h1 className="bp3-heading">Tarot Bots</h1>
        </div>

        {getAdminPassword() != null && <Button icon={IconNames.ADD} text="Create new bot" onClick={this.openDialog} />}

        <div className="bot-content">
          {bots.map((bot) => {
            return <BotCard key={bot.id} bot={bot} />;
          })}
        </div>
      </div>
    );
  }

  private renderDialog() {
    return (
      <Dialog icon={IconNames.ADD} isOpen={this.state.addBotDialogOpen} onClose={this.closeDialog} title="Add Bot">
        <div className="bp3-dialog-body">
          <AddPlayerForm isBot onSubmit={this.onAddNewPlayer} />
        </div>
      </Dialog>
    );
  }

  private onAddNewPlayer = (newPlayer: NewPlayer) => {
    this.props.dispatchers.addPlayer.request({ newPlayer, source: "bot" });
    this.closeDialog();
  };

  private closeDialog = () => this.setState({ addBotDialogOpen: false });

  private openDialog = () => this.setState({ addBotDialogOpen: true });
}

export const BotContainer = loadContainer({
  players: playersLoader,
})(BotContainerInternal);
