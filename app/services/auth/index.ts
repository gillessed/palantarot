import { PropertyDispatcher } from '../redux/serviceDispatcher';
import { generatePropertyService } from '../redux/serviceGenerator';
import { ServerApi } from './../../api/serverApi';
import { Loadable } from './../redux/loadable';

export interface AuthRequest {
  secret: string;
}

export type AuthService = Loadable<AuthRequest, void>;

const authService = generatePropertyService<AuthRequest, void>(
  'auth',
  (api: ServerApi) => {
    return (request: AuthRequest) => {
      return api.login(request);
    };
  }
);

export const authActions = authService.actions;
export const AuthDispatcher = authService.dispatcher;
export type AuthDispatcher = PropertyDispatcher<AuthRequest>;
export const authReducer = authService.reducer.build();
export const authSaga = authService.saga;
