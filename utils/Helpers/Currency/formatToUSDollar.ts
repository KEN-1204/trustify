export const formatToUSDollar = (amount: number, includeCurrencySymbol = true, showNegativeSign = true) => {
  // マイナス記号を除去する場合、絶対値を使用
  if (!showNegativeSign) {
    amount = Math.abs(amount);
  }

  const options: Intl.NumberFormatOptions = { style: "currency", currency: "USD" };

  if (!includeCurrencySymbol) {
    options.style = "decimal";
  }

  return new Intl.NumberFormat("en-US", options).format(amount);
};

/**
、Intl.NumberFormatを使用すると、ロケールに応じた数値のフォーマットが適用されます。これには、3桁ごとの区切り文字（例えば、米国英語の場合はカンマ「,」）や、小数点の表記（米国英語の場合はピリオド「.」）も含まれます。したがって、上記の関数を使用すると、数値をドルとしてフォーマットする際に、自動的に適切な区切り文字も付与されます。

例えば、formatToUSDollar(1234567)を実行すると、結果は"$1,234,567.00"のようになり、3桁ごとにカンマが付与され、小数点以下も適切に表記されます（通貨記号を含む場合）。この挙動は、関数に渡されるオプションや指定されたロケールによって決定されます。
 */
