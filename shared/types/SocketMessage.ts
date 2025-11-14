export interface ClientSocketMessage_Connect {
  type: "connect";
  socketId: string;
}

export const createClientSocketMessage_Connect = (
  socketId: string
): ClientSocketMessage_Connect => ({ type: "connect", socketId });
