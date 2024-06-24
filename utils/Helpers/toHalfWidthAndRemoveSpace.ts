// 全角文字を半角に変換する関数 全角スペース、ハイフンは含まない
export const toHalfWidthAndRemoveSpace = (strVal: string) => {
  // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  return strVal.replace(/[！-～]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0xfee0).replace(/[\s\u3000]/g, "");
  });
};

/**
正規表現の\sは、標準的には半角の空白文字（スペース、タブ、改行など）にマッチします。全角スペースについては、\sによって直接マッチするわけではありません。全角スペースを含めてすべての空白文字（半角・全角）を取り除きたい場合は、全角スペースを表すUnicode文字を正規表現に追加する必要があります。

全角スペース（UnicodeではU+3000として表されます）を含めて削除するには、以下のように記述します。

.replace(/[\s\u3000]/g, '')

この正規表現では、\sが半角の空白文字にマッチし、\u3000が全角スペースにマッチします。[]（文字クラス）の中にこれらを記述することで、半角の空白文字と全角スペースの両方にマッチするようになり、gフラグによって文字列内のすべての該当する空白文字が置換対象となります。

したがって、文字列から半角および全角のすべての空白文字を取り除きたい場合は、この方法が適切です。
 */
