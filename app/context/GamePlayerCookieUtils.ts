const GamePlayerCookie = "palantarot-game-player";

interface GamePlayer {
  playerId: string;
}

function parseCookies() {
  const cookieArrays = document.cookie.split(";");
  const cookies = new Map<string, string>();
  for (const entry of cookieArrays) {
    const [key, value] = entry.trim().split("=");
    cookies.set(key, value);
  }
  return cookies;
}

function setCookie(key: string, value: string, exdays: number) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

function deleteCookie(key: string) {
  setCookie(key, "", 0);
}

export function setGamePlayerCookie(playerId?: string) {
  if (playerId == null) {
    deleteCookie(GamePlayerCookie);
  } else {
    try {
      const gamePlayer: GamePlayer = { playerId };
      const serialized = btoa(JSON.stringify(gamePlayer));
      setCookie(GamePlayerCookie, serialized, 30);
    } catch (error) {
      console.warn(
        "There was an error saving the game player cookie",
        playerId,
        error
      );
    }
  }
}

export function getGamePlayerCookie(): string | undefined {
  const cookies = parseCookies();
  if (!cookies.has(GamePlayerCookie)) {
    return undefined;
  }
  try {
    const gamePlayer = JSON.parse(
      atob(cookies.get(GamePlayerCookie) ?? "")
    ) as GamePlayer;
    setCookie(GamePlayerCookie, cookies.get(GamePlayerCookie) ?? "", 30);
    return gamePlayer.playerId;
  } catch (error) {
    console.warn(
      "There was an error trying to parse the save player data",
      cookies.get(GamePlayerCookie),
      error
    );
  }
}
