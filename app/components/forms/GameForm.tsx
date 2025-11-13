import { Button, Checkbox, Group, Paper, Stack } from "@mantine/core";
import { IconDownload, IconUsers } from "@tabler/icons-react";
import { memo, useCallback, useMemo, useState } from "react";
import { GameRecord, PlayerHand } from "../../../server/model/GameRecord";
import { Player } from "../../../server/model/Player";
import type { PlayerId } from "../../../server/play/model/GameState";
import { getPlayerName } from "../../services/utils/playerName";
import { filterFalsy } from "../../utils/filterFalsy";
import { PointsInput, SelectInput } from "./Elements";
import { GamePlayerInput, PlayerState } from "./GamePlayerInput";
import { OppositionRoles, type PlayerRole } from "./PlayerRoles";
import { getPointsEarned } from "./getPointsEarned";

interface Props {
  recentPlayers?: Player[];
  players: Map<PlayerId, Player>;
  game?: GameRecord;
  submitText: string;
  onSubmit: (newGame: GameRecord) => void;
  loading?: boolean;
}

type PlayerStateMap = Map<PlayerRole, PlayerState>;
type PlayerErrorMap = Map<PlayerRole, string>;

function getEmptyPlayerState(role: PlayerRole): PlayerState {
  return {
    role,
    showed: false,
    oneLast: false,
  };
}

const DefaultPlayerCount = 5;
const DefaultCalledSelf = false;
const DefaultPlayerStateMap: PlayerStateMap = new Map(
  getActivePlayersForValues(DefaultPlayerCount, DefaultCalledSelf).map(
    (role) => {
      return [role, getEmptyPlayerState(role)];
    }
  )
);

const BidValues = ["10", "20", "40", "80", "160"].map((item) => ({
  value: item,
  label: item,
}));

function getPlayerStateFromHand(
  players: Map<PlayerId, Player>,
  role: PlayerRole,
  hand: PlayerHand
): PlayerState {
  const player = players.get(hand.id);
  return {
    role,
    player,
    showed: hand.showedTrump,
    oneLast: hand.oneLast,
  };
}

function getPlayerStateMapFromGame(
  players: Map<PlayerId, Player>,
  game: GameRecord
) {
  const handData = game.handData!;
  const playerState: PlayerStateMap = new Map();
  playerState.set(
    "bidder",
    getPlayerStateFromHand(players, "bidder", handData.bidder)
  );
  if (handData.partner != null) {
    playerState.set(
      "partner",
      getPlayerStateFromHand(players, "partner", handData.partner)
    );
  }
  handData.opposition.forEach((handData: PlayerHand, index: number) => {
    playerState.set(
      OppositionRoles[index],
      getPlayerStateFromHand(players, OppositionRoles[index], handData)
    );
  });
  return playerState;
}

function getActivePlayersForValues(
  numberOfPlayers: number,
  bidderCalledSelf: boolean
): PlayerRole[] {
  const activePlayers: PlayerRole[] = ["bidder", "player_1", "player_2"];
  if (numberOfPlayers === 5 && !bidderCalledSelf) {
    activePlayers.push("partner");
  }
  if (numberOfPlayers >= 4) {
    activePlayers.push("player_3");
  }
  if (numberOfPlayers === 5 && bidderCalledSelf) {
    activePlayers.push("player_4");
  }
  return activePlayers;
}

function validatePoints(value: string, bidAmount: number | undefined) {
  const number = +value;
  if (isNaN(number)) {
    return "Points must be a number.";
  }
  if (!Number.isInteger(number) || number % 10 !== 0) {
    return "Points must be divisible by 10.";
  }
  if (bidAmount != null) {
    // Max points is bid + 60 + 400 (declared slam) + double show (20) + one last (10)
    // Min points is -bid - 60 - 400 (reversed declared slam) - double show (20) - one last (10)
    const bound = bidAmount + 60 + 400 + 20 + 10;
    if (number > bound || number < -bound) {
      return "Points exceed theoretical bound on possible game outcome.";
    }
  }
  return undefined;
}

