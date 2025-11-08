import { Loader, Stack, Text } from "@mantine/core";
import { ComponentProps, memo } from "react";
interface Props extends ComponentProps<typeof Loader> {
  text?: string;
}

export const SpinnerOverlay = memo(function SpinnerOverlay(props: Props) {
  const { text, ...otherProps } = props;
  return (
    <Stack justify="center" align="center">
      {text != null && <Text>{text}</Text>}
      <Loader {...otherProps} />
    </Stack>
  );
});
