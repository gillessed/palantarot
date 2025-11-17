import type {
  EnterGameAction,
  LeaveGameAction,
  PlayerReadyAction,
  PlayerUnreadyAction,
} from "../../../../server/play/model/GameEvents";
import type { PlayerId } from "../../../../server/play/model/GameState";
import type { ClientGame } from "../../../../shared/types/ClientGameTypes";
import { TwoDNode } from "../../../sceneGraph/nodes/2d/TwoDNode";
import { PlayerPositionLayout } from "../../components/PlayerLayoutNode";
import { PlayerNode } from "../../components/PlayerNode";
import { NewGameNodeId } from "../../NodeIds";
import type { PlaySceneContext } from "../../PlaySceneContext";
import { PlayerOrder } from "../PlayerOrder";
import { JoinGameButton } from "./JoinGameButton";
import { LeaveGameButton } from "./LeaveGameButton";
import { MarkReadyButton } from "./MarkReadyButton";
import { MarkUnreadyButton } from "./MarkUnreadyButton";

export class NewGameNode extends TwoDNode<PlaySceneContext> {
  private joinGameButton = new JoinGameButton();
  private leaveGameButton = new LeaveGameButton();
  private markReadyButton = new MarkReadyButton();
  private markUnreadyButton = new MarkUnreadyButton();
  private playerOrder: PlayerOrder;
  private playerNodes: Map<PlayerId, PlayerNode> = new Map();
  constructor() {
    super(NewGameNodeId);

    this.playerOrder = new PlayerOrder(() => this.container?.context.playerId!);
    this.addChild(this.joinGameButton);
    this.addChild(this.leaveGameButton);
    this.addChild(this.markReadyButton);
    this.addChild(this.markUnreadyButton);
  }

  public setToGameState = (state: ClientGame) => {
    const playerId = this.container?.context.playerId!;
    if (state.gamePhase !== "new_game") {
      throw Error("Updating new game node with not new game state");
    }

    const playerJoined = state.playerOrder.includes(playerId);
    const playerReady = state.readiedPlayers.has(playerId);

    this.joinGameButton.visible = !playerJoined;
    this.leaveGameButton.visible = playerJoined && !playerReady;
    this.markReadyButton.visible = playerJoined && !playerReady;
    this.markUnreadyButton.visible = playerJoined && playerReady;

    for (const playerId of state.playerOrder) {
      this.addPlayerNode(playerId);
    }
    
    this.layoutPlayerNodes();

    // Mark player nodes ready/not ready
  };

  public layoutPlayerNodes = () => {
    const playerCount = this.playerOrder.length;
    const positions = PlayerPositionLayout[playerCount];
    let positionIndex = 0;
    for (const playerId of this.playerOrder) {
      this.playerNodes
        .get(playerId)
        ?.setPlayerPosition(positions[positionIndex]);
      positionIndex++;
    }
  };

  public addPlayerNode = (
    playerId: PlayerId,
    playEnterAnimation: boolean = false
  ) => {
    const playerNode = new PlayerNode(`${playerId}-player-node`);
    playerNode.playerLayoutNode.playEnterAnimation = playEnterAnimation;
    this.playerNodes.set(playerId, playerNode);
    this.playerOrder.addPlayer(playerId);
    this.layoutPlayerNodes();
    this.addChild(playerNode);
  };

  public removePlayerNode = (playerId: PlayerId) => {
    const node = this.playerNodes.get(playerId);
    if (node != null) {
      this.playerNodes.delete(playerId);
      this.playerOrder.removePlayer(playerId);
      this.layoutPlayerNodes();
      this.removeChild(node);
    }
  };

  public handleEnterGame = ({ player: enterPlayerId }: EnterGameAction) => {
    const playerId = this.container?.context.playerId!;
    if (enterPlayerId === playerId) {
      this.joinGameButton.visible = false;
      this.leaveGameButton.visible = true;
      this.markReadyButton.visible = true;
    }
    this.addPlayerNode(enterPlayerId, true);
  };

  public handleLeaveGame = ({ player: leavePlayerId }: LeaveGameAction) => {
    const playerId = this.container?.context.playerId!;
    if (leavePlayerId === playerId) {
      this.joinGameButton.visible = true;
      this.leaveGameButton.visible = false;
      this.markReadyButton.visible = false;
    }
    this.removePlayerNode(leavePlayerId);
  };

  public handleMarkPlayerReady = ({
    player: readyPlayerId,
  }: PlayerReadyAction) => {
    const playerId = this.container?.context.playerId!;
    if (readyPlayerId === playerId) {
      this.leaveGameButton.visible = false;
      this.markReadyButton.visible = false;
      this.markUnreadyButton.visible = true;
    }
    this.playerNodes.get(readyPlayerId)?.playerLayoutNode.playerInfoNode.animateReady(true);
  };

  public handleMarkPlayerUnready = ({
    player: unreadyPlayerId,
  }: PlayerUnreadyAction) => {
    const playerId = this.container?.context.playerId!;
    if (unreadyPlayerId === playerId) {
      this.leaveGameButton.visible = true;
      this.markReadyButton.visible = true;
      this.markUnreadyButton.visible = false;
    }
    this.playerNodes.get(unreadyPlayerId)?.playerLayoutNode.playerInfoNode.animateReady(false);
  };
}
