import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { IndexRedirect, Route, Router, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createLogger from 'redux-logger';

import { ServerApi } from './api/serverApi';
import { rootReducer } from './services/rootReducer';
import { rootSaga } from './services/rootSaga';

import { RootContainer } from './containers/RootContainer';
import { HomeContainer } from './containers/home/HomeContainer';
import { EnterContainer } from './containers/enter/EnterContainer';
import { RecentContainer } from './containers/recent/RecentContainer';
import { GameContainer } from './containers/game/GameContainer';
import { ResultsContainer } from './containers/results/ResultsContainer';
import { AddPlayerContainer } from './containers/addPlayer/AddPlayerContainer';
import { SagaProvider } from './sagaProvider';
import { SagaListener } from './services/sagaListener';
import { PlayerContainer } from './containers/player/PlayerContainer';
import { DispatcherProvider } from './dispatchProvider';
import { dispatcherCreators } from './services/dispatchers';

const logger = createLogger();

const reducer = combineReducers({
  ...rootReducer,
  routing: routerReducer,
});

const sagaMiddleware = createSagaMiddleware();
const createStoreWithMiddleware = applyMiddleware(
  routerMiddleware(browserHistory),
  sagaMiddleware,
  logger)
  (createStore);
const store = createStoreWithMiddleware(reducer);
const history = syncHistoryWithStore(browserHistory, store);
const api = new ServerApi('/api/v1');
const sagaListeners: Set<SagaListener<any>> = new Set();
sagaMiddleware.run(rootSaga, api, sagaListeners);

const appElement = document.getElementById('app');

if (appElement != null) {
  const routes = (
    <Route path='/' component={RootContainer}>
      <IndexRedirect to='home' />
      <Route path='home' component={HomeContainer} />
      <Route path='enter' component={EnterContainer} />
      <Route path='recent' component={RecentContainer} />
      <Route path='/game/:gameId' component={GameContainer} />
      <Route path='/results' component={ResultsContainer} />
      <Route path='/add-player' component={AddPlayerContainer} />
      <Route path='/player/:playerId' component={PlayerContainer} />
    </Route>
  );

  ReactDOM.render((
    <Provider store={store}>
      <DispatcherProvider
        dispatchers={dispatcherCreators}
      >
        <SagaProvider listeners={sagaListeners}>
          <Router history={history}>
            {routes}
          </Router>
        </SagaProvider>
      </DispatcherProvider>
    </Provider>
  ), appElement);
}

export function mergeContexts(t1: React.ValidationMap<any>, t2: React.ValidationMap<any>): React.ValidationMap<any> {
  return {
    ...t1,
    ...t2,
  };
}