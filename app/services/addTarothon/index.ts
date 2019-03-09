import { Loadable } from './../redux/loadable';
import { ServerApi } from './../../api/serverApi';
import { generatePropertyService } from '../redux/serviceGenerator';
import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { Tarothon, NewTarothon } from '../../../server/model/Tarothon';

type Request = Tarothon | NewTarothon;
export type AddTarothonService = Loadable<Request, string>;
const addTarothonService = generatePropertyService<Request, string>('ADD TAROTHON',
  (api: ServerApi) => {
    return (request: Request) => {
      return api.addTarothon(request).then((response) => response.id);
    }
  }
);

export const addTarothonActions = addTarothonService.actions;
export const AddTarothonDispatcher = addTarothonService.dispatcher;
export type AddTarothonDispatcher = PropertyDispatcher<Request>;
export const addTarothonReducer = addTarothonService.reducer.build();
export const addTarothonSaga = addTarothonService.saga;