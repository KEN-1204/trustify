import { isWithinInterval, subMonths } from "date-fns";
import { calculateCurrentFiscalYear } from "./Helpers/calculateCurrentFiscalYear";
import { Client_company, ProductCategoriesLarge } from "@/types";

// ローカルタイムゾーン
export const optionsTimeZoneEn = [
  { areaName: "Japan (Tokyo)", timeZone: "Asia/Tokyo" },
  { areaName: "South Korea (Seoul)", timeZone: "Asia/Seoul" },
  { areaName: "China (Shanghai)", timeZone: "Asia/Shanghai" },
  { areaName: "India (Kolkata)", timeZone: "Asia/Kolkata" },
  { areaName: "Thailand (Bangkok)", timeZone: "Asia/Bangkok" },
  { areaName: "UAE (Dubai)", timeZone: "Asia/Dubai" },
  { areaName: "UK (London)", timeZone: "Europe/London" },
  { areaName: "France (Paris)", timeZone: "Europe/Paris" },
  { areaName: "Germany (Berlin)", timeZone: "Europe/Berlin" },
  { areaName: "Russia (Moscow)", timeZone: "Europe/Moscow" },
  { areaName: "USA (New York)", timeZone: "America/New_York" },
  { areaName: "USA (Chicago)", timeZone: "America/Chicago" },
  { areaName: "USA (Denver)", timeZone: "America/Denver" },
  { areaName: "USA (Los Angeles)", timeZone: "America/Los_Angeles" },
  { areaName: "Australia (Sydney)", timeZone: "Australia/Sydney" },
  { areaName: "New Zealand (Auckland)", timeZone: "Pacific/Auckland" },
  { areaName: "South Africa (Johannesburg)", timeZone: "Africa/Johannesburg" },
  { areaName: "Egypt (Cairo)", timeZone: "Africa/Cairo" },
  { areaName: "Nigeria (Lagos)", timeZone: "Africa/Lagos" },
];
export const optionsTimeZoneJa = [
  { areaName: "日本", timeZone: "Asia/Tokyo" },
  { areaName: "韓国", timeZone: "Asia/Seoul" },
  { areaName: "中国", timeZone: "Asia/Shanghai" },
  { areaName: "インド", timeZone: "Asia/Kolkata" },
  { areaName: "タイ", timeZone: "Asia/Bangkok" },
  { areaName: "アラブ首長国連邦", timeZone: "Asia/Dubai" },
  { areaName: "イギリス", timeZone: "Europe/London" },
  { areaName: "フランス", timeZone: "Europe/Paris" },
  { areaName: "ドイツ", timeZone: "Europe/Berlin" },
  { areaName: "ロシア", timeZone: "Europe/Moscow" },
  { areaName: "アメリカ(ニューヨーク)", timeZone: "America/New_York" },
  { areaName: "アメリカ（シカゴ）", timeZone: "America/Chicago" },
  { areaName: "アメリカ（デンバー）", timeZone: "America/Denver" },
  { areaName: "アメリカ（ロサンゼルス）", timeZone: "America/Los_Angeles" },
  { areaName: "オーストラリア", timeZone: "Australia/Sydney" },
  { areaName: "ニュージーランド", timeZone: "Pacific/Auckland" },
  { areaName: "南アフリカ", timeZone: "Africa/Johannesburg" },
  { areaName: "エジプト", timeZone: "Africa/Cairo" },
  { areaName: "ナイジェリア", timeZone: "Africa/Lagos" },
];
// 見積No採番時のタイムゾーンがリストに存在するかチェック用
export const timezoneList = [
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Lagos",
];

/**
アジア
'Asia/Tokyo'（日本）: "Japan (Tokyo)"
'Asia/Seoul'（韓国）: "South Korea (Seoul)"
'Asia/Shanghai'（中国）: "China (Shanghai)"
'Asia/Kolkata'（インド）: "India (Kolkata)"
'Asia/Bangkok'（タイ）: "Thailand (Bangkok)"
'Asia/Dubai'（アラブ首長国連邦）: "UAE (Dubai)"
ヨーロッパ
'Europe/London'（イギリス）: "UK (London)"
'Europe/Paris'（フランス）: "France (Paris)"
'Europe/Berlin'（ドイツ）: "Germany (Berlin)"
'Europe/Moscow'（ロシア）: "Russia (Moscow)"
アメリカ大陸
'America/New_York'（東部標準時）: "USA (New York)"
'America/Chicago'（中部標準時）: "USA (Chicago)"
'America/Denver'（山岳部標準時）: "USA (Denver)"
'America/Los_Angeles'（太平洋標準時）: "USA (Los Angeles)"
オセアニア
'Australia/Sydney'（オーストラリア）: "Australia (Sydney)"
'Pacific/Auckland'（ニュージーランド）: "New Zealand (Auckland)"
アフリカ
'Africa/Johannesburg'（南アフリカ）: "South Africa (Johannesburg)"
'Africa/Cairo'（エジプト）: "Egypt (Cairo)"
'Africa/Lagos'（ナイジェリア）: "Nigeria (Lagos)"
 */
// export const optionsPositionsClassForCustomer = [
//   "1 代表者",
//   "2 取締役/役員",
//   "3 部長",
//   "4 課長",
//   "5 チームメンバー",
//   "6 所長・支店長・工場長",
//   "7 フリーランス・個人事業主",
// ];
// export const getPositionClassNameForCustomer = (classNum: string, language: string = "ja") => {
//   switch (classNum) {
//     case "1 代表者":
//       return language === "ja" ? `代表者` : `President`;
//       break;
//     case "2 取締役/役員":
//       return language === "ja" ? `取締役/役員` : `Director/Executive`;
//       break;
//     case "3 部長":
//       return language === "ja" ? `部長` : `Manager`;
//       break;
//     case "4 課長":
//       return language === "ja" ? `課長` : `Section Manager`;
//       break;
//     case "5 チームメンバー":
//       return language === "ja" ? `チームメンバー` : `Team Member`;
//       break;
//     case "6 所長・支店長・工場長":
//       return language === "ja" ? `所長・支店長・工場長` : `Branch Manager`;
//       break;
//     case "7 フリーランス・個人事業主":
//       return language === "ja" ? `フリーランス・個人事業主` : `Freelance`;
//       break;

//     default:
//       break;
//   }
// };
export const optionsPositionsClassForCustomer = [
  "1 President",
  "2 Director/Executive",
  "3 Manager",
  "4 Section Manager",
  "5 Team Member",
  "6 Branch Manager",
  "7 Freelance",
];

export const getPositionClassNameForCustomer = (value: string, language: string = "ja") => {
  switch (value) {
    case "1 President":
      return language === "ja" ? `代表者` : `President`;
      break;
    case "2 Director/Executive":
      return language === "ja" ? `取締役/役員` : `Director/Executive`;
      break;
    case "3 Manager":
      return language === "ja" ? `部長` : `Manager`;
      break;
    case "4 Section Manager":
      return language === "ja" ? `課長` : `Section Manager`;
      break;
    case "5 Team Member":
      return language === "ja" ? `チームメンバー` : `Team Member`;
      break;
    case "6 Branch Manager":
      return language === "ja" ? `所長・支店長・工場長` : `Branch Manager`;
      break;
    case "7 Freelance":
      return language === "ja" ? `フリーランス・個人事業主` : `Freelance`;
      break;

    default:
      return value;
      break;
  }
};

// export const optionsPositionsClass = ["代表者", "取締役", "部長", "課長", "課長未満", "所長・支社長・工場長", "その他"];
// export const optionsPositionsClass = [
//   "1 代表者",
//   "2 取締役/役員",
//   "3 部長",
//   "4 課長",
//   "5 課長未満",
//   "6 所長・支社長・工場長",
// ];

// 職位(役職クラス)
export type PositionClassType = 1 | 2 | 3 | 4 | 5 | 6;
export const optionsPositionsClass = [1, 2, 3, 4, 5, 6];
export const mappingPositionsClassName:
  | { [K in PositionClassType]: { [key: string]: string } }
  | { [key: number]: { [key: string]: string } } = {
  1: { ja: "1 代表者", en: "1 President" },
  2: { ja: "2 取締役/役員", en: "2 Director/Executive" },
  3: { ja: "3 部長", en: "3 Division Manager" },
  4: { ja: "4 課長", en: "4 Section Manager" },
  5: { ja: "5 課長未満", en: "5 Team Leader/Associate" },
  6: { ja: "6 所長・支店長・工場長", en: "6 Branch Manager" },
};
export const getPositionClassName = (classNum: number, language: string = "ja") => {
  switch (classNum) {
    case 1:
      return language === "ja" ? `1 代表者` : `1 President`;
      break;
    case 2:
      return language === "ja" ? `2 取締役/役員` : `2 Director/Executive`;
      break;
    case 3:
      return language === "ja" ? `3 部長` : `3 Division Manager`;
      break;
    case 4:
      return language === "ja" ? `4 課長` : `4 Section Manager`;
      break;
    case 5:
      return language === "ja" ? `5 課長未満` : `5 Team Leader/Associate`;
      break;
    case 6:
      return language === "ja" ? `6 所長・支店長・工場長` : `6 Branch Manager`;
      break;

    default:
      break;
  }
};

//  <option value="1 代表者">1 代表者</option>
//   <option value="2 取締役/役員">2 取締役/役員</option>
//   <option value="3 部長">3 部長</option>
//   <option value="4 課長">4 課長</option>
//   <option value="5 課長未満">5 課長未満</option>
//   <option value="6 所長・工場長">6 所長・工場長</option>
//   <option value="7 フリーランス・個人事業主">7 フリーランス・個人事業主</option>
//   <option value="8 不明">8 不明</option>

// export const optionsOccupation = [
//   // "社長・専務",
//   "社長/CEO",
//   "取締役・役員",
//   "プロジェクト管理",
//   "営業",
//   "マーケティング",
//   "クリエイティブ",
//   "ソフトウェア開発",
//   "開発・設計",
//   "製造",
//   "品質管理・品質保証",
//   "生産管理",
//   "生産技術",
//   "人事",
//   "経理",
//   "総務",
//   "法務",
//   "財務",
//   "購買",
//   "情報システム/IT管理者",
//   "CS/カスタマーサービス",
//   "その他",
// ];
// export const optionsOccupation = [
//   "1 社長/CEO",
//   "2 取締役・役員",
//   "3 プロジェクト管理",
//   "4 営業",
//   "5 マーケティング",
//   "6 クリエイティブ",
//   "7 ソフトウェア開発",
//   "8 開発・設計",
//   "9 製造",
//   "10 品質管理・品質保証",
//   "11 生産管理",
//   "12 生産技術",
//   "13 人事",
//   "14 経理",
//   "15 総務",
//   "16 法務",
//   "17 財務",
//   "18 購買",
//   "19 情報システム/IT管理者",
//   "20 CS/カスタマーサービス",
//   "21 その他",
// ];

export const optionsUsageForCustomer = ["1 company/team", "2 personal"];
export const getUsageForCustomer = (value: string, language: string = "ja") => {
  switch (value) {
    case "1 company/team":
      return language === "ja" ? `会社・チームで利用` : `company/team`;
    case "2 personal":
      return language === "ja" ? `個人で利用用` : `personal`;

    default:
      return value;
      break;
  }
};

export const optionsOccupationForCustomer = [
  "01 President",
  "02 Director/Executive",
  "03 Project Manager",
  "04 Sales",
  "05 Marketing",
  "06 Creative",
  "07 Software Development",
  "08 R&D",
  "09 Manufacturing",
  "10 Quality Control",
  "11 Production Management",
  "12 Production Engineering",
  "13 Human Resources",
  "14 Accounting",
  "15 General Affairs",
  "16 Legal",
  "17 Finance",
  "18 Purchasing",
  "19 IT Department",
  "20 CS",
  "21 Other",
];

export const getOccupationNameForCustomer = (Num: string, language: string = "ja") => {
  switch (Num) {
    case "01 President":
      return language === "ja" ? `社長/CEO` : `President`;
    case "02 Director/Executive":
      return language === "ja" ? `取締役・役員` : `Director/Executive`;
    case "03 Project Manager":
      return language === "ja" ? `プロジェクトマネージャー` : `Project Manager`;
    case "04 Sales":
      return language === "ja" ? "営業" : `Sales`;
    case "05 Marketing":
      return language === "ja" ? "マーケティング" : `Marketing`;
    case "06 Creative":
      return language === "ja" ? "クリエイティブ" : `Creative`;
    case "07 Software Development":
      return language === "ja" ? "ソフトウェア開発" : `Software Development`;
    case "08 R&D":
      return language === "ja" ? "開発・設計" : `R&D`;
    case "09 Manufacturing":
      return language === "ja" ? "製造" : `Manufacturing`;
    case "10 Quality Control":
      return language === "ja" ? "品質管理・品質保証" : `Quality Control`;
    case "11 Production Management":
      return language === "ja" ? "生産管理" : `Production Management`;
    case "12 Production Engineering":
      return language === "ja" ? "生産技術" : `Production Engineering`;
    case "13 Human Resources":
      return language === "ja" ? "人事" : `Human Resources`;
    case "14 Accounting":
      return language === "ja" ? "経理" : `Accounting`;
    case "15 General Affairs":
      return language === "ja" ? "総務" : `General Affairs`;
    case "16 Legal":
      return language === "ja" ? "法務" : `Legal`;
    case "17 Finance":
      return language === "ja" ? "財務" : `Finance`;
    case "18 Purchasing":
      return language === "ja" ? "購買" : `Purchasing`;
    case "19 IT Department":
      return language === "ja" ? "情報システム" : `IT Department`;
    case "20 CS":
      return language === "ja" ? "CS/カスタマーサービス" : `CS`;
    case "21 Other":
      return language === "ja" ? "その他" : `Other`;

    default:
      return Num;
      break;
  }
};

