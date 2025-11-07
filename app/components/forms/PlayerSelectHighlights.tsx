import { memo } from "react";

interface Props {
  text: string;
  highlights: [number, number][];
}

export const PlayerSelectHighlights = memo(function PlayerSelectHighlights({ text, highlights }: Props) {
  const nodes: React.ReactNode[] = [];
  let startText = highlights[0][0] > 0 ? text.substring(0, highlights[0][0]) : undefined;
  if (startText !== undefined) {
    nodes.push(<span key="start">{startText}</span>);
  }
  for (let hightlightIndex = 0; hightlightIndex < highlights.length; hightlightIndex++) {
    const highlighted = text.substring(highlights[hightlightIndex][0], highlights[hightlightIndex][1] + 1);
    nodes.push(
      <span className="highlighted" key={`h-${hightlightIndex}`}>
        {highlighted}
      </span>
    );
    if (hightlightIndex < highlights.length - 1) {
      const unhighlighted = text.substring(highlights[hightlightIndex][1] + 1, highlights[hightlightIndex + 1][0]);
      nodes.push(<span key={`u-${hightlightIndex}`}>{unhighlighted}</span>);
    } else if (highlights[hightlightIndex][1] < text.length) {
      const unhighlighted = text.substring(highlights[hightlightIndex][1] + 1, text.length);
      nodes.push(<span key={`u-${hightlightIndex}`}>{unhighlighted}</span>);
    }
  }
  return <span className="hightlighted-match">{nodes}</span>;
});
