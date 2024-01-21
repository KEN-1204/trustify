export const optionsPositionsClassForCustomer = [
  "1 代表者",
  "2 取締役/役員",
  "3 部長",
  "4 課長",
  "5 チームメンバー",
  "6 所長・支店長・工場長",
  "7 フリーランス・個人事業主",
];

// export const optionsPositionsClassForCustomer = [1, 2, 3, 4, 5, 6, 7];

export const getPositionClassNameForCustomer = (classNum: string, language: string = "ja") => {
  switch (classNum) {
    case "1 代表者":
      return language === "ja" ? `代表者` : `President`;
      break;
    case "2 取締役/役員":
      return language === "ja" ? `取締役/役員` : `Director/Executive`;
      break;
    case "3 部長":
      return language === "ja" ? `部長` : `Manager`;
      break;
    case "4 課長":
      return language === "ja" ? `課長` : `Section Manager`;
      break;
    case "5 チームメンバー":
      return language === "ja" ? `チームメンバー` : `Team Member`;
      break;
    case "6 所長・支店長・工場長":
      return language === "ja" ? `所長・支店長・工場長` : `Branch Manager`;
      break;
    case "7 フリーランス・個人事業主":
      return language === "ja" ? `フリーランス・個人事業主` : `Freelance`;
      break;

    default:
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
      return language === "ja" ? `3 部長` : `3 Manager`;
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
      return language === "ja" ? "19 情報システム" : `19 Information Systems`;
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

// 活動タイプ
export const optionsActivityType = [
  "TEL発信(不在)",
  "TEL発信(能動)",
  "TEL発信(受動)",
  "TEL発信(売前ﾌｫﾛｰ)",
  "TEL発信(売後ﾌｫﾛｰ)",
  "TEL発信(ｱﾎﾟ組み)",
  "TEL発信(その他)",
  "Email受信",
  "Email送信",
  "その他",
  "引継ぎ",
];

// 優先度
export const optionsPriority = ["高", "中", "低"];

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

// 面談関連

// 面談タイプ
export const optionsMeetingType = ["訪問", "WEB"];

// WEBツール
export const optionsWebTool = ["Zoom", "Teams", "Google Meet", "Webex", "Skype", "bellFace", "その他"];

// 面談目的
export const optionsPlannedPurpose = [
  "新規会社(過去面談無し)/能動",
  "被り会社(過去面談有り)/能動",
  "社内ID/能動",
  "社外･客先ID/能動",
  "営業メール/受動",
  "見･聞引合/受動",
  "DM/受動",
  "メール/受動",
  "ホームページ/受動",
  "ウェビナー/受動",
  "展示会/受動",
  "他(売前ﾌｫﾛｰ)",
  "他(納品説明)",
  "他(客先要望サポート)",
  "その他",
];

// 面談結果
export const optionsResultCategory = [
  "展開F(当期中に導入の可能性あり)",
  "展開N(来期導入の可能性あり)",
  "展開継続",
  "時期尚早",
  "頻度低い(ニーズあるが頻度低く導入には及ばず)",
  "結果出ず(再度面談や検証が必要)",
  "担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)",
  "用途・ニーズなし",
  "他(立ち上げ、サポート)",
  "その他",
];

// 面談時_決裁者商談有無
export const optionsResultNegotiateDecisionMaker = ["決裁者と未商談", "決裁者と商談済み"];

// 面談時同席依頼
export const optionsMeetingParticipationRequest = ["同席依頼無し", "同席依頼済み 同席OK", "同席依頼済み 同席NG"];

// 現ステータス
export const optionsCurrentStatus = ["リード", "展開", "申請", "受注"];

export const getCurrentStatus = (title: string) => {
  switch (title) {
    case "リード":
      return "リード";
      break;
    case "展開":
      return "展開(案件発生)";
      break;
    case "申請":
      return "申請(予算申請案件)";
      break;
    case "受注":
      return "受注";
      break;
    default:
      return "";
      break;
  }
};

// 案件発生動機
export const optionsReasonClass = [
  "新規会社(過去面談無し)/能動",
  "被り会社(過去面談有り)/能動",
  "社内ID/能動",
  "社外･客先ID/能動",
  "営業メール/受動",
  "見･聞引合/受動",
  "DM/受動",
  "メール/受動",
  "ホームページ/受動",
  "ウェビナー/受動",
  "展示会/受動",
  "その他",
];

// 売上貢献区分
export const optionsSalesContributionCategory = [
  "自己売上(自身で発生、自身で売上)",
  "引継ぎ売上(他担当が発生、引継ぎで売上)",
  "リピート売上",
];

// 導入分類
export const optionsSalesClass = ["新規", "増設", "更新"];

// 今期・来期
export const optionsTermDivision = ["今期", "来期"];

// サブスク分類
export const optionsSubscriptionInterval = ["月額", "年額"];

// リース分類
export const optionsLeaseDivision = ["ファイナンスリース", "オペレーティングリース"];

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
export const optionsCompetitionState = ["競合無し", "競合有り ○優勢", "競合有り △", "競合有り ▲劣勢"];

// 決裁者商談有無
export const optionsDecisionMakerNegotiation = ["決裁者と会えず", "決裁者と会うも、商談できず", "決裁者と商談済み"];

// 🌟見積

// 提出区分
export const optionsSubmissionClass = ["提出用", "社内用"];

// 納期
export const optionsDeadline = ["当日出荷", "１ヶ月以内", "お打ち合わせにより決定"];

// 納入場所
export const optionsDeliveryPlace = ["貴社指定場所", "お打ち合わせにより決定"];

// 取引方法
export const optionsPaymentTerms = ["従来通り", "月末締め翌月末現金お振込み", "お打ち合わせにより決定"];

// 見積区分
export const optionsQuotationDivision = ["標準見積", "セット見積", "リース見積"];

// 送付方法
// export const optionsSendingMethod = ["送付状なし", "Fax", "郵送"];
export const optionsSendingMethod = ["送付状なし"];

// 消費税区分
export const optionsSalesTaxClass = ["消費税記載なし", "消費税記載あり"];

// 消費税区分
export const optionsSalesTaxRate = ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
// export const optionsSalesTaxRate = ["10", "11", "12", "13", "14", "15", "16", "17", "18"];
