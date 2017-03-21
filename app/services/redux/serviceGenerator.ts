import { ServerApi } from './../../api/serverApi';
import {
  generateServiceActions,
  generateServiceActionCreators,
  generatePropertyActions,
  generatePropertyActionCreators,
} from './serviceActions';
import { generatePropertyReducer, generateServiceReducer } from './serviceReducer';
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
  const reducer = generatePropertyReducer(actions).build();
  const saga = function* (api: ServerApi) {
    yield takeEveryTyped(
      actions.REQUEST,
      createSagaPropertyOperation<ARG, RESULT>(operation(api), actionCreators),
    );
  }
  return {
    actions,
    actionCreators,
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
  const reducer = generateServiceReducer(actions).build();
  const saga = function* (api: ServerApi) {
    yield takeEveryTyped(
      actions.REQUEST,
      createSagaServiceOperation<ARG, RESULT>(operation(api), actionCreators),
    );
  }
  return {
    actions,
    actionCreators,
    reducer,
    saga,
  };
}