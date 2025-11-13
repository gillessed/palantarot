import { Center, Stack, Title } from "@mantine/core";
import { memo, useMemo } from "react";
import type { BidStats } from "../../../server/model/Bid";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { BidsGraph } from "../../components/graphs/BidsGraph";
import { BidsLoader } from "../../services/loaders/BidsLoader";

interface LoadedProps {
  bids: BidStats;
}

const PlayerBidsTabLoaded = memo(function PlayerBidsTabLoaded({
  bids,
}: LoadedProps) {
  return (
    <Stack mt={20}>
      <Center>
        <Title order={1}>Bids</Title>
      </Center>
      <BidsGraph bids={bids} />
    </Stack>
  );
});

const Loaders = {
  bids: BidsLoader,
};
type Loaders = typeof Loaders;

interface Props {
  playerId: string;
}

export const PlayerBidsTab = memo(function PlayerBidsTab({ playerId }: Props) {
  const args = useMemo(
    () => ({
      bids: {
        playerId,
      },
    }),
    [playerId]
  );

  return (
    <AsyncView<Loaders>
      loaders={Loaders}
      args={args}
      Component={PlayerBidsTabLoaded}
    />
  );
});
