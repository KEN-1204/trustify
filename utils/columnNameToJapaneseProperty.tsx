export const columnNameToJapaneseProperty = (columnName: string) => {
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
    // 案件テーブル
    case "current_status":
      return "現ステータス";
      break;
    case "property_name":
      return "案件名";
      break;
    case "property_summary":
      return "案件概要";
      break;
    case "pending_flag":
      return "ペンディング";
      break;
    case "rejected_flag":
      return "案件没";
      break;
    // case "product_name":
    //   return "商品名";
    //   break;
    case "expected_product":
      return "商品名";
      break;
    case "product_sales":
      return "予定台数";
      break;
    case "expected_order_date":
      return "獲得予定時期";
      break;
    case "expected_sales_price":
      return "予定売上価格";
      break;
    case "term_division":
      return "今・来期区分";
      break;
    // case "sold_product_name":
    //   return "売上商品";
    //   break;
    case "sold_product":
      return "売上商品";
      break;
    case "unit_sales":
      return "売上台数";
      break;
    case "sales_contribution_category":
      return "売上貢献区分";
      break;
    case "sales_price":
      return "売上価格";
      break;
    case "discounted_price":
      return "値引価格";
      break;
    case "discount_rate":
      return "値引率";
      break;
    case "sales_class":
      return "導入分類";
      break;
    case "expansion_date":
      return "展開日付";
      break;
    case "sales_date":
      return "売上日付";
      break;
    case "property_quarter":
      return "案件四半期";
      break;
    case "expansion_quarter":
      return "展開四半期";
      break;
    case "sales_quarter":
      return "売上四半期";
      break;
    case "property_half_year":
      return "案件半期";
      break;
    case "expansion_half_year":
      return "展開半期";
      break;
    case "sales_half_year":
      return "売上半期";
      break;
    case "property_fiscal_year":
      return "案件年度";
      break;
    case "expansion_fiscal_year":
      return "展開年度";
      break;
    case "sales_fiscal_year":
      return "売上年度";
      break;
    case "subscription_start_date":
      return "サブスク開始日";
      break;
    case "subscription_canceled_at":
      return "サブスク解約日";
      break;
    case "leasing_company":
      return "リース会社";
      break;
    case "lease_division":
      return "リース分類";
      break;
    case "lease_expiration_date":
      return "リース完了予定日";
      break;
    case "step_in_flag":
      return "案件介入(責任者)";
      break;
    case "repeat_flag":
      return "リピート案件";
      break;
    case "order_certainty_start_of_month":
      return "月初確度";
      break;
    case "review_order_certainty":
      return "中間見直確度";
      break;
    case "competitor_appearance_date":
      return "競合発生日";
      break;
    case "competitor":
      return "競合会社";
      break;
    case "competitor_product":
      return "競合商品";
      break;
    case "reason_class":
      return "案件発生動機";
      break;
    case "reason_detail":
      return "動機詳細";
      break;
    case "customer_budget":
      return "客先予算";
      break;
    case "decision_maker_negotiation":
      return "決裁者商談有無";
      break;
    case "expansion_year_month":
      return "展開年月度";
      break;
    case "sales_year_month":
      return "売上年月度";
      break;
    case "subscription_interval":
      return "サブスク分類";
      break;
    case "competition_state":
      return "競合状況";
      break;
    case "sales_year_month":
      return "売上年月度";
      break;
    // case "property_department":
    //   return "担当事業部";
    //   break;
    // case "property_business_office":
    //   return "担当事業所";
    //   break;
    case "assigned_department_name":
      return "事業部名(自社)";
      break;
    case "assigned_unit_name":
      return "係・チーム(自社)";
      break;
    case "assigned_office_name":
      return "所属事業所(自社)";
      break;
    case "property_member_name":
      return "自社担当";
      break;
    case "property_date":
      return "案件発生日";
      break;

    case "property_created_at":
      return "作成日時";
      break;
    case "property_updated_at":
      return "更新日時";
      break;
    case "property_year_month":
      return "案件年月度";
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
