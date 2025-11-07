import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { applyMiddleware, createStore, Store } from "redux";
import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { ServerApi } from "./api/serverApi";
import { ApiProvider } from "./apiProvider";
import "./App.css";
import { AppRouter } from "./AppRouter";
import { DispatchProvider } from "./dispatchProvider";
import { dispatcherCreators } from "./services/dispatchers";
import { ReduxState, rootReducer } from "./services/rootReducer";
import { registerConsoleStore } from "./utils/consoleStore";

function init() {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [sagaMiddleware];

  // if (`process.env.NODE_ENV === 'development') {
  // }`
  console.debug("Initializing redux logger for debug...");
  middleware.push(logger as any);

  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  const store: Store<ReduxState> = createStoreWithMiddleware(rootReducer) as any;
  const api = new ServerApi("/api/v1");
  registerConsoleStore(store);
  const dispatchers = dispatcherCreators(store);

  const rootElement = document.getElementById("root");
  if (rootElement == null) {
    throw Error("could not find app element");
  }
  const reactRoot = createRoot(rootElement);

  reactRoot.render(
    <Provider store={store}>
      <ApiProvider value={api}>
        <DispatchProvider value={dispatchers}>
          <MantineProvider forceColorScheme="light">
            <AppRouter />
          </MantineProvider>
        </DispatchProvider>
      </ApiProvider>
    </Provider>
  );
}

init();
