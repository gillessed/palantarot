import { useCallback, useState } from "react";

export function useBooleanState(initialValue?: boolean) {
  const [value, setValue] = useState(initialValue ?? false);
  const setValueTrue = useCallback(() => {
    setValue(true);
  }, []);
  const setValueFalse = useCallback(() => {
    setValue(false);
  }, []);
  const toggleValue = useCallback(() => {
    setValue(!value);
  }, [value]);
  return {
    value,
    setValue,
    setValueTrue,
    setValueFalse,
    toggleValue,
  };
}
