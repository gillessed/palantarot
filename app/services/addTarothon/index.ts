import {NewTarothon, Tarothon} from '../../../server/model/Tarothon';
import {PropertyDispatcher} from '../redux/serviceDispatcher';
import {generatePropertyService} from '../redux/serviceGenerator';
import {ServerApi} from './../../api/serverApi';
import {Loadable} from './../redux/loadable';

type Request = Tarothon | NewTarothon;
export type AddTarothonService = Loadable<Request, string>;
const addTarothonService = generatePropertyService<Request, string>(
  'addTarothon',
  (api: ServerApi) => {
    return (request: Request) => {
      return api.addTarothon(request).then(response => response.id);
    };
  }
);

export const addTarothonActions = addTarothonService.actions;
export const AddTarothonDispatcher = addTarothonService.dispatcher;
export type AddTarothonDispatcher = PropertyDispatcher<Request>;
export const addTarothonReducer = addTarothonService.reducer.build();
export const addTarothonSaga = addTarothonService.saga;