// 担当職種
export type OccupationType =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21;
export const optionsOccupation = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
export const mappingOccupation = {
  1: { ja: "1 社長/CEO", en: "1 President" },
  2: { ja: "2 取締役・役員", en: "2 Director/Executive" },
  3: { ja: "3 プロジェクトマネージャー", en: "3 Project Manager" },
  4: { ja: "4 営業", en: "4 Sales" },
  5: { ja: "5 マーケティング", en: "5 Marketing" },
  6: { ja: "6 クリエイティブ", en: "6 Creative" },
  7: { ja: "7 ソフトウェア開発", en: "7 Software Development" },
  8: { ja: "8 開発・設計", en: "8 R&D" },
  9: { ja: "9 製造", en: "9 Manufacturing" },
  10: { ja: "10 品質管理・品質保証", en: "10 Quality Control" },
  11: { ja: "11 生産管理", en: "11 Production Management" },
  12: { ja: "12 生産技術", en: "12 Production Engineering" },
  13: { ja: "13 人事", en: "13 Human Resources" },
  14: { ja: "14 経理", en: "14 Accounting" },
  15: { ja: "15 総務", en: "15 General Affairs" },
  16: { ja: "16 法務", en: "16 Legal" },
  17: { ja: "17 財務", en: "17 Finance" },
  18: { ja: "18 購買", en: "18 Purchasing" },
  19: { ja: "19 情報システム", en: "19 IT Department" },
  20: { ja: "20 CS/カスタマーサービス", en: "20 CS" },
  21: { ja: "21 その他", en: "21 Other" },
};

export const getOccupationName = (Num: number, language: string = "ja") => {
  switch (Num) {
    case 1:
      return language === "ja" ? `1 社長/CEO` : `1 President`;
    case 2:
      return language === "ja" ? `2 取締役・役員` : `2 Director/Executive`;
    case 3:
      return language === "ja" ? `3 プロジェクトマネージャー` : `3 Project Manager`;
    case 4:
      return language === "ja" ? "4 営業" : `4 Sales`;
    case 5:
      return language === "ja" ? "5 マーケティング" : `5 Marketing`;
    case 6:
      return language === "ja" ? "6 クリエイティブ" : `6 Creative`;
    case 7:
      return language === "ja" ? "7 ソフトウェア開発" : `7 Software Development`;
    case 8:
      return language === "ja" ? "8 開発・設計" : `8 R&D`;
    case 9:
      return language === "ja" ? "9 製造" : `9 Manufacturing`;
    case 10:
      return language === "ja" ? "10 品質管理・品質保証" : `10 Quality Control`;
    case 11:
      return language === "ja" ? "11 生産管理" : `11 Production Management`;
    case 12:
      return language === "ja" ? "12 生産技術" : `12 Production Engineering`;
    case 13:
      return language === "ja" ? "13 人事" : `13 Human Resources`;
    case 14:
      return language === "ja" ? "14 経理" : `14 Accounting`;
    case 15:
      return language === "ja" ? "15 総務" : `15 General Affairs`;
    case 16:
      return language === "ja" ? "16 法務" : `16 Legal`;
    case 17:
      return language === "ja" ? "17 財務" : `17 Finance`;
    case 18:
      return language === "ja" ? "18 購買" : `18 Purchasing`;
    case 19:
      return language === "ja" ? "19 情報システム" : `19 IT Department`;
    case 20:
      return language === "ja" ? "20 CS/カスタマーサービス" : `20 CS`;
    case 21:
      return language === "ja" ? "21 その他" : `21 Other`;

    default:
      break;
  }
};
/**
 * 

<option value="社長・専務">社長・専務</option>
<option value="取締役・役員">取締役・役員</option>
<option value="プロジェクト管理">プロジェクト管理</option>
<option value="営業">営業</option>
<option value="マーケティング">マーケティング</option>
<option value="ソフトウェア開発">ソフトウェア開発</option>
<option value="開発・設計">開発・設計</option>
<option value="生産管理">生産管理</option>
<option value="生産技術">生産技術</option>
<option value="製造">製造</option>
<option value="品質管理・品質保証">品質管理・品質保証</option>
<option value="人事">人事</option>
<option value="経理">経理</option>
<option value="総務">総務</option>
<option value="法務">法務</option>
<option value="財務">財務</option>
<option value="情報システム/IT管理者">情報システム/IT管理者</option>
<option value="購買">購買</option>
<option value="企画">企画</option>
<option value="CS/カスタマーサービス">CS/カスタマーサービス</option>
<option value="その他">その他</option>

<option value="社長・専務">社長・専務</option>
<option value="取締役・役員">取締役・役員</option>
<option value="プロジェクト管理">プロジェクト管理</option>
<option value="営業">営業</option>
<option value="マーケティング">マーケティング</option>
<option value="ソフトウェア開発">ソフトウェア開発</option>
<option value="開発・設計">開発・設計</option>
<option value="生産技術">生産技術</option>
<option value="製造">製造</option>
<option value="品質管理・品質保証">品質管理・品質保証</option>
<option value="人事">人事</option>
<option value="経理">経理</option>
<option value="総務">総務</option>
<option value="法務">法務</option>
<option value="財務">財務</option>
<option value="情報システム/IT管理者">情報システム/IT管理者</option>
<option value="CS/カスタマーサービス">CS/カスタマーサービス</option>
<option value="購買">購買</option>
<option value="その他">その他</option>

<option value="1">1 社長・専務</option>
<option value="2">2 取締役・役員</option>
<option value="3">3 開発・設計</option>
<option value="4">4 生産技術</option>
<option value="5">5 製造</option>
<option value="6">6 品質管理・品質保証</option>
<option value="7">7 人事</option>
<option value="8">8 経理</option>
<option value="9">9 総務</option>
<option value="10">10 法務</option>
<option value="11">11 財務</option>6 
<option value="12">12 情報システム</option>
<option value="13">13 マーケティング</option>
<option value="14">14 購買</option>
<option value="15">15 営業</option>
<option value="16">16 企画</option>
<option value="17">17 CS</option>
<option value="18">18 その他</option>

<option value="プロジェクト/プログラム管理">プロジェクト/プログラム管理</option>
<option value="情報システム/IT管理者">情報システム/IT管理者</option>
<option value="クリエイティブ">クリエイティブ</option>
 */

// ----------------------------------- CSVインポート関連 -----------------------------------
// 🔸選択必須の選択肢
export const requiredImportColumnOptionsSet = new Set(["name", "address"]);

// 🔸CSVデータインポート時に使用するclient_companiesテーブルのカラムリスト
export const optionsClientCompaniesColumnFieldForInsertArray = [
  // "id",
  // "created_at",
  // "updated_at",
  // "created_by_company_id",
  // "created_by_user_id",
  // "created_by_department_of_user",
  // "created_by_section_of_user",
  // "created_by_unit_of_user",
  // "created_by_office_of_user",
  "name", // 会社名
  "department_name", // 部署名
  "main_phone_number", // 代表TEL
  "main_fax", // 代表FAX
  "zipcode", // 郵便番号
  "address", // 住所
  "representative_name", // 代表者名
  "website_url", // ホームページURL
  "email", // Email
  "industry_type_id", //int4 業界・業種
  "industry_large", // 業界(大分類)
  "industry_small", // 業界(小分類)
  "number_of_employees", // 従業員数
  "fiscal_end_month", //int4 決算月
  "capital", //int8 BIGINT 資本金
  "established_in", //text 設立
  "corporate_number", // 法人番号
  // "country_id", // int4
  // "region_id", //int4
  // "city_id", //int4
  // "street_address", //text
  // "building_name", //text
  // "product_category_large", //
  // "product_category_medium", //
  // "product_category_small", //
  // "number_of_employees_class", //
  "budget_request_month1", //int4 予算申請月1
  "budget_request_month2", //int4 予算申請月2
  "clients", // 取引先(納入先)
  "supplier", // 仕入れ先
  "business_content", // 事業概要
  "chairperson", // 会長
  "senior_vice_president", // 副社長
  "senior_managing_director", // 専務取締役
  "managing_director", // 常務取締役
  "director", // 取締役
  "board_member", // 役員
  "auditor", // 監査役
  "manager", // 部長
  "member", // 担当者
  "facility", // 設備
  "business_sites", // 事業拠点
  "overseas_bases", // 海外拠点
  "group_company", // グループ会社
  "department_contacts", // 連絡先(部署別)
  // "claim", //
  // "ban_reason", //
  // "email_ban_flag", //
  // "sending_ban_flag", //
  // "fax_dm_ban_flag", //
  // "call_careful_flag", //
  // "call_careful_reason", //
] as (keyof Omit<
  Client_company,
  | "id"
  | "created_at"
  | "updated_at"
  | "created_by_company_id"
  | "created_by_user_id"
  | "created_by_department_of_user"
  | "created_by_section_of_user"
  | "created_by_unit_of_user"
  | "created_by_office_of_user"
  //
  | "number_of_employees_class" // 規模(ランク)
  | "country_id" // 国コード
  | "region_id" // 都道府県コード
  | "city_id" // 市区町村コード
  | "street_address" // 町名・番地
  | "building_name" // 建物名
  | "product_category_large" // 製品分類(大分類)
  | "product_category_medium" // 製品分類(中分類)
  | "product_category_small" // 製品分類(小分類)
  | "claim" // クレーム
  | "ban_reason" // 禁止理由
  | "email_ban_flag"
  | "sending_ban_flag"
  | "fax_dm_ban_flag"
  | "call_careful_flag"
  | "call_careful_reason"
>)[];

export const mappingClientCompaniesFiledToNameForInsert: { [key: string]: { [key: string]: string } } = {
  name: { ja: `会社名`, en: `` },
  department_name: { ja: `部署名`, en: `` },
  main_phone_number: { ja: `代表TEL(電話番号)`, en: `` },
  main_fax: { ja: `代表FAX`, en: `` },
  zipcode: { ja: `郵便番号`, en: `` },
  address: { ja: `住所`, en: `` },
  department_contacts: { ja: `連絡先(部署別)`, en: `` },
  industry_large: { ja: `業界(大分類)`, en: `` }, // セールスフォース用
  industry_small: { ja: `業界(小分類)`, en: `` }, // セールスフォース用
  industry_type_id: { ja: `業界・業種`, en: `` },
  country_id: { ja: `国コード`, en: `` },
  region_id: { ja: `都道府県コード`, en: `` },
  city_id: { ja: `市区町村`, en: `` },
  street_address: { ja: `町名・番地`, en: `` },
  building_name: { ja: `建物名`, en: `` },
  product_category_large: { ja: `製品分類(大分類)`, en: `` },
  product_category_medium: { ja: `製品分類(中分類)`, en: `` },
  product_category_small: { ja: `製品分類(小分類)`, en: `` },
  number_of_employees_class: { ja: `規模(従業員数)`, en: `` },
  fiscal_end_month: { ja: `決算月`, en: `` },
  capital: { ja: `資本金`, en: `` },
  budget_request_month1: { ja: `予算申請月1`, en: `` },
  budget_request_month2: { ja: `予算申請月2`, en: `` },
  website_url: { ja: `ホームページURL`, en: `` },
  clients: { ja: `取引先(納入先)`, en: `` },
  supplier: { ja: `仕入先`, en: `` },
  business_content: { ja: `事業概要`, en: `` },
  established_in: { ja: `設立`, en: `` },
  representative_name: { ja: `代表者名`, en: `` },
  chairperson: { ja: `会長`, en: `` },
  senior_vice_president: { ja: `副社長`, en: `` },
  senior_managing_director: { ja: `専務取締役`, en: `` },
  managing_director: { ja: `常務取締役`, en: `` },
  director: { ja: `取締役`, en: `` },
  auditor: { ja: `監査役`, en: `` },
  manager: { ja: `部長`, en: `` },
  member: { ja: `担当者`, en: `` },
  facility: { ja: `設備`, en: `` },
  business_sites: { ja: `事業拠点`, en: `` },
  overseas_bases: { ja: `海外拠点`, en: `` },
  group_company: { ja: `グループ会社`, en: `` },
  email: { ja: `E-mail`, en: `` },
  corporate_number: { ja: `法人番号`, en: `` },
  board_member: { ja: `役員`, en: `` },
  number_of_employees: { ja: `従業員数`, en: `` },
};
// ----------------------------------- CSVインポート関連 -----------------------------------

