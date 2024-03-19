// ユーザーの会計年度の年度初めから12ヶ月分の月度の配列を生成する関数

import { FiscalYearMonthKey, FiscalYearMonthObjForTarget } from "@/types";

// 開始年月から12ヶ月分の年月を計算する例 startYearMonth: 202304
export function calculateMonths(startYearMonth: number): FiscalYearMonthObjForTarget {
  let year = Math.floor(startYearMonth / 100); // 202304 -> 2023
  let month = startYearMonth % 100; // 202304 -> 4
  let months: FiscalYearMonthObjForTarget = {} as FiscalYearMonthObjForTarget;

  for (let i = 0; i < 12; i++) {
    let currentMonth = month + i;
    4;
    let currentYear = year;
    2023;
    if (currentMonth > 12) {
      // 12を超えたら
      currentMonth -= 12; // 13 - 12 = 1
      currentYear += 1; // 2023 + 1 = 2024
    }
    // month_01: 202304 ~ month_12: 202403
    let key = `month_${String(i + 1).padStart(2, "0")}` as FiscalYearMonthKey; // month_01~month_12まで順番に生成
    months[key] = currentYear * 100 + currentMonth;
  }

  return months;
}

// const monthsParams = calculateMonths(202304);
