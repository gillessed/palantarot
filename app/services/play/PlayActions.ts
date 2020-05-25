import { TypedAction } from 'redoodle';

const choosePlayer = TypedAction.define("Play::ChoosePlayer")<string>();

export const PlayActions = {
  choosePlayer,
};
