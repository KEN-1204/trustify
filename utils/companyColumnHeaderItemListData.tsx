import { ColumnHeaderItemList } from "@/types";

// Obj型
interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344 : 【Typescript】オブジェクトのプロパティを後から追加する方法

const companyColumnHeaderItemListArray: Obj[] = [
  // {
  //   columnName: "id",
  //   columnWidth: "50px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  // {
  //   columnName: "corporate_number",
  //   columnWidth: "200px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  {
    columnName: "name",
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
    columnName: "representative_name",
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
    columnName: "main_fax",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "zipcode",
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
    columnName: "number_of_employees_class",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
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
    columnName: "business_content",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "created_by_company_id",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: true,
  },
  {
    columnName: "email",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "website_url",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "industry_large",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "industry_small",
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
    columnName: "clients",
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
    columnName: "chairperson",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "senior_vice_president",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "senior_managing_director",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "managing_director",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "director",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "board_member",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "auditor",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "manager",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "member",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "facility",
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
    columnName: "corporate_number",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "number_of_employees",
    columnWidth: "200px",
    isFrozen: false,
    isOverflow: false,
  },
  // {
  //   columnName: "id",
  //   columnWidth: "200px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
];

export const companyColumnHeaderItemListData: ColumnHeaderItemList[] = companyColumnHeaderItemListArray.map(
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
