import { ServerApi } from './../../api/serverApi';
import {
  generateServiceActions,
  generateServiceActionCreators,
  generatePropertyActions,
  generatePropertyActionCreators,
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
  const actionCreators = generatePropertyActionCreators<ARG, RESULT>(actions);
  const dispatcher = generatePropertyDispatcher(actionCreators);
  const reducer = generatePropertyReducer(actions);
  const saga = function* (api: ServerApi) {
    yield takeEveryTyped(
      actions.REQUEST,
      createSagaPropertyOperation<ARG, RESULT>(operation(api), actionCreators),
    );
  }
  return {
    actions,
    actionCreators,
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
  const actionCreators = generateServiceActionCreators<ARG, RESULT>(actions);
  const dispatcher = generateServiceDispatcher(actionCreators);
  const reducer = generateServiceReducer(actions);
  const saga = function* (api: ServerApi) {
    yield takeEveryTyped(
      actions.REQUEST,
      createSagaServiceOperation<ARG, RESULT>(operation(api), actionCreators),
    );
  }
  return {
    actions,
    actionCreators,
    dispatcher,
    reducer,
    saga,
  };
}