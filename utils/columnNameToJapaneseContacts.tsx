export const columnNameToJapaneseContacts = (columnName: string) => {
  switch (columnName) {
    case "id":
      return "ID";
      break;
    case "created_at":
      return "作成日時";
      break;
    case "updated_at":
      return "更新日時";
      break;
    case "name":
      return "名前";
      break;
    case "direct_line":
      return "直通電話";
      break;
    case "direct_fax":
      return "直通Fax";
      break;
    case "extension":
      return "内線";
      break;
    case "company_cell_phone":
      return "社用携帯";
      break;
    case "personal_cell_phone":
      return "私用携帯";
      break;
    case "email":
      return "Email";
      break;
    case "position":
      return "役職名";
      break;
    case "position_class":
      return "職位";
      break;
    case "occupation":
      return "担当職位";
      break;
    case "approval_amount":
      return "決裁金額";
      break;
    case "call_ban_flag":
      return "電話禁止";
      break;
    case "email_ban_flag":
      return "メール禁止";
      break;
    case "sending_materials_ban_flag":
      return "資料送付禁止";
      break;
    case "fax_dm_ban_flag":
      return "FAX・DM禁止";
      break;
    case "ban_reason":
      return "禁止理由";
      break;
    case "claim":
      return "クレーム";
      break;
    case "call_careful_flag":
      return "TEL要注意";
      break;
    case "call_careful_reason":
      return "TEL要注意理由";
      break;
    // Companiesテーブルのデータ

    default:
      break;
  }
};
// export const columnNameToJapanese = (columnName: string) => {
//   switch (columnName) {
//     case "id":
//       return "ID";
//       break;
//     case "rowIndex":
//       return "行数";
//       break;
//     case "name":
//       return "名前";
//       break;
//     case "dob":
//       return "誕生日";
//       break;
//     case "country":
//       return "国";
//       break;
//     case "gender":
//       return "性別";
//       break;
//     case "summary":
//       return "概要";
//       break;

//     default:
//       break;
//   }
// };
