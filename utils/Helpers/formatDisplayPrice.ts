import { formatToJapaneseYen } from "./formatToJapaneseYen";

export const formatDisplayPrice = (price: number | string, language: string = "ja"): string => {
  switch (language) {
    case "ja":
      const priceNum = typeof price === "number" ? price : Number(price);
      return formatToJapaneseYen(priceNum, true, false);
      break;
    default:
      return typeof price === "number" ? price.toString() : price;
      break;
  }
};
