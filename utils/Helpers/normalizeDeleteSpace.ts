export const normalizeDeleteSpace = (value: string) => {
  // 両橋の空白を削除
  const trimmedValue = value.trim();

  // 姓名の間の半角・全角空白を削除
  const normalized = trimmedValue.replace(/\s+/g, "").replace(/　+/g, "");

  return normalized;
};

// 正規表現の説明
/**
 * 🌟/\s+/g
 * ・「\s」は空白文字を表す。これにはスペース、タブ、改行などが含まれる。
 * ・「+」は直前の文字が一回以上繰り返されることを意味する。つまり、「\s+」は1つ以上の連続する空白文字にマッチする
 * ・「g」はグローバル検索を表し、文字列全体に渡って全ての一致を検索します。
 * ・結果として、この正規表現は文字列中の全ての連続する空白文字（半角）を検索し、それらを置換対象とします。
 *
 * 🌟/　+/g
 * ・この表現は全角スペースを検索するためのものです。
 * ・「+」は一つ以上の連続する全角スペースにマッチします。
 * ・「g」はこちらもグローバル検索を意味し、全角スペースが複数回連続している場合に全てを検索します。
 * ・この正規表現は、文字列中の全ての連続する全角スペースを検索し、置換します。
 *
 * これらの正規表現を使用することで、名前の文字列から不要な半角および全角の空白を効率的に取り除くことができます。
 */