function bidValidator(value: string) {
  if (!value) {
    return "Must select a bid amount.";
  }
}

export const GameForm = memo(function GameForm({
  onSubmit,
  players,
  submitText,
  game,
  loading,
  recentPlayers,
}: Props) {
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(
    game?.numberOfPlayers ?? DefaultPlayerCount
  );
  const [bidderCalledSelf, setBidderCalledSelf] = useState<boolean>(
    game != null
      ? game.numberOfPlayers === 5 && game.partnerId == null
      : DefaultCalledSelf
  );
  const [playersState, setPlayersState] = useState<PlayerStateMap>(
    game != null
      ? getPlayerStateMapFromGame(players, game)
      : DefaultPlayerStateMap
  );
  const [bidAmount, setBidAmount] = useState<number | undefined>(
    game?.bidAmount
  );
  const [bidAmountError, setBidAmountError] = useState<string | undefined>();
  const [points, setPoints] = useState<number | undefined>(game?.points);
  const [pointsError, setPointsError] = useState<string | undefined>();

  const updateActivePlayers = useCallback(
    (numberOfPlayers: number, bidderCalledSelf: boolean) => {
      const newPlayers: PlayerStateMap = new Map();
      for (const role of getActivePlayersForValues(
        numberOfPlayers,
        bidderCalledSelf
      )) {
        const currentState = playersState.get(role);
        if (currentState != null) {
          newPlayers.set(role, currentState);
        } else {
          newPlayers.set(role, getEmptyPlayerState(role));
        }
      }
      setPlayersState(playersState);
      setNumberOfPlayers(numberOfPlayers);
      setBidderCalledSelf(bidderCalledSelf);
    },
    [playersState, setPlayersState, setNumberOfPlayers, setBidderCalledSelf]
  );

  const setPlayerCount = useCallback(
    (count: number) => {
      if (numberOfPlayers !== count) {
        const calledSelf = count === 5 ? bidderCalledSelf : false;
        updateActivePlayers(count, calledSelf);
      }
    },
    [updateActivePlayers, numberOfPlayers, bidderCalledSelf]
  );

  const setPlayerCount3 = useMemo(
    () => () => setPlayerCount(3),
    [setPlayerCount]
  );
  const setPlayerCount4 = useMemo(
    () => () => setPlayerCount(4),
    [setPlayerCount]
  );
  const setPlayerCount5 = useMemo(
    () => () => setPlayerCount(5),
    [setPlayerCount]
  );

  const handleSetSelfCalled = useCallback(
    (e: any) => {
      updateActivePlayers(numberOfPlayers, e.target.checked);
    },
    [updateActivePlayers, numberOfPlayers]
  );
  const selectedPlayers = useMemo(() => {
    const playerSet = new Set<PlayerId>();
    for (const value of playersState.values()) {
      if (value.player != null) {
        playerSet.add(value.player.id);
      }
    }
    return playerSet;
  }, [playersState]);

  const activePlayerStates = useMemo(() => {
    return filterFalsy(
      getActivePlayersForValues(numberOfPlayers, bidderCalledSelf).map(
        (role: PlayerRole) => {
          return playersState.get(role);
        }
      )
    );
  }, [numberOfPlayers, bidderCalledSelf, playersState]);

  const playerErrors = useMemo(() => {
    const sorted = activePlayerStates.sort((r1, r2) => {
      if (r1.player === undefined && r2.player === undefined) {
        return 0;
      } else if (r1.player === undefined) {
        return -1;
      } else if (r2.player === undefined) {
        return 1;
      } else {
        return `${r1.player.id}`.localeCompare(`${r2.player.id}`);
      }
    });
    const playerErrors: PlayerErrorMap = new Map();
    for (const [index, playerState] of sorted.entries()) {
      const duplicate =
        playerState.player != null &&
        ((index > 0 &&
          playerState.player.id === sorted[index - 1].player?.id) ||
          (index < sorted.length - 1 &&
            playerState.player.id === sorted[index + 1].player?.id));
      if (duplicate) {
        const player = playerState.player!;
        const error = `Player ${getPlayerName(player)} appears more than once.`;
        playerErrors.set(playerState.role, error);
      }
    }

    const oneLastPlayers = activePlayerStates.filter(
      (playerState) => playerState.oneLast
    );
    if (oneLastPlayers.length > 1) {
      for (const playerState of activePlayerStates) {
        if (playerState.oneLast && playerErrors.get(playerState.role) == null) {
          playerErrors.set(
            playerState.role,
            "Multiple players played one last."
          );
        }
      }
    }

    const showedPlayers = activePlayerStates.filter(
      (playerState) => playerState.showed
    );
    if (showedPlayers.length > 2) {
      for (const playerState of activePlayerStates) {
        if (playerState.showed && playerErrors.get(playerState.role) == null) {
          playerErrors.set(playerState.role, "More than two people showed.");
        }
      }
    }

    return playerErrors;
  }, [activePlayerStates]);

  const handlePlayerChanged = useCallback(
    (role: PlayerRole, playerState: PlayerState) => {
      const newPlayersState = new Map(playersState);
      newPlayersState.set(role, playerState);
      setPlayersState(newPlayersState);
    },
    [playersState]
  );

  const handlePointsChanged = useCallback(
    (points?: string, error?: string) => {
      setPoints(points ? +points : undefined);
      setPointsError(error);
    },
    [setPoints, setPointsError]
  );

  const handleBidChanged = useCallback(
    (bid?: string, error?: string) => {
      const bidAmount = bid ? +bid : undefined;
      setBidAmount(bidAmount);
      setBidAmountError(error);
      if (points != null) {
        const pointsError = validatePoints(`${points}`, bidAmount);
        setPointsError(pointsError);
      }
    },
    [points, bidAmount, setBidAmount, setBidAmountError, setPointsError]
  );

  const pointsValidator = useCallback(
    (value: string) => {
      return validatePoints(value, bidAmount);
    },
    [bidAmount]
  );

  const errorCount = useMemo(() => {
    return filterFalsy([bidAmountError, pointsError, ...playerErrors.values()])
      .length;
  }, [bidAmountError, pointsError, playerErrors]);

  const missingValues = useMemo(() => {
    const values: Array<any | undefined> = [
      bidAmount,
      points,
      ...Array.from(playersState.values()).map(
        (playerState) => playerState.player
      ),
    ];
    return values.reduce(
      (previous, current) => (current != null ? previous : previous + 1),
      0
    );
  }, [bidAmount, points, playersState]);

  const submitActive = errorCount === 0 && missingValues === 0;

  const handleSubmit = useCallback(() => {
    const playerHands: Map<PlayerRole, PlayerHand> = new Map();
    const activePlayers = getActivePlayersForValues(
      numberOfPlayers,
      bidderCalledSelf
    );
    for (const role of activePlayers) {
      const player = playersState.get(role);
      if (player == null) {
        continue;
      }
      playerHands.set(role, {
        id: player.player!.id,
        handId: "",
        pointsEarned: getPointsEarned(
          points!,
          role,
          numberOfPlayers,
          bidderCalledSelf
        ),
        showedTrump: player.showed,
        oneLast: player.oneLast,
      });
    }
    const handData = {
      bidder: playerHands.get("bidder")!,
      partner: playerHands.get("partner"),
      opposition: filterFalsy(
        OppositionRoles.map((role) => {
          return playerHands.get(role);
        })
      ),
    };
    const bidderId = playersState.get("bidder")?.player?.id!;
    const partnerId = playersState.get("partner")?.player?.id;

    const newGame: GameRecord = {
      id: game ? game.id : "",
      bidderId,
      partnerId,
      timestamp: game?.timestamp ?? "",
      numberOfPlayers,
      bidAmount: bidAmount!,
      points: points!,
      slam: points! >= 270,
      handData,
    };
    onSubmit(newGame);
  }, [
    onSubmit,
    game,
    bidAmount,
    points,
    numberOfPlayers,
    bidderCalledSelf,
    playersState,
  ]);

  return (
    <Stack align="center">
      <Button.Group className="player-select-bar">
        <Button
          rightSection={<IconUsers />}
          color={numberOfPlayers === 3 ? "blue.5" : "blue.3"}
          onClick={setPlayerCount3}
        >
          3
        </Button>
        <Button
          rightSection={<IconUsers />}
          color={numberOfPlayers === 4 ? "blue.5" : "blue.3"}
          onClick={setPlayerCount4}
        >
          4
        </Button>
        <Button
          rightSection={<IconUsers />}
          color={numberOfPlayers === 5 ? "blue.5" : "blue.3"}
          onClick={setPlayerCount5}
        >
          5
        </Button>
      </Button.Group>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap={20}>
        <Group justify="center">
          <Paper miw={400} withBorder pr={20} pl={20} pb={10}>
            <Group justify="space-between">
              <h3>Bidder's Team</h3>

              <Checkbox
                onChange={handleSetSelfCalled}
                checked={bidderCalledSelf}
                label="Called Self"
              />
            </Group>
            <GamePlayerInput
              role="bidder"
              recentPlayers={recentPlayers}
              players={players}
              playerState={playersState.get("bidder")!}
              error={playerErrors.get("bidder")}
              selectedPlayers={selectedPlayers}
              label="Bidder"
              onChange={handlePlayerChanged}
            />
            <Stack bg="white" mb={10} bdrs={10} align="center" pb={10}>
              <SelectInput
                w={150}
                label="Bid Amount:"
                initialValue={bidAmount == null ? "" : `${bidAmount}`}
                values={BidValues}
                onChange={handleBidChanged}
                validator={bidValidator}
              />
              <PointsInput
                w={150}
                label="Points:"
                initialValue={points === undefined ? "" : `${points}`}
                initialError={pointsError === undefined ? "" : pointsError}
                onChange={handlePointsChanged}
                validator={pointsValidator}
                points={points}
              />
            </Stack>

            {!bidderCalledSelf && numberOfPlayers === 5 && (
              <GamePlayerInput
                role="partner"
                recentPlayers={recentPlayers}
                players={players}
                playerState={playersState.get("partner")!}
                error={playerErrors.get("partner")}
                selectedPlayers={selectedPlayers}
                label="Partner"
                onChange={handlePlayerChanged}
              />
            )}
          </Paper>
        </Group>

        <Paper miw={400} withBorder pr={20} pl={20} pb={10}>
          <h3 className="bp3-heading">Opposition</h3>
          <GamePlayerInput
            role="player_1"
            recentPlayers={recentPlayers}
            players={players}
            playerState={playersState.get("player_1")!}
            error={playerErrors.get("player_1")}
            selectedPlayers={selectedPlayers}
            label="Player 1"
            onChange={handlePlayerChanged}
          />
          <GamePlayerInput
            role="player_2"
            recentPlayers={recentPlayers}
            players={players}
            playerState={playersState.get("player_2")!}
            error={playerErrors.get("player_2")}
            selectedPlayers={selectedPlayers}
            label="Player 2"
            onChange={handlePlayerChanged}
          />
          {numberOfPlayers >= 4 && (
            <GamePlayerInput
              role="player_3"
              recentPlayers={recentPlayers}
              players={players}
              playerState={playersState.get("player_3")!}
              error={playerErrors.get("player_3")}
              selectedPlayers={selectedPlayers}
              label="Player 3"
              onChange={handlePlayerChanged}
            />
          )}
          {numberOfPlayers >= 5 && bidderCalledSelf && (
            <GamePlayerInput
              role="player_4"
              recentPlayers={recentPlayers}
              players={players}
              playerState={playersState.get("player_4")!}
              error={playerErrors.get("player_4")}
              selectedPlayers={selectedPlayers}
              label="Player 4"
              onChange={handlePlayerChanged}
            />
          )}
        </Paper>
      </Group>
      <Button
        mb={20}
        loading={loading}
        className="enter-score-button"
        rightSection={<IconDownload />}
        color="green"
        disabled={!submitActive}
        onClick={handleSubmit}
      >
        {submitText}
      </Button>
    </Stack>
  );
});
