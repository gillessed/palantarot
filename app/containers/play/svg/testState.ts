import { dealCards } from '../../../../server/play/model/CardUtils';

export const HunterHerman = '129';
export const GregCole = '32';
export const KarlFischer = '6';
export const JonathanYu = '111';
export const EricBengtson = '14';
export const selfId = GregCole;
export const users3 = [ selfId, HunterHerman, KarlFischer ];
export const users4 = [ ...users3, JonathanYu ];
export const users5 = [ ...users4, EricBengtson ];
export const cards3 = dealCards(users3.length);
export const cards4 = dealCards(users4.length);
export const cards5 = dealCards(users5.length);
