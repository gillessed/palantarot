import { useEffect, useRef } from "react";
import { ClientSocket } from "./ClientSocket";
import { SocketMessage } from "../../../server/websocket/SocketMessage";

export function useClientSocket(
  handleMessage: (message: SocketMessage<any>) => void,
  handleError?: (error: Error) => void
) {
  const socket = useRef(
    new ClientSocket()
  );

  useEffect(() => {
    socket.current?.connect(handleMessage, handleError);
    return () => socket.current?.close();
  }, [handleMessage, handleError]);

  return socket.current;
}
