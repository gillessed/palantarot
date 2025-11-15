import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Player } from "../../../server/model/Player";
import { PlayerId } from "../../../server/play/model/GameState";
import { RoomDescription } from "../../../server/play/room/RoomDescription";
import { RoomSocketMessages } from "../../../server/play/room/RoomSocketMessages";
import { SocketMessage } from "../../../server/websocket/SocketMessage";
import { useClientSocket } from "../../services/socket/useClientSocket";
import { PlaySvgContainer } from "./PlaySvgContainer";

interface Props {
  gamePlayerId: PlayerId;
  players: Map<PlayerId, Player>;
  room: RoomDescription;
}

export const PlayView = memo(function PlayView({
  gamePlayerId,
  room: loadedRoom,
  players,
}: Props) {
  const [room, setRoom] = useState(loadedRoom);

  const previousTitle = useRef(document.title);
  useEffect(() => {
    document.title = room.name;
    return () => {
      document.title = previousTitle.current;
    };
  }, [room]);

  const handleMessage = useCallback((message: SocketMessage<any>) => {
    // Handle socket messages
  }, []);
  const clientSocket = useClientSocket(handleMessage);
  useEffect(() => {
    // TODO: update debug players
    // registerDebugPlayers(gamePlayerId, room.id, this.dispatchers.room)
    clientSocket.send(
      RoomSocketMessages.enterRoom({ playerId: gamePlayerId, roomId: room.id })
    );
  }, [clientSocket]);

  return (
    <div className="play-container">
      <PlaySvgContainer players={players} />
      {/* <PlaySvgContainer
        players={players}
        room={room}
        dispatchers={this.dispatchers}
      />
      <PlaySidebar
        players={players}
        room={room}
        playerId={gamePlayer.playerId}
        dispatchers={this.dispatchers}
      /> */}
    </div>
  );

  return null;
});
