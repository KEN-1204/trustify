// 会社名の「株式会社」などを除いた頭文字を取得する関数

// 頭文字のみ抽出
export const getCompanyInitial = (companyName: string) => {
  // 特定の文字列を削除
  const cleanedName = companyName.replace("株式会社", "").replace("合同会社", "").replace("有限会社", "").trim(); // 余分な空白を削除

  return cleanedName[0]; // 頭文字を返す
};
