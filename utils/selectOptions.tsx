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
export const optionsPositionsClass = [1, 2, 3, 4, 5, 6];

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

export const optionsOccupation = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

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

// 業種
export const optionsIndustryType = [
  //   "",
  "機械要素・部品",
  "自動車・輸送機器",
  "電子部品・半導体",
  "製造・加工受託",
  "産業用機械",
  "産業用電気機器",
  "IT・情報通信",
  "ソフトウェア",
  "医薬品・バイオ",
  "樹脂・プラスチック",
  "ゴム製品",
  "鉄/非鉄金属",
  "民生用電気機器",
  "航空・宇宙",
  "CAD/CAM",
  "建材・資材・什器",
  "小売",
  "飲食料品",
  "飲食店・宿泊業",
  "公益・特殊・独立行政法人",
  "水産・農林業",
  "繊維",
  "ガラス・土石製品",
  "造船・重機",
  "環境",
  "印刷業",
  "運輸業",
  "金融・証券・保険業",
  "警察・消防・自衛隊",
  "鉱業",
  "紙・バルブ",
  "木材",
  "ロボット",
  "試験・分析・測定",
  "エネルギー",
  "電気・ガス・水道業",
  "医療・福祉",
  "サービス業",
  "その他",
  "化学",
  "セラミックス",
  "食品機械",
  "光学機器",
  "医療機器",
  "その他製造",
  "倉庫・運輸関連業",
  "教育・研究機関",
  "石油・石炭製品",
  "商社・卸売",
  "官公庁",
  "個人",
  "不明",
];

export const optionsProductL = [
  "電子部品・モジュール",
  "機械部品",
  "製造・加工機械",
  "科学・理化学機器",
  "素材・材料",
  "測定・分析",
  "画像処理",
  "制御・電機機器",
  "工具・消耗品・備品",
  "設計・生産支援",
  "IT・ネットワーク",
  "オフィス",
  "業務支援サービス",
  "セミナー・スキルアップ",
  "その他",
];

// 決算月
export const optionsMonth = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

// 規模（ランク）
export const optionsNumberOfEmployeesClass = ["A", "B", "C", "D", "E", "F", "G"];

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
export const optionsActivityType = [
  "Phone Call Made (Absent)",
  "Phone Call Made (Proactive)",
  "Phone Call Made (Reactive)",
  "Phone Call Made (Pre-Sales Follow-Up)",
  "Phone Call Made (Post-Sales Follow-Up)",
  "Phone Call Made (Appointment Scheduling)",
  "Phone Call Made (Other)",
  "Email Received",
  "Email Sent",
  "Other",
  "Handover",
];
export const getActivityType = (value: string, language: string = "ja") => {
  switch (value) {
    case "Phone Call Made (Absent)":
      return language === "ja" ? `TEL発信(不在)` : `Phone Call Made (Absent)`;
      break;
    case "Phone Call Made (Proactive)":
      return language === "ja" ? `TEL発信(能動)` : `Phone Call Made (Proactive)`;
      break;
    case "Phone Call Made (Reactive)":
      return language === "ja" ? `TEL発信(受動)` : `Phone Call Made (Reactive)`;
      break;
    case "Phone Call Made (Pre-Sales Follow-Up)":
      return language === "ja" ? `TEL発信(売前ﾌｫﾛｰ)` : `Phone Call Made (Pre-Sales Follow-Up)`;
      break;
    case "Phone Call Made (Post-Sales Follow-Up)":
      return language === "ja" ? `TEL発信(売後ﾌｫﾛｰ)` : `Phone Call Made (Post-Sales Follow-Up)`;
      break;
    case "Phone Call Made (Appointment Scheduling)":
      return language === "ja" ? `TEL発信(ｱﾎﾟ組み)` : `Phone Call Made (Appointment Scheduling)`;
      break;
    case "Phone Call Made (Other)":
      return language === "ja" ? `TEL発信(その他)` : `Phone Call Made (Other)`;
      break;
    case "Email Received":
      return language === "ja" ? `Email受信` : `Email Received`;
      break;
    case "Email Sent":
      return language === "ja" ? `Email送信` : `Email Sent`;
      break;
    case "Other":
      return language === "ja" ? `その他` : `Other`;
      break;
    case "Handover":
      return language === "ja" ? `引継ぎ` : `Handover`;
      break;

    default:
      return value;
      break;
  }
};

