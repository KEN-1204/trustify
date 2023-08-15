import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

const activityColumnHeaderItemListArray: Obj[] = [
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
    columnName: "department_name",
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
  // 活動エリア
  {
    columnName: "activity_date",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "department",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_office",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "member_name",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "activity_type",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "summary",
    columnWidth: "600px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "scheduled_follow_up_date",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "priority",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  // 活動エリアここまで
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
    columnName: "industry_type",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_large",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_medium",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_small",
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