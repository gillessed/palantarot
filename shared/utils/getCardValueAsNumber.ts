import type { RegValue, TrumpValue } from "../../server/play/model/Card";

export function getCardValueAsNumber(value: RegValue | TrumpValue): number {
  switch (value) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "10":
    case "11":
    case "12":
    case "13":
    case "14":
    case "15":
    case "16":
    case "17":
    case "18":
    case "19":
    case "20":
    case "21":
      return Number(value);
    case "V":
      return 11;
    case "C":
      return 12;
    case "D":
      return 13;
    case "R":
      return 14;
    case "Joker":
      return 0;
    default:
      throw new Error(value);
  }
}
