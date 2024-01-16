interface LanguageTitles {
  [key: string]: string;
}

interface PositionClassTitles {
  [key: number]: LanguageTitles;
}

// 役職クラス position_classカラムマッピング 数字からクラス 1 社長/CEOへ
export const mappingPositionClass: PositionClassTitles = {
  1: { en: "1 President", ja: "1 代表者" },
  2: { en: "2 Director/Executive", ja: "2 取締役/役員" },
  3: { en: "3 Manager", ja: "3 部長" },
  4: { en: "4 Section Manager", ja: "4 課長" },
  5: { en: "5 Team Leader/Associate", ja: "5 課長未満" },
  6: { en: "6 Branch Manager", ja: "6 所長/支店長/工場長" },
};

// interface OccupationTitles {
//   [key: number]: { en: string; ja: string };
// }
interface OccupationTitles {
  [key: number]: LanguageTitles;
}

// 担当職種 occupationカラムマッピング
export const mappingOccupation: OccupationTitles = {
  1: { en: "1 President", ja: "1 社長/CEO" },
  2: { en: "2 Director/Executive", ja: "2 取締役/役員" },
  3: { en: "3 Project Manager", ja: "3 プロジェクトマネージャー" },
  4: { en: "4 Sales", ja: "4 営業" },
  5: { en: "5 Marketing", ja: "5 マーケティング" },
  6: { en: "6 Creative", ja: "6 クリエイティブ" },
  7: { en: "7 Software Development", ja: "7 ソフトウェア開発" },
  8: { en: "8 R&D", ja: "8 開発・設計" },
  9: { en: "9 Manufacturing", ja: "9 製造" },
  10: { en: "10 Quality Control", ja: "10 品質管理・品質保証" },
  11: { en: "11 Production Management", ja: "11 生産管理" },
  12: { en: "12 Production Engineering", ja: "12 生産技術" },
  13: { en: "13 Human Resources", ja: "13 人事" },
  14: { en: "14 Accounting", ja: "14 経理" },
  15: { en: "15 General Affairs", ja: "15 総務" },
  16: { en: "16 Legal", ja: "16 法務" },
  17: { en: "17 Finance", ja: "17 財務" },
  18: { en: "18 Purchasing", ja: "18 購買" },
  19: { en: "19 Information Systems", ja: "19 情報システム" },
  20: { en: "20 CS", ja: "20 CS/カスタマーサポート" },
  21: { en: "21 Other", ja: "21 その他" },
};

interface NumberOfEmployeesClassTitles {
  [key: string]: LanguageTitles;
}

// 規模(ランク)
// export mappingNumberOfEmployeesClass
