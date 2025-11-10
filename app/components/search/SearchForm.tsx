import { Button, Center, Stack, Text } from "@mantine/core";
import { memo, useCallback, useMemo, useState } from "react";
import { Player } from "../../../server/model/Player";
import {
  emptyPlayerQuery,
  emptyScoreQuery,
  isQueryEmpty,
  PlayerQuery,
  ScoreQuery,
  SearchQuery,
} from "../../../server/model/Search";
import { BidQueryComponent } from "./BidQueryComponent";
import { PlayerCountQueryComponent } from "./PlayerCountQueryComponent";
import { PlayerQueryComponent } from "./PlayerQueryComponent";
import { ScoreQueryComponent } from "./ScoreQueryComponent";
import { SearchHeader } from "./SearchHeader";

export interface Props {
  players: Map<string, Player>;
}

export const SearchForm = memo(function SearchForm({ players }: Props) {
  const [playerQueries, setPlayerQueries] = useState<
    SearchQuery["playerQueries"]
  >([]);
  const [scoreQueries, setScoreQueries] = useState<SearchQuery["scoreQueries"]>(
    []
  );
  const [bidQuery, setBidQuery] = useState<SearchQuery["bidQuery"]>([]);
  const [numberOfPlayers, setNumberOfPlayers] = useState<
    SearchQuery["numberOfPlayers"]
  >([]);

  const handleNewPlayerQuery = useCallback(() => {
    const firstPlayer = players.values().next();
    setPlayerQueries([
      ...playerQueries,
      emptyPlayerQuery(firstPlayer.value.id),
    ]);
  }, [playerQueries, setPlayerQueries]);

  const handlePlayerQueryChange = useCallback(
    (playerQuery: PlayerQuery, index: number) => {
      const newQueries = [...playerQueries];
      newQueries.splice(index, 1, playerQuery);
      setPlayerQueries(playerQueries);
    },
    [playerQueries, setPlayerQueries]
  );

  const handleDeletePlayerQuery = useCallback(
    (index: number) => {
      const newQueries = [...playerQueries];
      newQueries.splice(index, 1);
      setPlayerQueries(playerQueries);
    },
    [playerQueries, setPlayerQueries]
  );

  const handleNewScoreQuery = useCallback(() => {
    setScoreQueries([...scoreQueries, emptyScoreQuery()]);
  }, [scoreQueries, setScoreQueries]);

  const handleScoreQueryChange = useCallback(
    (scoreQuery: ScoreQuery, index: number) => {
      const newQueries = [...scoreQueries];
      newQueries.splice(index, 1, scoreQuery);
      setScoreQueries(newQueries);
    },
    [scoreQueries, setScoreQueries]
  );

  const handleDeleteScoreQuery = useCallback(
    (index: number) => {
      const newQueries = [...scoreQueries];
      newQueries.splice(index, 1);
      setScoreQueries(newQueries);
    },
    [scoreQueries, setScoreQueries]
  );

  const fullQuery: SearchQuery = useMemo(() => {
    return {
      playerQueries,
      scoreQueries,
      bidQuery,
      numberOfPlayers,
    };
  }, [playerQueries, scoreQueries, bidQuery, numberOfPlayers]);

  const handleSubmit = useCallback(() => {
    // Figure out how to do this
  }, []);

  return (
    <Stack>
      <SearchHeader title="Players" onClick={handleNewPlayerQuery} />
      {playerQueries.map((playerQuery, index) => (
        <PlayerQueryComponent
          key={index}
          index={index}
          players={players}
          playerQuery={playerQuery}
          onChange={handlePlayerQueryChange}
          onDelete={handleDeletePlayerQuery}
        />
      ))}
      <SearchHeader title="Score" onClick={handleNewScoreQuery} />
      {scoreQueries.map((scoreQuery, index) => (
        <ScoreQueryComponent
          key={index}
          index={index}
          scoreQuery={scoreQuery}
          onChange={handleScoreQueryChange}
          onDelete={handleDeleteScoreQuery}
        />
      ))}
      <SearchHeader title="Bid Amount" />
      <div className="bid-query-container">
        <BidQueryComponent bidQuery={bidQuery} onChange={setBidQuery} />
      </div>
      <SearchHeader title="Number of Players" />
      <div className="bid-query-container">
        <PlayerCountQueryComponent
          numberOfPlayers={numberOfPlayers}
          onChange={setNumberOfPlayers}
        />
      </div>
      <SearchHeader title="Number of Players" />
      <Text>Not ready yet...</Text>
      <Center>
        <Button
          onClick={handleSubmit}
          disabled={isQueryEmpty(fullQuery)}
          color="green"
          rightSection
        >
          Search
        </Button>
      </Center>
    </Stack>
  );
});
