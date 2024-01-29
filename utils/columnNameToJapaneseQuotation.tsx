export const columnNameToJapaneseQuotation = (columnName: string) => {
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
    // 🔹cotnactsテーブル
    case "contact_email":
      return "Email";
      break;
    // 🔹見積テーブル
    // case "submission_class":
    //   return "提出区分";
    //   break;
    case "quotation_date":
      return "見積日";
      break;
    case "expiration_date":
      return "有効期限";
      break;
    case "quotation_title":
      return "見積タイトル";
      break;
    // case "deadline":
    //   return "納期";
    //   break;
    // case "delivery_place":
    //   return "納入場所";
    //   break;
    // case "payment_terms":
    //   return "取引方法";
    //   break;
    // case "quotation_division":
    //   return "見積区分";
    //   break;
    // case "sending_method":
    //   return "送付方法";
    //   break;
    // case "use_corporate_seal":
    //   return "角印印刷";
    //   break;
    case "quotation_notes":
      return "見積備考";
      break;
    // case "sales_tax_class":
    //   return "消費税区分";
    //   break;
    // case "sales_tax_rate":
    //   return "消費税率";
    //   break;
    case "total_price":
      return "価格合計";
      break;
    case "discount_amount":
      return "値引金額";
      break;
    case "discount_rate":
      return "値引率";
      break;
    // case "discount_title":
    //   return "値引タイトル";
    //   break;
    case "total_amount":
      return "合計金額";
      break;
    case "quotation_remarks":
      return "特記事項";
      break;
    // case "set_item_count":
    //   return "セット数";
    //   break;
    // case "set_unit_name":
    //   return "セット単位";
    //   break;
    // case "set_price":
    //   return "セット価格";
    //   break;
    // case "lease_period":
    //   return "リース期間";
    //   break;
    // case "lease_rate":
    //   return "リース料率";
    //   break;
    // case "lease_monthly_fee":
    //   return "月額リース料";
    //   break;
    // 🔹quotation_company_details結合テーブル
    case "quotation_no_custom":
      return "見積No（専用）";
      break;
    case "quotation_no_system":
      return "見積No";
      break;
    // case "quotation_department":
    //   return "担当事業部";
    //   break;
    // case "quotation_business_office":
    //   return "担当事業所";
    //   break;
    // 🔹事業部、係、事業所、自社担当、発生日
    case "assigned_department_name":
      return "事業部名(自社)";
      break;
    case "assigned_unit_name":
      return "係・チーム(自社)";
      break;
    case "assigned_office_name":
      return "所属事業所(自社)";
      break;
    case "quotation_member_name":
      return "作成者";
      break;
    // case "quotation_products_details":
    //   return "商品リスト";
    //   break;

    case "quotation_year_month":
      return "見積年月度";
      break;
    case "quotation_created_at":
      return "作成日時";
      break;
    case "quotation_updated_at":
      return "更新日時";
      break;

    default:
      return "";
      break;
  }
};
