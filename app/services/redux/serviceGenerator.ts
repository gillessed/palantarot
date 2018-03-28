import { ServerApi } from './../../api/serverApi';
import {
  generateServiceActions,
  generatePropertyActions,
} from './serviceActions';
import { generatePropertyReducer, generateServiceReducer } from './serviceReducer';
import { generateServiceDispatcher, generatePropertyDispatcher } from './serviceDispatcher';
import { 
  createSagaPropertyOperation, 
  createSagaServiceOperation,
  takeEveryTyped
 } from './serviceSaga';

export function generatePropertyService<ARG, RESULT>(
  prefix: string,
  operation: (api: ServerApi) => (arg: ARG) => Promise<RESULT> | RESULT,
) {
  const actions = generatePropertyActions<ARG, RESULT>(prefix);
  const dispatcher = generatePropertyDispatcher(actions);
  const reducer = generatePropertyReducer(actions);
  const saga = function* (api: ServerApi) {
    yield takeEveryTyped(
      actions.request,
      createSagaPropertyOperation<ARG, RESULT>(operation(api), actions),
    );
  }
  return {
    actions,
    dispatcher,
    reducer,
    saga,
  };
}

export function generateService<ARG, RESULT>(
  prefix: string,
  operation: (api: ServerApi) => (arg: ARG[]) => Promise<Map<ARG, RESULT>> | Map<ARG, RESULT>,
) {
  const actions = generateServiceActions<ARG, RESULT>(prefix);
  const dispatcher = generateServiceDispatcher(actions);
  const reducer = generateServiceReducer(actions);
  const saga = function* (api: ServerApi) {
    yield takeEveryTyped(
      actions.request,
      createSagaServiceOperation<ARG, RESULT>(operation(api), actions),
    );
  }
  return {
    actions,
    dispatcher,
    reducer,
    saga,
  };
}