// 優先度
export const optionsPriority = ["A High", "B Medium", "Low"];
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
export const optionsWebTool = ["Zoom", "Teams", "Google Meet", "Webex", "bellFace", "Other"];
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
export const optionsPlannedPurpose = [
  "A New Company (No Previous Meetings)/Proactive",
  "B Overlap Company (Previous Meetings Held)/Proactive",
  "C Internal Referral/Proactive",
  "D Client Referral/Proactive",
  "E Salesperson's Email/Reactive",
  "F Direct Product Engagement Inquiry/Reactive",
  "G DM/Reactive",
  "H Email/Reactive",
  "I Website/Reactive",
  "J Webinar/Reactive",
  "K Trade Show/Reactive",
  "L Other(Pre-Sales Follow-Up)",
  "M Other(Delivery Explanation)",
  "N Other(Proactive Sales Support)",
  "O Other(Customer Request Support)",
  "P Others",
];
export const getPlannedPurpose = (value: string, language: string = "ja") => {
  switch (value) {
    case "A New Company (No Previous Meetings)/Proactive":
      return language === "ja" ? `新規会社(過去面談無し)/能動` : `New Company (No Previous Meetings)/Proactive`;
      break;
    case "B Overlap Company (Previous Meetings Held)/Proactive":
      return language === "ja" ? `被り会社(過去面談有り)/能動` : `Overlap Company (Previous Meetings Held)/Proactive`;
      break;
    case "C Internal Referral/Proactive":
      return language === "ja" ? `社内ID/能動` : `Internal Referral/Proactive`;
      break;
    case "D Client Referral/Proactive":
      return language === "ja" ? `社外･客先ID/能動` : `Client Referral/Proactive`;
      break;
    case "E Salesperson's Email/Reactive":
      return language === "ja" ? `営業メール/受動` : `Salesperson's Email/Reactive`;
      break;
    case "F Direct Product Engagement Inquiry/Reactive":
      return language === "ja" ? `見･聞引合/受動` : `Direct Product Engagement Inquiry/Reactive`;
      break;
    case "G DM/Reactive":
      return language === "ja" ? `DM/受動` : `DM/Reactive`;
      break;
    case "H Email/Reactive":
      return language === "ja" ? `メール/受動` : `Email/Reactive`;
      break;
    case "I Website/Reactive":
      return language === "ja" ? `ホームページ/受動` : `Website/Reactive`;
      break;
    case "J Webinar/Reactive":
      return language === "ja" ? `ウェビナー/受動` : `Webinar/Reactive`;
      break;
    case "K Trade Show/Reactive":
      return language === "ja" ? `展示会/受動` : `Trade Show/Reactive`;
      break;
    case "L Other(Pre-Sales Follow-Up)":
      return language === "ja" ? `他(売前ﾌｫﾛｰ)` : `Other(Pre-Sales Follow-Up)`;
      break;
    case "M Other(Delivery Explanation)":
      return language === "ja" ? `他(納品説明)` : `Other(Delivery Explanation)`;
      break;
    case "N Other(Pre-Sales Follow-Up)":
      return language === "ja" ? `他(営業能動サポート)` : `Other(Proactive Sales Support)`;
      break;
    case "O Other(Pre-Sales Follow-Up)":
      return language === "ja" ? `他(客先要望サポート)` : `Other(Customer Request Support)`;
      break;
    case "P Others":
      return language === "ja" ? `その他` : `Others`;
      break;

    default:
      return value;
      break;
  }
};

