import "@mantine/charts/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./App.css";
import { AppRouter } from "./AppRouter";
import {
  getGamePlayerCookie,
  setGamePlayerCookie,
} from "./context/GamePlayerCookieUtils";

const theme = createTheme({
  headings: {
    fontFamily: "blenderProBold",
  },
});

function init() {
  // const sagaMiddleware = createSagaMiddleware();
  // const middleware = [sagaMiddleware];

  // middleware.push(logger as any);

  // const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
  // const store: Store<ReduxState> = createStoreWithMiddleware(
  //   rootReducer
  // ) as any;
  // registerConsoleStore(store);

  const gamePlayerCookie = getGamePlayerCookie();
  // refresh cookie expiration
  setGamePlayerCookie(gamePlayerCookie);
  const rootElement = document.getElementById("root");
  if (rootElement == null) {
    throw Error("could not find app element");
  }
  const reactRoot = createRoot(rootElement);

  reactRoot.render(
    // <Provider store={store}>
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications autoClose={3000} position="top-center" />
      <AppRouter gamePlayerCookie={gamePlayerCookie} />
    </MantineProvider>
    // </Provider>
  );
}

init();