// 国別
export type CountryOption = { id: number; name_ja: string; name_en: string };
export const countryArray = [
  { id: 5, name_ja: "アメリカ", name_en: "America" },
  { id: 153, name_ja: "日本", name_en: "Japan" },
];
export const optionCountries = [5, 153];
export const mappingCountries: { [key: number]: { [key: string]: string } } = {
  5: { ja: "アメリカ", en: "America" },
  153: { ja: "日本", en: "Japan" },
};

export type RegionJp = {
  [key: number]: { [key: string]: string };
};

// 都道府県別 日本 153
export type RegionNameJpType =
  | "北海道"
  | "青森県"
  | "岩手県"
  | "宮城県"
  | "秋田県"
  | "山形県"
  | "福島県"
  | "茨城県"
  | "栃木県"
  | "群馬県"
  | "埼玉県"
  | "千葉県"
  | "東京都"
  | "神奈川県"
  | "新潟県"
  | "富山県"
  | "石川県"
  | "福井県"
  | "山梨県"
  | "長野県"
  | "岐阜県"
  | "静岡県"
  | "愛知県"
  | "三重県"
  | "滋賀県"
  | "京都府"
  | "大阪府"
  | "兵庫県"
  | "奈良県"
  | "和歌山県"
  | "鳥取県"
  | "島根県"
  | "岡山県"
  | "広島県"
  | "山口県"
  | "徳島県"
  | "香川県"
  | "愛媛県"
  | "高知県"
  | "福岡県"
  | "佐賀県"
  | "長崎県"
  | "熊本県"
  | "大分県"
  | "宮崎県"
  | "鹿児島県"
  | "沖縄県";
export const optionsRegionNameOnlyJp: RegionNameJpType[] = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];
export const regionNameOnlyJpAllSet = new Set(optionsRegionNameOnlyJp);

export const optionRegionsJP = Array(47)
  .fill(null)
  .map((option, index) => index + 1);
export const mappingRegionsJp: { [key: number]: { [key: string | "ja" | "en"]: string } } = {
  1: { ja: "北海道", en: "Hokkaido" },
  2: { ja: "青森県", en: "Aomori" },
  3: { ja: "岩手県", en: "Iwate" },
  4: { ja: "宮城県", en: "Miyagi" },
  5: { ja: "秋田県", en: "Akita" },
  6: { ja: "山形県", en: "Yamagata" },
  7: { ja: "福島県", en: "Fukushima" },
  8: { ja: "茨城県", en: "Ibaraki" },
  9: { ja: "栃木県", en: "Tochigi" },
  10: { ja: "群馬県", en: "Gunma" },
  11: { ja: "埼玉県", en: "Saitama" },
  12: { ja: "千葉県", en: "Chiba" },
  13: { ja: "東京都", en: "Tokyo" },
  14: { ja: "神奈川県", en: "Kanagawa" },
  15: { ja: "新潟県", en: "Niigata" },
  16: { ja: "富山県", en: "Toyama" },
  17: { ja: "石川県", en: "Ishikawa" },
  18: { ja: "福井県", en: "Fukui" },
  19: { ja: "山梨県", en: "Yamanashi" },
  20: { ja: "長野県", en: "Nagano" },
  21: { ja: "岐阜県", en: "Gifu" },
  22: { ja: "静岡県", en: "Shizuoka" },
  23: { ja: "愛知県", en: "Aichi" },
  24: { ja: "三重県", en: "Mie" },
  25: { ja: "滋賀県", en: "Shiga" },
  26: { ja: "京都府", en: "Kyoto" },
  27: { ja: "大阪府", en: "Osaka" },
  28: { ja: "兵庫県", en: "Hyogo" },
  29: { ja: "奈良県", en: "Nara" },
  30: { ja: "和歌山県", en: "Wakayama" },
  31: { ja: "鳥取県", en: "Tottori" },
  32: { ja: "島根県", en: "Shimane" },
  33: { ja: "岡山県", en: "Okayama" },
  34: { ja: "広島県", en: "Hiroshima" },
  35: { ja: "山口県", en: "Yamaguchi" },
  36: { ja: "徳島県", en: "Tokushima" },
  37: { ja: "香川県", en: "Kagawa" },
  38: { ja: "愛媛県", en: "Ehime" },
  39: { ja: "高知県", en: "Kochi" },
  40: { ja: "福岡県", en: "Fukuoka" },
  41: { ja: "佐賀県", en: "Saga" },
  42: { ja: "長崎県", en: "Nagasaki" },
  43: { ja: "熊本県", en: "Kumamoto" },
  44: { ja: "大分県", en: "Oita" },
  45: { ja: "宮崎県", en: "Miyazaki" },
  46: { ja: "鹿児島県", en: "Kagoshima" },
  47: { ja: "沖縄県", en: "Okinawa" },
};

// 都道府県名 => id のMapオブジェクト
export const regionsNameToIdMapJp = new Map(optionRegionsJP.map((id) => [mappingRegionsJp[id].ja, id]));
export const regionsNameToIdMapEn = new Map(optionRegionsJP.map((id) => [mappingRegionsJp[id].en, id]));

export type RegionArray = { id: number; name_ja: string; name_en: string };

export const regionArrayJP = [
  { id: 1, name_ja: "北海道", name_en: "Hokkaido" },
  { id: 2, name_ja: "青森県", name_en: "Aomori" },
  { id: 3, name_ja: "岩手県", name_en: "Iwate" },
  { id: 4, name_ja: "宮城県", name_en: "Miyagi" },
  { id: 5, name_ja: "秋田県", name_en: "Akita" },
  { id: 6, name_ja: "山形県", name_en: "Yamagata" },
  { id: 7, name_ja: "福島県", name_en: "Fukushima" },
  { id: 8, name_ja: "茨城県", name_en: "Ibaraki" },
  { id: 9, name_ja: "栃木県", name_en: "Tochigi" },
  { id: 10, name_ja: "群馬県", name_en: "Gunma" },
  { id: 11, name_ja: "埼玉県", name_en: "Saitama" },
  { id: 12, name_ja: "千葉県", name_en: "Chiba" },
  { id: 13, name_ja: "東京都", name_en: "Tokyo" },
  { id: 14, name_ja: "神奈川県", name_en: "Kanagawa" },
  { id: 15, name_ja: "新潟県", name_en: "Niigata" },
  { id: 16, name_ja: "富山県", name_en: "Toyama" },
  { id: 17, name_ja: "石川県", name_en: "Ishikawa" },
  { id: 18, name_ja: "福井県", name_en: "Fukui" },
  { id: 19, name_ja: "山梨県", name_en: "Yamanashi" },
  { id: 20, name_ja: "長野県", name_en: "Nagano" },
  { id: 21, name_ja: "岐阜県", name_en: "Gifu" },
  { id: 22, name_ja: "静岡県", name_en: "Shizuoka" },
  { id: 23, name_ja: "愛知県", name_en: "Aichi" },
  { id: 24, name_ja: "三重県", name_en: "Mie" },
  { id: 25, name_ja: "滋賀県", name_en: "Shiga" },
  { id: 26, name_ja: "京都府", name_en: "Kyoto" },
  { id: 27, name_ja: "大阪府", name_en: "Osaka" },
  { id: 28, name_ja: "兵庫県", name_en: "Hyogo" },
  { id: 29, name_ja: "奈良県", name_en: "Nara" },
  { id: 30, name_ja: "和歌山県", name_en: "Wakayama" },
  { id: 31, name_ja: "鳥取県", name_en: "Tottori" },
  { id: 32, name_ja: "島根県", name_en: "Shimane" },
  { id: 33, name_ja: "岡山県", name_en: "Okayama" },
  { id: 34, name_ja: "広島県", name_en: "Hiroshima" },
  { id: 35, name_ja: "山口県", name_en: "Yamaguchi" },
  { id: 36, name_ja: "徳島県", name_en: "Tokushima" },
  { id: 37, name_ja: "香川県", name_en: "Kagawa" },
  { id: 38, name_ja: "愛媛県", name_en: "Ehime" },
  { id: 39, name_ja: "高知県", name_en: "Kochi" },
  { id: 40, name_ja: "福岡県", name_en: "Fukuoka" },
  { id: 41, name_ja: "佐賀県", name_en: "Saga" },
  { id: 42, name_ja: "長崎県", name_en: "Nagasaki" },
  { id: 43, name_ja: "熊本県", name_en: "Kumamoto" },
  { id: 44, name_ja: "大分県", name_en: "Oita" },
  { id: 45, name_ja: "宮崎県", name_en: "Miyazaki" },
  { id: 46, name_ja: "鹿児島県", name_en: "Kagoshima" },
  { id: 47, name_ja: "沖縄県", name_en: "Okinawa" },
];

// ----------------------------------- 市区町村 -----------------------------------

// => citiesOptions.tsx に統一

// ----------------------------------- 業種 -----------------------------------
export const optionsIndustryType = Array(53)
  .fill(null)
  .map((option, index) => index + 1);
export const mappingIndustryType: { [key: number]: { [key: string]: string } } = {
  1: { ja: "自動車・輸送機器", en: "" },
  2: { ja: "電子部品・半導体", en: "" },
  3: { ja: "IT・情報通信・ソフトウェア", en: "" },
  4: { ja: "機械要素・部品", en: "" },
  5: { ja: "製造・加工受託", en: "" },
  6: { ja: "鉄/非鉄金属", en: "" },
  7: { ja: "産業用電気機器", en: "" },
  8: { ja: "産業用機械", en: "" },
  9: { ja: "民生用電気機器", en: "" },
  10: { ja: "樹脂・プラスチック", en: "" },
  11: { ja: "ゴム製品", en: "" },
  12: { ja: "化学", en: "" },
  13: { ja: "セラミックス", en: "" },
  14: { ja: "繊維", en: "" },
  15: { ja: "ガラス製品", en: "" },
  16: { ja: "CAD/CAM", en: "" },
  17: { ja: "航空・宇宙", en: "" },
  18: { ja: "建材・資材・什器", en: "" },
  19: { ja: "造船・重機", en: "" },
  20: { ja: "環境", en: "" },
  21: { ja: "印刷業", en: "" },
  22: { ja: "鉱業", en: "" },
  23: { ja: "紙・包装資材", en: "" },
  24: { ja: "ロボット", en: "" },
  25: { ja: "試験・分析・測定", en: "" },
  26: { ja: "エネルギー", en: "" },
  27: { ja: "飲食料品", en: "" },
  28: { ja: "食品機械", en: "" },
  29: { ja: "光学機器", en: "" },
  30: { ja: "医療機器", en: "" },
  31: { ja: "その他製造", en: "" },
  32: { ja: "金融・証券・保険業", en: "" },
  33: { ja: "商社・卸売り", en: "" },
  34: { ja: "広告・メディア", en: "" },
  35: { ja: "不動産", en: "" },
  36: { ja: "建設", en: "" },
  37: { ja: "物流・運送・倉庫関連", en: "" },
  38: { ja: "教育・研究機関", en: "" },
  39: { ja: "石油・石炭関連", en: "" },
  40: { ja: "製薬・医薬品・バイオ", en: "" },
  41: { ja: "医療・福祉", en: "" },
  42: { ja: "化粧品", en: "" },
  43: { ja: "小売", en: "" },
  44: { ja: "飲食店", en: "" },
  45: { ja: "宿泊業", en: "" },
  46: { ja: "サービス業", en: "" },
  47: { ja: "水産・農林業", en: "" },
  48: { ja: "警察・消防・自衛隊", en: "" },
  49: { ja: "公益・特殊・独立行政法人", en: "" },
  50: { ja: "電気・ガス・水道業", en: "" },
  51: { ja: "官公庁", en: "" },
  52: { ja: "自営業・個人", en: "" },
  53: { ja: "その他", en: "" },
};
// export const optionsIndustryType = [
//   "自動車・輸送機器",
//   "電子部品・半導体",
//   "IT・情報通信・ソフトウェア",
//   "機械要素・部品",
//   "製造・加工受託",
//   "鉄/非鉄金属",
//   "産業用電気機器",
//   "産業用機械",
//   "民生用電気機器",
//   "樹脂・プラスチック",
//   "ゴム製品",
//   "化学",
//   "セラミックス",
//   "繊維",
//   "ガラス製品",
//   "CAD/CAM",
//   "航空・宇宙",
//   "建材・資材・什器",
//   "造船・重機",
//   "環境",
//   "印刷業",
//   "鉱業",
//   "紙・包装資材",
//   "ロボット",
//   "試験・分析・測定",
//   "エネルギー",
//   "飲食料品",
//   "食品機械",
//   "光学機器",
//   "医療機器",
//   "その他製造",
//   "金融・証券・保険業",
//   "商社・卸売り",
//   "広告・メディア",
//   "不動産",
//   "建設",
//   "物流・運送・倉庫関連",
//   "教育・研究機関",
//   "石油・石炭関連",
//   "製薬・医薬品・バイオ",
//   "医療・福祉",
//   "化粧品",
//   "小売",
//   "飲食店",
//   "宿泊業",
//   "サービス業",
//   "水産・農林業",
//   "警察・消防・自衛隊",
//   "公益・特殊・独立行政法人",
//   "電気・ガス・水道業",
//   "官公庁",
//   "自営業・個人",
//   "その他",
// ];
// export const optionsIndustryType = [
//   //   "",
//   "機械要素・部品",
//   "自動車・輸送機器",
//   "電子部品・半導体",
//   "製造・加工受託",
//   "産業用機械",
//   "産業用電気機器",
//   "IT・情報通信",
//   "ソフトウェア",
//   "医薬品・バイオ",
//   "樹脂・プラスチック",
//   "ゴム製品",
//   "鉄/非鉄金属",
//   "民生用電気機器",
//   "航空・宇宙",
//   "CAD/CAM",
//   "建材・資材・什器",
//   "小売",
//   "飲食料品",
//   "飲食店・宿泊業",
//   "公益・特殊・独立行政法人",
//   "水産・農林業",
//   "繊維",
//   "ガラス・土石製品",
//   "造船・重機",
//   "環境",
//   "印刷業",
//   "運輸業",
//   "金融・証券・保険業",
//   "警察・消防・自衛隊",
//   "鉱業",
//   "紙・バルブ",
//   "木材",
//   "ロボット",
//   "試験・分析・測定",
//   "エネルギー",
//   "電気・ガス・水道業",
//   "医療・福祉",
//   "サービス業",
//   "その他",
//   "化学",
//   "セラミックス",
//   "食品機械",
//   "光学機器",
//   "医療機器",
//   "その他製造",
//   "倉庫・運輸関連業",
//   "教育・研究機関",
//   "石油・石炭製品",
//   "商社・卸売",
//   "官公庁",
//   "個人",
//   // "不明",
// ];

