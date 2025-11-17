import { memo, useCallback, useEffect, useRef } from "react";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { RoomSocketMessages } from "../../../server/play/room/RoomSocketMessages";
import { SocketMessage } from "../../../server/websocket/SocketMessage";
import { usePlaySceneContext } from "../../play/PlaySceneContext";
import { usePlayScene } from "../../play/usePlayScene";
import { useClientSocket } from "../../services/socket/useClientSocket";
import { PlayCanvas } from "./PlayCanvas";

interface Props {
  gamePlayerId: PlayerId;
  players: Map<PlayerId, Player>;
  roomId: string;
}

export const PlayView = memo(function PlayView({
  gamePlayerId,
  players,
  roomId,
}: Props) {
  const clientSocket = useClientSocket();
  const context = usePlaySceneContext(
    gamePlayerId,
    roomId,
    players,
    clientSocket
  );
  const scene = usePlayScene(context);
  const previousTitle = useRef(document.title);
  useEffect(
    () => () => {
      document.title = previousTitle.current;
    },
    []
  );
  const handleMessage = useCallback(
    (message: SocketMessage<any>) => {
      RoomSocketMessages.roomStatus.handle(message, (payload) => {
        scene.clearColor = payload.room.color;
      });
    },
    [scene]
  );
  useEffect(() => {
    // TODO: update debug players
    // registerDebugPlayers(gamePlayerId, room.id, this.dispatchers.room)
    const removeComponentListener = clientSocket.addListener(handleMessage);
    clientSocket.connect();
    clientSocket.send(
      RoomSocketMessages.enterRoom({ playerId: gamePlayerId, roomId: roomId })
    );
    return () => {
      removeComponentListener();
    };
  }, [clientSocket]);

  return (
    <div className="play-container" style={{ width: "100vw", height: "100vh" }}>
      <PlayCanvas players={players} scene={scene} />
      {/* <PlaySidebar
        players={players}
        room={room}
        playerId={gamePlayer.playerId}
        dispatchers={this.dispatchers}
      /> */}
    </div>
  );

  return null;
});
