export const formatToJapaneseYen = (amount: number, includeCurrencySymbol = true, showNegativeSign = true) => {
  // マイナス記号を除去する場合、絶対値を使用
  if (!showNegativeSign) {
    amount = Math.abs(amount);
  }

  const options = { style: "currency", currency: "JPY" };

  if (!includeCurrencySymbol) {
    options.style = "decimal";
  }

  return new Intl.NumberFormat("ja-JP", options).format(amount);
};
// 例: 通貨記号を含める
// console.log(formatToJapaneseYen(2940)); // 出力: "¥2,940"

// 例: 通貨記号を含めない
// console.log(formatToJapaneseYen(2940, false)); // 出力: "2,940"

// 第一引数と第三引数のみに引数を渡したい場合には、undefinedを渡すことで第二引数をデフォルト値の状態で実行できる
// console.log(formatToJapaneseYen(-2940, undefined, false)); // 第二引数にundefinedを渡す
