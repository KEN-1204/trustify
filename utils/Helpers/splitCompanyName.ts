// 株式会社キーエンスやキーエンス株式会社を「株式会社」と「キーエンス」に分割して返す

export type CustomerNameObj = { companyType: string; company_name: string; typePosition: string };

export const splitCompanyNameWithPosition = (companyName: string) => {
  // 会社の種類
  const companyTypes = ["株式会社", "合同会社", "合資会社", "合名会社"];

  // 4つの会社種類名をパイプ記号で連結して1つの文字列にして正規表現のキャプチャグループで使用可能にする
  const pattern = companyTypes.join("|");

  // 会社種類名と会社名を分割する正規表現*1
  const regex = new RegExp(`^(${pattern})?(.+?)(${pattern})?$`);

  const matches = companyName.match(regex);

  if (matches) {
    // 会社種類名を取得(matches[0]はマッチしたテキスト全体, 1以降はそれぞれの()のキャプチャグループ)
    // 1と3のどちらかはマッチしないため、マッチしない場合にはundefinedか空文字が格納される
    const companyType = matches[1] || matches[3]; // 会社種類名
    const company_name = matches[2].trim(); // 会社名
    const position = matches[1] ? "pre" : "post"; // 前株ならpre、後株ならpost

    // 会社種類名が指定されていない場合、位置は空文字にする
    const typePosition = companyType ? position : "";

    return { companyType, company_name, typePosition };
  }

  // マッチしなかった場合は、元の入力のままそのまま返す
  return { companyType: "", company_name: companyName, typePosition: "" };
};

/*
*1の解説

🔹非貪欲マッチ (.+?) の意味
正規表現 a.+b （貪欲）と a.+?b （非貪欲）を文字列 "aabab" に適用した場合の違い。

・貪欲マッチ a.+b は、最初の "a" から始まり、最後の "b" で終わる最長の部分文字列にマッチします。この場合、全体の "aabab" にマッチします。
・非貪欲マッチ a.+?b は、最初の "a" から始まり、それに続く最短の "b" で終わる部分文字列にマッチします。この場合、最初の "aab" にマッチします。

非貪欲マッチは、特に複雑なテキスト処理において、意図した範囲に正確にマッチさせるために便利です。
貪欲マッチは最長のマッチを見つけ出し、非貪欲マッチは最短のマッチを見つけ出します。

🔹const regex = new RegExp(`^(${pattern})?(.+?)(${pattern})?$`);
「^(${pattern})?(.+?)(${pattern})?$」は
「^(株式会社|合同会社|合資会社|合名会社)?(.+?)(株式会社|合同会社|合資会社|合名会社)?$」

new RegExp() に渡された正規表現 ^(株式会社|合同会社|合資会社|合名会社)?(.+?)(株式会社|合同会社|合資会社|合名会社)?$ について、その構造と役割を正しく理解されています。以下にその点をまとめます：

正規表現の構成
^：文字列の開始を意味します。
(株式会社|合同会社|合資会社|合名会社)?：会社種類名が文字列の先頭に0回または1回出現することを許容します。ここでの ? はこのグループがオプショナル（存在しなくてもよい）であることを示します。この部分がマッチした場合、そのテキストはキャプチャグループによって記憶され、matches[1] で取得できます。
(.+?)：任意の1文字以上の文字列にマッチしますが、非貪欲（最小マッチ）のため、できるだけ短い文字列にマッチしようとします。この部分が会社名本体となり、matches[2] で取得できます。
(株式会社|合同会社|合資会社|合名会社)?$：会社種類名が文字列の終わりに0回または1回出現することを許容します。$ は文字列の終了を意味します。この部分もキャプチャグループによって記憶され、matches[3] で取得できます。
役割と取得方法
matches[1]：文字列の先頭にある会社種類名（存在する場合）。
matches[2]：会社名本体。
matches[3]：文字列の末尾にある会社種類名（存在する場合）。
*/
