import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

const quotationColumnHeaderItemListArray: Obj[] = [
  {
    columnName: "company_name",
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
  // 見積エリア
  {
    columnName: "quotation_no_system",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_member_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_title",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "expiration_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "total_price",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "total_amount",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "discount_amount",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_remarks",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_no_custom",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 見積エリアここまで
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
  // 事業部・係・事業所・担当者エリア
  // {
  //   columnName: "quotation_department",
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
  {
    columnName: "assigned_unit_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // {
  //   columnName: "quotation_business_office",
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
  // 事業部・係・事業所・担当者エリアここまで

  {
    columnName: "contact_email",
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
  //   {
  //     columnName: "email",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "extension",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "company_cell_phone",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "personal_cell_phone",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },

  //   {
  //     columnName: "occupation",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "approval_amount",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "budget_request_month1",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "budget_request_month2",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "fiscal_end_month",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "capital",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "established_in",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "supplier",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "clients",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "number_of_employees_class",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "business_content",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "business_sites",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "overseas_bases",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "group_company",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "industry_type",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "product_category_large",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "product_category_medium",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "product_category_small",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  //   {
  //     columnName: "corporate_number",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  // 見積エリア
  {
    columnName: "quotation_year_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_created_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "quotation_updated_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 見積エリアここまで
];

export const quotationColumnHeaderItemListData: ColumnHeaderItemList[] = quotationColumnHeaderItemListArray.map(
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
