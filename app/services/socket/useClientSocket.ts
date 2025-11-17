import { useRef } from "react";
import { ClientSocket } from "./ClientSocket";

export function useClientSocket() {
  const socket = useRef(new ClientSocket());
  return socket.current;
}
