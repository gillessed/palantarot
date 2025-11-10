import { ActionIcon, Group, NumberInput, Paper, Select } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { memo, useCallback, useState } from "react";
import {
  isScoreOperator,
  ScoreOperators,
  ScoreQuery,
} from "../../../server/model/Search";

interface Props {
  index: number;
  scoreQuery: ScoreQuery;
  onChange: (query: ScoreQuery, index: number) => void;
  onDelete: (index: number) => void;
}

export const ScoreQueryComponent = memo(function ScoreQueryComponent({
  index,
  onChange,
  onDelete,
  scoreQuery,
}: Props) {
  const [internalScoreValue, setInternalScoreValue] = useState<number | string>(
    scoreQuery.value
  );
  const [scoreError, setScoreError] = useState<string | undefined>();

  const handleValueChanged = useCallback(
    (value: string | number) => {
      let numberValue: number | null = null;
      setInternalScoreValue(value);
      try {
        numberValue = Number(value);
        const newQuery = {
          ...scoreQuery,
          value: numberValue,
        };
        onChange(newQuery, index);
        setScoreError(undefined);
      } catch (e) {
        setScoreError("Invalid score");
      }
    },
    [setInternalScoreValue, scoreQuery, onChange, setScoreError]
  );

  const handleOperatorChanged = useCallback(
    (operatorString: string | null) => {
      const operator = isScoreOperator(operatorString) ? operatorString : "=";
      const newQuery = {
        ...scoreQuery,
        predicate: operator,
      };
      onChange(newQuery, index);
    },
    [scoreQuery, onChange]
  );

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [index]);

  return (
    <Group>
      <Group>
        <Select
          value={scoreQuery.operator}
          onChange={handleOperatorChanged}
          data={ScoreOperators}
        />
        <NumberInput value={internalScoreValue} onChange={handleValueChanged} />
      </Group>
      <ActionIcon variant="light" onClick={handleDelete}>
        <IconTrash />
      </ActionIcon>
    </Group>
  );
});
