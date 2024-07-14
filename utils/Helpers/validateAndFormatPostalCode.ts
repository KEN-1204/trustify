// 言語によってバリデーションチェックを動的に変更する

// 数字、英字、ハイフン、スペースを許容
export const validateAndFormatPostalCode = (
  postalCode: string,
  useJapanPostalFormat: boolean = false // 日本の郵便番号フォーマットを使用するかどうか
): { isValid: boolean; formattedPostalCode: string } => {
  let formattedPostalCode;

  // falseの場合は海外拠点でも対応できるように数字以外も許可
  if (!useJapanPostalFormat) {
    // フォーマット
    const halfWidth = postalCode
      .replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) //
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/　/g, " ") // 全角スペースを半角スペースに変換
      .replace(/－/g, "-") // 全角ハイフンを半角に変換
      .replace(/ー/g, "-")
      .replace(/−/g, "-"); // 全角ハイフンを半角に変換 // カタカナの長音記号も半角ハイフンに変換

    formattedPostalCode = halfWidth;

    // 数字、英字、ハイフン、スペースを許容
    const regex = /^[0-9A-Za-z\s\-]+$/;
    const isValid = regex.test(formattedPostalCode);

    return { isValid, formattedPostalCode };
  }
  // 数字7桁のみ許可 日本の郵便番号
  else {
    // フォーマット
    const halfWidth = postalCode
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角数字を半角に変換
      .replace(/[^0-9]/g, ""); // 半角数字のみ除去

    formattedPostalCode = halfWidth;

    // 半角数字7桁を許容
    const regex = /^[0-9]{7}$/; // 半角数字7桁のみかチェック
    const isValid = regex.test(formattedPostalCode);

    return { isValid, formattedPostalCode };
  }
};

//   // まずハイフンを除去
//   const digits = postalCode.replace(/-/g, "");
// 3桁と4桁に分けてハイフンを挿入
//   if (digits.length === 7) {
//     responseFormattedPostalCode = `${digits.slice(0, 3)}-${digits.slice(3)}`;
//   } else {
//     responseFormattedPostalCode = postalCode;
//   }

// 日本の郵便番号の形式: 123-4567 または 1234567
//   const regex = /^\d{3}-?\d{4}$/;
//   return regex.test(postalCode);

/**
replace(/[Ａ-Ｚａ-ｚ]/g, ...): 全角の英字（大文字と小文字）を半角の英字に変換
replace(/[０-９]/g, ...): 全角数字を半角数字に変換
replace(/　/g, ' '): 全角スペースを半角スペースに変換
replace(/－/g, "-"): 全角ハイフンを半角ハイフンに変換
replace(/ー/g, "-"): カタカナの長音記号も半角ハイフンに変換
 */

/**
数字、英字、ハイフン、スペースを許容したバリデーションのカバー範囲
数字、英字、ハイフン、スペースを許容するバリデーションは、以下のような国々の郵便番号形式を広範囲にカバーできます：

イギリス: 英字と数字を組み合わせ、スペースで区切る形式（例: SW1A 1AA）。
アメリカ合衆国: 数字のみ、または数字にハイフンを含む形式（例: 12345、12345-6789）。
カナダ: 英字と数字の組み合わせ、スペースまたはハイフンで区切る形式（例: K1A 0B1）。
ヨーロッパの多くの国: 数字のみ、または数字と英字の組み合わせ（例: 1010、75008）。
オーストラリア、インド、中国など: 主に数字のみの形式。


英語圏（例：アメリカ、イギリス）
アメリカ（ZIP Code）: 基本形式は5桁の数字（例: 12345）、拡張形式では4桁の数字をハイフンで区切って追加（例: 12345-6789）。
イギリス: 英字と数字の組み合わせで構成される複雑な形式（例: SW1A 1AA）。
中国
中国: 一般的に6桁の数字で構成される（例: 100000）。
インド
インド: 6桁の数字で構成されることが多い（例: 110001）。
 */
