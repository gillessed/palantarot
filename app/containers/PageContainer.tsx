import { Container, Stack, Title } from "@mantine/core";
import { memo } from "react";

interface Props {
  title?: string;
}

export const PageContainer = memo(function PageContainer({
  children,
  title,
}: React.PropsWithChildren<Props>) {
  return (
    <Container size="lg" pt={56} mb={20}>
      {title && (
        <Stack align="center" mt={40} mb={40}>
          <Title order={1}>{title}</Title>
        </Stack>
      )}
      {children}
    </Container>
  );
});
