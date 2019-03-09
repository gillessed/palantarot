import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { Loadable } from '../redux/loadable';

export type DeleteTarothonService = Loadable<string, void>;
const deleteTarothonOperation = (api: ServerApi) => {
  return (id: string) => {
    return api.deleteTarothon(id);
  }
};

const deleteTarothonService = generatePropertyService<string, void>('DELETE TAROTHON', deleteTarothonOperation);

export const deleteTarothonActions = deleteTarothonService.actions;
export const DeleteTarothonDispatcher = deleteTarothonService.dispatcher;
export type DeleteTarothonDispatcher = PropertyDispatcher<string>;
export const deleteTarothonReducer = deleteTarothonService.reducer.build();
export const deleteTarothonSaga = deleteTarothonService.saga;
