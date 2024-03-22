import Decimal from "decimal.js";

// // 事前に数字か、数字と小数点のみかどうかをチェックする
// function isValidNumber(inputStr: string) {
//   if (typeof inputStr !== "string") {
//     return false;
//   }

//   // 数字と小数点のみを許容する正規表現
//   // 入力が「整数だけ」または「小数点を含む正の数値でかつ先頭に数字が１回以上」の場合のみ許可しそれ以外はfalse
//   if (!/^\d+(\.\d+)?$/.test(inputStr)) {
//     return false;
//   }

//   const number = parseFloat(inputStr);
//   if (isNaN(number)) {
//     return false;
//   }

//   return true;
// }

// 数値かどうかを検証し、Decimalインスタンスを返すユーティリティ関数
function createDecimal(value: string | number): { result: Decimal | null; error: string | null } {
  try {
    return { result: new Decimal(value), error: null };
  } catch (error) {
    console.error(`入力値"${value}"が無効です。`);
    return { result: null, error: `入力値"${value}"が無効です。` };
  }
}

interface YearOverYearResult {
  yearOverYear: string | number | null;
  isPositive: boolean;
  error: string | null;
}

export function calculateYearOverYear(
  thisYearTarget: string | number | null | undefined,
  lastYearSales: string | number | null | undefined,
  decimalPlace: number = 2,
  numResponse: boolean = true, // number型でレスポンスするか否か
  showPercentSign: boolean = false,
  showNegativeSign: boolean = false
): YearOverYearResult {
  // どちらかがnullかundefinedの場合はそのまま空文字で返す
  if (
    thisYearTarget === null ||
    thisYearTarget === undefined ||
    lastYearSales === null ||
    lastYearSales === undefined
  ) {
    return {
      yearOverYear: null,
      isPositive: false,
      error: `${!thisYearTarget ? `売上目標が無効な値です。` : ``} ${
        !lastYearSales ? `前年度売上が無効な値です。` : ``
      }`,
    };
  }
  const { result: lastYearSalesDecimal, error: lastYearSalesError } = createDecimal(lastYearSales);
  const { result: thisYearTargetDecimal, error: thisYearTargetError } = createDecimal(thisYearTarget);

  // エラーチェック
  if (lastYearSalesError || thisYearTargetError || !lastYearSalesDecimal || !thisYearTargetDecimal) {
    return { yearOverYear: null, isPositive: false, error: lastYearSalesError || thisYearTargetError };
  }

  // 前年度の売上が0の場合はエラー
  if (lastYearSalesDecimal.isZero()) {
    console.error("前年度の売上が0の場合、前年比は算出できません。");
    return { yearOverYear: null, isPositive: false, error: "前年度の売上が0の場合、前年比は算出できません。" };
  }

  // 前年比の計算: ((今年の目標 - 前年度の売上) / 前年度の売上) * 100
  const yearOverYear = thisYearTargetDecimal.minus(lastYearSalesDecimal).dividedBy(lastYearSalesDecimal).times(100);
  // 前年比が正の値かどうかチェック
  const isPositive = yearOverYear.greaterThan(0);

  if (numResponse) {
    return {
      yearOverYear: Number(yearOverYear.toFixed(decimalPlace, Decimal.ROUND_HALF_UP)),
      isPositive,
      error: null,
    };
  }

  // 結果のフォーマット
  const formattedResult = `${showNegativeSign && !isPositive ? "-" : ""}${yearOverYear.toFixed(
    decimalPlace,
    Decimal.ROUND_HALF_UP
  )}${showPercentSign ? `%` : ``}`;

  return {
    yearOverYear: formattedResult,
    isPositive,
    error: null,
  };
}
