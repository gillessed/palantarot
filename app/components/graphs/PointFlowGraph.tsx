import { BarChart } from "@mantine/charts";
import { memo, useCallback, useMemo } from "react";
import { getGradientColor, type Gradient } from "../../utils/Gradient";

export interface PointFlow {
  playerName: string;
  value: number;
}

interface Props {
  pointFlows: PointFlow[];
}

const SeriesName = "Point Delta";
const Series = [{ name: SeriesName, color: "blue" }];

export const PointFlowGraph = memo(function BidsGraph({ pointFlows }: Props) {
  const { data, max } = useMemo(() => {
    let max = 0;
    const data = [];
    for (const flow of pointFlows) {
      data.push({ [SeriesName]: flow.value, playerName: flow.playerName });
      if (Math.abs(flow.value) > max) {
        max = Math.abs(flow.value);
      }
    }
    return { data, max };
  }, [pointFlows]);

  const getBarColor = useCallback(
    (value: number) => {
      const gradient: Gradient = [
        [-max, { r: 256, g: 0, b: 0 }],
        [0, { r: 256, g: 256, b: 0 }],
        [max, { r: 0, g: 256, b: 0 }],
      ];
      const { r, g, b } = getGradientColor(value, gradient);
      return `rgb(${r} ${g} ${b})`;
    },
    [max]
  );

  return (
    <BarChart
      h={500}
      data={data}
      dataKey="playerName"
      series={Series}
      getBarColor={getBarColor}
    />
  );
});
