/*
日本の住所データの前処理における全角英数字の扱い
一般的なCRMサービスやその他のデータベースシステムで日本の住所を扱う際、全角英数字の半角化はよく推奨されるプラクティスです。これは、以下の理由から行われます：

検索の一貫性と効率: データベース内での検索効率を向上させるために、全角と半角の不一致による検索ミスを避ける目的で行われます。全角英数字を半角に統一することで、検索クエリが単純化され、より速く、より正確な結果が得られるようになります。

データの標準化: データ入力のバリエーションを減らし、報告や分析の際の一貫性を保つために、全角文字を半角に変換します。これによりデータの整合性が向上し、システム間でのデータの互換性が保たれます。

ユーザー体験の向上: フォームやインターフェイス上でのデータ入力を標準化することで、ユーザーが予期しないエラーや混乱を避けることができます。

CRMサービスにおける全角英数字と記号の標準化
CRMサービスや他のデータ管理システムでのデータ標準化において、全角英数字と記号を半角に統一する方針は一般的です。これは以下の理由によります：

データの一貫性: 全角と半角の混在を解消することで、データの整合性が向上し、検索、ソート、レポーティングの際に予期しないエラーや問題が減少します。

検索性の向上: 全角文字と半角文字の混在は検索クエリの複雑化を招きます。特に、多様なユーザー入力を扱うCRMシステムでは、データ入力のバリエーションを減らすことが重要です。

国際化対応: 国際的な顧客データを扱う場合、様々な言語や文字種に対応するため、文字の統一はデータの管理を容易にします。


*/

import { RegionNameJpType } from "@/utils/selectOptions";
import { regExpPrefecture, regionNameToRegExpCitiesJp } from "./regExpAddress";

// 【記号の許容について】
// ・記号の使用：半角ハイフンは番地、アパートの番号の区切り文字として使用されるため許容
// ・記号の標準化：全角記号を半角に変換はDBの一貫性を保つために一般的な手法だが、住所データは必要な記号だけを保持し、不必要なものは削除

// 【日本と英語圏の住所標準化】
/**
1. 正規化：
   ・全角文字を半角に変換
   ・不要なスペース、記号の削除 ・日本住所では、全角数字と全角ハイフンを半角に変換
2. 形式の統一(住所要素を一定の順序で配置)
   ・日本：国名・郵便番号・都道府県・市区町村・番地・建物名
   ・英語圏：通りの名前・番地・市名・襲名・郵便番号
3. 不要な情報の削除
   ・住所以外の「角の薬局まで来てください」などの指示などを削除
4. データ検証
   ・可能であれば、郵便番号の正確性を検証し、存在しない住所や誤った郵便番号を修正
 */

