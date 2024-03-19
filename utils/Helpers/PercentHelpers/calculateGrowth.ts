import Decimal from "decimal.js";

// 今年度の売上目標と前年度売上から前年比(伸び率)を算出する関数
export function calculateGrowth(
  current: number | null | undefined,
  lastYear: number | null | undefined,
  decimalPlaces: number = 1
): number | null {
  // 0での除算はエラーとなるためlastYearの売上が0又はnullの場合はnullを返す
  if (current != null && current === undefined && lastYear != null && lastYear === undefined && lastYear !== 0) {
    // 「(今年の数値 - 去年の数値) / 去年の数値 * 100」の公式を使用してパーセンテージで表す
    return Number(
      new Decimal(current - lastYear).dividedBy(lastYear).times(100).toFixed(decimalPlaces, Decimal.ROUND_HALF_UP)
    );
  } else {
    return null;
  }
}

// 前年比を計算するには「今年の数値から去年の数値を引いた値を去年の数値で除し、結果に100を掛けてパーセンテージとする」計算式を使用