// 面談結果
export const optionsResultCategory = [
  "A Deal Development F(Potential for Implementation This Fiscal Period)",
  "B Deal Development N(Potential for Implementation Next Fiscal Period)",
  "C Deal Continuation",
  "D Premature Timing",
  "E Low Usage Frequency (Needs Present but Insufficient for Implementation)",
  "F Inconclusive Results (Further Meetings or Verification Needed)",
  "G Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)",
  "H No Application or Need Identified",
  "I Other (Post-Implementation Setup, Support)",
  "J Other",
];
export const getResultCategory = (value: string, language: string = "ja") => {
  switch (value) {
    case "A Deal Development F(Potential for Implementation This Fiscal Period)":
      return language === "ja"
        ? `展開F(当期中に導入の可能性あり)`
        : `Deal Development F(Potential for Implementation This Fiscal Period)`;
      break;
    case "B Deal Development N(Potential for Implementation Next Fiscal Period)":
      return language === "ja"
        ? `展開N(来期導入の可能性あり)`
        : `Deal Development N(Potential for Implementation Next Fiscal Period)`;
      break;
    case "C Deal Continuation":
      return language === "ja" ? `展開継続` : `Project Continuation`;
      break;
    case "D Premature Timing":
      return language === "ja" ? `時期尚早` : `Premature Timing`;
      break;
    case "E Low Usage Frequency (Needs Present but Insufficient for Implementation)":
      return language === "ja"
        ? `頻度低い(ニーズあるが頻度低く導入には及ばず)`
        : `Low Usage Frequency (Needs Present but Insufficient for Implementation)`;
      break;
    case "F Inconclusive Results (Further Meetings or Verification Needed)":
      return language === "ja"
        ? `結果出ず(再度面談や検証が必要)`
        : `Inconclusive Results (Further Meetings or Verification Needed)`;
      break;
    case "G Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)":
      return language === "ja"
        ? `担当者の推進力無し(ニーズあるが、上長・キーマンにあたる必要有り)`
        : `Lack of Drive from Representative (Needs Identified but Requires Engagement with Superiors or Key Persons)`;
      break;
    case "H No Application or Need Identified":
      return language === "ja" ? `用途・ニーズなし` : `No Application or Need Identified`;
      break;
    case "I Other (Post-Implementation Setup, Support)":
      return language === "ja" ? `他(立ち上げ、サポート)` : `Other (Post-Implementation Setup, Support)`;
      break;
    case "J Other":
      return language === "ja" ? `その他` : `Other`;
      break;

    default:
      return value;
      break;
  }
};

// 面談時_決裁者商談有無
// export const optionsResultNegotiateDecisionMaker = ["決裁者と未商談", "決裁者と商談済み"];
export const optionsResultNegotiateDecisionMaker = [
  "A No Discussion with Decision-Maker",
  "B Discussion Held with Decision-Maker",
];
export const getResultNegotiateDecisionMaker = (value: string, language: string = "ja") => {
  switch (value) {
    case "A No Discussion with Decision-Maker":
      return language === "ja" ? `決裁者と未商談` : `No Discussion with Decision-Maker`;
      break;
    case "B Discussion Held with Decision-Maker":
      return language === "ja" ? `決裁者と商談済み` : `Discussion Held with Decision-Maker`;
      break;

    default:
      return value;
      break;
  }
};

