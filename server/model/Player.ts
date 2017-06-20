export interface NewPlayer {
  firstName: string;
  lastName: string;
  email: string;
}

export type Player = NewPlayer & {
  id: string;
};