import { mappingMonthEnToJa, mappingMonthToAbbreviation } from "@/utils/mappings";

// メンバーレベル専用 半期詳細
export const formatRowNameShortHalfDetails = (
  row:
    | "half_year"
    | "first_quarter"
    | "second_quarter"
    | "month_01"
    | "month_02"
    | "month_03"
    | "month_04"
    | "month_05"
    | "month_06",
  year: number,
  periodType: "first_half_details" | "second_half_details",
  fiscalStartMonthsArray: (
    | "January"
    | "February"
    | "March"
    | "April"
    | "May"
    | "June"
    | "July"
    | "August"
    | "September"
    | "October"
    | "November"
    | "December"
  )[]
): { ja: string; en: string; [key: string]: string } => {
  const isFirstHalf = periodType === "first_half_details";
  switch (row) {
    case "half_year":
      return isFirstHalf ? { ja: `${year}H1`, en: `${year}H1` } : { ja: `${year}H2`, en: `${year}H2` };
    case "first_quarter":
      return isFirstHalf ? { ja: `${year}Q1`, en: `${year}Q1` } : { ja: `${year}Q3`, en: `${year}Q3` };
    case "second_quarter":
      return isFirstHalf ? { ja: `${year}Q2`, en: `${year}Q2` } : { ja: `${year}Q4`, en: `${year}Q4` };
    case "month_01":
      return isFirstHalf
        ? {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[0]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[0]]}`,
          }
        : {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[6]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[6]]}`,
          };
    case "month_02":
      return isFirstHalf
        ? {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[1]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[1]]}`,
          }
        : {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[7]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[7]]}`,
          };
      break;
    case "month_03":
      return isFirstHalf
        ? {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[2]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[2]]}`,
          }
        : {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[8]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[8]]}`,
          };
      break;
    case "month_04":
      return isFirstHalf
        ? {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[3]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[3]]}`,
          }
        : {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[9]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[9]]}`,
          };
      break;
    case "month_05":
      return isFirstHalf
        ? {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[4]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[4]]}`,
          }
        : {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[10]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[10]]}`,
          };
      break;
    case "month_06":
      return isFirstHalf
        ? {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[5]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[5]]}`,
          }
        : {
            ja: `${year}/${mappingMonthEnToJa[fiscalStartMonthsArray[11]]}月`,
            en: `${year}${mappingMonthToAbbreviation[fiscalStartMonthsArray[11]]}`,
          };
      break;

    default:
      return { ja: row, en: row };
      break;
  }
};
