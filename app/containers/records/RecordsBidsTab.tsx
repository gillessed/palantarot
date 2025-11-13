import { Center, Stack, Title } from "@mantine/core";
import { memo } from "react";
import type { BidStats } from "../../../server/model/Bid";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { BidsGraph } from "../../components/graphs/BidsGraph";
import { BidsLoader } from "../../services/loaders/BidsLoader";

interface LoadedProps {
  bids: BidStats;
}

const RecordsBidsTabLoaded = memo(function RecordsBidsTabLoaded({
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

const Args = {
  bids: {},
};

export const RecordsBidsTab = memo(function RecordsBidsTab() {
  return (
    <AsyncView<Loaders>
      loaders={Loaders}
      args={Args}
      Component={RecordsBidsTabLoaded}
    />
  );
});
