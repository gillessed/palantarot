import React from "react";
import { Card } from "../../../../server/play/model/Card";
import { SpectatorModeNone } from "../SpectatorMode";
import { BottomLeftStatusLayout } from "./BottomLeftStatus";
import { HandCardPopup, HandCardSelectablePopup } from "./CardSpec";
import { HandSvg } from "./HandSvg";
import { getTitleLayout } from "./PlayerTitleSvg";
import { getTitleArrangementSpec } from "./TitleArrangementSpec";

export namespace BottomHandSvg {
  export interface Props {
    svgWidth: number;
    svgHeight: number;
    cards: Card[];
    selectedCards?: Set<Card>;
    dogCards?: Set<Card>;
    selectableFilter?: (card: Card) => boolean;
    onClick?: (card: Card) => void;
  }
}

export class BottomHandSvg extends React.Component<BottomHandSvg.Props> {
  public render() {
    const { svgWidth, svgHeight, cards, selectedCards, dogCards, selectableFilter, onClick } = this.props;
    const titleLayout = getTitleLayout(getTitleArrangementSpec(3, SpectatorModeNone)[0](svgWidth, svgHeight));
    const leftBound = BottomLeftStatusLayout.Width + 20;
    const rightBound = titleLayout.cardx - 20;

    return (
      <HandSvg
        top={svgHeight - HandCardPopup}
        left={leftBound}
        right={rightBound}
        alignment="center"
        popup={HandCardSelectablePopup}
        cards={cards}
        selectedCards={selectedCards}
        dogCards={dogCards}
        selectableFilter={selectableFilter}
        onClick={onClick}
      />
    );
  }
}
