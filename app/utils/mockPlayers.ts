import { GameplayState } from '../play/state';
import { InGameDispatcher } from '../services/ingame/InGameDispatcher';
import { InGameState } from '../services/ingame/InGameTypes';
import { PlayDispatcher } from '../services/ingame/PlayDispatcher';

type DebugDispatcher = PlayDispatcher & { joinLobby: () => void };

interface D  {
  p2: DebugDispatcher;
  p3: DebugDispatcher;
  p4: DebugDispatcher;
  p5: DebugDispatcher;
  p6: DebugDispatcher;
  p7: DebugDispatcher;
}

function getArray(d: D) {
  return [d.p2, d.p3, d.p4, d.p5];
}

function joinLobby(d: D) {
  return (count: number) => {
    const da = getArray(d);
    for (let i = 0; i < count; i++) {
      da[i].joinLobby();
    }
  }
}

function enterGame(d: D) {
  return (count: number) => {
    const da = getArray(d);
    for (let i = 0; i < count; i++) {
      da[i].enterGame();
    }
  }
}

function ready(d: D) {
  return (count: number) => {
    const da = getArray(d);
    for (let i = 0; i < count; i++) {
      da[i].markAsReady();
    }
  }
}

function startGame(d: D) {
  return (count: number) => {
    joinLobby(d)(count);
    enterGame(d)(count);
    ready(d)(count);
  }
}

function autopass(game: InGameState | null, dispatcher: InGameDispatcher) {
  if (game == null || game.state.state !== GameplayState.Bidding || game.state.toBid == null) {
    return;
  }
  const player = game.state.playerOrder[game.state.toBid];
  dispatcher.play(player).pass();
} 

function buildDispatcher(player: string, game: string, dispatcher: InGameDispatcher): DebugDispatcher {
  const obj: any = dispatcher.play(player, true);
  obj.joinLobby = () => dispatcher.debugJoinGame(player, game);
  return obj;
}

export function registerDebugPlayers(player: string, gameId: string, dispatcher: InGameDispatcher) {
  const d: D = {
    p2: buildDispatcher("Player 2", gameId, dispatcher),
    p3: buildDispatcher("Player 3", gameId, dispatcher),
    p4: buildDispatcher("Player 4", gameId, dispatcher),
    p5: buildDispatcher("Player 5", gameId, dispatcher),
    p6: buildDispatcher("Player 6", gameId, dispatcher),
    p7: buildDispatcher("Player 7", gameId, dispatcher),
  };
  const dw = {
    enterGame: enterGame(d),
    joinLobby: joinLobby(d),
    ready: ready(d),
    startGame: startGame(d),
    autoplay: () => dispatcher.autoplay(),
  };
  (window as any).d = d;
  (window as any).dw = dw;
}

export function unregisterDebugPlayers() {
  delete (window as any).d;
}