// 製品分類(大分類)
/**
 * 電子部品・モジュール → electronic_components_modules
  機械部品 → mechanical_parts
  製造・加工機械 → manufacturing_processing_machines
  科学・理化学機器 → scientific_chemical_equipment
  素材・材料 → materials
  測定・分析 → measurement_analysis
  画像処理 → image_processing
  制御・電機機器 → control_electrical_equipment
  工具・消耗品・備品 → tools_consumables_supplies / tools_supplies_equipment
  設計・生産支援 → design_production_support
  IT・ネットワーク → it_network
  オフィス → office
  業務支援サービス → business_support_services
  セミナー・スキルアップ → seminars_skill_up
  その他 → others
 */
export const optionsProductLNameOnlySet: Set<ProductCategoriesLarge> = new Set([
  "electronic_components_modules",
  "mechanical_parts",
  "manufacturing_processing_machines",
  "scientific_chemical_equipment",
  "materials",
  "measurement_analysis",
  "image_processing",
  "control_electrical_equipment",
  "tools_consumables_supplies",
  "design_production_support",
  "it_network",
  "office",
  "business_support_services",
  "seminars_skill_up",
  "others",
]);
export const optionsProductLNameOnly: ProductCategoriesLarge[] = [
  "electronic_components_modules",
  "mechanical_parts",
  "manufacturing_processing_machines",
  "scientific_chemical_equipment",
  "materials",
  "measurement_analysis",
  "image_processing",
  "control_electrical_equipment",
  "tools_consumables_supplies",
  "design_production_support",
  "it_network",
  "office",
  "business_support_services",
  "seminars_skill_up",
  "others",
];
export const optionsProductL: { id: number; name: ProductCategoriesLarge }[] = [
  { id: 1, name: "electronic_components_modules" },
  { id: 2, name: "mechanical_parts" },
  { id: 3, name: "manufacturing_processing_machines" },
  { id: 4, name: "scientific_chemical_equipment" },
  { id: 5, name: "materials" },
  { id: 6, name: "measurement_analysis" },
  { id: 7, name: "image_processing" },
  { id: 8, name: "control_electrical_equipment" },
  { id: 9, name: "tools_consumables_supplies" },
  { id: 10, name: "design_production_support" },
  { id: 11, name: "it_network" },
  { id: 12, name: "office" },
  { id: 13, name: "business_support_services" },
  { id: 14, name: "seminars_skill_up" },
  { id: 15, name: "others" },
];
export const productCategoryLargeNameToIdMap = new Map(optionsProductL.map((obj) => [obj.name, obj.id]));
export const mappingProductL:
  | {
      [K in ProductCategoriesLarge]: { [key: string]: string };
    }
  | { [key: string]: { [key: string]: string } } = {
  electronic_components_modules: { ja: "電子部品・モジュール", en: `` },
  mechanical_parts: { ja: "機械部品", en: `` },
  manufacturing_processing_machines: { ja: "製造・加工機械", en: `` },
  scientific_chemical_equipment: { ja: "科学・理化学機器", en: `` },
  materials: { ja: "素材・材料", en: `` },
  measurement_analysis: { ja: "測定・分析", en: `` },
  image_processing: { ja: "画像処理", en: `` },
  control_electrical_equipment: { ja: "制御・電機機器", en: `` },
  tools_consumables_supplies: { ja: "工具・消耗品・備品", en: `` },
  design_production_support: { ja: "設計・生産支援", en: `` },
  it_network: { ja: "IT・ネットワーク", en: `` },
  office: { ja: "オフィス", en: `` },
  business_support_services: { ja: "業務支援サービス", en: `` },
  seminars_skill_up: { ja: "セミナー・スキルアップ", en: `` },
  others: { ja: "その他", en: `` },
};

// 大分類の全てのid
export const productCategoriesLargeIdsSet: Set<number> = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]);
// export const optionsProductL = Array(15)
//   .fill(null)
//   .map((_, index) => index + 1);
// export const mappingProductL: { [key: number]: { [key: string]: string } } = {
//   1: { ja: "電子部品・モジュール", en: `` },
//   2: { ja: "機械部品", en: `` },
//   3: { ja: "製造・加工機械", en: `` },
//   4: { ja: "科学・理化学機器", en: `` },
//   5: { ja: "素材・材料", en: `` },
//   6: { ja: "測定・分析", en: `` },
//   7: { ja: "画像処理", en: `` },
//   8: { ja: "制御・電機機器", en: `` },
//   9: { ja: "工具・消耗品・備品", en: `` },
//   10: { ja: "設計・生産支援", en: `` },
//   11: { ja: "IT・ネットワーク", en: `` },
//   12: { ja: "オフィス", en: `` },
//   13: { ja: "業務支援サービス", en: `` },
//   14: { ja: "セミナー・スキルアップ", en: `` },
//   15: { ja: "その他", en: `` },
// };
// export const optionsProductL = [
//   "電子部品・モジュール",
//   "機械部品",
//   "製造・加工機械",
//   "科学・理化学機器",
//   "素材・材料",
//   "測定・分析",
//   "画像処理",
//   "制御・電機機器",
//   "工具・消耗品・備品",
//   "設計・生産支援",
//   "IT・ネットワーク",
//   "オフィス",
//   "業務支援サービス",
//   "セミナー・スキルアップ",
//   "その他",
// ];

// 決算月
export type MonthType = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
export const optionsMonth = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
export const mappingMonth:
  | { [K in MonthType]: { [key: string]: string } }
  | { [key: string]: { [key: string]: string } } = {
  "1": { ja: "1月", en: "" },
  "2": { ja: "2月", en: "" },
  "3": { ja: "3月", en: "" },
  "4": { ja: "4月", en: "" },
  "5": { ja: "5月", en: "" },
  "6": { ja: "6月", en: "" },
  "7": { ja: "7月", en: "" },
  "8": { ja: "8月", en: "" },
  "9": { ja: "9月", en: "" },
  "10": { ja: "10月", en: "" },
  "11": { ja: "11月", en: "" },
  "12": { ja: "12月", en: "" },
};

// 会計年度基準
export const optionsFiscalYearBasis = ["firstDayBasis", "endDayBasis"];
export const mappingFiscalYearBasis: { [key: string]: { [key: string]: string } } = {
  firstDayBasis: { ja: "期首（年度初め）", en: "Fiscal Year Based on Start Date" },
  endDayBasis: { ja: "期末（決算日）", en: "Fiscal Year Based on End Date" },
};
export const mappingFiscalYearBasisForOption: { [key: string]: { [key: string]: string } } = {
  firstDayBasis: { ja: "期首（年度初め）に基づく会計年度", en: "Fiscal Year Based on Start Date" },
  endDayBasis: { ja: "期末（決算日）に基づく会計年度", en: "Fiscal Year Based on End Date" },
};

// 規模（ランク）
export type NumberOfEmployeesClassType = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export const optionsNumberOfEmployeesClass = ["A", "B", "C", "D", "E", "F", "G"];
export const mappingNumberOfEmployeesClass:
  | { [K in NumberOfEmployeesClassType]: { [key: string]: string } }
  | { [key: string]: { [key: string]: string } } = {
  A: { ja: "A 1000名以上", en: "" },
  B: { ja: "B 500〜999名", en: "" },
  C: { ja: "C 300〜499名", en: "" },
  D: { ja: "D 200〜299名", en: "" },
  E: { ja: "E 100〜199名", en: "" },
  F: { ja: "F 50〜99名", en: "" },
  G: { ja: "G 1〜49名", en: "" },
};

export const getNumberOfEmployeesClass = (title: string, language: string = "ja") => {
  switch (title) {
    case "A":
      return "A 1000名以上";
      break;
    case "B":
      return "B 500〜999名";
      break;
    case "C":
      return "C 300〜499名";
      break;
    case "D":
      return "D 200〜299名";
      break;
    case "E":
      return "E 100〜199名";
      break;
    case "F":
      return "F 50〜99名";
      break;
    case "G":
      return "G 1〜49名";
      break;
    default:
      return title;
      break;
  }
};
export const getNumberOfEmployeesClassForCustomer = (title: string, language: string = "ja") => {
  switch (title) {
    case "A":
      return "1000名以上";
      break;
    case "B":
      return "500〜999名";
      break;
    case "C":
      return "300〜499名";
      break;
    case "D":
      return "200〜299名";
      break;
    case "E":
      return "100〜199名";
      break;
    case "F":
      return "50〜99名";
      break;
    case "G":
      return "1〜49名";
      break;
    default:
      return title;
      break;
  }
};

export const optionsSearchEmployeesClass = [
  <option key={`A 1000名以上`} value="A*">
    A 1000名以上
  </option>,
  <option key={`B 500~999名`} value="B*">
    B 500~999名
  </option>,
  <option key={`C 300~499名`} value="C*">
    C 300~499名
  </option>,
  <option key={`D 200~299名`} value="D*">
    D 200~299名
  </option>,
  <option key={`E 100~199名`} value="E*">
    E 100~199名
  </option>,
  <option key={`F 50~99名`} value="F*">
    F 50~99名
  </option>,
  <option key={`G 1~49名`} value="G*">
    G 1~49名
  </option>,
];

// 🌠活動画面

// 活動タイプ
// export const optionsActivityType = [
//   "Phone Call Made (Absent)",
//   "Phone Call Made (Proactive)",
//   "Phone Call Made (Reactive)",
//   "Phone Call Made (Pre-Sales Follow-Up)",
//   "Phone Call Made (Post-Sales Follow-Up)",
//   "Phone Call Made (Appointment Scheduling)",
//   "Phone Call Made (Other)",
//   "Email Received",
//   "Email Sent",
//   "Other",
//   "Handover",
// ];
export type ActivityType =
  | "call_no_answer"
  | "call_proactive"
  | "call_reactive"
  | "call_expo"
  | "call_deal_intervention"
  | "call_pre_sales_follow_up"
  | "call_post_sales_follow_up"
  | "call_appointment_scheduling"
  | "call_other"
  | "email_received"
  | "email_sent"
  | "other"
  | "handover";
export const optionsActivityType = [
  "call_no_answer",
  "call_proactive",
  "call_reactive",
  "call_expo",
  "call_deal_intervention",
  "call_pre_sales_follow_up",
  "call_post_sales_follow_up",
  "call_appointment_scheduling",
  "call_other",
  "email_received",
  "email_sent",
  "other",
  "handover",
];
export const mappingActivityType:
  | { [K in ActivityType]: { [key: string]: string } }
  | { [key: string]: { [key: string]: string } } = {
  call_no_answer: { ja: `TEL発信(不在)`, en: `call (No Answer)` },
  call_proactive: { ja: `TEL発信(能動)`, en: `call (Proactive)` },
  call_reactive: { ja: `TEL発信(受動)`, en: `call (Reactive)` },
  call_expo: { ja: `TEL発信(展示会)`, en: `call (Expo)` },
  call_deal_intervention: { ja: `TEL発信(案件介入)`, en: `call (Deal Intervention)` },
  call_pre_sales_follow_up: { ja: `TEL発信(売前ﾌｫﾛｰ)`, en: `call (Pre-Sales Follow-Up)` },
  call_post_sales_follow_up: { ja: `TEL発信(売後ﾌｫﾛｰ)`, en: `call (Post-Sales Follow-Up)` },
  call_appointment_scheduling: { ja: `TEL発信(ｱﾎﾟ組み)`, en: `call (Appointment Scheduling)` },
  call_other: { ja: `TEL発信(その他)`, en: `call (Other)` },
  email_received: { ja: `Email受信`, en: `Email Received` },
  email_sent: { ja: `Email送信`, en: `Email Sent` },
  other: { ja: `その他`, en: `Other` },
  handover: { ja: `引継ぎ`, en: `Handover` },
};

