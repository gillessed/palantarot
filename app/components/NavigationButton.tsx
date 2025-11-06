import { Button, MantineColor } from "@mantine/core";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router";

interface Props {
  title: string;
  icon: React.ReactNode;
  to: string;
  color: MantineColor;
}

export const NavigationButton = memo(function NavigationButton({ title, icon, color, to }: Props) {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    navigate(to);
  }, [navigate, to]);
  return (
    <Button leftSection={icon} color={color} onClick={handleClick} w={200} mb={0}>
      {title}
    </Button>
  );
});
