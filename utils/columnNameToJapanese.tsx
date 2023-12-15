export const columnNameToJapanese = (columnName: string) => {
  switch (columnName) {
    case "id":
      return "ID";
      break;
    case "corporate_number":
      return "法人番号";
      break;
    case "name":
      return "会社名";
      break;
    case "department_name":
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
    case "industry_type":
      return "業種";
      break;
    case "product_category_large":
      return "製品分類(大分類)";
      break;
    case "product_category_medium":
      return "製品分類(中分類)";
      break;
    case "product_category_small":
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
      return "資本金";
      break;
    case "email":
      return "Email";
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
      return "取締役";
      break;
    case "board_member":
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
    case "created_by_company_id":
      return "自社専用データ";
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
