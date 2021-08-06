import {takeEvery} from 'redux-saga/effects';
import {ServerApi} from './../../api/serverApi';
import {
  generatePropertyActions,
  generateServiceActions,
} from './serviceActions';
import {
  generatePropertyDispatcher,
  generateServiceDispatcher,
} from './serviceDispatcher';
import {
  generatePropertyReducer,
  generateServiceReducer,
} from './serviceReducer';
import {
  createSagaPropertyOperation,
  createSagaServiceOperation,
} from './serviceSaga';

export function generatePropertyService<ARG, RESULT>(
  prefix: string,
  operation: (api: ServerApi) => (arg: ARG) => Promise<RESULT> | RESULT
) {
  const actions = generatePropertyActions<ARG, RESULT>(prefix);
  const dispatcher = generatePropertyDispatcher(actions);
  const reducer = generatePropertyReducer(actions);
  const saga = function* (api: ServerApi) {
    yield takeEvery(
      actions.request.TYPE,
      createSagaPropertyOperation<ARG, RESULT>(operation(api), actions)
    );
  };
  return {
    actions,
    dispatcher,
    reducer,
    saga,
  };
}

export function generateService<ARG, RESULT, KEY = ARG>(
  prefix: string,
  operation: (
    api: ServerApi
  ) => (arg: ARG[]) => Promise<Map<ARG, RESULT>> | Map<ARG, RESULT>,
  argMapper: (arg: ARG) => KEY
) {
  const actions = generateServiceActions<ARG, RESULT>(prefix);
  const dispatcher = generateServiceDispatcher<ARG, RESULT, KEY>(actions);
  const reducer = generateServiceReducer(actions, argMapper);
  const saga = function* (api: ServerApi) {
    yield takeEvery(
      actions.request.TYPE,
      createSagaServiceOperation<ARG, RESULT>(operation(api), actions)
    );
  };
  return {
    actions,
    dispatcher,
    reducer,
    saga,
  };
}

export function identityMapper<T>(arg: T): T {
  return arg;
}
