import {TypedAction} from 'redoodle';
import {actionName} from '../redux/actionName';
import {GamePlayer} from './GamePlayerTypes';

const name = actionName('gamePlayer');
const set = TypedAction.define(name('set'))<GamePlayer | null>();
export const GamePlayerActions = {
  set,
};
