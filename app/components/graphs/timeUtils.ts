import moment from "moment";
import type { Month } from "../../../server/model/Month";

export function getStartOfMonth(month: Month) {
  const dateNumber = moment().year(month.year).month(month.month).date(1).hour(0).minute(0).second(0).unix();
  return dateNumber;
}
