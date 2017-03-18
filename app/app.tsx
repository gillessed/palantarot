import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {IndexRedirect, Route, Router, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer} from 'react-router-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import * as createLogger from 'redux-logger';

import {RootContainer} from './containers/RootContainer';
import {HomeContainer} from './containers/home/HomeContainer';
import {EnterContainer} from './containers/enter/EnterContainer';

const logger = createLogger();

const reducer = combineReducers({
  // ...reducers,
  routing: routerReducer,
});

const createStoreWithMiddleware = applyMiddleware(logger)(createStore);
const store = createStoreWithMiddleware(reducer);
const history = syncHistoryWithStore(browserHistory, store)

const appElement = document.getElementById("app");

if (appElement != null) {
    const routes = (
        <Route path="/" component={RootContainer}>
            <IndexRedirect to="home"/>
            <Route path="home" component={HomeContainer}/>
            <Route path="enter" component={EnterContainer}/>
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