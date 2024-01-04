// 売上価格と値引き価格から値引率を算出する関数

import Decimal from "decimal.js";

// 事前に数字か、数字と小数点のみかどうかをチェックする
function isValidNumber(inputStr: string) {
  if (typeof inputStr !== "string") {
    return false;
  }

  if (!/^\d+(\.\d+)?$/.test(inputStr)) {
    // 数字と小数点のみを許容する正規表現
    return false;
  }

  const number = parseFloat(inputStr);
  if (isNaN(number)) {
    return false;
  }

  // 他の条件や範囲のチェック
  // 例: number >= 0

  return true;
}

const calculateDiscountRate = ({
  salesPriceStr,
  discountPriceStr,
}: {
  salesPriceStr: string;
  discountPriceStr: string;
}) => {
  //   // 文字列から数値に変換
  //   const salesPrice = parseInt(salesPriceStr.replace(/,/g, ""), 10);
  //   const discountPrice = parseInt(discountPriceStr.replace(/,/g, ""), 10);

  //   // 値引率の計算
  //   const discountRate = (discountPrice / salesPrice) * 100;

  //   return discountRate.toFixed(2); // 小数点以下2桁で四捨五入

  // 入力値の検証
  if (!isValidNumber(salesPriceStr) || !isValidNumber(discountPriceStr)) {
    // 無効な入力の場合はエラーメッセージを返す
    return { discountRate: null, error: "無効な入力値です。" };
  }

  // 文字列から数値に変換
  const salesPrice = new Decimal(salesPriceStr.replace(/,/g, ""));
  const discountPrice = new Decimal(discountPriceStr.replace(/,/g, ""));

  // 売上価格が0の場合はエラーを返す
  if (salesPrice.isZero()) {
    return { discountRate: null, error: "売上価格が0の場合、値引率は算出できません。" };
  }

  // 値引率の計算
  const discountRate = discountPrice.dividedBy(salesPrice).times(100);

  //   return { discountRate: discountRate.toFixed(2) };
  return { discountRate: discountRate, error: null };
};
