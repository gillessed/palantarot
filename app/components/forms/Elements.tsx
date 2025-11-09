import {
  ActionIcon,
  Group,
  TextInput as MantineTextInput,
  NumberInput,
  Select,
  type ComboboxItem
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import React, { memo, useCallback, useEffect, useState } from "react";

interface InputProps {
  label: string;
  initialValue?: string;
  initialError?: string;
  onChange?: (value: string, error?: string) => void;
  validator?: (value: string) => string | undefined;
}

export const TextInput = memo(function TextInput({
  initialError,
  initialValue,
  label,
  onChange,
  validator,
}: InputProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    setError(initialError);
  }, [setError, initialError]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value;
      const error = validator?.(newValue);
      setValue(newValue);
      setError(error);
      onChange?.(newValue, error);
    },
    [setValue, setError, onChange, validator]
  );

  return (
    <MantineTextInput
      label={label}
      error={error}
      value={value}
      onChange={handleChange}
    />
  );
});

interface PointsInputProps extends InputProps {
  points?: number;
  w?: number;
}

export const PointsInput = memo(function PointsInput({
  initialError,
  label,
  validator,
  points,
  w,
  onChange,
}: PointsInputProps) {
  const [error, setError] = useState(initialError);

  useEffect(() => {
    setError(initialError);
  }, [setError, initialError]);

  const handleChange = useCallback(
    (untypedValue: number | string) => {
      const newValue = `${untypedValue}`;
      const error = validator?.(newValue);
      setError(error);
      onChange?.(newValue, error);
    },
    [setError, validator]
  );

  const handlePlusPress = useCallback(() => {
    if (points == null || points > 0) {
      return;
    }
    const newValue = -points;
    handleChange(newValue);
  }, [points]);

  const handleMinusPress = useCallback(() => {
    if (points == null || points < 0) {
      return;
    }
    const newValue = -points;
    handleChange(newValue);
  }, [points]);

  return (
    <Group align="flex-start">
      <ActionIcon color="red" onClick={handleMinusPress} mt={28}>
        <IconMinus />
      </ActionIcon>
      <NumberInput
        w={w}
        value={points}
        onChange={handleChange}
        error={error}
        label={label}
      />
      <ActionIcon color="green" onClick={handlePlusPress} mt={28}>
        <IconPlus />
      </ActionIcon>
    </Group>
  );
});

interface SelectProps extends InputProps {
  values: ComboboxItem[];
  w?: number;
}

export const SelectInput = memo(function SelectInput({
  validator,
  values,
  label,
  initialValue,
  initialError,
  w,
  onChange,
}: SelectProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(initialError);

  const handleChange = useCallback(
    (newValue: string | null) => {
      if (newValue == null) {
        return;
      }
      const error = validator?.(newValue);
      setError(error);
      setValue(newValue);
      onChange?.(newValue, error);
    },
    [setError, setValue, onChange, validator]
  );

  return (
    <Select
      value={value}
      data={values}
      onChange={handleChange}
      label={label}
      w={w}
      error={error}
    />
  );
});
