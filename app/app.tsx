import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Redirect, Route } from 'react-router';
import { Router } from 'react-router-dom';
import { applyMiddleware, createStore, Store } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { ServerApi } from './api/serverApi';
import './app.scss';
import { AddPlayerContainer } from './containers/addPlayer/AddPlayerContainer';
import { AppContainer } from './containers/app/AppContainer';
import { EditContainer } from './containers/edit/EditContainer';
import { EnterContainer } from './containers/enter/EnterContainer';
import { GameContainer } from './containers/game/GameContainer';
import { HomeContainer } from './containers/home/HomeContainer';
import { LoginContainer } from './containers/login/LoginContainer';
import { PlayerContainer } from './containers/player/PlayerContainer';
import { RecentContainer } from './containers/recent/RecentContainer';
import { RecordsContainer } from './containers/records/RecordsContainer';
import { ResultsContainer } from './containers/results/ResultsContainer';
import { SearchContainer } from './containers/search/SearchContainer';
import { EditTarothonContainer } from './containers/tarothon/EditTarothonContainer';
import { TarothonContainer } from './containers/tarothon/TarothonContainer';
import { TarothonFormContainer } from './containers/tarothon/TarothonFormContainer';
import { TarothonsContainer } from './containers/tarothon/TarothonsContainer';
import { DispatcherProvider } from './dispatchProvider';
import history from './history';
import { SagaProvider } from './sagaProvider';
import { dispatcherCreators } from './services/dispatchers';
import { ReduxState, rootReducer } from './services/rootReducer';
import { rootSaga } from './services/rootSaga';
import { SagaListener } from './services/sagaListener';
import { SearchResultsContainer } from './containers/search/SearchResultsContainer';

async function init() {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [
    sagaMiddleware,
  ];

  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing redux logger for debug...');
    middleware.push(logger as any);
  }

  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  const store: Store<ReduxState> = createStoreWithMiddleware(rootReducer) as any;
  const api = new ServerApi('/api/v1');
  const sagaListeners: Set<SagaListener<any>> = new Set();
  sagaMiddleware.run(rootSaga, api, sagaListeners);

  const appElement = document.getElementById('app');

  if (appElement != null) {
    const routes = (
      <div>
        <Route path='/' exact render={() => <Redirect from='/' to='/app/home' />}/>
        <Route path='/app' component={AppContainer} />
        <Route path='/app/home' component={HomeContainer} />
        <Route path='/app/enter' component={EnterContainer} />
        <Route path='/app/recent' component={RecentContainer} />
        <Route path='/app/game/:gameId' component={GameContainer} />
        <Route path='/app/results' component={ResultsContainer} />
        <Route path='/app/add-player' component={AddPlayerContainer} />
        <Route path='/app/player/:playerId' component={PlayerContainer} />
        <Route path='/app/edit/:gameId' component={EditContainer} />
        <Route path='/app/records' component={RecordsContainer} />
        <Route path='/app/search' component={SearchContainer} />
        <Route path='/app/search-results' component={SearchResultsContainer} />
        <Route path='/app/tarothons' component={TarothonsContainer} />
        <Route path='/app/add-tarothon' component={TarothonFormContainer} />
        <Route path='/app/tarothon/:tarothonId' component={TarothonContainer} />
        <Route path='/app/edit-tarothon/:tarothonId' component={EditTarothonContainer} />
        <Route path='/login' component={LoginContainer} />
      </div>
    );

    ReactDOM.render((
      <Provider store={store}>
        <DispatcherProvider dispatchers={dispatcherCreators}>
          <SagaProvider listeners={sagaListeners}>
            <Router history={history}>
              {routes}
            </Router>
          </SagaProvider>
        </DispatcherProvider>
      </Provider>
    ), appElement);
  }
}

init();

export function mergeContexts(t1: React.ValidationMap<any>, t2: React.ValidationMap<any>): React.ValidationMap<any> {
  return {
    ...t1,
    ...t2,
  };
}
