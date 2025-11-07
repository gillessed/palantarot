import { Loader } from "@mantine/core";
import { ComponentProps, memo } from "react";
interface Props extends ComponentProps<typeof Loader> {
  text?: string;
}

export const SpinnerOverlay = memo(function SpinnerOverlay(props: Props) {
  const { text, ...otherProps } = props;
  return (
    <div className="pt-spinner-overlay-container">
      {text != null && <div className="pt-spinner-overlay-text">{text}</div>}
      <Loader {...otherProps} />
    </div>
  );
});
