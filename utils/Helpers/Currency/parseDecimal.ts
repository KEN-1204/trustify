import Decimal from "decimal.js";
import { zenkakuToHankaku } from "../zenkakuToHankaku";

export const parseDecimal = (input: string | number) => {
  if (typeof input === "number") {
    return new Decimal(input);
  } else {
    const normalizedInput = zenkakuToHankaku(input).replace(/[^\d.]/g, "");
    return new Decimal(normalizedInput);
  }
};
