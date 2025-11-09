import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { memo } from "react";

export const ErrorAlert = memo(function ErrorAlert({ children }: React.PropsWithChildren) {
  return (
    <Alert variant="light" color="red" title="Error" icon={<IconInfoCircle />}>
      {children}
    </Alert>
  );
});
