import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344 : 【Typescript】オブジェクトのプロパティを後から追加する方法

const contactColumnHeaderItemListArray: Obj[] = [
  {
    columnName: "company_name",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "address",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "department_name",
    columnName: "company_department_name",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "contact_name",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "position_class",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "position_name",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "direct_line",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "main_phone_number",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "direct_fax",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "main_fax",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "email",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "extension",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "company_cell_phone",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "personal_cell_phone",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "occupation",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "approval_amount",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "budget_request_month1",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "budget_request_month2",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  //
  {
    columnName: "fiscal_end_month",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "capital",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "established_in",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "supplier",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "clients",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "number_of_employees_class",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_content",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_sites",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "overseas_bases",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "group_company",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "industry_type",
    columnName: "industry_type_id",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "product_category_large",
    columnName: "product_categories_large_array",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "product_category_medium",
    columnName: "product_categories_medium_array",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "product_category_small",
    columnName: "product_categories_small_array",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "corporate_number",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  // フラグ・クレーム・禁止理由関連
  {
    columnName: "call_careful_flag",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "call_careful_reason",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "email_ban_flag",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "sending_materials_ban_flag",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fax_dm_ban_flag",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "ban_reason",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "claim",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  // 作成日時と更新日時
  {
    columnName: "contact_created_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "contact_updated_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
];

export const contactColumnHeaderItemListData: ColumnHeaderItemList[] = contactColumnHeaderItemListArray.map(
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