export const getActivityType = (value: string, language: string = "ja") => {
  switch (value) {
    case "call_no_answer":
      return language === "ja" ? `TEL発信(不在)` : `call (No Answer)`;
      break;
    case "call_proactive":
      return language === "ja" ? `TEL発信(能動)` : `call (Proactive)`;
      break;
    case "call_reactive":
      return language === "ja" ? `TEL発信(受動)` : `call (Reactive)`;
      break;
    case "call_expo":
      return language === "ja" ? `TEL発信(展示会)` : `call (Expo)`;
      break;
    case "call_deal_intervention":
      return language === "ja" ? `TEL発信(案件介入)` : `call (Deal Intervention)`;
      break;
    case "call_pre_sales_follow_up":
      return language === "ja" ? `TEL発信(売前ﾌｫﾛｰ)` : `call (Pre-Sales Follow-Up)`;
      break;
    case "call_post_sales_follow_up":
      return language === "ja" ? `TEL発信(売後ﾌｫﾛｰ)` : `call (Post-Sales Follow-Up)`;
      break;
    case "call_appointment_scheduling":
      return language === "ja" ? `TEL発信(ｱﾎﾟ組み)` : `call (Appointment Scheduling)`;
      break;
    case "call_other":
      return language === "ja" ? `TEL発信(その他)` : `call (Other)`;
      break;
    case "email_received":
      return language === "ja" ? `Email受信` : `Email Received`;
      break;
    case "email_sent":
      return language === "ja" ? `Email送信` : `Email Sent`;
      break;
    case "other":
      return language === "ja" ? `その他` : `Other`;
      break;
    case "handover":
      return language === "ja" ? `引継ぎ` : `Handover`;
      break;
    // 面談・案件発生・見積 関連
    case "meeting":
      return language === "ja" ? `面談・訪問` : `Meeting`;
      break;
    case "property":
      return language === "ja" ? `案件発生` : `Deal`;
      break;
    case "quotation":
      return language === "ja" ? `見積` : `Quotation`;
      break;

    default:
      return value;
      break;
  }
};

// 優先度
export const optionsPriority = ["A High", "B Medium", "C Low"];
export const getPriorityName = (value: string, language: string = "ja") => {
  switch (value) {
    case "A High":
      return language === "ja" ? `高` : `High`;
      break;
    case "B Medium":
      return language === "ja" ? `中` : `Medium`;
      break;
    case "C Low":
      return language === "ja" ? `低` : `Low`;
      break;

    default:
      return value;
      break;
  }
};

// 🌠活動画面

// 面談関連

// 面談タイプ
export const optionsMeetingType = ["Visit", "Web"];
export const getMeetingType = (value: string, language: string = "ja") => {
  switch (value) {
    case "Visit":
      return language === "ja" ? `訪問` : `Visit`;
      break;
    case "Web":
      return language === "ja" ? `Web` : `Web`;
      break;

    default:
      return value;
      break;
  }
};

// WEBツール
export type WebToolType = "Zoom" | "Teams" | "Google Meet" | "Webex" | "bellFace" | "Other";
export const optionsWebTool = ["Zoom", "Teams", "Google Meet", "Webex", "bellFace", "Other"];
export const mappingWebTool:
  | {
      [K in WebToolType]: { [key: string]: string };
    }
  | {
      [key: string]: { [key: string]: string };
    } = {
  Zoom: { ja: `Zoom`, en: `Zoom` },
  Teams: { ja: `Teams`, en: `Teams` },
  "Google Meet": { ja: `Google Meet`, en: `Google Meet` },
  Webex: { ja: `Webex`, en: `Webex` },
  bellFace: { ja: `bellFace`, en: `bellFace` },
  Other: { ja: `その他`, en: `Other` },
};
export const getWebTool = (value: string, language: string = "ja") => {
  switch (value) {
    case "Zoom":
      return language === "ja" ? `Zoom` : `Zoom`;
      break;
    case "Teams":
      return language === "ja" ? `Teams` : `Teams`;
      break;
    case "Google Meet":
      return language === "ja" ? `Google Meet` : `Google Meet`;
      break;
    case "Webex":
      return language === "ja" ? `Webex` : `Webex`;
      break;
    case "bellFace":
      return language === "ja" ? `bellFace` : `bellFace`;
      break;
    case "Other":
      return language === "ja" ? `その他` : `Other`;
      break;

    default:
      return value;
      break;
  }
};

// 面談目的
// export const optionsPlannedPurpose = [
//   "新規会社(過去面談無し)/能動",
//   "被り会社(過去面談有り)/能動",
//   "社内ID/能動",
//   "社外･客先ID/能動",
//   "営業メール/受動",
//   "見･聞引合/受動",
//   "DM/受動",
//   "メール/受動",
//   "ホームページ/受動",
//   "ウェビナー/受動",
//   "展示会/受動",
//   "他(売前ﾌｫﾛｰ)",
//   "他(納品説明)",
//   "他(営業能動サポート)",
//   "他(客先要望サポート)",
//   "その他",
// ];
// 面談目的
// export const optionsPlannedPurpose = [
//   "A New Company (No Previous Meetings)/Proactive",
//   "B Overlap Company (Previous Meetings Held)/Proactive",
//   "C Internal Referral/Proactive",
//   "D Client Referral/Proactive",
//   "E Salesperson's Email/Reactive",
//   "F Direct Product Engagement Inquiry/Reactive",
//   "G DM/Reactive",
//   "H Email/Reactive",
//   "I Website/Reactive",
//   "J Webinar/Reactive",
//   "K Trade Show/Reactive",
//   "L Other(Pre-Sales Follow-Up)",
//   "M Other(Delivery Explanation)",
//   "N Other(Proactive Sales Support)",
//   "O Other(Customer Request Support)",
//   "P Others",
// ];
export type PlannedPurposeType =
  | "A new_company/proactive"
  | "B overlap_company/proactive"
  | "C internal_referral/proactive"
  | "D client_referral/proactive"
  | "E salesperson_email/proactive"
  | "F direct_product_engagement_inquiry/reactive"
  | "G dm/reactive"
  | "H email/reactive"
  | "I website/reactive"
  | "J webinar/reactive"
  | "K expo/reactive"
  | "L other_pre_sales_follow_up"
  | "M other_delivery_explanation"
  | "N other_proactive_sales_support"
  | "O other_customer_request_support"
  | "P others";
export const optionsPlannedPurpose = [
  "A new_company/proactive",
  "B overlap_company/proactive",
  "C internal_referral/proactive",
  "D client_referral/proactive",
  "E salesperson_email/proactive",
  "F direct_product_engagement_inquiry/reactive",
  "G dm/reactive",
  "H email/reactive",
  "I website/reactive",
  "J webinar/reactive",
  "K expo/reactive",
  "L other_pre_sales_follow_up",
  "M other_delivery_explanation",
  "N other_proactive_sales_support",
  "O other_customer_request_support",
  "P others",
];
export const mappingPlannedPurpose: {
  [K in PlannedPurposeType]: { [key: string]: string };
} = {
  "A new_company/proactive": { ja: `新規会社(過去面談無し)/能動`, en: `New Company (No Previous Meetings)/Proactive` },
  "B overlap_company/proactive": {
    ja: `被り会社(過去面談有り)/能動`,
    en: `Overlap Company (Previous Meetings Held)/Proactive`,
  },
  "C internal_referral/proactive": { ja: `社内ID(紹介)/能動`, en: `Internal Referral/Proactive` },
  "D client_referral/proactive": { ja: `社外･客先ID(紹介)/能動`, en: `Internal Referral/Proactive` },
  "E salesperson_email/proactive": { ja: `営業メール/能動`, en: `Salesperson's Email/Reactive` },
  "F direct_product_engagement_inquiry/reactive": {
    ja: `見･聞引合/受動`,
    en: `Direct Product Engagement Inquiry/Reactive`,
  },
  "G dm/reactive": { ja: `DM/受動`, en: `DM/Reactive` },
  "H email/reactive": { ja: `メール/受動`, en: `Email/Reactive` },
  "I website/reactive": { ja: `ホームページ/受動`, en: `Website/Reactive` },
  "J webinar/reactive": { ja: `ウェビナー/受動`, en: `Webinar/Reactive` },
  "K expo/reactive": { ja: `展示会/受動`, en: `Trade Show/Reactive` },
  "L other_pre_sales_follow_up": { ja: `他(売前ﾌｫﾛｰ)`, en: `Other(Pre-Sales Follow-Up)` },
  "M other_delivery_explanation": { ja: `他(納品説明)`, en: `Other(Delivery Explanation)` },
  "N other_proactive_sales_support": { ja: `他(営業能動サポート)`, en: `Other(Proactive Sales Support)` },
  "O other_customer_request_support": { ja: `他(客先要望サポート)`, en: `Other(Customer Request Support)` },
  "P others": { ja: `その他`, en: `Others` },
};

// ○能動：営業担当によるアクションきっかけ ○受動：営業担当によるアクション以外からのきっかけ
export const getPlannedPurpose = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A New Company (No Previous Meetings)/Proactive":
    case "A new_company/proactive":
      return language === "ja" ? `新規会社(過去面談無し)/能動` : `New Company (No Previous Meetings)/Proactive`;
      break;
    // case "B Overlap Company (Previous Meetings Held)/Proactive":
    case "B overlap_company/proactive":
      return language === "ja" ? `被り会社(過去面談有り)/能動` : `Overlap Company (Previous Meetings Held)/Proactive`;
      break;
    // case "C Internal Referral/Proactive":
    case "C internal_referral/proactive":
      return language === "ja" ? `社内ID(紹介)/能動` : `Internal Referral/Proactive`;
      break;
    // case "D Client Referral/Proactive":
    case "D client_referral/proactive":
      return language === "ja" ? `社外･客先ID(紹介)/能動` : `Client Referral/Proactive`;
      break;
    // case "E Salesperson's Email/Reactive":
    case "E salesperson_email/proactive":
      return language === "ja" ? `営業メール/能動` : `Salesperson's Email/Reactive`;
      break;
    // case "F Direct Product Engagement Inquiry/Reactive":
    case "F direct_product_engagement_inquiry/reactive":
      return language === "ja" ? `見･聞引合/受動` : `Direct Product Engagement Inquiry/Reactive`;
      break;
    // case "G DM/Reactive":
    case "G dm/reactive":
      return language === "ja" ? `DM/受動` : `DM/Reactive`;
      break;
    // case "H Email/Reactive":
    case "H email/reactive":
      return language === "ja" ? `メール/受動` : `Email/Reactive`;
      break;
    // case "I Website/Reactive":
    case "I website/reactive":
      return language === "ja" ? `ホームページ/受動` : `Website/Reactive`;
      break;
    // case "J Webinar/Reactive":
    case "J webinar/reactive":
      return language === "ja" ? `ウェビナー/受動` : `Webinar/Reactive`;
      break;
    // case "K Trade Show/Reactive":
    case "K expo/reactive":
      return language === "ja" ? `展示会/受動` : `Trade Show/Reactive`;
      break;
    // case "L Other(Pre-Sales Follow-Up)":
    case "L other_pre_sales_follow_up":
      return language === "ja" ? `他(売前ﾌｫﾛｰ)` : `Other(Pre-Sales Follow-Up)`;
      break;
    // case "M Other(Delivery Explanation)":
    case "M other_delivery_explanation":
      return language === "ja" ? `他(納品説明)` : `Other(Delivery Explanation)`;
      break;
    // "N Other(Proactive Sales Support)",
    case "N other_proactive_sales_support":
      return language === "ja" ? `他(営業能動サポート)` : `Other(Proactive Sales Support)`;
      break;
    // case "O Other(Customer Request Support)":
    case "O other_customer_request_support":
      return language === "ja" ? `他(客先要望サポート)` : `Other(Customer Request Support)`;
      break;
    // case "P Others":
    case "P others":
      return language === "ja" ? `その他` : `Others`;
      break;

    default:
      return value;
      break;
  }
};

// 面談開始 時間 分
export const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));

export const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));

export const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

// 面談結果
// export const optionsResultCategory = [
//   "A Deal Development F(Potential for Implementation This Fiscal Period)",
//   "B Deal Development N(Potential for Implementation Next Fiscal Period)",
//   "C Deal Continuation",
//   "D Premature Timing",
//   "E Low Usage Frequency (Needs Present but Insufficient for Implementation)",
//   "F Inconclusive Results (Further Meetings or Verification Needed)",
//   "G Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)",
//   "H No Application or Need Identified",
//   "I Other (Post-Implementation Setup, Support)",
//   "J Other",
// ];