export function normalizeAddress(address: string) {
  address = address.trim(); // 基本的なトリミング

  // 🔹1. 正規化
  // 全角英数字と全角記号の両方を半角に変換([０-９Ａ-Ｚａ-ｚ]を含む) *1
  address = address.replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

  // 全角ハイフンと全角スペースを半角に変換(長音「ー」はそのまま残す) *3
  address = address.replace(/[－−]/g, "-").replace(/\u3000/g, " ");

  // 連続するスペースを1つに正規化
  address = address.replace(/[\s+]/g, " "); // 全角スペースを半角に変換後、連続するスペースを１つの半角スペースに正規化 (\s: すべての空白文字（半角スペース、タブ、改行など(全角スペースは含まない))

  // 🔹2. 形式の統一
  // 2-1. 各住所の要素を取り出しやすくするため住所の全ての空白を除去した変数を作成
  // 2-2. 日本か英語圏かの識別 都道府県Setオブジェクトにマッチすれば日本の住所 / 番地から始まっていれば英語圏の住所
  // 【日本の住所の形式統一】
  // 2-3. 都道府県Setオブジェクトにマッチした場合は変数から都道府県を取り出す
  // 2-4. 取り出した都道府県に対応する市区町村Setオブジェクトにマッチするかチェックし、マッチしたら市区町村を取り出す
  // 2-5. 丁目か「1-1」などの番地までの文字列を町名として取り出す
  // 2-6. 番地の形式統一処理して取り出す
  // 2-7. 取り出した番地以降の文字列が存在する場合は建物名として取り出す
  // 2-8. 取り出した住所の各要素を結合して、番地と建物名の間に半角スペースをセットする

  const isJa = true;

  // 日本の住所 形式統一
  if (isJa) {
    // 住所の各要素を保持するオブジェクト
    const addressElements: { [K in "prefecture" | "city" | "town" | "block" | "building"]: string | null } = {
      prefecture: null,
      city: null,
      town: null,
      block: null,
      building: null,
    };
    // 🔸都道府県の抽出
    const prefectureMatch = address.match(regExpPrefecture);
    // 適切な住所が入力されていなければ、この行データ自体をnullで返し、最後に削除
    if (!prefectureMatch) throw new Error("都道府県が見つかりませんでした。");
    addressElements.prefecture = prefectureMatch[0];

    // 🔸市区町村の抽出
    const regExpCity = regionNameToRegExpCitiesJp[addressElements.prefecture as RegionNameJpType];
    const cityMatch = address.match(regExpCity);
    if (!cityMatch) throw new Error("市区町村が見つかりませんでした。");
    addressElements.city = cityMatch[1]; // 0はマッチ全体の文字列で 1はキャプチャグループでマッチした１つ目の文字

    // 🔸地名・町名の抽出 (番地の数字までを抜き出し)
    const extractTownName = (address: string, city: string) => {
      // prefectureとcityの後の地名を抽出する正規表現を動的に生成
      // const regex = new RegExp(`${prefecture}\\s*${city}\\s*(.*?)\\d`, "i");

      // 空白文字を削除 '東京都 港区 芝浦 4-20-2 芝浦アイランド4F' => '東京都港区芝浦4-20-2芝浦アイランド4F'
      const addressWithoutSpace = address.replace(/[\s\u3000]+/g, "");
      // 市区町村の直後の地名の開始位置を取得 '東京都港区芝浦4-20-2芝浦アイランド4F' => '芝浦'の芝のindex: 5
      const startIndex = addressWithoutSpace.indexOf(city) + city.length;
      // 地名の終了位置を取得 (市区町村名以降の部分から起算して最初の数字の位置を探す)
      const subStringFromCityEnd = addressWithoutSpace.substring(startIndex); // => '芝浦4-20-2芝浦アイランド4F'
      // const relativeEndIndex = subStringFromCityEnd.search(/\d/); // 最初の数字の位置を探す(相対位置)
      const relativeEndIndex = subStringFromCityEnd.search(/\d一二三四五六七八九十百千/); // 最初の数字の位置を探す(相対位置)

      // 地名の終了位置を絶対位置に変換
      const endIndex = startIndex + relativeEndIndex;

      // 地名を抽出
      const town = addressWithoutSpace.substring(startIndex, endIndex);

      return town;
    };

    const { prefecture, city } = addressElements;
    const townName = extractTownName(address, city);

    if (!townName) throw new Error("地名が見つかりませんでした。");
    addressElements.town = townName;

    // 市区町村以下の情報を一括して扱う; 結城市大字七五三場六百四十五番地七 のように
    // 「丁目・番地(番)・号」が漢数字の場合、「町名(地名)」と「丁目・番地(番)・号」の境界を正確に特定するのが困難のため

    // // 🔸丁目・番地・号の抽出(番地・号はオプショナル)
    // const extractBlockName = (address: string, town: string) => {
    //   // 空白文字を削除 '東京都 港区 芝浦 4-20-2 芝浦アイランド4F' => '東京都港区芝浦4-20-2芝浦アイランド4F'
    //   const addressWithoutSpace = address.replace(/[\s\u3000]+/g, "");
    //   // 地名の直後の丁目・番地の開始位置を取得 '東京都港区芝浦4-20-2芝浦アイランド4F' => '4-20-2'の4のindex: 7
    //   const startIndex = addressWithoutSpace.indexOf(town) + town.length;
    //   // 地名の終了位置を取得 (市区町村名以降の部分から起算して最初の数字の位置を探す)
    //   const addressFromTownEnd = addressWithoutSpace.substring(startIndex); // => '4-20-2芝浦アイランド4F'

    //   // 住所の「丁目」「番地(番)」「号」のパターンは、一般的に「◯丁目・◯番地（番）・◯号」のように記載。
    //   // たとえば、「中央区築地1-1-1」に住んでいる場合は、「中央区築地一丁目1番1号」と表記

    //   const kanjiNumbers = `一|二|三|四|五|六|七|八|九|十`

    //   // 下記のパターンに対応
    //   // 「4丁目10番地1号」=>「4-10-1」
    //   // 「4丁目10-1」=>「4-10-1」
    //   // 「1番地1号」=>「1-1」
    //   // 「1番地1」=>「1-1」
    //   // 「1丁目」=>「1」

    //   // const blockRegex = /(\d+)(?:丁目|番地|番|号|-)?(\d+)?(?:番地|番|号|-)?(\d+)?(?:号|-)?/;
    //   const blockRegex =
    //     /([\d一二三四五六七八九十百千]+)(?:丁目|番地|番|号|-)?([\d一二三四五六七八九十百千]+)?(?:番地|番|号|-)?([\d一二三四五六七八九十百千]+)?(?:号|-)?/;

    //   const matches = addressFromTownEnd.match(blockRegex);

    //   if (matches) {
    //     // マッチした部分から「xx-xx-xx」形式を構築
    //     const [_, chome = "", banchi = "", go = ""] = matches;
    //     return [chome, banchi, go].filter((x) => x).join("-");
    //   }
    //   return null;
    // };

    // const blockName = extractBlockName(address, townName);
  }

  return address;
}