// 面談時同席依頼
export const optionsMeetingParticipationRequest = [
  "A No Request for Accompaniment",
  "B Request for Accompaniment Made, Accompaniment Approved",
  "C Request for Accompaniment Made, Accompaniment Denied",
];
export const getMeetingParticipationRequest = (value: string, language: string = "ja") => {
  switch (value) {
    case "A No Request for Accompaniment":
      return language === "ja" ? `同席依頼無し` : `No Request for Accompaniment`;
      break;
    case "B Request for Accompaniment Made, Accompaniment Approved":
      return language === "ja" ? `同席依頼済み 同席OK` : `Request for Accompaniment Made, Accompaniment Approved`;
      break;
    case "C Request for Accompaniment Made, Accompaniment Denied":
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
export const optionsCurrentStatus = ["A Lead", "B Deal Development", "C Application", "D Order Received"];
export const getCurrentStatus = (value: string, language: string = "ja") => {
  switch (value) {
    case "A Lead":
      return language === "ja" ? `リード` : `Lead`;
      break;
    case "B Deal Development":
      return language === "ja" ? `展開 (案件化)` : `Deal Development`;
      break;
    case "C Application":
      return language === "ja" ? `申請 (予算申請案件)` : `Application`;
      break;
    case "D Order Received":
      return language === "ja" ? `受注` : `Order Received`;
      break;

    default:
      return value;
      break;
  }
};

// 案件発生動機
export const optionsReasonClass = [
  "A New Company (No Previous Meetings)/Proactive",
  "B Overlap Company (Previous Meetings Held)/Proactive",
  "C Internal Referral/Proactive",
  "D Client Referral/Proactive",
  "E Salesperson's Email/Reactive",
  "F Direct Product Engagement Inquiry/Reactive",
  "G DM/Reactive",
  "H Email/Reactive",
  "I Website/Reactive",
  "J Webinar/Reactive",
  "K Trade Show/Reactive",
  "L Others",
];
export const getReasonClass = (value: string, language: string = "ja") => {
  switch (value) {
    case "A New Company (No Previous Meetings)/Proactive":
      return language === "ja" ? `新規会社(過去面談無し)/能動` : `New Company (No Previous Meetings)/Proactive`;
      break;
    case "B Overlap Company (Previous Meetings Held)/Proactive":
      return language === "ja" ? `被り会社(過去面談有り)/能動` : `Overlap Company (Previous Meetings Held)/Proactive`;
      break;
    case "C Internal Referral/Proactive":
      return language === "ja" ? `社内ID/能動` : `Internal Referral/Proactive`;
      break;
    case "D Client Referral/Proactive":
      return language === "ja" ? `社外･客先ID/能動` : `Client Referral/Proactive`;
      break;
    case "E Salesperson's Email/Reactive":
      return language === "ja" ? `営業メール/受動` : `Salesperson's Email/Reactive`;
      break;
    case "F Direct Product Engagement Inquiry/Reactive":
      return language === "ja" ? `見･聞引合/受動` : `Direct Product Engagement Inquiry/Reactive`;
      break;
    case "G DM/Reactive":
      return language === "ja" ? `DM/受動` : `DM/Reactive`;
      break;
    case "H Email/Reactive":
      return language === "ja" ? `メール/受動` : `Email/Reactive`;
      break;
    case "I Website/Reactive":
      return language === "ja" ? `ホームページ/受動` : `Website/Reactive`;
      break;
    case "J Webinar/Reactive":
      return language === "ja" ? `ウェビナー/受動` : `Webinar/Reactive`;
      break;
    case "K Trade Show/Reactive":
      return language === "ja" ? `展示会/受動` : `Trade Show/Reactive`;
      break;
    case "L Others":
      return language === "ja" ? `その他` : `Others`;
      break;

    default:
      return value;
      break;
  }
};

// 売上貢献区分
export const optionsSalesContributionCategory = ["A Direct Sales", "B Handover Sales", "C Repeat Sales"];
export const getSalesContributionCategory = (value: string, language: string = "ja") => {
  switch (value) {
    case "A Direct Sales":
      return language === "ja" ? `自己売上(自身で発生、自身で売上)` : `Direct Sales`;
      break;
    case "B Handover Sales":
      return language === "ja" ? `引継ぎ売上(他担当が発生、引継ぎで売上)` : `Handover Sales`;
      break;
    case "C Repeat Sales":
      return language === "ja" ? `リピート売上` : `Repeat Sales`;
      break;

    default:
      return value;
      break;
  }
};

// 導入分類
export const optionsSalesClass = ["A New Installation", "B Expansion", "C Upgrade"];
export const getSalesClass = (value: string, language: string = "ja") => {
  switch (value) {
    case "A New Installation":
      return language === "ja" ? `新規` : `New Installation`;
      break;
    case "B Expansion":
      return language === "ja" ? `増設` : `Expansion`;
      break;
    case "C Upgrade":
      return language === "ja" ? `更新` : `Upgrade`;
      break;

    default:
      return value;
      break;
  }
};

// 今期・来期
export const optionsTermDivision = ["A This Fiscal Year", "B Next Fiscal Year"];
export const getTermDivision = (value: string, language: string = "ja") => {
  switch (value) {
    case "A This Fiscal Year":
      return language === "ja" ? `今期 (今期に獲得予定)` : `This Fiscal Year`;
      break;
    case "B Next Fiscal Year":
      return language === "ja" ? `来期 (来期に獲得予定)` : `Next Fiscal Year`;
      break;

    default:
      return value;
      break;
  }
};

// サブスク分類
export const optionsSubscriptionInterval = ["A Monthly", "B Annual"];
export const getSubscriptionInterval = (value: string, language: string = "ja") => {
  switch (value) {
    case "A Monthly":
      return language === "ja" ? `月額` : `Monthly Fee`;
      break;
    case "B Annual":
      return language === "ja" ? `年額` : `Annual Fee`;
      break;

    default:
      return value;
      break;
  }
};

// リース分類
export const optionsLeaseDivision = ["A Finance Lease", "B Operating Lease"];
export const getLeaseDivision = (value: string, language: string = "ja") => {
  switch (value) {
    case "A Finance Lease":
      return language === "ja" ? `ファイナンスリース` : `Finance Lease`;
      break;
    case "B Operating Lease":
      return language === "ja" ? `オペレーティングリース` : `Operating Lease`;
      break;

    default:
      return value;
      break;
  }
};

// 月初確度
export const optionsOrderCertaintyStartOfMonth = [1, 2, 3, 4];

export const getOrderCertaintyStartOfMonth = (classNum: number, language: string = "ja") => {
  switch (classNum) {
    case 1:
      return language === "ja" ? `A (受注済み)` : `A (受注済み)`;
      break;
    case 2:
      return language === "ja" ? `○ (80%以上の確率で受注)` : `○ (80%以上の確率で受注)`;
      break;
    case 3:
      return language === "ja" ? `△ (50%以上の確率で受注)` : `△ (50%以上の確率で受注)`;
      break;
    case 4:
      return language === "ja" ? `▲ (30%以上の確率で受注)` : `▲ (30%以上の確率で受注)`;
      break;

    default:
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
export const optionsCompetitionState = [
  "A No Competitors",
  "B With Competitors ○Superior",
  "C With Competitors △Equal",
  "D With Competitors ▲Inferior",
];
export const getCompetitionState = (value: string, language: string = "ja") => {
  switch (value) {
    case "A No Competitors":
      return language === "ja" ? `競合無し` : `No Competitors`;
      break;
    case "B With Competitors ○Superior":
      return language === "ja" ? `競合有り ○優勢` : `With Competitors ○Superior`;
      break;
    case "C With Competitors △Equal":
      return language === "ja" ? `競合有り △` : `With Competitors △Equal`;
      break;
    case "D With Competitors ▲Inferior":
      return language === "ja" ? `競合有り ▲劣勢` : `With Competitors ▲Inferior`;
      break;

    default:
      return value;
      break;
  }
};

// 決裁者商談有無
export const optionsDecisionMakerNegotiation = [
  "A Unable to Meet with the Decision-Maker",
  "B Met with the Decision-Maker but Unable to Discuss Business",
  "C Discussed Business with the Decision-Maker",
];
export const getDecisionMakerNegotiation = (value: string, language: string = "ja") => {
  switch (value) {
    case "A Unable to Meet with the Decision-Maker":
      return language === "ja" ? `決裁者と会えず` : `Unable to Meet with the Decision-Maker`;
      break;
    case "B Met with the Decision-Maker but Unable to Discuss Business":
      return language === "ja"
        ? `決裁者と会うも、商談できず`
        : `Met with the Decision-Maker but Unable to Discuss Business`;
      break;
    case "C Discussed Business with the Decision-Maker":
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
export const optionsSendingMethod = ["Without Cover Letter", "Fax", "Mail", "Email"];
export const getSendingMethod = (value: string, language: string = "ja") => {
  switch (value) {
    case "Without Cover Letter":
      return (language = "ja" ? `送付状なし` : `Without Cover Letter`);
      break;
    case "Fax":
      return (language = "ja" ? `Fax` : `Fax`);
      break;
    case "Mail":
      return (language = "ja" ? `郵送` : `Mail`);
      break;
    case "Email":
      return (language = "ja" ? `メール` : `Email`);
      break;

    default:
      return value;
      break;
  }
};

// 消費税区分
export const optionsSalesTaxClass = ["A With Tax Notation", "B Without Tax Notation"];
export const getSalesTaxClass = (value: string, language: string = "ja") => {
  switch (value) {
    case "A With Tax Notation":
      return (language = "ja" ? `消費税記載なし` : `With Tax Notation`);
      break;
    case "B Without Tax Notation":
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
