import { MultiSelect } from "@mantine/core";
import { memo, useCallback, useMemo } from "react";

const NumPlayers = ["3", "4", "5"];

interface Props {
  numberOfPlayers: number[];
  onChange: (numberOfPlayers: number[]) => void;
}

export const PlayerCountQueryComponent = memo(
  function PlayerCountQueryComponent({ numberOfPlayers, onChange }: Props) {
    const value = useMemo(
      () => numberOfPlayers.map((num) => `${num}`),
      [numberOfPlayers]
    );
    const handleChange = useCallback(
      (values: string[]) => {
        const newNumValues = values.map((str) => Number(str));
        onChange(newNumValues);
      },
      [onChange]
    );
    return (
      <MultiSelect value={value} onChange={handleChange} data={NumPlayers} />
    );
  }
);
