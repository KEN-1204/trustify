// 半角数字のみで、小数点は四捨五入する

import Decimal from "decimal.js";

export function convertHalfWidthRoundNumOnly(input: string, decimalPlaces: number = 0) {
  // 全角数字を半角に変換する関数
  const fullWidthToHalfWidth = (str: string) =>
    str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 1. 全角数字を半角に変換
  let result = fullWidthToHalfWidth(input);

  // 2. 数字、小数点以外を除去
  result = result.replace(/[^\d.]/g, "");

  // 3. 数字が含まれていない場合は空文字を返す
  if (!/\d/.test(result)) {
    return "";
  }

  // 4. 小数点が含まれている場合は四捨五入
  if (result.includes(".")) {
    // return String(Math.round(parseFloat(result)));
    // Decimal.jsを使用して指定された桁数で四捨五入
    return new Decimal(result).toFixed(decimalPlaces, Decimal.ROUND_HALF_UP);
  }

  if (decimalPlaces > 0) {
    return new Decimal(result).toFixed(decimalPlaces, Decimal.ROUND_HALF_UP);
  }

  return result;
}

// 使用例
// console.log(convertAndProcessInput('１２３４.５６７８'));  // "1235"
// console.log(convertAndProcessInput('テスト'));           // ""
// console.log(convertAndProcessInput('１２３４円'));       // "1234"
