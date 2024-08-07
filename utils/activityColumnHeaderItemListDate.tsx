import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

const activityColumnHeaderItemListArray: Obj[] = [
  {
    columnName: "company_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "address",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "department_name",
    columnName: "company_department_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "contact_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 活動日付
  {
    columnName: "activity_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 活動タイプ
  {
    columnName: "activity_type",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 概要
  {
    columnName: "summary",
    columnWidth: "600px",
    isFrozen: false,
    isOverflow: false,
  },
  // 自社事業部
  // {
  //   columnName: "department",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  {
    columnName: "assigned_department_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 自社課
  {
    columnName: "assigned_section_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: true,
  },
  // 自社係
  {
    columnName: "assigned_unit_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 自社事業所
  // {
  //   columnName: "business_office",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  {
    columnName: "assigned_office_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "member_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "scheduled_follow_up_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: true,
  },
  {
    columnName: "follow_up_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "priority",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 年月度〜年度
  {
    columnName: "activity_year_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "activity_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "activity_half_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "activity_fiscal_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "claim_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 活動エリアここまで
  {
    columnName: "position_class",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "position_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "direct_line",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "main_phone_number",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "direct_fax",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "main_fax",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "email",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "extension",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "company_cell_phone",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "personal_cell_phone",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "occupation",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "approval_amount",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "budget_request_month1",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "budget_request_month2",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  //
  {
    columnName: "fiscal_end_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "capital",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "established_in",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "supplier",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "clients",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "number_of_employees_class",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "number_of_employees",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_content",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "industry_type",
    columnName: "industry_type_id",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "product_category_large",
    columnName: "product_categories_large_array",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "product_category_medium",
    columnName: "product_categories_medium_array",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "product_category_small",
    columnName: "product_categories_small_array",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // {
  //   columnName: "product_category_small",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  {
    columnName: "website_url",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "company_email",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_sites",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "overseas_bases",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "group_company",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "corporate_number",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 活動エリア
  {
    columnName: "activity_created_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "activity_updated_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
];

export const activityColumnHeaderItemListData: ColumnHeaderItemList[] = activityColumnHeaderItemListArray.map(
  (obj, index) => {
    //   obj.columnId = index;
    //   obj.columnIndex = index + 2;
    const item: ColumnHeaderItemList = {
      columnId: index,
      columnName: obj.columnName,
      columnIndex: index + 2,
      columnWidth: obj.columnWidth,
      isOverflow: obj.isOverflow,
      isFrozen: obj.isFrozen,
    };
    return item;
  }
);
