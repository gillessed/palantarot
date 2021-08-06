import {TypedAction} from 'redoodle';
import {put, takeEvery} from 'redux-saga/effects';
import {GamePlayerActions} from './GamePlayerActions';
import {GamePlayer} from './GamePlayerTypes';

const GamePlayerCookie = 'palantarot-game-player';

function parseCookies() {
  const cookieArrays = document.cookie.split(';');
  const cookies = new Map<string, string>();
  for (const entry of cookieArrays) {
    const [key, value] = entry.trim().split('=');
    cookies.set(key, value);
  }
  return cookies;
}

function setCookie(key: string, value: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = key + '=' + value + ';' + expires + ';path=/';
}

function deleteCookie(key: string) {
  setCookie(key, '', 0);
}

function* setGamePlayerSaga(action: TypedAction<GamePlayer | null>) {
  const gamePlayer = action.payload;
  if (gamePlayer === null) {
    deleteCookie(GamePlayerCookie);
  } else {
    try {
      const serialized = btoa(JSON.stringify(gamePlayer));
      setCookie(GamePlayerCookie, serialized, 30);
    } catch (error) {
      console.warn(
        'There was an error saving the game player cookie',
        gamePlayer
      );
    }
  }
}

export function* gamePlayerSaga() {
  const cookies = parseCookies();
  if (cookies.has(GamePlayerCookie)) {
    try {
      const gamePlayer = JSON.parse(
        atob(cookies.get(GamePlayerCookie) ?? '')
      ) as GamePlayer;
      setCookie(GamePlayerCookie, cookies.get(GamePlayerCookie) ?? '', 30);
      yield put(GamePlayerActions.set(gamePlayer));
    } catch (error) {
      console.warn(
        'There was an error trying to parse the save player data',
        cookies.get(GamePlayerCookie)
      );
    }
  }

  yield takeEvery(GamePlayerActions.set.TYPE, setGamePlayerSaga);
}