/*
🔸全角英数字と全角記号を両方指定 *1
全角英数字と全角記号を含む \uFF01-\uFF5E 範囲を用いて一括で半角に変換するのは、実装がシンプルで効率的な方法です。このアプローチは、特に全角文字を一貫して半角に変換したい場合に適しています

address = address.replace(/[\uFF01-\uFF5E]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
*/

/*
🔸全角英数字のみ
// 全角英数字のみを半角に変換する場合(全角記号を変換しない場合)
// 全角の数字（\uFF10-\uFF19）、大文字アルファベット（\uFF21-\uFF3A）、および小文字アルファベット（\uFF41-\uFF5A）を対象に半角変換
address = address.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
address = address.replace(/[\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
);
*/

/*
🔸全角記号のみ
全角記号の範囲は \uFF01-\uFF5E ですが、この範囲から全角英数字を除外したいので、具体的な全角記号のみを対象とする範囲を指定する必要があります。

全角英数字のUnicode範囲（\uFF10-\uFF19 および \uFF21-\uFF3A と \uFF41-\uFF5A）を除外して、残りの記号のみを変換する方法を示します。

// 全角英数字を除く記号の範囲を指定
text.replace(/[\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF5E]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));

この正規表現では、以下の範囲を対象としています：

\uFF01-\uFF0F：感嘆符（！）からスラッシュ（／）まで
\uFF1A-\uFF20：コロン（：）からアットマーク（＠）まで
\uFF3B-\uFF40：左角括弧（［）から重アクセント（｀）まで
\uFF5B-\uFF5E：左波括弧（｛）からチルダ（～）まで
*/

// *3
// // 「　」でも良いが。Unicode表記（\u3000）を明示的に使用する方が、どの文字を指しているのかが明確であり、異なるエディターや環境での表示の違いに左右されにくいため、好まれることが多い

/*
英数字
半角文字も全角文字も文字コード上で対応する並びになっているため、16進数でFEE0(10進数で65248)足し引きすることで相互に変換することが可能です。

【Unicodeの文字コード】
・半角文字：「A」の文字コードは[0041]。「z」は[007A]。
・全角文字：「Ａ」の文字コードは[FF21]。「ｚ」は[FF5a]。

・「半角文字」の文字コードから16進数でFEE0（「0xFEE0」）を足す⇒「全角文字」に変換
・「全角文字」の文字コードに16進数でFEE0（「0xFEE0」）を引く　⇒「半角文字」に変換

(例：JavaScript)全角文字⇒半角文字
Zenkaku = Zenkaku.replace(/[Ａ-Ｚａ-ｚ]/g, function(s) {
  return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
});

*/

/*
全角記号を半角に変換する場合

\uFF01-\uFF0F：感嘆符（！）からスラッシュ（／）まで
\uFF1A-\uFF20：コロン（：）からアットマーク（＠）まで
\uFF3B-\uFF40：左角括弧（［）から重アクセント（｀）まで
\uFF5B-\uFF5E：左波括弧（｛）からチルダ（～）まで
*/

// 全角数字とハイフンを半角に変換
//   address = address.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
