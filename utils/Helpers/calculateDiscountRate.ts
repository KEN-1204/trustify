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

export const calculateDiscountRate = ({
  salesPriceStr,
  discountPriceStr,
  salesQuantityStr = "1",
}: {
  salesPriceStr: string;
  discountPriceStr: string;
  salesQuantityStr: string;
}) => {
  //   // 文字列から数値に変換
  //   const salesPrice = parseInt(salesPriceStr.replace(/,/g, ""), 10);
  //   const discountPrice = parseInt(discountPriceStr.replace(/,/g, ""), 10);

  //   // 値引率の計算
  //   const discountRate = (discountPrice / salesPrice) * 100;

  //   return discountRate.toFixed(2); // 小数点以下2桁で四捨五入

  // 入力値の検証
  if (!isValidNumber(salesPriceStr) || !isValidNumber(discountPriceStr) || !isValidNumber(salesQuantityStr)) {
    console.log(
      "salesPriceStr",
      salesPriceStr,
      "discountPriceStr",
      discountPriceStr,
      "salesQuantityStr",
      salesQuantityStr
    );
    // 無効な入力の場合はエラーメッセージを返す
    return { discountRate: null, error: `無効な入力値です。` };
  }

  // 文字列から数値に変換
  const salesPrice = new Decimal(salesPriceStr.replace(/,/g, ""));
  const discountPrice = new Decimal(discountPriceStr.replace(/,/g, ""));
  const salesQuantity = new Decimal(salesQuantityStr.replace(/,/g, ""));

  // 売上合計額の計算
  const totalSalesAmount = salesPrice.times(salesQuantity);

  // 売上価格が0の場合はエラーを返す
  if (salesPrice.isZero()) {
    return { discountRate: null, error: "売上価格が0の場合、値引率は算出できません。" };
  }

  // 値引率の計算
  const discountRate = discountPrice.dividedBy(totalSalesAmount).times(100);

  console.log(
    "結果　discountRate",
    discountRate.toFixed(2) + "%",
    "discountPrice",
    discountPrice.toString(),
    "totalSalesAmount",
    totalSalesAmount.toString(),
    "salesPrice",
    salesPrice.toString(),
    "salesQuantity",
    salesQuantity.toString()
  );
  return { discountRate: discountRate.toFixed(2) + `%`, error: null };
  // return { discountRate: discountRate, error: null };
};
