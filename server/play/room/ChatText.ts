export const ServerChatAuthorId = '__SERVER__';

export interface ChatText {
  id: string;
  text: string;
  time: number;
  authorId: string;
}