export type ResultCategoryType =
  | "A deal_f"
  | "B deal_n"
  | "C deal_continuation"
  | "D premature"
  | "E low_usage_frequency"
  | "F no_results"
  | "G lack_of_contact_drive"
  | "H no_need"
  | "I other_post_setup_support"
  | "J others";
export const optionsResultCategory = [
  "A deal_f",
  "B deal_n",
  "C deal_continuation",
  "D premature",
  "E low_usage_frequency",
  "F no_results",
  "G lack_of_contact_drive",
  "H no_need",
  "I other_post_setup_support",
  "J others",
];
export const mappingResultCategory:
  | {
      [K in ResultCategoryType]: { [key: string]: string };
    }
  | { [key: string]: { [key: string]: string } } = {
  "A deal_f": {
    ja: `展開F(当期中に導入の可能性あり)`,
    en: `Deal Development F(Potential for Implementation This Fiscal Period)`,
  },
  "B deal_n": {
    ja: `展開N(来期導入の可能性あり)`,
    en: `Deal Development N(Potential for Implementation Next Fiscal Period)`,
  },
  "C deal_continuation": { ja: `展開継続`, en: `Project Continuation` },
  "D premature": { ja: `時期尚早`, en: `Premature Timing` },
  "E low_usage_frequency": {
    ja: `頻度低い(ニーズあるが頻度低く導入には及ばず)`,
    en: `Low Usage Frequency (Needs Present but Insufficient for Implementation)`,
  },
  "F no_results": {
    ja: `結果出ず(再度面談や検証が必要)`,
    en: `Inconclusive Results (Further Meetings or Verification Needed)`,
  },
  "G lack_of_contact_drive": {
    ja: `担当者の推進力無し(ニーズあるが、上長・キーマンにあたる必要有り)`,
    en: `Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)`,
  },
  "H no_need": { ja: `用途・ニーズなし`, en: `No Application or Need Identified` },
  "I other_post_setup_support": { ja: `他(立ち上げ、サポート)`, en: `Other (Post-Implementation Setup, Support)` },
  "J others": { ja: `その他`, en: `Others` },
};
export const getResultCategory = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A Deal Development F(Potential for Implementation This Fiscal Period)":
    case "A deal_f":
      return language === "ja"
        ? `展開F(当期中に導入の可能性あり)`
        : `Deal Development F(Potential for Implementation This Fiscal Period)`;
      break;
    // case "B Deal Development N(Potential for Implementation Next Fiscal Period)":
    case "B deal_n":
      return language === "ja"
        ? `展開N(来期導入の可能性あり)`
        : `Deal Development N(Potential for Implementation Next Fiscal Period)`;
      break;
    // case "C Deal Continuation":
    case "C deal_continuation":
      return language === "ja" ? `展開継続` : `Project Continuation`;
      break;
    // case "D Premature Timing":
    case "D premature":
      return language === "ja" ? `時期尚早` : `Premature Timing`;
      break;
    // case "E Low Usage Frequency (Needs Present but Insufficient for Implementation)":
    case "E low_usage_frequency":
      return language === "ja"
        ? `頻度低い(ニーズあるが頻度低く導入には及ばず)`
        : `Low Usage Frequency (Needs Present but Insufficient for Implementation)`;
      break;
    // case "F Inconclusive Results (Further Meetings or Verification Needed)":
    case "F no_results":
      return language === "ja"
        ? `結果出ず(再度面談や検証が必要)`
        : `Inconclusive Results (Further Meetings or Verification Needed)`;
      break;
    // case "G Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)":
    case "G lack_of_contact_drive":
      return language === "ja"
        ? `担当者の推進力無し(ニーズあるが、上長・キーマンにあたる必要有り)`
        : `Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)`;
      break;
    // case "H No Application or Need Identified":
    case "H no_need":
      return language === "ja" ? `用途・ニーズなし` : `No Application or Need Identified`;
      break;
    // case "I Other (Post-Implementation Setup, Support)":
    case "I other_post_setup_support":
      return language === "ja" ? `他(立ち上げ、サポート)` : `Other (Post-Implementation Setup, Support)`;
      break;
    // case "J Other":
    case "J others":
      return language === "ja" ? `その他` : `Others`;
      break;

    default:
      return value;
      break;
  }
};

// 面談時_決裁者商談有無
// export const optionsResultNegotiateDecisionMaker = ["決裁者と未商談", "決裁者と商談済み"];
// export const optionsResultNegotiateDecisionMaker = [
//   "A No Discussion with Decision-Maker",
//   "B Discussion Held with Decision-Maker",
// ];
export const optionsResultNegotiateDecisionMaker = ["A no_meeting_d", "B meeting_d"];
export const getResultNegotiateDecisionMaker = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A No Discussion with Decision-Maker":
    // case "A no_meeting_decision_maker":
    case "A no_meeting_d":
      return language === "ja" ? `決裁者と未商談` : `No Meeting with Decision-Maker`;
      break;
    // case "B Discussion Held with Decision-Maker":
    // case "B meeting_decision_maker":
    case "B meeting_d":
      return language === "ja" ? `決裁者と商談済み` : `Meeting with Decision-Maker`;
      break;

    default:
      return value;
      break;
  }
};

// 事前同席依頼
// export const optionsMeetingParticipationRequest = [
//   "A No Request for Accompaniment",
//   "B Request for Accompaniment Made, Accompaniment Approved",
//   "C Request for Accompaniment Made, Accompaniment Denied",
// ];
export const optionsPreMeetingParticipationRequest = ["A no_request", "B request"];
export const getPreMeetingParticipationRequest = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A No Request for Accompaniment":
    case "A no_request":
      return language === "ja" ? `同席依頼無し` : `No Request for Accompaniment`;
      break;
    // case "B Request for Accompaniment Made, Accompaniment Approved":
    case "B request":
      return language === "ja" ? `同席依頼済み` : `Request for Accompaniment Made`;
      break;

    default:
      return value;
      break;
  }
};

// 面談時同席依頼
// export const optionsMeetingParticipationRequest = [
//   "A No Request for Accompaniment",
//   "B Request for Accompaniment Made, Accompaniment Approved",
//   "C Request for Accompaniment Made, Accompaniment Denied",
// ];
export const optionsMeetingParticipationRequest = ["A no_request", "B request_success", "C request_denied"];
export const getMeetingParticipationRequest = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A No Request for Accompaniment":
    case "A no_request":
      return language === "ja" ? `同席依頼無し` : `No Request for Accompaniment`;
      break;
    // case "B Request for Accompaniment Made, Accompaniment Approved":
    case "B request_success":
      return language === "ja" ? `同席依頼済み 同席OK` : `Request for Accompaniment Made, Accompaniment Approved`;
      break;
    // case "C Request for Accompaniment Made, Accompaniment Denied":
    case "C request_denied":
      return language === "ja" ? `同席依頼済み 同席NG` : `Request for Accompaniment Made, Accompaniment Denied`;
      break;

    default:
      return value;
      break;
  }
};

// 🌠面談 ここまで

// 🌠物件・案件

// 現ステータス
// export const optionsCurrentStatus = ["A Lead", "B Deal Development", "C Application", "D Order Received"];
export type CurrentStatusType = "A lead" | "B deal_development" | "C application" | "D order_received";
export const optionsCurrentStatus = ["A lead", "B deal_development", "C application", "D order_received"];
export const mappingCurrentStatus:
  | {
      [K in CurrentStatusType]: { [key: string]: string };
    }
  | {
      [key: string]: { [key: string]: string };
    } = {
  "A lead": { ja: `リード`, en: `Lead` },
  "B deal_development": { ja: `展開 (案件化・商談化)`, en: `Deal Development` },
  "C application": { ja: `申請 (予算申請案件)`, en: `Application` },
  "D order_received": { ja: `受注`, en: `Order Received` },
};
export const getCurrentStatus = (value: string, language: string = "ja") => {
  switch (value) {
    case "A lead":
      return language === "ja" ? `リード` : `Lead`;
      break;
    case "B deal_development":
      return language === "ja" ? `展開 (案件化・商談化)` : `Deal Development`;
      break;
    case "C application":
      return language === "ja" ? `申請 (予算申請案件)` : `Application`;
      break;
    case "D order_received":
      return language === "ja" ? `受注` : `Order Received`;
      break;

    default:
      return value;
      break;
  }
};

// 案件発生動機
// export const optionsReasonClass = [
//   "A New Company (No Previous Meetings)/Proactive",
//   "B Overlap Company (Previous Meetings Held)/Proactive",
//   "C Internal Referral/Proactive",
//   "D Client Referral/Proactive",
//   "E Salesperson's Email/Reactive",
//   "F Direct Product Engagement Inquiry/Reactive",
//   "G DM/Reactive",
//   "H Email/Reactive",
//   "I Website/Reactive",
//   "J Webinar/Reactive",
//   "K Trade Show/Reactive",
//   "L Others",
// ];
export type ReasonClassType =
  | "A new_company/proactive"
  | "B overlap_company/proactive"
  | "C internal_referral/proactive"
  | "D client_referral/proactive"
  | "E salesperson_email/proactive"
  | "F direct_product_engagement_inquiry/reactive"
  | "G dm/reactive"
  | "H email/reactive"
  | "I website/reactive"
  | "J webinar/reactive"
  | "K expo/reactive"
  | "L others";
export const optionsReasonClass = [
  "A new_company/proactive",
  "B overlap_company/proactive",
  "C internal_referral/proactive",
  "D client_referral/proactive",
  "E salesperson_email/proactive",
  "F direct_product_engagement_inquiry/reactive",
  "G dm/reactive",
  "H email/reactive",
  "I website/reactive",
  "J webinar/reactive",
  "K expo/reactive",
  "L others",
];
export const mappingReasonClass:
  | { [K in ReasonClassType]: { [key: string]: string } }
  | { [key: string]: { [key: string]: string } } = {
  "A new_company/proactive": { ja: `新規会社(過去面談無し)/能動`, en: `New Company (No Previous Meetings)/Proactive` },
  "B overlap_company/proactive": {
    ja: `被り会社(過去面談有り)/能動`,
    en: `Overlap Company (Previous Meetings Held)/Proactive`,
  },
  "C internal_referral/proactive": { ja: `社内ID/能動`, en: `Internal Referral/Proactive` },
  "D client_referral/proactive": { ja: `社外･客先ID/能動`, en: `Client Referral/Proactive` },
  "E salesperson_email/proactive": { ja: `営業メール/能動`, en: `Salesperson's Email/Proactive` },
  "F direct_product_engagement_inquiry/reactive": {
    ja: `見･聞引合/受動`,
    en: `Direct Product Engagement Inquiry/Reactive`,
  },
  "G dm/reactive": { ja: `DM/受動`, en: `DM/Reactive` },
  "H email/reactive": { ja: `メール/受動`, en: `Email/Reactive` },
  "I website/reactive": { ja: `ホームページ/受動`, en: `Website/Reactive` },
  "J webinar/reactive": { ja: `ウェビナー/受動`, en: `Webinar/Reactive` },
  "K expo/reactive": { ja: `展示会/受動`, en: `Trade Show/Reactive` },
  "L others": { ja: `その他`, en: `Others` },
};
export const getReasonClass = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A New Company (No Previous Meetings)/Proactive":
    case "A new_company/proactive":
      return language === "ja" ? `新規会社(過去面談無し)/能動` : `New Company (No Previous Meetings)/Proactive`;
      break;
    // case "B Overlap Company (Previous Meetings Held)/Proactive":
    case "B overlap_company/proactive":
      return language === "ja" ? `被り会社(過去面談有り)/能動` : `Overlap Company (Previous Meetings Held)/Proactive`;
      break;
    // case "C Internal Referral/Proactive":
    case "C internal_referral/proactive":
      return language === "ja" ? `社内ID/能動` : `Internal Referral/Proactive`;
      break;
    // case "D Client Referral/Proactive":
    case "D client_referral/proactive":
      return language === "ja" ? `社外･客先ID/能動` : `Client Referral/Proactive`;
      break;
    // case "E Salesperson's Email/Reactive":
    case "E salesperson_email/proactive":
      return language === "ja" ? `営業メール/能動` : `Salesperson's Email/Proactive`;
      break;
    // case "F Direct Product Engagement Inquiry/Reactive":
    case "F direct_product_engagement_inquiry/reactive":
      return language === "ja" ? `見･聞引合/受動` : `Direct Product Engagement Inquiry/Reactive`;
      break;
    // case "G DM/Reactive":
    case "G dm/reactive":
      return language === "ja" ? `DM/受動` : `DM/Reactive`;
      break;
    // case "H Email/Reactive":
    case "H email/reactive":
      return language === "ja" ? `メール/受動` : `Email/Reactive`;
      break;
    // case "I Website/Reactive":
    case "I website/reactive":
      return language === "ja" ? `ホームページ/受動` : `Website/Reactive`;
      break;
    // case "J Webinar/Reactive":
    case "J webinar/reactive":
      return language === "ja" ? `ウェビナー/受動` : `Webinar/Reactive`;
      break;
    // case "K Trade Show/Reactive":
    case "K expo/reactive":
      return language === "ja" ? `展示会/受動` : `Trade Show/Reactive`;
      break;
    // case "L Others":
    case "L others":
      return language === "ja" ? `その他` : `Others`;
      break;

    default:
      return value;
      break;
  }
};

