import type { Player } from "../../server/model/Player";

export interface Item {
  id: string;
  text: string;
  activatible?: boolean;
  selects?: Player | null;
  recent?: boolean;
  queryText: string;
  hightlights?: [number, number][];
}

interface Match {
  item: Item;
  substringMatches: SubstringMatch[];
  matchDelta: number;
}

interface SubstringMatch {
  match: string;
  start: number;
  end: number;
}

export function findMatches(query: string, items: Item[]): Item[] {
  const lowerCaseQuery = query.toLowerCase();

  const filtered = items
    .map((item: Item) => {
      return match(lowerCaseQuery, item);
    })
    .filter((match) => match) as Match[];

  const sorted = filtered.sort((matchA, matchB) => {
    if (matchA.substringMatches.length !== matchB.substringMatches.length) {
      return matchA.substringMatches.length - matchB.substringMatches.length;
    } else {
      return matchA.matchDelta - matchB.matchDelta;
    }
  });

  return sorted.map((match) => ({
    ...match.item,
    hightlights: match.substringMatches.map((subMatch) => [subMatch.start, subMatch.end]) as [number, number][],
  }));
}

function match(query: string, item: Item): Match | undefined {
  let matchDelta = 0;
  let substringMatches: SubstringMatch[] = [];
  let currentMatch = "";
  let currentMatchStart = -1;
  let queryIndex = 0;
  let itemIndex = 0;
  while (queryIndex < query.length && itemIndex < item.queryText.length) {
    const queryChar = query.charAt(queryIndex);
    const itemChar = item.queryText.charAt(itemIndex);
    if (queryChar === itemChar) {
      if (currentMatch.length === 0) {
        currentMatchStart = itemIndex;
      }
      currentMatch += queryChar;
      queryIndex++;
      itemIndex++;
    } else {
      if (currentMatch.length > 0) {
        substringMatches.push({
          match: currentMatch,
          start: currentMatchStart,
          end: itemIndex - 1,
        });
        currentMatch = "";
        currentMatchStart = -1;
      }
      itemIndex++;
      matchDelta++;
    }
  }
  if (currentMatch.length > 0) {
    substringMatches.push({
      match: currentMatch,
      start: currentMatchStart,
      end: itemIndex - 1,
    });
    currentMatch = "";
    currentMatchStart = -1;
  }
  if (queryIndex === query.length) {
    return {
      item,
      substringMatches,
      matchDelta: matchDelta + (item.queryText.length - itemIndex),
    };
  } else {
    return undefined;
  }
}
