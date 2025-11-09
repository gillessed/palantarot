import { Flex, Text } from "@mantine/core";
import { memo } from "react";

interface Props {
  score: number;
  size: "lg" | "sm";
}

export const ScoreBox = memo(function ScoreBox({ score, size }: Props) {
  const scoreText = score > 0 ? "+" + score : score;
  const scoreColor =
    score == 0 ? "gray.6" : score > 0 ? "green" : "red";
  const dim = size === "lg" ? 100 : 60;
  const textSize = size === "lg" ? 48 : 24;
  return (
    <Flex align="center" justify="center" bg={scoreColor} h={dim} miw={dim}>
      <Text ff="blenderProBold" c="white" size="xl" pl={10} pr={10} style={{ fontSize: textSize }}>
        {scoreText}
      </Text>
    </Flex>
  );
});