// 売上貢献区分
// export const optionsSalesContributionCategory = ["A Direct Sales", "B Handover Sales", "C Repeat Sales"];
export type SalesContributionCategoryType = "A direct_sales" | "B handover_sales" | "C repeat_sales";
export const optionsSalesContributionCategory = ["A direct_sales", "B handover_sales", "C repeat_sales"];
export const mappingSalesContributionCategory:
  | {
      [K in SalesContributionCategoryType]: { [key: string]: string };
    }
  | {
      [key: string]: { [key: string]: string };
    } = {
  "A direct_sales": { ja: `自己売上(自身で発生、自身で売上)`, en: `Direct Sales` },
  "B handover_sales": { ja: `引継ぎ売上(他担当が発生、引継ぎで売上)`, en: `Handover Sales` },
  "C repeat_sales": { ja: `リピート売上`, en: `Repeat Sales` },
};
export const getSalesContributionCategory = (value: string, language: string = "ja") => {
  switch (value) {
    case "A direct_sales":
      return language === "ja" ? `自己売上(自身で発生、自身で売上)` : `Direct Sales`;
      break;
    case "B handover_sales":
      return language === "ja" ? `引継ぎ売上(他担当が発生、引継ぎで売上)` : `Handover Sales`;
      break;
    case "C repeat_sales":
      return language === "ja" ? `リピート売上` : `Repeat Sales`;
      break;

    default:
      return value;
      break;
  }
};

// 導入分類
// export const optionsSalesClass = ["A New Installation", "B Expansion", "C Upgrade"];
export type SalesClassType = "A new_installation" | "B expansion" | "C upgrade";
export const optionsSalesClass = ["A new_installation", "B expansion", "C upgrade"];
export const mappingSalesClass:
  | {
      [K in SalesClassType]: { [key: string]: string };
    }
  | { [key: string]: { [key: string]: string } } = {
  "A new_installation": { ja: `新規`, en: `New Installation` },
  "B expansion": { ja: `増設`, en: `Expansion` },
  "C upgrade": { ja: `更新`, en: `Upgrade` },
};
export const getSalesClass = (value: string, language: string = "ja") => {
  switch (value) {
    case "A new_installation":
      return language === "ja" ? `新規` : `New Installation`;
      break;
    case "B expansion":
      return language === "ja" ? `増設` : `Expansion`;
      break;
    case "C upgrade":
      return language === "ja" ? `更新` : `Upgrade`;
      break;

    default:
      return value;
      break;
  }
};

// 今期・来期
// export const optionsTermDivision = ["A This Fiscal Year", "B Next Fiscal Year"];
export const optionsTermDivision = ["A fiscal_period", "B next_period"];
export const getTermDivision = (value: string, language: string = "ja") => {
  switch (value) {
    // case "A This Fiscal Year":
    case "A fiscal_period":
      return language === "ja" ? `今期 (今期に獲得予定)` : `This Fiscal Period`;
      break;
    // case "B Next Fiscal Year":
    case "B next_period":
      return language === "ja" ? `来期 (来期に獲得予定)` : `Next Fiscal Period`;
      break;

    default:
      return value;
      break;
  }
};

// サブスク分類
// export const optionsSubscriptionInterval = ["A Monthly", "B Annual"];
export const optionsSubscriptionInterval = ["A monthly", "B annual"];
export const getSubscriptionInterval = (value: string, language: string = "ja") => {
  switch (value) {
    case "A monthly":
      return language === "ja" ? `月額` : `Monthly Fee`;
      break;
    case "B annual":
      return language === "ja" ? `年額` : `Annual Fee`;
      break;

    default:
      return value;
      break;
  }
};

// リース分類
// export const optionsLeaseDivision = ["A Finance Lease", "B Operating Lease"];
export const optionsLeaseDivision = ["A finance_lease", "B operating_lease"];
export const getLeaseDivision = (value: string, language: string = "ja") => {
  switch (value) {
    case "A finance_lease":
      return language === "ja" ? `ファイナンスリース` : `Finance Lease`;
      break;
    case "B operating_lease":
      return language === "ja" ? `オペレーティングリース` : `Operating Lease`;
      break;

    default:
      return value;
      break;
  }
};

// 月初確度 中間見直確度
//  order_certainty_start_of_month ネタ読みの精度も確認するため
// 最初のネタ確度から受注、ペンディング、没のアクティビティを担当者毎に記録する
// 各確度ごとの獲得率を算出して可視化することで、正確な売上予測と過分な製造、在庫管理によるコストを削減、利益最大化を図る
export type OrderCertaintyStartOfMonthType = 1 | 2 | 3 | 4;
export const optionsOrderCertaintyStartOfMonth = [1, 2, 3, 4];

export const mappingOrderCertaintyStartOfMonth:
  | { [K in OrderCertaintyStartOfMonthType]: { [key: string]: string } }
  | { [key: number]: { [key: string]: string } } = {
  1: { ja: `A  (受注済み)`, en: "A Already Ordered" },
  2: { ja: `○  (80%以上の確率で受注)`, en: "○ An 80% probability of winning the order" },
  3: { ja: `△  (50%以上の確率で受注)`, en: "△ An 50% probability of winning the order" },
  4: { ja: `▲  (30%以上の確率で受注)`, en: "▲ An 30% probability of winning the order" },
};
export const mappingOrderCertaintyStartOfMonthToast: { [key: number]: { [key: string]: string } } = {
  1: { ja: `受注済み`, en: "" },
  2: { ja: `○ネタ`, en: "" },
  3: { ja: `△ネタ`, en: "" },
  4: { ja: `▲ネタ`, en: "" },
};
export const mappingSalesProbablyShort: { [key: number]: { [key: string]: string } } = {
  1: { ja: `A（受注済み）`, en: "A" },
  2: { ja: `○ネタ`, en: "○" },
  // 2: { ja: `⚪️ネタ`, en: "⚪️" },
  3: { ja: `△ネタ`, en: "△" },
  4: { ja: `▲ネタ`, en: "▲" },
};
export const getOrderCertaintyStartOfMonth = (
  classNum: number,
  language: string = "ja",
  withLabel: boolean = false
) => {
  switch (classNum) {
    case 1:
      return language === "ja" ? `A (受注済み)` : `A Already Ordered`; // AwardのA
      break;
    case 2:
      return language === "ja"
        ? `○${withLabel ? `ネタ` : ``} (80%以上の確率で受注)`
        : `○ An 80% probability of winning the order`;
      break;
    case 3:
      return language === "ja"
        ? `△${withLabel ? `ネタ` : ``} (50%以上の確率で受注)`
        : `△ An 50% probability of winning the order`;
      break;
    case 4:
      return language === "ja"
        ? `▲${withLabel ? `ネタ` : ``} (30%以上の確率で受注)`
        : `▲ An 30% probability of winning the order`;
      break;

    default:
      return "-";
      break;
  }
};
export const getOrderCertaintyStartOfMonthZenkaku = (
  classNum: number,
  language: string = "ja",
  withLabel: boolean = false
) => {
  switch (classNum) {
    case 1:
      return language === "ja" ? `A（受注済み）` : `A Already Ordered`; // AwardのA
      break;
    case 2:
      return language === "ja"
        ? `○${withLabel ? `ネタ` : ``}（80%以上の確率で受注）`
        : `○ An 80% probability of winning the order`;
      break;
    case 3:
      return language === "ja"
        ? `△${withLabel ? `ネタ` : ``}（50%以上の確率で受注）`
        : `△ An 50% probability of winning the order`;
      break;
    case 4:
      return language === "ja"
        ? `▲${withLabel ? `ネタ` : ``}（30%以上の確率で受注）`
        : `▲ An 30% probability of winning the order`;
      break;

    default:
      return "-";
      break;
  }
};

// export const getInvertOrderCertaintyStartOfMonth = (classNum: string, language: string = "ja") => {
//   switch (classNum) {
//     case "A (受注済み)":
//       return 1;
//       break;
//     case "○ (80%以上の確率で受注)":
//       return 2;
//       break;
//     case "△ (50%以上の確率で受注)":
//       return 3;
//       break;
//     case "▲ (30%以上の確率で受注)":
//       return 4;
//       break;

//     default:
//       break;
//   }
// };

// 競合状況
// export const optionsCompetitionState = [
//   "A No Competitors",
//   "B With Competitors ○Superior",
//   "C With Competitors △Equal",
//   "D With Competitors ▲Inferior",
// ];
export type CompetitionStateType =
  | "A no_competitors"
  | "B with_competitors_superior"
  | "C with_competitors_equal"
  | "D with_competitors_inferior";
export const optionsCompetitionState = [
  "A no_competitors",
  "B with_competitors_superior",
  "C with_competitors_equal",
  "D with_competitors_inferior",
];
export const mappingCompetitionState:
  | { [K in CompetitionStateType]: { [key: string]: string } }
  | { [key: string]: { [key: string]: string } } = {
  "A no_competitors": { ja: `競合無し`, en: `No Competitors` },
  "B with_competitors_superior": { ja: `競合有り ○優勢`, en: `With Competitors ○Superior` },
  "C with_competitors_equal": { ja: `競合有り △`, en: `With Competitors △Equal` },
  "D with_competitors_inferior": { ja: `競合有り ▲劣勢`, en: `With Competitors ▲Inferior` },
};
export const getCompetitionState = (value: string, language: string = "ja") => {
  switch (value) {
    case "A no_competitors":
      return language === "ja" ? `競合無し` : `No Competitors`;
      break;
    case "B with_competitors_superior":
      return language === "ja" ? `競合有り ○優勢` : `With Competitors ○Superior`;
      break;
    case "C with_competitors_equal":
      return language === "ja" ? `競合有り △` : `With Competitors △Equal`;
      break;
    case "D with_competitors_inferior":
      return language === "ja" ? `競合有り ▲劣勢` : `With Competitors ▲Inferior`;
      break;

    default:
      return value;
      break;
  }
};

// 決裁者商談有無
// export const optionsDecisionMakerNegotiation = [
//   "A Unable to Meet with the Decision-Maker",
//   "B Met with the Decision-Maker but Unable to Discuss Business",
//   "C Discussed Business with the Decision-Maker",
// ];
export type DecisionMakerNegotiationType =
  | "A no_meeting"
  | "B met_but_unable_to_discuss_business"
  | "C discussed_business";
export const optionsDecisionMakerNegotiation = [
  "A no_meeting",
  "B met_but_unable_to_discuss_business",
  "C discussed_business",
];
export const mappingDecisionMakerNegotiation:
  | { [K in DecisionMakerNegotiationType]: { [key: string]: string } }
  | { [key: string]: { [key: string]: string } } = {
  "A no_meeting": { ja: `決裁者と会えず`, en: `Unable to Meet with the Decision-Maker` },
  "B met_but_unable_to_discuss_business": {
    ja: `決裁者と会うも、商談できず`,
    en: `Met with the Decision-Maker but Unable to Discuss Business`,
  },
  "C discussed_business": { ja: `決裁者と商談済み`, en: `Discussed Business with the Decision-Maker` },
};
export const getDecisionMakerNegotiation = (value: string, language: string = "ja") => {
  switch (value) {
    case "A no_meeting":
      return language === "ja" ? `決裁者と会えず` : `Unable to Meet with the Decision-Maker`;
      break;
    case "B met_but_unable_to_discuss_business":
      return language === "ja"
        ? `決裁者と会うも、商談できず`
        : `Met with the Decision-Maker but Unable to Discuss Business`;
      break;
    case "C discussed_business":
      return language === "ja" ? `決裁者と商談済み` : `Discussed Business with the Decision-Maker`;
      break;

    default:
      return value;
      break;
  }
};

// 🌟見積

// 提出区分
export const optionsSubmissionClass = ["A submission", "B internal"];
export const getSubmissionClass = (value: string, language: string = "ja") => {
  switch (value) {
    case "A submission":
      return language === "ja" ? `提出用` : `For Submission`;
      break;
    case "B internal":
      return language === "ja" ? `社内用` : `For Internal Use`;
      break;

    default:
      return value;
      break;
  }
};

// 納期
export const optionsDeadline = ["当日出荷", "１ヶ月以内", "お打ち合わせにより決定"];

// 納入場所
export const optionsDeliveryPlace = ["貴社指定場所", "お打ち合わせにより決定"];

// 取引方法
export const optionsPaymentTerms = ["従来通り", "月末締め翌月末現金お振込み", "お打ち合わせにより決定"];

