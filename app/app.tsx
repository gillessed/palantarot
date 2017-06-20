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
sagaMiddleware.run(rootSaga, api);

const appElement = document.getElementById("app");

if (appElement != null) {
  const routes = (
    <Route path="/" component={RootContainer}>
      <IndexRedirect to="home" />
      <Route path="home" component={HomeContainer} />
      <Route path="enter" component={EnterContainer} />
      <Route path="recent" component={RecentContainer} />
      <Route path="/game/:gameId" component={GameContainer} />
      <Route path="/results" component={ResultsContainer} />
      <Route path="/add-player" component={AddPlayerContainer} />
    </Route>
  );

  ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        {routes}
      </Router>
    </Provider>
  ), appElement);
}