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
    case "contact_name":
      return "担当者名";
      break;
    case "company_name":
      return "会社名";
      break;
    case "direct_line":
      return "直通TEL";
      break;
    case "direct_fax":
      return "直通Fax";
      break;
    case "extension":
      return "内線TEL";
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
    case "position_name":
      return "役職名";
      break;
    case "position_class":
      return "職位";
      break;
    case "occupation":
      return "担当職種";
      break;
    case "approval_amount":
      return "決裁金額(万円)";
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
    case "company_name":
      return "会社名";
      break;
    case "id":
      return "ID";
      break;
    case "corporate_number":
      return "法人番号";
      break;
    case "department_name":
    case "company_department_name":
      return "部署名";
      break;
    case "representative_name":
      return "代表者名";
      break;
    case "main_phone_number":
      return "代表TEL";
      break;
    case "main_fax":
      return "代表FAX";
      break;
    case "zipcode":
      return "郵便番号";
      break;
    case "address":
      return "住所";
      break;
    case "industry_large":
      return "業界(大分類)";
      break;
    case "industry_small":
      return "業界(小分類)";
      break;
    // case "industry_type":
    case "industry_type_id":
      return "業種";
      break;
    case "product_category_large":
    case "product_categories_large_array":
      return "製品分類(大分類)";
      break;
    case "product_category_medium":
    case "product_categories_medium_array":
      return "製品分類(中分類)";
      break;
    case "product_category_small":
    case "product_categories_small_array":
      return "製品分類(小分類)";
      break;
    case "number_of_employees_class":
      return "従業員数(規模)";
      break;
    case "number_of_employees":
      return "従業員数";
      break;
    case "fiscal_end_month":
      return "決算月";
      break;
    case "capital":
      return "資本金(万円)";
      break;
    case "company_email":
      return "会社Email";
      break;
    case "clients":
      return "取引先";
      break;
    case "supplier":
      return "仕入先";
      break;
    case "representative_position_name":
      return "代表者役職名";
      break;
    case "chairperson":
      return "会長";
      break;
    case "senior_vice_president":
      return "副社長";
      break;
    case "senior_managing_director":
      return "専務取締役";
      break;
    case "managing_director":
      return "常務取締役";
      break;
    case "director":
      return "役員";
      break;
    case "auditor":
      return "監査役";
      break;
    case "manager":
      return "部長";
      break;
    case "member":
      return "担当者";
      break;
    case "facility":
      return "設備";
      break;
    case "business_sites":
      return "事業拠点";
      break;
    case "business_content":
      return "事業概要";
      break;
    case "website_url":
      return "ホームページ";
      break;
    case "overseas_bases":
      return "海外拠点";
      break;
    case "group_company":
      return "グループ会社";
      break;
    case "number_of_employees":
      return "従業員数";
      break;
    case "established_in":
      return "設立日";
      break;
    case "budget_request_month1":
      return "予算申請月1";
      break;
    case "budget_request_month2":
      return "予算申請月2";
      break;
    case "contact_created_at":
      return "作成日時";
      break;
    case "contact_updated_at":
      return "更新日時";
      break;
    default:
      return "";
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