// 見積区分
export const optionsQuotationDivision = ["A standard", "B set", "C lease"];
export const getQuotationDivision = (value: string, language: string = "ja") => {
  switch (value) {
    case "A standard":
      return (language = "ja" ? `標準見積` : `Standard estimate`);
      break;
    case "B set":
      return (language = "ja" ? `セット見積` : `Set estimate`);
      break;
    case "C lease":
      return (language = "ja" ? `リース見積` : `Lease estimate`);
      break;

    default:
      return value;
      break;
  }
};

// 送付方法
// export const optionsSendingMethod = ["送付状なし", "Fax", "郵送"];
// export const optionsSendingMethod = ["送付状なし"];
// export const optionsSendingMethod = ["Without Cover Letter", "Fax", "Mail", "Email"];
export const optionsSendingMethod = ["without_cover_letter", "fax", "mail", "email"];
export const getSendingMethod = (value: string, language: string = "ja") => {
  switch (value) {
    case "without_cover_letter":
      return (language = "ja" ? `送付状なし` : `Without Cover Letter`);
      break;
    case "fax":
      return (language = "ja" ? `Fax` : `Fax`);
      break;
    case "mail":
      return (language = "ja" ? `郵送` : `Mail`);
      break;
    case "email":
      return (language = "ja" ? `メール` : `Email`);
      break;

    default:
      return value;
      break;
  }
};

// 消費税区分
// export const optionsSalesTaxClass = ["A With Tax Notation", "B Without Tax Notation"];
export const optionsSalesTaxClass = ["A with_tax_notation", "B without_tax_notation"];
export const getSalesTaxClass = (value: string, language: string = "ja") => {
  switch (value) {
    case "A with_tax_notation":
      return (language = "ja" ? `消費税記載なし` : `With Tax Notation`);
      break;
    case "B without_tax_notation":
      return (language = "ja" ? `消費税記載あり` : `Without Tax Notation`);
      break;

    default:
      return value;
      break;
  }
};

// 消費税区分
export const optionsSalesTaxRate = [
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
];
// export const optionsSalesTaxRate = ["10", "11", "12", "13", "14", "15", "16", "17", "18"];

// -------------------------- 🌟SDB関連🌟 --------------------------

// 🔹テーマパレットカラー
export const optionsColorPalette = [
  "theme-brand-f",
  "theme-brand-f-gradient",
  "theme-black-gradient",
  "theme-simple12",
  "theme-simple17",
];

export type SdbTabsListItem = {
  title: "sales_progress" | "sales_dashboard" | "sales_process" | "sales_area_map";
  name: { [key: string]: string };
};
export type PeriodListItem = {
  title: "fiscal_year" | "half_year" | "quarter" | "year_month";
  name: { [key: string]: string };
};
export type TabsListItem = {
  title: string;
  name: { [key: string]: string };
};
// ダッシュボードタブ
export const sdbTabsList: SdbTabsListItem[] = [
  { title: "sales_progress", name: { ja: "売上進捗・ネタ表", en: "Sales Progress" } },
  { title: "sales_dashboard", name: { ja: "セールスダッシュボード", en: "Sales Dashboard" } },
  { title: "sales_process", name: { ja: "営業プロセス", en: "Sales Process" } },
  // { title: "dealsStatus", name: { ja: "案件ステータス", en: "Deals Status" } },
  { title: "sales_area_map", name: { ja: "売上エリアマップ", en: "Sales Area Map" } },
];

export const mappingSdbTabName: { [key: string]: { [key: string]: string } } = {
  sales_progress: { ja: "売上進捗・ネタ表", en: "Sales Progress" },
  sales_dashboard: { ja: "セールスダッシュボード", en: "Sales Dashboard" },
  sales_process: { ja: "営業プロセス", en: "Sales Process" },
  // deals_status: { ja: "案件ステータス", en: "Deals Status" },
  sales_area_map: { ja: "売上エリアマップ", en: "Sales Area Map" },
};
// セクションタブ 全社・事業部・係・メンバー
export const sectionList: TabsListItem[] = [
  { title: "company", name: { ja: "全社", en: "Company" } },
  { title: "department", name: { ja: "事業部", en: "Department" } },
  { title: "section", name: { ja: "課・セクション", en: "Section" } },
  { title: "unit", name: { ja: "係・チーム", en: "Unit" } },
  { title: "member", name: { ja: "メンバー", en: "Member" } },
  { title: "office", name: { ja: "事業所", en: "Office" } },
];
export const sectionListForSalesTarget: TabsListItem[] = [
  { title: "company", name: { ja: "全社", en: "Company" } },
  { title: "department", name: { ja: "事業部", en: "Department" } },
  { title: "section", name: { ja: "課・セクション", en: "Section" } },
  { title: "unit", name: { ja: "係・チーム", en: "Unit" } },
  { title: "office", name: { ja: "事業所", en: "Office" } },
];
export const mappingSectionName: { [key: string]: { [key: string]: string } } = {
  company: { ja: "全社", en: "Company" },
  department: { ja: "事業部", en: "Department" },
  section: { ja: "課・セクション", en: "Section" },
  unit: { ja: "係・チーム", en: "Unit" },
  member: { ja: "メンバー", en: "Member" },
  office: { ja: "事業所", en: "Office" },
};
// 期間タブ 年度(FiscalYear)・半期(Half)・四半期(Quarter)・月次(Monthly)
export const periodList: PeriodListItem[] = [
  { title: "fiscal_year", name: { ja: "年度", en: "Fiscal Year" } },
  { title: "half_year", name: { ja: "半期", en: "Half Year" } },
  { title: "quarter", name: { ja: "四半期", en: "Quarter" } },
  { title: "year_month", name: { ja: "月度", en: "Monthly" } },
];
export const periodListWithoutFiscalYear: PeriodListItem[] = [
  { title: "half_year", name: { ja: "半期", en: "Half Year" } },
  { title: "quarter", name: { ja: "四半期", en: "Quarter" } },
  { title: "year_month", name: { ja: "月度", en: "Monthly" } },
];
export const mappingPeriodName: { [key: string]: { [key: string]: string } } = {
  fiscalYear: { ja: "年度", en: "Fiscal Year" },
  half: { ja: "半期", en: "Half" },
  quarter: { ja: "四半期", en: "Quarter" },
  monthly: { ja: "月度", en: "Monthly" },
};
// 年度を選択した際の年度を2020年から現在の会計年度までの期間で選択肢を取得する関数
type FiscalYearProps = {
  fiscalYearEnd: string | Date | null;
  fiscalYearBasis: string;
  currentFiscalYearEndDate: Date | null;
};
type CalendarYearProps = {
  currentFiscalYearEndDate: Date;
};
export type PeriodOption = {
  key: string;
  value: string;
  name: { [key: string]: string };
};
export const getOptionsFiscalYear = ({
  fiscalYearEnd,
  fiscalYearBasis,
  currentFiscalYearEndDate,
}: FiscalYearProps): PeriodOption[] => {
  const currentFiscalYear = calculateCurrentFiscalYear({
    fiscalYearEnd: fiscalYearEnd,
    fiscalYearBasis: fiscalYearBasis,
  });

  if (!currentFiscalYear) return [];

  const initialYear = 2020;
  let yearList = [];
  for (let year = initialYear; year <= currentFiscalYear; year++) {
    const yearOption = { key: `year${year}`, value: `${year}`, name: { ja: `${year}年`, en: `${year}` } };
    yearList.push(yearOption);
  }

  if (currentFiscalYearEndDate === null) {
    return yearList;
  }

  // 現在の日付が決算日から３ヶ月以内かどうかをチェック subMonths: 特定のDateから3ヶ月前の日付を計算
  const threeMonthsBeforeFiscalEnd = subMonths(currentFiscalYearEndDate, 3);

  // isWithinInterval: 第一引数に指定された日付が、第二引数に指定された期間内にあるかどうかを真偽値で返す
  const isWithin3Months = isWithinInterval(new Date(), {
    start: threeMonthsBeforeFiscalEnd,
    end: currentFiscalYearEndDate,
  });

  if (isWithin3Months) {
    // ３ヶ月以内であれば翌年度も追加
    const currentEndCalendarYear = currentFiscalYearEndDate.getFullYear();
    const yearOptionNext = {
      key: `year${currentEndCalendarYear + 1}`,
      value: `${currentEndCalendarYear + 1}`,
      name: { ja: `${currentEndCalendarYear + 1}年`, en: `${currentEndCalendarYear + 1}` },
    };
    yearList.push(yearOptionNext);
  }

  return yearList;
};

// 会計年度ではないカレンダー年のオプション 引数に決算日のDateオブジェクトを受け取る
export const getOptionsCalendarYear = ({ currentFiscalYearEndDate }: CalendarYearProps): PeriodOption[] => {
  const initialYear = 2020;
  const currentEndCalendarYear = currentFiscalYearEndDate.getFullYear();
  let yearList = [];
  for (let year = initialYear; year <= currentEndCalendarYear; year++) {
    const yearOption = { key: `calendarYear${year}`, value: `${year}`, name: { ja: `${year}年`, en: `${year}` } };
    yearList.push(yearOption);
  }

  // 現在の日付が決算日から３ヶ月以内かどうかをチェック subMonths: 特定のDateから3ヶ月前の日付を計算
  const threeMonthsBeforeFiscalEnd = subMonths(currentFiscalYearEndDate, 3);

  // isWithinInterval: 第一引数に指定された日付が、第二引数に指定された期間内にあるかどうかを真偽値で返す
  const isWithin3Months = isWithinInterval(new Date(), {
    start: threeMonthsBeforeFiscalEnd,
    end: currentFiscalYearEndDate,
  });

  if (isWithin3Months) {
    // ３ヶ月以内であれば翌年度も追加
    const yearOptionNext = {
      key: `calendarYear${currentEndCalendarYear + 1}`,
      value: `${currentEndCalendarYear + 1}`,
      name: { ja: `${currentEndCalendarYear + 1}年`, en: `${currentEndCalendarYear + 1}` },
    };
    yearList.push(yearOptionNext);
  }

  return yearList;
};
// 半期を選択した際の上期、下期の配列
export const optionsFiscalHalf: PeriodOption[] = [
  { key: `H1`, value: "1", name: { ja: "上半期（H1）", en: "First Half of the Fiscal Year（H1）" } },
  { key: `H2`, value: "2", name: { ja: "下半期（H2）", en: "Second Half of the Fiscal Year（H2）" } },
];
// 四半期を選択した際の選択肢
export const optionsFiscalQuarter: PeriodOption[] = [
  { key: `Q1`, value: "1", name: { ja: "第一四半期（Q1）", en: "First Quarter(Q1)" } },
  { key: `Q2`, value: "2", name: { ja: "第二四半期（Q2）", en: "Second Quarter(Q2)" } },
  { key: `Q3`, value: "3", name: { ja: "第三四半期（Q3）", en: "Third Quarter(Q3)" } },
  { key: `Q4`, value: "4", name: { ja: "第四四半期（Q4）", en: "Fourth Quarter(Q4)" } },
];
// 月度・月次を選択した際の選択肢
export const optionsFiscalMonth: PeriodOption[] = [
  { key: `month_01`, value: "01", name: { ja: `1月度`, en: `Jan.` } },
  { key: `month_02`, value: "02", name: { ja: `2月度`, en: `Feb.` } },
  { key: `month_03`, value: "03", name: { ja: `3月度`, en: `Mar.` } },
  { key: `month_04`, value: "04", name: { ja: `4月度`, en: `Apr.` } },
  { key: `month_05`, value: "05", name: { ja: `5月度`, en: `May` } },
  { key: `month_06`, value: "06", name: { ja: `6月度`, en: `Jun.` } },
  { key: `month_07`, value: "07", name: { ja: `7月度`, en: `Jul.` } },
  { key: `month_08`, value: "08", name: { ja: `8月度`, en: `Aug.` } },
  { key: `month_09`, value: "09", name: { ja: `9月度`, en: `Sep.` } },
  { key: `month_10`, value: "10", name: { ja: `10月度`, en: `Oct.` } },
  { key: `month_11`, value: "11", name: { ja: `11月度`, en: `Nov.` } },
  { key: `month_12`, value: "12", name: { ja: `12月度`, en: `Dec.` } },
];

// 売上目標
// 期間区分 「年度 or 上半期 ~ 月度 or 下半期 ~ 月度」
export const optionsPeriodSalesTarget = ["fiscalYear", "firstHalf", "secondHalf"];

export const mappingPeriodSalesTarget: { [key: string]: { [key: string]: string } } = {
  fiscalYear: { ja: "年度", en: "Fiscal Year" },
  firstHalf: { ja: "上半期", en: "First Half" },
  secondHalf: { ja: "下半期", en: "Second Year" },
};

// メンバーレベル目標設定時の「上期詳細」「下期詳細」のoptions
export const mappingHalfDetails: { [key: string]: { [key: string]: string } } = {
  first_half_details: { ja: "上期詳細", en: "First Half Details" },
  second_half_details: { ja: "下期詳細", en: "Second Half Details" },
};

// -------------------------- ✅SDB関連✅ --------------------------
