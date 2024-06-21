export function formatAddress(input: string, isBuildingName = false) {
  let result = input
    .replace(/[\s　]+/g, "") // 全角・半角スペースを除去
    .replace(/[０-９]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xfee0)) // 全角数字を半角に
    .replace(/[！-～]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xfee0)); // その他の全角文字を半角に（数字を除く）

  // falseでデフォルトは長音も半角ハイフンに置換し、建物名のみ長音を許可
  if (!isBuildingName) {
    result = result.replace(/ー/g, "-"); // 長音をハイフンに置換（建物名以外）
  }

  return result;
}

/**
 * そうですね、日本語の住所で「長音（ー）」が使われるのは一般的です。特に建物名においては、そのまま保持するほうが自然なケースが多いです。そのため、建物名のみ長音を保持するように調整するのは良いアイデアです。
 * 
// 使用例
const regionName = "東京都　";
const cityName = "港区 ";
const streetAddress = "芝浦１-１-１ ";
const buildingName = "芝浦アイランドガーデンー ";

const formattedAddress = (formatAddress(regionName) ?? '') +
    (formatAddress(cityName) ?? '') +
    (formatAddress(streetAddress) ?? '') +
    " " +
    (formatAddress(buildingName, true) ?? ''); // 建物名は長音を保持

console.log(formattedAddress); // "東京都港区芝浦1-1-1 芝浦アイランドガーデンー"
 */

/**
1. 全角数字を半角に変換
javascript
コードをコピーする
.replace(/[０-９]/g, match => String.fromCharCode(match.charCodeAt(0) - 0xFEE0))
この行は、全角数字（０, １, ２, ... ９）を半角数字（0, 1, 2, ... 9）に変換します。正規表現[０-９]は全角の０から９までを指します。マッチした全角数字の文字コードから0xFEE0（全角と半角の差）を引くことで、対応する半角数字の文字コードに変換されます。

2. その他の全角文字を半角に変換
javascript
コードをコピーする
.replace(/[！-～]/g, match => String.fromCharCode(match.charCodeAt(0) - 0xFEE0))
この行は、全角の英数字や記号を半角に変換します。正規表現[！-～]は全角の感嘆符（！）から全角のチルダ（～）までをカバーします。この範囲には全角の英字や一部の記号も含まれます。こちらも同様に、マッチした全角文字の文字コードから0xFEE0を引くことで、対応する半角文字に変換します。

補足
String.fromCharCode()は、指定されたUnicode値から文字を作成します。
charCodeAt(0)は、指定された文字列の最初の文字のUnicode値を返します。
これらのメソッドを使うことで、特定の全角文字を対応する半角文字に効率的に変換できます。この変換は特に住所データの正規化やフォーム入力値の統一に役立ちます。
 */
