// nで渡された数値をdigitsで渡した任意の小数点以下の桁で四捨五入する関数
export function roundTo(n: number, digits: number) {
  if (digits === undefined) {
    digits = 0;
  }
  const multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  return Math.round(n) / multiplicator;
}

/**
「const multiplicator = Math.pow(10, digits);
n = parseFloat((n * multiplicator).toFixed(11));
return Math.round(n) / multiplicator;」
の処理の詳細

Math.pow(10, digits) の計算Math.pow(10, digits) は、10 の digits 乗を計算します。ここで digits は四捨五入したい小数点以下の桁数です。
例: digits が 1 の場合、Math.pow(10, 1) は 10。
例: digits が 2 の場合、Math.pow(10, 2) は 100。
この値 (multiplicator) を使って、四捨五入する桁を整数部にシフトします。
n * multiplicator の計算n * multiplicator により、n の小数点を digits 桁だけ右に移動します。これにより、四捨五入したい桁が整数部に来ます。
例: n = 2.345 で digits = 1 の場合、2.345 * 10 = 23.45。
例: n = 2.345 で digits = 2 の場合、2.345 * 100 = 234.5。
.toFixed(11) の使用JavaScript では浮動小数点数の計算に誤差が生じることがあります。.toFixed(11) は数値を文字列に変換し、小数点以下 11 桁で四捨五入して文字列で返します。この手法は、浮動小数点の計算誤差を修正する一般的なテクニックです。
例: 23.45 を .toFixed(11) により "23.45000000000" という文字列にします。
parseFloat の使用.toFixed(11) で得られた文字列を parseFloat で再び数値に変換します。これにより、計算時の精度を向上させることができます。
例: "23.45000000000" を parseFloat で 23.45 に戻します。
Math.round(n) の実行Math.round(n) で n を四捨五入します。この時点で n は digits 桁を整数部にシフトした状態ですから、この操作で目的の桁が四捨五入されます。
例: 23.45 を Math.round で 23 に四捨五入。
/ multiplicator で元の桁に戻す最後に multiplicator で割ることで、四捨五入した数値を元の桁位置に戻します。
例: 23 / 10 = 2.3。
全体の例
n = 2.345 と digits = 1 を用いて、この関数の動作を追ってみましょう。

multiplicator = Math.pow(10, 1) = 10
n * multiplicator = 2.345 * 10 = 23.45
(23.45).toFixed(11) = "23.45000000000"
parseFloat("23.45000000000") = 23.45
Math.round(23.45) = 23
23 / 10 = 2.3
このようにして 2.345 は 2.3 に四捨五入されるわけです。

この関数は小数点以下任意の桁で正確に四捨五入するためのもので、特に金融計算などで精度が求められる場面で有効です。
 */
