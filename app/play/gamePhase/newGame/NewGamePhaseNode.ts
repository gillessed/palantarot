import type {
  EnterGameAction,
  LeaveGameAction,
  PlayerReadyAction,
  PlayerUnreadyAction,
} from "../../../../server/play/model/GameEvents";
import type { PlayerId } from "../../../../server/play/model/GameState";
import type { ClientGame } from "../../../../shared/types/ClientGameTypes";
import { RectNode } from "../../../sceneGraph/nodes/2d/RectNode";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import {
  SideCardNode,
  SideCardPositionLayout,
} from "../../components/SideCardNode";
import { NewGameNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { EmptyRowNode } from "./EmptyRowNode";
import { JoinLeaveButton } from "./JoinLeaveButton";
import { PlayerRowHeight, PlayerRowNode } from "./PlayerRowNode";

const RowGap = 15;
const PanelPadding = 50;
const ButtonRowHeight = 40;
const RowHeight = PlayerRowHeight;
const PanelHeight =
  5 * RowHeight + 4 * RowGap + 2 * PanelPadding + ButtonRowHeight;

type MaybePlayerId = PlayerId | undefined;

export class NewGamePhaseNode extends TwoDNode<PlaySceneContext> {
  private playerCount = 0;
  private playerOrder: [
    MaybePlayerId,
    MaybePlayerId,
    MaybePlayerId,
    MaybePlayerId,
    MaybePlayerId
  ] = [undefined, undefined, undefined, undefined, undefined];
  private sideCardNodes: SideCardNode[] = [];
  private playerInfoNodes: Map<PlayerId, PlayerRowNode>;
  private playerListNode: TwoDNode<PlaySceneContext>;
  private rowBackgroundNodes: TwoDNode<PlaySceneContext>[] = [];
  public joinLeaveButton = new JoinLeaveButton();

  constructor() {
    super(NewGameNodeId);

    this.playerListNode = new TwoDNode(`${NewGameNodeId}-list`);
    this.addChild(this.playerListNode);

    const backgroundRect = new RectNode<PlaySceneContext>(
      `${NewGameNodeId}-background-rect`
    );
    backgroundRect.theme = {
      backgroundColor: "#257735",
      borderRadius: 25,
      borderColor: "rgba(0, 0, 0, 0.3)",
      borderWidth: 3,
    };
    backgroundRect.width = 420;
    backgroundRect.height = PanelHeight;
    this.playerListNode.addChild(backgroundRect);

    this.playerInfoNodes = new Map();
    let y = -PanelHeight / 2 + PanelPadding + PlayerRowHeight / 2;
    for (let i = 0; i < 5; i++) {
      const emptyRowNode = new EmptyRowNode(`${NewGameNodeId}-empty-${i}`);
      emptyRowNode.offset[1] = y;
      y += RowHeight + RowGap;
      this.rowBackgroundNodes.push(emptyRowNode);
      this.playerListNode.addChild(emptyRowNode);
    }

    this.addChild(this.joinLeaveButton);
  }

  public setToGameState = (state: ClientGame) => {
    if (state.gamePhase !== "new_game") {
      throw Error("Updating new game node with not new game state");
    }

    for (let i = 0; i < 5; i++) {
      const playerId = state.playerOrder[i];
      if (playerId != null) {
        this.playerOrder[i] = playerId;
        this.addPlayerInfoNode(playerId);
        const isReady = state.readiedPlayers.has(playerId);
        if (isReady) {
          this.playerInfoNodes.get(playerId)!.setReady(isReady);
        }
        if (playerId === this.container?.context.playerId) {
          this.joinLeaveButton.setInGame(true);
          this.joinLeaveButton.setReady(isReady);
        }
        this.addCardNode();
      }
    }
    this.playerCount = state.playerOrder.length;
    this.updateRowNodes();
  };

  public updateRowNodes = () => {
    let y = -PanelHeight / 2 + PanelPadding + PlayerRowHeight / 2;
    for (let i = 0; i < 5; i++) {
      const maybePlayerId = this.playerOrder[i];
      if (maybePlayerId != null) {
        const playerNode = this.playerInfoNodes.get(maybePlayerId);
        if (playerNode != null) {
          playerNode.offset[1] = y;
        }
      }
      y += RowHeight + RowGap;
    }
  };

  public addPlayerInfoNode = (playerId: PlayerId) => {
    const playerRowNode = new PlayerRowNode(
      `${NewGameNodeId}-row-${playerId}`,
      playerId
    );
    this.playerInfoNodes.set(playerId, playerRowNode);
    this.addChild(playerRowNode);
  };

  public removePlayerInfoNode = (playerId: PlayerId) => {
    const node = this.playerInfoNodes.get(playerId);
    this.playerInfoNodes.delete(playerId);
    if (node != null) {
      this.removeChild(node);
    }
  };

  public updateSideCardLayout = () => {
    const layout = SideCardPositionLayout[this.sideCardNodes.length];
    for (let i = 0; i < this.sideCardNodes.length; i++) {
      this.sideCardNodes[i].playerPosition = layout[i];
    }
  };

  public addCardNode = (enterAnimationEnabled: boolean = false) => {
    const sideCardNode = new SideCardNode(
      `${this.id}-sidecard-${this.sideCardNodes.length + 1}`
    );
    sideCardNode.enterAnimationEnabled = enterAnimationEnabled;
    this.sideCardNodes.push(sideCardNode);
    this.addChild(sideCardNode);
    this.updateSideCardLayout();
  };

  public removeCardNode = () => {
    const lastCard = this.sideCardNodes.pop();
    if (lastCard == null) {
      return;
    }
    this.removeChild(lastCard);
    this.updateSideCardLayout();
  };

  public handleEnterGame = ({ playerId: enterPlayerId }: EnterGameAction) => {
    const playerOrderIndex = this.playerOrder.indexOf(enterPlayerId);
    if (playerOrderIndex < 0) {
      this.playerOrder[this.playerCount] = enterPlayerId;
      this.playerCount++;
      this.addPlayerInfoNode(enterPlayerId);
    }
    this.addCardNode();
    this.updateRowNodes();
    if (this.container?.context.playerId === enterPlayerId) {
      this.joinLeaveButton.setInGame(true);
    }
  };

  public handleLeaveGame = ({ playerId: leavePlayerId }: LeaveGameAction) => {
    const playerOrderIndex = this.playerOrder.indexOf(leavePlayerId);
    if (playerOrderIndex >= 0) {
      this.playerOrder.splice(playerOrderIndex, 1);
      this.playerOrder.push(undefined);
      this.playerCount--;
      this.removePlayerInfoNode(leavePlayerId);
    }
    this.removeCardNode();
    this.updateRowNodes();
    if (this.container?.context.playerId === leavePlayerId) {
      this.joinLeaveButton.setInGame(false);
    }
  };

  public setReady = (playerId: PlayerId, ready: boolean) => {
    const infoNode = this.playerInfoNodes.get(playerId);
    infoNode?.animateReady(ready);
    if (playerId === this.container?.context.playerId) {
      this.joinLeaveButton.setReady(ready);
    }
  };

  public handleMarkPlayerReady = ({
    playerId: readyPlayerId,
  }: PlayerReadyAction) => {
    this.setReady(readyPlayerId, true);
  };

  public handleMarkPlayerUnready = ({
    playerId: unreadyPlayerId,
  }: PlayerUnreadyAction) => {
    this.setReady(unreadyPlayerId, false);
  };
}
