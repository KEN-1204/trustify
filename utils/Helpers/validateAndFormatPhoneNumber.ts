// 言語によってバリデーションチェックを変更する

export function validateAndFormatPhoneNumber(phoneNumber: string): { isValid: boolean; formattedNumber: string } {
  // 全角数字、ハイフン、プラス、括弧を半角に変換
  const halfWidthTel = phoneNumber
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[\-−ー－]/g, "-") // ハイフンの種類を統一
    .replace(/＋/g, "+")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/[\s　]+/g, ""); // 全角・半角スペースを削除

  // 不適切な文字の削除（数字、ハイフン、プラス、括弧以外を削除）
  const formattedNumber = halfWidthTel.replace(/[^\d\-\+\(\)]/g, "");

  // バリデーションチェック 数字、半角ハイフン、プラス記号、括弧を許容
  const isValid = /^[\d\-\+\(\)]+$/.test(formattedNumber);
  // バリデーションチェック（日本の電話番号フォーマットに適応）
  // const regexPhone = /^\+?81\d{1,4}-\d{1,4}-\d{4}$/; // 日本の国際電話番号の例 +81-XX-XXXX-XXXX

  return { isValid, formattedNumber };
}

// onBlurイベントハンドラー
function handleBlur(event: React.FocusEvent<HTMLInputElement, Element>) {
  const { isValid, formattedNumber } = validateAndFormatPhoneNumber(event.target.value);
  if (isValid) {
    // 有効な場合、フォーマット済みの電話番号をセット
    event.target.value = formattedNumber;
  } else {
    // 無効な場合、エラーメッセージを表示
    console.error("Invalid phone number");
  }
}

/**
/^[\d\-\+\(\)]+$/ という正規表現は、特定の文字セットに一致する文字列を検索するために使用されます。この正規表現を構成する各部分の意味は以下の通りです：

^：この記号は文字列の開始を意味します。正規表現が文字列の先頭から一致することを指定します。

[ ... ]：角括弧内に指定された任意の文字に一致します。この場合、角括弧内の \d, \-, \+, \(, \) は、それぞれ特定の文字に一致します。

\d：すべての数字（0-9）に一致します。
\-：ハイフン（-）に一致します。ハイフンは特別な意味を持つことがあるため、エスケープされています。
\+：プラス記号（+）に一致します。プラス記号も正規表現では特別な意味を持つため、エスケープされています。
\(：開き丸括弧（(）に一致します。
\)：閉じ丸括弧（)）に一致します。
+：一つ以上の前にある要素（この場合は角括弧内の任意の文字）に一致します。つまり、角括弧内の文字が一つ以上続く文字列に一致します。

$：この記号は文字列の終了を意味します。正規表現が文字列の末尾で終わることを指定します。

全体の意味
したがって、/^[\d\-\+\(\)]+$/ という正規表現は、「文字列が数字、ハイフン、プラス記号、開き丸括弧、閉じ丸括弧のいずれか（または複数）で構成され、それらが一つ以上連続しているもの」という意味になります。この正規表現は文字列の全体が指定された文字セットによって構成されているかどうかをチェックします。
 */
