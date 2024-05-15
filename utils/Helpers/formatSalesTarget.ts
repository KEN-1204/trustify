/**
console.log(formatNumber(1000)); // "1000"
console.log(formatNumber(12000)); // "1.2万"
console.log(formatNumber(12040)); // "1.204万"
console.log(formatNumber(1234500)); // "123.45万" ですが、仕様に合わせるなら "123.4万" の処理をする必要があります
console.log(formatNumber(1230000000)); // "12.3億"
console.log(formatNumber(1204000000)); // "12.04億"
console.log(formatNumber(123000000000)); // "1230億"
 */

//
export function formatSalesTarget(
  num: number,
  rounding: "round" | "floor" = "round",
  isInteger: boolean = false
): string {
  let unit = "";
  let dividedNum = num;

  if (num >= 1000000000000) {
    dividedNum = num / 1000000000000;
    unit = "兆";
  } else if (num >= 100000000) {
    dividedNum = num / 100000000;
    unit = "億";
  } else if (num >= 10000) {
    dividedNum = num / 10000;
    unit = "万";
  } else {
    return num.toString();
  }

  // 整数部の桁数に基づく小数点以下の桁数を調整(floorで小数点を切り捨て)
  let integerPartLength = Math.floor(dividedNum).toString().length;
  let decimalPlaces = 0; // 小数点以下の桁数初期値

  switch (integerPartLength) {
    case 1:
      decimalPlaces = 3; // 整数部分が１桁の場合、小数点以下3桁
      break;
    case 2:
      decimalPlaces = 2; // 整数部分が2桁の場合、小数点以下2桁
      break;
    case 3:
      decimalPlaces = 1; // 整数部分が3桁の場合、小数点以下1桁
      break;
    // 整数部分が4桁以上の場合は小数点以下0桁(小数点なし)
    default:
      break;
  }

  // 切り捨てを選択された場合はfloorの処理を行う 123.45 => 123.4にする(roundの場合は123.45 => 123.5)
  let roundedNum = dividedNum;
  if (rounding === "floor") {
    let factor = Math.pow(10, decimalPlaces); // 10 or 100 or 1000
    roundedNum = Math.floor(dividedNum * factor) / factor;
  }

  // 小数点以下の桁数に基づき数値をフォーマット
  let formattedNumber = roundedNum.toFixed(decimalPlaces);
  // 末尾の不要な0を削除
  const formattedNumberWithoutZero = parseFloat(formattedNumber).toString();

  // console.log(
  //   "formattedNumber",
  //   formattedNumber,
  //   "formattedNumberWithoutZero",
  //   formattedNumberWithoutZero,
  //   "dividedNum",
  //   dividedNum
  // );

  // isIntegerの場合は小数点ではなく、四捨五入して整数を返す
  if (isInteger) {
    const integerNum = Number(formattedNumberWithoutZero).toFixed();
    return integerNum.length === 4 ? `${Number(integerNum).toLocaleString()}${unit}` : `${integerNum}${unit}`;
  }

  // 1.204億, 12.2億, 12.24億, 1234万, 123.4万 の形で小数点を含めずに4文字以内の金額に整形
  // 1234万や1234億のように整数で4桁の場合は区切り文字を付ける
  return formattedNumberWithoutZero.length === 4
    ? `${Number(formattedNumberWithoutZero).toLocaleString()}${unit}`
    : `${formattedNumberWithoutZero}${unit}`;
  //   return `${formattedNumber}${unit}`;
}

/**
このコードスニペットは、指定された小数点以下の桁数で数値を四捨五入または切り捨てるための計算を行います。ここでの主な目的は、数値を特定の小数点桁で正確に丸めることです。そのために、次のようなステップを踏みます。

1. 乗数（factor）の計算
typescript
Copy code
let factor = Math.pow(10, decimalPlaces);
Math.pow(10, decimalPlaces)は、10をdecimalPlaces（小数点以下の桁数）で累乗します。この計算により、後続の計算で使用する乗数（factor）が求められます。例えば、小数点以下2桁を丸める場合、decimalPlacesは2になり、factorは100（10^2）になります。
2. 数値の丸め
typescript
Copy code
let roundedNum = dividedNum;
if (rounding === 'round') {
    roundedNum = Math.round(dividedNum * factor) / factor;
} else if (rounding === 'floor') {
    roundedNum = Math.floor(dividedNum * factor) / factor;
}
この部分では、まず入力された数値（dividedNum）に先ほど計算した乗数（factor）を掛けます。これにより、小数点を丸めたい桁を整数部分に移動します。例えば、12.345を小数点以下2桁で丸めたい場合、12.345 * 100 = 1234.5となります。

次に、Math.round()またはMath.floor()を使用して、この結果を四捨五入または切り捨てます。Math.round(1234.5)は1235に、Math.floor(1234.5)は1234になります。

最後に、この結果を再びfactorで割ります。これにより、数値を元のスケールに戻しつつ、指定された小数点以下の桁数で丸めた結果を得ます。例えば、四捨五入した場合は1235 / 100 = 12.35、切り捨てた場合は1234 / 100 = 12.34となります。

この方法により、小数点以下を指定された桁数で正確に四捨五入または切り捨てることができます。この計算は、特に金額や測定値を特定の精度で表示する必要がある場合に便利です。


 */
