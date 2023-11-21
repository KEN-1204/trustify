// 小数点第3位まで表示し、それ以降を切り捨て
export const truncateToThirdDecimalPlace = (num: number) => {
  return Math.floor(num * 1000) / 1000;
};

/**
const originalNumber = 123.456789;
const truncatedNumber = truncateToThirdDecimalPlace(originalNumber);

console.log(truncatedNumber); // 123.456 と表示される

このコードでは、まず元の数値に1000を乗算して小数点以下を整数部に移動させ、Math.floor() で小数部を切り捨て、その後1000で除算して元のスケールに戻しています。これにより、小数点以下第3位までの数値を得ることができます。
 */
