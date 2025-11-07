import { ActionIcon, Fieldset, Group, NumberInput, Select, type ComboboxItem } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import React, { memo, useCallback, useEffect, useState } from "react";

interface InputProps {
  label: string;
  initialValue?: string;
  initialError?: string;
  onChange?: (value: string, error?: string) => void;
  validator?: (value: string) => string | undefined;
}

interface InputState {
  value: string;
  error?: string;
}

export class TextInput extends React.PureComponent<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = {
      value: props.initialValue || "",
      error: props.initialError || "",
    };
  }

  public componentWillReceiveProps(nextProps: InputProps) {
    if (nextProps.initialError) {
      this.setState({
        error: nextProps.initialError,
      });
    }
  }

  public render() {
    return (
      <div></div>
      // <FormGroup label={this.props.label} labelFor="text-input">
      //   <InputGroup
      //     id="text-input"
      //     value={this.state.value}
      //     onChange={this.onChange}
      //     intent={this.state.error ? Intent.DANGER : Intent.NONE}
      //   />
      // </FormGroup>
    );
  }

  private onChange = (event: any) => {
    const newValue = event.target.value;
    const error = this.props.validator ? this.props.validator(newValue) : undefined;
    this.setState({
      value: newValue,
      error,
    });
    if (this.props.onChange) {
      this.props.onChange(newValue, error);
    }
  };
}

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
    [setError]
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
      <NumberInput w={w} value={points} onChange={handleChange} error={error} label={label} />
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
    [setError, setValue, onChange]
  );

  return <Select value={value} data={values} onChange={handleChange} label={label} w={w} error={error} />;
});
