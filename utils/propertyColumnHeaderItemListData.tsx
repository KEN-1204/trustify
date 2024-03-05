import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

const propertyColumnHeaderItemListArray: Obj[] = [
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
    columnName: "department_name",
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
  // 物件・案件エリア
  // {
  //   columnName: "property_department",
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
  {
    columnName: "assigned_unit_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // {
  //   columnName: "property_business_office",
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
    columnName: "property_member_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "current_status",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_summary",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "pending_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "rejected_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // {
  //   columnName: "product_name",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  // {
  //   columnName: "expected_product_id",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  {
    columnName: "expected_product",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expected_order_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expected_sales_price",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "term_division",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // {
  //   columnName: "sold_product_name",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  {
    columnName: "sold_product",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "unit_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_contribution_category",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_price",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "discounted_price",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "discount_rate",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_class",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 🌠追加 案件四半期+半期(案件、展開、売上)+会計年度(案件、展開、売上)
  {
    columnName: "property_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_year_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_half_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_fiscal_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expansion_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expansion_year_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expansion_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expansion_half_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expansion_fiscal_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_year_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_half_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sales_fiscal_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  // 🌠追加 ここまで
  {
    columnName: "subscription_start_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "subscription_canceled_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "leasing_company",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "lease_division",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "lease_expiration_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "step_in_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "repeat_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "order_certainty_start_of_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "review_order_certainty",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "competitor_appearance_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "competitor",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "competitor_product",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "reason_class",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "reason_detail",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "customer_budget",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "decision_maker_negotiation",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "subscription_interval",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "competition_state",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 案件エリアここまで
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
    columnName: "business_content",
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
    // columnName: "industry_type",
    columnName: "industry_type_id",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_large",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_medium",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  //   {
  //     columnName: "product_category_small",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  {
    columnName: "corporate_number",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 案件エリア
  {
    columnName: "property_created_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "property_updated_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 案件エリアここまで
];

export const propertyColumnHeaderItemListData: ColumnHeaderItemList[] = propertyColumnHeaderItemListArray.map(
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
