export function convertToJapaneseCurrencyFormat(number: number): string {
  // 兆、億、万の単位で分割
  const trillion = Math.floor(number / 100000000); // 1兆 = 100,000,000万
  const billion = Math.floor((number % 100000000) / 10000); // 1億 = 10,000万
  const million = number % 10000;

  // 金額をフォーマットする
  let formattedString = "";

  if (trillion > 0) {
    formattedString += `${trillion.toLocaleString()}兆`;
  }
  if (billion > 0) {
    formattedString += `${billion.toLocaleString()}億`;
  }
  if (million > 0) {
    formattedString += `${million.toLocaleString()}万`;
  }

  formattedString = `${formattedString}円`;

  return formattedString;
}

// 使用例
// console.log(convertToJapaneseCurrencyFormat(1000000)); // "1兆円"
// console.log(convertToJapaneseCurrencyFormat(123456789)); // "123兆4,567億8,900万円"
