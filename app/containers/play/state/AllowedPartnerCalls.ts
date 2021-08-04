import { RegValue } from "../../../../server/play/model/Card";
import { ClientGame } from "../../../services/room/ClientGame";
import { ClientGameSelectors } from "../../../services/room/ClientGameSelectors";

export function getAllowedPartnerCalls(game: ClientGame) {
  const counts = ClientGameSelectors.getValueCounts(game);
  const allowAll = game.settings?.bakerBengtsonVariant;
  const canPickD = counts.get(RegValue.R) === 4 || allowAll || false;
  const canPickC = canPickD && counts.get(RegValue.D) === 4 || allowAll || false;
  const canPickV = canPickC && counts.get(RegValue.C) === 4 || allowAll || false;
  return {
    canPickD,
    canPickC,
    canPickV,
  };
}
